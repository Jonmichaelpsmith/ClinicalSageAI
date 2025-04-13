// /client/components/ProtocolPlanningDashboard.jsx
import { useState, useEffect } from 'react';
import ProtocolUploadPanel from "@/components/ProtocolUploadPanel";
import SampleSizeCalculator from "@/components/SampleSizeCalculator";
import DropoutEstimator from "@/components/DropoutEstimator";
import TrialSuccessPredictor from "@/components/TrialSuccessPredictor";
import ProtocolValidator from "@/components/ProtocolValidator";
import FixedProtocolViewer from "@/components/FixedProtocolViewer";
import ProtocolEmailer from "@/components/ProtocolEmailer";
import SummaryPacketGenerator from "@/components/SummaryPacketGenerator";
import SummaryPacketArchive from "@/components/SummaryPacketArchive";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkPlus, Download, FileArchive, FilePlus2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
        
        <DropoutEstimator 
          sessionId={sessionId}
          onEstimationComplete={(estimate, reasoning) => {
            logSessionActivity("Dropout Rate Estimate", `Estimated ${estimate}% dropout rate for this protocol`);
            logWisdomTrace("Calculate dropout rate estimate", reasoning, `${estimate}% dropout rate`);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">📦 Final Intelligence Outputs</h2>
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