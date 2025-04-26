import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import DocuSharePanel from './DocuSharePanel';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, FileText, Folder, Info, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

/**
 * INDDocuShareIntegration
 * 
 * Desktop-like document management interface specifically designed for the IND Module
 * with specialized features for IND document management and submission.
 */
export default function INDDocuShareIntegration() {
  const [activeTab, setActiveTab] = useState('document-manager');
  const [submissionStatus, setSubmissionStatus] = useState({
    inProgress: false,
    percentComplete: 0,
    currentStep: '',
    nextStep: ''
  });

  const startSubmissionProcess = () => {
    setSubmissionStatus({
      inProgress: true,
      percentComplete: 0,
      currentStep: 'Validating documents',
      nextStep: 'Assembling eCTD structure'
    });

    // Simulate the submission process
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      
      let currentStep = 'Validating documents';
      let nextStep = 'Assembling eCTD structure';
      
      if (progress > 20) {
        currentStep = 'Assembling eCTD structure';
        nextStep = 'Generating XML backbone';
      }
      
      if (progress > 40) {
        currentStep = 'Generating XML backbone';
        nextStep = 'Creating submission package';
      }
      
      if (progress > 60) {
        currentStep = 'Creating submission package';
        nextStep = 'Validating submission package';
      }
      
      if (progress > 80) {
        currentStep = 'Validating submission package';
        nextStep = 'Finalizing';
      }
      
      setSubmissionStatus({
        inProgress: true,
        percentComplete: progress,
        currentStep,
        nextStep
      });
      
      if (progress >= 100) {
        clearInterval(interval);
        setSubmissionStatus({
          inProgress: false,
          percentComplete: 100,
          currentStep: 'Submission package ready',
          nextStep: ''
        });
      }
    }, 400);
  };
  
  // Document statistics for the dashboard
  const stats = {
    totalDocuments: 48,
    byModule: [
      { name: 'Module 1', count: 12, complete: 9 },
      { name: 'Module 2', count: 8, complete: 7 },
      { name: 'Module 3', count: 15, complete: 12 },
      { name: 'Module 4', count: 5, complete: 4 },
      { name: 'Module 5', count: 8, complete: 6 }
    ],
    byStatus: [
      { status: 'Approved', count: 38 },
      { status: 'Pending Review', count: 7 },
      { status: 'Rejected', count: 3 }
    ],
    recentActivity: [
      { action: 'Upload', user: 'Michael Chen', document: 'Clinical Study Report 301.pdf', timestamp: '2025-04-25T14:30:00Z' },
      { action: 'Approval', user: 'Sarah Johnson', document: 'Module 3 CMC.pdf', timestamp: '2025-04-25T11:15:00Z' },
      { action: 'Review', user: 'David Lee', document: 'Protocol Amendment 2.pdf', timestamp: '2025-04-24T16:45:00Z' },
      { action: 'Upload', user: 'Jennifer Wilson', document: 'FDA Form 1571.pdf', timestamp: '2025-04-24T09:20:00Z' }
    ]
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-muted/30 pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">IND Document Management System</CardTitle>
              <CardDescription>
                Manage and organize documents for FDA IND submission
              </CardDescription>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2"></span>
              Connected to DocuShare • TrialSAGE-DS7
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-3 pb-0 px-0">
          <Tabs 
            defaultValue="document-manager" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b px-6">
              <TabsList className="bg-transparent h-10">
                <TabsTrigger value="document-manager" className="data-[state=active]:bg-background rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Document Manager
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-background rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="submission" className="data-[state=active]:bg-background rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Submission Manager
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="document-manager" className="mt-0">
              <div className="h-[600px]">
                <DocuSharePanel />
              </div>
            </TabsContent>
            
            <TabsContent value="dashboard" className="mt-0 p-6">
              <div className="grid grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Document Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.byStatus.map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-sm">{item.status}</span>
                          <Badge variant={
                            item.status === 'Approved' ? 'default' : 
                            item.status === 'Pending Review' ? 'secondary' : 'destructive'
                          }>
                            {item.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Module Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.byModule.map((module, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{module.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {module.complete} of {module.count} documents
                            </span>
                          </div>
                          <Progress value={(module.complete / module.count) * 100} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-center p-2 hover:bg-muted/50 rounded-md">
                          {activity.action === 'Upload' && <Upload className="w-4 h-4 mr-2 text-blue-500" />}
                          {activity.action === 'Approval' && <Info className="w-4 h-4 mr-2 text-green-500" />}
                          {activity.action === 'Review' && <FileText className="w-4 h-4 mr-2 text-amber-500" />}
                          
                          <div className="flex-1">
                            <div className="flex items-baseline">
                              <span className="font-medium">{activity.document}</span>
                              <span className="ml-2 text-sm text-muted-foreground">
                                {activity.action} by {activity.user}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="submission" className="mt-0 p-6">
              <div className="grid grid-cols-3 gap-6">
                <Card className="col-span-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">IND Submission Wizard</CardTitle>
                    <CardDescription>
                      Prepare your IND documents for FDA submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {submissionStatus.inProgress ? (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Progress</span>
                              <span>{submissionStatus.percentComplete}%</span>
                            </div>
                            <Progress value={submissionStatus.percentComplete} />
                          </div>
                          
                          <div className="p-4 bg-muted rounded-md">
                            <div className="mb-2">
                              <span className="font-medium">Current Step:</span> {submissionStatus.currentStep}
                            </div>
                            {submissionStatus.nextStep && (
                              <div>
                                <span className="font-medium">Next Step:</span> {submissionStatus.nextStep}
                              </div>
                            )}
                          </div>
                          
                          {submissionStatus.percentComplete >= 100 && (
                            <div className="flex justify-center">
                              <Button className="w-full md:w-auto">
                                <Download className="mr-2 h-4 w-4" /> Download Submission Package
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2 border p-4 rounded-md">
                              <div className="font-medium flex items-center">
                                <ArrowUpDown className="mr-2 h-4 w-4" />
                                <span>eCTD Sequence Number</span>
                              </div>
                              <input 
                                type="text" 
                                className="w-full border rounded-md px-3 py-1"
                                placeholder="0000"
                                defaultValue="0001"
                              />
                            </div>
                            
                            <div className="space-y-2 border p-4 rounded-md">
                              <div className="font-medium flex items-center">
                                <Folder className="mr-2 h-4 w-4" />
                                <span>Target Submission Folder</span>
                              </div>
                              <select className="w-full border rounded-md px-3 py-1">
                                <option value="original">Original Submission</option>
                                <option value="amendment">Amendment</option>
                                <option value="response">Response to FDA</option>
                              </select>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-medium mb-2">Required Documents</h3>
                            <div className="space-y-2">
                              {[
                                { name: 'FDA Form 1571', status: 'complete' },
                                { name: 'FDA Form 1572', status: 'complete' },
                                { name: 'Investigator's Brochure', status: 'complete' },
                                { name: 'Clinical Protocol', status: 'complete' },
                                { name: 'Chemistry, Manufacturing and Controls', status: 'warning' },
                                { name: 'Pharmacology/Toxicology', status: 'error' }
                              ].map((doc, i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-1">
                                  <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2" />
                                    <span>{doc.name}</span>
                                  </div>
                                  <Badge variant={
                                    doc.status === 'complete' ? 'default' : 
                                    doc.status === 'warning' ? 'secondary' : 'destructive'
                                  }>
                                    {doc.status === 'complete' ? 'Ready' : 
                                     doc.status === 'warning' ? 'Review Needed' : 'Missing'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex justify-center pt-2">
                            <Button onClick={startSubmissionProcess}>
                              Prepare Submission Package
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}