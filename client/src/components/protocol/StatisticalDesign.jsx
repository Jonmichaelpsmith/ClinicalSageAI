import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import { Calculator, ActivitySquare, LineChart, Brain, Users, AlertTriangle, FileText, Clipboard } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import EnzymaxStudyDesign from './EnzymaxStudyDesign';
import StudyDesignReport from './StudyDesignReport';

/**
 * StatisticalDesign component for the TrialSage Study Architect module
 * Implements advanced statistical calculations for clinical trial design
 */
const StatisticalDesign = () => {
  // State for study design parameters
  const [testType, setTestType] = useState('superiority');
  const [alpha, setAlpha] = useState(0.05);
  const [effectSize, setEffectSize] = useState(0.5);
  const [margin, setMargin] = useState(0.2);
  const [maxN, setMaxN] = useState(500);
  const [stdDev, setStdDev] = useState(1.0);
  const [nSimulations, setNSimulations] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  // State for study parameters
  const [studyParameters, setStudyParameters] = useState({
    indication: 'Functional Dyspepsia',
    phase: 'Phase II',
    design: 'Randomized, double-blind, placebo-controlled',
    primaryEndpoint: 'Change in NDI SF score from baseline to week 8',
    secondaryEndpoints: ['Quality of life assessment', 'Global symptom relief'],
    duration: '8 weeks',
    visits: 5,
    population: 'Adults with functional dyspepsia (Rome IV criteria)'
  });
  
  // State for OpenAI integration and vector database
  const [isGeneratingAIRecommendations, setIsGeneratingAIRecommendations] = useState(false);
  const [vectorSearchResults, setVectorSearchResults] = useState(null);
  const [similarTrials, setSimilarTrials] = useState([]);
  
  // State for study design mode
  const [designMode, setDesignMode] = useState('general');
  
  // Simulate running statistical calculations locally if API is not available
  const simulateCalculation = () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API delay
    setTimeout(() => {
      try {
        // Generate sample power curve data
        const powerCurveData = [];
        const z_alpha = testType === 'superiority' ? 1.96 : 1.645; // Two-sided vs. one-sided
        const z_beta = 0.84; // For 80% power
        
        let adjustedEffect = effectSize;
        if (testType === 'non_inferiority') {
          adjustedEffect = effectSize - margin;
        }
        
        // Calculate theoretical sample size
        const n_theoretical = Math.ceil(2 * ((z_alpha + z_beta) ** 2) * (stdDev ** 2) / (adjustedEffect ** 2));
        
        // Generate power curve points
        const points = 15;
        const minN = Math.max(10, Math.floor(n_theoretical * 0.2));
        const step = Math.ceil((maxN - minN) / points);
        
        for (let n = minN; n <= maxN; n += step) {
          let power = 0;
          
          if (testType === 'superiority') {
            // Calculate power for superiority test
            const ncp = (adjustedEffect) / (stdDev * Math.sqrt(2/n));  // Non-centrality parameter
            power = 1 - 0.5 * (1 + erf((z_alpha - ncp) / Math.sqrt(2)));
          } else {
            // Calculate power for non-inferiority test
            const ncp = adjustedEffect / (stdDev * Math.sqrt(2/n));
            power = 1 - 0.5 * (1 + erf((z_alpha - ncp) / Math.sqrt(2)));
          }
          
          powerCurveData.push({
            sampleSize: n,
            power: power
          });
        }
        
        // Find the sample size needed for 80% power
        let recommendedN = powerCurveData.find(d => d.power >= 0.8)?.sampleSize || maxN;
        
        setResults({
          powerCurve: powerCurveData,
          recommendedN: recommendedN,
          testType: testType,
          effectSize: effectSize,
          alpha: alpha,
          margin: testType === 'non_inferiority' ? margin : null
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Calculation error:', err);
        setError('Error performing statistical calculation');
        setIsLoading(false);
      }
    }, 1000);
  };
  
  // Helper function for error function (erf)
  function erf(x) {
    // Constants
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    
    // Save the sign of x
    const sign = (x < 0) ? -1 : 1;
    x = Math.abs(x);
    
    // A&S formula 7.1.26
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
  }
  
  // Calculate power using the API endpoint
  const calculatePower = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to use the API if available
      const response = await fetch('/api/study/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_type: testType,
          alpha: alpha,
          effect_size: effectSize,
          margin: testType === 'non_inferiority' ? margin : null,
          max_n: maxN,
          std_dev: stdDev,
          n_simulations: nSimulations
        }),
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('API error:', err);
      console.log('Falling back to local calculation');
      // Fall back to local calculation if API is not available
      simulateCalculation();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-orange-100 to-orange-50 border-b">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Calculator className="h-6 w-6" />
            Statistical Design & Power Analysis
          </CardTitle>
          <CardDescription>
            Advanced statistical calculations for clinical trial design optimization
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="general" className="w-full" onValueChange={setDesignMode}>
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span>General Design</span>
              </TabsTrigger>
              <TabsTrigger value="enzymax" className="flex items-center gap-2">
                <ActivitySquare className="h-4 w-4" />
                <span>Enzymax Study Design</span>
              </TabsTrigger>
              <TabsTrigger value="phase-selector" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Phase & TA Selector</span>
              </TabsTrigger>
              <TabsTrigger value="adaptive" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span>Adaptive Design</span>
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Generate Report</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Study Design Type</Label>
                    <RadioGroup 
                      defaultValue={testType} 
                      onValueChange={setTestType}
                    >
                      <div className="flex items-center space-x-2">
                        <Radio value="superiority" id="superiority" />
                        <Label htmlFor="superiority">Superiority</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Radio value="non_inferiority" id="non_inferiority" />
                        <Label htmlFor="non_inferiority">Non-Inferiority</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="effectSize">Effect Size (Cohen's d)</Label>
                      <span className="text-sm font-medium">{effectSize.toFixed(2)}</span>
                    </div>
                    <Slider
                      id="effectSize"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={[effectSize]}
                      onValueChange={(value) => setEffectSize(value[0])}
                    />
                    <p className="text-xs text-gray-500">
                      Small (0.2), Medium (0.5), Large (0.8)
                    </p>
                  </div>
                  
                  {testType === 'non_inferiority' && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="margin">Non-Inferiority Margin</Label>
                        <span className="text-sm font-medium">{margin.toFixed(2)}</span>
                      </div>
                      <Slider
                        id="margin"
                        min={0.05}
                        max={0.5}
                        step={0.05}
                        value={[margin]}
                        onValueChange={(value) => setMargin(value[0])}
                      />
                      <p className="text-xs text-gray-500">
                        Smaller values require larger sample sizes
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="stdDev">Standard Deviation</Label>
                      <span className="text-sm font-medium">{stdDev.toFixed(1)}</span>
                    </div>
                    <Slider
                      id="stdDev"
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      value={[stdDev]}
                      onValueChange={(value) => setStdDev(value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="alpha">Alpha (Type I Error)</Label>
                      <span className="text-sm font-medium">{alpha.toFixed(3)}</span>
                    </div>
                    <Slider
                      id="alpha"
                      min={0.01}
                      max={0.1}
                      step={0.01}
                      value={[alpha]}
                      onValueChange={(value) => setAlpha(value[0])}
                    />
                    <p className="text-xs text-gray-500">
                      Standard is 0.05 (5% false positive rate)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxN">Maximum Sample Size</Label>
                    <Input
                      id="maxN"
                      type="number"
                      min={10}
                      max={2000}
                      value={maxN}
                      onChange={(e) => setMaxN(parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nSimulations">Simulation Iterations</Label>
                    <Select value={nSimulations.toString()} onValueChange={(value) => setNSimulations(parseInt(value))}>
                      <SelectTrigger id="nSimulations">
                        <SelectValue placeholder="Number of simulations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 (Quick)</SelectItem>
                        <SelectItem value="1000">1,000 (Standard)</SelectItem>
                        <SelectItem value="10000">10,000 (High Precision)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700" 
                    onClick={calculatePower}
                    disabled={isLoading}
                  >
                    {isLoading ? "Calculating..." : "Calculate Power"}
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {error && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-800 flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Calculation Error</p>
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  )}
                  
                  {results && (
                    <div className="space-y-4">
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                        <h3 className="font-medium text-orange-800 mb-2">Recommended Sample Size</h3>
                        <p className="text-3xl font-bold text-orange-800">
                          {results.recommendedN} <span className="text-base font-normal text-gray-500">per arm</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Total: {results.recommendedN * 2} subjects for 80% power
                        </p>
                      </div>
                      
                      {results.powerCurve && (
                        <div className="space-y-2">
                          <h3 className="font-medium">Power Curve</h3>
                          <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={results.powerCurve}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="sampleSize" 
                                  label={{ value: 'Sample Size (per arm)', position: 'insideBottomRight', offset: -10 }} 
                                />
                                <YAxis 
                                  domain={[0, 1]} 
                                  label={{ value: 'Power (1-β)', angle: -90, position: 'insideLeft' }}
                                  tickFormatter={(value) => value.toFixed(1)} 
                                />
                                <Tooltip 
                                  formatter={(value, name) => [value.toFixed(3), 'Power']}
                                  labelFormatter={(value) => `Sample Size: ${value} per arm`}
                                />
                                <ReferenceLine y={0.8} stroke="red" strokeDasharray="3 3" />
                                <ReferenceLine y={0.9} stroke="blue" strokeDasharray="3 3" />
                                <Area 
                                  type="monotone" 
                                  dataKey="power" 
                                  stroke="#ff9800" 
                                  fill="#ffcc80" 
                                  activeDot={{ r: 8 }} 
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex justify-center space-x-8 text-sm">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-red-500 mr-1"></div>
                              <span>80% Power</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-blue-500 mr-1"></div>
                              <span>90% Power</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <h3 className="font-medium mb-2">Parameters Used</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Test Type:</span> {results.testType === 'superiority' ? 'Superiority' : 'Non-Inferiority'}
                          </div>
                          <div>
                            <span className="font-medium">Effect Size:</span> {results.effectSize.toFixed(2)}
                          </div>
                          <div>
                            <span className="font-medium">Alpha:</span> {results.alpha.toFixed(3)}
                          </div>
                          {results.margin !== null && (
                            <div>
                              <span className="font-medium">NI Margin:</span> {results.margin.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="enzymax">
              <EnzymaxStudyDesign />
            </TabsContent>
            
            <TabsContent value="phase-selector">
              <div className="space-y-6">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <h3 className="font-medium text-orange-800 mb-2">Study Phase & Therapeutic Area Configuration</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Configure statistical design parameters according to study phase and therapeutic area requirements
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>Study Phase</Label>
                      <RadioGroup defaultValue="phase2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                            <Radio value="phase1" id="phase1" />
                            <Label htmlFor="phase1">Phase I</Label>
                          </div>
                          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                            <Radio value="phase2" id="phase2" />
                            <Label htmlFor="phase2">Phase II</Label>
                          </div>
                          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                            <Radio value="phase3" id="phase3" />
                            <Label htmlFor="phase3">Phase III</Label>
                          </div>
                          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                            <Radio value="phase4" id="phase4" />
                            <Label htmlFor="phase4">Phase IV</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Study Stage</Label>
                      <Select defaultValue="dose-finding">
                        <SelectTrigger>
                          <SelectValue placeholder="Select study stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fih">First-in-Human</SelectItem>
                          <SelectItem value="sad">Single Ascending Dose</SelectItem>
                          <SelectItem value="mad">Multiple Ascending Dose</SelectItem>
                          <SelectItem value="dose-finding">Dose-Finding</SelectItem>
                          <SelectItem value="proof-of-concept">Proof of Concept</SelectItem>
                          <SelectItem value="pivotal">Pivotal</SelectItem>
                          <SelectItem value="post-marketing">Post-Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Therapeutic Area</Label>
                      <Select defaultValue="gastroenterology">
                        <SelectTrigger>
                          <SelectValue placeholder="Select therapeutic area" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oncology">Oncology</SelectItem>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="neurology">Neurology</SelectItem>
                          <SelectItem value="immunology">Immunology</SelectItem>
                          <SelectItem value="gastroenterology">Gastroenterology</SelectItem>
                          <SelectItem value="infectious-disease">Infectious Disease</SelectItem>
                          <SelectItem value="endocrinology">Endocrinology</SelectItem>
                          <SelectItem value="respiratory">Respiratory</SelectItem>
                          <SelectItem value="dermatology">Dermatology</SelectItem>
                          <SelectItem value="rare-disease">Rare Disease</SelectItem>
                          <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                          <SelectItem value="psychiatry">Psychiatry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Specific Indication</Label>
                      <Select defaultValue="functional-dyspepsia">
                        <SelectTrigger>
                          <SelectValue placeholder="Select indication" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="functional-dyspepsia">Functional Dyspepsia</SelectItem>
                          <SelectItem value="chronic-pancreatitis">Chronic Pancreatitis</SelectItem>
                          <SelectItem value="ibs-d">IBS with Diarrhea</SelectItem>
                          <SelectItem value="gerd">Gastroesophageal Reflux Disease</SelectItem>
                          <SelectItem value="peptic-ulcer">Peptic Ulcer Disease</SelectItem>
                          <SelectItem value="crohns">Crohn's Disease</SelectItem>
                          <SelectItem value="ulcerative-colitis">Ulcerative Colitis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      Apply Parameters
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="font-medium text-blue-800 mb-2">Configuration Guide</h3>
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Phase II - Dose Finding</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Design:</span> Randomized, parallel, placebo-controlled
                          </div>
                          <div>
                            <span className="font-medium">Typical N:</span> 40-120 subjects
                          </div>
                          <div>
                            <span className="font-medium">Power:</span> 80%
                          </div>
                          <div>
                            <span className="font-medium">Alpha:</span> 0.05
                          </div>
                          <div>
                            <span className="font-medium">Endpoint:</span> Biomarker/surrogate
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <h4 className="text-sm font-medium mb-2">Gastroenterology - Functional Dyspepsia</h4>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                          <li>Typical outcome: NDI score reduction</li>
                          <li>Expected placebo effect: 20-30%</li>
                          <li>Clinically meaningful difference: 15 points</li>
                          <li>Standard deviation: ~19 points</li>
                          <li>Non-inferiority margin: -10 points</li>
                        </ul>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <h4 className="text-sm font-medium">Regulatory Considerations</h4>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                          <li>FDA prefers superiority design for initial approval</li>
                          <li>EMA may accept non-inferiority for established treatments</li>
                          <li>Consider stratification by disease severity</li>
                          <li>Patient-reported outcomes should be validated instruments</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Parameter Recommendations</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Test Type:</span>
                          <span className="text-sm font-medium">Superiority</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Expected Effect Size:</span>
                          <span className="text-sm font-medium">0.5 (medium)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Alpha:</span>
                          <span className="text-sm font-medium">0.05</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Power:</span>
                          <span className="text-sm font-medium">80%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Recommended N:</span>
                          <span className="text-sm font-medium">64 per arm (128 total)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">With 20% Dropout:</span>
                          <span className="text-sm font-medium">160 subjects</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="adaptive">
              <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg text-center space-y-4">
                <Brain className="h-16 w-16 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-500">Adaptive Design Module</h3>
                <p className="text-gray-400 max-w-md">
                  This module will provide adaptive trial design capabilities, including 
                  sample size re-estimation, group sequential methods, and Bayesian adaptive designs.
                </p>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="bg-gradient-to-r from-orange-50 to-orange-100 border-t px-6 py-3">
          <div className="text-sm text-gray-500 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Trial power analysis based on statistical methods from FDA and EMA guidance documents
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StatisticalDesign;