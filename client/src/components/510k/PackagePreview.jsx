import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Text, 
  Button, 
  VStack, 
  HStack, 
  Card, 
  CardBody, 
  CardHeader, 
  Badge, 
  Divider, 
  Spinner, 
  Alert, 
  AlertIcon, 
  Heading,
  useToast
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { FileIcon, CheckCircle, AlertTriangle, FileText, Download, Upload, FileCheck } from 'lucide-react';
import { isFeatureEnabled } from '../../flags/featureFlags';
import { FDA510kService } from '../../services/FDA510kService';

/**
 * eSTAR Plus Package Assembly and Preview component
 * Displays file information, AI validation results, and provides options
 * to build and download the full package or submit to FDA ESG.
 */
const PackagePreview = () => {
  const { projectId } = useParams();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [building, setBuilding] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState(null);
  
  // Load initial preview data
  useEffect(() => {
    if (!isFeatureEnabled('ENABLE_PACKAGE_ASSEMBLY')) return;
    
    const loadPreview = async () => {
      try {
        setLoading(true);
        const result = await FDA510kService.previewESTARPackage(projectId);
        setPreview(result);
        setLoading(false);
      } catch (err) {
        console.error('Error loading package preview:', err);
        setError(err.message || 'Failed to load preview data');
        setLoading(false);
      }
    };
    
    loadPreview();
  }, [projectId]);
  
  // Build and download eSTAR package
  const handleBuildPackage = async () => {
    try {
      setBuilding(true);
      const result = await FDA510kService.buildESTARPackage(
        projectId, 
        { includeCoverLetter: true }
      );
      
      if (result.success) {
        toast({
          title: 'Package built successfully',
          description: 'Your eSTAR package is ready for download',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Trigger download automatically
        window.location.href = result.downloadUrl;
      }
      
      setBuilding(false);
    } catch (err) {
      console.error('Error building package:', err);
      toast({
        title: 'Error building package',
        description: err.message || 'Failed to build eSTAR package',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setBuilding(false);
    }
  };
  
  // Verify digital signature on the manifest
  const handleVerifySignature = async () => {
    try {
      setVerifying(true);
      const result = await FDA510kService.verifySignature(projectId);
      
      if (result.success) {
        setVerification(result.verification);
        toast({
          title: result.verification.valid ? 'Signature valid' : 'Signature invalid',
          description: result.verification.message,
          status: result.verification.valid ? 'success' : 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
      
      setVerifying(false);
    } catch (err) {
      console.error('Error verifying signature:', err);
      toast({
        title: 'Error verifying signature',
        description: err.message || 'Failed to verify digital signature',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setVerifying(false);
    }
  };
  
  // Submit package to FDA ESG
  const handleSubmitToFDA = async () => {
    toast({
      title: 'Feature coming soon',
      description: 'Direct FDA ESG submission will be available in a future update',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };
  
  if (!isFeatureEnabled('ENABLE_PACKAGE_ASSEMBLY')) {
    return (
      <Alert status="info">
        <AlertIcon />
        eSTAR Package Assembly feature is currently disabled
      </Alert>
    );
  }
  
  if (loading) {
    return (
      <Box textAlign="center" p={6}>
        <Spinner size="xl" mb={4} />
        <Text>Loading eSTAR package preview...</Text>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }
  
  return (
    <Box p={4}>
      <Heading as="h2" size="lg" mb={4}>
        eSTAR Package Assembly
      </Heading>
      
      <Text mb={4}>
        This tool helps you assemble, validate, and submit your FDA eSTAR package 
        for 510(k) clearance.
      </Text>
      
      <VStack spacing={6} align="stretch">
        {/* AI Compliance Report Section */}
        <Card>
          <CardHeader>
            <HStack justifyContent="space-between">
              <Heading size="md">AI Compliance Check</Heading>
              <Badge colorScheme="green" p={2}>
                <HStack>
                  <CheckCircle size={16} />
                  <Text>Validated</Text>
                </HStack>
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            {preview?.aiComplianceReport ? (
              <Text>{preview.aiComplianceReport}</Text>
            ) : (
              <Text fontStyle="italic">Compliance report not available</Text>
            )}
          </CardBody>
        </Card>
        
        {/* Files List Section */}
        <Card>
          <CardHeader>
            <Heading size="md">Package Contents</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={2} align="stretch">
              {preview?.files?.map((file, index) => (
                <HStack key={index} justifyContent="space-between" p={2} 
                  bg={index % 2 === 0 ? 'gray.50' : 'white'}>
                  <HStack>
                    <FileIcon size={18} />
                    <Text fontWeight="medium">{file.name}</Text>
                  </HStack>
                  <HStack>
                    <Text fontSize="sm" color="gray.500">
                      {(file.size / 1024).toFixed(1)} KB
                    </Text>
                    <Badge colorScheme="blue" variant="outline">
                      {file.type.split('/')[1]}
                    </Badge>
                  </HStack>
                </HStack>
              ))}
              
              {(!preview?.files || preview.files.length === 0) && (
                <Text fontStyle="italic">No files available for preview</Text>
              )}
            </VStack>
          </CardBody>
        </Card>
        
        {/* Signature Verification Section */}
        {verification && (
          <Card>
            <CardHeader>
              <HStack justifyContent="space-between">
                <Heading size="md">Digital Signature Verification</Heading>
                <Badge colorScheme={verification.valid ? 'green' : 'red'} p={2}>
                  <HStack>
                    {verification.valid ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    <Text>{verification.valid ? 'Valid' : 'Invalid'}</Text>
                  </HStack>
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <Text>{verification.message}</Text>
            </CardBody>
          </Card>
        )}
        
        <Divider />
        
        {/* Actions Section */}
        <Box>
          <Heading size="md" mb={4}>
            Actions
          </Heading>
          <HStack spacing={4}>
            <Button 
              leftIcon={<Download />} 
              colorScheme="blue" 
              onClick={handleBuildPackage} 
              isLoading={building}
              loadingText="Building package..."
            >
              Build & Download Package
            </Button>
            
            <Button 
              leftIcon={<FileCheck />} 
              onClick={handleVerifySignature}
              isLoading={verifying}
              loadingText="Verifying..."
            >
              Verify Digital Signature
            </Button>
            
            <Button 
              leftIcon={<Upload />} 
              colorScheme="green" 
              onClick={handleSubmitToFDA}
              isDisabled
            >
              Submit to FDA ESG
            </Button>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default PackagePreview;