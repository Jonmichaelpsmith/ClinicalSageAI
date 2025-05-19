/**
 * Template Editor Component for eCTD Module
 * 
 * This component provides a rich text editor for creating and editing
 * document templates with regulatory-specific formatting options.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createTemplateVersion } from '../../services/templateVersioningService';
import { useTenant } from '../../contexts/TenantContext';
import { Save, Eye, FileText, Clock, ArrowLeft, CheckCircle, Book, Table, ListOrdered, List, Image, Bold, Italic, Underline, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, AlertTriangle } from 'lucide-react';

export default function TemplateEditor({ templateId, onSave, onCancel }) {
  const [template, setTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [activeTab, setActiveTab] = useState('editor');
  const { toast } = useToast();
  const { currentClientWorkspace } = useTenant();

  // Fetch template data if editing an existing template
  useEffect(() => {
    if (templateId) {
      // In a real implementation, fetch the template data from the API
      // For demo purposes, use mock data
      const mockTemplate = {
        id: templateId,
        name: 'Module 3 Quality Control Template',
        description: 'Standard template for Module 3 Quality Control documentation',
        category: 'm3',
        tags: ['Quality', 'Protocol', 'Module 3'],
        content: getMockContent('m3'),
        lastModified: new Date().toISOString(),
        useCount: 5,
        versions: 2
      };
      
      setTemplate(mockTemplate);
      setTemplateName(mockTemplate.name);
      setTemplateDescription(mockTemplate.description);
      setCategory(mockTemplate.category);
      setTags(mockTemplate.tags);
      setEditorContent(mockTemplate.content);
    }
  }, [templateId]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const validateTemplate = () => {
    const errors = [];
    
    if (!templateName.trim()) {
      errors.push({ field: 'name', message: 'Template name is required' });
    }
    
    if (!category) {
      errors.push({ field: 'category', message: 'Category is required' });
    }
    
    if (!editorContent.trim()) {
      errors.push({ field: 'content', message: 'Template content cannot be empty' });
    }
    
    // Check for regulatory-specific issues
    if (category === 'm3' && !editorContent.includes('Quality Control')) {
      errors.push({ field: 'content', message: 'Module 3 templates should include Quality Control sections' });
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateTemplate()) {
      toast({
        title: "Validation Errors",
        description: "Please correct the errors before saving",
        variant: "destructive"
      });
      setActiveTab('validation');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const templateData = {
        name: templateName,
        description: templateDescription,
        category,
        tags,
        content: editorContent,
        clientId: currentClientWorkspace?.id
      };
      
      if (templateId) {
        // Update existing template by creating a new version
        await createNewVersion(templateId, templateData, 'current-user-id');
        
        toast({
          title: "Template Updated",
          description: "A new version has been created",
        });
      } else {
        // Create a new template
        // In a real implementation, call the API to create the template
        if (onSave) {
          onSave(templateData);
        }
        
        toast({
          title: "Template Created",
          description: "Your new template is ready to use",
        });
      }
      
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Failed to Save",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock function to get template content based on category
  const getMockContent = (category) => {
    switch(category) {
      case 'm1':
        return '<h1>Cover Letter Template</h1><p>[Company Letterhead]</p><p>[Date]</p><p>Food and Drug Administration<br>Center for Drug Evaluation and Research<br>Central Document Room<br>5901-B Ammendale Road<br>Beltsville, MD 20705-1266</p>';
      case 'm2':
        return '<h1>Quality Overall Summary</h1><h2>2.3.S Drug Substance</h2><h3>2.3.S.1 General Information</h3><p>[Provide the nomenclature, molecular structure, and general properties of the drug substance]</p>';
      case 'm3':
        return '<h1>Drug Substance Specifications</h1><p><strong>3.2.S.4.1 Specification</strong></p><p>The drug substance specification is provided in Table 1.</p><p><strong>Table 1: Drug Substance Specification</strong></p><table><thead><tr><th>Test</th><th>Method</th><th>Acceptance Criteria</th></tr></thead><tbody><tr><td>Description</td><td>Visual</td><td>[Description]</td></tr><tr><td>Identification</td><td>IR</td><td>Conforms to reference spectrum</td></tr></tbody></table>';
      case 'm4':
        return '<h1>Toxicology Summary</h1><h2>4.2.3.2 Repeat-Dose Toxicity</h2><p><strong>Study Title:</strong> [Title of Study]</p><p><strong>Study No.:</strong> [Study Number]</p>';
      case 'm5':
        return '<h1>Clinical Study Report Synopsis</h1><p><strong>Protocol Number:</strong> [Protocol Number]</p><p><strong>Study Title:</strong> [Study Title]</p><p><strong>Phase:</strong> [Phase]</p>';
      default:
        return '<p>Enter your template content here...</p>';
    }
  };

  // Generate a simple rich text editor toolbar
  const EditorToolbar = () => (
    <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0">
        <Bold size={16} />
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0">
        <Italic size={16} />
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0">
        <Underline size={16} />
      </Button>
      <div className="h-8 border-r mx-1"></div>
      <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0">
        <Heading1 size={16} />
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0">
        <Heading2 size={16} />
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0">
        <Heading3 size={16} />
      </Button>
      <div className="h-8 border-r mx-1"></div>
      <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0">
        <AlignLeft size={16} />
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0">
        <AlignCenter size={16} />
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0">
        <AlignRight size={16} />
      </Button>
      <div className="h-8 border-r mx-1"></div>
      <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0">
        <List size={16} />
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0">
        <ListOrdered size={16} />
      </Button>
      <div className="h-8 border-r mx-1"></div>
      <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0">
        <Table size={16} />
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0">
        <Image size={16} />
      </Button>
    </div>
  );

  const ValidationPanel = () => (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-3 border-b font-medium flex items-center">
        <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
        Template Validation
      </div>
      
      {validationErrors.length === 0 ? (
        <div className="p-4 text-green-700 bg-green-50 flex items-center">
          <CheckCircle className="mr-2 h-5 w-5" />
          Template passes all validation checks.
        </div>
      ) : (
        <div className="divide-y">
          {validationErrors.map((error, index) => (
            <div key={index} className="p-4 flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">{error.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {error.field === 'name' && 'Provide a descriptive name for your template.'}
                  {error.field === 'category' && 'Select the appropriate eCTD module category.'}
                  {error.field === 'content' && 'Ensure your template includes all required content for this module.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              {templateId ? 'Edit Template' : 'Create Template'}
            </CardTitle>
            <CardDescription>
              {templateId ? 'Update your document template' : 'Create a new document template for your regulatory submissions'}
            </CardDescription>
          </div>
          {template && (
            <Badge variant={getCategoryVariant(template.category)}>
              {template.category.toUpperCase()}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="templateName">Template Name*</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Module 3 Quality Control Template"
                className={validationErrors.some(e => e.field === 'name') ? 'border-red-500' : ''}
              />
              {validationErrors.some(e => e.field === 'name') && (
                <p className="text-sm text-red-500 mt-1">Template name is required</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="templateDescription">Description</Label>
              <Textarea
                id="templateDescription"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe the purpose and contents of this template"
                rows={3}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Category*</Label>
              <Select 
                value={category} 
                onValueChange={setCategory}
                disabled={!!templateId} // Can't change category when editing
              >
                <SelectTrigger id="category" className={validationErrors.some(e => e.field === 'category') ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select eCTD module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m1">Module 1 - Administrative</SelectItem>
                  <SelectItem value="m2">Module 2 - Summaries</SelectItem>
                  <SelectItem value="m3">Module 3 - Quality</SelectItem>
                  <SelectItem value="m4">Module 4 - Nonclinical</SelectItem>
                  <SelectItem value="m5">Module 5 - Clinical</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.some(e => e.field === 'category') && (
                <p className="text-sm text-red-500 mt-1">Category is required</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tags and press Enter"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="ml-2"
                  onClick={handleAddTag}
                >
                  Add
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-1 text-gray-500 hover:text-red-500"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="editor" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center" onClick={() => setShowPreview(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              Validation
              {validationErrors.length > 0 && (
                <Badge variant="destructive" className="ml-2">{validationErrors.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="guidance" className="flex items-center">
              <Book className="mr-2 h-4 w-4" />
              Guidance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="border rounded-lg overflow-hidden">
            <EditorToolbar />
            <div className="p-4 min-h-[400px]">
              {/* In a real implementation, this would be a rich text editor like TipTap */}
              {/* For demonstration purposes, we're using a textarea */}
              <Textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                placeholder="Enter your template content here..."
                className={`min-h-[400px] font-mono ${validationErrors.some(e => e.field === 'content') ? 'border-red-500' : ''}`}
              />
              {validationErrors.some(e => e.field === 'content') && (
                <p className="text-sm text-red-500 mt-1">Template content cannot be empty</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="border rounded-lg p-4 min-h-[400px] bg-white">
              <div dangerouslySetInnerHTML={{ __html: editorContent }} />
            </div>
          </TabsContent>
          
          <TabsContent value="validation">
            <ValidationPanel />
          </TabsContent>
          
          <TabsContent value="guidance">
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-3 border-b font-medium flex items-center">
                <Book className="mr-2 h-5 w-5 text-blue-500" />
                Regulatory Guidance for {getCategoryName(category)}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2">eCTD Requirements</h3>
                <p className="mb-4">
                  This guidance provides recommendations for preparing and structuring your {getCategoryName(category)} 
                  documents according to eCTD standards.
                </p>
                
                <div className="space-y-4">
                  {category === 'm1' && (
                    <>
                      <h4 className="font-medium">Administrative Documents</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Cover letter should clearly state the purpose of the submission</li>
                        <li>Form FDA 1571 or 356h should be properly completed</li>
                        <li>Include proper contact information for the responsible party</li>
                      </ul>
                    </>
                  )}
                  
                  {category === 'm2' && (
                    <>
                      <h4 className="font-medium">CTD Summaries</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Common Technical Document overview should be comprehensive</li>
                        <li>Quality Overall Summary should address all critical quality attributes</li>
                        <li>Nonclinical Overview should include integrated risk assessment</li>
                        <li>Clinical Overview should include benefit-risk assessment</li>
                      </ul>
                    </>
                  )}
                  
                  {category === 'm3' && (
                    <>
                      <h4 className="font-medium">Quality Documentation</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Drug substance and drug product sections should be complete</li>
                        <li>Manufacturing process should be described in detail</li>
                        <li>Analytical methods should be validated</li>
                        <li>Stability data should support proposed shelf life</li>
                      </ul>
                    </>
                  )}
                  
                  {category === 'm4' && (
                    <>
                      <h4 className="font-medium">Nonclinical Study Reports</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Study reports should follow ICH M4S guidelines</li>
                        <li>Include pharmacology, pharmacokinetics, and toxicology studies</li>
                        <li>GLP compliance should be clearly stated</li>
                        <li>Include appropriate cross-references to related studies</li>
                      </ul>
                    </>
                  )}
                  
                  {category === 'm5' && (
                    <>
                      <h4 className="font-medium">Clinical Study Reports</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Study reports should follow ICH E3 guidelines</li>
                        <li>Include comprehensive efficacy and safety evaluations</li>
                        <li>Case report forms for deaths, serious adverse events</li>
                        <li>Reports should include appropriate statistical analyses</li>
                      </ul>
                    </>
                  )}
                  
                  {!category && (
                    <p className="text-amber-500">
                      Please select a category to view specific guidance.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        
        <div className="flex items-center gap-2">
          {templateId && (
            <div className="text-sm text-gray-500 flex items-center mr-2">
              <Clock className="mr-1 h-4 w-4" />
              Last modified: {formatDate(template?.lastModified || new Date().toISOString())}
            </div>
          )}
          
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting 
              ? 'Saving...' 
              : templateId 
                ? 'Save as New Version' 
                : 'Create Template'
            }
          </Button>
        </div>
      </CardFooter>
      
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{templateName || 'Untitled Template'}</span>
              {category && (
                <Badge variant={getCategoryVariant(category)}>
                  {category.toUpperCase()}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="border rounded-md p-4 max-h-[70vh] overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: editorContent }} />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(false)}
            >
              Close Preview
            </Button>
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
    default: return 'eCTD Module';
  }
}