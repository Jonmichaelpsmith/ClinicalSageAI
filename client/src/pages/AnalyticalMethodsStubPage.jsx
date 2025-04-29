import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Filter, Plus, Search, MoreVertical, Download, 
  FileText, CheckCircle2, Clock, AlertCircle 
} from 'lucide-react';

/**
 * Analytical Methods Repository Stub Page
 * 
 * This page displays a list of analytical methods without requiring API connection.
 * It includes:
 * - Method listing with key properties
 * - Search and filter functionality
 * - Status indicators for validation status
 */
const AnalyticalMethodsStubPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Mock data for analytical methods
  const mockMethods = [
    {
      id: 'AM-001',
      name: 'HPLC Assay for API Quantification',
      category: 'Chromatography',
      technique: 'HPLC',
      version: '2.3',
      status: 'validated',
      lastUpdated: '2025-03-15',
      owner: 'Sarah Johnson'
    },
    {
      id: 'AM-002',
      name: 'Dissolution Testing Method',
      category: 'Dissolution',
      technique: 'USP Apparatus II',
      version: '1.5',
      status: 'validated',
      lastUpdated: '2025-02-22',
      owner: 'Michael Chen'
    },
    {
      id: 'AM-003',
      name: 'Particle Size Analysis by Laser Diffraction',
      category: 'Physical Characterization',
      technique: 'Laser Diffraction',
      version: '3.0',
      status: 'in_validation',
      lastUpdated: '2025-04-05',
      owner: 'Robert Smith'
    },
    {
      id: 'AM-004',
      name: 'Impurity Profile by LC-MS',
      category: 'Chromatography',
      technique: 'LC-MS',
      version: '1.2',
      status: 'in_validation',
      lastUpdated: '2025-04-12',
      owner: 'Amanda Wong'
    },
    {
      id: 'AM-005',
      name: 'Karl Fischer Titration for Water Content',
      category: 'Titration',
      technique: 'Karl Fischer',
      version: '2.0',
      status: 'validated',
      lastUpdated: '2025-01-30',
      owner: 'James Wilson'
    },
    {
      id: 'AM-006',
      name: 'DSC for Thermal Analysis',
      category: 'Thermal Analysis',
      technique: 'DSC',
      version: '1.0',
      status: 'draft',
      lastUpdated: '2025-04-18',
      owner: 'Emily Rodriguez'
    },
    {
      id: 'AM-007',
      name: 'NIR Method for Raw Material ID',
      category: 'Spectroscopy',
      technique: 'NIR',
      version: '2.1',
      status: 'validated',
      lastUpdated: '2025-03-02',
      owner: 'David Kim'
    },
    {
      id: 'AM-008',
      name: 'Microbial Limit Test',
      category: 'Microbiology',
      technique: 'Culture',
      version: '3.2',
      status: 'validated',
      lastUpdated: '2025-02-10',
      owner: 'Jessica Martinez'
    }
  ];
  
  // Filter methods based on search and category
  const filteredMethods = mockMethods.filter(method => {
    const matchesSearch = method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         method.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || method.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories for filter
  const categories = ['All', ...new Set(mockMethods.map(method => method.category))];
  
  // Render status badge with appropriate color
  const getStatusBadge = (status) => {
    switch(status) {
      case 'validated':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" /> Validated</Badge>;
      case 'in_validation':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> In Validation</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><FileText className="h-3 w-3 mr-1" /> Draft</Badge>;
      default:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><AlertCircle className="h-3 w-3 mr-1" /> {status}</Badge>;
    }
  };
  
  return (
    <div className="analytical-methods-page p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytical Method Repository</h1>
          <p className="text-muted-foreground">Manage and track all analytical methods in one place</p>
        </div>
        <Button className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          New Method
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <Card className="flex-1 min-w-[200px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMethods.length}</div>
          </CardContent>
        </Card>
        
        <Card className="flex-1 min-w-[200px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Validated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMethods.filter(m => m.status === 'validated').length}</div>
          </CardContent>
        </Card>
        
        <Card className="flex-1 min-w-[200px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMethods.filter(m => m.status === 'in_validation').length}</div>
          </CardContent>
        </Card>
        
        <Card className="flex-1 min-w-[200px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMethods.filter(m => m.status === 'draft').length}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Analytical Methods</CardTitle>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search methods..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  {selectedCategory} Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categories.map(category => (
                  <DropdownMenuItem 
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of all analytical methods</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Method ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Technique</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMethods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell className="font-medium">{method.id}</TableCell>
                  <TableCell>{method.name}</TableCell>
                  <TableCell>{method.category}</TableCell>
                  <TableCell>{method.technique}</TableCell>
                  <TableCell>v{method.version}</TableCell>
                  <TableCell>{getStatusBadge(method.status)}</TableCell>
                  <TableCell>{method.lastUpdated}</TableCell>
                  <TableCell>{method.owner}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Method</DropdownMenuItem>
                        <DropdownMenuItem>Download PDF</DropdownMenuItem>
                        <DropdownMenuItem>Clone Method</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticalMethodsStubPage;