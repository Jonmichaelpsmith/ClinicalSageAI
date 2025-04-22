/**
 * IndWizardLayout Component
 * 
 * Main layout for the IND Wizard 3.0 - Executive Insights Edition
 */

import { useState, useEffect } from "react";
import WizardHeader from "../wizard/WizardHeader.jsx";
import StepNav from "../wizard/StepNav.jsx";
import StepContent from "../wizard/StepContent.jsx";
import DocDrawer from "../wizard/DocDrawer.jsx";
import KpiRibbon from "../wizard/KpiRibbon.jsx";
import { AnimatePresence } from "framer-motion";

export default function IndWizardLayout() {
  const [step, setStep] = useState(0);
  const [kpi, setKpi] = useState({ 
    ready: 0, 
    errors: 0, 
    docs: 0,
    trend: {
      ready: 0,
      errors: 0,
      docs: 0
    }
  });
  const [drawer, setDrawer] = useState(false);
  
  useEffect(() => {
    // Fetch KPI data with trend information
    fetch("/api/ind/kpi")
      .then(r => r.json())
      .then(setKpi)
      .catch(err => {
        console.error("Error fetching KPI data:", err);
        // Fallback data with trend information
        setKpi({ 
          ready: 67, 
          errors: 3, 
          docs: 12,
          trend: {
            ready: 5,
            errors: -1,
            docs: 3
          }
        });
      });
  }, [step]);
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-regulatory-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      <WizardHeader kpi={kpi} />
      
      <div className="flex flex-1 overflow-hidden">
        <StepNav step={step} onSelect={setStep} />
        <div className="flex-1 relative p-6 overflow-y-auto">
          <StepContent step={step} onOpenDrawer={() => setDrawer(true)} />
        </div>
        <AnimatePresence>
          {drawer && <DocDrawer onClose={() => setDrawer(false)} />}
        </AnimatePresence>
      </div>
      
      <KpiRibbon kpi={kpi} />
    </div>
  );
}