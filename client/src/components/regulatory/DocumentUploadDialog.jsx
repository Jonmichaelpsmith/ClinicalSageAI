import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
// Import from the stable wrapper to prevent conflicts
import { FileUpload } from '@/components/ui/file-upload-wrapper';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Schema for the form validation
const formSchema = z.object({
  displayName: z.string().min(3, {
    message: 'Display name must be at least 3 characters.',
  }),
  documentType: z.string().min(1, {
    message: 'Document type is required.',
  }),
  comment: z.string().optional(),
  isAppendix: z.boolean().default(false),
  file: z.instanceof(File, {
    message: 'Please select a file to upload.',
  }).refine(
    (file) => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type), 
    {
      message: 'Only PDF and Word documents are supported.',
    }
  )
});

/**
 * Document Upload Dialog Component
 * 
 * Dialog for uploading documents to a submission with metadata.
 */
const DocumentUploadDialog = ({ 
  open, 
  onOpenChange,
  onUpload,
  parentPath = '/',
  moduleType,
  isLoading = false,
  documentTypes = []
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const defaultDocumentTypes = [
    { id: 'cover-letter', name: 'Cover Letter' },
    { id: 'protocol', name: 'Protocol' },
    { id: 'study-report', name: 'Study Report' },
    { id: 'data-analysis', name: 'Data Analysis' },
    { id: 'correspondence', name: 'Correspondence' },
    { id: 'form', name: 'Form' },
    { id: 'other', name: 'Other' }
  ];
  
  const availableDocumentTypes = documentTypes.length > 0 ? documentTypes : defaultDocumentTypes;

  // Create a form instance with validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
      documentType: '',
      comment: '',
      isAppendix: false,
      file: undefined
    },
  });

  const handleFileChange = (file) => {
    if (!file) {
      setSelectedFile(null);
      form.setValue('file', undefined);
      form.setValue('displayName', '');
      return;
    }
    
    setSelectedFile(file);
    form.setValue('file', file);

    // Auto-populate the display name based on file name
    const fileName = file.name;
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    form.setValue('displayName', nameWithoutExt);
  };

  // Handle form submission
  const handleSubmit = async (data) => {
    setUploadError(null);
    
    try {
      // Simulate upload progress
      const uploadProgressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(uploadProgressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      // Calculate file path
      const filePath = parentPath.endsWith('/') 
        ? `${parentPath}${data.file.name}` 
        : `${parentPath}/${data.file.name}`;

      // Prepare complete document data
      const documentData = {
        ...data,
        filePath,
        moduleType,
        fileName: data.file.name,
        mimeType: data.file.type,
        size: data.file.size
      };

      // Call the provided upload function
      await onUpload(documentData, data.file, (progress) => {
        setUploadProgress(progress);
      });

      // Clear interval and set final progress
      clearInterval(uploadProgressInterval);
      setUploadProgress(100);
      
      // Close dialog and reset form after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        form.reset();
        setSelectedFile(null);
        onOpenChange(false);
      }, 500);
    } catch (error) {
      setUploadError(error.message || 'An error occurred while uploading the document.');
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newState) => {
      if (!newState) {
        // Reset form and states when dialog is closed
        setUploadProgress(0);
        setUploadError(null);
        form.reset();
        setSelectedFile(null);
      }
      onOpenChange(newState);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a new document to {moduleType ? `Module ${moduleType}` : 'this submission'}.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
            
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document File</FormLabel>
                  <FormControl>
                    <FileUpload
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      maxSize={50 * 1024 * 1024} // 50MB
                    />
                  </FormControl>
                  <FormDescription>
                    Select a PDF or Word document to upload.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedFile && (
              <div className="flex items-center p-3 border rounded-md bg-gray-50">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium">{selectedFile.name}</div>
                  <div className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a descriptive name for this document.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableDocumentTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the type of document.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional information about this document"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional comment for this document version.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  Uploading: {uploadProgress}%
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading || uploadProgress > 0}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || uploadProgress > 0 || !form.formState.isValid}
              >
                {isLoading || uploadProgress > 0 ? 'Uploading...' : 'Upload Document'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;