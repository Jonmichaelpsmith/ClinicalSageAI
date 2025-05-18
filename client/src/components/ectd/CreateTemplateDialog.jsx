/**
 * Create Template Dialog Component for eCTD Module
 * 
 * This component provides a dialog for creating new document templates
 * with proper categorization and metadata.
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Tag } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';

export default function CreateTemplateDialog({ onTemplateCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { currentClientWorkspace } = useTenant();

  const resetForm = () => {
    setTemplateName('');
    setTemplateDescription('');
    setCategory('');
    setTags([]);
    setTagInput('');
    setIsSubmitting(false);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!templateName || !category) {
      toast({
        title: "Missing Required Fields",
        description: "Please provide a template name and category.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // In a real implementation, this would be an API call
      // Example:
      // const response = await fetch('/api/templates', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     name: templateName,
      //     description: templateDescription,
      //     category,
      //     tags,
      //     clientId: currentClientWorkspace?.id,
      //   }),
      // });
      // const data = await response.json();
      
      // For demo purposes, simulate a server delay and create a mock template
      setTimeout(() => {
        const newTemplate = {
          id: `t${Date.now()}`,
          name: templateName,
          description: templateDescription,
          category,
          tags,
          lastModified: new Date().toISOString(),
          useCount: 0,
          versions: 1
        };
        
        if (onTemplateCreated) {
          onTemplateCreated(newTemplate);
        }
        
        toast({
          title: "Template Created",
          description: "Your new template has been created successfully."
        });
        
        resetForm();
        setIsOpen(false);
      }, 500);
      
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Failed to Create Template",
        description: "There was an error creating your template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <Plus size={18} className="mr-1" />
          New Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Document Template</DialogTitle>
          <DialogDescription>
            Create a reusable document template for your regulatory submissions.
            Templates are version-controlled and comply with eCTD standards.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name*</Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Module 3 Quality Control Template"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="templateDescription">Description</Label>
            <Textarea
              id="templateDescription"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Describe the purpose and contents of this template"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category*</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
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
          </div>
          
          <div className="space-y-2">
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
                <Tag size={16} className="mr-1" />
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
          
          <div className="border-t pt-4 flex justify-between">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                resetForm();
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
            <div className="flex space-x-2">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  const newTemplate = {
                    id: `t${Date.now()}`,
                    name: "Quality Control Protocol Template",
                    description: "Standard template for Module 3 Quality Control documentation",
                    category: "m3",
                    tags: ["Quality", "Protocol", "Module 3"],
                    lastModified: new Date().toISOString(),
                    useCount: 0,
                    versions: 1
                  };
                  
                  if (onTemplateCreated) {
                    onTemplateCreated(newTemplate);
                  }
                  
                  toast({
                    title: "Example Template Created",
                    description: "An example template has been created for demonstration."
                  });
                  
                  resetForm();
                  setIsOpen(false);
                }}
              >
                Use Example
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !templateName || !category}
              >
                {isSubmitting ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}