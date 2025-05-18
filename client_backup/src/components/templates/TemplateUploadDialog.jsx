import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Upload } from 'lucide-react';

/**
 * Template Upload Dialog Component
 * 
 * A dialog that allows users to upload document templates with associated metadata.
 * Supports multiple file formats (Word, PDF) and connects to the backend template service.
 */
const TemplateUploadDialog = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    title: '',
    module: '',
    sectionId: '',
    description: '',
    guidance: '',
    required: false,
    status: 'active',
    file: null,
  });
  const [fileError, setFileError] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      
      // Add template metadata
      Object.keys(data).forEach(key => {
        if (key !== 'file') {
          formData.append(key, data[key]);
        }
      });
      
      // Add file if provided
      if (data.file) {
        formData.append('file', data.file);
      }
      
      return apiRequest('POST', '/api/templates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: 'Template Created',
        description: 'Your new template has been added to the library',
        variant: 'success',
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error Creating Template',
        description: error.message || 'An error occurred while creating the template',
        variant: 'destructive',
      });
    },
  });
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    
    if (file) {
      const fileType = file.type;
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'application/msword', // doc
        'application/pdf', // pdf
        'text/plain', // txt
      ];
      
      if (!validTypes.includes(fileType)) {
        setFileError('Invalid file type. Please upload a Word document, PDF, or text file.');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setFileError('File size exceeds 10MB limit.');
        return;
      }
      
      setFormData({
        ...formData,
        file,
      });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.module || !formData.sectionId) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    // Check for file error
    if (fileError) {
      toast({
        title: 'File Error',
        description: fileError,
        variant: 'destructive',
      });
      return;
    }
    
    // Submit form
    createTemplateMutation.mutate(formData);
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      module: '',
      sectionId: '',
      description: '',
      guidance: '',
      required: false,
      status: 'active',
      file: null,
    });
    setFileError('');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload New Template</DialogTitle>
          <DialogDescription>
            Add a new document template to the library. Templates can be used to generate standardized regulatory documents.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium">
                Template Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter template title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="module" className="font-medium">
                Module <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.module}
                onValueChange={(value) => handleSelectChange('module', value)}
                required
              >
                <SelectTrigger id="module">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="module1">Module 1 - Administrative</SelectItem>
                  <SelectItem value="module2">Module 2 - Summaries</SelectItem>
                  <SelectItem value="module3">Module 3 - Quality</SelectItem>
                  <SelectItem value="module4">Module 4 - Nonclinical</SelectItem>
                  <SelectItem value="module5">Module 5 - Clinical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sectionId" className="font-medium">
                Section ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sectionId"
                name="sectionId"
                placeholder="e.g., 3.2.P.8"
                value={formData.sectionId}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status" className="font-medium">
                Status
              </Label>
              <Select 
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter template description"
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="guidance" className="font-medium">
              Guidance
            </Label>
            <Textarea
              id="guidance"
              name="guidance"
              placeholder="Enter guidance for using this template"
              value={formData.guidance}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              name="required"
              checked={formData.required}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, required: checked })
              }
            />
            <Label htmlFor="required" className="font-medium">
              Required Template
            </Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file" className="font-medium">
              Template File
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".docx,.doc,.pdf,.txt"
                className="flex-1"
              />
              {formData.file && (
                <div className="text-sm text-gray-500">
                  {formData.file.name} ({(formData.file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
            {fileError && <p className="text-sm text-red-500">{fileError}</p>}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createTemplateMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createTemplateMutation.isPending}
            >
              {createTemplateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Template
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateUploadDialog;