import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { generateNarrative, detectSignals, analyzeBenefitRisk } from '../api/csr';

/**
 * CSR Deep Intelligence - AI-driven CSR analysis and generation tools
 */
const CSRPage = () => {
  const [loading, setLoading] = useState(false);
  const [narrativeInput, setNarrativeInput] = useState({
    studyId: '',
    patientId: '',
    eventDescription: '',
    medicalHistory: '',
    concomitantMeds: ''
  });
  
  const [signalInput, setSignalInput] = useState({
    drugName: '',
    dataSource: 'faers', // Default to FAERS database
    timeframe: 'last5years'
  });
  
  const [benefitRiskInput, setBenefitRiskInput] = useState({
    drugName: '',
    indication: '',
    efficacyData: '',
    safetyData: ''
  });
  
  const [narrativeResult, setNarrativeResult] = useState('');
  const [signalResults, setSignalResults] = useState([]);
  const [benefitRiskResult, setBenefitRiskResult] = useState({});

  // Handle narrative generation
  const handleGenerateNarrative = async () => {
    setLoading(true);
    try {
      const data = await generateNarrative(narrativeInput);
      setNarrativeResult(data.narrative);
    } catch (error) {
      console.error('Error generating narrative:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle signal detection
  const handleDetectSignals = async () => {
    setLoading(true);
    try {
      const data = await detectSignals(signalInput);
      setSignalResults(data.signals);
    } catch (error) {
      console.error('Error detecting signals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle benefit-risk analysis
  const handleBenefitRiskAnalysis = async () => {
    setLoading(true);
    try {
      const data = await analyzeBenefitRisk(benefitRiskInput);
      setBenefitRiskResult(data);
    } catch (error) {
      console.error('Error analyzing benefit-risk:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="csr-page-container p-4">
      <h1 className="text-2xl font-bold mb-6">CSR Deep Intelligence</h1>
      
      <Tabs defaultValue="narrative">
        <TabsList className="mb-4">
          <TabsTrigger value="narrative">Narrative Generator</TabsTrigger>
          <TabsTrigger value="signals">AE Signal Detection</TabsTrigger>
          <TabsTrigger value="benefit-risk">Benefit-Risk Assessment</TabsTrigger>
        </TabsList>
        
        {/* Narrative Generator Tab */}
        <TabsContent value="narrative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Case Narrative Generator</CardTitle>
                <CardDescription>Generate patient case narratives for your CSR</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Study ID</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={narrativeInput.studyId}
                        onChange={(e) => setNarrativeInput(prev => ({ ...prev, studyId: e.target.value }))}
                        placeholder="e.g., ABC-123"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Patient ID</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={narrativeInput.patientId}
                        onChange={(e) => setNarrativeInput(prev => ({ ...prev, patientId: e.target.value }))}
                        placeholder="e.g., P-001"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Event Description</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="3"
                      value={narrativeInput.eventDescription}
                      onChange={(e) => setNarrativeInput(prev => ({ ...prev, eventDescription: e.target.value }))}
                      placeholder="Describe the adverse event"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Medical History</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="3"
                      value={narrativeInput.medicalHistory}
                      onChange={(e) => setNarrativeInput(prev => ({ ...prev, medicalHistory: e.target.value }))}
                      placeholder="Patient's relevant medical history"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Concomitant Medications</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="3"
                      value={narrativeInput.concomitantMeds}
                      onChange={(e) => setNarrativeInput(prev => ({ ...prev, concomitantMeds: e.target.value }))}
                      placeholder="Any medications the patient was taking"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleGenerateNarrative}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Narrative'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Generated Narrative</CardTitle>
                <CardDescription>AI-generated patient case narrative</CardDescription>
              </CardHeader>
              <CardContent>
                {narrativeResult ? (
                  <div className="p-4 border rounded bg-white">
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: narrativeResult.replace(/\n/g, '<br/>') }}
                    />
                  </div>
                ) : (
                  <div className="text-center p-6 border rounded bg-gray-50">
                    <p className="text-gray-500">Generated narrative will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Signal Detection Tab */}
        <TabsContent value="signals">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Adverse Event Signal Detection</CardTitle>
                <CardDescription>Identify potential safety signals for your product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Drug Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={signalInput.drugName}
                      onChange={(e) => setSignalInput(prev => ({ ...prev, drugName: e.target.value }))}
                      placeholder="e.g., Acetaminophen"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Data Source</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={signalInput.dataSource}
                      onChange={(e) => setSignalInput(prev => ({ ...prev, dataSource: e.target.value }))}
                    >
                      <option value="faers">FDA Adverse Event Reporting System (FAERS)</option>
                      <option value="eudravigilance">EudraVigilance (EU)</option>
                      <option value="vaers">Vaccine Adverse Event Reporting System (VAERS)</option>
                      <option value="literature">Published Literature</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Timeframe</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={signalInput.timeframe}
                      onChange={(e) => setSignalInput(prev => ({ ...prev, timeframe: e.target.value }))}
                    >
                      <option value="last1year">Last 1 Year</option>
                      <option value="last5years">Last 5 Years</option>
                      <option value="last10years">Last 10 Years</option>
                      <option value="alltime">All Time</option>
                    </select>
                  </div>
                  
                  <Button 
                    onClick={handleDetectSignals}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Detect Signals'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Detected Signals</CardTitle>
                <CardDescription>Potential safety signals identified</CardDescription>
              </CardHeader>
              <CardContent>
                {signalResults.length > 0 ? (
                  <div className="space-y-3">
                    {signalResults.map((signal, index) => (
                      <div key={index} className="p-3 border rounded bg-white">
                        <div className="flex items-start">
                          <div className={`w-2 h-2 mt-1.5 rounded-full mr-2 ${
                            signal.signalStrength === 'strong' ? 'bg-red-500' :
                            signal.signalStrength === 'moderate' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`} />
                          <div>
                            <h3 className="font-medium">{signal.eventTerm}</h3>
                            <div className="mt-1 text-sm">
                              <div className="flex justify-between">
                                <span>Reports: {signal.reportCount}</span>
                                <span className={
                                  signal.signalStrength === 'strong' ? 'text-red-600' :
                                  signal.signalStrength === 'moderate' ? 'text-yellow-600' :
                                  'text-blue-600'
                                }>
                                  {signal.signalStrength.charAt(0).toUpperCase() + signal.signalStrength.slice(1)}
                                </span>
                              </div>
                              <p className="mt-1">{signal.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border rounded bg-gray-50">
                    <p className="text-gray-500">Detected signals will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Benefit-Risk Tab */}
        <TabsContent value="benefit-risk">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Benefit-Risk Assessment</CardTitle>
                <CardDescription>Analyze the benefit-risk profile of your product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Drug Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={benefitRiskInput.drugName}
                      onChange={(e) => setBenefitRiskInput(prev => ({ ...prev, drugName: e.target.value }))}
                      placeholder="e.g., Acetaminophen"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Indication</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={benefitRiskInput.indication}
                      onChange={(e) => setBenefitRiskInput(prev => ({ ...prev, indication: e.target.value }))}
                      placeholder="e.g., Pain Relief"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Efficacy Data</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="4"
                      value={benefitRiskInput.efficacyData}
                      onChange={(e) => setBenefitRiskInput(prev => ({ ...prev, efficacyData: e.target.value }))}
                      placeholder="Summarize key efficacy findings"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Safety Data</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="4"
                      value={benefitRiskInput.safetyData}
                      onChange={(e) => setBenefitRiskInput(prev => ({ ...prev, safetyData: e.target.value }))}
                      placeholder="Summarize key safety findings"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleBenefitRiskAnalysis}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Benefit-Risk'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Benefit-Risk Summary</CardTitle>
                <CardDescription>AI-generated benefit-risk analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(benefitRiskResult).length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-3 border rounded bg-white">
                      <h3 className="font-medium mb-2">Benefit Summary</h3>
                      <p>{benefitRiskResult.benefitSummary}</p>
                    </div>
                    
                    <div className="p-3 border rounded bg-white">
                      <h3 className="font-medium mb-2">Risk Summary</h3>
                      <p>{benefitRiskResult.riskSummary}</p>
                    </div>
                    
                    <div className="p-3 border rounded bg-white">
                      <h3 className="font-medium mb-2">Overall Assessment</h3>
                      <p>{benefitRiskResult.overallAssessment}</p>
                    </div>
                    
                    {benefitRiskResult.recommendations && (
                      <div className="p-3 border rounded bg-white">
                        <h3 className="font-medium mb-2">Recommendations</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {benefitRiskResult.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-6 border rounded bg-gray-50">
                    <p className="text-gray-500">Benefit-risk analysis will appear here</p>
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

export default CSRPage;