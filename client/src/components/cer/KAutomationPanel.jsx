import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Upload, Search, FilePlus, BarChart, ArrowRight, Shield, BrainCircuit, Zap, 
  FileCheck, CheckCircle2, AlertTriangle, Lightbulb, Bot, Star, ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function KAutomationPanel() {
  const [activeTab, setActiveTab] = useState('workflow');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiInsights, setAiInsights] = useState([]);

  // This would integrate with your pipeline services in a real implementation
  const handleRunPipeline = (step) => {
    console.log(`Running 510(k) pipeline step: ${step}`);
    // Simulate AI processing
    setAiProcessing(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAiProcessing(false);
          
          // Add some AI insights when complete
          if (step === 'findPredicatesAndLiterature') {
            setAiInsights([
              { id: 1, type: 'predicate', name: 'SimilarDevice X500', confidence: 0.92, date: '2023-08-15' },
              { id: 2, type: 'predicate', name: 'MedTech Navigator III', confidence: 0.87, date: '2022-11-03' },
              { id: 3, type: 'literature', name: 'Safety and efficacy of medical devices in class II', confidence: 0.89, journal: 'Journal of Medical Devices' }
            ]);
          } else if (step === 'adviseRegulatoryPathway') {
            setAiInsights([
              { id: 4, type: 'regulatory', pathway: 'Traditional 510(k)', confidence: 0.94, reasoning: 'Based on device classification and predicate devices' },
              { id: 5, type: 'timeline', estimate: '90-120 days', confidence: 0.85 }
            ]);
          }
          
          return 100;
        }
        return prev + 5;
      });
    }, 150);
    
    // In a real implementation, this would dispatch to your pipeline service
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-semibold text-blue-700">510(k) Automation</h2>
          <div className="bg-blue-100 rounded-full px-2 py-0.5 text-xs text-blue-700 font-medium">
            FDA Submission
          </div>
        </div>
        <Badge variant="outline" className="bg-indigo-50 text-indigo-800 border-indigo-200">
          <BrainCircuit className="h-3.5 w-3.5 mr-1" /> AI-Powered
        </Badge>
      </div>
      
      <p className="text-gray-600 mb-6">
        Streamline your FDA 510(k) submission process with our end-to-end automation pipeline.
      </p>

      <Tabs defaultValue="workflow" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-blue-50 p-1">
          <TabsTrigger value="workflow" className="data-[state=active]:bg-white">
            <ListChecks className="h-4 w-4 mr-2" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="ai-tools" className="data-[state=active]:bg-white">
            <Zap className="h-4 w-4 mr-2" />
            AI Tools
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-white">
            <Lightbulb className="h-4 w-4 mr-2" />
            Insights
            {aiInsights.length > 0 && (
              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
                {aiInsights.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-blue-100 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-2">
                <CardTitle className="flex items-center text-blue-700">
                  <Upload className="mr-2 h-5 w-5 text-blue-600" />
                  1. Device Intake
                </CardTitle>
                <CardDescription>
                  Upload or enter device metadata to kick off the pipeline.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Provide basic device information or upload existing documentation to jump-start your 510(k) submission.
                </p>
              </CardContent>
              <CardFooter className="border-t bg-gray-50 py-2 px-4">
                <Button 
                  onClick={() => handleRunPipeline('ingestDeviceProfile')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Upload Device Profile
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-sm border-blue-100 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-green-50 to-white pb-2">
                <CardTitle className="flex items-center text-green-700">
                  <Search className="mr-2 h-5 w-5 text-green-600" />
                  2. Predicate & Literature Discovery
                </CardTitle>
                <CardDescription>
                  Draft predicate list and literature search results.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Automatically discover potential predicate devices and relevant scientific literature for your submission.
                </p>
              </CardContent>
              <CardFooter className="border-t bg-gray-50 py-2 px-4">
                <Button 
                  onClick={() => handleRunPipeline('findPredicatesAndLiterature')}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={aiProcessing}
                >
                  {aiProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Run Predicate Finder"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-sm border-blue-100 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-white pb-2">
                <CardTitle className="flex items-center text-purple-700">
                  <FilePlus className="mr-2 h-5 w-5 text-purple-600" />
                  3. One-Click 510(k) Draft
                </CardTitle>
                <CardDescription>
                  AI-draft all required sections and assemble eSTAR package.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Generate a complete draft of your 510(k) submission with all required sections, formatted according to FDA guidelines.
                </p>
              </CardContent>
              <CardFooter className="border-t bg-gray-50 py-2 px-4">
                <Button 
                  onClick={() => handleRunPipeline('draftSectionsWithAI')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  One-Click 510(k)
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-sm border-blue-100 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-white pb-2">
                <CardTitle className="flex items-center text-amber-700">
                  <BarChart className="mr-2 h-5 w-5 text-amber-600" />
                  4. Track & Report
                </CardTitle>
                <CardDescription>
                  Monitor status, compliance issues, and key metrics in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Track your submission progress, monitor compliance with FDA requirements, and generate insightful analytics reports.
                </p>
              </CardContent>
              <CardFooter className="border-t bg-gray-50 py-2 px-4">
                <Button 
                  onClick={() => handleRunPipeline('trackSubmission')}
                  variant="outline"
                  className="text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100"
                >
                  View 510(k) Dashboard
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card className="shadow-sm border-blue-100 mt-8">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-2">
              <CardTitle className="flex items-center text-blue-700">
                <Shield className="mr-2 h-5 w-5 text-blue-600" />
                FDA Regulatory Compliance
              </CardTitle>
              <CardDescription>
                Stay compliant with the latest FDA 510(k) requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded p-3 bg-green-50 border-green-100">
                  <h4 className="font-medium text-green-700 mb-1">eSTAR Format</h4>
                  <p className="text-xs text-gray-600">FDA-compliant electronic submission templates</p>
                </div>
                <div className="border rounded p-3 bg-blue-50 border-blue-100">
                  <h4 className="font-medium text-blue-700 mb-1">Real-time Validation</h4>
                  <p className="text-xs text-gray-600">Continuous validation against FDA requirements</p>
                </div>
                <div className="border rounded p-3 bg-purple-50 border-purple-100">
                  <h4 className="font-medium text-purple-700 mb-1">Regulatory Updates</h4>
                  <p className="text-xs text-gray-600">Automatically updated with latest FDA guidance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-tools">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm border-indigo-100 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-2">
                <CardTitle className="flex items-center text-indigo-700">
                  <BrainCircuit className="mr-2 h-5 w-5 text-indigo-600" />
                  Smart Predicate Finder
                </CardTitle>
                <CardDescription>
                  AI-powered discovery of predicate devices
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Uses advanced machine learning to identify appropriate predicate devices based on your device characteristics.
                </p>
                <Button 
                  onClick={() => handleRunPipeline('adviseRegulatoryPathway')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={aiProcessing}
                >
                  Run AI Analysis
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-teal-100 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-white pb-2">
                <CardTitle className="flex items-center text-teal-700">
                  <Bot className="mr-2 h-5 w-5 text-teal-600" />
                  510(k) Content Assistant
                </CardTitle>
                <CardDescription>
                  AI writing and content generation
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Generates draft content for all required 510(k) sections based on your device specifications and intended use.
                </p>
                <Button 
                  onClick={() => handleRunPipeline('draftSectionsWithAI')}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  Launch Content Assistant
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-rose-100 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-white pb-2">
                <CardTitle className="flex items-center text-rose-700">
                  <FileCheck className="mr-2 h-5 w-5 text-rose-600" />
                  Compliance Checker
                </CardTitle>
                <CardDescription>
                  AI validation against FDA requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Analyzes your 510(k) submission for compliance with FDA requirements and guidelines, identifying potential issues.
                </p>
                <Button 
                  onClick={() => handleRunPipeline('runComplianceChecks')}
                  className="w-full bg-rose-600 hover:bg-rose-700"
                >
                  Check Compliance
                </Button>
              </CardContent>
            </Card>
          </div>

          {aiProcessing && (
            <Card className="mt-8 border-indigo-200 bg-indigo-50">
              <CardContent className="pt-6">
                <div className="flex items-center mb-2">
                  <Zap className="h-5 w-5 mr-2 text-indigo-600" />
                  <h3 className="text-lg font-medium text-indigo-700">AI Process Running</h3>
                </div>
                <Progress value={progress} className="h-2 mb-2" />
                <p className="text-sm text-indigo-600">{progress}% complete</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights">
          {aiInsights.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                <h3 className="text-lg font-medium text-gray-700">AI-Generated Insights</h3>
              </div>
              
              {aiInsights.map(insight => (
                <Card key={insight.id} className="border-gray-200">
                  <CardContent className="pt-6">
                    {insight.type === 'predicate' && (
                      <div className="flex items-start">
                        <div className="bg-green-100 rounded-full p-2 mr-4">
                          <Search className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <h4 className="font-medium text-gray-800 mr-2">{insight.name}</h4>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Predicate Device
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Clearance Date: {insight.date}</p>
                          <div className="flex items-center">
                            <div className="text-xs text-gray-500 mr-2">Match Confidence:</div>
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full" 
                                style={{width: `${insight.confidence * 100}%`}}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 ml-2">{Math.round(insight.confidence * 100)}%</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {insight.type === 'literature' && (
                      <div className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-2 mr-4">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <h4 className="font-medium text-gray-800 mr-2">{insight.name}</h4>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Literature
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Journal: {insight.journal}</p>
                          <div className="flex items-center">
                            <div className="text-xs text-gray-500 mr-2">Relevance:</div>
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{width: `${insight.confidence * 100}%`}}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 ml-2">{Math.round(insight.confidence * 100)}%</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {insight.type === 'regulatory' && (
                      <div className="flex items-start">
                        <div className="bg-purple-100 rounded-full p-2 mr-4">
                          <Star className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <h4 className="font-medium text-gray-800 mr-2">Regulatory Pathway Recommendation</h4>
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              AI Advisory
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Recommended Pathway: <span className="font-medium">{insight.pathway}</span></p>
                          <p className="text-sm text-gray-600 mb-2">Reasoning: {insight.reasoning}</p>
                          <div className="flex items-center">
                            <div className="text-xs text-gray-500 mr-2">Confidence:</div>
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 rounded-full" 
                                style={{width: `${insight.confidence * 100}%`}}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 ml-2">{Math.round(insight.confidence * 100)}%</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {insight.type === 'timeline' && (
                      <div className="flex items-start">
                        <div className="bg-amber-100 rounded-full p-2 mr-4">
                          <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <h4 className="font-medium text-gray-800 mr-2">Timeline Estimate</h4>
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                              AI Forecast
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Estimated Review Time: <span className="font-medium">{insight.estimate}</span></p>
                          <div className="flex items-center">
                            <div className="text-xs text-gray-500 mr-2">Confidence:</div>
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-500 rounded-full" 
                                style={{width: `${insight.confidence * 100}%`}}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 ml-2">{Math.round(insight.confidence * 100)}%</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-3 inline-block mb-4">
                <Lightbulb className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-600">No insights available yet</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
                Run one of the AI tools to generate insights about your 510(k) submission.
              </p>
              <Button 
                onClick={() => setActiveTab('ai-tools')}
                variant="outline" 
                className="mt-4"
              >
                <Zap className="h-4 w-4 mr-2" />
                Go to AI Tools
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}