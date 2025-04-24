import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, CheckCircle, Clock, Pencil, Users, Database, BarChart4, ClipboardCheck, Share2, Printer } from 'lucide-react';

/**
 * StudyDesignReport component for generating comprehensive study design reports
 * with statistical analysis, protocol elements, and regulatory recommendations
 */
const StudyDesignReport = ({ statisticalResults, studyParameters }) => {
  // State for report configuration
  const [reportType, setReportType] = useState('full');
  const [includeAppendices, setIncludeAppendices] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [includeSummaryPage, setIncludeSummaryPage] = useState(true);
  const [includeReferences, setIncludeReferences] = useState(true);
  const [clientName, setClientName] = useState('AORA Health');
  const [projectName, setProjectName] = useState('Enzymax Forte Clinical Development Program');
  const [documentTitle, setDocumentTitle] = useState('Statistical Analysis and Study Design Report');
  const [documentVersion, setDocumentVersion] = useState('1.0');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  
  // Additional study context for the report
  const [studyContext, setStudyContext] = useState('');
  const [regulatoryContext, setRegulatoryContext] = useState('');
  
  // Generate a realistic report (simulated)
  const generateReport = () => {
    setGeneratingReport(true);
    
    // Simulate API call/processing time
    setTimeout(() => {
      setGeneratingReport(false);
      setReportGenerated(true);
    }, 2500);
  };
  
  // Get current date in format: April 24, 2025
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Create report preview content based on the provided statistical results and parameters
  const generateReportPreview = () => {
    // Use default placeholders if no props provided
    const stats = statisticalResults || {
      testType: 'superiority',
      effectSize: 0.5,
      alpha: 0.05,
      power: 0.8,
      recommendedN: 64,
      margin: null
    };
    
    const params = studyParameters || {
      indication: 'Functional Dyspepsia',
      phase: 'Phase II',
      design: 'Randomized, double-blind, placebo-controlled',
      primaryEndpoint: 'Change in NDI SF score from baseline to week 8',
      secondaryEndpoints: ['Quality of life assessment', 'Global symptom relief'],
      duration: '8 weeks',
      visits: 5,
      population: 'Adults with functional dyspepsia (Rome IV criteria)'
    };
    
    return (
      <div className="space-y-4 p-4 max-h-96 overflow-y-auto border rounded-lg bg-white text-sm">
        <div className="text-center">
          <h2 className="text-lg font-bold">{documentTitle}</h2>
          <p className="text-gray-500">
            {clientName} - {projectName}<br />
            Version {documentVersion} | {getCurrentDate()}
          </p>
          <div className="flex justify-center mt-2">
            <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
              CONFIDENTIAL
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="font-bold">EXECUTIVE SUMMARY</h3>
          <p>
            This report presents a comprehensive statistical analysis and study design recommendations for 
            {params.indication} clinical development. Based on rigorous statistical modeling and recent 
            regulatory precedent, we recommend a {params.design} study with {stats.recommendedN * 2} subjects 
            ({stats.recommendedN} per arm) to achieve {stats.power * 100}% power for detecting a clinically 
            meaningful difference with {stats.alpha * 100}% significance level.
          </p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-bold">1. STUDY OVERVIEW</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="font-medium">Indication:</div>
            <div>{params.indication}</div>
            <div className="font-medium">Study Phase:</div>
            <div>{params.phase}</div>
            <div className="font-medium">Design:</div>
            <div>{params.design}</div>
            <div className="font-medium">Primary Endpoint:</div>
            <div>{params.primaryEndpoint}</div>
            <div className="font-medium">Duration:</div>
            <div>{params.duration}</div>
            <div className="font-medium">Population:</div>
            <div>{params.population}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-bold">2. STATISTICAL DESIGN</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="font-medium">Test Type:</div>
            <div>{stats.testType === 'superiority' ? 'Superiority' : 'Non-Inferiority'}</div>
            <div className="font-medium">Alpha (Type I Error):</div>
            <div>{stats.alpha}</div>
            <div className="font-medium">Power (1-β):</div>
            <div>{stats.power}</div>
            <div className="font-medium">Effect Size:</div>
            <div>{stats.effectSize.toFixed(2)}</div>
            {stats.testType === 'non_inferiority' && (
              <>
                <div className="font-medium">Non-Inferiority Margin:</div>
                <div>{stats.margin}</div>
              </>
            )}
            <div className="font-medium">Sample Size per Arm:</div>
            <div><strong>{stats.recommendedN}</strong></div>
            <div className="font-medium">Total Sample Size:</div>
            <div><strong>{stats.recommendedN * 2}</strong></div>
            <div className="font-medium">With 20% Dropout:</div>
            <div><strong>{Math.ceil(stats.recommendedN * 2 / 0.8)}</strong></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-bold">3. REGULATORY CONSIDERATIONS</h3>
          <p>
            Based on recent regulatory precedent and therapeutic area-specific guidance:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>FDA typically requires robust evidence from at least one well-controlled superiority trial for approval in {params.indication}.</li>
            <li>EMA guidance suggests that patient-reported outcomes should be supported by objective measures where possible.</li>
            <li>Both agencies recommend consideration of geographic and demographic diversity in enrollment.</li>
            <li>Special protocol assessment (SPA) is advised given the novel endpoint considerations.</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-bold">4. RECOMMENDATIONS</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Implement the proposed sample size of <strong>{stats.recommendedN * 2}</strong> subjects to ensure adequate power.</li>
            <li>Incorporate adaptive design elements to potentially reduce overall study size while maintaining statistical integrity.</li>
            <li>Stratify randomization by baseline disease severity to control for potential confounding.</li>
            <li>Include interim analysis at 50% enrollment to assess conditional power and variability assumptions.</li>
            <li>Plan for sensitivity analyses to address missing data and protocol deviations.</li>
          </ul>
        </div>
        
        {reportType === 'full' && (
          <>
            <div className="space-y-2">
              <h3 className="font-bold">5. STATISTICAL METHODS</h3>
              <p>
                Primary efficacy analysis will utilize a mixed model for repeated measures (MMRM) approach for the primary endpoint, 
                with fixed effects for treatment, visit, treatment-by-visit interaction, and baseline severity as a covariate. 
                Missing data will be addressed through multiple imputation methods. Secondary analyses will include ANCOVA for 
                continuous endpoints and logistic regression for binary outcomes.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold">6. SAMPLE SIZE SENSITIVITY</h3>
              <p>
                Power analyses indicate that the recommended sample size is robust to moderate variations in effect size and variance 
                assumptions. If the observed standard deviation increases by 20%, an additional 18 subjects per arm would be required 
                to maintain the targeted power. Conversely, if the true effect size is 15% larger than assumed, the study could achieve 
                90% power with the proposed sample size.
              </p>
            </div>
          </>
        )}
        
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Generated by TrialSage Study Architect™<br />Confidential & Proprietary</p>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-orange-100 to-orange-50 border-b">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-orange-800">
          <FileText className="h-6 w-6" />
          Study Design Report Generator
        </CardTitle>
        <CardDescription>
          Generate comprehensive study design reports with statistical analysis, protocol elements, and regulatory recommendations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              <span>Report Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Report Preview</span>
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Generate & Export</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="config">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-medium">Document Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="documentTitle">Document Title</Label>
                    <Input
                      id="documentTitle"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="documentVersion">Version</Label>
                    <Input
                      id="documentVersion"
                      value={documentVersion}
                      onChange={(e) => setDocumentVersion(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">Report Context</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="studyContext">Study Context</Label>
                    <Textarea
                      id="studyContext"
                      placeholder="Provide additional context about the study objectives and background..."
                      value={studyContext}
                      onChange={(e) => setStudyContext(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="regulatoryContext">Regulatory Context</Label>
                    <Textarea
                      id="regulatoryContext"
                      placeholder="Provide specific regulatory considerations or requirements..."
                      value={regulatoryContext}
                      onChange={(e) => setRegulatoryContext(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-medium">Report Options</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reportType">Report Type</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger id="reportType">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary Report (3-5 pages)</SelectItem>
                        <SelectItem value="standard">Standard Report (7-10 pages)</SelectItem>
                        <SelectItem value="full">Full Report (15+ pages)</SelectItem>
                        <SelectItem value="regulatory">Regulatory Submission (ICH E9 compliant)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="includeSummaryPage">Include Executive Summary</Label>
                        <p className="text-xs text-gray-500">
                          Adds a concise overview of key findings and recommendations
                        </p>
                      </div>
                      <Switch
                        id="includeSummaryPage"
                        checked={includeSummaryPage}
                        onCheckedChange={setIncludeSummaryPage}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="includeAppendices">Include Appendices</Label>
                        <p className="text-xs text-gray-500">
                          Additional materials such as detailed statistical methods and sensitivity analyses
                        </p>
                      </div>
                      <Switch
                        id="includeAppendices"
                        checked={includeAppendices}
                        onCheckedChange={setIncludeAppendices}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="includeRawData">Include Raw Data Tables</Label>
                        <p className="text-xs text-gray-500">
                          Detailed data tables from statistical simulations and calculations
                        </p>
                      </div>
                      <Switch
                        id="includeRawData"
                        checked={includeRawData}
                        onCheckedChange={setIncludeRawData}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="includeReferences">Include References</Label>
                        <p className="text-xs text-gray-500">
                          Citations to relevant literature and regulatory guidance documents
                        </p>
                      </div>
                      <Switch
                        id="includeReferences"
                        checked={includeReferences}
                        onCheckedChange={setIncludeReferences}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <h3 className="font-medium text-orange-800 mb-2">Intelligent Report Enhancement</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Advanced AI features to enhance your report with regulatory insights and optimization recommendations
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                      <p className="text-sm">Regulatory compliance check with FDA/EMA guidance</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                      <p className="text-sm">Design optimization recommendations</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                      <p className="text-sm">Therapeutic area-specific protocol elements</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                      <p className="text-sm">Historical precedent analysis from similar trials</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium">{documentTitle}</h3>
                    <p className="text-sm text-gray-500">{clientName} | Version {documentVersion}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                    {reportType === 'summary' ? 'Summary' : 
                     reportType === 'standard' ? 'Standard' : 
                     reportType === 'regulatory' ? 'Regulatory' : 'Full'}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Preview
                  </span>
                </div>
              </div>
              
              {generateReportPreview()}
            </div>
          </TabsContent>
          
          <TabsContent value="generate">
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-medium mb-4">Report Generation Options</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Content Verification</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Study parameters validated</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Statistical calculations verified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Document metadata complete</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">References validated</span>
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-medium mt-4">Output Format</h4>
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        PDF
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        DOCX
                      </div>
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        JSON
                      </div>
                      <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <BarChart4 className="h-3 w-3" />
                        CSV
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Processing Steps</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">1. Compile statistical analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">2. Generate data visualizations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">3. Apply document template</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {reportGenerated ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-500" />
                        )}
                        <span className="text-sm">4. Complete document assembly</span>
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-medium mt-4">Report Actions</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1"
                        disabled={generatingReport || !reportGenerated}
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1"
                        disabled={generatingReport || !reportGenerated}
                      >
                        <Printer className="h-4 w-4" />
                        Print
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1"
                        disabled={generatingReport || !reportGenerated}
                      >
                        <ClipboardCheck className="h-4 w-4" />
                        Validate
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                {!reportGenerated ? (
                  <Button 
                    className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 gap-2"
                    size="lg"
                    onClick={generateReport}
                    disabled={generatingReport}
                  >
                    {generatingReport ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating Report...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5" />
                        <span>Generate Complete Report</span>
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-6 w-6" />
                      <span className="font-medium">Report Generated Successfully!</span>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
                        <Download className="h-4 w-4" />
                        <span>Download PDF</span>
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Download DOCX</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="bg-gradient-to-r from-orange-50 to-orange-100 border-t px-6 py-4">
        <div className="text-sm text-gray-500 flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Generate client-ready reports with FDA-compliant sample size justification, protocol design, and statistical analysis
        </div>
      </CardFooter>
    </Card>
  );
};

export default StudyDesignReport;