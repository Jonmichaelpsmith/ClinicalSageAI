import React, { useState, useEffect } from 'react';
import { findPredicateDevices } from '../../api/cer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X, Check, Search, FileText, Download, Copy, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

/**
 * Predicate Device Comparison Component
 * 
 * This component allows users to search for predicate devices, select them for comparison,
 * and generate a structured comparison table suitable for 510(k) submissions or CER documents.
 */
const PredicateDeviceComparison = ({ deviceProfile, onComparisonGenerated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [predicateResults, setPredicateResults] = useState([]);
  const [selectedPredicates, setSelectedPredicates] = useState([]);
  const [comparisonTable, setComparisonTable] = useState(null);
  const [isGeneratingComparison, setIsGeneratingComparison] = useState(false);
  const [sortField, setSortField] = useState('relevance');
  const [sortDirection, setSortDirection] = useState('desc');
  const { toast } = useToast();

  // Filter predicate results based on selected sort options
  const filteredAndSortedPredicates = React.useMemo(() => {
    if (!predicateResults.length) return [];
    
    // Make a copy to avoid mutating the original
    let sorted = [...predicateResults];
    
    // Apply sorting
    switch (sortField) {
      case 'relevance':
        // Already sorted by relevance by default
        break;
      case 'year':
        sorted.sort((a, b) => {
          const yearA = a.year ? parseInt(a.year) : 0;
          const yearB = b.year ? parseInt(b.year) : 0;
          return sortDirection === 'asc' ? yearA - yearB : yearB - yearA;
        });
        break;
      case 'deviceName':
        sorted.sort((a, b) => {
          const nameA = a.deviceName || '';
          const nameB = b.deviceName || '';
          return sortDirection === 'asc' 
            ? nameA.localeCompare(nameB) 
            : nameB.localeCompare(nameA);
        });
        break;
      case 'manufacturer':
        sorted.sort((a, b) => {
          const mfrA = a.manufacturer || '';
          const mfrB = b.manufacturer || '';
          return sortDirection === 'asc' 
            ? mfrA.localeCompare(mfrB) 
            : mfrB.localeCompare(mfrA);
        });
        break;
    }
    
    return sorted;
  }, [predicateResults, sortField, sortDirection]);

  // Generate search description from device profile
  const generateSearchDescription = () => {
    if (!deviceProfile) return '';
    
    const parts = [];
    if (deviceProfile.deviceName) parts.push(deviceProfile.deviceName);
    if (deviceProfile.deviceClass) parts.push(`Class ${deviceProfile.deviceClass}`);
    if (deviceProfile.intendedUse) parts.push(deviceProfile.intendedUse);
    
    return parts.join(' ');
  };

  // Auto-fill search box with device profile details if available
  useEffect(() => {
    const description = generateSearchDescription();
    if (description && !searchQuery) {
      setSearchQuery(description);
    }
  }, [deviceProfile]);

  // Handle search for predicate devices
  const handlePredicateSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        variant: "destructive",
        title: "Search query required",
        description: "Please enter a description of your device to find predicates."
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Use the unified discovery service to find predicates
      const predicates = await findPredicateDevices(searchQuery, { 
        limit: 10, 
        module: '510k' 
      });
      
      setPredicateResults(predicates || []);
      
      if (!predicates || predicates.length === 0) {
        toast({
          variant: "default",
          title: "No predicates found",
          description: "Try adjusting your search query for better results."
        });
      }
    } catch (error) {
      console.error('Error searching for predicates:', error);
      toast({
        variant: "destructive",
        title: "Search failed",
        description: error.message || "Failed to find predicate devices. Please try again."
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting a predicate device
  const togglePredicateSelection = (predicate) => {
    setSelectedPredicates(prevSelected => {
      // Check if this predicate is already selected
      const isSelected = prevSelected.some(p => p.id === predicate.id);
      
      if (isSelected) {
        // Remove it if already selected
        return prevSelected.filter(p => p.id !== predicate.id);
      } else {
        // Add it if not selected, but limit to 5 predicates
        if (prevSelected.length >= 5) {
          toast({
            variant: "warning",
            title: "Selection limit reached",
            description: "You can select a maximum of 5 predicate devices."
          });
          return prevSelected;
        }
        return [...prevSelected, predicate];
      }
    });
  };

  // Generate a formatted comparison table
  const generateComparisonTable = async () => {
    if (!selectedPredicates.length) {
      toast({
        variant: "warning",
        title: "No predicates selected",
        description: "Please select at least one predicate device to generate a comparison."
      });
      return;
    }
    
    if (!deviceProfile) {
      toast({
        variant: "warning",
        title: "Subject device missing",
        description: "Please make sure your device profile is complete."
      });
      return;
    }
    
    setIsGeneratingComparison(true);
    
    try {
      // In a real implementation, we might call an API endpoint to generate this comparison
      // For now, we'll create a structured HTML table with the available data
      
      // Collect all potential comparison fields from all devices
      const allFields = new Set();
      
      // Add all keys from the subject device
      Object.keys(deviceProfile).forEach(key => {
        if (typeof deviceProfile[key] === 'string' || typeof deviceProfile[key] === 'number') {
          allFields.add(key);
        }
      });
      
      // Add all keys from the predicate devices
      selectedPredicates.forEach(predicate => {
        Object.keys(predicate).forEach(key => {
          if (typeof predicate[key] === 'string' || typeof predicate[key] === 'number') {
            allFields.add(key);
          }
        });
      });
      
      // Remove technical fields
      ['id', 'createdAt', 'updatedAt', 'embedding', 'vectors', 'similarity'].forEach(field => {
        allFields.delete(field);
      });
      
      // Prioritize important fields
      const priorityFields = [
        'deviceName', 'manufacturer', 'deviceClass', 'intendedUse', 'indications', 
        'materialComposition', 'operatingPrinciples', 'technicalSpecifications'
      ];
      
      // Sort fields by priority
      const sortedFields = [...allFields].sort((a, b) => {
        const aPriority = priorityFields.indexOf(a);
        const bPriority = priorityFields.indexOf(b);
        
        // If both are priority fields, sort by priority index
        if (aPriority >= 0 && bPriority >= 0) {
          return aPriority - bPriority;
        }
        // If only a is a priority field, it comes first
        if (aPriority >= 0) return -1;
        // If only b is a priority field, it comes first
        if (bPriority >= 0) return 1;
        // Otherwise sort alphabetically
        return a.localeCompare(b);
      });
      
      // Generate the comparison table HTML
      const tableHtml = `
        <div class="predicate-comparison-table">
          <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="width: 20%;">Characteristic</th>
                <th style="width: 40%;">Subject Device: ${deviceProfile.deviceName || 'Your Device'}</th>
                ${selectedPredicates.map((p, i) => 
                  `<th style="width: ${40 / selectedPredicates.length}%;">Predicate ${i+1}: ${p.deviceName || 'Unknown'}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${sortedFields.map(field => {
                const fieldLabel = field
                  .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                  .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
                
                return `
                  <tr>
                    <td style="font-weight: bold;">${fieldLabel}</td>
                    <td>${deviceProfile[field] || '-'}</td>
                    ${selectedPredicates.map(p => 
                      `<td>${p[field] || '-'}</td>`
                    ).join('')}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
      
      setComparisonTable(tableHtml);
      
      // Call the callback with the generated comparison
      if (onComparisonGenerated) {
        onComparisonGenerated({
          html: tableHtml,
          subjectDevice: deviceProfile,
          predicateDevices: selectedPredicates
        });
      }
      
      toast({
        variant: "success",
        title: "Comparison generated",
        description: "Device comparison table has been generated successfully."
      });
    } catch (error) {
      console.error('Error generating comparison:', error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error.message || "Failed to generate comparison table. Please try again."
      });
    } finally {
      setIsGeneratingComparison(false);
    }
  };

  // Copy comparison table to clipboard
  const copyComparisonToClipboard = () => {
    if (!comparisonTable) return;
    
    // Copy the HTML to clipboard
    navigator.clipboard.writeText(comparisonTable)
      .then(() => {
        toast({
          variant: "success",
          title: "Copied to clipboard",
          description: "The comparison table has been copied to your clipboard."
        });
      })
      .catch(err => {
        console.error('Error copying to clipboard:', err);
        toast({
          variant: "destructive",
          title: "Copy failed",
          description: "Failed to copy to clipboard. Please try again."
        });
      });
  };

  // Clear all selections and results
  const clearResults = () => {
    setSelectedPredicates([]);
    setPredicateResults([]);
    setComparisonTable(null);
  };

  return (
    <div className="predicate-device-comparison space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Predicate Device Search</CardTitle>
          <CardDescription>
            Find and compare predicate devices for your 510(k) submission or CER
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="search-container flex space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Enter device description to find predicates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button 
              onClick={handlePredicateSearch} 
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
          
          {predicateResults.length > 0 && (
            <div className="sorting-controls flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Select
                  value={sortField}
                  onValueChange={setSortField}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                    <SelectItem value="deviceName">Device Name</SelectItem>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Order:</span>
                <Select
                  value={sortDirection}
                  onValueChange={setSortDirection}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" size="sm" onClick={clearResults}>
                <X className="mr-2 h-4 w-4" />
                Clear Results
              </Button>
            </div>
          )}
          
          {filteredAndSortedPredicates.length > 0 && (
            <div className="results-container">
              <Table>
                <TableCaption>Found {filteredAndSortedPredicates.length} potential predicate devices.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Device Name</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>K Number</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead className="w-[100px]">Class</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedPredicates.map(predicate => (
                    <TableRow 
                      key={predicate.id}
                      className={selectedPredicates.some(p => p.id === predicate.id) ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <Button
                          variant={selectedPredicates.some(p => p.id === predicate.id) ? "default" : "outline"}
                          size="icon"
                          onClick={() => togglePredicateSelection(predicate)}
                        >
                          {selectedPredicates.some(p => p.id === predicate.id) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>{predicate.deviceName || "Unknown Device"}</TableCell>
                      <TableCell>{predicate.manufacturer || "Unknown"}</TableCell>
                      <TableCell>
                        {predicate.kNumber ? (
                          <Badge variant="outline">{predicate.kNumber}</Badge>
                        ) : "N/A"}
                      </TableCell>
                      <TableCell>{predicate.year || "N/A"}</TableCell>
                      <TableCell>
                        {predicate.deviceClass ? (
                          <Badge>{predicate.deviceClass}</Badge>
                        ) : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedPredicates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Predicates ({selectedPredicates.length})</CardTitle>
            <CardDescription>
              Generate a comparison table for your submission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="selected-predicates-list mb-4">
              {selectedPredicates.map(predicate => (
                <div 
                  key={predicate.id}
                  className="flex items-center justify-between p-2 border rounded-md mb-2"
                >
                  <div>
                    <div className="font-medium">{predicate.deviceName || "Unknown Device"}</div>
                    <div className="text-sm text-gray-500">
                      {predicate.manufacturer || "Unknown"} {predicate.kNumber ? `• ${predicate.kNumber}` : ""}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePredicateSelection(predicate)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={generateComparisonTable}
                disabled={isGeneratingComparison || selectedPredicates.length === 0}
              >
                {isGeneratingComparison ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Comparison
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {comparisonTable && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Device Comparison Table</CardTitle>
            <CardDescription>
              Comparison of subject device with selected predicates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="comparison-preview border rounded-md p-4 mb-4 max-h-[400px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: comparisonTable }}
            />
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={copyComparisonToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              Copy HTML
            </Button>
            <Button
              onClick={() => {
                const blob = new Blob([comparisonTable], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'predicate-comparison.html';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download HTML
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default PredicateDeviceComparison;