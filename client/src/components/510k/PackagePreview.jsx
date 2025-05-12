import React, { useEffect, useState } from 'react';
import { 
  Alert, 
  AlertTitle, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  CheckCircle, 
  Warning, 
  Description, 
  PictureAsPdf, 
  Download, 
  Send,
  InsertDriveFile, 
  VerifiedUser,
  GppBad
} from '@mui/icons-material';
import fda510kService from '../../services/FDA510kService';

/**
 * File Tree Component
 * Displays hierarchical structure of files in the eSTAR package
 */
const FileTree = ({ files }) => {
  if (!files || files.length === 0) {
    return <Typography variant="body2">No files available</Typography>;
  }

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'application/pdf':
        return <PictureAsPdf color="error" />;
      case 'application/xml':
        return <Description color="primary" />;
      case 'text/plain':
        return <InsertDriveFile color="action" />;
      default:
        return <InsertDriveFile />;
    }
  };

  return (
    <List dense component="div">
      {files.map((file, index) => (
        <ListItem key={index}>
          <ListItemIcon>
            {getFileIcon(file.type)}
          </ListItemIcon>
          <ListItemText 
            primary={file.name}
            secondary={`${(file.size / 1024).toFixed(1)} KB`} 
          />
        </ListItem>
      ))}
    </List>
  );
};

/**
 * Signature Status Component
 * Displays digital signature verification status
 */
const SignatureStatus = ({ signatureStatus = { valid: true, message: "Signature valid" } }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2, 
        backgroundColor: signatureStatus.valid ? 'rgba(46, 125, 50, 0.08)' : 'rgba(211, 47, 47, 0.08)',
        borderRadius: 1
      }}
    >
      {signatureStatus.valid ? (
        <VerifiedUser sx={{ color: 'success.main', mr: 2 }} />
      ) : (
        <GppBad sx={{ color: 'error.main', mr: 2 }} />
      )}
      <Box>
        <Typography variant="subtitle2">
          {signatureStatus.valid ? 'Digital Signature Valid' : 'Signature Verification Failed'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {signatureStatus.message}
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * Package Preview Component
 * Main component for previewing and generating eSTAR packages
 */
export default function PackagePreview({ projectId }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [includesCoverLetter, setIncludesCoverLetter] = useState(true);
  const [autoUpload, setAutoUpload] = useState(false);
  const [generatingPackage, setGeneratingPackage] = useState(false);
  const [signatureStatus, setSignatureStatus] = useState({ valid: true, message: "Ready for signing" });
  const [uploadStatus, setUploadStatus] = useState(null);

  // Fetch preview data
  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fda510kService.buildAndPreview(projectId, { 
        includeCoverLetter: includesCoverLetter 
      });
      setPreview(data);
      
      // Fetch signature verification status
      try {
        const sigStatus = await fda510kService.verifyDigitalSignature(projectId);
        setSignatureStatus(sigStatus.verification);
      } catch (sigError) {
        console.error('Error fetching signature status:', sigError);
      }
    } catch (err) {
      console.error('Error previewing package:', err);
      setError(err.message || 'Failed to generate package preview');
    } finally {
      setLoading(false);
    }
  };

  // Generate and download/upload package
  const handleGeneratePackage = async () => {
    setGeneratingPackage(true);
    setError(null);
    
    try {
      const result = await fda510kService.buildAndDownload(projectId, {
        includeCoverLetter: includesCoverLetter,
        autoUpload: autoUpload
      });
      
      if (autoUpload && result.esgStatus) {
        setUploadStatus(result.esgStatus);
      } else if (!autoUpload && result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
    } catch (err) {
      console.error('Error generating package:', err);
      setError(err.message || 'Failed to generate eSTAR package');
    } finally {
      setGeneratingPackage(false);
    }
  };

  // Load preview on initial render and when options change
  useEffect(() => {
    if (projectId) {
      handlePreview();
    }
  }, [projectId, includesCoverLetter]);

  if (loading && !preview) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Preparing eSTAR package preview...</Typography>
      </Box>
    );
  }

  return (
    <Box className="space-y-4">
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            eSTAR Package Assembly & Validation
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={includesCoverLetter}
                  onChange={(e) => setIncludesCoverLetter(e.target.checked)}
                  color="primary"
                />
              }
              label="Include AI-generated Cover Letter"
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={autoUpload}
                  onChange={(e) => setAutoUpload(e.target.checked)}
                  color="primary"
                />
              }
              label="Auto-upload to FDA ESG"
            />
          </Box>
          
          {preview && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Package Contents
              </Typography>
              
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent sx={{ py: 1 }}>
                  <FileTree files={preview.files} />
                </CardContent>
              </Card>
              
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                AI Compliance Analysis
              </Typography>
              
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Box component="pre" sx={{ 
                    p: 2, 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: 1,
                    fontSize: '0.85rem',
                    maxHeight: '300px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {preview.aiComplianceReport}
                  </Box>
                </CardContent>
              </Card>
              
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Digital Signature Verification
              </Typography>
              
              <SignatureStatus signatureStatus={signatureStatus} />
              
              {uploadStatus && (
                <>
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    FDA ESG Submission Status
                  </Typography>
                  
                  <Alert severity={uploadStatus.success ? "success" : "error"}>
                    <AlertTitle>
                      {uploadStatus.success ? "Submission Successful" : "Submission Failed"}
                    </AlertTitle>
                    {uploadStatus.success ? (
                      <Typography variant="body2">
                        Tracking ID: {uploadStatus.trackingId}<br />
                        Submission Date: {new Date(uploadStatus.submissionDate).toLocaleString()}
                      </Typography>
                    ) : (
                      <Typography variant="body2">
                        Error: {uploadStatus.error}
                      </Typography>
                    )}
                  </Alert>
                </>
              )}
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Send />}
                  onClick={() => handlePreview()}
                  disabled={loading || generatingPackage}
                >
                  Refresh Preview
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={autoUpload ? <Send /> : <Download />}
                  onClick={handleGeneratePackage}
                  disabled={loading || generatingPackage}
                >
                  {generatingPackage ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      {autoUpload ? 'Submitting...' : 'Generating...'}
                    </>
                  ) : (
                    autoUpload ? 'Submit to FDA ESG' : 'Download eSTAR Package'
                  )}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}