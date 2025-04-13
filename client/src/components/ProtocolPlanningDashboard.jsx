// /client/src/components/ProtocolPlanningDashboard.jsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, Calculator, FileText, Activity, TrendingDown, Sparkles, 
  Mail, Save, Download, BookCopy, AlertTriangle, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

import ProtocolUploadPanel from "@/components/protocol/ProtocolUploadPanel";
import SampleSizeCalculator from "@/components/SampleSizeCalculator";
import DropoutEstimator from "@/components/DropoutEstimator";
import TrialSuccessPredictor from "@/components/TrialSuccessPredictor";
import RegulatoryReadinessScore from "@/components/RegulatoryReadinessScore";

export default function ProtocolPlanningDashboard() {
  const [activeTab, setActiveTab] = useState("protocol");
  const [emailData, setEmailData] = useState({
    recipientEmail: "",
    subject: "TrialSage Planning Model Results",
    message: "Please find attached the trial planning model generated from TrialSage. This includes sample size calculations, dropout estimates, and success probability assessments."
  });
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      // Call the actual API endpoint for sending reports via email
      const response = await fetch("/api/intel/scheduled-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: emailData.recipientEmail,
          subject: emailData.subject,
          message: emailData.message
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      toast({
        title: "Email sent successfully",
        description: `Planning model sent to ${emailData.recipientEmail}`,
      });
      
      setEmailData({
        ...emailData,
        recipientEmail: ""
      });
      
    } catch (error) {
      console.error("Failed to send email:", error);
      toast({
        title: "Failed to send email",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleSaveSession = async () => {
    setIsSaving(true);
    
    try {
      // Call actual API endpoint to save the session
      const response = await fetch("/api/analytics/save-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          sessionData: {
            activeTab,
            // Add any other session data that needs to be saved
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      toast({
        title: "Session saved",
        description: "All your planning model data has been saved",
      });
    } catch (error) {
      console.error("Failed to save session:", error);
      toast({
        title: "Failed to save session",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Direct call to the scheduled report endpoint (simplified email workflow)
  const handleQuickEmailReport = async () => {
    try {
      const response = await fetch("/api/intel/scheduled-report");
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      toast({
        title: "Report emailed",
        description: "Your report has been emailed to your configured address",
      });
    } catch (error) {
      console.error("Failed to email report:", error);
      toast({
        title: "Failed to email report",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📊 Protocol Insights Dashboard</h1>
        
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSaveSession}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>Saving<BookCopy className="ml-2 h-4 w-4 animate-pulse" /></>
                  ) : (
                    <>Save Session <Save className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save your current planning session</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Mail className="mr-2 h-4 w-4" /> Email to Stakeholders
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Email Planning Model</DialogTitle>
                <DialogDescription>
                  Send the current trial planning model to stakeholders
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleEmailSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="recipient">Recipient Email</Label>
                    <Input 
                      id="recipient" 
                      placeholder="stakeholder@company.com" 
                      value={emailData.recipientEmail}
                      onChange={(e) => setEmailData({...emailData, recipientEmail: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      value={emailData.subject}
                      onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      rows={4}
                      value={emailData.message}
                      onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={isSending}>
                    {isSending ? "Sending..." : "Send Email"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <a href="/static/latest_report.pdf" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </a>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="protocol">
            <FileText className="h-4 w-4 mr-2" />
            Upload + Analyze
          </TabsTrigger>
          <TabsTrigger value="sampleSize">
            <Calculator className="h-4 w-4 mr-2" />
            Sample Size
          </TabsTrigger>
          <TabsTrigger value="dropoutEstimator">
            <TrendingDown className="h-4 w-4 mr-2" />
            Dropout Estimator
          </TabsTrigger>
          <TabsTrigger value="successPredictor">
            <Sparkles className="h-4 w-4 mr-2" />
            Success Predictor
          </TabsTrigger>
          <TabsTrigger value="regulatoryReadiness">
            <Shield className="h-4 w-4 mr-2" />
            Regulatory Readiness
          </TabsTrigger>
          <TabsTrigger value="benchmarking" disabled>
            <BarChart3 className="h-4 w-4 mr-2" />
            CSR Benchmarking
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="protocol" className="mt-4">
          <ProtocolUploadPanel />
        </TabsContent>
        
        <TabsContent value="sampleSize" className="mt-4">
          <SampleSizeCalculator />
        </TabsContent>
        
        <TabsContent value="dropoutEstimator" className="mt-4">
          <DropoutEstimator />
        </TabsContent>
        
        <TabsContent value="successPredictor" className="mt-4">
          <TrialSuccessPredictor />
        </TabsContent>
        
        <TabsContent value="regulatoryReadiness" className="mt-4">
          <RegulatoryReadinessScore />
        </TabsContent>
        
        <TabsContent value="benchmarking" className="mt-4">
          <div className="p-8 text-center border border-dashed rounded-lg">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">CSR Benchmarking</h3>
            <p className="text-muted-foreground">Compare your protocol against CSR data from similar studies</p>
            <p className="text-sm mt-2 text-muted-foreground">Coming in the next update</p>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-blue-800">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Download latest report</span>
              <a href="/static/latest_report.pdf" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Email report to team</span>
              <Button variant="ghost" size="sm" onClick={handleQuickEmailReport}>
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-purple-50 border border-purple-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-purple-800">Coming Soon: Endpoint Optimizer</h3>
          <p className="text-purple-700 mb-4">Discover optimal primary and secondary endpoints for your indication based on historical trial successes from our CSR database.</p>
          <div className="text-xs text-purple-500">Available in the next release</div>
        </div>
      </div>
    </div>
  );
}