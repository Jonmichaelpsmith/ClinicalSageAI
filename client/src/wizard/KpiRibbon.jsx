/**
 * KpiRibbon Component
 * 
 * Sticky footer with key performance indicators and trend data for IND Wizard 3.0
 */

import CountUp from "react-countup";
import { ChevronUp, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

export default function KpiRibbon({ kpi }) {
  const [predictedDate, setPredictedDate] = useState(null);

  useEffect(() => {
    // Calculate a predicted submission date based on readiness
    const predicted = dayjs().add(Math.max(30, 120 - kpi.ready), 'day').toDate();
    setPredictedDate(predicted);
  }, [kpi.ready]);

  // Format the date
  const formatDate = (date) => {
    if (!date) return "—";
    return dayjs(date).format('MMM D, YYYY');
  };

  // Stat component with trend indicator
  const Stat = ({ label, val, delta }) => {
    const up = delta > 0;
    const neutral = delta === 0 || delta === undefined;
    
    return (
      <div className="flex items-center gap-1">
        <span>{label}</span> 
        <CountUp end={val} />
        {!neutral && (
          up 
            ? <ChevronUp size={12} className="text-emerald-500" /> 
            : <ChevronDown size={12} className="text-amber-500" />
        )}
      </div>
    );
  };

  return (
    <footer className="backdrop-blur bg-white/70 dark:bg-slate-900/70 border-t px-6 py-2 flex justify-around text-sm">
      <Stat label="Docs" val={kpi.docs} delta={kpi.trend?.docs} />
      <Stat label="Errors" val={kpi.errors} delta={-kpi.trend?.errors} />
      <Stat label="Ready" val={`${kpi.ready}%`} delta={kpi.trend?.ready} />
      <div>Submit by {formatDate(predictedDate)}</div>
    </footer>
  );
}