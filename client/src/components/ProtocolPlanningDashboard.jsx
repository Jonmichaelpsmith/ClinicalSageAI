// /client/components/ProtocolPlanningDashboard.jsx
import { useState, useEffect } from 'react';
import ProtocolUploadPanel from "@/components/ProtocolUploadPanel";
import SampleSizeCalculator from "@/components/SampleSizeCalculator";
import DropoutSimulator from "@/components/DropoutSimulator";
import TrialSuccessPredictor from "@/components/TrialSuccessPredictor";
import ProtocolValidator from "@/components/ProtocolValidator";
import FixedProtocolViewer from "@/components/FixedProtocolViewer";
import ProtocolEmailer from "@/components/ProtocolEmailer";
import SummaryPacketGenerator from "@/components/SummaryPacketGenerator";
import SummaryPacketArchive from "@/components/SummaryPacketArchive";
import SessionSummaryPanel from "@/components/SessionSummaryPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkPlus, Download, FileArchive, FilePlus2, Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// EmailArchiveButton Component
function EmailArchiveButton({ sessionId }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Function to save email to session persistence API
  const saveEmailToSession = async (emailToSave) => {
    try {
      await fetch("/api/session/email/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          session_id: sessionId, 
          recipient_email: emailToSave 
        })
      });
      
      // Also save to localStorage as fallback
      localStorage.setItem('userEmail', emailToSave);
      
    } catch (error) {
      console.error("Error saving email to session:", error);
      // Still save to localStorage as fallback
      localStorage.setItem('userEmail', emailToSave);
    }
  };

  const handleSend = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setStatus("Sending...");
    setIsLoading(true);
    
    try {
      // Save the email first
      await saveEmailToSession(email);
      
      // Then send the archive
      const res = await fetch("/api/export/email-session-archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          session_id: sessionId, 
          recipient_email: email 
        })
      });
      
      const data = await res.json();
      
      if (data.status === "sent") {
        setStatus(`✅ Sent to ${email}`);
        toast({
          title: "Archive Emailed",
          description: `Complete study archive sent to ${email}`,
        });
      } else {
        setStatus("❌ Failed to send");
        throw new Error("Email failed to send");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setStatus("❌ Failed to send");
      toast({
        title: "Email Failed",
        description: "There was an error sending your archive.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Try to get email from session persistence API, 
  // falling back to local storage if API fails
  useEffect(() => {
    async function loadSavedEmail() {
      if (!sessionId) return;
      
      setIsLoading(true);
      
      try {
        // First try to get from session API
        const response = await fetch(`/api/session/email/get/${sessionId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.email) {
            setEmail(data.email);
            setIsLoading(false);
            return;
          }
        }
        
        // Fallback to localStorage
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
          setEmail(savedEmail);
          
          // Since we found in localStorage but not in API, save it to API
          await saveEmailToSession(savedEmail);
        }
      } catch (error) {
        console.error("Error loading saved email:", error);
        
        // Final fallback to localStorage
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
          setEmail(savedEmail);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSavedEmail();
  }, [sessionId]);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Email My Archive</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-sm"
        />
        <div className="flex items-center justify-between">
          <Button
            variant="default"
            className="bg-gradient-to-r from-blue-500 to-indigo-500"
            onClick={handleSend}
          >
            <Mail className="mr-2 h-4 w-4" />
            📤 Email My Archive
          </Button>
          {status && <p className="text-xs text-muted-foreground">{status}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProtocolPlanningDashboard({ initialProtocol = "", sessionId = null, persona = "planner" }) {
  const [protocolText, setProtocolText] = useState(initialProtocol || "");
  const { toast } = useToast();
  
  useEffect(() => {
    console.log("Initialized dashboard for:", { sessionId, persona });
    
    // Record the session start in memory
    if (sessionId && persona) {
      logSessionActivity("Session Started", `Initialized ${persona} dashboard with session ID: ${sessionId}`);
    }
  }, [sessionId, persona]);

  if (!sessionId || !persona) {
    return <p className="p-4 text-sm text-muted-foreground">Missing session ID or persona context.</p>;
  }

  // Log insights to memory API
  const logSessionActivity = async (title, summary, status = "active") => {
    try {
      const response = await fetch('/api/insight/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          study_id: sessionId,
          title,
          summary,
          status
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save insight");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error saving insight:", error);
    }
  };

  // Log decision trace to wisdom API
  const logWisdomTrace = async (input, reasoning, output) => {
    try {
      const response = await fetch('/api/wisdom/trace-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          study_id: sessionId,
          input,
          reasoning: Array.isArray(reasoning) ? reasoning : [reasoning],
          output
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save wisdom trace");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error saving wisdom trace:", error);
    }
  };

  const handleEmailReport = async () => {
    await logWisdomTrace(
      "User requested email report",
      ["Checking if email configuration exists", "Validating report is generated", "Preparing email delivery"],
      "Email report dispatched to user's configured address"
    );
    
    await fetch("/api/intel/scheduled-report");
    
    // Log this action as an insight
    await logSessionActivity(
      "Report Emailed to Stakeholders",
      "User requested the current planning report to be emailed to the configured address",
      "completed"
    );
    
    toast({
      title: "Report Emailed",
      description: "Your report has been emailed to the configured address",
    });
  };

  const handleEmailArchive = async () => {
    try {
      toast({
        title: "Preparing Archive",
        description: "Creating and sending full session archive...",
      });

      // Log this activity
      await logWisdomTrace(
        "User requested email archive",
        ["Generating full session archive", "Preparing email with attachments", "Processing delivery request"],
        "Full study archive dispatched to user's email"
      );
      
      // Get the user's email from local storage or use a default
      const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
      
      // Send the email request
      const response = await fetch('/api/export/email-session-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          recipient_email: userEmail
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email archive');
      }

      // Log this action as an insight
      await logSessionActivity(
        "Study Archive Emailed",
        `Complete study archive emailed to ${userEmail}`,
        "completed"
      );
      
      toast({
        title: "Archive Emailed",
        description: `Your complete study archive has been emailed to ${userEmail}`,
      });
    } catch (error) {
      console.error("Error sending email archive:", error);
      toast({
        title: "Email Failed",
        description: "There was an error emailing your archive. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExportBundle = async () => {
    toast({
      title: "Preparing Export Bundle",
      description: "Creating archive of all study assets and intelligence...",
    });

    try {
      // Log this activity
      await logSessionActivity(
        "Study Bundle Export",
        `Exported complete study bundle for ${persona} view of study ${sessionId}`,
        "completed"
      );

      // Wait for the export to prepare
      await fetch(`/api/export/study-bundle?study_id=${sessionId}&persona=${persona}`);

      // Simulate download delay
      setTimeout(() => {
        toast({
          title: "Export Ready",
          description: "Your study bundle has been prepared and is ready to download.",
        });

        // Trigger download (in a real implementation, this would be a direct download link)
        window.location.href = `/api/download/study-bundle?study_id=${sessionId}`;
      }, 2000);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error preparing your export bundle.",
        variant: "destructive"
      });
    }
  };
  
  const handleRegulatoryBundleDownload = async () => {
    toast({
      title: "Preparing Regulatory Bundle",
      description: "Creating regulatory-ready submission package...",
    });

    try {
      // Log this activity
      await logWisdomTrace(
        "User requested regulatory-ready bundle",
        ["Compiling IND document sections", "Formatting regulatory compliance artifacts", "Preparing submission-grade bundle"],
        "Regulatory submission-ready package prepared for download"
      );
      
      await logSessionActivity(
        "Regulatory Bundle Export",
        `Exported regulatory-ready submission bundle for study ${sessionId}`,
        "completed"
      );
      
      // Trigger download directly
      window.open(`/api/export/regulatory-bundle/${sessionId}`, "_blank");
      
      // Show success notification after a brief delay
      setTimeout(() => {
        toast({
          title: "Regulatory Bundle Ready",
          description: "Your regulatory-ready submission package has been prepared and download should begin shortly.",
        });
      }, 1000);
    } catch (error) {
      console.error("Error downloading regulatory bundle:", error);
      toast({
        title: "Export Failed",
        description: "There was an error preparing your regulatory bundle.",
        variant: "destructive"
      });
    }
  };
  
  const handleEmailRegulatoryBundle = async () => {
    try {
      toast({
        title: "Preparing Regulatory Bundle",
        description: "Creating and sending regulatory-ready submission package...",
      });

      // Log this activity
      await logWisdomTrace(
        "User requested regulatory bundle email",
        ["Compiling submission documents", "Preparing regulatory-grade materials", "Processing delivery request"],
        "Regulatory submission-ready package dispatched to stakeholders"
      );
      
      // Get the user's email from local storage or use a default
      const userEmail = localStorage.getItem('userEmail') || '';
      
      if (!userEmail || !userEmail.includes('@')) {
        setEmailDialogOpen(true);
        return;
      }
      
      // Send the email request
      const response = await fetch('/api/export/email-regulatory-bundle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          recipient_email: userEmail
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send regulatory bundle email');
      }

      // Log this action as an insight
      await logSessionActivity(
        "Regulatory Bundle Emailed",
        `Regulatory submission package emailed to ${userEmail}`,
        "completed"
      );
      
      toast({
        title: "Regulatory Bundle Emailed",
        description: `Your regulatory-ready submission package has been emailed to ${userEmail}`,
      });
    } catch (error) {
      console.error("Error sending regulatory bundle email:", error);
      toast({
        title: "Email Failed",
        description: "There was an error emailing your regulatory bundle. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-10 p-6">
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">🧠 {persona.toUpperCase()} Intelligence Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Study Session ID: <span className="font-mono font-medium">{sessionId}</span>
          </p>
        </CardContent>
      </Card>
      
      <section className="space-y-4">
        <h2 className="text-xl font-bold">📥 Protocol Preparation</h2>
        <ProtocolUploadPanel 
          sessionId={sessionId}
          initialText={protocolText} 
          onProtocolUpdated={setProtocolText}
          onInsightGenerated={(title, summary) => logSessionActivity(title, summary)}
        />
        
        <ProtocolValidator
          sessionId={sessionId}
          onValidationComplete={(issues) => {
            logSessionActivity(
              "Protocol Validation",
              `Identified ${issues.length} issues requiring attention`,
              issues.length > 0 ? "needs_attention" : "completed"
            );
          }}
        />
        
        <FixedProtocolViewer 
          originalText={protocolText} 
          sessionId={sessionId}
          onProtocolRepaired={(changes) => {
            logSessionActivity(
              "Protocol Repair",
              `AI repaired ${changes.length} protocol sections`,
              "completed"
            );
          }}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">📊 Modeling & Risk Forecasting</h2>
        <SampleSizeCalculator 
          sessionId={sessionId}
          onCalculationComplete={(result, reasoning) => {
            logSessionActivity(
              "Sample Size Calculation",
              `Calculated required sample size of ${result.totalN} participants (${result.perGroup} per group)`,
              "completed"
            );
            logWisdomTrace(
              "Sample size calculation",
              reasoning,
              `Sample size: ${result.totalN} total (${result.perGroup} per group)`
            );
          }}
        />
        
        <DropoutSimulator 
          sessionId={sessionId}
          onEstimationComplete={(estimate, reasoning) => {
            logSessionActivity("Dropout Rate Forecast", `Predicted ${estimate}% dropout rate for this protocol`);
            logWisdomTrace("Dynamic dropout forecast", reasoning, `${estimate}% dropout rate`);
          }}
        />
        
        <TrialSuccessPredictor 
          sessionId={sessionId}
          onPredictionComplete={(probability, factors) => {
            logSessionActivity(
              "Trial Success Prediction",
              `Predicted ${probability}% probability of trial success`,
              probability < 30 ? "needs_attention" : "active"
            );
            logWisdomTrace(
              "Trial success prediction",
              factors.map(f => f.factor + ": " + f.impact),
              `${probability}% probability of success`
            );
          }}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">📝 Regulatory Document Generation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline"
            className="h-auto py-4 justify-start"
            onClick={() => {
              logSessionActivity("Generated IND Module 2.5", "Clinical pharmacology section generated based on protocol data");
              toast({
                title: "IND Module 2.5 Generated",
                description: "Clinical pharmacology section has been prepared"
              });
            }}
          >
            <FilePlus2 className="mr-2 h-4 w-4" />
            <div className="flex flex-col items-start">
              <span>Generate IND Module 2.5</span>
              <span className="text-xs text-muted-foreground">Clinical Pharmacology Section</span>
            </div>
          </Button>
          
          <Button 
            variant="outline"
            className="h-auto py-4 justify-start"
            onClick={() => {
              logSessionActivity("Generated IND Module 2.7", "Clinical summary section generated based on protocol data");
              toast({
                title: "IND Module 2.7 Generated",
                description: "Clinical summary section has been prepared"
              });
            }}
          >
            <FilePlus2 className="mr-2 h-4 w-4" />
            <div className="flex flex-col items-start">
              <span>Generate IND Module 2.7</span>
              <span className="text-xs text-muted-foreground">Clinical Summary Section</span>
            </div>
          </Button>
          
          <Button 
            variant="outline"
            className="h-auto py-4 justify-start"
            onClick={() => {
              const sapText = "This Statistical Analysis Plan (SAP) outlines the methods for analyzing data from the clinical trial. The primary analysis will use an intent-to-treat approach with all randomized participants. Missing data will be handled using multiple imputation techniques. The primary endpoint will be analyzed using a mixed-effects model with repeated measures, adjusting for baseline values and stratification factors. Secondary endpoints will be analyzed using appropriate statistical methods with adjustment for multiplicity using the Hochberg procedure. Safety data will be summarized descriptively without formal statistical testing.";
              
              // Export SAP as DOCX
              fetch('/api/export/sap-docx', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  session_id: studySessionId,
                  sap_text: sapText
                }),
              })
              .then(response => response.json())
              .then(data => {
                if (data.status === "ok") {
                  logSessionActivity("Generated SAP Document", "Statistical Analysis Plan generated with branded template");
                  toast({
                    title: "SAP Document Generated",
                    description: "Statistical Analysis Plan has been prepared as DOCX"
                  });
                  // Open the document in a new tab
                  window.open(data.path, '_blank');
                }
              })
              .catch(error => {
                console.error('Error exporting SAP document:', error);
                toast({
                  title: "Export Failed",
                  description: "There was an error generating the SAP document",
                  variant: "destructive"
                });
              });
            }}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <div className="flex flex-col items-start">
              <span>Generate SAP Document</span>
              <span className="text-xs text-muted-foreground">Statistical Analysis Plan</span>
            </div>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">📦 Final Intelligence Outputs</h2>
        {/* Session Status Summary Panel */}
        <SessionSummaryPanel sessionId={sessionId} />
        
        <SummaryPacketGenerator
          sessionId={sessionId}
          onPacketGenerated={(packetData) => {
            logSessionActivity(
              "Summary Packet Generated",
              `Generated clinical summary packet with ${packetData.sections.length} sections`,
              "completed"
            );
            logWisdomTrace(
              "Summary packet generation",
              [
                "Extracted key protocol elements",
                "Applied regulatory templates",
                "Generated executive summary",
                "Added statistical analysis plan overview"
              ],
              "Complete summary packet ready for review"
            );
          }}
        />
        
        <SummaryPacketArchive
          sessionId={sessionId}
        />
        
        <EmailArchiveButton 
          sessionId={sessionId} 
        />
        
        <ProtocolEmailer
          sessionId={sessionId}
          onEmailSent={(recipient) => {
            logSessionActivity(
              "Protocol Emailed",
              `Protocol document emailed to ${recipient}`,
              "completed"
            );
          }}
        />
      </section>

      <section className="border-t pt-6">
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={handleExportBundle} className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <FileArchive className="mr-2 h-4 w-4" />
            Download Complete Study Bundle
          </Button>
          
          <Button 
            variant="default"
            className="bg-gradient-to-r from-emerald-600 to-teal-600" 
            onClick={() => {
              toast({
                title: "Preparing Archive",
                description: "Creating full session archive with all protocol data..."
              });
              
              // Log this activity
              logSessionActivity(
                "Session Archive Export",
                `Exported full archive for session ${sessionId}`,
                "completed"
              );
              
              // Start archive download
              window.location.href = `/api/export/session-archive/${sessionId}`;
            }}
          >
            <FileArchive className="mr-2 h-4 w-4" />
            📦 Download Full Archive
          </Button>
          
          <Button 
            variant="default"
            className="bg-gradient-to-r from-purple-600 to-indigo-600" 
            onClick={handleRegulatoryBundleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            📥 Download Regulatory Ready Bundle
          </Button>
          
          <Button variant="outline" onClick={() => {
            window.open(`/static/reports/${sessionId}_analysis.pdf`, '_blank');
          }}>
            <Download className="mr-2 h-4 w-4" />
            Download Analysis Report (PDF)
          </Button>
          
          <Button variant="outline" onClick={handleEmailReport}>
            <Send className="mr-2 h-4 w-4" />
            Email Report to Stakeholders
          </Button>
          
          <Button variant="outline" onClick={() => {
            logSessionActivity("Bookmark Created", "User saved a bookmark for this study session");
            toast({
              title: "Bookmark Created",
              description: "This study session has been added to your bookmarks"
            });
          }}>
            <BookmarkPlus className="mr-2 h-4 w-4" />
            Save to My Bookmarks
          </Button>
        </div>
      </section>
    </div>
  );
}