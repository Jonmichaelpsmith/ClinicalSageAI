// /client/src/pages/PlanningPage.jsx
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import ProtocolPlanningDashboard from "@/components/ProtocolPlanningDashboard";
import { Loader2 } from "lucide-react";

export default function PlanningPage() {
  const [location] = useLocation();
  const [template, setTemplate] = useState("");
  const [loading, setLoading] = useState(true);

  // Parse URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const persona = urlParams.get("persona") || "planner";
  const studyId = urlParams.get("study_id") || `${persona}_launch_trial`;

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const res = await fetch(`/static/templates/${persona}_template.txt`);
        if (!res.ok) throw new Error(`Failed to fetch template: ${res.status}`);
        const text = await res.text();
        setTemplate(text);
      } catch (err) {
        console.error("Failed to load template:", err);
        setTemplate("No template found for this persona. Please select a different role.");
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [persona, studyId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading template for {persona} role...</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <ProtocolPlanningDashboard
        initialProtocol={template}
        sessionId={studyId}
        persona={persona}
      />
    </div>
  );
}