/**
 * WizardHeader Component
 * 
 * Header bar for the IND Wizard 3.1 with KPI chips display, trend indicators 
 * and module-level readiness dropdown
 */

import { Gauge, ShieldCheck, UploadCloud, ChevronUp, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useState, useEffect } from "react";

export default function WizardHeader({ kpi }) {
  const [open, setOpen] = useState(false);
  const [modules, setModules] = useState([]);
  
  // Fetch module-level readiness data
  useEffect(() => {
    fetch("/api/ind/kpi?modules=true")
      .then(r => r.json())
      .then(data => setModules(data.modules || []))
      .catch(err => {
        console.error("Error fetching module readiness:", err);
      });
  }, []);
  
  return (
    <header className="relative flex items-center justify-between backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b px-6 py-3">
      <h1 className="text-xl font-bold text-regulatory-700 dark:text-regulatory-300">IND Preparation Wizard 3.1</h1>
      <div className="flex gap-3 items-center">
        <Chip 
          icon={Gauge} 
          label={`${kpi.ready}% Ready`} 
          delta={kpi.trend?.ready} 
          color="emerald" 
          onClick={() => setOpen(!open)} 
        />
        <Chip 
          icon={ShieldCheck} 
          label={`${kpi.errors} Errors`} 
          delta={-kpi.trend?.errors} 
          color="amber" 
        />
        <Chip 
          icon={UploadCloud} 
          label={`${kpi.docs} Docs`} 
          delta={kpi.trend?.docs} 
          color="sky" 
        />
      </div>
      
      {/* Module-level readiness dropdown */}
      {open && (
        <div className="absolute right-6 top-14 w-64 bg-white dark:bg-slate-800 border rounded-xl shadow-lg p-4 z-10">
          <h4 className="font-semibold mb-2 text-sm text-regulatory-700 dark:text-regulatory-300">Module Readiness</h4>
          <ul className="space-y-2">
            {modules.length > 0 ? (
              modules.map(module => (
                <li key={module.name} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{module.name}</span>
                  <span className={clsx(
                    "font-medium", 
                    module.ready >= 80 ? "text-emerald-600 dark:text-emerald-400" : 
                    module.ready >= 50 ? "text-amber-600 dark:text-amber-400" : 
                    "text-red-600 dark:text-red-400"
                  )}>
                    {module.ready}%
                  </span>
                </li>
              ))
            ) : (
              <li className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                Loading module data...
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}

function Chip({ icon: Icon, label, delta, color, onClick }) {
  const up = delta > 0;
  const neutral = delta === 0 || delta === undefined;
  
  const colorClasses = {
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200",
    sky: "bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-200",
    regulatory: "bg-regulatory-100 dark:bg-regulatory-900/30 text-regulatory-800 dark:text-regulatory-200"
  };
  
  return (
    <span 
      className={clsx(
        "flex items-center gap-1 px-3 py-1 rounded-full text-sm", 
        colorClasses[color],
        onClick ? "cursor-pointer hover:opacity-90" : ""
      )}
      onClick={onClick}
    >
      <Icon size={14} /> {label}
      {!neutral && (
        up 
          ? <ChevronUp size={12} className="text-emerald-600" /> 
          : <ChevronDown size={12} className="text-amber-500" />
      )}
    </span>
  );
}