/**
 * WizardHeader Component
 * 
 * Header bar for the IND Wizard 2.0 with KPI chips display
 */

import { Gauge, ShieldCheck, UploadCloud } from "lucide-react";

export default function WizardHeader({ kpi }) {
  return (
    <header className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 backdrop-blur border-b px-6 py-3">
      <h1 className="text-xl font-semibold">IND Preparation Wizard</h1>
      <div className="flex gap-4 items-center">
        <Chip icon={Gauge} label={`${kpi.ready}% Ready`} color="emerald" />
        <Chip 
          icon={ShieldCheck} 
          label={`${kpi.errors} QC Errors`} 
          color={kpi.errors ? "amber" : "emerald"} 
        />
        <Chip icon={UploadCloud} label={`${kpi.docs} Docs`} color="sky" />
      </div>
    </header>
  );
}

function Chip({ icon: Icon, label, color }) {
  return (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-${color}-800 bg-${color}-100 dark:bg-${color}-900/30 dark:text-${color}-200 text-sm`}>
      <Icon size={14} /> {label}
    </span>
  );
}