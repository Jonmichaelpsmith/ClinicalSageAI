import React from 'react';
import { useLocation } from 'wouter';
import LumenValuePropositionBanner from '@/components/LumenValuePropositionBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  Beaker, 
  FileText, 
  FlaskConical, 
  ListChecks, 
  LineChart, 
  ScrollText,
  Brain,
  BarChart3,
  Network,
  Shield,
  Microscope
} from 'lucide-react';

const LandingPage = () => {
  const [_, navigate] = useLocation();
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <LumenValuePropositionBanner />
      
      {/* Our Platform Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">The LumenTrialGuide.AI Platform</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our end-to-end clinical trial intelligence platform transforms raw CSR data into actionable insights using AI and advanced analytics.
          </p>
        </div>
        
        <Tabs defaultValue="evidence" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="evidence">Evidence Engine</TabsTrigger>
            <TabsTrigger value="protocol">Protocol Advisor</TabsTrigger>
            <TabsTrigger value="analytics">Insights Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="evidence" className="border rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">CSR Evidence Engine</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  The foundation of our platform is our comprehensive Clinical Study Report (CSR) repository, with over 3,000 fully structured and analyzed reports across therapeutic areas.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <FileText className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">ICH-Compliant Schema:</span> All CSRs structured according to ICH E3 guidelines for consistent analysis
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <Network className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Global Regulatory Sources:</span> Data from FDA, EMA, and Health Canada, continuously updated
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <Beaker className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Advanced Extraction:</span> AI-powered extraction of endpoints, eligibility criteria, safety data, and more
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <Brain className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Semantic Understanding:</span> Vector embeddings enable context-rich search and similarity analysis
                    </p>
                  </li>
                </ul>
                <Button onClick={() => navigate('/csr-search')} className="mt-2">
                  Explore CSR Library <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">CSR Library Statistics</h4>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total CSRs</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">3,021</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Therapeutic Areas</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">27</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Indications</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">142</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Standardized Endpoints</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">853</p>
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Phase Distribution</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phase 1</p>
                      <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">482</p>
                    </div>
                  </div>
                  <div>
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phase 1/2</p>
                      <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">454</p>
                    </div>
                  </div>
                  <div>
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phase 2</p>
                      <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">456</p>
                    </div>
                  </div>
                  <div>
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phase 2/3</p>
                      <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">470</p>
                    </div>
                  </div>
                  <div>
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phase 3</p>
                      <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">472</p>
                    </div>
                  </div>
                  <div>
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phase 4</p>
                      <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">472</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="protocol" className="border rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">Strategic Protocol Recommendations Advisor (SPRA)</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Our flagship module translates CSR evidence into actionable protocol recommendations, optimizing your clinical development strategy with insights derived from successful trials.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <FlaskConical className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Study Design Optimization:</span> Evidence-based recommendations for randomization, blinding, control types, and visit schedules
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <BarChart3 className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Sample Size Calculation:</span> Optimal sample size recommendations based on historical data in your indication
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <ListChecks className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Eligibility Criteria Analysis:</span> Identify optimal inclusion/exclusion criteria that balance enrollment with outcomes
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <LineChart className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Endpoint Selection:</span> Data-driven recommendations for primary and secondary endpoints with highest success rates
                    </p>
                  </li>
                </ul>
                <Button onClick={() => navigate('/spra-direct')} className="mt-2">
                  Try Protocol Advisor <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">SPRA Key Capabilities</h4>
                
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100">Risk Prediction & Mitigation</h5>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Identifies protocol-specific risks and provides evidence-based mitigation strategies to enhance protocol resilience.
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <ScrollText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100">Regulatory Alignment</h5>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Ensures your protocol aligns with latest regulatory guidance and precedents from successful submissions.
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Microscope className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100">Statistical Power Optimization</h5>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Maximize statistical power while minimizing resource utilization through evidence-based parameter tuning.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Success Case: Oncology Phase 2</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    SPRA helped optimize a Phase 2 solid tumor trial, reducing sample size by 18% while maintaining statistical power, saving $3.2M in development costs.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="border rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">Clinical Insights Analytics</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Our analytics platform transforms CSR data into actionable clinical development insights, helping you make evidence-driven decisions at every stage.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <LineChart className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Trend Analysis:</span> Identify emerging patterns in trial design, endpoint selection, and success factors across therapeutic areas
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <Beaker className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Comparative Analytics:</span> Compare your protocol against similar successful trials to identify optimization opportunities
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <Shield className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Safety Signal Detection:</span> Early identification of safety concerns based on patterns in similar compounds and indications
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <Brain className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">AI-Powered Recommendations:</span> Machine learning models that continuously improve based on new data and outcomes
                    </p>
                  </li>
                </ul>
                <Button onClick={() => navigate('/csr-analytics')} className="mt-2">
                  Explore Analytics <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Key Analytics Insights</h4>
                
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100">Protocol Success Prediction</h5>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>0%</span>
                        <span className="font-medium text-green-600 dark:text-green-400">78% Success Probability</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100">Top Performing Endpoints</h5>
                    <div className="mt-2 space-y-2">
                      <div>
                        <div className="flex justify-between text-xs">
                          <span>Overall Survival</span>
                          <span>92%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                          <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs">
                          <span>ORR (RECIST 1.1)</span>
                          <span>86%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                          <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '86%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs">
                          <span>PFS</span>
                          <span>79%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                          <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '79%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100">Sample Size Optimization</h5>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
                        <p className="font-semibold text-indigo-600 dark:text-indigo-400">220</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Optimized</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">184</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Savings</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">16.4%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
      
      {/* How It Works */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">How LumenTrialGuide.AI Works</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our end-to-end platform transforms raw clinical study data into actionable insights for optimized trial design.
          </p>
        </div>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-indigo-200 dark:bg-indigo-900/50"></div>
          
          {/* Steps */}
          <div className="relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="md:w-1/2 md:pr-12 mb-4 md:mb-0 text-right md:text-right">
                <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-2">CSR Acquisition & Processing</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We collect clinical study reports from global regulatory agencies, transform them into structured data using our AI extraction pipeline, and store them in our semantic database.
                </p>
              </div>
              <div className="md:w-8 flex justify-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">1</div>
              </div>
              <div className="md:w-1/2 md:pl-12"></div>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="md:w-1/2 md:pr-12"></div>
              <div className="md:w-8 flex justify-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">2</div>
              </div>
              <div className="md:w-1/2 md:pl-12 mb-4 md:mb-0 text-left md:text-left">
                <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-2">Advanced Knowledge Engine</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Our AI analyzes thousands of CSRs to identify patterns in successful and failed trials, creating a knowledge graph of clinical evidence across therapeutic areas and phases.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="md:w-1/2 md:pr-12 mb-4 md:mb-0 text-right md:text-right">
                <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-2">Strategic Insight Generation</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  The platform generates actionable recommendations by comparing your protocol against similar trials, identifying optimization opportunities for design, endpoints, and eligibility criteria.
                </p>
              </div>
              <div className="md:w-8 flex justify-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">3</div>
              </div>
              <div className="md:w-1/2 md:pl-12"></div>
            </div>
            
            {/* Step 4 */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-12"></div>
              <div className="md:w-8 flex justify-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">4</div>
              </div>
              <div className="md:w-1/2 md:pl-12 mb-4 md:mb-0 text-left md:text-left">
                <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-2">Optimized Protocol Development</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Incorporate evidence-based recommendations into your protocol development process, resulting in optimized trial designs with higher success probability and lower development costs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Personas Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">Designed for Your Clinical Development Team</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            LumenTrialGuide.AI delivers value across your entire clinical development organization.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-indigo-100 dark:border-indigo-900 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Clinical Development Directors</CardTitle>
              <CardDescription>Strategic overview and portfolio optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Evidence-based go/no-go decision support for program advancement
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Comparative analysis across similar development programs
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Resource allocation optimization based on success probability
                  </p>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-indigo-100 dark:border-indigo-900 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Medical Directors & Scientists</CardTitle>
              <CardDescription>Clinical strategy and protocol design</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Evidence-based endpoint selection and patient population definition
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Study design optimization based on successful precedents
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Real-world data integration for contextualizing trial design
                  </p>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-indigo-100 dark:border-indigo-900 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Biostatisticians</CardTitle>
              <CardDescription>Statistical planning and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Evidence-based sample size calculation and power analysis
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Historical effect size benchmarking for more accurate planning
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Optimal statistical approach selection based on precedent studies
                  </p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-700 dark:from-indigo-900 dark:to-blue-900 rounded-xl p-8 text-white text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Ready to transform your clinical development?</h2>
        <p className="text-xl mb-6 max-w-3xl mx-auto">
          Join leading biopharmaceutical companies using LumenTrialGuide.AI to design more successful clinical trials.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" variant="secondary" onClick={() => navigate('/spra-direct')}>
            Try Strategic Protocol Advisor
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white/10" onClick={() => navigate('/about')}>
            Learn More About Lumen Biosciences
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;