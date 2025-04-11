import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, X, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  accept?: string;
  maxSize?: number; // in MB
  onFilesAdded: (files: File[]) => void;
  uploadText?: string;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept = '*',
  maxSize = 10,
  onFilesAdded,
  uploadText = 'Drag & drop files here or click to browse',
  className
}) => {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return [];

    const validFiles: File[] = [];
    const maxSizeBytes = maxSize * 1024 * 1024;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Check file size
      if (file.size > maxSizeBytes) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds the maximum size of ${maxSize}MB`,
          variant: 'destructive',
        });
        continue;
      }

      // Check file type if accept is specified
      if (accept !== '*') {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileType = file.type;
        const fileExtension = '.' + file.name.split('.').pop();
        
        if (!acceptedTypes.some(type => 
          type === fileType || 
          type === fileExtension || 
          (type.includes('/*') && fileType.startsWith(type.replace('/*', '/')))
        )) {
          toast({
            title: 'Invalid file type',
            description: `${file.name} is not an accepted file type`,
            variant: 'destructive',
          });
          continue;
        }
      }

      validFiles.push(file);
    }

    return validFiles;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  };

  const handleFiles = (selectedFiles: FileList | null) => {
    const validFiles = validateFiles(selectedFiles);
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      onFilesAdded(validFiles);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset the input value so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
          dragging 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary/50 hover:bg-primary/5',
          className
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {files.length === 0 ? (
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="mb-2 text-sm text-center text-muted-foreground">{uploadText}</p>
            <p className="text-xs text-muted-foreground">Max file size: {maxSize}MB</p>
          </div>
        ) : (
          <div className="w-full space-y-2">
            {files.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 rounded bg-gray-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center space-x-2">
                  <FileCheck className="flex-shrink-0 w-5 h-5 text-green-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
            <p className="text-xs text-center text-muted-foreground">
              Click to add more files
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          multiple
        />
      </div>
    </div>
  );
};