/**
 * StepNav Component
 * 
 * Enhanced navigation for IND Wizard 2.0 with status indicators
 */

import clsx from "clsx";
import { Check, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

const titles = [
  "Initial Planning", 
  "Nonclinical Data", 
  "CMC Data", 
  "Clinical Protocol", 
  "Investigator Brochure", 
  "FDA Forms", 
  "Final Assembly"
];

export default function StepNav({ step, onSelect }) {
  const [flags, setFlags] = useState([]);
  
  useEffect(() => {
    // Fetch step validation flags
    fetch("/api/ind/flags")
      .then(r => r.json())
      .then(setFlags)
      .catch(err => {
        console.error("Error fetching step flags:", err);
        // Fallback data for demonstration
        setFlags([false, true, false, true, false, false, true]);
      });
  }, []);
  
  return (
    <nav className="w-72 dark:bg-slate-800 bg-slate-50 border-r overflow-y-auto p-4 space-y-2">
      {titles.map((title, i) => {
        const flag = flags[i];
        return (
          <button 
            key={i} 
            onClick={() => onSelect(i)} 
            className={clsx(
              "flex items-center justify-between w-full text-left px-3 py-2 rounded-lg", 
              i === step 
                ? "bg-regulatory-100 dark:bg-regulatory-900/40 font-semibold"
                : "hover:bg-slate-100 dark:hover:bg-slate-700"
            )}
          > 
            <span>{`Step ${i+1}: ${title}`}</span> 
            {flag ? 
              <AlertCircle size={16} className="text-amber-500" /> : 
              <Check size={16} className="text-emerald-500" />
            }
          </button>
        );
      })}
    </nav>
  );
}