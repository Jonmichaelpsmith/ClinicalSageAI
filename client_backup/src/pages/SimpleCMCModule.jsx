import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FileText, PlusCircle, Beaker, Brain, Factory, Search, ClipboardCheck } from 'lucide-react';
import withAuthGuard from '../utils/withAuthGuard';

// Simple CMC Module with minimal styling for better readability
const SimpleCMCModule = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('sections');
  const [showNewSubmissionDialog, setShowNewSubmissionDialog] = useState(false);
  
  // Sample CMC sections data
  const cmcSections = [
    {
      id: 1,
      title: 'Drug Substance Manufacturing Process',
      section: 'S.2.2',
      status: 'Approved',
      nextRevision: 'June 15, 2025',
    },
    {
      id: 2,
      title: 'Manufacturing Process Controls',
      section: 'S.2.4',
      status: 'In Review',
      nextRevision: 'May 10, 2025',
    },
    {
      id: 3,
      title: 'Control of Drug Product',
      section: 'P.5',
      status: 'Draft',
      nextRevision: 'May 25, 2025',
    }
  ];

  // Sample submissions data
  const submissions = [
    {
      id: 'FDA-EXP-2025-0042',
      name: 'Examplinostat NDA Submission',
      region: 'FDA',
      status: 'In Preparation',
      targetApprovalDate: 'August 15, 2025'
    },
    {
      id: 'EMA-EXP-2025-0021',
      name: 'Examplinostat MAA',
      region: 'EMA',
      status: 'Submitted',
      targetApprovalDate: 'December 20, 2025'
    }
  ];

  return (
    <div className="container mx-auto p-4 bg-white">
      <h1 className="text-2xl font-bold mb-6 text-black">CMC Management Suite</h1>
      <p className="mb-6 text-black">Comprehensive Chemistry, Manufacturing, and Controls management system</p>
      
      <div className="flex justify-between mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-black" />
          <Input 
            placeholder="Search CMC documents..." 
            className="pl-8 border border-gray-300 text-black" 
          />
        </div>
        <Button 
          onClick={() => setShowNewSubmissionDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> New Section
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="border border-gray-300 bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Beaker className="h-5 w-5 text-blue-600" />
              Enterprise CMC Module
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-black">
              Advanced regulatory capabilities for managing Chemistry, Manufacturing, and Controls documentation for pharmaceutical products.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" className="flex-1 h-full border-gray-300 text-black">
            <Brain className="mr-2 h-5 w-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium">CMC Regulatory Assistant</div>
              <div className="text-xs text-gray-600">Powered by OpenAI GPT-4o</div>
            </div>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sections" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100">
          <TabsTrigger value="sections" className="text-black">
            <FileText className="h-4 w-4 mr-2" />
            CMC Sections
          </TabsTrigger>
          <TabsTrigger value="manufacturing" className="text-black">
            <Factory className="h-4 w-4 mr-2" />
            Manufacturing
          </TabsTrigger>
          <TabsTrigger value="submissions" className="text-black">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Submissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cmcSections.map((section) => (
              <Card key={section.id} className="border border-gray-300">
                <CardHeader>
                  <CardTitle className="text-black">{section.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-black">Section {section.section}</span>
                    <span className="px-2 py-1 bg-gray-200 rounded text-xs text-black">{section.status}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-right">
                    <span className="text-xs text-gray-600">Next Revision: </span>
                    <span className="text-xs font-medium text-black">{section.nextRevision}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="mt-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg text-black">Active Submissions</h3>
            <Button 
              size="sm" 
              onClick={() => setShowNewSubmissionDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusCircle className="h-4 w-4 mr-1" /> New Submission
            </Button>
          </div>
          
          <div className="space-y-3">
            {submissions.map((submission) => (
              <Card key={submission.id} className="border border-gray-300">
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="text-lg text-black">{submission.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-1 bg-gray-200 rounded text-xs text-black">{submission.region}</span>
                        <span className="px-2 py-1 bg-gray-200 rounded text-xs text-black">{submission.status}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-black">ID: {submission.id}</div>
                      <div className="text-xs text-gray-600 mt-1">Target: {submission.targetApprovalDate}</div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Submission Dialog */}
      <Dialog open={showNewSubmissionDialog} onOpenChange={setShowNewSubmissionDialog}>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-xl text-black">
              Create New Regulatory Submission
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="submission-name" className="text-black">Submission Name</Label>
              <Input id="submission-name" placeholder="e.g., Examplinostat NDA Initial Submission" className="border border-gray-300 text-black" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submission-region" className="text-black">Target Region</Label>
                <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-black">
                  <option value="FDA">FDA (US)</option>
                  <option value="EMA">EMA (EU)</option>
                  <option value="PMDA">PMDA (Japan)</option>
                  <option value="NMPA">NMPA (China)</option>
                  <option value="Health Canada">Health Canada</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="submission-type" className="text-black">Submission Type</Label>
                <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-black">
                  <option value="nda">New Drug Application (NDA)</option>
                  <option value="maa">Marketing Authorization Application</option>
                  <option value="bla">Biologics License Application</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-black">Required CMC Sections</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked id="section-s1" className="rounded border-gray-300" />
                  <Label htmlFor="section-s1" className="text-sm font-normal text-black">S.1 General Information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked id="section-s2" className="rounded border-gray-300" />
                  <Label htmlFor="section-s2" className="text-sm font-normal text-black">S.2 Manufacture</Label>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submission-date" className="text-black">Planned Submission Date</Label>
                <Input type="date" id="submission-date" className="border border-gray-300 text-black" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="approval-date" className="text-black">Target Approval Date</Label>
                <Input type="date" id="approval-date" className="border border-gray-300 text-black" />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSubmissionDialog(false)} className="border border-gray-300 text-black">
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Submission Created",
                description: "New regulatory submission has been created successfully",
              });
              setShowNewSubmissionDialog(false);
            }} className="bg-blue-600 hover:bg-blue-700 text-white">
              Create Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withAuthGuard(SimpleCMCModule);