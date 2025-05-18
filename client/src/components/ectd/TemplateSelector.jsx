/**
 * Template Selector Component for eCTD Module
 * 
 * This component provides an interface for selecting templates when 
 * creating new documents in the eCTD module.
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Check, Search, FileText, Clock, Eye, Filter, ArrowUpDown } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';

export default function TemplateSelector({ onTemplateSelect, documentType }) {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(documentType || 'all');
  const [sortBy, setSortBy] = useState('lastModified');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const { currentClientWorkspace } = useTenant();
  
  // Fetch templates
  useEffect(() => {
    if (!currentClientWorkspace?.id) return;
    
    // In a real implementation, fetch from API based on the client ID
    // For demo purposes, use mock data
    setTimeout(() => {
      setTemplates(getMockTemplates());
    }, 300);
  }, [currentClientWorkspace?.id]);
  
  // Apply filters and sorting
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
        case 'usage':
          comparison = b.useCount - a.useCount;
          break;
        default:
          comparison = new Date(b.lastModified) - new Date(a.lastModified);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredTemplates(filtered);
  }, [templates, categoryFilter, searchTerm, sortBy, sortOrder]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
    
    toast({
      title: "Template Selected",
      description: `${template.name} has been selected.`,
    });
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
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
        content: `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Cover Letter Template</h1>
          <p style="margin-bottom: 10px;">[Company Letterhead]</p>
          <p style="margin-bottom: 10px;">[Date]</p>
          <p style="margin-bottom: 10px;">Food and Drug Administration<br>
          Center for Drug Evaluation and Research<br>
          Central Document Room<br>
          5901-B Ammendale Road<br>
          Beltsville, MD 20705-1266</p>
          <p style="margin-bottom: 10px;"><strong>Subject:</strong> [Application Type] [Application Number]<br>
          [Product Name] ([Generic Name])<br>
          [Submission Type]</p>
        `
      },
      { 
        id: 't2', 
        name: 'Quality Overall Summary', 
        category: 'm2',
        description: 'Template for Module 2.3 QOS with standard sections', 
        lastModified: '2025-05-05T14:22:00Z',
        useCount: 8,
        tags: ['QOS', 'Module 2', 'Quality'],
        content: `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Quality Overall Summary</h1>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">2.3.S Drug Substance</h2>
          <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">2.3.S.1 General Information</h3>
          <p style="margin-bottom: 10px;">[Provide the nomenclature, molecular structure, and general properties of the drug substance]</p>
        `
      },
      { 
        id: 't3', 
        name: 'Drug Substance Specifications', 
        category: 'm3',
        description: 'Template for drug substance specifications section', 
        lastModified: '2025-04-28T09:15:00Z',
        useCount: 12,
        tags: ['Drug Substance', 'Specifications', 'Module 3'],
        content: `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Drug Substance Specifications</h1>
          <p style="margin-bottom: 10px;"><strong>3.2.S.4.1 Specification</strong></p>
          <p style="margin-bottom: 10px;">The drug substance specification is provided in Table 1.</p>
          <p style="margin-bottom: 10px;"><strong>Table 1: Drug Substance Specification</strong></p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Test</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Method</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Acceptance Criteria</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Description</td>
                <td style="border: 1px solid #ddd; padding: 8px;">Visual</td>
                <td style="border: 1px solid #ddd; padding: 8px;">[Description]</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Identification</td>
                <td style="border: 1px solid #ddd; padding: 8px;">IR</td>
                <td style="border: 1px solid #ddd; padding: 8px;">Conforms to reference spectrum</td>
              </tr>
            </tbody>
          </table>
        `
      },
      { 
        id: 't4', 
        name: 'Toxicology Summary', 
        category: 'm4',
        description: 'Standard format for toxicology study summaries', 
        lastModified: '2025-05-02T11:45:00Z',
        useCount: 5,
        tags: ['Toxicology', 'Module 4', 'Nonclinical'],
        content: `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Toxicology Summary</h1>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">4.2.3.2 Repeat-Dose Toxicity</h2>
          <p style="margin-bottom: 10px;"><strong>Study Title:</strong> [Title of Study]</p>
          <p style="margin-bottom: 10px;"><strong>Study No.:</strong> [Study Number]</p>
          <p style="margin-bottom: 10px;"><strong>Testing Facility:</strong> [Name of Testing Facility]</p>
          <p style="margin-bottom: 10px;"><strong>GLP Compliance:</strong> This study was conducted in compliance with Good Laboratory Practice Regulations.</p>
        `
      },
      { 
        id: 't5', 
        name: 'Clinical Study Report', 
        category: 'm5',
        description: 'Template following ICH E3 guidelines for CSRs', 
        lastModified: '2025-04-25T13:10:00Z',
        useCount: 20,
        tags: ['CSR', 'Module 5', 'Clinical', 'ICH E3'],
        content: `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Clinical Study Report Synopsis</h1>
          <p style="margin-bottom: 10px;"><strong>Protocol Number:</strong> [Protocol Number]</p>
          <p style="margin-bottom: 10px;"><strong>Study Title:</strong> [Study Title]</p>
          <p style="margin-bottom: 10px;"><strong>Phase:</strong> [Phase]</p>
          <p style="margin-bottom: 10px;"><strong>Study Design:</strong> [Study Design]</p>
          <p style="margin-bottom: 10px;"><strong>Study Centers:</strong> [Number and Location of Study Centers]</p>
        `
      },
      { 
        id: 't6', 
        name: 'Administrative Information', 
        category: 'm1',
        description: 'Template for administrative information and prescribing information', 
        lastModified: '2025-05-07T15:30:00Z',
        useCount: 7,
        tags: ['Administrative', 'Module 1', 'Prescribing Information'],
        content: `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Administrative Information</h1>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Regional Administrative Information</h2>
          <p style="margin-bottom: 10px;"><strong>Applicant/Sponsor Information:</strong></p>
          <p style="margin-bottom: 10px;">
            [Company Name]<br>
            [Address Line 1]<br>
            [Address Line 2]<br>
            [City, State, Zip Code]<br>
            [Country]
          </p>
        `
      },
      { 
        id: 't7', 
        name: 'Clinical Overview', 
        category: 'm2',
        description: 'Module 2.5 clinical overview template with benefit-risk assessment', 
        lastModified: '2025-05-03T10:15:00Z',
        useCount: 9,
        tags: ['Clinical Overview', 'Module 2', 'Benefit-Risk'],
        content: `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Clinical Overview</h1>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">2.5.1 Product Development Rationale</h2>
          <p style="margin-bottom: 10px;">[Provide a description of the product and its proposed indication(s)]</p>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">2.5.2 Overview of Biopharmaceutics</h2>
          <p style="margin-bottom: 10px;">[Summarize the biopharmaceutical studies that provide information about the pharmacokinetics (PK) of the drug]</p>
        `
      },
      { 
        id: 't8', 
        name: 'Stability Data Summary', 
        category: 'm3',
        description: 'Template for presenting stability data in Module 3', 
        lastModified: '2025-04-29T16:20:00Z',
        useCount: 11,
        tags: ['Stability', 'Module 3', 'Quality'],
        content: `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Stability Data Summary</h1>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">3.2.P.8.1 Stability Summary and Conclusion</h2>
          <p style="margin-bottom: 10px;">[Provide a summary of the stability studies conducted and the conclusions regarding storage conditions and shelf life]</p>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">3.2.P.8.2 Post-approval Stability Protocol and Stability Commitment</h2>
          <p style="margin-bottom: 10px;">[Describe the post-approval stability protocol and stability commitment]</p>
        `
      }
    ];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select a Template</CardTitle>
        <CardDescription>
          Choose a template to start creating your {getCategoryName(documentType)} document
        </CardDescription>
        
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
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="m1">Module 1</SelectItem>
                <SelectItem value="m2">Module 2</SelectItem>
                <SelectItem value="m3">Module 3</SelectItem>
                <SelectItem value="m4">Module 4</SelectItem>
                <SelectItem value="m5">Module 5</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="lastModified">Last Modified</SelectItem>
                <SelectItem value="usage">Usage Count</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleSortOrder} 
              className="h-10 w-10"
            >
              <ArrowUpDown size={18} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="grid">
          <TabsList className="mb-4">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid">
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
                      <FileText size={14} className="mr-1" />
                      <span>{template.useCount} uses</span>
                    </div>
                  </div>
                  
                  <div className="flex border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 rounded-none h-10"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye size={16} className="mr-1" /> Preview
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 rounded-none h-10"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <Check size={16} className="mr-1" /> Select
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
                    : "No templates available for this category"}
                </p>
                {(searchTerm || categoryFilter !== 'all') && (
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
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="list">
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 grid grid-cols-12 gap-4">
                <div className="col-span-5">Template Name</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Last Modified</div>
                <div className="col-span-1">Usage</div>
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
                      {template.useCount}
                    </div>
                    <div className="col-span-2 flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8"
                        onClick={() => handlePreview(template)}
                      >
                        <Eye size={14} className="mr-1" /> Preview
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-8"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <Check size={14} className="mr-1" /> Select
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
      
      {/* Template Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{selectedTemplate?.name}</span>
              {selectedTemplate && (
                <Badge variant={getCategoryVariant(selectedTemplate.category)}>
                  {selectedTemplate.category.toUpperCase()}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="border rounded-md p-4 bg-white">
            <ScrollArea className="h-[400px]">
              {selectedTemplate && (
                <div dangerouslySetInnerHTML={{ __html: selectedTemplate.content }} />
              )}
            </ScrollArea>
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div className="text-sm text-gray-500 flex items-center">
              <Clock size={16} className="mr-1" />
              <span>Last updated: {selectedTemplate ? formatDate(selectedTemplate.lastModified) : ''}</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(false)}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  handleTemplateSelect(selectedTemplate);
                  setShowPreview(false);
                }}
              >
                <Check size={16} className="mr-1" />
                Use Template
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

// Helper function to get category name
function getCategoryName(category) {
  switch(category) {
    case 'm1': return 'Module 1 (Administrative)';
    case 'm2': return 'Module 2 (Summaries)';
    case 'm3': return 'Module 3 (Quality)';
    case 'm4': return 'Module 4 (Nonclinical)';
    case 'm5': return 'Module 5 (Clinical)';
    default: return 'document';
  }
}