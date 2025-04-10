import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, FileText, Brain, PieChart, FlaskConical, Lightbulb } from "lucide-react";

const ProtocolDesigner = () => {
  const [indication, setIndication] = useState("");
  const [phase, setPhase] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [generatedProtocol, setGeneratedProtocol] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("design");

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Placeholder for actual API call
      setGeneratedProtocol({
        title: `${indication} Phase ${phase} Clinical Trial Protocol`,
        sections: [
          {
            sectionName: "Study Design",
            content: "This is a multi-center, randomized, double-blind, placebo-controlled study.",
            precedent: "Based on 3 similar FDA-approved studies from 2023.",
            regulatoryGuidance: "Aligns with ICH E6(R2) and FDA guidance for industry."
          },
          {
            sectionName: "Study Objectives",
            content: "The primary objective is to evaluate the efficacy and safety of the investigational product in patients with " + indication + ".",
            precedent: "Objective formulation follows structure of recent approvals in this indication.",
            regulatoryGuidance: "Includes all elements expected by regulatory authorities."
          },
          {
            sectionName: "Inclusion Criteria",
            content: "1. Adult patients aged 18 years or older\n2. Confirmed diagnosis of " + indication + "\n3. Ability to provide informed consent\n4. ECOG performance status ≤ 2\n5. Adequate organ function",
            precedent: "Criteria aligned with 5 recent successful Phase " + phase + " trials.",
            regulatoryGuidance: "Covers key safety and eligibility requirements."
          },
          {
            sectionName: "Exclusion Criteria",
            content: "1. History of hypersensitivity to similar compounds\n2. Participation in another clinical trial within 30 days\n3. Presence of significant comorbidities\n4. Pregnant or breastfeeding women\n5. Inadequate bone marrow function",
            precedent: "Standard safety exclusions for this therapeutic area.",
            regulatoryGuidance: "Includes all standard safety precautions."
          },
          {
            sectionName: endpoint ? "Primary Endpoint: " + endpoint : "Primary Endpoint",
            content: endpoint ? 
              `Change from baseline in ${endpoint} at Week 24.` :
              "Change from baseline in disease activity measures at Week 24.",
            precedent: "This endpoint has been used in 7 approved products in this space.",
            regulatoryGuidance: "Clinically meaningful endpoint accepted by both FDA and EMA."
          }
        ],
        designElements: {
          studyType: "Interventional",
          allocation: "Randomized",
          blinding: "Double-blind",
          controlType: "Placebo-controlled",
          trialDesign: "Parallel group",
          statisticalApproach: "Superiority design",
          sampleSizeEstimate: "240 subjects (1:1 randomization)"
        },
        validationSummary: {
          criticalIssues: 0,
          highIssues: 0,
          mediumIssues: 1,
          warningIssues: 2,
          lowIssues: 3
        }
      });
      setIsGenerating(false);
      setActiveTab("preview");
    }, 2000);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Protocol Designer</h1>
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">AI-Powered</Badge>
          </div>
          <p className="text-gray-500 mt-1">Design evidence-based protocols from 1,900+ precedent studies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Load Template
          </Button>
          <Button variant="outline" size="sm">
            <Brain className="h-4 w-4 mr-2" />
            Study Design Tutorial
          </Button>
        </div>
      </div>

      <Separator className="mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Design Your Protocol</CardTitle>
                <FlaskConical className="h-5 w-5 text-blue-500" />
              </div>
              <CardDescription>
                Create a protocol document based on real-world precedent.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium">Therapeutic Area / Indication</label>
                  <Input 
                    placeholder="e.g., Type 2 Diabetes, Alzheimer's" 
                    value={indication}
                    onChange={(e) => setIndication(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Study Phase</label>
                  <Select onValueChange={setPhase}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Phase 1</SelectItem>
                      <SelectItem value="1/2">Phase 1/2</SelectItem>
                      <SelectItem value="2">Phase 2</SelectItem>
                      <SelectItem value="2/3">Phase 2/3</SelectItem>
                      <SelectItem value="3">Phase 3</SelectItem>
                      <SelectItem value="4">Phase 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Primary Endpoint (Optional)</label>
                  <Input 
                    placeholder="e.g., HbA1c, ADAS-Cog, PFS" 
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Additional Design Requirements</label>
                  <Textarea 
                    placeholder="Special population, biomarker strategy, adaptive design elements..."
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    className="mt-1.5 min-h-[100px]"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex gap-2 items-center text-blue-700 font-medium mb-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>Why This Matters</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    The study design forms the scientific blueprint of your trial, while the protocol implements that design with detailed procedures and rationale.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 rounded-b-lg">
              <Button 
                onClick={handleGenerate} 
                disabled={!indication || !phase || isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? "Generating..." : "Generate Full Protocol"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          {generatedProtocol ? (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{generatedProtocol.title}</CardTitle>
                    <CardDescription className="mt-1">
                      AI-generated protocol based on evidence from similar trials
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
                    <CheckCircle className="h-3.5 w-3.5" />
                    FDA/EMA Precedent Aligned
                  </div>
                </div>
              </CardHeader>
              <div className="px-6">
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4 w-full grid grid-cols-3">
                    <TabsTrigger value="design">Study Design</TabsTrigger>
                    <TabsTrigger value="preview">Protocol Preview</TabsTrigger>
                    <TabsTrigger value="download">Export Options</TabsTrigger>
                  </TabsList>
                  <TabsContent value="design">
                    <div className="bg-blue-50 rounded-xl p-4 mb-5">
                      <h3 className="text-md font-semibold text-blue-800 mb-3">Clinical Study Design Elements</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(generatedProtocol.designElements).map(([key, value]) => (
                          <div key={key} className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                            <div className="font-medium">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-md font-semibold mb-3">Validation Summary</h3>
                      <div className="grid grid-cols-5 gap-2">
                        <div className="bg-red-50 rounded-lg p-2 text-center">
                          <div className="text-red-600 font-bold text-xl">{generatedProtocol.validationSummary.criticalIssues}</div>
                          <div className="text-xs text-red-800">Critical</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-2 text-center">
                          <div className="text-orange-600 font-bold text-xl">{generatedProtocol.validationSummary.highIssues}</div>
                          <div className="text-xs text-orange-800">High</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-2 text-center">
                          <div className="text-yellow-600 font-bold text-xl">{generatedProtocol.validationSummary.mediumIssues}</div>
                          <div className="text-xs text-yellow-800">Medium</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2 text-center">
                          <div className="text-blue-600 font-bold text-xl">{generatedProtocol.validationSummary.warningIssues}</div>
                          <div className="text-xs text-blue-800">Warning</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <div className="text-gray-600 font-bold text-xl">{generatedProtocol.validationSummary.lowIssues}</div>
                          <div className="text-xs text-gray-800">Low</div>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-2" onClick={() => setActiveTab("preview")}>
                      View Full Protocol
                    </Button>
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="space-y-5">
                      {generatedProtocol.sections.map((section, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 p-3 border-b">
                            <h3 className="text-md font-semibold">{section.sectionName}</h3>
                          </div>
                          <div className="p-4">
                            <p className="whitespace-pre-line text-gray-800">{section.content}</p>

                            <div className="mt-4 pt-3 border-t grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-green-50 rounded p-2 text-sm">
                                <span className="text-green-800 font-medium block mb-1">Precedent:</span>
                                <span className="text-green-700">{section.precedent}</span>
                              </div>
                              <div className="bg-blue-50 rounded p-2 text-sm">
                                <span className="text-blue-800 font-medium block mb-1">Regulatory Alignment:</span>
                                <span className="text-blue-700">{section.regulatoryGuidance}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="download">
                    <div className="space-y-5">
                      <p className="text-gray-600">Download your protocol in the following formats:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Button variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                          <FileText className="h-4 w-4 mr-2" />
                          Download as PDF
                        </Button>
                        <Button variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                          <FileText className="h-4 w-4 mr-2" />
                          Download as Word
                        </Button>
                        <Button variant="outline" className="border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100">
                          <FileText className="h-4 w-4 mr-2" />
                          Download as Text
                        </Button>
                      </div>

                      <div className="mt-6 border rounded-lg p-4 bg-amber-50">
                        <h3 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                          <PieChart className="h-4 w-4" />
                          Protocol Performance Projection
                        </h3>
                        <p className="text-amber-700 text-sm mb-3">
                          Based on similar historical studies, we project the following outcomes:
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white rounded p-2 shadow-sm">
                            <div className="text-xs text-gray-500 mb-1">Est. Enrollment Rate</div>
                            <div className="font-medium">5-7 subjects/site/month</div>
                          </div>
                          <div className="bg-white rounded p-2 shadow-sm">
                            <div className="text-xs text-gray-500 mb-1">Est. Screen Failure</div>
                            <div className="font-medium">25-30%</div>
                          </div>
                          <div className="bg-white rounded p-2 shadow-sm">
                            <div className="text-xs text-gray-500 mb-1">Est. Dropout Rate</div>
                            <div className="font-medium">15-20%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <CardFooter className="flex justify-between mt-4 pt-4 border-t">
                <Button variant="outline">
                  Edit Protocol
                </Button>
                <Button>
                  Finalize Protocol
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="shadow-sm border-gray-200 h-full">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Protocol Preview</CardTitle>
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>
                  Your AI-generated protocol will appear here
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center py-12">
                <div className="text-center max-w-md mx-auto">
                  <div className="bg-blue-100 h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Create Your Evidence-Based Protocol</h3>
                  <p className="text-gray-500 mb-6">
                    Fill in the form and generate a protocol that incorporates clinical study design elements backed by real-world regulatory precedent.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium mb-1 text-gray-700">Study Design</p>
                      <p className="text-gray-500">The scientific architecture of your clinical trial</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium mb-1 text-gray-700">Protocol Document</p>
                      <p className="text-gray-500">The complete instructions to execute that design</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProtocolDesigner;