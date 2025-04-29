import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, FileText, Download, BookOpen, Calendar } from "lucide-react";

/**
 * Advanced CER Generator Page - Enhanced Clinical Evaluation Report with PubMed and openFDA integration
 */
const CERV2Page = () => {
  // PubMed search state
  const [pubmedQuery, setPubmedQuery] = useState('');
  const [pubmedResults, setPubmedResults] = useState([]);
  const [selectedPMIDs, setSelectedPMIDs] = useState([]);
  const [pubmedAbstracts, setPubmedAbstracts] = useState({});
  const [pubmedLoading, setPubmedLoading] = useState(false);
  
  // OpenFDA state
  const [drugName, setDrugName] = useState('');
  const [fdaResults, setFdaResults] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [fdaLoading, setFdaLoading] = useState(false);
  
  // Device metadata state
  const [deviceData, setDeviceData] = useState({
    deviceName: '',
    manufacturer: '',
    modelNumber: '',
    deviceClass: 'IIa',
    description: '',
    intendedUse: '',
    clinicalHistory: ''
  });
  
  // CER generation state
  const [generatingCER, setGeneratingCER] = useState(false);
  const [generatedCER, setGeneratedCER] = useState(null);
  const [activeTab, setActiveTab] = useState('pubmed');

  // Search PubMed
  const handlePubmedSearch = async () => {
    if (!pubmedQuery.trim()) return;
    
    setPubmedLoading(true);
    try {
      const response = await fetch(`/api/pubmed/search?query=${encodeURIComponent(pubmedQuery)}`);
      if (!response.ok) {
        throw new Error('PubMed search failed');
      }
      
      const data = await response.json();
      setPubmedResults(data.results || []);
    } catch (error) {
      console.error('Error searching PubMed:', error);
    } finally {
      setPubmedLoading(false);
    }
  };

  // Toggle PMID selection
  const togglePMID = (pmid) => {
    setSelectedPMIDs(prev => 
      prev.includes(pmid) 
        ? prev.filter(id => id !== pmid) 
        : [...prev, pmid]
    );
  };

  // Fetch abstracts for selected PMIDs
  useEffect(() => {
    const fetchAbstracts = async () => {
      const newPMIDs = selectedPMIDs.filter(pmid => !pubmedAbstracts[pmid]);
      if (newPMIDs.length === 0) return;
      
      try {
        const response = await fetch('/api/pubmed/abstracts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ pmids: newPMIDs })
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch abstracts');
        }
        
        const data = await response.json();
        setPubmedAbstracts(prev => ({
          ...prev,
          ...data.abstracts
        }));
      } catch (error) {
        console.error('Error fetching abstracts:', error);
      }
    };
    
    fetchAbstracts();
  }, [selectedPMIDs]);

  // Search openFDA for adverse events
  const handleFDASearch = async () => {
    if (!drugName.trim()) return;
    
    setFdaLoading(true);
    try {
      const response = await fetch(`/api/openfda/events?drug=${encodeURIComponent(drugName)}`);
      if (!response.ok) {
        throw new Error('FDA search failed');
      }
      
      const data = await response.json();
      setFdaResults(data.results || []);
    } catch (error) {
      console.error('Error searching FDA:', error);
    } finally {
      setFdaLoading(false);
    }
  };

  // Toggle event selection
  const toggleEvent = (event) => {
    setSelectedEvents(prev => 
      prev.includes(event) 
        ? prev.filter(e => e !== event) 
        : [...prev, event]
    );
  };

  // Generate advanced CER
  const handleGenerateCER = async () => {
    if (!deviceData.deviceName || selectedPMIDs.length === 0) {
      alert('Please provide device information and select at least one literature reference');
      return;
    }
    
    setGeneratingCER(true);
    try {
      const cerRequest = {
        device: deviceData,
        literature: Object.fromEntries(
          selectedPMIDs.map(pmid => [pmid, pubmedAbstracts[pmid]])
        ),
        adverseEvents: selectedEvents,
        drugName
      };
      
      const response = await fetch('/api/cer/generate-advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cerRequest)
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate CER');
      }
      
      const data = await response.json();
      setGeneratedCER(data);
      setActiveTab('results');
    } catch (error) {
      console.error('Error generating CER:', error);
    } finally {
      setGeneratingCER(false);
    }
  };

  // Download CER as PDF
  const handleDownloadCER = () => {
    if (!generatedCER) return;
    
    window.open(`/api/cer/${generatedCER.id}/download-pdf`, '_blank');
  };

  // Render CER results section
  const renderCERResults = () => {
    if (!generatedCER) {
      return (
        <div className="text-center p-8">
          <p>No Clinical Evaluation Report has been generated yet.</p>
          <Button 
            className="mt-4"
            onClick={() => setActiveTab('pubmed')}
          >
            Return to Literature Search
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Advanced Clinical Evaluation Report</h2>
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
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded bg-white">
              <div 
                className="prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: generatedCER.executiveSummary }}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Literature Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded bg-white">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: generatedCER.literatureAnalysis }}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Post-Market Surveillance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded bg-white">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: generatedCER.postMarketSurveillance }}
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
                dangerouslySetInnerHTML={{ __html: generatedCER.benefitRiskAssessment }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>References</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded bg-white">
              <ul className="space-y-2 list-decimal pl-5">
                {generatedCER.references.map((ref, index) => (
                  <li key={index} className="prose">
                    <span dangerouslySetInnerHTML={{ __html: ref }} />
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-center pt-4">
          <Button 
            onClick={() => setActiveTab('pubmed')}
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
    );
  };

  return (
    <div className="cerv2-page-container p-4">
      <h1 className="text-2xl font-bold mb-6">Advanced Clinical Evaluation Report Generator</h1>
      
      <Tabs defaultValue="pubmed" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pubmed">
            <BookOpen className="h-4 w-4 mr-2" />
            PubMed Search
          </TabsTrigger>
          <TabsTrigger value="fda">
            <Search className="h-4 w-4 mr-2" />
            FDA Adverse Events
          </TabsTrigger>
          <TabsTrigger value="device">
            <FileText className="h-4 w-4 mr-2" />
            Device Information
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!generatedCER}>
            <Calendar className="h-4 w-4 mr-2" />
            Generated CER
          </TabsTrigger>
        </TabsList>
        
        {/* PubMed Search Tab */}
        <TabsContent value="pubmed">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Literature Search</CardTitle>
                <CardDescription>Search PubMed for relevant literature</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex">
                    <input
                      type="text"
                      className="w-full p-2 border rounded-l"
                      value={pubmedQuery}
                      onChange={(e) => setPubmedQuery(e.target.value)}
                      placeholder="e.g., cardiac pacemaker safety clinical trials"
                      onKeyDown={(e) => e.key === 'Enter' && handlePubmedSearch()}
                    />
                    <Button 
                      onClick={handlePubmedSearch}
                      disabled={pubmedLoading || !pubmedQuery.trim()}
                      className="rounded-l-none"
                    >
                      {pubmedLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="border rounded overflow-auto max-h-96">
                    {pubmedResults.length > 0 ? (
                      <div className="divide-y">
                        {pubmedResults.map((result) => (
                          <div 
                            key={result.pmid} 
                            className={`p-3 cursor-pointer ${selectedPMIDs.includes(result.pmid) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            onClick={() => togglePMID(result.pmid)}
                          >
                            <div className="flex items-start">
                              <input
                                type="checkbox"
                                className="mr-2 mt-1"
                                checked={selectedPMIDs.includes(result.pmid)}
                                onChange={() => togglePMID(result.pmid)}
                              />
                              <div>
                                <h3 className="font-medium">{result.title}</h3>
                                <div className="text-sm text-gray-500 mt-1">
                                  {result.authors}
                                </div>
                                <div className="text-xs mt-1">
                                  <span className="font-medium">{result.journal}</span>
                                  {result.year && <span> ({result.year})</span>}
                                  <span className="ml-2">PMID: {result.pmid}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : pubmedLoading ? (
                      <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        {pubmedQuery ? 'No results found. Try different keywords.' : 'Enter keywords to search PubMed'}
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 flex justify-between items-center">
                    <div className="text-sm">
                      {selectedPMIDs.length} publication{selectedPMIDs.length !== 1 ? 's' : ''} selected
                    </div>
                    <Button 
                      onClick={() => setActiveTab('fda')}
                      disabled={selectedPMIDs.length === 0}
                    >
                      Next: FDA Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Selected Literature</CardTitle>
                <CardDescription>Review selected abstracts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded overflow-auto max-h-96">
                  {selectedPMIDs.length > 0 ? (
                    <div className="divide-y">
                      {selectedPMIDs.map((pmid) => (
                        <div key={pmid} className="p-3">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">PMID: {pmid}</h3>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => togglePMID(pmid)}
                            >
                              Remove
                            </Button>
                          </div>
                          
                          {pubmedAbstracts[pmid] ? (
                            <div className="mt-2 text-sm">
                              <p className="font-medium">{pubmedAbstracts[pmid].title}</p>
                              <p className="mt-1">{pubmedAbstracts[pmid].abstract}</p>
                              <p className="mt-2 text-xs text-gray-500">
                                {pubmedAbstracts[pmid].authors} - {pubmedAbstracts[pmid].journal} ({pubmedAbstracts[pmid].year})
                              </p>
                            </div>
                          ) : (
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <Loader2 className="h-3 w-3 animate-spin mr-2" />
                              Loading abstract...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No literature selected. Select publications from search results.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* FDA Adverse Events Tab */}
        <TabsContent value="fda">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>FDA Adverse Events</CardTitle>
                <CardDescription>Search openFDA for adverse events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex">
                    <input
                      type="text"
                      className="w-full p-2 border rounded-l"
                      value={drugName}
                      onChange={(e) => setDrugName(e.target.value)}
                      placeholder="e.g., pacemaker, insulin pump"
                      onKeyDown={(e) => e.key === 'Enter' && handleFDASearch()}
                    />
                    <Button 
                      onClick={handleFDASearch}
                      disabled={fdaLoading || !drugName.trim()}
                      className="rounded-l-none"
                    >
                      {fdaLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="border rounded overflow-auto max-h-96">
                    {fdaResults.length > 0 ? (
                      <div className="divide-y">
                        {fdaResults.map((result, index) => (
                          <div 
                            key={index} 
                            className={`p-3 cursor-pointer ${selectedEvents.includes(result.term) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            onClick={() => toggleEvent(result.term)}
                          >
                            <div className="flex items-start">
                              <input
                                type="checkbox"
                                className="mr-2 mt-1"
                                checked={selectedEvents.includes(result.term)}
                                onChange={() => toggleEvent(result.term)}
                              />
                              <div>
                                <h3 className="font-medium">{result.term}</h3>
                                <div className="flex justify-between text-sm mt-1">
                                  <span className="text-gray-500">Reports: {result.count}</span>
                                  <span className={
                                    result.seriousness === 'serious' ? 'text-red-600' :
                                    result.seriousness === 'moderate' ? 'text-yellow-600' :
                                    'text-blue-600'
                                  }>
                                    {result.seriousness}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : fdaLoading ? (
                      <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        {drugName ? 'No results found. Try a different product name.' : 'Enter a medical device or drug name to search.'}
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 flex justify-between items-center">
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('pubmed')}
                    >
                      Back: Literature
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('device')}
                    >
                      Next: Device Info
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Selected Adverse Events</CardTitle>
                <CardDescription>Review selected events for inclusion in CER</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded overflow-auto max-h-96">
                  {selectedEvents.length > 0 ? (
                    <div className="divide-y">
                      {selectedEvents.map((event, index) => (
                        <div key={index} className="p-3">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{event}</h3>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleEvent(event)}
                            >
                              Remove
                            </Button>
                          </div>
                          
                          <div className="mt-2 text-sm">
                            <p>
                              This adverse event will be analyzed in the post-market surveillance 
                              section of the clinical evaluation report.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No adverse events selected. Select events from search results or continue without them.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Device Information Tab */}
        <TabsContent value="device">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Information</CardTitle>
                <CardDescription>Enter details about your medical device</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Device Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={deviceData.deviceName}
                        onChange={(e) => setDeviceData(prev => ({ ...prev, deviceName: e.target.value }))}
                        placeholder="e.g., CardioRhythm Pacemaker"
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-1 font-medium">Manufacturer</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={deviceData.manufacturer}
                        onChange={(e) => setDeviceData(prev => ({ ...prev, manufacturer: e.target.value }))}
                        placeholder="e.g., MedTech Innovations"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Model Number</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={deviceData.modelNumber}
                        onChange={(e) => setDeviceData(prev => ({ ...prev, modelNumber: e.target.value }))}
                        placeholder="e.g., CR-2023"
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-1 font-medium">Device Class</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={deviceData.deviceClass}
                        onChange={(e) => setDeviceData(prev => ({ ...prev, deviceClass: e.target.value }))}
                      >
                        <option value="I">Class I</option>
                        <option value="IIa">Class IIa</option>
                        <option value="IIb">Class IIb</option>
                        <option value="III">Class III</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Device Description</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="3"
                      value={deviceData.description}
                      onChange={(e) => setDeviceData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the device"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Intended Use</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="3"
                      value={deviceData.intendedUse}
                      onChange={(e) => setDeviceData(prev => ({ ...prev, intendedUse: e.target.value }))}
                      placeholder="Describe intended purpose and patient population"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Clinical History</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="3"
                      value={deviceData.clinicalHistory}
                      onChange={(e) => setDeviceData(prev => ({ ...prev, clinicalHistory: e.target.value }))}
                      placeholder="Brief history of clinical use"
                    />
                  </div>
                  
                  <div className="pt-4 flex justify-between items-center">
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('fda')}
                    >
                      Back: FDA Data
                    </Button>
                    <Button 
                      onClick={handleGenerateCER}
                      disabled={generatingCER || !deviceData.deviceName || selectedPMIDs.length === 0}
                    >
                      {generatingCER ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Report...
                        </>
                      ) : (
                        'Generate Advanced CER'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
                <CardDescription>Summary of data for CER generation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded">
                    <h3 className="font-medium">Device Information</h3>
                    <div className="mt-2 space-y-1 text-sm">
                      {deviceData.deviceName && (
                        <p><span className="font-medium">Name:</span> {deviceData.deviceName}</p>
                      )}
                      {deviceData.manufacturer && (
                        <p><span className="font-medium">Manufacturer:</span> {deviceData.manufacturer}</p>
                      )}
                      {deviceData.modelNumber && (
                        <p><span className="font-medium">Model:</span> {deviceData.modelNumber}</p>
                      )}
                      <p><span className="font-medium">Class:</span> {deviceData.deviceClass}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <h3 className="font-medium">Literature References</h3>
                    <div className="mt-2">
                      {selectedPMIDs.length > 0 ? (
                        <ul className="space-y-1 text-sm list-disc ml-5">
                          {selectedPMIDs.map((pmid) => (
                            <li key={pmid}>
                              {pubmedAbstracts[pmid]?.title || `PMID: ${pmid}`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No literature selected</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <h3 className="font-medium">Adverse Events Data</h3>
                    <div className="mt-2">
                      {selectedEvents.length > 0 ? (
                        <ul className="space-y-1 text-sm list-disc ml-5">
                          {selectedEvents.map((event, index) => (
                            <li key={index}>{event}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No adverse events selected</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* CER Results Tab */}
        <TabsContent value="results">
          {renderCERResults()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CERV2Page;