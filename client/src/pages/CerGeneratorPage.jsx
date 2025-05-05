import React, { useState, useEffect } from 'react';
import CerProgressDashboard from '../components/cer/CerProgressDashboard';
import { FaersReportDisplay } from '../components/cer/FaersReportDisplay';
import { FaersDemographicsCharts } from '../components/cer/FaersDemographicsCharts';
import { FaersReportExporter } from '../components/cer/FaersReportExporter';
import { FaersComparativeChart } from '../components/cer/FaersComparativeChart';
import { CerPreviewPanel } from '../components/cer/CerPreviewPanel';
import { AiSectionGenerator } from '../components/cer/AiSectionGenerator';
import { CerBuilderPanel } from '../components/cer/CerBuilderPanel';
import { useFetchFAERS } from '../hooks/useFetchFAERS';
import { useExportFAERS } from '../hooks/useExportFAERS';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { FileUpload, Search, FileCheck, BookOpen, Brain, Shield, BarChart4, Settings, AlertCircle, Database, Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { toast } from '../ui/use-toast';

const CerGeneratorPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [templateSelection, setTemplateSelection] = useState('eu-mdr-full');
  const [literatureCount, setLiteratureCount] = useState(42);
  const [aiEnhancementEnabled, setAiEnhancementEnabled] = useState(true);
  const [fdaDataEnabled, setFdaDataEnabled] = useState(true);
  const [isLiteratureSearching, setIsLiteratureSearching] = useState(false);
  const [isFdaDataSearching, setIsFdaDataSearching] = useState(false);
  
  // Template list
  const templates = [
    {
      id: 'eu-mdr-full',
      name: 'EU MDR 2017/745 Full Template',
      description: 'Complete template for EU MDR 2017/745 compliance',
      regulatoryFramework: 'EU MDR',
      sectionCount: 14,
    },
    {
      id: 'meddev-rev4',
      name: 'MEDDEV 2.7/1 Rev 4 Template',
      description: 'Template following MEDDEV 2.7/1 Rev 4 guidelines',
      regulatoryFramework: 'MEDDEV',
      sectionCount: 12,
    },
    {
      id: 'fda-510k',
      name: 'FDA 510(k) Template',
      description: 'Template for FDA 510(k) clinical evaluation',
      regulatoryFramework: 'FDA',
      sectionCount: 10,
    }
  ];

  // Simulate literature search
  const handleLiteratureSearch = () => {
    setIsLiteratureSearching(true);
    setTimeout(() => {
      setLiteratureCount(Math.floor(Math.random() * 30) + 30);
      setIsLiteratureSearching(false);
    }, 2500);
  };

  // FAERS integration states
  const [productName, setProductName] = useState('CardioMonitor Pro 3000');
  const [cerId, setCerId] = useState('cer-' + Math.random().toString(36).substring(2, 10));
  const [showFaersDialog, setShowFaersDialog] = useState(false);
  const [selectedFaersTab, setSelectedFaersTab] = useState('reports');
  
  // Use custom hooks for FAERS functionality
  const { fetchFAERS, isLoading: isFaersLoading, data: faersData, error: faersError } = useFetchFAERS();
  const { exportToPDF, exportToWord, integrateWithCER, exporting, exportError } = useExportFAERS();
  
  // FDA/FAERS data search handler
  const handleFdaDataSearch = () => {
    setIsFdaDataSearching(true);
    
    // Get device name from input field
    const deviceNameInput = document.getElementById('deviceName');
    const currentDeviceName = deviceNameInput ? deviceNameInput.value : productName;
    setProductName(currentDeviceName);
    
    // Fetch FAERS data
    fetchFAERS({ productName: currentDeviceName, cerId });
    
    // Show the FAERS dialog after a short delay
    setTimeout(() => {
      setIsFdaDataSearching(false);
      setShowFaersDialog(true);
    }, 1200);
  };
  
  // Handle export completion
  const handleExportCompleted = (result) => {
    console.log('Export completed:', result);
    toast({
      title: 'Export Complete',
      description: result.message || `Export completed successfully as ${result.format.toUpperCase()}`,
      variant: result.success ? 'default' : 'destructive',
    });
  };
  
  // Handle AI section generation
  const handleSectionGenerated = (sectionData) => {
    console.log('Section generated:', sectionData);
    toast({
      title: 'Section Generated',
      description: `${sectionData.sectionType} section was generated successfully`,
    });
  };
  
  // FAERS modal content based on selected tab
  const renderFaersModalContent = () => {
    if (!faersData) {
      return (
        <div className="flex flex-col items-center justify-center p-12">
          <p className="text-gray-500 mb-4">No FAERS data available. Please search for a product first.</p>
        </div>
      );
    }
    
    // Render different content based on selected tab
    switch (selectedFaersTab) {
      case 'reports':
        return <FaersReportDisplay faersData={faersData} />;
      case 'charts':
        return <FaersDemographicsCharts faersData={faersData} />;
      case 'comparisons':
        return <FaersComparativeChart productName={productName} faersData={faersData} />;
      default:
        return <FaersReportDisplay faersData={faersData} />;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-1">CER Generator</h1>
            <p className="text-gray-600">AI-powered Clinical Evaluation Report generator with automated workflows</p>
          </div>
          <div>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/cerv2/info'}
              className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
            >
              <Brain className="h-4 w-4 mr-2" /> Learn More About CER Generator
            </Button>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Brain className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Create a Clinical Evaluation Report in 3 Simple Steps</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Enter your device information in the AI Generator tab</li>
                  <li>Enable FDA adverse event data and literature search</li>
                  <li>Click "Generate CER" to create your report</li>
                </ol>
              </div>
              <div className="mt-3 flex space-x-3">
                <Button 
                  onClick={() => {
                    setActiveTab('generator');
                    setTimeout(() => {
                      const element = document.getElementById('generate-cer-button');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Brain className="h-4 w-4 mr-2" /> Start Creating Now
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/cerv2/info'}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="dashboard" className="flex items-center">
            <BarChart4 className="h-4 w-4 mr-2" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center">
            <Brain className="h-4 w-4 mr-2" /> CER Builder
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" /> Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <CerProgressDashboard />
        </TabsContent>
        
        <TabsContent value="generator" className="space-y-4">
          {/* New CerBuilderPanel Component - comprehensive UI for building CERs */}
          <CerBuilderPanel faersData={faersData} productName={productName} />
          
          {/* Old UI - Kept for reference and backward compatibility */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{display: 'none'}}>
            {/* Device Information */}
            <Card>
              <CardHeader>
                <CardTitle>Device Information</CardTitle>
                <CardDescription>Enter the details of your medical device</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceName">Device Name</Label>
                  <Input id="deviceName" placeholder="e.g. CardioMonitor Pro 3000" defaultValue="CardioMonitor Pro 3000" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deviceType">Device Type</Label>
                  <Select defaultValue="monitoring">
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monitoring">Patient Monitoring Device</SelectItem>
                      <SelectItem value="implantable">Implantable Device</SelectItem>
                      <SelectItem value="diagnostic">Diagnostic Equipment</SelectItem>
                      <SelectItem value="therapeutic">Therapeutic Device</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="classification">Device Classification</Label>
                  <Select defaultValue="iia">
                    <SelectTrigger>
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="i">Class I</SelectItem>
                      <SelectItem value="iia">Class IIa</SelectItem>
                      <SelectItem value="iib">Class IIb</SelectItem>
                      <SelectItem value="iii">Class III</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input id="manufacturer" placeholder="e.g. MedTech Innovations, Inc." defaultValue="MedTech Innovations, Inc." />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="intendedUse">Intended Use</Label>
                  <Textarea id="intendedUse" placeholder="Describe the intended use of the device" 
                    defaultValue="Continuous monitoring of cardiac activity, blood pressure, and oxygen saturation in clinical settings." />
                </div>
              </CardContent>
            </Card>

            {/* Literature Data */}
            <Card>
              <CardHeader>
                <CardTitle>Literature Evidence</CardTitle>
                <CardDescription>Manage clinical literature for your report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium">Literature Search</h3>
                    <p className="text-xs text-gray-500">Find relevant clinical literature</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLiteratureSearch} disabled={isLiteratureSearching}>
                    {isLiteratureSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <div>
                    <h3 className="text-sm font-medium">AI Literature Analysis</h3>
                    <p className="text-xs text-gray-500">Automatically analyze and extract key findings</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="literature-ai" className="sr-only">Enable AI Analysis</Label>
                    <Switch id="literature-ai" checked={aiEnhancementEnabled} onCheckedChange={setAiEnhancementEnabled} />
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <h3 className="text-sm font-medium mb-2">Found Literature</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm">{literatureCount} articles found</span>
                      </div>
                      <Badge variant="blue" className="text-xs">PubMed</Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {literatureCount > 0 ? (
                        <span>Most recent: "Long-term outcomes of cardiac monitoring devices in clinical settings"</span>
                      ) : (
                        <span>No articles found. Try adjusting your search terms.</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <h3 className="text-sm font-medium mb-2">Upload Additional Documents</h3>
                  <div className="border-2 border-dashed border-gray-200 rounded-md p-4 text-center">
                    <FileUpload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500">Drag & drop files or click to browse</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FDA Data and Generation Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Regulatory Data</CardTitle>
                <CardDescription>Additional data sources and generation settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium">FDA Adverse Events</h3>
                    <p className="text-xs text-gray-500">Include adverse event data from FDA MAUDE</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="fda-data" checked={fdaDataEnabled} onCheckedChange={setFdaDataEnabled} />
                  </div>
                </div>
                
                {fdaDataEnabled && (
                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <h3 className="text-sm font-medium">FDA Data Search</h3>
                      <p className="text-xs text-gray-500">Find relevant adverse events</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleFdaDataSearch} disabled={isFdaDataSearching}>
                      {isFdaDataSearching ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <div>
                    <h3 className="text-sm font-medium">AI Section Generation</h3>
                    <p className="text-xs text-gray-500">Create regulatory-compliant CER sections with GPT-4o</p>
                  </div>
                  <AiSectionGenerator onSectionGenerated={handleSectionGenerated} />
                </div>
                
                <div className="pt-2 border-t">
                  <h3 className="text-sm font-medium mb-2">CER Template</h3>
                  <Select value={templateSelection} onValueChange={setTemplateSelection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-xs text-gray-500">
                    {templates.find(t => t.id === templateSelection)?.description}
                  </p>
                </div>
                
                <div className="pt-2 border-t">
                  <h3 className="text-sm font-medium mb-2">AI Enhancement Level</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant={aiEnhancementEnabled ? "default" : "outline"} size="sm" className="w-full" onClick={() => setAiEnhancementEnabled(true)}>Full AI</Button>
                    <Button variant={!aiEnhancementEnabled ? "default" : "outline"} size="sm" className="w-full" onClick={() => setAiEnhancementEnabled(false)}>Basic</Button>
                    <Button variant="outline" size="sm" className="w-full">Custom</Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    id="generate-cer-button"
                    className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold shadow-lg"
                    onClick={() => {
                      // Simulate report generation with a loading state
                      const deviceName = document.getElementById('deviceName')?.value || 'CardioMonitor Pro 3000';
                      const template = templates.find(t => t.id === templateSelection);
                      
                      // Show a success dialog or redirect to a PDF view component
                      alert(`Starting CER generation for ${deviceName} using ${template?.name}. Your report will be available shortly.`);
                      
                      // In production, this would trigger the actual report generation process
                      // and then direct the user to the generated PDF
                    }}
                  >
                    <Brain className="h-5 w-5 mr-2" /> Generate CER Report
                  </Button>
                  <p className="mt-2 text-xs text-center text-gray-500">Report will be generated and added to your dashboard</p>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-gray-500">
                Using GPT-4o for enhanced content generation
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className={templateSelection === template.id ? 'border-2 border-blue-500' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{template.name}</CardTitle>
                    {templateSelection === template.id && (
                      <Badge className="bg-blue-500">Selected</Badge>
                    )}
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Framework:</span>
                      <span className="text-sm font-medium">{template.regulatoryFramework}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Sections:</span>
                      <span className="text-sm font-medium">{template.sectionCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">AI Enhanced:</span>
                      <span className="text-sm font-medium">Yes</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    variant={templateSelection === template.id ? "outline" : "default"}
                    size="sm"
                    onClick={() => setTemplateSelection(template.id)}
                  >
                    {templateSelection === template.id ? 'Selected' : 'Select'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Generation Settings</CardTitle>
              <CardDescription>Configure the AI-powered generation process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <div>
                  <h3 className="text-sm font-medium">AI Model</h3>
                  <p className="text-xs text-gray-500">Select the AI model to use for generation</p>
                </div>
                <Select defaultValue="gpt4o">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt4o">GPT-4o</SelectItem>
                    <SelectItem value="claude">Claude 3 Opus</SelectItem>
                    <SelectItem value="mixtral">Mixtral 8x7B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <h3 className="text-sm font-medium">Citations Style</h3>
                  <p className="text-xs text-gray-500">Format for citations in the report</p>
                </div>
                <Select defaultValue="vancouver">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select citation style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vancouver">Vancouver</SelectItem>
                    <SelectItem value="apa">APA</SelectItem>
                    <SelectItem value="mla">MLA</SelectItem>
                    <SelectItem value="harvard">Harvard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <h3 className="text-sm font-medium">Automatic Refinement</h3>
                  <p className="text-xs text-gray-500">AI will automatically refine generated sections</p>
                </div>
                <Switch id="auto-refinement" defaultChecked />
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <h3 className="text-sm font-medium">Regulatory Focus</h3>
                  <p className="text-xs text-gray-500">Primary regulatory framework focus</p>
                </div>
                <Select defaultValue="eu-mdr">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eu-mdr">EU MDR</SelectItem>
                    <SelectItem value="fda">FDA</SelectItem>
                    <SelectItem value="meddev">MEDDEV</SelectItem>
                    <SelectItem value="multi">Multi-regional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <h3 className="text-sm font-medium">Export Format</h3>
                  <p className="text-xs text-gray-500">Default file format for exports</p>
                </div>
                <Select defaultValue="pdf">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="docx">DOCX</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Save Settings</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
              <CardDescription>Configure external data source connections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <div>
                  <h3 className="text-sm font-medium">PubMed API</h3>
                  <p className="text-xs text-gray-500">Connected and working properly</p>
                </div>
                <Badge className="bg-green-500">Active</Badge>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <h3 className="text-sm font-medium">FDA MAUDE Database</h3>
                  <p className="text-xs text-gray-500">Connected and working properly</p>
                </div>
                <Badge className="bg-green-500">Active</Badge>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <h3 className="text-sm font-medium">EUDAMED Connection</h3>
                  <p className="text-xs text-gray-500">API key configuration required</p>
                </div>
                <Badge className="bg-yellow-500">Setup Required</Badge>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <h3 className="text-sm font-medium">OpenAI API</h3>
                  <p className="text-xs text-gray-500">Connected and working properly</p>
                </div>
                <Badge className="bg-green-500">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* CER Preview Panel - shown when FAERS data is available */}
      {faersData && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Clinical Evaluation Report Preview</h2>
            <Button variant="outline" onClick={() => setShowFaersDialog(true)}>
              View FAERS Data
            </Button>
          </div>
          <CerPreviewPanel 
            productName={productName}
            faersData={faersData}
            onExport={handleExportCompleted}
          />
        </div>
      )}
      
      {/* FAERS Data Dialog */}
      <Dialog open={showFaersDialog} onOpenChange={setShowFaersDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              FDA FAERS Data for {productName}
            </DialogTitle>
            <DialogDescription>
              Adverse event data from the FDA Adverse Event Reporting System
            </DialogDescription>
          </DialogHeader>
          
          {/* FAERS Dialog Content */}
          <div className="mt-4">
            <Tabs value={selectedFaersTab} onValueChange={setSelectedFaersTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="reports" className="flex items-center justify-center">
                  <Database className="h-4 w-4 mr-2" /> Reports
                </TabsTrigger>
                <TabsTrigger value="charts" className="flex items-center justify-center">
                  <BarChart4 className="h-4 w-4 mr-2" /> Charts
                </TabsTrigger>
                <TabsTrigger value="comparisons" className="flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 mr-2" /> Comparative Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedFaersTab} className="mt-4">
                {isFaersLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                      <p className="text-gray-500">Loading FAERS data...</p>
                    </div>
                  </div>
                ) : faersError ? (
                  <div className="p-4 rounded-md bg-red-50 text-red-700 mb-4">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <h4 className="text-sm font-medium">Error loading FAERS data</h4>
                    </div>
                    <p className="text-sm">{faersError.toString()}</p>
                  </div>
                ) : (
                  renderFaersModalContent()
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Export Actions */}
          <div className="mt-6 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Export & Integration Options</h4>
                <p className="text-xs text-gray-500">Include FAERS data in your CER</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => exportToPDF(faersData, productName)}
                  disabled={exporting || !faersData}>
                  Export to PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportToWord(faersData, productName)}
                  disabled={exporting || !faersData}>
                  Export to Word
                </Button>
                <Button onClick={() => {
                  integrateWithCER(faersData, cerId, productName);
                  setShowFaersDialog(false);
                }} disabled={exporting || !faersData}>
                  Add to CER
                </Button>
              </div>
            </div>
            {exporting && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                <span>Preparing export...</span>
              </div>
            )}
            {exportError && (
              <div className="text-sm text-red-500">{exportError.toString()}</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CerGeneratorPage;