import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  LinearProgress, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Alert,
  Divider
} from '@mui/material';

/**
 * Document Uploader Component
 * 
 * This component provides a user interface for uploading documents to the Microsoft Office
 * integration system. It supports Word documents, PDFs, and allows for document metadata.
 */
const DocumentUploader = ({ onUploadComplete }) => {
  // Upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Document metadata
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('word');
  const [documentDescription, setDocumentDescription] = useState('');
  const [ectdModule, setEctdModule] = useState('');
  
  // Simulated eCTD module options
  const ectdModules = [
    { id: 'm1', name: 'Module 1 - Administrative Information' },
    { id: 'm2', name: 'Module 2 - Common Technical Document Summaries' },
    { id: 'm2-2', name: 'Module 2.2 - Introduction' },
    { id: 'm2-3', name: 'Module 2.3 - Quality Overall Summary' },
    { id: 'm2-4', name: 'Module 2.4 - Nonclinical Overview' },
    { id: 'm2-5', name: 'Module 2.5 - Clinical Overview' },
    { id: 'm2-6', name: 'Module 2.6 - Nonclinical Written and Tabulated Summaries' },
    { id: 'm2-7', name: 'Module 2.7 - Clinical Summary' },
    { id: 'm3', name: 'Module 3 - Quality' },
    { id: 'm4', name: 'Module 4 - Nonclinical Study Reports' },
    { id: 'm5', name: 'Module 5 - Clinical Study Reports' },
  ];
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill document name from file name if not already set
      if (!documentName) {
        const nameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
        setDocumentName(nameWithoutExtension);
      }
      // Reset states
      setUploadError(null);
      setUploadSuccess(false);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    // Validation
    if (!documentName.trim()) {
      setUploadError('Please provide a document name');
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadError(null);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', documentName);
      formData.append('description', documentDescription);
      formData.append('documentType', documentType);
      if (ectdModule) {
        formData.append('ectdModule', ectdModule);
      }
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          if (prevProgress >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prevProgress + 5;
        });
      }, 300);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate successful upload
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadSuccess(true);
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete({
          id: `doc-${Date.now()}`,
          name: documentName,
          description: documentDescription,
          documentType,
          ectdModule,
          uploadedBy: 'Current User',
          uploadedDate: new Date().toISOString(),
          file: selectedFile.name
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleCancel = () => {
    setSelectedFile(null);
    setDocumentName('');
    setDocumentDescription('');
    setEctdModule('');
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Upload Document
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {uploadSuccess ? (
        <Box sx={{ mb: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Document uploaded successfully!
          </Alert>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCancel}
          >
            Upload Another Document
          </Button>
        </Box>
      ) : (
        <Box component="form" noValidate autoComplete="off" sx={{ width: '100%' }}>
          {/* File Selection */}
          <Box sx={{ mb: 3 }}>
            <input
              accept=".doc,.docx,.pdf"
              style={{ display: 'none' }}
              id="document-upload-button"
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label htmlFor="document-upload-button">
              <Button 
                variant="outlined" 
                component="span" 
                disabled={uploading}
                sx={{ mr: 2 }}
              >
                Select File
              </Button>
            </label>
            
            {selectedFile && (
              <Typography component="span">
                {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </Typography>
            )}
          </Box>
          
          {/* Document Metadata */}
          <Box sx={{ display: 'grid', gap: 2, mb: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField
              label="Document Name"
              variant="outlined"
              fullWidth
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              required
              disabled={uploading}
            />
            
            <FormControl fullWidth>
              <InputLabel id="document-type-label">Document Type</InputLabel>
              <Select
                labelId="document-type-label"
                value={documentType}
                label="Document Type"
                onChange={(e) => setDocumentType(e.target.value)}
                disabled={uploading}
              >
                <MenuItem value="word">Microsoft Word</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="excel">Microsoft Excel</MenuItem>
                <MenuItem value="powerpoint">Microsoft PowerPoint</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              disabled={uploading}
              sx={{ gridColumn: { xs: '1', sm: '1 / span 2' } }}
            />
            
            <FormControl fullWidth sx={{ gridColumn: { xs: '1', sm: '1 / span 2' } }}>
              <InputLabel id="ectd-module-label">eCTD Module</InputLabel>
              <Select
                labelId="ectd-module-label"
                value={ectdModule}
                label="eCTD Module"
                onChange={(e) => setEctdModule(e.target.value)}
                disabled={uploading}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {ectdModules.map((module) => (
                  <MenuItem key={module.id} value={module.id}>{module.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {/* Upload Progress */}
          {uploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 10, borderRadius: 5 }} />
              <Typography variant="caption" align="center" display="block" sx={{ mt: 1 }}>
                Uploading... {uploadProgress}%
              </Typography>
            </Box>
          )}
          
          {/* Error Message */}
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleCancel} 
              disabled={uploading}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              Upload
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default DocumentUploader;