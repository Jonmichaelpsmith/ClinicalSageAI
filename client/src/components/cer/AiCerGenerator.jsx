import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Database, BookOpen, FileText, MessageSquare, UploadCloud, ClipboardCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function AiCerGenerator({ onSectionGenerated, onFullReportGenerated }) {
  const { toast } = useToast();
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [activeTab, setActiveTab] = useState('metadata');
  const [regulatory, setRegulatory] = useState('eu-mdr');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [queryText, setQueryText] = useState('');
  const [faersData, setFaersData] = useState(null);
  const [isFetchingFaers, setIsFetchingFaers] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [aiInsights, setAiInsights] = useState([]);
  const [currentSection, setCurrentSection] = useState(null);
  
  // Device types based on regulatory path
  const deviceTypes = {
    'eu-mdr': [
      { id: 'class1', label: 'Class I (non-sterile, non-measuring)' },
      { id: 'class1s', label: 'Class I (sterile)' },
      { id: 'class1m', label: 'Class I (measuring function)' },
      { id: 'class2a', label: 'Class IIa' },
      { id: 'class2b', label: 'Class IIb' },
      { id: 'class3', label: 'Class III' },
    ],
    'iso-14155': [
      { id: 'diagnostic', label: 'Diagnostic Device' },
      { id: 'therapeutic', label: 'Therapeutic Device' },
      { id: 'monitoring', label: 'Monitoring Device' },
      { id: 'combination', label: 'Combination Device' },
    ],
    'fda': [
      { id: 'class1-510k-exempt', label: 'Class I (510(k) Exempt)' },
      { id: 'class1-510k', label: 'Class I (510(k))' },
      { id: 'class2-510k', label: 'Class II (510(k))' },
      { id: 'class2-de-novo', label: 'Class II (De Novo)' },
      { id: 'class3-pma', label: 'Class III (PMA)' },
    ],
  };
  
  // Sections needed based on regulatory path
  const requiredSections = {
    'eu-mdr': [
      'Device Description', 
      'Intended Purpose', 
      'State of the Art', 
      'Clinical Data Analysis',
      'Post-Market Surveillance',
      'Literature Review',
      'Benefit-Risk Analysis',
      'Conclusion'
    ],
    'iso-14155': [
      'Trial Design', 
      'Patient Selection', 
      'Risk Assessment', 
      'Device Description',
      'Safety Monitoring',
      'Endpoint Analysis',
      'Statistical Methods'
    ],
    'fda': [
      'Device Description', 
      'Indications for Use', 
      'Technological Characteristics', 
      'Performance Data',
      'Safety and Effectiveness',
      'Substantial Equivalence',
      'Conclusion'
    ],
  };

  // Reset device type when regulatory path changes
  useEffect(() => {
    setDeviceType('');
  }, [regulatory]);

  // Simulate fetching FDA FAERS data
  const fetchFaersData = async () => {
    if (!deviceName) {
      toast({
        title: "Device name required",
        description: "Please enter a device name to fetch safety data",
        variant: "destructive"
      });
      return;
    }
    
    setIsFetchingFaers(true);
    
    try {
      // In a real implementation, we would call the API endpoint
      // const response = await fetch(`/api/cer/faers/analysis?productName=${encodeURIComponent(deviceName)}`);
      // const data = await response.json();
      
      // For demo purposes, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulated data
      setFaersData({
        summary: {
          totalReports: Math.floor(Math.random() * 200) + 10,
          seriousEvents: Math.floor(Math.random() * 30) + 2,
          eventsPerTenThousand: (Math.random() * 5).toFixed(2),
          severityAssessment: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)]
        },
        topEvents: [
          { event: 'Device malfunction', count: Math.floor(Math.random() * 30) + 5 },
          { event: 'Local inflammation', count: Math.floor(Math.random() * 20) + 3 },
          { event: 'Pain at site', count: Math.floor(Math.random() * 15) + 2 }
        ],
        conclusion: `Based on FAERS data analysis, ${deviceName} shows a ${['favorable', 'typical', 'concerning'][Math.floor(Math.random() * 3)]} safety profile compared to similar devices.`
      });
      
      setAiInsights(prevInsights => [
        ...prevInsights,
        {
          type: 'faers',
          title: 'FAERS Data Analysis',
          content: `Analyzed ${Math.floor(Math.random() * 200) + 10} adverse event reports for ${deviceName}. Risk profile is ${['low', 'moderate', 'elevated'][Math.floor(Math.random() * 3)]}.`
        }
      ]);
      
      toast({
        title: "FAERS data retrieved",
        description: "Safety data has been analyzed and will be incorporated into your CER"
      });
    } catch (error) {
      console.error('Error fetching FAERS data:', error);
      toast({
        title: "Failed to retrieve safety data",
        description: error.message || "An error occurred while fetching FDA data",
        variant: "destructive"
      });
    } finally {
      setIsFetchingFaers(false);
    }
  };

  // Simulate generating a section using AI
  const generateSection = async (sectionName) => {
    if (!deviceName || !deviceType) {
      toast({
        title: "Missing information",
        description: "Please provide device name and type before generating sections",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setCurrentSection(sectionName);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          const next = prev + (Math.random() * 15);
          return next > 90 ? 90 : next;
        });
      }, 600);
      
      // In a real implementation, we would call the API endpoint
      // const response = await fetch('/api/cer/generate-section', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     section: sectionName,
      //     deviceName,
      //     deviceType,
      //     regulatoryPath: regulatory,
      //     faersData: faersData?.summary
      //   })
      // });
      // const data = await response.json();
      
      // For demo purposes, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      // Simulated generated section
      const generatedContent = `# ${sectionName}

${sectionName} for ${deviceName}, a ${getDeviceTypeLabel()} medical device ${getRegPathDescription()}.

This section contains AI-generated content that would analyze all available evidence, clinical data, and regulatory requirements to provide a comprehensive evaluation according to ${getRegLabel()} standards.

${faersData ? `FAERS safety data shows ${faersData.summary.totalReports} reported events, with ${faersData.summary.seriousEvents} classified as serious. The overall risk profile is ${faersData.summary.severityAssessment.toLowerCase()}.` : ''}

Further detailed analysis would be included here based on the device specifications, intended use, and performance data provided.`;
      
      const newSection = {
        title: sectionName,
        content: generatedContent,
        timestamp: new Date().toISOString(),
        regulatoryPath: regulatory
      };
      
      // Add to AI insights
      setAiInsights(prevInsights => [
        ...prevInsights,
        {
          type: 'section',
          title: `Generated ${sectionName}`,
          content: `Created ${sectionName} section for ${deviceName} using ${getRegLabel()} framework.`
        }
      ]);
      
      // Call parent handler
      if (onSectionGenerated) {
        onSectionGenerated(newSection);
      }
      
      toast({
        title: "Section generated",
        description: `${sectionName} has been generated and added to your report`
      });
    } catch (error) {
      console.error('Error generating section:', error);
      toast({
        title: "Failed to generate section",
        description: error.message || "An error occurred during AI generation",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setCurrentSection(null);
      setGenerationProgress(0);
    }
  };

  // Simulate generating a full CER report
  const generateFullReport = async () => {
    if (!deviceName || !deviceType) {
      toast({
        title: "Missing information",
        description: "Please provide device name and type before generating a full report",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Simulate progress updates for the full report
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += (Math.random() * 5);
        setGenerationProgress(progress > 95 ? 95 : progress);
      }, 800);
      
      // In a real implementation, we would call the API endpoint
      // const response = await fetch('/api/cer/generate-full', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     deviceName,
      //     deviceType,
      //     regulatoryPath: regulatory,
      //     faersData: faersData?.summary,
      //     uploadedFiles: uploadedFiles.map(f => f.name)
      //   })
      // });
      // const data = await response.json();
      
      // For demo purposes, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      // Generate sections for each required section
      const sections = requiredSections[regulatory].map(sectionName => ({
        title: sectionName,
        content: `# ${sectionName}

${sectionName} for ${deviceName}, a ${getDeviceTypeLabel()} medical device ${getRegPathDescription()}.

This section contains AI-generated content that would analyze all available evidence, clinical data, and regulatory requirements to provide a comprehensive evaluation according to ${getRegLabel()} standards.

${faersData ? `FAERS safety data shows ${faersData.summary.totalReports} reported events, with ${faersData.summary.seriousEvents} classified as serious. The overall risk profile is ${faersData.summary.severityAssessment.toLowerCase()}.` : ''}

Further detailed analysis would be included here based on the device specifications, intended use, and performance data provided.`,
        timestamp: new Date().toISOString(),
        regulatoryPath: regulatory
      }));
      
      // Call parent handler
      if (onFullReportGenerated) {
        onFullReportGenerated({
          title: `Clinical Evaluation Report: ${deviceName}`,
          deviceName,
          deviceType: getDeviceTypeLabel(),
          regulatoryPath: getRegLabel(),
          generatedAt: new Date().toISOString(),
          sections,
          faersData
        });
      }
      
      // Add to AI insights
      setAiInsights(prevInsights => [
        ...prevInsights,
        {
          type: 'full-report',
          title: 'Full CER Generated',
          content: `Created complete ${getRegLabel()} Clinical Evaluation Report for ${deviceName} with ${sections.length} sections.`
        }
      ]);
      
      toast({
        title: "Full report generated",
        description: `Complete CER for ${deviceName} has been generated with ${sections.length} sections`
      });
    } catch (error) {
      console.error('Error generating full report:', error);
      toast({
        title: "Failed to generate report",
        description: error.message || "An error occurred during AI generation",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Add to AI insights
    setAiInsights(prevInsights => [
      ...prevInsights,
      {
        type: 'upload',
        title: 'Documents Uploaded',
        content: `Processed ${files.length} document${files.length > 1 ? 's' : ''}: ${files.map(f => f.name).join(', ')}`
      }
    ]);
    
    toast({
      title: "Files uploaded",
      description: `${files.length} file${files.length !== 1 ? 's' : ''} uploaded successfully and will be analyzed for your CER`
    });
  };

  // Handle AI chat query
  const handleAiQuery = async () => {
    if (!queryText.trim()) return;
    
    const query = queryText.trim();
    setQueryText('');
    
    try {
      // Add user query to insights
      setAiInsights(prevInsights => [
        ...prevInsights,
        {
          type: 'user-query',
          title: 'User Query',
          content: query
        }
      ]);
      
      // In a real implementation, we would call an AI API
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add AI response to insights
      setAiInsights(prevInsights => [
        ...prevInsights,
        {
          type: 'ai-response',
          title: 'AI Assistant',
          content: `Response to your query about "${query}": This would be answered by the GPT-4o model in the real implementation, providing detailed guidance on ${regulatory} requirements related to your question.`
        }
      ]);
    } catch (error) {
      console.error('Error with AI query:', error);
      toast({
        title: "Query failed",
        description: error.message || "Failed to process your question",
        variant: "destructive"
      });
    }
  };

  // Helper functions for display labels
  const getRegLabel = () => {
    switch (regulatory) {
      case 'eu-mdr': return 'EU MDR';
      case 'iso-14155': return 'ISO 14155';
      case 'fda': return 'FDA';
      default: return regulatory;
    }
  };

  const getRegPathDescription = () => {
    switch (regulatory) {
      case 'eu-mdr': return 'under European Medical Device Regulation';
      case 'iso-14155': return 'following ISO 14155 clinical investigation standards';
      case 'fda': return 'under FDA regulatory pathway';
      default: return '';
    }
  };

  const getDeviceTypeLabel = () => {
    const selectedType = deviceTypes[regulatory]?.find(t => t.id === deviceType);
    return selectedType ? selectedType.label : deviceType;
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metadata" disabled={isGenerating}>
            <Database className="w-4 h-4 mr-2" />
            Device Info
          </TabsTrigger>
          <TabsTrigger value="data-sources" disabled={isGenerating}>
            <UploadCloud className="w-4 h-4 mr-2" />
            Data Sources
          </TabsTrigger>
          <TabsTrigger value="generation" disabled={isGenerating || !deviceName || !deviceType}>
            <FileText className="w-4 h-4 mr-2" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="ai-chat" disabled={isGenerating}>
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Assistant
          </TabsTrigger>
        </TabsList>

        {/* Device Metadata Tab */}
        <TabsContent value="metadata">
          <Card>
            <CardHeader>
              <CardTitle>Device Information</CardTitle>
              <CardDescription>
                Enter the details of your medical device to generate a compliant Clinical Evaluation Report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name</Label>
                <Input
                  id="deviceName"
                  placeholder="e.g., CardioMonitor Pro 3000"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="regulatoryPath">Regulatory Framework</Label>
                <Select value={regulatory} onValueChange={setRegulatory}>
                  <SelectTrigger id="regulatoryPath">
                    <SelectValue placeholder="Select regulatory framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eu-mdr">EU MDR</SelectItem>
                    <SelectItem value="iso-14155">ISO 14155 Clinical Investigation</SelectItem>
                    <SelectItem value="fda">FDA (510(k), De Novo, PMA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deviceType">Device Classification</Label>
                <Select value={deviceType} onValueChange={setDeviceType}>
                  <SelectTrigger id="deviceType">
                    <SelectValue placeholder="Select device classification" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes[regulatory]?.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                {deviceName && deviceType && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Device info complete
                  </Badge>
                )}
              </div>
              <Button onClick={() => setActiveTab('data-sources')} disabled={!deviceName || !deviceType}>
                Next: Data Sources
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="data-sources">
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>
                Add literature, clinical data, and access FAERS safety information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Upload Clinical Documents</h3>
                <div className="grid gap-3">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      multiple
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                      <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                      <span className="text-sm font-medium">Click to upload or drag and drop</span>
                      <span className="text-xs text-slate-500 mt-1">PDF, DOCX, CSV, XLSX (max 10MB each)</span>
                    </label>
                  </div>
                  
                  {/* File list */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-2">Uploaded Files</h4>
                      <ul className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <li key={index} className="text-sm flex items-center bg-slate-50 p-2 rounded">
                            <FileText className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="truncate max-w-md">{file.name}</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {(file.size / 1024).toFixed(0)} KB
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t space-y-4">
                <h3 className="text-lg font-medium">FDA FAERS Safety Data</h3>
                <p className="text-sm text-slate-600">
                  Incorporate FDA Adverse Event Reporting System data for your device and similar products
                </p>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={fetchFaersData} 
                    disabled={isFetchingFaers || !deviceName}
                    variant={faersData ? "outline" : "default"}
                  >
                    {isFetchingFaers ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Fetching data...
                      </>
                    ) : faersData ? (
                      <>Refresh FAERS Data</>
                    ) : (
                      <>Fetch FAERS Data</>
                    )}
                  </Button>
                  
                  {faersData && (
                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                      {faersData.summary.totalReports} Reports Analyzed
                    </Badge>
                  )}
                </div>
                
                {/* FAERS data summary */}
                {faersData && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">FAERS Data Summary</h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-white p-2 rounded border">
                        <span className="block text-slate-500">Total Reports</span>
                        <span className="font-bold">{faersData.summary.totalReports}</span>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <span className="block text-slate-500">Serious Events</span>
                        <span className="font-bold">{faersData.summary.seriousEvents}</span>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <span className="block text-slate-500">Risk Assessment</span>
                        <span className="font-bold">{faersData.summary.severityAssessment}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('metadata')}>
                Back
              </Button>
              <Button onClick={() => setActiveTab('generation')}>
                Next: Generate Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Generation Tab */}
        <TabsContent value="generation">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered CER Generation</CardTitle>
              <CardDescription>
                Generate individual sections or a complete Clinical Evaluation Report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Generation options */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Section generation */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="text-lg font-medium">Generate Individual Sections</h3>
                  <p className="text-sm text-slate-600">
                    Create specific CER sections using GPT-4o intelligence
                  </p>
                  
                  <div className="space-y-2 pt-2">
                    {requiredSections[regulatory]?.map((section) => (
                      <Button 
                        key={section}
                        variant="outline" 
                        className="w-full justify-start text-left"
                        onClick={() => generateSection(section)}
                        disabled={isGenerating}
                      >
                        {currentSection === section ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating {section}...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            {section}
                          </>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Full report generation */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="text-lg font-medium">Generate Complete CER</h3>
                  <p className="text-sm text-slate-600">
                    Create a full {getRegLabel()} Clinical Evaluation Report with all required sections
                  </p>
                  
                  <div className="pt-3 flex flex-col items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <Button 
                        size="lg"
                        onClick={generateFullReport}
                        disabled={isGenerating}
                        className="px-8"
                      >
                        {isGenerating && !currentSection ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Generating Full Report...
                          </>
                        ) : (
                          <>
                            <ClipboardCheck className="w-5 h-5 mr-2" />
                            Generate Complete CER
                          </>
                        )}
                      </Button>
                      
                      <p className="text-xs text-slate-500">
                        Will include all {requiredSections[regulatory]?.length} required sections for {getRegLabel()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Generation progress */}
              {isGenerating && (
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between text-sm">
                    <span>
                      {currentSection ? `Generating ${currentSection}` : 'Generating Full Report'}
                    </span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} className="w-full h-2" />
                  <p className="text-xs text-slate-500 italic">
                    AI is analyzing data, applying regulatory requirements, and generating content...
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('data-sources')} disabled={isGenerating}>
                Back
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('ai-chat')} disabled={isGenerating}>
                AI Assistant
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* AI Chat Assistant Tab */}
        <TabsContent value="ai-chat">
          <Card>
            <CardHeader>
              <CardTitle>AI Regulatory Assistant</CardTitle>
              <CardDescription>
                Get expert guidance on regulatory requirements and CER development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI insights timeline */}
              <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto space-y-4">
                {aiInsights.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No AI insights yet. Start by entering device information or asking a question.</p>
                  </div>
                ) : (
                  aiInsights.map((insight, index) => (
                    <div key={index} className="flex gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                        ${insight.type === 'faers' ? 'bg-purple-100' :
                          insight.type === 'section' ? 'bg-green-100' :
                          insight.type === 'full-report' ? 'bg-blue-100' :
                          insight.type === 'upload' ? 'bg-amber-100' :
                          insight.type === 'user-query' ? 'bg-slate-100' :
                          'bg-indigo-100'}
                      `}>
                        {insight.type === 'faers' ? <Database className="w-4 h-4 text-purple-600" /> :
                         insight.type === 'section' ? <FileText className="w-4 h-4 text-green-600" /> :
                         insight.type === 'full-report' ? <ClipboardCheck className="w-4 h-4 text-blue-600" /> :
                         insight.type === 'upload' ? <UploadCloud className="w-4 h-4 text-amber-600" /> :
                         insight.type === 'user-query' ? <MessageSquare className="w-4 h-4 text-slate-600" /> :
                         <BookOpen className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{insight.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{insight.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* AI query input */}
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Ask about regulatory requirements..."
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiQuery()}
                />
                <Button onClick={handleAiQuery} disabled={!queryText.trim()}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ask
                </Button>
              </div>
              
              <div className="pt-2">
                <p className="text-xs text-slate-500">
                  Example questions:
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {[
                    "What sections are required for EU MDR Class IIb?",
                    "How to structure a State of the Art review?",
                    "What safety metrics should I include?"
                  ].map((q, i) => (
                    <Badge 
                      key={i} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => setQueryText(q)}
                    >
                      {q}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setActiveTab('generation')} className="w-full">
                Back to Generation
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
