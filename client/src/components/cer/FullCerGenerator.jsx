import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Zap,
  Loader2,
  DatabaseIcon,
  CheckCircle,
  AlertTriangle,
  FileText,
  RefreshCw,
  Dna
} from 'lucide-react';
import { FaersRiskBadge } from './FaersRiskBadge';

/**
 * Full CER Generator Component
 * 
 * This component provides a comprehensive interface for generating
 * complete Clinical Evaluation Reports with FDA FAERS data integration.
 * It connects to the FDA FAERS API and generates a full report with
 * all required sections using AI.
 */
export default function FullCerGenerator({ onCompletion, thresholds }) {
  const { toast } = useToast();
  const [productName, setProductName] = useState('');
  const [manufacturerName, setManufacturerName] = useState('');
  const [deviceDescription, setDeviceDescription] = useState('');
  const [regulatoryClass, setRegulatoryClass] = useState('');
  const [intendedUse, setIntendedUse] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(null);
  const [faersData, setFaersData] = useState(null);
  const [generatedCer, setGeneratedCer] = useState(null);
  const [activeTab, setActiveTab] = useState('input');
  
  const steps = [
    { id: 'fetching-faers', label: 'Fetching FDA FAERS data', percentStart: 0, percentEnd: 15 },
    { id: 'analyzing-faers', label: 'Analyzing adverse events', percentStart: 15, percentEnd: 30 },
    { id: 'gathering-literature', label: 'Gathering and analyzing literature', percentStart: 30, percentEnd: 45 },
    { id: 'regulatory-analysis', label: 'Applying regulatory frameworks', percentStart: 45, percentEnd: 60 },
    { id: 'generating-sections', label: 'Generating CER sections', percentStart: 60, percentEnd: 85 },
    { id: 'finalizing', label: 'Finalizing CER document', percentStart: 85, percentEnd: 100 },
  ];
  
  // Function to fetch FAERS data from the API
  const fetchFaersData = async () => {
    setCurrentStep('fetching-faers');
    setProgress(5);
    
    try {
      // Build query string for API request
      let queryParams = `productName=${encodeURIComponent(productName)}`;
      if (manufacturerName) queryParams += `&manufacturerName=${encodeURIComponent(manufacturerName)}`;
      
      // Fetch data from FDA FAERS API endpoint
      const response = await fetch(`/api/cer/faers/data?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching FAERS data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFaersData(data);
      setProgress(15);
      
      return data;
    } catch (error) {
      console.error('Error fetching FAERS data:', error);
      toast({
        title: 'FAERS Data Error',
        description: error.message || 'Failed to fetch FDA FAERS data',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Function to analyze FAERS data
  const analyzeFaersData = async (data) => {
    setCurrentStep('analyzing-faers');
    setProgress(20);
    
    try {
      // Fetch analysis from our API
      const response = await fetch('/api/cer/faers/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          faersData: data
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error analyzing FAERS data: ${response.statusText}`);
      }
      
      const analysisData = await response.json();
      setProgress(30);
      
      return analysisData;
    } catch (error) {
      console.error('Error analyzing FAERS data:', error);
      toast({
        title: 'Analysis Error',
        description: error.message || 'Failed to analyze FAERS data',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Function to gather literature data
  const gatherLiteratureData = async () => {
    setCurrentStep('gathering-literature');
    setProgress(35);
    
    try {
      // Fetch literature from API
      const response = await fetch('/api/cer/literature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          deviceDescription,
          intendedUse,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error gathering literature: ${response.statusText}`);
      }
      
      const literatureData = await response.json();
      setProgress(45);
      
      return literatureData;
    } catch (error) {
      console.error('Error gathering literature data:', error);
      toast({
        title: 'Literature Data Error',
        description: error.message || 'Failed to gather literature data',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Function to perform regulatory analysis
  const performRegulatoryAnalysis = async () => {
    setCurrentStep('regulatory-analysis');
    setProgress(50);
    
    try {
      // Fetch regulatory analysis from API
      const response = await fetch('/api/cer/regulatory-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          deviceDescription,
          intendedUse,
          regulatoryClass,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error performing regulatory analysis: ${response.statusText}`);
      }
      
      const regulatoryData = await response.json();
      setProgress(60);
      
      return regulatoryData;
    } catch (error) {
      console.error('Error performing regulatory analysis:', error);
      toast({
        title: 'Regulatory Analysis Error',
        description: error.message || 'Failed to perform regulatory analysis',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Function to generate CER sections
  const generateCerSections = async (faersAnalysis, literatureData, regulatoryData) => {
    setCurrentStep('generating-sections');
    setProgress(70);
    
    try {
      // Generate CER sections from API
      const response = await fetch('/api/cer/generate-full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          manufacturerName,
          deviceDescription,
          intendedUse,
          regulatoryClass,
          faersAnalysis,
          literatureData,
          regulatoryData,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error generating CER sections: ${response.statusText}`);
      }
      
      const sectionsData = await response.json();
      setProgress(85);
      
      return sectionsData;
    } catch (error) {
      console.error('Error generating CER sections:', error);
      toast({
        title: 'Section Generation Error',
        description: error.message || 'Failed to generate CER sections',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Function to finalize the CER document
  const finalizeCerDocument = async (sectionsData) => {
    setCurrentStep('finalizing');
    setProgress(90);
    
    try {
      // Finalize CER document from API
      const response = await fetch('/api/cer/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          manufacturerName,
          sections: sectionsData.sections,
          thresholds: {
            overall: thresholds.OVERALL_THRESHOLD * 100,
            flag: thresholds.FLAG_THRESHOLD * 100
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error finalizing CER document: ${response.statusText}`);
      }
      
      const finalData = await response.json();
      setProgress(100);
      
      return finalData;
    } catch (error) {
      console.error('Error finalizing CER document:', error);
      toast({
        title: 'Finalization Error',
        description: error.message || 'Failed to finalize CER document',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Main function to handle the full CER generation process
  const handleGenerateCER = async () => {
    if (!productName) {
      toast({
        title: 'Missing Information',
        description: 'Product name is required to generate a CER',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    setProgress(0);
    setCurrentStep(null);
    setFaersData(null);
    setGeneratedCer(null);
    
    try {
      // Step 1: Fetch FAERS data
      const faersData = await fetchFaersData();
      
      // Step 2: Analyze FAERS data
      const faersAnalysis = await analyzeFaersData(faersData);
      
      // Step 3: Gather literature data
      const literatureData = await gatherLiteratureData();
      
      // Step 4: Perform regulatory analysis
      const regulatoryData = await performRegulatoryAnalysis();
      
      // Step 5: Generate CER sections
      const sectionsData = await generateCerSections(faersAnalysis, literatureData, regulatoryData);
      
      // Step 6: Finalize CER document
      const finalData = await finalizeCerDocument(sectionsData);
      
      // Set generated CER data
      setGeneratedCer(finalData);
      
      // Switch to results tab
      setActiveTab('results');
      
      toast({
        title: 'CER Generation Complete',
        description: 'Your Clinical Evaluation Report has been successfully generated',
      });
      
      // Call completion handler if provided
      if (onCompletion) {
        onCompletion(finalData);
      }
    } catch (error) {
      console.error('Error generating CER:', error);
      toast({
        title: 'Generation Error',
        description: error.message || 'Failed to generate CER',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to reset the form
  const handleReset = () => {
    setProductName('');
    setManufacturerName('');
    setDeviceDescription('');
    setRegulatoryClass('');
    setIntendedUse('');
    setProgress(0);
    setCurrentStep(null);
    setFaersData(null);
    setGeneratedCer(null);
    setActiveTab('input');
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Dna className="mr-2 h-5 w-5 text-primary" />
          Full CER Generator with FDA FAERS Integration
        </CardTitle>
        <CardDescription>
          Automatically generate a comprehensive Clinical Evaluation Report with FDA FAERS data integration and AI-driven analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="input">
              <FileText className="mr-2 h-4 w-4" />
              Input Data
            </TabsTrigger>
            <TabsTrigger value="progress" disabled={!isSubmitting && !generatedCer}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              Progress {isSubmitting && `(${progress}%)`}
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!generatedCer}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Results
            </TabsTrigger>
          </TabsList>
          
          {/* Input Tab */}
          <TabsContent value="input">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="productName"
                    placeholder="e.g. CardioMonitor Pro 3000"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500">Enter the exact product name as registered with FDA</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="manufacturerName">Manufacturer Name</Label>
                  <Input
                    id="manufacturerName"
                    placeholder="e.g. MedTech Innovations, Inc."
                    value={manufacturerName}
                    onChange={(e) => setManufacturerName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deviceDescription">Device Description</Label>
                <Textarea
                  id="deviceDescription"
                  placeholder="Describe the device including key features, components, and functionality..."
                  value={deviceDescription}
                  onChange={(e) => setDeviceDescription(e.target.value)}
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regulatoryClass">Regulatory Class</Label>
                  <Input
                    id="regulatoryClass"
                    placeholder="e.g. Class IIb (EU MDR)"
                    value={regulatoryClass}
                    onChange={(e) => setRegulatoryClass(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="intendedUse">Intended Use</Label>
                  <Textarea
                    id="intendedUse"
                    placeholder="Describe the intended clinical use of the device..."
                    value={intendedUse}
                    onChange={(e) => setIntendedUse(e.target.value)}
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
                <Button 
                  onClick={handleGenerateCER} 
                  disabled={isSubmitting || !productName}
                  className="bg-blue-700 hover:bg-blue-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate Full CER
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Progress Tab */}
          <TabsContent value="progress">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <Badge variant="outline" className={progress === 100 ? 'bg-green-100 text-green-800' : ''}>
                    {progress}%
                  </Badge>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="space-y-3">
                {steps.map((step) => {
                  let status = 'pending';
                  if (progress >= step.percentEnd) {
                    status = 'completed';
                  } else if (currentStep === step.id) {
                    status = 'active';
                  } else if (progress >= step.percentStart) {
                    status = 'partial';
                  }
                  
                  return (
                    <div 
                      key={step.id} 
                      className={`flex items-center justify-between p-3 rounded-md border ${
                        status === 'completed' ? 'border-green-200 bg-green-50' :
                        status === 'active' ? 'border-blue-200 bg-blue-50' :
                        status === 'partial' ? 'border-amber-200 bg-amber-50' :
                        'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        {status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        ) : status === 'active' ? (
                          <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-3" />
                        ) : status === 'partial' ? (
                          <AlertTriangle className="h-5 w-5 text-amber-600 mr-3" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300 mr-3" />
                        )}
                        <span className={`${
                          status === 'completed' ? 'text-green-800' :
                          status === 'active' ? 'text-blue-800 font-medium' :
                          status === 'partial' ? 'text-amber-800' :
                          'text-gray-500'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                      
                      {status === 'completed' && (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Complete
                        </Badge>
                      )}
                      
                      {status === 'active' && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          In Progress
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {faersData && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">FDA FAERS Data Retrieved</CardTitle>
                    <CardDescription>
                      Adverse event data successfully fetched from FDA FAERS database
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col p-3 border rounded-md">
                        <span className="text-sm text-gray-500">Product</span>
                        <span className="text-lg font-medium">{faersData.productName}</span>
                      </div>
                      
                      <div className="flex flex-col p-3 border rounded-md">
                        <span className="text-sm text-gray-500">Total Reports</span>
                        <span className="text-lg font-medium">{faersData.totalReports}</span>
                      </div>
                      
                      <div className="flex flex-col p-3 border rounded-md">
                        <span className="text-sm text-gray-500">Risk Assessment</span>
                        <div className="flex items-center">
                          <span className="text-lg font-medium mr-2">{faersData.severityAssessment}</span>
                          <FaersRiskBadge 
                            severity={faersData.severityAssessment}
                            score={faersData.riskScore}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Results Tab */}
          <TabsContent value="results">
            {generatedCer ? (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-green-800">CER Generation Complete</h3>
                    <p className="text-sm text-green-700">
                      Your Clinical Evaluation Report has been successfully generated with FDA FAERS integration
                    </p>
                  </div>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{generatedCer.title || `Clinical Evaluation Report: ${productName}`}</CardTitle>
                    <CardDescription>
                      Generated at {new Date().toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-3 border rounded-md">
                        <h4 className="text-sm font-medium mb-1">Section Count</h4>
                        <p className="text-2xl font-bold">{generatedCer.sectionCount || generatedCer.sections?.length || 0}</p>
                      </div>
                      
                      <div className="p-3 border rounded-md">
                        <h4 className="text-sm font-medium mb-1">Compliance Score</h4>
                        <div className="flex items-center">
                          <p className="text-2xl font-bold mr-2">
                            {Math.round(generatedCer.complianceScore * 100)}%
                          </p>
                          <Badge 
                            className={`${
                              generatedCer.complianceScore >= thresholds.OVERALL_THRESHOLD ? 'bg-green-100 text-green-800' : 
                              generatedCer.complianceScore >= thresholds.FLAG_THRESHOLD ? 'bg-amber-100 text-amber-800' : 
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {generatedCer.complianceScore >= thresholds.OVERALL_THRESHOLD ? 'Compliant' : 'Needs Review'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium mb-2">Generated Sections</h3>
                      <div className="space-y-3">
                        {generatedCer.sections?.map((section, index) => (
                          <div key={index} className="p-3 border rounded-md">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="font-medium">{section.title}</h4>
                              <Badge 
                                variant="outline"
                                className={`${
                                  section.complianceScore >= thresholds.OVERALL_THRESHOLD ? 'bg-green-100 text-green-800' : 
                                  section.complianceScore >= thresholds.FLAG_THRESHOLD ? 'bg-amber-100 text-amber-800' : 
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                {Math.round(section.complianceScore * 100)}%
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {section.content.substring(0, 100)}...
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleReset}>
                      Create New CER
                    </Button>
                    <Button onClick={() => setActiveTab('input')}>
                      Edit This CER
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <div className="py-8 text-center">
                <DatabaseIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No CER Generated Yet</h3>
                <p className="text-gray-500 mb-4">
                  Generate a CER by filling out the form in the Input tab and clicking Generate.
                </p>
                <Button onClick={() => setActiveTab('input')}>
                  Go to Input Form
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}