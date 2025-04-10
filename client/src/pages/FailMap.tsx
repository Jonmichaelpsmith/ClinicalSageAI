import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Check, Filter, Download, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

// Import visualization components
import { EndpointHeatmap } from "@/components/fail-map/EndpointHeatmap";
import { DoseMisalignmentChart } from "@/components/fail-map/DoseMisalignmentChart";
import { StatisticalPowerChart } from "@/components/fail-map/StatisticalPowerChart";

export default function FailMap() {
  const [activeTab, setActiveTab] = useState("endpoints");
  const [indication, setIndication] = useState("all");
  const [phase, setPhase] = useState("all");
  const [isPremium, setIsPremium] = useState(false); // This would come from auth context in real implementation
  
  // Fetch failed trials data
  const { data: failedTrialsData, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/failed-trials', indication, phase],
    enabled: true,
  });
  
  // Filter options - these would come from the API in a real implementation
  const indications = [
    { value: "all", label: "All Indications" },
    { value: "oncology", label: "Oncology" },
    { value: "neurology", label: "Neurology" },
    { value: "cardiovascular", label: "Cardiovascular" },
    { value: "immunology", label: "Immunology" },
    { value: "infectious", label: "Infectious Disease" },
  ];
  
  const phases = [
    { value: "all", label: "All Phases" },
    { value: "phase1", label: "Phase 1" },
    { value: "phase2", label: "Phase 2" },
    { value: "phase3", label: "Phase 3" },
    { value: "phase4", label: "Phase 4" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-World Fail Map</h1>
          <p className="text-slate-500 mt-1">
            Visualize patterns across 500+ failed clinical trials to avoid common pitfalls
          </p>
        </div>
        
        {!isPremium && (
          <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
            <Lock className="mr-2 h-4 w-4" />
            Upgrade for Private Organization Comparison
          </Button>
        )}
      </div>
      
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-800">Learning from Failure</AlertTitle>
        <AlertDescription className="text-amber-700">
          This dashboard aggregates anonymized data from failed clinical trials to help you identify common pitfalls in study design, endpoint selection, and statistical approaches.
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg">
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="text-sm py-2 px-3 flex items-center bg-white">
            <Filter className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
            Filters
          </Badge>
          
          <Select value={indication} onValueChange={setIndication}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Select Indication" />
            </SelectTrigger>
            <SelectContent>
              {indications.map((ind) => (
                <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={phase} onValueChange={setPhase}>
            <SelectTrigger className="w-[150px] bg-white">
              <SelectValue placeholder="Select Phase" />
            </SelectTrigger>
            <SelectContent>
              {phases.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Download this analysis as CSV or PDF
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {isPremium && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="default" size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Compare Our Portfolio
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Compare your organization's trials against failure patterns
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-2xl">
          <TabsTrigger value="endpoints">Endpoint Failures</TabsTrigger>
          <TabsTrigger value="dosing">Dose Misalignment</TabsTrigger>
          <TabsTrigger value="power">Statistical Underpowering</TabsTrigger>
        </TabsList>
        
        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Heatmap of Failed Primary & Secondary Endpoints</CardTitle>
              <CardDescription>
                Visualize which endpoints most commonly fail across indications and phases
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : error ? (
                <div className="h-80 flex items-center justify-center text-red-500">
                  Error loading endpoint data
                </div>
              ) : (
                <div className="h-[500px]">
                  <EndpointHeatmap data={failedTrialsData?.endpointData || []} />
                  <div className="mt-6 border-t pt-4">
                    <h4 className="font-medium mb-2">Key Insights:</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>Overall response rate (ORR) endpoints fail 42% more often in Phase 3 oncology trials than in Phase 2</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>Progression-free survival (PFS) success rate decreases by 37% when moving from Phase 2 to Phase 3</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        <span>Neurological indication endpoints show the highest failure rates for patient-reported outcomes</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dosing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dose Misalignment Patterns</CardTitle>
              <CardDescription>
                Analyze dose-related failures by target mechanism and patient population
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : error ? (
                <div className="h-80 flex items-center justify-center text-red-500">
                  Error loading dose data
                </div>
              ) : (
                <div className="h-[500px]">
                  <DoseMisalignmentChart data={failedTrialsData?.doseData || []} />
                  <div className="mt-6 border-t pt-4">
                    <h4 className="font-medium mb-2">Key Insights:</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>Small molecule trials show 63% more dose-related failures than biologics</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>Phase 2 to Phase 3 dose selection errors account for 48% of late-stage failures</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        <span>Patient stratification by pharmacokinetic profile could prevent up to 32% of dose-related failures</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="power" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistical Underpowering by Indication</CardTitle>
              <CardDescription>
                Identify patterns of statistical power inadequacy across disease areas
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : error ? (
                <div className="h-80 flex items-center justify-center text-red-500">
                  Error loading statistical power data
                </div>
              ) : (
                <div className="h-[500px]">
                  <StatisticalPowerChart data={failedTrialsData?.powerData || []} />
                  <div className="mt-6 border-t pt-4">
                    <h4 className="font-medium mb-2">Key Insights:</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>Rare disease trials are underpowered by an average of 34% across endpoints</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>73% of CNS trials fail due to statistical power issues related to high placebo response</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        <span>Cardiovascular trials with composite endpoints are most likely to be underpowered for regulatory success</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">For Consultants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-3">
              Use these insights to guide clients toward evidence-based trial design strategies that avoid historical pitfalls.
            </p>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
              Strategic Advisory
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">For CROs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-3">
              Enhance study designs with data-driven recommendations based on historical failure patterns.
            </p>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
              Operational Excellence
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">For Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-3">
              Evaluate biotech investment opportunities against common failure patterns to reduce portfolio risk.
            </p>
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200">
              Risk Mitigation
            </Badge>
          </CardContent>
        </Card>
      </div>
      
      {isPremium ? (
        <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-blue-100">
          <CardHeader>
            <CardTitle>Private Organization Comparison</CardTitle>
            <CardDescription>
              Your organization's trials compared against industry failure patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Endpoint Selection</h4>
                <p className="text-sm text-slate-600">Your portfolio avoids 78% of common endpoint selection pitfalls</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Dosing Strategy</h4>
                <p className="text-sm text-slate-600">3 potential dose optimization opportunities identified</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Statistical Power</h4>
                <p className="text-sm text-slate-600">2 trials at risk of underpowering based on historical patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle>Private Organization Comparison</CardTitle>
            <CardDescription>
              Upgrade to compare your organization's trials against industry failure patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
              <Lock className="mr-2 h-4 w-4" />
              Unlock Premium Features
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}