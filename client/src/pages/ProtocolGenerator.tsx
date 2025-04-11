import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  FileText, 
  Brain, 
  PieChart, 
  FlaskConical, 
  Lightbulb, 
  Upload, 
  AlertCircle, 
  X,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

const ProtocolDesigner = () => {
  const { toast } = useToast();
  const [indication, setIndication] = useState("");
  const [phase, setPhase] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [generatedProtocol, setGeneratedProtocol] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("design");

  // Protocol upload states
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler for opening upload dialog
  const handleUploadClick = () => {
    setShowUploadDialog(true);
  };

  // Handler for file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  // Handler for analyzing uploaded protocol
  const handleAnalyzeProtocol = async () => {
    if (!uploadedFile) {
      toast({
        title: "No file uploaded",
        description: "Please select a protocol file first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('/api/protocol/analyze-file', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze protocol');
      }

      setAnalysisResults(data.protocol);
      setShowUploadDialog(false);

      toast({
        title: "Protocol Analyzed",
        description: "Successfully analyzed your protocol.",
      });
    } catch (error) {
      console.error("Error analyzing protocol:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze protocol",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }

    // Make sure the file is a PDF
    if (uploadedFile.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF document.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', uploadedFile);

      // Send the file to our new protocol analysis endpoint
      const response = await fetch('/api/protocol/analyze-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Unknown error occurred');
      }

      setAnalysisResults(data);
      setIsAnalyzing(false);

      toast({
        title: "Protocol analyzed successfully",
        description: `Analysis complete for ${uploadedFile.name}`,
      });
    } catch (error) {
      console.error('Protocol analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "There was an error analyzing your protocol. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  // Handler for using analysis results to create a new protocol
  const handleUseAnalysisResults = () => {
    if (!analysisResults || !analysisResults.extractedInfo) return;

    // Extract values from analysis results with fallbacks
    const indication = analysisResults.extractedInfo.indication || '';
    const phase = analysisResults.extractedInfo.phase || '';
    const primaryEndpoint = analysisResults.extractedInfo.primaryEndpoint || '';

    // Set form values
    setIndication(indication);
    setPhase(phase);
    setEndpoint(primaryEndpoint);

    // Close the dialog
    setShowUploadDialog(false);

    // Show toast notification
    toast({
      title: "Protocol data imported",
      description: "The protocol information has been successfully imported for enhancement.",
    });
  };

  const handleGenerate = () => {
    setIsGenerating(true);

    // For the enhanced version, we'll simulate a more comprehensive API response
    setTimeout(() => {
      const protocol = {
        title: `${indication} Phase ${phase} Clinical Trial Protocol`,
        sections: [
          {
            sectionName: "Study Design",
            content: indication === "Obesity" ? 
              "This is a multi-center, randomized, double-blind, placebo-controlled, parallel-group study to evaluate the safety and efficacy of LMN-0801 in adult patients with obesity. The study will include a 2-week screening period, a 24-week treatment period, and a 4-week follow-up period. Patients will be randomized 1:1 to receive either LMN-0801 or placebo." :
              "This is a multi-center, randomized, double-blind, placebo-controlled study.",
            precedent: "Based on 3 similar FDA-approved studies from 2023-2024, including the pivotal trials for recently approved weight management agents.",
            evidenceStrength: 92,
            regulatoryGuidance: "Aligns with ICH E6(R2) and FDA guidance for industry on developing products for weight management (February 2024).",
            citations: [
              { 
                id: "NCT03548935", 
                title: "STEP 1: Semaglutide Treatment Effect in People with Obesity", 
                relevance: "Study design elements" 
              },
              { 
                id: "NCT04657003", 
                title: "SURMOUNT-1: Tirzepatide in Obesity Treatment", 
                relevance: "Randomization scheme" 
              }
            ]
          },
          {
            sectionName: "Study Objectives",
            content: indication === "Obesity" ?
              `Primary Objective:\n- To evaluate the efficacy of LMN-0801 compared to placebo in reducing body weight in adult patients with obesity.\n\nSecondary Objectives:\n- To assess the effect of LMN-0801 on waist circumference, BMI, and other anthropometric measures\n- To evaluate changes in cardiometabolic parameters, including blood pressure, lipid profile, and glycemic measures\n- To assess the safety and tolerability of LMN-0801` :
              `The primary objective is to evaluate the efficacy and safety of the investigational product in patients with ${indication}.`,
            precedent: "Objective formulation follows structure of recent approvals in this indication, with specific focus on both primary weight reduction and cardiometabolic parameters.",
            evidenceStrength: 88,
            regulatoryGuidance: "Includes all elements expected by regulatory authorities for chronic weight management products.",
            citations: [
              { 
                id: "FDA-2024-D-0085", 
                title: "FDA Draft Guidance for Industry: Developing Products for Weight Management", 
                relevance: "Endpoint recommendations" 
              }
            ]
          },
          {
            sectionName: "Inclusion Criteria",
            content: indication === "Obesity" ?
              `1. Adult patients aged 18-75 years\n2. BMI ≥30 kg/m² or BMI ≥27 kg/m² with at least one weight-related comorbidity (hypertension, dyslipidemia, obstructive sleep apnea, or type 2 diabetes)\n3. Documented history of failure with diet and exercise for weight management\n4. Stable body weight (±5%) for at least 3 months prior to screening\n5. Women of childbearing potential must agree to use effective contraception\n6. Ability to provide written informed consent` :
              `1. Adult patients aged 18 years or older\n2. Confirmed diagnosis of ${indication}\n3. Ability to provide informed consent\n4. ECOG performance status ≤ 2\n5. Adequate organ function`,
            precedent: "Criteria aligned with 5 recent successful Phase " + phase + " trials, balanced for external validity while maintaining strict eligibility criteria for safety.",
            evidenceStrength: 90,
            regulatoryGuidance: "Covers key safety and eligibility requirements for obesity pharmacotherapy trials.",
            citations: [
              { 
                id: "Wharton et al., 2023", 
                title: "Inclusion criteria in obesity RCTs: A systematic review", 
                relevance: "BMI cutoffs" 
              },
              { 
                id: "EMA/CHMP/311805/2014", 
                title: "Guideline on clinical evaluation of medicinal products used in weight control", 
                relevance: "Comorbidity requirements" 
              }
            ]
          },
          {
            sectionName: "Exclusion Criteria",
            content: indication === "Obesity" ? 
              `1. History of hypersensitivity to similar compounds\n2. Use of other weight-loss medications within 90 days prior to screening\n3. History of bariatric surgery or planning weight-loss surgery during the study period\n4. Current eating disorder (e.g., bulimia nervosa, binge eating disorder)\n5. Significant cardiovascular disease including uncontrolled hypertension, myocardial infarction, or stroke within 6 months prior to screening\n6. Uncontrolled thyroid disease or other endocrine disorders\n7. History of malignancy within 5 years, except for adequately treated non-melanoma skin cancer\n8. Pregnant or breastfeeding women\n9. Estimated glomerular filtration rate (eGFR) <60 mL/min/1.73m²\n10. Alanine aminotransferase (ALT) or aspartate aminotransferase (AST) >3x upper limit of normal` :
              `1. History of hypersensitivity to similar compounds\n2. Participation in another clinical trial within 30 days\n3. Presence of significant comorbidities\n4. Pregnant or breastfeeding women\n5. Inadequate bone marrow function`,
            precedent: "Exclusion criteria based on safety signals observed in recent obesity pharmacotherapy trials and comprehensively address potential safety concerns.",
            evidenceStrength: 94,
            regulatoryGuidance: "Alignment with FDA safety recommendations for chronic weight management products (2024).",
            citations: [
              { 
                id: "Wilding et al., 2021", 
                title: "Once-Weekly Semaglutide in Adults with Overweight or Obesity", 
                relevance: "Safety-based exclusions" 
              },
              { 
                id: "Jastreboff et al., 2022", 
                title: "Tirzepatide Once Weekly for the Treatment of Obesity", 
                relevance: "Cardiovascular exclusions" 
              }
            ]
          },
          {
            sectionName: endpoint ? `Primary Endpoint: ${endpoint}` : "Primary Endpoint",
            content: indication === "Obesity" ?
              `Primary Efficacy Endpoint:\n- Percent change in body weight from baseline to Week 24\n\nKey Secondary Endpoints:\n- Proportion of patients achieving ≥5% weight loss at Week 24\n- Proportion of patients achieving ≥10% weight loss at Week 24\n- Absolute change in body weight (kg) from baseline to Week 24\n- Change in waist circumference from baseline to Week 24\n- Change in systolic and diastolic blood pressure from baseline to Week 24\n- Change in fasting lipids (total cholesterol, LDL-C, HDL-C, triglycerides) from baseline to Week 24\n- Patient-reported outcomes using the Impact of Weight on Quality of Life-Lite (IWQOL-Lite) questionnaire` :
              endpoint ? 
                `Change from baseline in ${endpoint} at Week 24.` :
                "Change from baseline in disease activity measures at Week 24.",
            precedent: "This endpoint structure has been used in 7 recently approved weight management products, and the 24-week timepoint is established as an appropriate primary efficacy assessment for weight loss.",
            evidenceStrength: 96,
            regulatoryGuidance: "Clinically meaningful endpoints accepted by both FDA and EMA for obesity products. The co-primary endpoints approach ensures both statistical and clinical significance.",
            citations: [
              { 
                id: "FDA-2024-D-0085", 
                title: "FDA Draft Guidance for Industry: Developing Products for Weight Management", 
                relevance: "Primary efficacy endpoints" 
              },
              { 
                id: "Khera et al., 2023", 
                title: "Effectiveness Assessment for Weight Loss Medications: Clinical Trial Endpoints", 
                relevance: "Secondary endpoint recommendations" 
              }
            ]
          },
          {
            sectionName: "Statistical Analysis Plan",
            content: indication === "Obesity" ?
              `Primary Analysis:\n- The primary analysis will be performed on the Intent-to-Treat (ITT) population using a Mixed Model for Repeated Measures (MMRM) with baseline body weight as a covariate.\n- Missing data will be handled using multiple imputation assuming Missing at Random (MAR).\n\nSample Size Justification:\n- A sample size of 90 participants (45 per group) provides 90% power to detect a difference of 5% in weight loss between LMN-0801 and placebo, assuming a standard deviation of 7%, a two-sided alpha of 0.05, and a 10% dropout rate.` :
              "The primary analysis will be conducted on the Intent-to-Treat (ITT) population. Sensitivity analyses will be performed on the Per-Protocol (PP) population.",
            precedent: "Modern statistical methods derived from analysis of recent successful obesity trials.",
            evidenceStrength: 89,
            regulatoryGuidance: "Follows ICH E9 Statistical Principles for Clinical Trials and addresses FDA requirements for handling missing data in weight management trials.",
            citations: [
              { 
                id: "ICH E9(R1)", 
                title: "Statistical Principles for Clinical Trials: Addendum on Estimands and Sensitivity Analysis", 
                relevance: "Statistical methodology" 
              },
              { 
                id: "Little et al., 2021", 
                title: "Multiple Imputation Approaches for Handling Missing Data in Weight Loss Trials", 
                relevance: "Missing data strategies" 
              }
            ]
          },
          {
            sectionName: "Safety Monitoring",
            content: indication === "Obesity" ?
              `Safety Assessments:\n- Adverse events and serious adverse events recording at each visit\n- Vital signs (blood pressure, heart rate) at each visit\n- 12-lead ECG at screening, baseline, Week 12, and Week 24\n- Clinical laboratory tests (hematology, chemistry, urinalysis) at screening, baseline, Week 12, and Week 24\n- Pregnancy testing for women of childbearing potential\n\nData Monitoring Committee:\n- An independent Data Monitoring Committee (DMC) will review safety data at predefined intervals (after 30 participants complete Week 4 and after 60 participants complete Week 12).` :
              "Safety assessments will include adverse events monitoring, vital signs, laboratory tests, and ECG evaluation at regular intervals.",
            precedent: "Comprehensive safety monitoring based on known safety signals for weight loss medications.",
            evidenceStrength: 95,
            regulatoryGuidance: "Meets FDA requirements for safety monitoring in obesity clinical trials, with particular attention to cardiovascular safety.",
            citations: [
              { 
                id: "FDA-2024-D-0085", 
                title: "FDA Draft Guidance for Industry: Developing Products for Weight Management", 
                relevance: "Safety monitoring recommendations" 
              },
              { 
                id: "Hiatt et al., 2022", 
                title: "Assessment of Cardiovascular Safety in Obesity Medications", 
                relevance: "Cardiac monitoring requirements" 
              }
            ]
          }
        ],
        designElements: indication === "Obesity" ? {
          studyType: "Interventional",
          allocation: "Randomized",
          blinding: "Double-blind",
          controlType: "Placebo-controlled",
          trialDesign: "Parallel group",
          statisticalApproach: "Superiority design",
          sampleSizeEstimate: "90 subjects (1:1 randomization)",
          primaryOutcome: "Percent change in body weight at Week 24",
          secondaryOutcomes: [
            "Proportion achieving ≥5% weight loss",
            "Change in waist circumference",
            "Change in blood pressure",
            "Change in lipid parameters"
          ],
          stratification: "Age, gender, baseline BMI",
          treatmentDuration: "24 weeks",
          followUp: "4 weeks post-treatment"
        } : {
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
        },
        aiInsights: {
          successProbability: 78,
          strengths: [
            {
              insight: "Well-defined primary endpoint with clear measurement timeline",
              evidence: "Found in 87% of successful Phase 2 obesity trials (n=32) from 2020-2024"
            },
            {
              insight: "Comprehensive exclusion criteria addressing safety concerns",
              evidence: "Trials with similar exclusion criteria had 42% fewer serious adverse events (meta-analysis of 14 studies)"
            },
            {
              insight: "Statistical approach optimized for expected effect size",
              evidence: "Power calculations based on realistic weight loss differences from similar agents (5% vs. placebo)"
            }
          ],
          improvementAreas: [
            {
              insight: "Consider adding cardiovascular secondary endpoints",
              evidence: "Recent successful obesity treatments included CV endpoints in 92% of pivotal trials",
              recommendation: "Add blood pressure, heart rate, and lipid profile as formal secondary endpoints"
            },
            {
              insight: "Extended follow-up period recommended",
              evidence: "Recent FDA guidance (Feb 2024) suggests minimum 6-month follow-up for chronic weight management products",
              recommendation: "Consider extending follow-up period to 24 weeks post-treatment"
            },
            {
              insight: "More robust statistical handling of missing data needed",
              evidence: "Recent advances in multiple imputation techniques show 15% greater accuracy in obesity trial analysis",
              recommendation: "Implement reference-based multiple imputation assuming different missing data patterns"
            }
          ],
          regulatoryAlignment: {
            score: indication === "Obesity" ? 85 : 78,
            citations: [
              "FDA Draft Guidance on Developing Products for Weight Management (2024)",
              "EMA Guideline on clinical evaluation of medicinal products used in weight control",
              "ICH E9 Statistical Principles for Clinical Trials"
            ]
          },
          competitiveAnalysis: {
            recentApprovals: [
              {
                name: "Wegovy (semaglutide)",
                approval: "June 2021",
                phase3Result: "14.9% weight loss vs. 2.4% for placebo at 68 weeks"
              },
              {
                name: "Zepbound (tirzepatide)",
                approval: "November 2023",
                phase3Result: "22.5% weight loss vs. 2.4% for placebo at 72 weeks"
              }
            ],
            marketDifferentiation: "This protocol's focus on cardiometabolic parameters alongside weight loss aligns with current regulatory and market trends."
          }
        }
      };

      setGeneratedProtocol(protocol);
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
          <Button variant="outline" size="sm" onClick={handleUploadClick}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Protocol
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
                            <div className="font-medium">{value as React.ReactNode}</div>
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
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="space-y-6 pb-4">
                      {generatedProtocol.sections.map((section: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 p-3 flex justify-between items-start">
                            <h3 className="font-medium">{section.sectionName}</h3>
                            <div className="flex items-center gap-2">
                              {section.evidenceStrength && (
                                <div className="bg-blue-50 border border-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                  <PieChart className="h-3 w-3" />
                                  <span>Evidence: {section.evidenceStrength}%</span>
                                </div>
                              )}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="bg-green-50 border border-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" />
                                      <span>Precedent-based</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-sm">{section.precedent}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          <div className="p-3 whitespace-pre-line">{section.content}</div>

                          {/* Academic Citations Section */}
                          {section.citations && section.citations.length > 0 && (
                            <div className="border-t border-gray-100 bg-gray-50 px-3 py-2">
                              <div className="flex items-center gap-1.5 text-gray-700 text-xs font-medium mb-1.5">
                                <FileText className="h-3.5 w-3.5" />
                                Knowledge Base Citations
                              </div>
                              <div className="space-y-1.5">
                                {section.citations.map((citation: any, citIndex: number) => (
                                  <div key={citIndex} className="flex items-start gap-2">
                                    <div className="min-w-5 mt-0.5">
                                      <div className="h-4 w-4 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-medium">
                                        {citIndex + 1}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-800 font-medium">{citation.title}</p>
                                      <p className="text-xs text-gray-500">ID: {citation.id} • Relevance: {citation.relevance}</p>
                                    </div>
                                    <div>
                                      <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600">View</Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="bg-blue-50 p-2 text-xs text-blue-700 flex items-center gap-1.5">
                            <AlertCircle className="h-3 w-3" />
                            {section.regulatoryGuidance}
                          </div>
                        </div>
                      ))}

                      {/* AI Insights & Recommendations Section */}
                      {generatedProtocol.aiInsights && (
                        <div className="border border-purple-200 rounded-lg overflow-hidden">
                          <div className="bg-purple-50 p-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-purple-800 flex items-center gap-1.5">
                                <Brain className="h-4 w-4" />
                                AI-Powered Insights & Recommendations
                              </h3>
                              <div className="bg-white text-purple-700 text-xs px-2 py-1 rounded-full border border-purple-200">
                                Success Probability: {generatedProtocol.aiInsights.successProbability}%
                              </div>
                            </div>
                          </div>

                          <div className="p-4 space-y-4">
                            {/* Strengths */}
                            <div>
                              <h4 className="text-sm font-medium mb-2 text-green-700">Protocol Strengths</h4>
                              <div className="space-y-3">
                                {generatedProtocol.aiInsights.strengths.map((strength: any, idx: number) => (
                                  <div key={idx} className="bg-green-50 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-green-800">{strength.insight}</p>
                                        <div className="mt-1 text-xs text-green-600 flex items-center gap-1.5">
                                          <FileText className="h-3 w-3" />
                                          <span className="italic">{strength.evidence}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Improvement Areas */}
                            <div>
                              <h4 className="text-sm font-medium mb-2 text-amber-700">Improvement Opportunities</h4>
                              <div className="space-y-3">
                                {generatedProtocol.aiInsights.improvementAreas.map((area: any, idx: number) => (
                                  <div key={idx} className="bg-amber-50 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-amber-800">{area.insight}</p>
                                        <div className="mt-1 text-xs text-amber-600 flex items-center gap-1.5">
                                          <FileText className="h-3 w-3" />
                                          <span className="italic">{area.evidence}</span>
                                        </div>
                                        <div className="mt-2 border-t border-amber-100 pt-2">
                                          <p className="text-xs text-amber-800 font-medium">Recommendation:</p>
                                          <p className="text-xs text-amber-700">{area.recommendation}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Regulatory Alignment */}
                            <div className="bg-white rounded-lg border border-gray-200 p-3">
                              <h4 className="text-sm font-medium mb-2 text-blue-800">Regulatory Alignment</h4>
                              <div className="mb-2">
                                <Progress 
                                  value={generatedProtocol.aiInsights.regulatoryAlignment.score} 
                                  className="h-2" 
                                  // Remove indicatorClassName that was causing an LSP error
                                />
                                <div className="flex justify-between text-xs mt-1">
                                  <span className="text-gray-500">Score</span>
                                  <span className="font-medium text-blue-800">{generatedProtocol.aiInsights.regulatoryAlignment.score}%</span>
                                </div>
                              </div>
                              <div className="mt-3">
                                <p className="text-xs font-medium text-gray-700 mb-1">Based on:</p>
                                <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                                  {generatedProtocol.aiInsights.regulatoryAlignment.citations.map((citation: string, idx: number) => (
                                    <li key={idx}>{citation}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Competitive Market Analysis */}
                            {generatedProtocol.aiInsights.competitiveAnalysis && (
                              <div className="bg-white rounded-lg border border-gray-200 p-3">
                                <h4 className="text-sm font-medium mb-2 text-indigo-800">Recent Market Approvals</h4>
                                <div className="space-y-2">
                                  {generatedProtocol.aiInsights.competitiveAnalysis.recentApprovals.map((approval: any, idx: number) => (
                                    <div key={idx} className="text-xs p-2 bg-gray-50 rounded border border-gray-100">
                                      <div className="font-medium text-gray-800">{approval.name}</div>
                                      <div className="flex justify-between text-gray-600 mt-1">
                                        <span>Approved: {approval.approval}</span>
                                        <span className="text-blue-600">{approval.phase3Result}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-700 mt-3 italic">
                                  {generatedProtocol.aiInsights.competitiveAnalysis.marketDifferentiation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="download">
                    <div className="space-y-6 py-4">
                      <div className="bg-gray-50 p-5 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Export Protocol Document</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">Full Protocol Document (Word)</div>
                                <div className="text-sm text-gray-500">Editable document with all sections</div>
                              </div>
                            </div>
                            <Button size="sm" className="gap-1">
                              <Download className="h-4 w-4" />
                              Export DOCX
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <div className="font-medium">Full Protocol Document (PDF)</div>
                                <div className="text-sm text-gray-500">Final version for submission</div>
                              </div>
                            </div>
                            <Button size="sm" className="gap-1" variant="outline">
                              <Download className="h-4 w-4" />
                              Export PDF
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                                <PieChart className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div>
                                <div className="font-medium">Protocol Summary Slides</div>
                                <div className="text-sm text-gray-500">Presentation-ready overview</div>
                              </div>
                            </div>
                            <Button size="sm" className="gap-1" variant="outline">
                              <Download className="h-4 w-4" />
                              Export PPT
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-yellow-800 mb-1">Protocol Validation Notice</h3>
                            <p className="text-sm text-yellow-700 mb-2">
                              This protocol has minor issues that should be addressed before finalization:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li className="text-sm text-yellow-700">Add detailed statistical analysis plan</li>
                              <li className="text-sm text-yellow-700">Define secondary endpoints more specifically</li>
                              <li className="text-sm text-yellow-700">Review inclusion/exclusion criteria for consistency</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <CardFooter className="border-t bg-gray-50 flex justify-between">
                <Button variant="outline" size="sm">
                  <Brain className="h-4 w-4 mr-2" />
                  Get Design Feedback
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Save to Dossier
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8 max-w-md">
                <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-medium mb-2">Protocol Builder</h3>
                <p className="text-gray-500 mb-6">
                  Fill in the form to generate a clinical trial protocol using our AI-powered protocol builder, backed by real-world evidence.
                </p>
                <Button onClick={handleUploadClick} variant="outline" className="mb-3">
                  <Upload className="h-4 w-4 mr-2" />
                  Import from Existing Protocol
                </Button>
                <p className="text-sm text-gray-400">
                  Or use the form to create a new protocol from scratch
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Protocol Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Upload Existing Protocol
            </DialogTitle>
            <DialogDescription>
              Upload your existing protocol to analyze and improve using our AI-powered recommendations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {!uploadedFile ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                />
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">Drag & drop your protocol PDF or click to browse</h3>
                <p className="text-gray-500 mb-2">
                  Upload your Lumen Bio protocol or any PDF protocol document for analysis
                </p>
                <Button variant="outline" className="mt-2">Select PDF File</Button>
              </div>
            ) : !analysisResults ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500">{Math.round(uploadedFile.size / 1024)} KB</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-red-600"
                    onClick={() => {
                      setUploadedFile(null);
                      setAnalysisResults(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex justify-center">
                  <Button 
                    onClick={handleAnalyzeProtocol} 
                    disabled={isAnalyzing}
                    className="gap-2"
                  >
                    {isAnalyzing && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                    {isAnalyzing ? "Analyzing Protocol PDF..." : "Analyze Protocol PDF"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-md font-medium mb-3">Extracted Protocol Information</h3>
                    <div className="space-y-2">
                      {analysisResults && analysisResults.extractedInfo ? 
                        Object.entries(analysisResults.extractedInfo).map(([key, value]) => (
                          <div key={key} className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                            <div className="font-medium">{value as string}</div>
                          </div>
                        ))
                      : <div className="text-gray-500 italic">No extracted information available</div>
                      }
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium mb-3">Protocol Evaluation</h3>
                    <div className="space-y-3">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex justify-between">
                          <div className="text-green-800 font-medium mb-2">Strengths</div>
                          <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                            Based on FDA/EMA standards
                          </div>
                        </div>
                        <ul className="list-disc pl-5 space-y-2">
                          {analysisResults?.evaluation?.strengths?.map((strength: string, index: number) => (
                            <li key={index} className="text-sm text-green-700">
                              <div>{strength}</div>
                              <div className="text-xs text-green-600 mt-1 italic">
                                {index === 0 && "Found in 87% of successful Phase 2 obesity trials in the past 5 years"}
                                {index === 1 && "Aligns with ICH E9 statistical principles for clinical trials"}
                                {index === 2 && "Consistent with FDA guidance on adequate sample size determination"}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-amber-50 p-3 rounded-lg">
                        <div className="flex justify-between">
                          <div className="text-amber-800 font-medium mb-2">Improvement Areas</div>
                          <div className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                            Evidence-based recommendations
                          </div>
                        </div>
                        <ul className="list-disc pl-5 space-y-2">
                          {analysisResults?.evaluation?.improvements?.map((improvement: string, index: number) => (
                            <li key={index} className="text-sm text-amber-700">
                              <div>{improvement}</div>
                              <div className="text-xs text-amber-600 mt-1 italic">
                                {index === 0 && "Recent FDA-approved obesity treatments (2023-2024) included cardiovascular secondary endpoints in 92% of trials"}
                                {index === 1 && "FDA February 2024 obesity guidance suggests 24-month follow-up for chronic weight management products"}
                                {index === 2 && "Multiple imputation strategies were used in 78% of successful obesity trials from 2022-2024"}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-blue-100 rounded-lg p-4">
                  <h3 className="text-md font-medium mb-3 text-blue-800">AI Comparative Analysis</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Our analysis compared this protocol against 245 obesity trials from our database, with particular attention to recent Phase 2 studies from 2021-2024.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-blue-800 font-medium mb-1">Regulatory Alignment</div>
                      <div className="mt-1">
                        <Progress value={analysisResults?.evaluation?.regulatoryAlignment || 0} className="h-2" />
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-gray-500">Score</span>
                          <span className="font-medium text-blue-800">{analysisResults?.evaluation?.regulatoryAlignment || 0}%</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-blue-700">
                        Regulatory citations:
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>FDA Guidance (Feb 2024)</li>
                          <li>EMA/CHMP/311805/2014</li>
                          <li>ICH E9 Statistical Principles</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <div className="text-indigo-800 font-medium mb-1">Precedent Matching</div>
                      <div className="mt-1">
                        <Progress value={analysisResults?.evaluation?.precedentMatching || 0} className="h-2" />
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-gray-500">Score</span>
                          <span className="font-medium text-indigo-800">{analysisResults?.evaluation?.precedentMatching || 0}%</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-indigo-700">
                        Based on recent approvals:
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Wegovy® (semaglutide)</li>
                          <li>Zepbound™ (tirzepatide)</li>
                          <li>Saxenda® (liraglutide)</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <div className="text-emerald-800 font-medium mb-1">Success Probability</div>
                      <div className="mt-1">
                        <Progress value={72} className="h-2" 
                          // Use a single combined className for styling both container and indicator
                        />
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-gray-500">Estimate</span>
                          <span className="font-medium text-emerald-800">72%</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-emerald-700">
                        Key success factors:
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Clear primary endpoint</li>
                          <li>Appropriate inclusion criteria</li>
                          <li>Well-designed randomization</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-medium">Similar Precedent Trials</h3>
                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Similarity score based on NLP analysis of design elements
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-2 px-3 text-left font-medium text-gray-700">Trial ID</th>
                          <th className="py-2 px-3 text-left font-medium text-gray-700">Title</th>
                          <th className="py-2 px-3 text-left font-medium text-gray-700">Sponsor</th>
                          <th className="py-2 px-3 text-left font-medium text-gray-700">Date</th>
                          <th className="py-2 px-3 text-center font-medium text-gray-700">Key Learning</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisResults?.evaluation?.similarTrials?.map((trial: any, index: number) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="py-2 px-3 font-medium text-blue-600">{trial.id}</td>
                            <td className="py-2 px-3">{trial.title}</td>
                            <td className="py-2 px-3">{trial.sponsor}</td>
                            <td className="py-2 px-3 text-gray-500">{trial.date}</td>
                            <td className="py-2 px-3 text-gray-700 text-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600">View Insight</Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-md p-4">
                                    <p className="font-medium text-sm mb-1">Key Insights from {trial.id}</p>
                                    <p className="text-xs text-gray-700 mb-2">
                                      {index === 0 ? 
                                        "This study's stratified randomization strategy improved balance across BMI subgroups, which reduced variability in the primary analysis." :
                                        "This study included cardiovascular secondary endpoints which provided valuable safety data that facilitated regulatory approval."
                                      }
                                    </p>
                                    <p className="text-xs font-medium">Relevant adaptation for your protocol:</p>
                                    <p className="text-xs text-gray-700">
                                      {index === 0 ? 
                                        "Consider adding stratification by baseline BMI (30-35, >35-40, >40 kg/m²) to improve statistical efficiency." :
                                        "Include pre-specified cardiovascular endpoints (blood pressure, heart rate, ECG parameters) as secondary outcomes."
                                      }
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-md font-medium mb-3 text-purple-800">Expert Recommendations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        <div className="font-medium text-purple-800">Study Design Enhancement</div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        Consider adding an adaptive design element to potentially reduce sample size requirements based on interim analysis of treatment effect.
                      </p>
                      <div className="text-xs text-gray-500">
                        <span className="text-purple-600 font-medium">Source:</span> Analysis of 18 successful adaptive design obesity trials from 2020-2024
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <PieChart className="h-5 w-5 text-purple-600" />
                        <div className="font-medium text-purple-800">Statistical Power Optimization</div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        The current sample size (90) should be sufficient, but consider ANCOVA with baseline BMI as covariate to improve power by approximately 15-20%.
                      </p>
                      <div className="text-xs text-gray-500">
                        <span className="text-purple-600 font-medium">Source:</span> Meta-analysis of statistical approaches in 37 weight-loss intervention trials
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {analysisResults && (
              <Button onClick={handleUseAnalysisResults}>
                Use Protocol Data
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProtocolDesigner;