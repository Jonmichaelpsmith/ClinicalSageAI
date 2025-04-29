import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, FileText, Beaker, Award } from "lucide-react";
import { 
  getStabilityStudies, 
  uploadStabilityStudy, 
  saveProcessDiagram,
  getProcessDiagram,
  getAnalyticalMethods,
  saveAnalyticalMethod,
  getCertificates,
  saveCertificate
} from '../api/cmc';

/**
 * CMC Page - Chemistry, Manufacturing, and Controls module
 */
const CMCPage = () => {
  // Stability studies
  const [stabilityStudies, setStabilityStudies] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [stabilityMetadata, setStabilityMetadata] = useState({
    studyName: '',
    batchNumber: '',
    startDate: '',
    duration: '12',
    temperature: '25',
    humidity: '60'
  });

  // Process diagram
  const [processDiagram, setProcessDiagram] = useState({
    id: '1',
    name: 'Manufacturing Process',
    json: '',
    svg: ''
  });
  const [processDiagramEditorActive, setProcessDiagramEditorActive] = useState(false);

  // Analytical methods
  const [analyticalMethods, setAnalyticalMethods] = useState([]);
  const [currentMethod, setCurrentMethod] = useState({
    id: '',
    name: '',
    category: 'assay',
    description: '',
    parameters: '',
    acceptanceCriteria: ''
  });

  // Certificate of Analysis
  const [certificates, setCertificates] = useState([]);
  const [currentCertificate, setCurrentCertificate] = useState({
    id: '',
    batchNumber: '',
    date: '',
    productName: '',
    tests: [{ name: '', specification: '', result: '', status: 'pass' }]
  });

  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadStabilityStudies();
    loadProcessDiagram();
    loadAnalyticalMethods();
    loadCertificates();
  }, []);

  // Load stability studies
  const loadStabilityStudies = async () => {
    try {
      const data = await getStabilityStudies();
      setStabilityStudies(data);
    } catch (error) {
      console.error('Error loading stability studies:', error);
    }
  };

  // Handle stability study upload
  const handleStabilityUpload = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('metadata', JSON.stringify(stabilityMetadata));
      
      await uploadStabilityStudy(formData);
      await loadStabilityStudies();
      
      // Reset form
      setSelectedFile(null);
      setStabilityMetadata({
        studyName: '',
        batchNumber: '',
        startDate: '',
        duration: '12',
        temperature: '25',
        humidity: '60'
      });
    } catch (error) {
      console.error('Error uploading stability study:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load process diagram
  const loadProcessDiagram = async () => {
    try {
      const data = await getProcessDiagram('1');
      if (data) {
        setProcessDiagram(data);
      }
    } catch (error) {
      console.error('Error loading process diagram:', error);
    }
  };

  // Save process diagram
  const handleSaveProcessDiagram = async () => {
    setLoading(true);
    try {
      await saveProcessDiagram(processDiagram);
      await loadProcessDiagram();
      setProcessDiagramEditorActive(false);
    } catch (error) {
      console.error('Error saving process diagram:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load analytical methods
  const loadAnalyticalMethods = async () => {
    try {
      const data = await getAnalyticalMethods();
      setAnalyticalMethods(data);
    } catch (error) {
      console.error('Error loading analytical methods:', error);
    }
  };

  // Save analytical method
  const handleSaveAnalyticalMethod = async () => {
    setLoading(true);
    try {
      await saveAnalyticalMethod(currentMethod);
      await loadAnalyticalMethods();
      
      // Reset form for new method
      setCurrentMethod({
        id: '',
        name: '',
        category: 'assay',
        description: '',
        parameters: '',
        acceptanceCriteria: ''
      });
    } catch (error) {
      console.error('Error saving analytical method:', error);
    } finally {
      setLoading(false);
    }
  };

  // Edit existing analytical method
  const handleEditAnalyticalMethod = (method) => {
    setCurrentMethod(method);
  };

  // Load certificates
  const loadCertificates = async () => {
    try {
      const data = await getCertificates();
      setCertificates(data);
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  };

  // Save certificate
  const handleSaveCertificate = async () => {
    setLoading(true);
    try {
      await saveCertificate(currentCertificate);
      await loadCertificates();
      
      // Reset form for new certificate
      setCurrentCertificate({
        id: '',
        batchNumber: '',
        date: '',
        productName: '',
        tests: [{ name: '', specification: '', result: '', status: 'pass' }]
      });
    } catch (error) {
      console.error('Error saving certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add test to certificate
  const addTestToCertificate = () => {
    setCurrentCertificate(prev => ({
      ...prev,
      tests: [...prev.tests, { name: '', specification: '', result: '', status: 'pass' }]
    }));
  };

  // Remove test from certificate
  const removeTestFromCertificate = (index) => {
    setCurrentCertificate(prev => ({
      ...prev,
      tests: prev.tests.filter((_, i) => i !== index)
    }));
  };

  // Update test in certificate
  const updateTestInCertificate = (index, field, value) => {
    setCurrentCertificate(prev => ({
      ...prev,
      tests: prev.tests.map((test, i) => 
        i === index ? { ...test, [field]: value } : test
      )
    }));
  };

  // Edit existing certificate
  const handleEditCertificate = (certificate) => {
    setCurrentCertificate(certificate);
  };

  return (
    <div className="cmc-page-container p-4">
      <h1 className="text-2xl font-bold mb-6">CMC Module</h1>
      
      <Tabs defaultValue="stability">
        <TabsList className="mb-4">
          <TabsTrigger value="stability">Stability Studies</TabsTrigger>
          <TabsTrigger value="process">Process Diagrams</TabsTrigger>
          <TabsTrigger value="analytical">Analytical Methods</TabsTrigger>
          <TabsTrigger value="coa">Certificate of Analysis</TabsTrigger>
        </TabsList>
        
        {/* Stability Studies Tab */}
        <TabsContent value="stability">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Stability Study</CardTitle>
                <CardDescription>Upload stability data in PDF format</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="stability-file"
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    <label
                      htmlFor="stability-file"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                    >
                      <Upload className="h-10 w-10 text-gray-400" />
                      <span className="font-medium text-gray-600">
                        {selectedFile ? selectedFile.name : 'Click to upload stability study PDF'}
                      </span>
                      <span className="text-sm text-gray-500">
                        PDF only, max 10MB
                      </span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Study Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={stabilityMetadata.studyName}
                        onChange={(e) => setStabilityMetadata(prev => ({ ...prev, studyName: e.target.value }))}
                        placeholder="e.g., Accelerated Stability"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Batch Number</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={stabilityMetadata.batchNumber}
                        onChange={(e) => setStabilityMetadata(prev => ({ ...prev, batchNumber: e.target.value }))}
                        placeholder="e.g., B12345"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Start Date</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded"
                        value={stabilityMetadata.startDate}
                        onChange={(e) => setStabilityMetadata(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Duration (months)</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={stabilityMetadata.duration}
                        onChange={(e) => setStabilityMetadata(prev => ({ ...prev, duration: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Temperature (°C)</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={stabilityMetadata.temperature}
                        onChange={(e) => setStabilityMetadata(prev => ({ ...prev, temperature: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Relative Humidity (%)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={stabilityMetadata.humidity}
                      onChange={(e) => setStabilityMetadata(prev => ({ ...prev, humidity: e.target.value }))}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleStabilityUpload}
                    disabled={loading || !selectedFile}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Stability Study'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Stability Studies</CardTitle>
                <CardDescription>Uploaded stability study documents</CardDescription>
              </CardHeader>
              <CardContent>
                {stabilityStudies.length > 0 ? (
                  <div className="space-y-3">
                    {stabilityStudies.map((study, index) => (
                      <div key={index} className="p-3 border rounded bg-white flex items-start">
                        <FileText className="h-6 w-6 mr-3 text-blue-500 flex-shrink-0" />
                        <div className="flex-grow">
                          <h3 className="font-medium">{study.studyName}</h3>
                          <div className="mt-1 text-sm text-gray-500">
                            <div className="flex justify-between">
                              <span>Batch: {study.batchNumber}</span>
                              <span>{study.startDate}</span>
                            </div>
                            <div className="mt-1">
                              {study.temperature}°C / {study.humidity}% RH, {study.duration} months
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(`/api/cmc/stability/${study.id}/download`, '_blank')}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border rounded bg-gray-50">
                    <p className="text-gray-500">No stability studies uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Process Diagrams Tab */}
        <TabsContent value="process">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Manufacturing Process Diagram</CardTitle>
                  <CardDescription>Visual representation of manufacturing process</CardDescription>
                </div>
                {processDiagramEditorActive ? (
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setProcessDiagramEditorActive(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveProcessDiagram}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Diagram'
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setProcessDiagramEditorActive(true)}
                  >
                    Edit Diagram
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {processDiagramEditorActive ? (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Diagram Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={processDiagram.name}
                      onChange={(e) => setProcessDiagram(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Diagram JSON</label>
                    <textarea
                      className="w-full p-2 border rounded font-mono text-sm"
                      rows="10"
                      value={processDiagram.json}
                      onChange={(e) => setProcessDiagram(prev => ({ ...prev, json: e.target.value }))}
                      placeholder="Paste diagram JSON here"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">SVG Output</label>
                    <textarea
                      className="w-full p-2 border rounded font-mono text-sm"
                      rows="10"
                      value={processDiagram.svg}
                      onChange={(e) => setProcessDiagram(prev => ({ ...prev, svg: e.target.value }))}
                      placeholder="Paste SVG code here"
                    />
                  </div>
                </div>
              ) : (
                <div className="border rounded p-4 bg-white">
                  {processDiagram.svg ? (
                    <div 
                      className="w-full h-96 overflow-auto"
                      dangerouslySetInnerHTML={{ __html: processDiagram.svg }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-96 bg-gray-50">
                      <div className="text-center">
                        <p className="text-gray-500">No process diagram available</p>
                        <p className="text-sm text-gray-400 mt-1">Click 'Edit Diagram' to create one</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytical Methods Tab */}
        <TabsContent value="analytical">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytical Method</CardTitle>
                <CardDescription>Define analytical testing methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Method Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={currentMethod.name}
                      onChange={(e) => setCurrentMethod(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., HPLC Assay"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Category</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={currentMethod.category}
                      onChange={(e) => setCurrentMethod(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="assay">Assay</option>
                      <option value="impurities">Impurities</option>
                      <option value="dissolution">Dissolution</option>
                      <option value="identification">Identification</option>
                      <option value="physical">Physical Testing</option>
                      <option value="microbial">Microbial Testing</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Description</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="4"
                      value={currentMethod.description}
                      onChange={(e) => setCurrentMethod(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the analytical method"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Parameters</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="4"
                      value={currentMethod.parameters}
                      onChange={(e) => setCurrentMethod(prev => ({ ...prev, parameters: e.target.value }))}
                      placeholder="Key parameters (e.g., column, mobile phase, etc.)"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Acceptance Criteria</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="4"
                      value={currentMethod.acceptanceCriteria}
                      onChange={(e) => setCurrentMethod(prev => ({ ...prev, acceptanceCriteria: e.target.value }))}
                      placeholder="Define acceptance criteria"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSaveAnalyticalMethod}
                    disabled={loading || !currentMethod.name}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      currentMethod.id ? 'Update Method' : 'Save Method'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Analytical Methods</CardTitle>
                <CardDescription>Saved analytical test methods</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticalMethods.length > 0 ? (
                  <div className="space-y-3">
                    {analyticalMethods.map((method, index) => (
                      <div key={index} className="p-3 border rounded bg-white">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Beaker className="h-5 w-5 mr-2 text-blue-500" />
                            <h3 className="font-medium">{method.name}</h3>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditAnalyticalMethod(method)}
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="mt-2">
                          <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                            {method.category.charAt(0).toUpperCase() + method.category.slice(1)}
                          </span>
                        </div>
                        {method.description && (
                          <p className="mt-2 text-sm">{method.description.substring(0, 100)}
                            {method.description.length > 100 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border rounded bg-gray-50">
                    <p className="text-gray-500">No analytical methods defined yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Certificate of Analysis Tab */}
        <TabsContent value="coa">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Certificate of Analysis</CardTitle>
                <CardDescription>Create batch release certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Batch Number</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={currentCertificate.batchNumber}
                        onChange={(e) => setCurrentCertificate(prev => ({ ...prev, batchNumber: e.target.value }))}
                        placeholder="e.g., B12345"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Date</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded"
                        value={currentCertificate.date}
                        onChange={(e) => setCurrentCertificate(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Product Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={currentCertificate.productName}
                      onChange={(e) => setCurrentCertificate(prev => ({ ...prev, productName: e.target.value }))}
                      placeholder="e.g., Product XYZ 10mg Tablets"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium">Tests</label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={addTestToCertificate}
                      >
                        Add Test
                      </Button>
                    </div>
                    
                    {currentCertificate.tests.map((test, index) => (
                      <div key={index} className="p-3 border rounded mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Test #{index + 1}</h4>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeTestFromCertificate(index)}
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block mb-1 text-sm">Test Name</label>
                            <input
                              type="text"
                              className="w-full p-2 border rounded"
                              value={test.name}
                              onChange={(e) => updateTestInCertificate(index, 'name', e.target.value)}
                              placeholder="e.g., Assay"
                            />
                          </div>
                          
                          <div>
                            <label className="block mb-1 text-sm">Specification</label>
                            <input
                              type="text"
                              className="w-full p-2 border rounded"
                              value={test.specification}
                              onChange={(e) => updateTestInCertificate(index, 'specification', e.target.value)}
                              placeholder="e.g., 90.0-110.0%"
                            />
                          </div>
                          
                          <div>
                            <label className="block mb-1 text-sm">Result</label>
                            <input
                              type="text"
                              className="w-full p-2 border rounded"
                              value={test.result}
                              onChange={(e) => updateTestInCertificate(index, 'result', e.target.value)}
                              placeholder="e.g., 99.5%"
                            />
                          </div>
                          
                          <div>
                            <label className="block mb-1 text-sm">Status</label>
                            <select
                              className="w-full p-2 border rounded"
                              value={test.status}
                              onChange={(e) => updateTestInCertificate(index, 'status', e.target.value)}
                            >
                              <option value="pass">Pass</option>
                              <option value="fail">Fail</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={handleSaveCertificate}
                    disabled={loading || !currentCertificate.batchNumber || !currentCertificate.productName}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      currentCertificate.id ? 'Update Certificate' : 'Save Certificate'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Certificates</CardTitle>
                <CardDescription>Saved certificates of analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {certificates.length > 0 ? (
                  <div className="space-y-3">
                    {certificates.map((cert, index) => (
                      <div key={index} className="p-3 border rounded bg-white">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Award className="h-5 w-5 mr-2 text-green-500" />
                            <div>
                              <h3 className="font-medium">{cert.productName}</h3>
                              <div className="text-sm text-gray-500">
                                Batch: {cert.batchNumber} | {cert.date}
                              </div>
                            </div>
                          </div>
                          <div className="space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditCertificate(cert)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`/api/cmc/certificates/${cert.id}/pdf`, '_blank')}
                            >
                              PDF
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-3 border-t pt-2">
                          <div className="text-sm">
                            {cert.tests.some(test => test.status === 'fail') ? (
                              <span className="text-red-600 font-medium">Failed</span>
                            ) : (
                              <span className="text-green-600 font-medium">Passed All Tests</span>
                            )}
                            <span className="text-gray-500 ml-2">
                              ({cert.tests.length} tests)
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border rounded bg-gray-50">
                    <p className="text-gray-500">No certificates created yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CMCPage;