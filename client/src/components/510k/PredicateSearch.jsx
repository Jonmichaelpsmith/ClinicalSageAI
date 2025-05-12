import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Loader2, Search, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import FDA510kService from '../../services/FDA510kService';
import { useTenant } from '@/contexts/TenantContext';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * PredicateSearch Component
 * 
 * This component allows users to search for FDA-registered predicate devices 
 * by name or 510(k) number, view matching results, and select a predicate
 * for their substantial equivalence analysis.
 */
const PredicateSearch = ({ onPredicateSelect, deviceProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPredicate, setSelectedPredicate] = useState(null);
  const searchTimeout = useRef(null);
  
  const { currentOrganization } = useTenant();

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Debounce search to avoid too many API calls
    if (query.length >= 3) {
      searchTimeout.current = setTimeout(() => {
        searchPredicateDevices(query);
      }, 500);
    } else if (query.length === 0) {
      setResults([]);
      setError(null);
    }
  };

  // Search predicate devices via API
  const searchPredicateDevices = async (query) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const searchData = {
        query,
        limit: 10,
        ...deviceProfile && { productCode: deviceProfile.productCode }
      };
      
      const response = await FDA510kService.findPredicateDevices(
        searchData,
        currentOrganization?.id
      );
      
      if (response.success) {
        setResults(response.predicates || []);
        
        if (response.predicates.length === 0) {
          setError('No predicate devices found matching your search. Try a different query.');
        }
      } else {
        setError(response.error || 'Failed to search for predicate devices.');
      }
    } catch (err) {
      console.error('Predicate search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle predicate selection
  const handlePredicateSelect = async (predicate) => {
    setSelectedPredicate(predicate);
    
    try {
      // Get full predicate device details
      const response = await FDA510kService.getPredicateDetails(
        predicate.predicateId,
        currentOrganization?.id
      );
      
      if (response.success && response.predicateDetails) {
        if (onPredicateSelect) {
          onPredicateSelect(response.predicateDetails);
        }
      } else {
        setError('Failed to load complete predicate device details.');
      }
    } catch (err) {
      console.error('Predicate details error:', err);
      setError('An error occurred while loading predicate details.');
    }
  };

  // Format decision date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Database className="h-5 w-5 mr-2 text-primary" />
          Predicate Device Search
        </CardTitle>
        <CardDescription>
          Search for FDA-registered predicate devices by name or 510(k) number
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by device name or 510(k) number..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Button 
              disabled={searchQuery.length < 3 || isLoading}
              onClick={() => searchPredicateDevices(searchQuery)}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>
          
          {error && (
            <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {results.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Search Results</h4>
              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device Name</TableHead>
                      <TableHead>K-Number</TableHead>
                      <TableHead>Decision Date</TableHead>
                      <TableHead>Product Code</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((predicate) => (
                      <TableRow 
                        key={predicate.predicateId}
                        className={selectedPredicate?.predicateId === predicate.predicateId ? 
                          "bg-accent" : ""}
                      >
                        <TableCell className="font-medium">{predicate.deviceName}</TableCell>
                        <TableCell>{predicate.kNumber}</TableCell>
                        <TableCell>{formatDate(predicate.decisionDate)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{predicate.productCode}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            onClick={() => handlePredicateSelect(predicate)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PredicateSearch;