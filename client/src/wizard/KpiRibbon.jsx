/**
 * KpiRibbon Component
 * 
 * Sticky footer with key performance indicators for IND Wizard 2.0
 */

import CountUp from "react-countup";
import { FileText, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

export default function KpiRibbon({ kpi }) {
  const [predictedDate, setPredictedDate] = useState(null);

  useEffect(() => {
    // Calculate a predicted submission date based on readiness
    const today = new Date();
    const daysToAdd = Math.max(30, 120 - kpi.ready); // Between 30-120 days
    const predicted = new Date(today);
    predicted.setDate(today.getDate() + daysToAdd);
    setPredictedDate(predicted);
  }, [kpi.ready]);

  // Format the date
  const formatDate = (date) => {
    if (!date) return "—";
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <footer className="backdrop-blur bg-white/60 dark:bg-slate-800/60 border-t px-6 py-3 grid grid-cols-4 text-sm">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
          <FileText size={16} className="text-blue-600 dark:text-blue-300" />
        </div>
        <div>
          <div className="font-medium">Documents</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-300">
            <CountUp end={kpi.docs} duration={1.5} />
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-3">
          <AlertTriangle size={16} className="text-amber-600 dark:text-amber-300" />
        </div>
        <div>
          <div className="font-medium">QC Errors</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-300">
            <CountUp end={kpi.errors} duration={1.5} />
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-3">
          <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-300" />
        </div>
        <div>
          <div className="font-medium">Readiness</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-300">
            <CountUp 
              end={kpi.ready} 
              duration={1.5} 
              suffix="%"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
          <Calendar size={16} className="text-purple-600 dark:text-purple-300" />
        </div>
        <div>
          <div className="font-medium">Projected Submission</div>
          <div className="text-md font-bold text-purple-600 dark:text-purple-300">
            {formatDate(predictedDate)}
          </div>
        </div>
      </div>
    </footer>
  );
}