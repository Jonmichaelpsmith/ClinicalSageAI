/**
 * FDA Forms Step Component
 * 
 * This component serves as the main container for the FDA forms section of the IND Wizard.
 * It integrates the individual form generators and provides navigation between them.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import ErrorBoundary from '@/components/ui/error-boundary';
import { useDatabaseStatus } from '@/components/providers/database-status-provider';
import { DatabaseAware } from '@/components/ui/database-aware';
import FormsManager from '../forms/FormsManager';
import {
  FileText,
  Folder,
  HelpCircle,
  CalendarDays,
  Clock,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  Download,
  Upload,
  PlusCircle,
  Workflow
} from 'lucide-react';

/**
 * FDA Forms Step Component
 */
export default function FdaFormsStep({ projectId = "12345" }) {
  const [activeTab, setActiveTab] = useState('forms');
  const { isConnected } = useDatabaseStatus();
  
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">FDA Forms</h2>
            <p className="text-muted-foreground">
              Manage and generate required forms for your IND submission
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Forms
            </Button>
            <Button variant="outline">
              <Folder className="h-4 w-4 mr-2" />
              Submission Folder
            </Button>
          </div>
        </div>
        
        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="forms">
                <FileText className="h-4 w-4 mr-2" />
                FDA Forms
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <CalendarDays className="h-4 w-4 mr-2" />
                Submission Timeline
              </TabsTrigger>
              <TabsTrigger value="checklist">
                <FileCheck className="h-4 w-4 mr-2" />
                Submission Checklist
              </TabsTrigger>
              <TabsTrigger value="history">
                <Clock className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>
            
            <Button variant="default" size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Form
            </Button>
          </div>
          
          <TabsContent value="forms" className="space-y-6">
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertTitle>Submission Requirements</AlertTitle>
              <AlertDescription>
                An IND submission requires several key FDA forms, including Form 1571 (Cover Form), 
                Form 1572 (Statement of Investigator), Form 3674 (Certification of Compliance), and 
                Form 3454 (Financial Disclosure).
              </AlertDescription>
            </Alert>
            
            <DatabaseAware
              title="Forms Unavailable"
              description="Form generation requires a database connection which is currently unavailable."
            >
              <FormsManager projectId={projectId} />
            </DatabaseAware>
          </TabsContent>
          
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">IND Submission Timeline</CardTitle>
                <CardDescription>
                  Track key milestones and deadlines for your IND submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="flex items-center">
                    <div className="w-12 flex-shrink-0 flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="w-1 bg-gray-200 h-16"></div>
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Protocol Finalization</h3>
                          <p className="text-sm text-muted-foreground">Final protocol approved by all stakeholders</p>
                        </div>
                        <span className="text-sm text-muted-foreground">Completed on Apr 15, 2025</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 flex-shrink-0 flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="w-1 bg-gray-200 h-16"></div>
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">FDA Forms Preparation</h3>
                          <p className="text-sm text-muted-foreground">Preparation and review of FDA Forms 1571, 1572, 3674, and 3454</p>
                        </div>
                        <span className="text-sm text-muted-foreground">Completed on Apr 18, 2025</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 flex-shrink-0 flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Workflow className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="w-1 bg-gray-200 h-16"></div>
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">CMC Documentation</h3>
                          <p className="text-sm text-muted-foreground">Compilation of chemistry, manufacturing, and controls documentation</p>
                        </div>
                        <span className="text-sm text-muted-foreground">In Progress - Due Apr 30, 2025</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 flex-shrink-0 flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="w-1 bg-gray-200 h-16"></div>
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Nonclinical Data Compilation</h3>
                          <p className="text-sm text-muted-foreground">Compilation and summarization of all nonclinical data</p>
                        </div>
                        <span className="text-sm text-muted-foreground">Pending - Due May 10, 2025</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 flex-shrink-0 flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">IND Submission</h3>
                          <p className="text-sm text-muted-foreground">Final review and submission to FDA</p>
                        </div>
                        <span className="text-sm text-muted-foreground">Planned - May 20, 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="checklist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">IND Submission Checklist</CardTitle>
                <CardDescription>
                  Track completion status of required components for IND submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Administrative Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center p-2 border rounded">
                        <input type="checkbox" id="form1571" className="h-4 w-4 mr-2" checked readOnly />
                        <label htmlFor="form1571" className="text-sm flex-grow">Form FDA 1571</label>
                        <span className="text-xs text-green-600 flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Complete
                        </span>
                      </div>
                      <div className="flex items-center p-2 border rounded">
                        <input type="checkbox" id="form1572" className="h-4 w-4 mr-2" checked readOnly />
                        <label htmlFor="form1572" className="text-sm flex-grow">Form FDA 1572</label>
                        <span className="text-xs text-green-600 flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Complete
                        </span>
                      </div>
                      <div className="flex items-center p-2 border rounded">
                        <input type="checkbox" id="form3674" className="h-4 w-4 mr-2" />
                        <label htmlFor="form3674" className="text-sm flex-grow">Form FDA 3674</label>
                        <span className="text-xs text-blue-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          In Progress
                        </span>
                      </div>
                      <div className="flex items-center p-2 border rounded">
                        <input type="checkbox" id="form3454" className="h-4 w-4 mr-2" />
                        <label htmlFor="form3454" className="text-sm flex-grow">Form FDA 3454</label>
                        <span className="text-xs text-gray-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Not Started
                        </span>
                      </div>
                      <div className="flex items-center p-2 border rounded">
                        <input type="checkbox" id="coverLetter" className="h-4 w-4 mr-2" checked readOnly />
                        <label htmlFor="coverLetter" className="text-sm flex-grow">Cover Letter</label>
                        <span className="text-xs text-green-600 flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Complete
                        </span>
                      </div>
                      <div className="flex items-center p-2 border rounded">
                        <input type="checkbox" id="tableOfContents" className="h-4 w-4 mr-2" />
                        <label htmlFor="tableOfContents" className="text-sm flex-grow">Table of Contents</label>
                        <span className="text-xs text-gray-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Not Started
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Technical Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center p-2 border rounded">
                        <input type="checkbox" id="protocol" className="h-4 w-4 mr-2" checked readOnly />
                        <label htmlFor="protocol" className="text-sm flex-grow">Clinical Protocol</label>
                        <span className="text-xs text-green-600 flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Complete
                        </span>
                      </div>
                      <div className="flex items-center p-2 border rounded">
                        <input type="checkbox" id="investigatorBrochure" className="h-4 w-4 mr-2" />
                        <label htmlFor="investigatorBrochure" className="text-sm flex-grow">Investigator's Brochure</label>
                        <span className="text-xs text-blue-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          In Progress
                        </span>
                      </div>
                      <div className="flex items-center p-2 border rounded">
                        <input type="checkbox" id="cmcInfo" className="h-4 w-4 mr-2" />
                        <label htmlFor="cmcInfo" className="text-sm flex-grow">CMC Information</label>
                        <span className="text-xs text-blue-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          In Progress
                        </span>
                      </div>
                      <div className="flex items-center p-2 border rounded">
                        <input type="checkbox" id="pharmacologyData" className="h-4 w-4 mr-2" />
                        <label htmlFor="pharmacologyData" className="text-sm flex-grow">Pharmacology/Toxicology Data</label>
                        <span className="text-xs text-gray-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Not Started
                        </span>
                      </div>
                      <div className="flex items-center p-2 border rounded">
                        <input type="checkbox" id="previousHumanExp" className="h-4 w-4 mr-2" />
                        <label htmlFor="previousHumanExp" className="text-sm flex-grow">Previous Human Experience</label>
                        <span className="text-xs text-gray-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Not Applicable
                        </span>
                      </div>
                      <div className="flex items-center p-2 border rounded">
                        <input type="checkbox" id="additionalInfo" className="h-4 w-4 mr-2" />
                        <label htmlFor="additionalInfo" className="text-sm flex-grow">Additional Information</label>
                        <span className="text-xs text-gray-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Not Started
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="bg-muted/40 p-4 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Overall Completion</h3>
                      <span className="text-sm">35% Complete</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Form Submission History</CardTitle>
                <CardDescription>
                  Track versions and submissions of FDA forms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted/30">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Form</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Version</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-border">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">Form FDA 1571</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">v1.3</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Submitted</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">Apr 18, 2025</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                <FileText className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">Form FDA 1571</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">v1.2</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">Superseded</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">Apr 15, 2025</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                <FileText className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">Form FDA 1572</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">v1.0</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Submitted</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">Apr 16, 2025</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                <FileText className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">Form FDA 3674</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">v1.0</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">In Progress</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">-</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                <FileText className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}