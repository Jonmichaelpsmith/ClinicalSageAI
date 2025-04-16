import React from 'react';
import CERGenerator from "../components/CERGenerator";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  FileBarChart2, 
  BookOpen, 
  HelpCircle, 
  GitPullRequest, 
  Beaker,
  FileSearch,
  PieChart,
  AlertCircle
} from 'lucide-react';

export default function CERGeneratorPage() {
  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">CER Generator</h1>
            <Badge className="mt-1">FDA FAERS Integration</Badge>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            Generate comprehensive Clinical Evaluation Reports with automated FDA FAERS data extraction, 
            advanced signal detection, and regulatory-compliant narratives.
          </p>
        </div>
        <div className="hidden md:flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/enhanced-cer-dashboard">
              <PieChart className="h-4 w-4 mr-1" />
              CER Dashboard
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="https://www.fda.gov/drugs/questions-and-answers-fdas-adverse-event-reporting-system-faers/fda-adverse-event-reporting-system-faers-public-dashboard" target="_blank" rel="noopener noreferrer">
              <FileSearch className="h-4 w-4 mr-1" />
              FAERS Documentation
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="generator" className="space-y-6">
            <TabsList>
              <TabsTrigger value="generator">CER Generator</TabsTrigger>
              <TabsTrigger value="guide">User Guide</TabsTrigger>
            </TabsList>
            
            <TabsContent value="generator" className="space-y-6">
              <CERGenerator />
            </TabsContent>
            
            <TabsContent value="guide" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>CER Generator User Guide</CardTitle>
                  <CardDescription>
                    Learn how to efficiently generate regulatory-compliant Clinical Evaluation Reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Getting Started</h3>
                    <p>
                      The Clinical Evaluation Report (CER) Generator is a powerful tool that allows you to create 
                      comprehensive reports using real-world data from the FDA Adverse Event Reporting System (FAERS).
                      These reports follow the MEDDEV 2.7/1 Rev. 4 structure for medical devices and similar 
                      pharmaceutical industry standards for drugs.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="border rounded-lg p-4 bg-card">
                        <h4 className="text-base font-medium flex items-center mb-2">
                          <FileBarChart2 className="h-4 w-4 mr-2 text-primary" />
                          Step 1: Enter NDC Code
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Enter the National Drug Code (NDC) for your product. This unique identifier helps the system 
                          retrieve all relevant adverse event data from FDA FAERS.
                        </p>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-card">
                        <h4 className="text-base font-medium flex items-center mb-2">
                          <GitPullRequest className="h-4 w-4 mr-2 text-primary" />
                          Step 2: Retrieve FAERS Data
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Click "Fetch Data" to retrieve adverse event reports from FDA's FAERS database. The system will 
                          aggregate, analyze, and prepare the data for report generation.
                        </p>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-card">
                        <h4 className="text-base font-medium flex items-center mb-2">
                          <Beaker className="h-4 w-4 mr-2 text-primary" />
                          Step 3: Review Generated Report
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          After data retrieval, the system automatically generates a regulatory-compliant CER narrative. 
                          Review the content for accuracy and completeness.
                        </p>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-card">
                        <h4 className="text-base font-medium flex items-center mb-2">
                          <BookOpen className="h-4 w-4 mr-2 text-primary" />
                          Step 4: Save & Download
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Provide a title for your report, then save it to the system and/or download it as a text file. 
                          Saved reports can be accessed from the CER Dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Advanced Features</h3>
                    <p>
                      The CER Generator provides several advanced features to enhance your reports:
                    </p>
                    
                    <ul className="space-y-2 list-disc pl-5">
                      <li className="text-sm">
                        <strong>Product Name Override</strong>: Optionally specify a custom product name when the NDC code 
                        doesn't properly identify your product.
                      </li>
                      <li className="text-sm">
                        <strong>Signal Detection</strong>: The system automatically detects potential safety signals based 
                        on statistical disproportionality analysis of adverse events.
                      </li>
                      <li className="text-sm">
                        <strong>Regulatory Compliance</strong>: Generated reports follow regulatory guidelines and include 
                        all necessary sections required for submission.
                      </li>
                      <li className="text-sm">
                        <strong>Integration with CER Dashboard</strong>: Saved reports can be viewed, compared, and monitored 
                        from the Enhanced CER Dashboard.
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <div className="flex items-start gap-2 w-full">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">Important Note</p>
                      <p>
                        While this tool helps automate CER creation, all reports should be reviewed by appropriate
                        regulatory, medical, and safety personnel before submission to regulatory agencies.
                        The user remains responsible for ensuring regulatory compliance.
                      </p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Finding NDC Codes</p>
                  <p className="text-muted-foreground">Search the <a href="https://www.accessdata.fda.gov/scripts/cder/ndc/index.cfm" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">FDA NDC Directory</a> to locate codes for your products.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Report Customization</p>
                  <p className="text-muted-foreground">Generated reports can be edited before saving to include additional context or analysis.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Regular Updates</p>
                  <p className="text-muted-foreground">FAERS data is updated quarterly. Create new reports regularly to maintain compliance.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Related Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/enhanced-cer-dashboard">
                  <PieChart className="h-4 w-4 mr-2" />
                  CER Dashboard
                </Link>
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/example-reports?type=cer">
                  <FileBarChart2 className="h-4 w-4 mr-2" />
                  Example CER Reports
                </Link>
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/protocol-generator">
                  <Beaker className="h-4 w-4 mr-2" />
                  Protocol Designer
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Our team can help with custom integrations, report templates, and regulatory guidance.
              </p>
              <Button className="w-full" variant="default" size="sm">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}