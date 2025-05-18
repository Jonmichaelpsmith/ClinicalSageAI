import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import UnifiedTopNavV3 from "../components/navigation/UnifiedTopNavV3";
import FadeTransition from "../components/common/FadeTransition";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ThinkingDots from "../components/common/ThinkingDots";
import { AlertTriangle, CheckCircle, RefreshCcw, Clock, FileText, AlertCircle } from "lucide-react";

export default function RegulatoryIntelligenceHub() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("advisor-summary");
  
  // Mock fetch for the readiness data
  const { data: readinessData, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/advisor/readiness"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/advisor/readiness");
        if (!response.ok) {
          throw new Error("Failed to fetch readiness data");
        }
        return await response.json();
      } catch (err) {
        console.error("Failed to load Advisor Readiness.");
        console.log("Using fallback data for demonstration");
        // Fallback data for demonstration
        return {
          readinessScore: 65,
          riskLevel: "Medium",
          delayDays: 49,
          financialImpact: 2450000,
          gaps: [
            { section: "CMC Stability Study", impact: "critical", status: "missing" },
            { section: "Drug Product Specs", impact: "high", status: "incomplete" },
            { section: "Clinical Study Reports", impact: "high", status: "missing" },
            { section: "Pharmacology Documentation", impact: "medium", status: "incomplete" },
            { section: "Toxicology Reports", impact: "medium", status: "missing" }
          ]
        };
      }
    }
  });
  
  // Extract missing sections for display
  const missingSections = readinessData?.gaps.map(gap => gap.section) || [];
  console.log("Extracted missing sections:", missingSections);
  
  useEffect(() => {
    // Refresh data on component mount
    refetch();
  }, []);
  
  // Heatmap color based on risk level
  const getRiskColor = (impact) => {
    switch (impact) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-amber-500";
      case "medium":
        return "bg-yellow-400";
      case "low":
        return "bg-green-400";
      default:
        return "bg-blue-500";
    }
  };
  
  // Financial impact formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  // Convert active tab value to readable label for breadcrumbs
  const getActiveTabLabel = () => {
    switch(activeTab) {
      case "advisor-summary":
        return "Advisor Summary";
      case "risk-heatmap":
        return "Risk Heatmap";
      case "timeline-simulator":
        return "Timeline Simulator";
      case "ask-lumen":
        return "Ask Lumen AI";
      default:
        return "Advisor Summary";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedTopNavV3 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        breadcrumbs={['Home', 'Regulatory Intelligence Hub', getActiveTabLabel()]} 
      />
      
      <main className="container mx-auto px-4 py-8 transition-all duration-500 ease-in-out glass-card my-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-8">Regulatory Intelligence Hub</h1>
        
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            setActiveTab(value);
            // Force breadcrumb update when tab changes
          }} 
          className="w-full transition-all duration-300 ease-in-out">
          <TabsList className="mb-8 flex flex-wrap space-x-2">
            <TabsTrigger 
              value="advisor-summary" 
              className="transition-all duration-200 data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 hover:bg-indigo-50"
            >
              Advisor Summary
            </TabsTrigger>
            <TabsTrigger 
              value="risk-heatmap" 
              className="transition-all duration-200 data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 hover:bg-indigo-50"
            >
              Risk Heatmap
            </TabsTrigger>
            <TabsTrigger 
              value="timeline-simulator" 
              className="transition-all duration-200 data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 hover:bg-indigo-50"
            >
              Timeline Simulator
            </TabsTrigger>
            <TabsTrigger 
              value="ask-lumen" 
              className="transition-all duration-200 data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 hover:bg-indigo-50"
            >
              Ask Lumen AI
            </TabsTrigger>
          </TabsList>
          
          {/* Advisor Summary Tab */}
          <TabsContent value="advisor-summary" className="space-y-6 transition-all duration-500 ease-in-out">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="large" text="Loading advisor data..." />
              </div>
            ) : error ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Error Loading Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Failed to load regulatory intelligence data. Please try again later.</p>
                </CardContent>
              </Card>
            ) : (
              <FadeTransition>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {/* Readiness Score Card */}
                  <Card className="transition-all duration-300 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Readiness Score</CardTitle>
                      <CardDescription>Overall submission readiness</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center flex-col">
                        <div className="relative w-28 sm:w-32 h-28 sm:h-32 mb-4">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl sm:text-4xl font-bold">{readinessData.readinessScore}%</span>
                          </div>
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                              className="text-gray-200"
                              strokeWidth="10"
                              stroke="currentColor"
                              fill="transparent"
                              r="40"
                              cx="50"
                              cy="50"
                            />
                            <circle
                              className="text-indigo-600"
                              strokeWidth="10"
                              strokeDasharray={251.2}
                              strokeDashoffset={251.2 * (1 - readinessData.readinessScore / 100)}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                              r="40"
                              cx="50"
                              cy="50"
                            />
                          </svg>
                        </div>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          readinessData.riskLevel === "Low" ? "bg-green-100 text-green-800" :
                          readinessData.riskLevel === "Medium" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {readinessData.riskLevel} Risk
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Timeline Impact Card */}
                  <Card className="transition-all duration-300 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Timeline Impact</CardTitle>
                      <CardDescription>Potential delay to submission</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center flex-col">
                        <div className="flex items-center justify-center mb-4">
                          <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-amber-500 mr-2" />
                          <span className="text-2xl sm:text-3xl font-bold">{readinessData.delayDays}</span>
                          <span className="text-base sm:text-lg ml-2">days</span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 text-center">
                          Potential delay if critical gaps are not addressed
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Financial Impact Card */}
                  <Card className="transition-all duration-300 hover:shadow-md sm:col-span-2 md:col-span-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Financial Impact</CardTitle>
                      <CardDescription>Estimated cost of delays</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center flex-col">
                        <span className="text-2xl sm:text-3xl font-bold text-red-600 mb-4">
                          {formatCurrency(readinessData.financialImpact)}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600 text-center">
                          Potential revenue loss due to market delay
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Critical Gaps Card */}
                <Card className="transition-all duration-300 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                      Critical Gaps
                    </CardTitle>
                    <CardDescription>
                      Key items requiring attention before submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {readinessData.gaps.map((gap, index) => (
                        <div key={index} className="flex items-start">
                          <div className={`w-3 h-3 mt-1 rounded-full mr-3 ${getRiskColor(gap.impact)}`}></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{gap.section}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                gap.status === "missing" ? "bg-red-100 text-red-800" : 
                                "bg-yellow-100 text-yellow-800"
                              }`}>
                                {gap.status === "missing" ? "Missing" : "Incomplete"}
                              </span>
                            </div>
                            <Progress
                              value={gap.status === "missing" ? 0 : 50}
                              className="h-2 mt-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Next Steps Card */}
                <Card className="transition-all duration-300 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-indigo-600" />
                      Recommended Next Steps
                    </CardTitle>
                    <CardDescription>
                      Actions to address the critical gaps
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4 list-decimal list-inside">
                      <li className="p-3 bg-indigo-50 rounded-md">
                        Complete CMC Stability Study documentation according to ICH guidelines
                      </li>
                      <li className="p-3 bg-indigo-50 rounded-md">
                        Update Drug Product Specifications with analytical method validation
                      </li>
                      <li className="p-3 bg-indigo-50 rounded-md">
                        Generate Clinical Study Reports for completed trials
                      </li>
                      <li className="p-3 bg-indigo-50 rounded-md">
                        Finalize Pharmacology Documentation with mechanism of action details
                      </li>
                      <li className="p-3 bg-indigo-50 rounded-md">
                        Complete Toxicology Reports including repeat-dose toxicity studies
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </FadeTransition>
            )}
          </TabsContent>
          
          {/* Risk Heatmap Tab */}
          <TabsContent value="risk-heatmap" className="space-y-6 transition-all duration-500 ease-in-out">
            <FadeTransition>
              <Card>
                <CardHeader>
                  <CardTitle>Risk Heatmap</CardTitle>
                  <CardDescription>
                    Visual analysis of submission risks and impacts
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <LoadingSpinner text="Loading risk heatmap data..." />
                  </div>
                </CardContent>
              </Card>
            </FadeTransition>
          </TabsContent>
          
          {/* Timeline Simulator Tab */}
          <TabsContent value="timeline-simulator" className="space-y-6 transition-all duration-500 ease-in-out">
            <FadeTransition>
              <Card>
                <CardHeader>
                  <CardTitle>Timeline Simulator</CardTitle>
                  <CardDescription>
                    Simulate submission timelines based on different scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <LoadingSpinner text="Initializing timeline simulator..." />
                  </div>
                </CardContent>
              </Card>
            </FadeTransition>
          </TabsContent>
          
          {/* Ask Lumen AI Tab */}
          <TabsContent value="ask-lumen" className="space-y-6 transition-all duration-500 ease-in-out">
            <FadeTransition>
              <Card>
                <CardHeader>
                  <CardTitle>Ask Lumen AI</CardTitle>
                  <CardDescription>
                    Get intelligent answers to your regulatory questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-6">
                  <div className="mt-4 mb-2">
                    <div className="px-4 py-2 rounded-lg bg-gray-100 mb-4">
                      <p className="text-sm text-gray-700">How do I prepare a Type B meeting package?</p>
                    </div>
                    <div className="px-4 py-3 rounded-lg bg-indigo-50 mb-4 relative overflow-hidden">
                      <ThinkingDots />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeTransition>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}