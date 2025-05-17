import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, File, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const FileUploader = ({
  onFilesAdded,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = undefined,
  label = "Drag & drop files or click to browse",
  description = "Supports most common file formats up to 5MB"
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = (files) => {
    setError(null);

    // Check for file count limit
    if (files.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} files at once.`);
      return;
    }

    // Check for file size and type
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setError(`File ${file.name} exceeds the maximum size limit of ${Math.round(maxSize / 1024 / 1024)}MB.`);
        return false;
      }

      if (accept) {
        const fileType = file.type;
        let isValidType = false;
        
        // Check if the file type is in the accept object
        for (const [mimeType, extensions] of Object.entries(accept)) {
          if (fileType === mimeType || fileType.startsWith(`${mimeType}/`)) {
            isValidType = true;
            break;
          }
          
          // Check if the file extension is in the list of accepted extensions
          const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
          if (extensions.includes(fileExtension)) {
            isValidType = true;
            break;
          }
        }
        
        if (!isValidType) {
          setError(`File type of ${file.name} is not supported.`);
          return false;
        }
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      onFilesAdded(validFiles);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileInputChange}
          multiple={maxFiles > 1}
          accept={accept ? Object.keys(accept).join(',') : undefined}
        />
        
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-2 bg-blue-100 rounded-full">
            <Upload className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-700">{label}</h3>
          <p className="text-sm text-gray-500">{description}</p>
          <Button type="button" size="sm" variant="outline" className="mt-2">
            Browse Files
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};