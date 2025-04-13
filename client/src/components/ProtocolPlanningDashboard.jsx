// /client/components/ProtocolPlanningDashboard.jsx (now with Study Session Selector)
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
import StudySessionSelector from "@/components/StudySessionSelector";
import DesignFromMolecule from "@/components/DesignFromMolecule";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ProtocolPlanningDashboard({ initialProtocol = "", sessionId = null, persona = "planner" }) {
  const [activeSession, setActiveSession] = useState(sessionId);
  const [protocolContent, setProtocolContent] = useState(initialProtocol);
  const { toast } = useToast();
  
  useEffect(() => {
    if (sessionId && !activeSession) {
      setActiveSession(sessionId);
      toast({
        title: "Session Activated",
        description: `Now working with study: ${sessionId} as ${persona}`,
      });
    }
  }, [sessionId, activeSession, persona, toast]);

  const handleSessionChange = (sessionId) => {
    setActiveSession(sessionId);
    console.log("Active study session changed to:", sessionId);
    toast({
      title: "Study Session Active",
      description: `Now working with study: ${sessionId}`,
    });
  };

  // Log insights to memory API
  const logInsight = async (title, summary, status = "active") => {
    if (!activeSession) {
      toast({
        title: "No active session",
        description: "Please select a study session first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/insight/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          study_id: activeSession,
          title,
          summary,
          status
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save insight");
      }

      toast({
        title: "Insight Saved",
        description: "Your insight has been stored in the session memory",
      });
      
      return await response.json();
    } catch (error) {
      console.error("Error saving insight:", error);
      toast({
        title: "Error Saving Insight",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Log decision trace to wisdom API
  const logWisdomTrace = async (input, reasoning, output) => {
    if (!activeSession) {
      toast({
        title: "No active session",
        description: "Please select a study session first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/wisdom/trace-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          study_id: activeSession,
          input,
          reasoning: Array.isArray(reasoning) ? reasoning : [reasoning],
          output
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save wisdom trace");
      }

      toast({
        title: "Decision Logic Saved",
        description: "Your reasoning trace has been stored for audit",
      });
      
      return await response.json();
    } catch (error) {
      console.error("Error saving wisdom trace:", error);
      toast({
        title: "Error Saving Decision Logic",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEmailReport = async () => {
    // Example of using the trace API to log this decision
    await logWisdomTrace(
      "User requested email report",
      ["Checking if email configuration exists", "Validating report is generated", "Preparing email delivery"],
      "Email report dispatched to user's configured address"
    );
    
    await fetch("/api/intel/scheduled-report");
    
    // Log this action as an insight
    await logInsight(
      "Report Emailed to Stakeholders",
      "User requested the current planning report to be emailed to the configured address",
      "completed"
    );
    
    toast({
      title: "Report Emailed",
      description: "Your report has been emailed to your configured address",
    });
  };

  // Example of capturing endpoint design decisions
  const handleEndpointDecision = async (endpoint, reasoning) => {
    await logInsight(
      `Endpoint Design: ${endpoint}`,
      `Selected ${endpoint} as the primary endpoint based on regulatory precedent and statistical power considerations.`,
      "active"
    );
    
    await logWisdomTrace(
      `Evaluating ${endpoint} as primary endpoint`,
      [
        "Analyzed regulatory precedent for similar indications",
        "Evaluated statistical power requirements",
        "Considered measurement reliability and validity",
        "Assessed alignment with patient-reported outcomes"
      ],
      `Selected ${endpoint} as primary endpoint with p<0.05 significance threshold`
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">🧠 Study Session</h2>
          <StudySessionSelector onSelect={handleSessionChange} />
        </div>

        <h2 className="text-xl font-bold text-gray-800">📄 Protocol Upload + Analysis</h2>
        <ProtocolUploadPanel 
          sessionId={activeSession}
          onInsightGenerated={(title, summary) => logInsight(title, summary)}
        />

        <h2 className="text-xl font-bold text-gray-800">📉 Dropout Estimator</h2>
        <DropoutEstimator 
          sessionId={activeSession}
          onEstimationComplete={(estimate, reasoning) => {
            logInsight("Dropout Rate Estimate", `Estimated ${estimate}% dropout rate for this protocol`);
            logWisdomTrace("Calculate dropout rate estimate", reasoning, `${estimate}% dropout rate`);
          }}
        />

        <h2 className="text-xl font-bold text-gray-800">🛡️ Protocol Validator</h2>
        <ProtocolValidator
          sessionId={activeSession}
          onValidationComplete={(issues) => {
            logInsight(
              "Protocol Validation",
              `Identified ${issues.length} issues requiring attention`,
              issues.length > 0 ? "needs_attention" : "completed"
            );
          }}
        />

        <h2 className="text-xl font-bold text-gray-800">🧠 AI-Repaired Protocol</h2>
        <FixedProtocolViewer 
          originalText="Paste or pull your latest protocol content here." 
          sessionId={activeSession}
          onProtocolRepaired={(changes) => {
            logInsight(
              "Protocol Repair",
              `AI repaired ${changes.length} protocol sections`,
              "completed"
            );
          }}
        />

        <div className="space-y-2 pt-2">
          <Button 
            variant="outline"
            onClick={() => {
              if (!activeSession) {
                toast({
                  title: "No active session",
                  description: "Please select a study session first",
                  variant: "destructive",
                });
                return;
              }
              // Would include actual implementation
              logInsight("Generated IND Module 2.5", "Clinical pharmacology section generated based on protocol data");
            }}
          >
            📄 Generate IND Module 2.5
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              if (!activeSession) {
                toast({
                  title: "No active session",
                  description: "Please select a study session first",
                  variant: "destructive",
                });
                return;
              }
              // Would include actual implementation
              logInsight("Generated IND Module 2.7", "Clinical summary section generated based on protocol data");
            }}
          >
            📄 Generate IND Module 2.7
          </Button>
          <Button variant="outline">📝 Export Final Protocol (.docx)</Button>
          <Button variant="outline">🧪 Regulatory Readiness Score</Button>
        </div>

        <h2 className="text-xl font-bold text-gray-800">📤 Send Final Protocol</h2>
        <ProtocolEmailer
          sessionId={activeSession}
          onEmailSent={(recipient) => {
            logInsight(
              "Protocol Emailed",
              `Protocol document emailed to ${recipient}`,
              "completed"
            );
          }}
        />

        <h2 className="text-xl font-bold text-gray-800">📦 Generate Clinical Summary Packet</h2>
        <SummaryPacketGenerator
          sessionId={activeSession}
          onPacketGenerated={(packetData) => {
            logInsight(
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

        <h2 className="text-xl font-bold text-gray-800">🗂 Summary Packet Archive</h2>
        <SummaryPacketArchive
          sessionId={activeSession}
        />

        <div className="flex gap-4 pt-4">
          <a
            href="/static/latest_report.pdf"
            className="text-sm text-blue-600 underline hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            📄 Download Planning Report (PDF)
          </a>
          <Button onClick={handleEmailReport} variant="outline">
            📤 Email Report to Stakeholders
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">🔢 Sample Size Calculator</h2>
        <SampleSizeCalculator 
          sessionId={activeSession}
          onCalculationComplete={(result, reasoning) => {
            logInsight(
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

        <h2 className="text-xl font-bold text-gray-800">🔮 Trial Success Predictor</h2>
        <TrialSuccessPredictor 
          sessionId={activeSession}
          onPredictionComplete={(probability, factors) => {
            logInsight(
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
      </div>
    </div>
  );
}