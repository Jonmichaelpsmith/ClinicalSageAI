import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  BookOpen, 
  Check, 
  Loader2, 
  Upload, 
  Database, 
  AlertTriangle,
  FileCode,
  Workflow,
  GitCompare
} from 'lucide-react';
import { register510kDocument } from '../unified-workflow/registerModuleDocument';

/**
 * OneClick510kDraft Component
 * 
 * This component provides a simplified interface for generating a complete 510(k) submission
 * draft with a single click, and integrates with the unified workflow system.
 */
const OneClick510kDraft = () => {
  const [deviceName, setDeviceName] = useState('');
  const [deviceDescription, setDeviceDescription] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [deviceClass, setDeviceClass] = useState('');
  const [predicateDevices, setPredicateDevices] = useState('');
  const [indications, setIndications] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [readyToRegister, setReadyToRegister] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [selectedTab, setSelectedTab] = useState('device-info');
  const [outputFormat, setOutputFormat] = useState('pdf');
  const [includeWorkflow, setIncludeWorkflow] = useState(true);
  const { toast } = useToast();
  
  // Validate form
  const validateForm = () => {
    if (!deviceName) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a device name',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!deviceType) {
      toast({
        title: 'Missing Information',
        description: 'Please select a device type',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!deviceClass) {
      toast({
        title: 'Missing Information',
        description: 'Please select a device class',
        variant: 'destructive'
      });
      return false;
    }
    
    return true;
  };
  
  // Handle generation
  const handleGenerate = async () => {
    if (!validateForm()) return;
    
    try {
      setIsGenerating(true);
      
      // Demo API call to generate the 510(k) draft
      // In a real implementation, this would call your backend API
      const response = await fetch('/api/fda510k/generate-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceName,
          deviceDescription,
          deviceType,
          deviceClass,
          predicateDevices: predicateDevices.split(',').map(p => p.trim()),
          indications,
          format: outputFormat
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store the generated report
      setGeneratedReport(data);
      setReadyToRegister(true);
      setSelectedTab('output');
      
      toast({
        title: 'Draft Generated',
        description: 'Your 510(k) draft has been successfully generated',
        variant: 'success'
      });
      
      // If auto-workflow is enabled, register immediately
      if (includeWorkflow) {
        await registerDocument(data);
      }
    } catch (error) {
      console.error('Error generating 510(k) draft:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate 510(k) draft',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Register document in the workflow system
  const registerDocument = async (report = generatedReport) => {
    try {
      if (!report) {
        toast({
          title: 'No Report',
          description: 'Please generate a report first',
          variant: 'destructive'
        });
        return;
      }
      
      // Register the document with the workflow system
      const result = await register510kDocument({
        documentId: report.id || `510k-${Date.now()}`,
        title: `510(k) Draft - ${deviceName}`,
        documentType: '510k_submission',
        metadata: {
          reportFormat: outputFormat,
          deviceType,
          deviceClass,
          predicateDevices: predicateDevices.split(',').map(p => p.trim()),
          generatedAt: new Date().toISOString()
        },
        content: {
          report,
          deviceDetails: {
            name: deviceName,
            description: deviceDescription,
            type: deviceType,
            class: deviceClass,
            indications
          }
        },
        initiateWorkflow: true
      });
      
      toast({
        title: 'Document Registered',
        description: 'The 510(k) draft has been registered in the workflow system',
        variant: 'success'
      });
      
      // Open the workflow interface
      if (result.workflowId) {
        // In a real implementation, you might redirect to the workflow page
        console.log(`Workflow initiated with ID: ${result.workflowId}`);
      }
    } catch (error) {
      console.error('Error registering document:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to register document in workflow system',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Card className="shadow-md border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-4 border-b">
        <CardTitle className="text-blue-700 flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-600" />
          One-Click 510(k) Draft Generation
        </CardTitle>
        <CardDescription>
          Generate a complete FDA 510(k) submission draft with minimal input
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="device-info" className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Device Information
            </TabsTrigger>
            <TabsTrigger value="predicates" className="flex items-center">
              <GitCompare className="h-4 w-4 mr-2" />
              Predicates
            </TabsTrigger>
            <TabsTrigger value="output" className="flex items-center">
              <FileCode className="h-4 w-4 mr-2" />
              Output Options
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="device-info" className="mt-2 space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="deviceName">Device Name <span className="text-red-500">*</span></Label>
                <Input
                  id="deviceName"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="e.g., UltraKare Glucose Monitor"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="deviceDescription">Device Description</Label>
                <Textarea
                  id="deviceDescription"
                  value={deviceDescription}
                  onChange={(e) => setDeviceDescription(e.target.value)}
                  placeholder="Brief description of your device and its intended use"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="deviceType">Device Type <span className="text-red-500">*</span></Label>
                  <Select value={deviceType} onValueChange={setDeviceType}>
                    <SelectTrigger id="deviceType">
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diagnostic">Diagnostic Device</SelectItem>
                      <SelectItem value="therapeutic">Therapeutic Device</SelectItem>
                      <SelectItem value="monitoring">Monitoring Device</SelectItem>
                      <SelectItem value="imaging">Imaging Device</SelectItem>
                      <SelectItem value="surgical">Surgical Instrument</SelectItem>
                      <SelectItem value="implant">Implantable Device</SelectItem>
                      <SelectItem value="software">Software as Medical Device</SelectItem>
                      <SelectItem value="combination">Combination Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="deviceClass">Device Class <span className="text-red-500">*</span></Label>
                  <Select value={deviceClass} onValueChange={setDeviceClass}>
                    <SelectTrigger id="deviceClass">
                      <SelectValue placeholder="Select device class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I">Class I</SelectItem>
                      <SelectItem value="II">Class II</SelectItem>
                      <SelectItem value="III">Class III</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="indications">Indications for Use</Label>
                <Textarea
                  id="indications"
                  value={indications}
                  onChange={(e) => setIndications(e.target.value)}
                  placeholder="Specific conditions, purposes, or uses for which the device is intended"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="predicates" className="mt-2 space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="predicateDevices">Predicate Devices</Label>
                <div className="text-sm text-gray-500 mb-2">
                  Enter predicate device names or K-numbers, separated by commas
                </div>
                <Textarea
                  id="predicateDevices"
                  value={predicateDevices}
                  onChange={(e) => setPredicateDevices(e.target.value)}
                  placeholder="e.g., K123456, CompanyX GlucoseMonitor Pro, K789012"
                  rows={3}
                />
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Predicate Device Recommendation</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      If you don't specify predicate devices, our system will automatically identify
                      suitable predicates based on your device information. For best results, provide at least
                      one known predicate device.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="output" className="mt-2 space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="outputFormat">Output Format</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger id="outputFormat">
                    <SelectValue placeholder="Select output format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="docx">Microsoft Word (DOCX)</SelectItem>
                    <SelectItem value="html">HTML Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox 
                  id="includeWorkflow" 
                  checked={includeWorkflow}
                  onCheckedChange={setIncludeWorkflow}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label 
                    htmlFor="includeWorkflow" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                  >
                    <Workflow className="h-4 w-4 mr-1 text-blue-600" />
                    Automatically register in workflow
                  </Label>
                  <p className="text-xs text-gray-500">
                    Register this document in the unified workflow system for review and approval
                  </p>
                </div>
              </div>
              
              {generatedReport && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-green-800">Draft Generated Successfully</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your 510(k) draft has been generated and is ready for review. You can download it or
                        register it in the workflow system for team review.
                      </p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200"
                          onClick={() => window.open(`/api/fda510k/download/${generatedReport.id}`, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        
                        {!includeWorkflow && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-200"
                            onClick={() => registerDocument()}
                          >
                            <Workflow className="h-4 w-4 mr-1" />
                            Register in Workflow
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-6 py-4 flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setDeviceName('');
            setDeviceDescription('');
            setDeviceType('');
            setDeviceClass('');
            setPredicateDevices('');
            setIndications('');
            setGeneratedReport(null);
            setReadyToRegister(false);
            setSelectedTab('device-info');
          }}
        >
          Reset Form
        </Button>
        
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate 510(k) Draft
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OneClick510kDraft;