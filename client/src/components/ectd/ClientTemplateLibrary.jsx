/**
 * Client Template Library Component for eCTD Module
 * 
 * This component manages client-specific document templates with version control
 * and provides a user-friendly interface for template management.
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Search, FileText, Plus, Clock, Tag, Settings, Trash, Edit, Eye, Check, ArrowUpDown } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';

// Import template components
import CreateTemplateDialog from './CreateTemplateDialog';
import TemplateCard from './TemplateCard';

export default function ClientTemplateLibrary() {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const { toast } = useToast();
  const { currentClientWorkspace } = useTenant();
  
  // Fetch client-specific templates
  useEffect(() => {
    if (!currentClientWorkspace?.id) return;
    
    async function fetchTemplates() {
      try {
        // Simulating API call with mock data
        // In production, this would be a real API call to your backend
        setTimeout(() => {
          setTemplates(getMockTemplates());
        }, 500);

        // Actual API call would look like this:
        // const response = await fetch(`/api/clients/${currentClientWorkspace.id}/templates`);
        // const data = await response.json();
        // setTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast({
          title: "Failed to load templates",
          description: "Please refresh the page or contact support.",
          variant: "destructive"
        });
      }
    }
    
    fetchTemplates();
  }, [currentClientWorkspace?.id, toast]);
  
  // Filter and sort templates based on category, search term, and sort options
  useEffect(() => {
    let filtered = [...templates];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(template => template.category === categoryFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'lastModified':
          comparison = new Date(b.lastModified) - new Date(a.lastModified);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'usage':
          comparison = b.useCount - a.useCount;
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredTemplates(filtered);
  }, [templates, categoryFilter, searchTerm, sortBy, sortOrder]);

  const handleUseTemplate = (template) => {
    toast({
      title: "Template Selected",
      description: `${template.name} has been added to your document.`
    });
  };

  const handleEditTemplate = (template) => {
    // In a real implementation, this would navigate to the template editor
    console.log('Edit template:', template);
  };

  const handleDeleteTemplate = (template) => {
    setTemplates(templates.filter(t => t.id !== template.id));
    toast({
      title: "Template Deleted",
      description: `${template.name} has been removed from your library.`
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Mock data for demonstration
  const getMockTemplates = () => {
    return [
      { 
        id: 't1', 
        name: 'Module 1 Cover Letter', 
        category: 'm1',
        description: 'Standard cover letter template for FDA submissions', 
        lastModified: '2025-05-01T10:30:00Z',
        useCount: 15,
        tags: ['FDA', 'Cover Letter', 'Module 1'],
        versions: 3
      },
      { 
        id: 't2', 
        name: 'Quality Overall Summary', 
        category: 'm2',
        description: 'Template for Module 2.3 QOS with standard sections', 
        lastModified: '2025-05-05T14:22:00Z',
        useCount: 8,
        tags: ['QOS', 'Module 2', 'Quality'],
        versions: 2
      },
      { 
        id: 't3', 
        name: 'Drug Substance Specifications', 
        category: 'm3',
        description: 'Template for drug substance specifications section', 
        lastModified: '2025-04-28T09:15:00Z',
        useCount: 12,
        tags: ['Drug Substance', 'Specifications', 'Module 3'],
        versions: 4
      },
      { 
        id: 't4', 
        name: 'Toxicology Summary', 
        category: 'm4',
        description: 'Standard format for toxicology study summaries', 
        lastModified: '2025-05-02T11:45:00Z',
        useCount: 5,
        tags: ['Toxicology', 'Module 4', 'Nonclinical'],
        versions: 1
      },
      { 
        id: 't5', 
        name: 'Clinical Study Report', 
        category: 'm5',
        description: 'Template following ICH E3 guidelines for CSRs', 
        lastModified: '2025-04-25T13:10:00Z',
        useCount: 20,
        tags: ['CSR', 'Module 5', 'Clinical', 'ICH E3'],
        versions: 5
      },
      { 
        id: 't6', 
        name: 'Administrative Information', 
        category: 'm1',
        description: 'Template for administrative information and prescribing information', 
        lastModified: '2025-05-07T15:30:00Z',
        useCount: 7,
        tags: ['Administrative', 'Module 1', 'Prescribing Information'],
        versions: 2
      },
      { 
        id: 't7', 
        name: 'Clinical Overview', 
        category: 'm2',
        description: 'Module 2.5 clinical overview template with benefit-risk assessment', 
        lastModified: '2025-05-03T10:15:00Z',
        useCount: 9,
        tags: ['Clinical Overview', 'Module 2', 'Benefit-Risk'],
        versions: 3
      },
      { 
        id: 't8', 
        name: 'Stability Data Summary', 
        category: 'm3',
        description: 'Template for presenting stability data in Module 3', 
        lastModified: '2025-04-29T16:20:00Z',
        useCount: 11,
        tags: ['Stability', 'Module 3', 'Quality'],
        versions: 2
      }
    ];
  };

  // JSX for template library interface
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold text-indigo-800">Document Templates</CardTitle>
            <CardDescription>
              Manage and create document templates for your regulatory submissions
            </CardDescription>
          </div>
          <CreateTemplateDialog 
            onTemplateCreated={(newTemplate) => setTemplates([...templates, newTemplate])} 
          />
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search templates..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="m1">Module 1</SelectItem>
                <SelectItem value="m2">Module 2</SelectItem>
                <SelectItem value="m3">Module 3</SelectItem>
                <SelectItem value="m4">Module 4</SelectItem>
                <SelectItem value="m5">Module 5</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="lastModified">Last Modified</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="usage">Usage Count</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSortOrder} 
                className="ml-1"
              >
                <ArrowUpDown size={18} className="text-gray-500" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <div key={template.id} className="border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 border-b">
                    <div className="flex justify-between">
                      <h3 className="font-medium truncate">{template.name}</h3>
                      <Badge variant={getCategoryVariant(template.category)}>{template.category.toUpperCase()}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                  </div>
                  
                  <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 flex justify-between">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      <span>{formatDate(template.lastModified)}</span>
                    </div>
                    <div className="flex items-center">
                      <Tag size={14} className="mr-1" />
                      <span>{template.tags.length} tags</span>
                    </div>
                    <div>
                      <span>{template.versions} versions</span>
                    </div>
                  </div>
                  
                  <div className="flex border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 rounded-none h-10"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Check size={16} className="mr-1" /> Use
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 rounded-none h-10"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit size={16} className="mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 rounded-none h-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteTemplate(template)}
                    >
                      <Trash size={16} className="mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-10 border rounded-lg">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-600">No templates found</h3>
                <p className="text-gray-500 mt-1">
                  {searchTerm || categoryFilter !== 'all' 
                    ? "Try adjusting your search or filters"
                    : "Create your first template to get started"}
                </p>
                <Button 
                  className="mt-4"
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="list" className="w-full">
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 grid grid-cols-12 gap-4">
                <div className="col-span-5">Template Name</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Last Modified</div>
                <div className="col-span-1">Versions</div>
                <div className="col-span-2">Actions</div>
              </div>
              
              <div className="divide-y">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-gray-50">
                    <div className="col-span-5">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{template.description}</div>
                    </div>
                    <div className="col-span-2">
                      <Badge variant={getCategoryVariant(template.category)}>{template.category.toUpperCase()}</Badge>
                    </div>
                    <div className="col-span-2 text-sm text-gray-600">
                      {formatDate(template.lastModified)}
                    </div>
                    <div className="col-span-1 text-sm text-gray-600">
                      {template.versions}
                    </div>
                    <div className="col-span-2 flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <Check size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteTemplate(template)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredTemplates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No templates match your search criteria
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(date);
}

// Helper function to get appropriate badge color variant based on CTD module
function getCategoryVariant(category) {
  switch(category) {
    case 'm1': return 'blue';
    case 'm2': return 'green';
    case 'm3': return 'orange';
    case 'm4': return 'purple';
    case 'm5': return 'red';
    default: return 'default';
  }
}