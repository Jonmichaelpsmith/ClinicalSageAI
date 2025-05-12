import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Search, 
  ArrowUpRight, 
  Loader2, 
  BadgeCheck,
  FileCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getMAUDValidationStatus, 
  submitForMAUDValidation, 
  getAvailableMAUDAlgorithms 
} from '../../services/MAUDService';

/**
 * MAUDIntegrationPanel Component
 * 
 * This component provides an interface for integrating with the MAUD
 * (Medical Algorithm User Database) system for algorithm validation
 * of clinical evaluation reports.
 */
const MAUDIntegrationPanel = ({ documentId = '123456' }) => {
  const [validationStatus, setValidationStatus] = useState(null);
  const [availableAlgorithms, setAvailableAlgorithms] = useState([]);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('status');

  // Load validation status and available algorithms on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statusData, algorithmsData] = await Promise.all([
          getMAUDValidationStatus(documentId),
          getAvailableMAUDAlgorithms()
        ]);
        
        setValidationStatus(statusData);
        setAvailableAlgorithms(algorithmsData);
        
        // Pre-select algorithms that have already been validated
        if (statusData && statusData.algorithmReferences) {
          setSelectedAlgorithms(statusData.algorithmReferences.map(alg => alg.id));
        }
      } catch (error) {
        console.error('Error fetching MAUD data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [documentId]);

  // Handle algorithm selection
  const toggleAlgorithmSelection = (algorithmId) => {
    setSelectedAlgorithms(prevSelected => {
      if (prevSelected.includes(algorithmId)) {
        return prevSelected.filter(id => id !== algorithmId);
      } else {
        return [...prevSelected, algorithmId];
      }
    });
  };

  // Submit for validation
  const handleSubmitForValidation = async () => {
    if (selectedAlgorithms.length === 0) {
      alert('Please select at least one algorithm for validation');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare document data with selected algorithms
      const documentData = {
        documentId,
        selectedAlgorithms,
        timestamp: new Date().toISOString()
      };
      
      const result = await submitForMAUDValidation(documentId, documentData);
      
      // Update UI with result
      setValidationStatus(prev => ({
        ...prev,
        status: 'pending',
        requestId: result.requestId,
        estimatedCompletionTime: result.estimatedCompletionTime
      }));
      
      // Switch to status tab to show results
      setActiveTab('status');
      
    } catch (error) {
      console.error('Error submitting for validation:', error);
      alert('Failed to submit for MAUD validation. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render validation status badge
  const renderStatusBadge = (status) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case 'validated':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Validated
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">
            Unknown
          </Badge>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
        <span>Loading MAUD integration data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-blue-600" />
            <span>MAUD Algorithm Validation</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Medical Algorithm User Database integration for regulatory compliance
          </p>
        </div>
        
        {validationStatus && renderStatusBadge(validationStatus.status)}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="status" className="flex items-center">
            <FileCheck className="w-4 h-4 mr-1.5" />
            Validation Status
          </TabsTrigger>
          <TabsTrigger value="algorithms" className="flex items-center">
            <Search className="w-4 h-4 mr-1.5" />
            Available Algorithms
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="space-y-4">
          {validationStatus ? (
            <>
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-blue-700">MAUD Validation Summary</CardTitle>
                    {validationStatus.status === 'validated' && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-800">
                        <BadgeCheck className="w-3.5 h-3.5 mr-1" />
                        GxP Compliant
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    Validation ID: {validationStatus.validationId || 'N/A'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {validationStatus.status === 'validated' ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white rounded-lg border p-4">
                          <div className="text-sm font-medium text-gray-500 mb-1">Validation Score</div>
                          <div className="text-2xl font-bold text-blue-700">
                            {validationStatus.validationDetails?.validationScore || 'N/A'}%
                          </div>
                        </div>
                        <div className="bg-white rounded-lg border p-4">
                          <div className="text-sm font-medium text-gray-500 mb-1">Last Validated</div>
                          <div className="font-semibold">
                            {new Date(validationStatus.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg border p-4">
                          <div className="text-sm font-medium text-gray-500 mb-1">Validator</div>
                          <div className="font-semibold">
                            {validationStatus.validationDetails?.validatorName || 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-lg mb-2">Validated Algorithms</h3>
                      <div className="space-y-3 mb-4">
                        {validationStatus.algorithmReferences?.map((alg) => (
                          <div key={alg.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                            <div>
                              <div className="font-medium">{alg.name}</div>
                              <div className="text-sm text-gray-600">Version: {alg.version} • Level: {alg.validationLevel}</div>
                            </div>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-800">
                              {alg.complianceStatus}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg border-blue-100 border">
                        <h4 className="font-medium mb-1">Regulatory Frameworks</h4>
                        <div className="flex flex-wrap gap-2">
                          {validationStatus.validationDetails?.regulatoryFrameworks?.map((framework) => (
                            <Badge key={framework} variant="outline" className="bg-white">
                              {framework}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : validationStatus.status === 'pending' ? (
                    <div className="text-center py-6">
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-1">Validation in Progress</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Your document is currently being validated. Estimated completion time:
                        <br />
                        <span className="font-medium">
                          {new Date(validationStatus.estimatedCompletionTime).toLocaleString()}
                        </span>
                      </p>
                      <div className="mt-6">
                        <Button variant="outline" className="text-sm" onClick={() => window.location.reload()}>
                          Refresh Status
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-1">Not Yet Validated</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        This document hasn't been validated with MAUD yet.
                        <br />
                        Go to the Algorithms tab to select and run validations.
                      </p>
                    </div>
                  )}
                </CardContent>
                {validationStatus.status === 'validated' && (
                  <CardFooter className="bg-gray-50 border-t">
                    <Button variant="outline" size="sm" className="ml-auto">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      View Full Report
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium">No Validation Data Available</h3>
              <p className="text-sm text-gray-600 mb-4">
                This document has not been submitted for MAUD validation yet.
              </p>
              <Button onClick={() => setActiveTab('algorithms')}>
                Select Algorithms
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="algorithms" className="space-y-4">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-2">
              <CardTitle className="text-lg text-blue-700">Available Validation Algorithms</CardTitle>
              <CardDescription>
                Select algorithms to validate your clinical evaluation report
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {availableAlgorithms.map((algorithm) => (
                  <div 
                    key={algorithm.id}
                    className={`p-4 border rounded-lg flex items-start justify-between cursor-pointer transition-colors ${
                      selectedAlgorithms.includes(algorithm.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => toggleAlgorithmSelection(algorithm.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium">{algorithm.name}</h4>
                        {selectedAlgorithms.includes(algorithm.id) && (
                          <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Version: {algorithm.version} • Level: {algorithm.validationLevel}
                      </div>
                      <p className="text-sm mt-2">{algorithm.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {algorithm.regulatoryFrameworks.map((framework) => (
                          <Badge key={framework} variant="outline" className="text-xs">
                            {framework}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t flex justify-between">
              <div className="text-sm text-gray-600">
                {selectedAlgorithms.length} algorithm{selectedAlgorithms.length !== 1 ? 's' : ''} selected
              </div>
              <Button 
                onClick={handleSubmitForValidation}
                disabled={isSubmitting || selectedAlgorithms.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Run Validation
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MAUDIntegrationPanel;