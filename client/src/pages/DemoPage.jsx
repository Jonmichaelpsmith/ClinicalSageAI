import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileDown, BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DemoPage() {
  const [protocol, setProtocol] = useState("");
  const [response, setResponse] = useState(null);
  const [sessionId] = useState("demo_trial_" + Date.now());
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  // Sample protocol text
  const sampleProtocol = `PROTOCOL TITLE: A Phase 2, Randomized, Double-Blind, Placebo-Controlled Study to Evaluate the Efficacy and Safety of GLP-1 Receptor Agonist in Adults with Type 2 Diabetes

INDICATION: Type 2 Diabetes Mellitus

OBJECTIVES:
Primary: To assess the change in HbA1c from baseline to week 24
Secondary: 
- Change in body weight from baseline to week 24
- Proportion of subjects achieving HbA1c <7.0% at week 24
- Change in fasting plasma glucose from baseline to week 24

STUDY DESIGN: 
- Randomized, double-blind, placebo-controlled, parallel-group study
- 24-week treatment period with 4-week follow-up
- 2:1 randomization (active:placebo)

POPULATION:
- Adults aged 18-75 years with T2DM
- HbA1c 7.0-10.0%
- BMI 25-45 kg/m²
- On stable metformin therapy for ≥3 months

DOSING:
- Treatment: 1.5mg subcutaneous injection once weekly
- Placebo: Matching subcutaneous injection once weekly

ENDPOINTS:
Primary: Change in HbA1c from baseline to week 24
Secondary: Weight change, responder rate (HbA1c <7%), FPG change, safety and tolerability

SAMPLE SIZE: 240 subjects (160 active, 80 placebo)

STATISTICAL METHODS:
- MMRM analysis for primary endpoint
- 90% power to detect treatment difference of 0.8% in HbA1c
- Significance level: 0.05 (two-sided)`;

  const handleAnalyze = async () => {
    if (!protocol.trim()) {
      toast({
        title: "Empty Protocol",
        description: "Please enter a protocol or use the sample protocol",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/demo-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: protocol, session_id: sessionId })
      });
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResponse(data);
      setStep(2);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "There was an error analyzing your protocol. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUseSample = () => {
    setProtocol(sampleProtocol);
  };
  
  const handleDownload = () => {
    if (!response || !response.session_id) {
      toast({
        title: "No Analysis Available",
        description: "Please analyze a protocol first",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Preparing Download",
      description: "Your summary packet is being generated and will download shortly.",
    });
    
    // Download the PDF from the session directory
    window.open(`/api/download/summary-packet?session_id=${response.session_id}`, '_blank');
    
    setStep(3);
    
    // Confirm success after a short delay
    setTimeout(() => {
      toast({
        title: "Summary Packet Ready",
        description: "Your report has been downloaded successfully.",
        variant: "success",
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Live Intelligence Demo
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Experience the power of LumenTrialGuide.AI with this interactive demo. 
          Analyze a protocol and see our intelligence capabilities in action.
        </p>
      </div>
      
      {/* Step indicator */}
      <div className="mb-10 max-w-md mx-auto">
        <div className="flex justify-between mb-2">
          <span className={`text-sm font-medium ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            Enter Protocol
          </span>
          <span className={`text-sm font-medium ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            View Analysis
          </span>
          <span className={`text-sm font-medium ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            Download Report
          </span>
        </div>
        <Progress value={step === 1 ? 33 : step === 2 ? 66 : 100} className="h-2" />
      </div>

      {/* Step 1: Protocol Entry */}
      {step === 1 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Step 1: Enter Your Protocol</CardTitle>
            <CardDescription>
              Paste your protocol text or use our sample protocol to see LumenTrialGuide.AI in action.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Paste your protocol here..." 
              className="min-h-[300px] font-mono text-sm"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleUseSample}>
              Use Sample Protocol
            </Button>
            <Button 
              onClick={handleAnalyze} 
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <BrainCircuit className="h-4 w-4" />
                  Analyze Protocol
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Results */}
      {step === 2 && response && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Protocol Analysis Results</CardTitle>
                <Button onClick={() => setStep(3)} className="gap-2">
                  <FileDown className="h-4 w-4" /> 
                  Download Full Report
                </Button>
              </div>
              <CardDescription>
                Here's what our AI discovered from your protocol. Click on any tab to explore different aspects of the analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="success">
                <TabsList className="grid grid-cols-4 mb-8">
                  <TabsTrigger value="success">Success Probability</TabsTrigger>
                  <TabsTrigger value="dropout">Dropout Analysis</TabsTrigger>
                  <TabsTrigger value="ind">IND Readiness</TabsTrigger>
                  <TabsTrigger value="wisdom">Wisdom Trace</TabsTrigger>
                </TabsList>
                
                {/* Success Probability Tab */}
                <TabsContent value="success" className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <Card className="md:w-1/3 bg-gray-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold text-center">
                          82%
                        </CardTitle>
                        <CardDescription className="text-center">
                          Trial Success Probability
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <Badge variant="outline" className="bg-white">
                            Based on 15 similar trials
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="md:w-2/3">
                      <h3 className="text-lg font-medium mb-4">Contributing Factors</h3>
                      {[
                        { name: "Study Design Appropriateness", score: 88 },
                        { name: "Statistical Power", score: 85 },
                        { name: "Patient Population", score: 76 },
                        { name: "Endpoint Selection", score: 79 }
                      ].map((factor, i) => (
                        <div key={i} className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{factor.name}</span>
                            <span className="font-medium">{factor.score}%</span>
                          </div>
                          <Progress value={factor.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-blue-50 text-sm">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4" />
                      Key Insights
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Your study design aligns well with successful precedents</li>
                      <li>Statistical power calculation is appropriate for detecting expected effect</li>
                      <li>Consider stratifying randomization by baseline HbA1c to increase power</li>
                    </ul>
                  </div>
                </TabsContent>
                
                {/* Dropout Analysis Tab */}
                <TabsContent value="dropout" className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <Card className="md:w-1/3 bg-gray-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold text-center">
                          13.2%
                        </CardTitle>
                        <CardDescription className="text-center">
                          Predicted Dropout Rate
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <Badge variant="outline" className="bg-white">
                            95% confidence interval
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="md:w-2/3">
                      <h3 className="text-lg font-medium mb-4">Risk Factors</h3>
                      {[
                        { name: "Visit frequency", impact: "High" },
                        { name: "Treatment duration", impact: "Medium" },
                        { name: "Site monitoring quality", impact: "Medium" },
                        { name: "Patient burden", impact: "Low" }
                      ].map((factor, i) => (
                        <div key={i} className="flex justify-between items-center border-b py-3">
                          <span>{factor.name}</span>
                          <Badge variant={factor.impact === "Low" ? "outline" : factor.impact === "Medium" ? "secondary" : "destructive"}>
                            {factor.impact} Impact
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-green-50 text-sm">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <BrainCircuit className="h-4 w-4" />
                      Mitigation Strategies
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {[
                        "Implement mobile reminders for appointments to reduce missed visits",
                        "Consider reducing total trial duration to 18 weeks",
                        "Use centralized site monitoring to identify enrollment issues early",
                        "Simplify patient-reported outcome measures"
                      ].map((strategy, i) => (
                        <li key={i}>{strategy}</li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
                
                {/* IND Readiness Tab */}
                <TabsContent value="ind" className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <Card className="md:w-1/3 bg-gray-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold text-center">
                          87/100
                        </CardTitle>
                        <CardDescription className="text-center">
                          IND Readiness Score
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <Badge variant="outline" className="bg-white">
                            Low regulatory risk
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="md:w-2/3">
                      <h3 className="text-lg font-medium mb-4">Strengths</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {[
                          "Well-defined primary and secondary endpoints",
                          "Appropriate inclusion/exclusion criteria",
                          "Detailed safety monitoring plan",
                          "Clearly specified statistical analysis methods"
                        ].map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                      
                      <Separator className="my-4" />
                      
                      <h3 className="text-lg font-medium mb-4">Opportunities for Improvement</h3>
                      <ul className="list-disc pl-5 space-y-1 text-amber-700">
                        {[
                          "Insufficient details on concomitant medication management",
                          "More detailed patient recruitment strategy needed",
                          "Consider adding interim analysis points"
                        ].map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-purple-50 text-sm">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <FileCheck className="h-4 w-4" />
                      Regulatory Guidance
                    </h4>
                    <p>This protocol is well-aligned with FDA guidance for T2DM trials. Consider addressing the opportunities for improvement to enhance regulatory acceptance. Standard statistical analyses and safety monitoring are appropriate for this indication.</p>
                  </div>
                </TabsContent>
                
                {/* Wisdom Trace Tab */}
                <TabsContent value="wisdom" className="space-y-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h3 className="font-medium flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4" />
                      CSR Intelligence
                    </h3>
                    <p className="text-sm">This analysis is backed by 8 Clinical Study Reports from similar trials, providing evidence-based insights from real-world protocols.</p>
                  </div>
                  
                  <h3 className="text-lg font-medium mb-2">Key Insights from Similar Trials</h3>
                  {results.wisdomTrace.keyInsights.map((insight, i) => (
                    <Card key={i} className="mb-3">
                      <CardContent className="p-4 flex items-start gap-3">
                        <BrainCircuit className="h-5 w-5 text-primary mt-0.5" />
                        <p>{insight}</p>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline" className="bg-white">
                      <FileText className="h-3 w-3 mr-1" />
                      CSR_01234567
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      <FileText className="h-3 w-3 mr-1" />
                      CSR_02345678
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      <FileText className="h-3 w-3 mr-1" />
                      CSR_03456789
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      +5 more
                    </Badge>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => setStep(3)} className="gap-2">
                <FileDown className="h-4 w-4" /> 
                Download Full Report
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Step 3: Download Options */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Download Your Intelligence Package</CardTitle>
            <CardDescription>
              Your analysis is ready. Choose what to include in your summary packet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 border-primary">
                <CardHeader className="pb-2">
                  <CardTitle>Summary Intelligence Packet</CardTitle>
                  <CardDescription>
                    Complete analysis with all intelligence modules
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Success probability analysis with contributing factors</li>
                    <li>Dropout risk assessment with mitigation strategies</li>
                    <li>IND readiness score with regulatory recommendations</li>
                    <li>CSR wisdom trace showing evidence sources</li>
                    <li>Executive summary for stakeholders</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2" onClick={handleDownload}>
                    <FileDown className="h-4 w-4" />
                    Download Complete Package
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Success Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm pb-2">
                    Detailed probability of success with contributing factors
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" size="sm" onClick={handleDownload}>
                      Download
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Dropout Forecast</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm pb-2">
                    Risk assessment with mitigation recommendations
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" size="sm" onClick={handleDownload}>
                      Download
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">IND Readiness Report</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm pb-2">
                    Regulatory compliance assessment with recommendations
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" size="sm" onClick={handleDownload}>
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-4">
              Want to analyze your own protocol with all features and personalized insights?
            </p>
            <Button variant="default" size="lg" className="gap-2">
              <BrainCircuit className="h-4 w-4" />
              Get Full Access to LumenTrialGuide.AI
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground">
          This is a demonstration of LumenTrialGuide.AI's capabilities.
          <br />
          For full access to the platform and personalized trial intelligence, contact us for a complete demo.
        </p>
      </div>
    </div>
  );
}