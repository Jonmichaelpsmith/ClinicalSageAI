import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Loader2, Search, Filter, Download, Upload, MoreHorizontal, FileText, FileSpreadsheet, FilePlus, FileCheck, ArrowUpDown, Check } from 'lucide-react';
import TemplateUploadDialog from '@/components/templates/TemplateUploadDialog';
import { allTemplates } from '@/data/enhanced-ctd-templates';

/**
 * Enhanced Document Templates Page
 * 
 * This page displays a comprehensive library of document templates with filtering,
 * searching, and template management capabilities. It connects to the backend
 * template service for CRUD operations.
 */
const EnhancedDocumentTemplates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const templatesPerPage = 12;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch templates with filters
  const {
    data: templates = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['/api/templates', moduleFilter, statusFilter, searchQuery],
    queryFn: async () => {
      // In development, when we don't have a backend yet, use the sample data
      try {
        const params = new URLSearchParams();
        if (moduleFilter) params.append('module', moduleFilter);
        if (statusFilter) params.append('status', statusFilter);
        if (searchQuery) params.append('search', searchQuery);
        
        const response = await apiRequest('GET', `/api/templates?${params.toString()}`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.warn('Using fallback template data - template API not available yet');
        // Filter the allTemplates based on the current filters
        return allTemplates.filter(template => {
          if (moduleFilter && template.module !== moduleFilter) return false;
          if (statusFilter && template.status !== statusFilter) return false;
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
              template.title.toLowerCase().includes(query) ||
              template.description.toLowerCase().includes(query) ||
              template.sectionId.toLowerCase().includes(query)
            );
          }
          return true;
        });
      }
    },
  });
  
  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id) => {
      return apiRequest('DELETE', `/api/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: 'Template Deleted',
        description: 'The template has been removed from the library',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Deleting Template',
        description: error.message || 'Failed to delete the template',
        variant: 'destructive',
      });
    },
  });
  
  // Import templates mutation
  const importTemplatesMutation = useMutation({
    mutationFn: async (templates) => {
      return apiRequest('POST', '/api/templates/import', { templates });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: 'Templates Imported',
        description: `Successfully imported ${data.inserted} templates`,
        variant: 'success',
      });
      setImportDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error Importing Templates',
        description: error.message || 'Failed to import templates',
        variant: 'destructive',
      });
    },
  });
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };
  
  // Handle module filter change
  const handleModuleFilterChange = (value) => {
    setModuleFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  // Handle template download
  const handleDownloadTemplate = async (templateId, templateTitle) => {
    try {
      // Fetch template file
      const response = await apiRequest('GET', `/api/templates/${templateId}/file`, null, {
        responseType: 'blob',
      });
      
      // Create a blob link to download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${templateTitle.replace(/\s+/g, '_')}.docx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast({
        title: 'Template Downloaded',
        description: 'The template file has been downloaded',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download the template file',
        variant: 'destructive',
      });
    }
  };
  
  // Handle template deletion
  const handleDeleteTemplate = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(id);
    }
  };
  
  // Handle bulk import of templates
  const handleImportAllTemplates = () => {
    importTemplatesMutation.mutate(allTemplates);
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(templates.length / templatesPerPage);
  const paginatedTemplates = templates.slice(
    (currentPage - 1) * templatesPerPage,
    currentPage * templatesPerPage
  );
  
  // Generate pagination items
  const paginationItems = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      paginationItems.push(i);
    }
  } else {
    paginationItems.push(1);
    if (currentPage > 3) paginationItems.push('...');
    
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
      paginationItems.push(i);
    }
    
    if (currentPage < totalPages - 2) paginationItems.push('...');
    paginationItems.push(totalPages);
  }
  
  // Get module display name
  const getModuleDisplayName = (moduleId) => {
    const moduleMap = {
      'module1': 'Module 1 - Administrative',
      'module2': 'Module 2 - Summaries',
      'module3': 'Module 3 - Quality',
      'module4': 'Module 4 - Nonclinical',
      'module5': 'Module 5 - Clinical',
    };
    return moduleMap[moduleId] || moduleId;
  };
  
  // Get status display element with color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Templates</h1>
          <p className="text-muted-foreground">
            Browse and manage document templates for regulatory submissions
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Template
          </Button>
          <Button variant="outline" onClick={handleImportAllTemplates}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Import All Templates
          </Button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4">
          <Select value={moduleFilter} onValueChange={handleModuleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <span>{moduleFilter ? getModuleDisplayName(moduleFilter) : 'All Modules'}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Modules</SelectItem>
              <SelectItem value="module1">Module 1 - Administrative</SelectItem>
              <SelectItem value="module2">Module 2 - Summaries</SelectItem>
              <SelectItem value="module3">Module 3 - Quality</SelectItem>
              <SelectItem value="module4">Module 4 - Nonclinical</SelectItem>
              <SelectItem value="module5">Module 5 - Clinical</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <span>{statusFilter || 'All Statuses'}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading templates...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">
          <p>Error loading templates: {error.message}</p>
          <Button variant="outline" onClick={refetch} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-muted/40 rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No templates found</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery || moduleFilter || statusFilter
              ? 'Try adjusting your search or filters'
              : 'Get started by uploading a new template'}
          </p>
          <Button className="mt-4" onClick={() => setUploadDialogOpen(true)}>
            <FilePlus className="mr-2 h-4 w-4" />
            Add First Template
          </Button>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{template.title}</CardTitle>
                      <div className="flex items-center mt-1 gap-2 text-sm text-muted-foreground">
                        <span>{template.sectionId}</span>
                        <span>•</span>
                        <span>{getModuleDisplayName(template.module)}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleDownloadTemplate(template.id, template.title)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteTemplate(template.id)}>
                          <Upload className="mr-2 h-4 w-4" />
                          Replace File
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteTemplate(template.id)}>
                          <ArrowUpDown className="mr-2 h-4 w-4" />
                          Change Status
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-2">
                    {getStatusBadge(template.status)}
                    {template.required && (
                      <Badge variant="secondary" className="ml-2">
                        Required
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.description || 'No description provided'}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 pb-4 flex justify-between items-center">
                  <div className="flex items-center text-sm text-muted-foreground">
                    {template.file_reference ? (
                      <div className="flex items-center">
                        <FileCheck className="h-4 w-4 mr-1 text-green-500" />
                        <span>File attached</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>No file</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadTemplate(template.id, template.title)}
                    disabled={!template.file_reference}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {paginationItems.map((item, index) => (
                  <PaginationItem key={`page-${index}`}>
                    {item === '...' ? (
                      <div className="px-4 py-2">...</div>
                    ) : (
                      <PaginationLink
                        isActive={currentPage === item}
                        onClick={() => setCurrentPage(item)}
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
      
      {/* Template Upload Dialog */}
      <TemplateUploadDialog 
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </div>
  );
};

export default EnhancedDocumentTemplates;