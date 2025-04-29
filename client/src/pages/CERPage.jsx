import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Download } from "lucide-react";
import { generateCER } from '../api/cer';

/**
 * CER Generator Page - Clinical Evaluation Report generation tool
 */
const CERPage = () => {
  const [loading, setLoading] = useState(false);
  const [cerInput, setCerInput] = useState({
    deviceName: '',
    manufacturer: '',
    modelNumber: '',
    deviceClass: 'IIa',
    intendedUse: '',
    clinicalLiterature: '',
    postMarketData: '',
    equivalentDevices: []
  });
  
  const [cerResult, setCerResult] = useState(null);
  const [activeTab, setActiveTab] = useState('input');

  // Handle adding equivalent device
  const addEquivalentDevice = () => {
    setCerInput(prev => ({
      ...prev,
      equivalentDevices: [...prev.equivalentDevices, { 
        name: '', 
        manufacturer: '', 
        similarityRationale: '' 
      }]
    }));
  };

  // Handle removing equivalent device
  const removeEquivalentDevice = (index) => {
    setCerInput(prev => ({
      ...prev,
      equivalentDevices: prev.equivalentDevices.filter((_, i) => i !== index)
    }));
  };

  // Handle updating equivalent device
  const updateEquivalentDevice = (index, field, value) => {
    setCerInput(prev => ({
      ...prev,
      equivalentDevices: prev.equivalentDevices.map((device, i) => 
        i === index ? { ...device, [field]: value } : device
      )
    }));
  };

  // Handle generating CER
  const handleGenerateCER = async () => {
    setLoading(true);
    try {
      const data = await generateCER(cerInput);
      setCerResult(data);
      setActiveTab('result');
    } catch (error) {
      console.error('Error generating CER:', error);
    } finally {
      setLoading(false);
    }
  };

  // Download CER as PDF
  const handleDownloadCER = () => {
    if (!cerResult) return;
    
    // In a real app, this would trigger a server-side PDF download
    window.open(`/api/cer/${cerResult.id}/download-pdf`, '_blank');
  };

  return (
    <div className="cer-page-container p-4">
      <h1 className="text-2xl font-bold mb-6">Clinical Evaluation Report Generator</h1>
      
      <Tabs defaultValue="input" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="input">Input Data</TabsTrigger>
          <TabsTrigger value="result" disabled={!cerResult}>Generated Report</TabsTrigger>
        </TabsList>
        
        {/* Input Tab */}
        <TabsContent value="input">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Basic Device Info */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Device Information</CardTitle>
                <CardDescription>Basic details for your medical device</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Device Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={cerInput.deviceName}
                      onChange={(e) => setCerInput(prev => ({ ...prev, deviceName: e.target.value }))}
                      placeholder="e.g., HeartAssist Monitor"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Manufacturer</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={cerInput.manufacturer}
                      onChange={(e) => setCerInput(prev => ({ ...prev, manufacturer: e.target.value }))}
                      placeholder="e.g., Medical Devices Inc."
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Model Number</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={cerInput.modelNumber}
                      onChange={(e) => setCerInput(prev => ({ ...prev, modelNumber: e.target.value }))}
                      placeholder="e.g., HA-2023"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Device Class</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={cerInput.deviceClass}
                      onChange={(e) => setCerInput(prev => ({ ...prev, deviceClass: e.target.value }))}
                    >
                      <option value="I">Class I</option>
                      <option value="IIa">Class IIa</option>
                      <option value="IIb">Class IIb</option>
                      <option value="III">Class III</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Intended Use</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="4"
                      value={cerInput.intendedUse}
                      onChange={(e) => setCerInput(prev => ({ ...prev, intendedUse: e.target.value }))}
                      placeholder="Describe intended purpose and patient population"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Middle column - Clinical Literature */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Clinical Literature</CardTitle>
                <CardDescription>Relevant clinical studies and literature</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Literature Search Keywords</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="3"
                      value={cerInput.clinicalLiterature}
                      onChange={(e) => setCerInput(prev => ({ ...prev, clinicalLiterature: e.target.value }))}
                      placeholder="Enter keywords, separated by commas (e.g., cardiac monitoring, arrhythmia detection)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Our AI will search PubMed and other databases for relevant clinical literature
                    </p>
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Post-market Data</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="8"
                      value={cerInput.postMarketData}
                      onChange={(e) => setCerInput(prev => ({ ...prev, postMarketData: e.target.value }))}
                      placeholder="Enter any post-market surveillance data, complaints, or adverse events"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Right column - Equivalent Devices */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Equivalent Devices</CardTitle>
                <CardDescription>Similar devices for comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cerInput.equivalentDevices.map((device, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Device #{index + 1}</h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeEquivalentDevice(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block mb-1 text-sm">Device Name</label>
                          <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={device.name}
                            onChange={(e) => updateEquivalentDevice(index, 'name', e.target.value)}
                            placeholder="e.g., CompetitorDevice X1"
                          />
                        </div>
                        
                        <div>
                          <label className="block mb-1 text-sm">Manufacturer</label>
                          <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={device.manufacturer}
                            onChange={(e) => updateEquivalentDevice(index, 'manufacturer', e.target.value)}
                            placeholder="e.g., Competitor Inc."
                          />
                        </div>
                        
                        <div>
                          <label className="block mb-1 text-sm">Similarity Rationale</label>
                          <textarea
                            className="w-full p-2 border rounded"
                            rows="3"
                            value={device.similarityRationale}
                            onChange={(e) => updateEquivalentDevice(index, 'similarityRationale', e.target.value)}
                            placeholder="Explain how this device is similar to yours"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline"
                    onClick={addEquivalentDevice}
                    className="w-full"
                  >
                    Add Equivalent Device
                  </Button>
                  
                  <div className="pt-4 border-t mt-6">
                    <Button 
                      onClick={handleGenerateCER}
                      disabled={loading || !cerInput.deviceName || !cerInput.manufacturer}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Report...
                        </>
                      ) : (
                        'Generate CER'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Result Tab */}
        <TabsContent value="result">
          {cerResult && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Generated Clinical Evaluation Report</h2>
                <Button 
                  onClick={handleDownloadCER}
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>CER Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded bg-white">
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: cerResult.executiveSummary }}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 border rounded bg-white">
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: cerResult.deviceDescription }}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Clinical Literature Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 border rounded bg-white">
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: cerResult.literatureOverview }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Benefit-Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded bg-white">
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: cerResult.benefitRiskAssessment }}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Post-Market Surveillance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded bg-white">
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: cerResult.postMarketAnalysis }}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Conclusions & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded bg-white">
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: cerResult.conclusions }}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => setActiveTab('input')}
                  variant="outline"
                  className="mr-4"
                >
                  Return to Input
                </Button>
                <Button 
                  onClick={handleDownloadCER}
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CERPage;