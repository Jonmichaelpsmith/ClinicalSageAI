/**
 * WizardHeader Component
 * 
 * Header bar for the IND Wizard 3.0 with KPI chips display and trend indicators
 */

import { Gauge, ShieldCheck, UploadCloud, ChevronUp, ChevronDown } from "lucide-react";
import clsx from "clsx";

export default function WizardHeader({ kpi }) {
  return (
    <header className="flex items-center justify-between backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b px-6 py-3">
      <h1 className="text-xl font-bold text-regulatory-700 dark:text-regulatory-300">IND Preparation Wizard 3.0</h1>
      <div className="flex gap-3 items-center">
        <Chip icon={Gauge} label={`${kpi.ready}% Ready`} delta={kpi.trend?.ready} color="emerald" />
        <Chip icon={ShieldCheck} label={`${kpi.errors} Errors`} delta={-kpi.trend?.errors} color="amber" />
        <Chip icon={UploadCloud} label={`${kpi.docs} Docs`} delta={kpi.trend?.docs} color="sky" />
      </div>
    </header>
  );
}

function Chip({ icon: Icon, label, delta, color }) {
  const up = delta > 0;
  const neutral = delta === 0 || delta === undefined;
  
  return (
    <span className={clsx(`flex items-center gap-1 px-3 py-1 rounded-full bg-${color}-100 dark:bg-${color}-900/30 text-${color}-800 dark:text-${color}-200 text-sm`)}>
      <Icon size={14} /> {label}
      {!neutral && (
        up 
          ? <ChevronUp size={12} className="text-emerald-600" /> 
          : <ChevronDown size={12} className="text-amber-500" />
      )}
    </span>
  );
}