import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertTitle,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Separator,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui';
import { 
  AlertCircle,
  ArrowLeft,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  FilePlus,
  Lock,
  Save,
  Sparkles,
  Unlock,
  Upload,
  X,
  Clock,
  Check,
  Loader2,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useParams, Link } from 'wouter';

// Placeholder for markdown editor - in a real implementation, use a proper markdown editor
const SimpleEditor = ({ content, onChange }) => (
  <Textarea 
    className="min-h-[400px] font-mono text-sm"
    value={content || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Enter content here..."
  />
);

export function BlueprintEditor() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('structure');
  const [selectedSectionPath, setSelectedSectionPath] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [isContentModified, setIsContentModified] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [generationContext, setGenerationContext] = useState({});
  const [exportFormat, setExportFormat] = useState('pdf');
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch blueprint data
  const blueprintQuery = useQuery({
    queryKey: [`/api/cmc/blueprints/${id}`]
  });

  // Lock blueprint mutation
  const lockMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/cmc/blueprints/${id}/lock`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Blueprint Locked',
        description: 'You now have exclusive editing rights',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/cmc/blueprints/${id}`] });
    },
    onError: (error) => {
      toast({
        title: 'Lock Failed',
        description: error.message || 'Failed to lock blueprint',
        variant: 'destructive',
      });
    }
  });

  // Unlock blueprint mutation
  const unlockMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/cmc/blueprints/${id}/unlock`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Blueprint Unlocked',
        description: 'Others can now edit this blueprint',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/cmc/blueprints/${id}`] });
    },
    onError: (error) => {
      toast({
        title: 'Unlock Failed',
        description: error.message || 'Failed to unlock blueprint',
        variant: 'destructive',
      });
    }
  });

  // Update blueprint content mutation
  const updateContentMutation = useMutation({
    mutationFn: async ({ path, content }) => {
      // Get current content
      const currentContent = blueprintQuery.data?.content || {};
      // Update the section content
      const updatedContent = {
        ...currentContent,
        [path]: content
      };
      
      const response = await apiRequest('PUT', `/api/cmc/blueprints/${id}`, {
        content: updatedContent
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Content Saved',
        description: 'Section content has been saved successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/cmc/blueprints/${id}`] });
      setIsContentModified(false);
    },
    onError: (error) => {
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save content',
        variant: 'destructive',
      });
    }
  });

  // Generate section content mutation
  const generateSectionMutation = useMutation({
    mutationFn: async (sectionPath) => {
      const response = await apiRequest('POST', `/api/cmc/blueprints/${id}/generate/${sectionPath}`, generationContext);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Content Generated',
        description: `Section content generated successfully using ${data.tokens_used} tokens`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/cmc/blueprints/${id}`] });
      setIsContentModified(false);
    },
    onError: (error) => {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate content',
        variant: 'destructive',
      });
    }
  });

  // Export blueprint mutation (download)
  const exportMutation = useMutation({
    mutationFn: async (format) => {
      window.open(`/api/cmc/blueprints/${id}/export?format=${format}`, '_blank');
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Export Started',
        description: 'Your document is being prepared for download',
      });
      setShowExportDialog(false);
    },
    onError: (error) => {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export blueprint',
        variant: 'destructive',
      });
    }
  });

  // Set editing content when section changes
  useEffect(() => {
    if (selectedSectionPath && blueprintQuery.data?.content) {
      setEditingContent(blueprintQuery.data.content[selectedSectionPath] || '');
      setIsContentModified(false);
    } else {
      setEditingContent('');
    }
  }, [selectedSectionPath, blueprintQuery.data]);

  // Handle content change
  const handleContentChange = (newContent) => {
    setEditingContent(newContent);
    setIsContentModified(true);
  };

  // Handle save content
  const handleSaveContent = () => {
    if (!selectedSectionPath) return;
    
    updateContentMutation.mutate({
      path: selectedSectionPath,
      content: editingContent
    });
  };

  // Handle lock/unlock
  const handleToggleLock = () => {
    const blueprint = blueprintQuery.data;
    
    if (!blueprint) return;
    
    if (blueprint.is_locked) {
      unlockMutation.mutate();
    } else {
      lockMutation.mutate();
    }
  };

  // Handle generate content
  const handleGenerateContent = () => {
    if (!selectedSectionPath) return;
    
    generateSectionMutation.mutate(selectedSectionPath);
  };

  // Handle context change
  const handleContextChange = (e) => {
    const { name, value } = e.target;
    setGenerationContext(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle export
  const handleExport = () => {
    exportMutation.mutate(exportFormat);
  };

  // Recursive function to render structure
  const renderStructure = (sections, level = 0) => {
    if (!sections || !Array.isArray(sections)) return null;
    
    return sections.map(section => {
      const hasContent = blueprintQuery.data?.content && blueprintQuery.data.content[section.id];
      
      return (
        <AccordionItem key={section.id} value={section.id}>
          <AccordionTrigger className={`${level > 0 ? `pl-${level * 4}` : ''}`}>
            <div className="flex items-center gap-2">
              <span>{section.id}</span>
              <span className="font-medium">{section.title}</span>
              {hasContent && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Check className="w-3 h-3 mr-1" />
                  Content
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex gap-2 mb-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setSelectedSectionPath(section.id)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGenerateContent(section.id)}
                disabled={generateSectionMutation.isPending}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Generate
              </Button>
            </div>
            
            {section.subsections && section.subsections.length > 0 && (
              <Accordion type="multiple" className="ml-4">
                {renderStructure(section.subsections, level + 1)}
              </Accordion>
            )}
          </AccordionContent>
        </AccordionItem>
      );
    });
  };

  // Show loading state
  if (blueprintQuery.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-hotpink-500" />
      </div>
    );
  }

  // Show error state
  if (blueprintQuery.error || !blueprintQuery.data) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load blueprint: {blueprintQuery.error?.message || 'Blueprint not found'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link to="/cmc">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Blueprint List
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const blueprint = blueprintQuery.data;
  const canEdit = !blueprint.is_locked || (blueprint.is_locked && blueprint.locked_by === 'currentUserId'); // Replace with actual user ID check

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/cmc" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">{blueprint.name}</h1>
            <Badge className={`
              ${blueprint.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                blueprint.status === 'DRAFT_COMPLETE' ? 'bg-blue-100 text-blue-800' :
                blueprint.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'}
            `}>
              {blueprint.status}
            </Badge>
          </div>
          <p className="text-gray-500">{blueprint.template?.region} | {blueprint.template?.category} | {blueprint.product_name}</p>
        </div>
        
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={blueprint.is_locked ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={handleToggleLock}
                  disabled={lockMutation.isPending || unlockMutation.isPending}
                >
                  {blueprint.is_locked ? (
                    <>
                      <Unlock className="mr-2 h-4 w-4" />
                      Unlock
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Lock
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {blueprint.is_locked 
                  ? 'Release editing lock to allow others to edit' 
                  : 'Lock blueprint for exclusive editing'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            size="sm"
            variant="outline"
            onClick={() => setShowExportDialog(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {blueprint.is_locked && blueprint.locked_by !== 'currentUserId' && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Blueprint is Locked</AlertTitle>
          <AlertDescription>
            This blueprint is currently being edited by another user. You can view content but cannot make changes.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Blueprint Structure</CardTitle>
              <CardDescription>
                Navigate the document structure and edit sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple">
                {blueprint.structure?.sections && renderStructure(blueprint.structure.sections)}
              </Accordion>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {selectedSectionPath ? (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>
                    Editing Section: {selectedSectionPath}
                  </CardTitle>
                  <CardDescription>
                    {/*Find section title from structure*/}
                    {blueprint.structure?.sections?.find(s => s.id === selectedSectionPath)?.title ||
                     blueprint.structure?.sections?.flatMap(s => s.subsections || []).find(s => s.id === selectedSectionPath)?.title ||
                     blueprint.structure?.sections?.flatMap(s => (s.subsections || []).flatMap(sub => sub.subsections || [])).find(s => s.id === selectedSectionPath)?.title}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSectionPath(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="edit">
                  <TabsList>
                    <TabsTrigger value="edit">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="generate">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="edit" className="min-h-[500px]">
                    <SimpleEditor 
                      content={editingContent} 
                      onChange={handleContentChange}
                    />
                  </TabsContent>
                  
                  <TabsContent value="preview" className="min-h-[500px]">
                    <div className="prose max-w-none">
                      {/* In a real implementation, render markdown/formatting here */}
                      <div className="p-4 border rounded-md whitespace-pre-wrap">
                        {editingContent || 'No content to preview'}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="generate" className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h3 className="font-medium mb-2">AI Generation Context</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Provide relevant context information to help the AI generate better content for this section.
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="manufacturer_name">Manufacturer Name</Label>
                          <Input 
                            id="manufacturer_name" 
                            name="manufacturer_name"
                            onChange={handleContextChange}
                            value={generationContext.manufacturer_name || ''}
                            placeholder="Enter manufacturer name"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="manufacturer_address">Manufacturer Address</Label>
                          <Input 
                            id="manufacturer_address" 
                            name="manufacturer_address"
                            onChange={handleContextChange}
                            value={generationContext.manufacturer_address || ''}
                            placeholder="Enter manufacturer address"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="manufacturing_steps">Manufacturing Steps</Label>
                          <Textarea 
                            id="manufacturing_steps" 
                            name="manufacturing_steps"
                            onChange={handleContextChange}
                            value={generationContext.manufacturing_steps || ''}
                            placeholder="Describe key manufacturing steps"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="tests">Quality Control Tests</Label>
                          <Textarea 
                            id="tests" 
                            name="tests"
                            onChange={handleContextChange}
                            value={generationContext.tests || ''}
                            placeholder="Enter key quality control tests"
                          />
                        </div>
                      </div>
                      
                      <Button 
                        className="mt-4"
                        onClick={handleGenerateContent}
                        disabled={generateSectionMutation.isPending}
                      >
                        {generateSectionMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Content
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSectionPath(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveContent}
                  disabled={!isContentModified || updateContentMutation.isPending || !canEdit}
                >
                  {updateContentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Blueprint Information</CardTitle>
                <CardDescription>
                  Select a section from the structure to start editing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Product Name</Label>
                    <div className="p-2 border rounded-md bg-gray-50">
                      {blueprint.product_name}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Template</Label>
                    <div className="p-2 border rounded-md bg-gray-50">
                      {blueprint.template?.name} ({blueprint.template?.region})
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <div className="p-2 border rounded-md bg-gray-50 min-h-[80px]">
                      {blueprint.description || "No description provided"}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Status</Label>
                    <div className="flex gap-2 p-2">
                      <Badge className={`
                        ${blueprint.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                          blueprint.status === 'DRAFT_COMPLETE' ? 'bg-blue-100 text-blue-800' :
                          blueprint.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {blueprint.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Created By</Label>
                      <div className="p-2 border rounded-md bg-gray-50">
                        {blueprint.created_by_user?.name || "Unknown"}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Last Updated</Label>
                      <div className="p-2 border rounded-md bg-gray-50">
                        {new Date(blueprint.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Blueprint</DialogTitle>
            <DialogDescription>
              Choose your preferred export format
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="exportFormat">Format</Label>
              <Select
                value={exportFormat}
                onValueChange={setExportFormat}
              >
                <SelectTrigger id="exportFormat">
                  <SelectValue placeholder="Select Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="word">Word Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BlueprintEditor;
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { 
  Save, 
  Play, 
  AlertTriangle, 
  FileCheck, 
  Clock, 
  Users, 
  History, 
  Lock, 
  Unlock, 
  FileText,
  Download
} from 'lucide-react';

export default function BlueprintEditor({ blueprintId, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    version: '1.0',
    description: '',
    region: 'FDA',
    category: 'Drug Substance',
    productName: '',
    isLocked: false
  });
  
  const [currentTab, setCurrentTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleToggleLock = () => {
    setFormData(prev => ({
      ...prev,
      isLocked: !prev.isLocked
    }));
    
    toast({
      title: formData.isLocked ? "Blueprint unlocked" : "Blueprint locked",
      description: formData.isLocked 
        ? "The blueprint can now be edited" 
        : "The blueprint is now locked for editing"
    });
  };
  
  const handleSave = () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      if (onSave) {
        onSave(formData);
      }
      
      toast({
        title: "Blueprint saved",
        description: "All changes have been saved successfully"
      });
    }, 1000);
  };
  
  const handleGenerateCompliance = () => {
    toast({
      title: "Compliance verification started",
      description: "AI is analyzing your blueprint for regulatory compliance"
    });
  };
  
  const handleExport = () => {
    toast({
      title: "Blueprint export initiated",
      description: "Your document is being prepared for export"
    });
  };
  
  const regions = [
    { value: 'FDA', label: 'FDA (US)' },
    { value: 'EMA', label: 'EMA (EU)' },
    { value: 'PMDA', label: 'PMDA (Japan)' },
    { value: 'NMPA', label: 'NMPA (China)' },
    { value: 'Health Canada', label: 'Health Canada' },
    { value: 'TGA', label: 'TGA (Australia)' },
    { value: 'MHRA', label: 'MHRA (UK)' }
  ];
  
  const categories = [
    { value: 'Drug Substance', label: 'Drug Substance (API)' },
    { value: 'Drug Product', label: 'Drug Product' },
    { value: 'Excipients', label: 'Excipients' },
    { value: 'Container Closure', label: 'Container Closure System' },
    { value: 'Process Validation', label: 'Process Validation' }
  ];
  
  // Mock revision history
  const revisionHistory = [
    { id: 1, version: '1.0', date: '2025-05-01', author: 'David Park', changes: 'Initial draft creation' },
    { id: 2, version: '1.1', date: '2025-05-03', author: 'Maria Chen', changes: 'Updated manufacturing section with new process parameters' },
    { id: 3, version: '1.2', date: '2025-05-08', author: 'James Wilson', changes: 'Added stability data and updated specifications' }
  ];
  
  // Mock sections data
  const sectionsData = [
    { id: 's1', path: '3.2.S.1', title: 'General Information', status: 'Complete', subsections: [
      { id: 's11', path: '3.2.S.1.1', title: 'Nomenclature', status: 'Complete' },
      { id: 's12', path: '3.2.S.1.2', title: 'Structure', status: 'Complete' },
      { id: 's13', path: '3.2.S.1.3', title: 'General Properties', status: 'Complete' }
    ]},
    { id: 's2', path: '3.2.S.2', title: 'Manufacture', status: 'In Progress', subsections: [
      { id: 's21', path: '3.2.S.2.1', title: 'Manufacturer(s)', status: 'Complete' },
      { id: 's22', path: '3.2.S.2.2', title: 'Description of Manufacturing Process', status: 'Complete' },
      { id: 's23', path: '3.2.S.2.3', title: 'Control of Materials', status: 'In Progress' },
      { id: 's24', path: '3.2.S.2.4', title: 'Control of Critical Steps and Intermediates', status: 'In Progress' },
      { id: 's25', path: '3.2.S.2.5', title: 'Process Validation', status: 'Not Started' },
      { id: 's26', path: '3.2.S.2.6', title: 'Manufacturing Process Development', status: 'Not Started' }
    ]},
    { id: 's3', path: '3.2.S.3', title: 'Characterisation', status: 'In Progress', subsections: [
      { id: 's31', path: '3.2.S.3.1', title: 'Elucidation of Structure', status: 'Complete' },
      { id: 's32', path: '3.2.S.3.2', title: 'Impurities', status: 'In Progress' }
    ]},
    { id: 's4', path: '3.2.S.4', title: 'Control of Drug Substance', status: 'Not Started', subsections: [
      { id: 's41', path: '3.2.S.4.1', title: 'Specification', status: 'Not Started' },
      { id: 's42', path: '3.2.S.4.2', title: 'Analytical Procedures', status: 'Not Started' },
      { id: 's43', path: '3.2.S.4.3', title: 'Validation of Analytical Procedures', status: 'Not Started' },
      { id: 's44', path: '3.2.S.4.4', title: 'Batch Analyses', status: 'Not Started' },
      { id: 's45', path: '3.2.S.4.5', title: 'Justification of Specification', status: 'Not Started' }
    ]},
    { id: 's5', path: '3.2.S.5', title: 'Reference Standards', status: 'Not Started' },
    { id: 's6', path: '3.2.S.6', title: 'Container Closure System', status: 'Not Started' },
    { id: 's7', path: '3.2.S.7', title: 'Stability', status: 'Not Started', subsections: [
      { id: 's71', path: '3.2.S.7.1', title: 'Stability Summary and Conclusions', status: 'Not Started' },
      { id: 's72', path: '3.2.S.7.2', title: 'Post-approval Stability Protocol', status: 'Not Started' },
      { id: 's73', path: '3.2.S.7.3', title: 'Stability Data', status: 'Not Started' }
    ]}
  ];
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Complete':
        return <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">Complete</span>;
      case 'In Progress':
        return <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">In Progress</span>;
      case 'Not Started':
        return <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">Not Started</span>;
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>CMC Blueprint Editor</CardTitle>
            <CardDescription>
              {blueprintId ? 'Edit existing blueprint' : 'Create a new blueprint for your CMC documentation'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleToggleLock}>
              {formData.isLocked ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
              {formData.isLocked ? 'Unlock' : 'Lock'}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="default" onClick={handleSave} disabled={saving || formData.isLocked}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="revisions">Revisions</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Blueprint Title</Label>
                <Input 
                  id="title"
                  name="title"
                  placeholder="Enter blueprint title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={formData.isLocked}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input 
                  id="version"
                  name="version"
                  placeholder="1.0"
                  value={formData.version}
                  onChange={handleChange}
                  disabled={formData.isLocked}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                placeholder="Enter a detailed description of this blueprint"
                value={formData.description}
                onChange={handleChange}
                disabled={formData.isLocked}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Target Region</Label>
                <Select 
                  value={formData.region} 
                  onValueChange={(value) => handleSelectChange('region', value)}
                  disabled={formData.isLocked}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                  disabled={formData.isLocked}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input 
                id="productName"
                name="productName"
                placeholder="Enter the product name"
                value={formData.productName}
                onChange={handleChange}
                disabled={formData.isLocked}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="sections" className="pt-4">
            <div className="space-y-4">
              {sectionsData.map(section => (
                <div key={section.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{section.title}</h4>
                        <p className="text-xs text-muted-foreground">Section {section.path}</p>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(section.status)}
                    </div>
                  </div>
                  
                  {section.subsections && section.subsections.length > 0 && (
                    <div className="mt-3 pl-8 grid gap-2">
                      {section.subsections.map(subsection => (
                        <div key={subsection.id} className="flex justify-between items-center py-1 border-t text-sm">
                          <div>
                            <span className="text-muted-foreground text-xs">{subsection.path}</span>
                            <p>{subsection.title}</p>
                          </div>
                          <div>
                            {getStatusBadge(subsection.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-3 flex justify-end">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last updated: May 8, 2025</span>
              </div>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Generate Content
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="revisions" className="pt-4">
            <div className="space-y-4">
              {revisionHistory.map(revision => (
                <div key={revision.id} className="flex items-start gap-3 border-b pb-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Version {revision.version}</h4>
                      <span className="text-sm text-muted-foreground">{revision.date}</span>
                    </div>
                    <p className="text-sm">{revision.changes}</p>
                    <div className="mt-1 flex items-center text-xs text-muted-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{revision.author}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-between">
              <Button variant="outline" size="sm">View All Revisions</Button>
              <Button variant="outline" size="sm">Compare Versions</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="compliance" className="pt-4">
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-medium text-amber-800">Compliance Check Required</h4>
                  <p className="text-sm text-amber-700">
                    Run a compliance check to ensure your blueprint meets all regulatory requirements.
                  </p>
                </div>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Regulatory Compliance Checks</CardTitle>
                  <CardDescription>Verify alignment with selected region requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between p-2 border-b">
                      <span>ICH M4Q Guidelines</span>
                      <span className="text-gray-500">Not verified</span>
                    </div>
                    <div className="flex justify-between p-2 border-b">
                      <span>FDA Guidance for Industry</span>
                      <span className="text-gray-500">Not verified</span>
                    </div>
                    <div className="flex justify-between p-2 border-b">
                      <span>CTD Format Requirements</span>
                      <span className="text-gray-500">Not verified</span>
                    </div>
                    <div className="flex justify-between p-2 border-b">
                      <span>Section Completeness</span>
                      <span className="text-gray-500">Not verified</span>
                    </div>
                    <div className="flex justify-between p-2">
                      <span>Consistency Check</span>
                      <span className="text-gray-500">Not verified</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="default" className="w-full" onClick={handleGenerateCompliance}>
                    <FileCheck className="h-4 w-4 mr-2" />
                    Run Compliance Check
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
