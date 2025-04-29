import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Download, Pen, FileCheck } from "lucide-react";

/**
 * Clinical Evaluation Report Generator - Generate CERs for medical devices
 */
const CERPage = () => {
  // Form state
  const [deviceName, setDeviceName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [description, setDescription] = useState('');
  const [intendedUse, setIntendedUse] = useState('');
  const [equivalentDevices, setEquivalentDevices] = useState('');
  const [clinicalData, setClinicalData] = useState('');
  const [literatureSearch, setLiteratureSearch] = useState('');
  const [adverseEvents, setAdverseEvents] = useState('');
  const [cerDraft, setCerDraft] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Handle form submission
  const handleGenerateCER = async () => {
    if (!deviceName || !manufacturer || !intendedUse) {
      alert('Please fill in the required fields (Device Name, Manufacturer, and Intended Use)');
      return;
    }
    
    setLoading(true);
    try {
      const cerData = {
        deviceName,
        manufacturer,
        modelNumber,
        deviceType,
        description,
        intendedUse,
        equivalentDevices,
        clinicalData,
        literatureSearch,
        adverseEvents
      };
      
      const response = await fetch('/api/cer/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cerData)
      });
      
      if (!response.ok) {
        throw new Error('Error generating CER');
      }
      
      const data = await response.json();
      setCerDraft(data.cer);
    } catch (error) {
      console.error('Error generating CER:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Download CER as PDF
  const handleDownloadPDF = async () => {
    if (!cerDraft) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/cer/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceName,
          manufacturer,
          cer: cerDraft
        })
      });
      
      if (!response.ok) {
        throw new Error('Error downloading PDF');
      }
      
      // Create a blob from the PDF Stream
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Create link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deviceName}_CER.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="cer-page-container p-4">
      <h1 className="text-2xl font-bold mb-6">Clinical Evaluation Report Generator</h1>
      
      <Tabs defaultValue="device">
        <TabsList className="mb-4">
          <TabsTrigger value="device">
            <FileText className="h-4 w-4 mr-2" />
            Device Information
          </TabsTrigger>
          <TabsTrigger value="clinical">
            <FileCheck className="h-4 w-4 mr-2" />
            Clinical Evidence
          </TabsTrigger>
          <TabsTrigger value="generate">
            <Pen className="h-4 w-4 mr-2" />
            Generated CER
          </TabsTrigger>
        </TabsList>
        
        {/* Device Information Tab */}
        <TabsContent value="device">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Details</CardTitle>
                <CardDescription>Enter information about your medical device</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Device Name<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      placeholder="e.g., CardioRhythm Pacemaker"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Manufacturer<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      placeholder="e.g., MedTech Innovations, Inc."
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Model Number</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={modelNumber}
                        onChange={(e) => setModelNumber(e.target.value)}
                        placeholder="e.g., CR-2023"
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-1 font-medium">Device Type</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={deviceType}
                        onChange={(e) => setDeviceType(e.target.value)}
                      >
                        <option value="">Select Device Type</option>
                        <option value="active-implantable">Active Implantable</option>
                        <option value="non-active-implantable">Non-Active Implantable</option>
                        <option value="active-therapeutic">Active Therapeutic</option>
                        <option value="diagnostic">Diagnostic</option>
                        <option value="monitoring">Monitoring</option>
                        <option value="in-vitro-diagnostic">In Vitro Diagnostic</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Device Description</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the device, its components, and functionality"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Intended Use<span className="text-red-500">*</span></label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="3"
                      value={intendedUse}
                      onChange={(e) => setIntendedUse(e.target.value)}
                      placeholder="Describe the intended purpose, indications, and patient population"
                      required
                    />
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button
                      onClick={() => document.querySelector('[data-value="clinical"]').click()}
                    >
                      Next: Clinical Evidence
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Equivalent Devices</CardTitle>
                <CardDescription>List equivalent devices for comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Equivalent Devices</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="8"
                      value={equivalentDevices}
                      onChange={(e) => setEquivalentDevices(e.target.value)}
                      placeholder="List predicate or equivalent devices that can be used for comparison, including manufacturer, model number, and similarities/differences"
                    />
                  </div>
                  
                  <div className="p-4 border rounded bg-blue-50">
                    <h3 className="font-medium text-blue-800 mb-2">Guidance for Equivalence</h3>
                    <p className="text-sm text-blue-700">
                      When identifying equivalent devices, consider the following aspects:
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
                      <li>Technical characteristics (materials, specifications, properties)</li>
                      <li>Biological characteristics (biocompatibility, degradation)</li>
                      <li>Clinical characteristics (intended purpose, clinical performance)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Clinical Evidence Tab */}
        <TabsContent value="clinical">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Data</CardTitle>
                <CardDescription>Provide information about clinical investigations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Clinical Investigation Data</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="8"
                      value={clinicalData}
                      onChange={(e) => setClinicalData(e.target.value)}
                      placeholder="Summarize any clinical investigations conducted with the device, including study design, objectives, methods, results, and conclusions"
                    />
                  </div>
                  
                  <div className="p-4 border rounded bg-blue-50">
                    <h3 className="font-medium text-blue-800 mb-2">Clinical Data Guidance</h3>
                    <p className="text-sm text-blue-700">
                      Include the following information for each clinical investigation:
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
                      <li>Study title and identifier</li>
                      <li>Study design (e.g., randomized, controlled, cohort)</li>
                      <li>Patient demographics</li>
                      <li>Primary and secondary endpoints</li>
                      <li>Summary of results</li>
                      <li>Clinical significance of findings</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Literature Search</CardTitle>
                  <CardDescription>Summarize literature search strategy and findings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="5"
                      value={literatureSearch}
                      onChange={(e) => setLiteratureSearch(e.target.value)}
                      placeholder="Describe your literature search strategy, databases searched, search terms, and summary of relevant publications"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Adverse Events</CardTitle>
                  <CardDescription>Post-market surveillance data and adverse events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="5"
                      value={adverseEvents}
                      onChange={(e) => setAdverseEvents(e.target.value)}
                      placeholder="Summarize any known adverse events, complaints, recalls, or field safety notices related to the device or equivalent devices"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => document.querySelector('[data-value="device"]').click()}
                >
                  Back to Device Information
                </Button>
                <Button
                  onClick={handleGenerateCER}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate CER'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Generated CER Tab */}
        <TabsContent value="generate">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Generated Clinical Evaluation Report</CardTitle>
                  {cerDraft && (
                    <Button 
                      onClick={handleDownloadPDF}
                      disabled={loading}
                      className="flex items-center"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Download PDF
                    </Button>
                  )}
                </div>
                <CardDescription>Review and download your Clinical Evaluation Report</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-gray-500">Generating your Clinical Evaluation Report...</p>
                  </div>
                ) : cerDraft ? (
                  <div className="border rounded p-6 bg-white">
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: cerDraft }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No CER Generated Yet</h3>
                    <p className="text-gray-500 max-w-md mb-6">
                      Fill in your device information and clinical evidence, then click "Generate CER" to create your Clinical Evaluation Report.
                    </p>
                    <Button
                      onClick={() => document.querySelector('[data-value="device"]').click()}
                    >
                      Start with Device Information
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {cerDraft && (
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => document.querySelector('[data-value="clinical"]').click()}
                >
                  Edit Clinical Evidence
                </Button>
                <Button 
                  onClick={handleDownloadPDF}
                  disabled={loading}
                  className="flex items-center"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download PDF
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CERPage;