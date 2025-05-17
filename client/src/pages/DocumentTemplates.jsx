import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  Plus, 
  Star, 
  Download, 
  PlusCircle,
  Calendar,
  FileTerminal,
  Layers,
  Share2,
  CheckCircle,
  ClipboardList
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import templateService from '../services/templateService';

const DocumentTemplates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTab, setSelectedTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    templateService
      .getTemplates()
      .then(setTemplates)
      .catch((err) => console.error('Failed to load templates', err));
  }, []);
  
  // Recent Documents
  const recentDocuments = [
    {
      id: 101,
      title: 'Protocol PRO-2025-001 Draft',
      template: 'Clinical Protocol Template',
      lastEdited: 'May 10, 2025',
      status: 'Draft',
      creator: 'Dr. Sarah Chen'
    },
    {
      id: 102,
      title: 'BLA Cover Letter - Candidate X',
      template: 'BLA Cover Letter Template',
      lastEdited: 'May 9, 2025',
      status: 'In Review',
      creator: 'James Wilson'
    },
    {
      id: 103,
      title: 'PK Summary Report - Study 3901',
      template: 'Clinical Overview Template',
      lastEdited: 'May 8, 2025',
      status: 'Final',
      creator: 'Clinical Team'
    }
  ];
  
  // Filter templates based on search query and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = 
      selectedCategory === 'all' || 
      template.category === selectedCategory;
      
    return matchesSearch && matchesCategory;
  });
  
  const handleCreateFromTemplate = (templateId) => {
    toast({
      title: "Creating new document",
      description: "Opening editor with the selected template...",
      status: "success",
    });
    
    // In a real implementation, this would redirect to the editor with the template loaded
    setTimeout(() => {
      window.location.href = `/coauthor/editor?template=${templateId}`;
    }, 1000);
  };
  
  const handleUploadTemplate = () => {
    toast({
      title: "Template Uploaded",
      description: "Your new template has been added to the library",
      status: "success",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Document Templates</h1>
          <p className="text-gray-600">
            Regulatory-compliant templates for eCTD submissions
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0 flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" /> Upload Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Template</DialogTitle>
              <DialogDescription>
                Upload a new document template to the library. This will be available to all users.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Template Name</label>
                <Input className="col-span-3" placeholder="Enter template name" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Category</label>
                <Select className="col-span-3">
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinical">Clinical</SelectItem>
                    <SelectItem value="nonclinical">Nonclinical</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Module</label>
                <Input className="col-span-3" placeholder="e.g., Module 2.5" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Description</label>
                <Input className="col-span-3" placeholder="Brief description of the template" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">File</label>
                <Input className="col-span-3" type="file" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleUploadTemplate}>Upload Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="templates">Template Library</TabsTrigger>
          <TabsTrigger value="recent">Recent Documents</TabsTrigger>
          <TabsTrigger value="featured">Featured Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="clinical">Clinical</SelectItem>
                <SelectItem value="nonclinical">Nonclinical</SelectItem>
                <SelectItem value="quality">Quality</SelectItem>
                <SelectItem value="administrative">Administrative</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.length === 0 ? (
              <div className="col-span-full text-center p-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No templates found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                <Button onClick={() => {setSearchQuery(''); setSelectedCategory('all');}}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredTemplates.map(template => (
                <Card key={template.id} className="flex flex-col h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <CardDescription>
                          {template.module} • Version {template.version}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="capitalize">{template.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-gray-600 mb-4">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Updated {template.lastUpdated}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <ClipboardList className="h-4 w-4 mr-1" />
                      <span>Template ID: {template.templateID}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center"
                      onClick={() => {
                        toast({
                          title: "Template Downloaded",
                          description: "Template saved to your downloads",
                          status: "success",
                        });
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                    <Button 
                      size="sm"
                      className="flex items-center"
                      onClick={() => handleCreateFromTemplate(template.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="space-y-4">
            {recentDocuments.map(doc => (
              <Card key={doc.id} className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                        <CardDescription>
                          Based on: {doc.template} • Last edited: {doc.lastEdited}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      className={
                        doc.status === 'Draft' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                        doc.status === 'In Review' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 
                        'bg-green-100 text-green-800 hover:bg-green-200'
                      }
                    >
                      {doc.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardFooter className="pt-2">
                  <div className="flex justify-end w-full space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center"
                      onClick={() => window.location.href = `/coauthor/editor?file=${doc.id}`}
                    >
                      <FileText className="h-4 w-4 mr-1" /> Continue Editing
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="featured">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-3 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Regulatory-Compliant Templates</CardTitle>
                <CardDescription className="text-blue-700">
                  All templates are pre-validated against eCTD submission requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800">Submission-Ready</h4>
                      <p className="text-sm text-blue-700">
                        All templates follow regional regulatory requirements
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Layers className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800">Module-Specific</h4>
                      <p className="text-sm text-blue-700">
                        Templates organized by CTD/eCTD module
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <FileTerminal className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800">Pre-Validated</h4>
                      <p className="text-sm text-blue-700">
                        Formatting and structure meets agency requirements
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-md">Most Popular Template</CardTitle>
                  <Badge className="bg-amber-100 text-amber-800">
                    <Star className="h-3 w-3 mr-1 fill-amber-500" /> Top Rated
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium text-lg mb-1">NDA Cover Letter Template</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Used 215 times • FDA compliant
                </p>
                <Button 
                  className="w-full mt-2"
                  onClick={() => handleCreateFromTemplate(3)}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-md">Recently Updated</CardTitle>
                  <Badge className="bg-green-100 text-green-800">
                    <Calendar className="h-3 w-3 mr-1" /> New
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium text-lg mb-1">Clinical Overview Template</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Updated May 5, 2025 • Version 2.3
                </p>
                <Button 
                  className="w-full mt-2"
                  onClick={() => handleCreateFromTemplate(1)}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-md">Most Comprehensive</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800">
                    <Share2 className="h-3 w-3 mr-1" /> Multi-Region
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium text-lg mb-1">Module 3 Quality Template</h3>
                <p className="text-sm text-gray-600 mb-2">
                  FDA, EMA & Health Canada compliant
                </p>
                <Button 
                  className="w-full mt-2"
                  onClick={() => handleCreateFromTemplate(2)}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentTemplates;