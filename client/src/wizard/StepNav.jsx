/**
 * StepNav Component
 * 
 * Enhanced navigation for IND Wizard 3.3 with status indicators
 * and predictive completion data
 */

import clsx from "clsx";
import { Check, AlertCircle, Calendar, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparklines, SparklinesLine } from "react-sparklines";
import dayjs from "dayjs";

const titles = [
  "Initial Planning", 
  "Nonclinical Data", 
  "CMC Data", 
  "Clinical Protocol", 
  "Investigator Brochure", 
  "FDA Forms", 
  "Final Assembly"
];

export default function StepNav({ step, onSelect, predictiveData }) {
  const { t } = useTranslation();
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
    <nav className="w-80 dark:bg-slate-800 bg-slate-50 border-r overflow-y-auto p-4 space-y-3">
      {titles.map((title, i) => {
        const flag = flags[i];
        return (
          <div key={i} className="space-y-1">
            <button 
              onClick={() => onSelect(i)} 
              className={clsx(
                "flex items-center justify-between w-full text-left px-3 py-2 rounded-lg", 
                i === step 
                  ? "bg-regulatory-100 dark:bg-regulatory-900/40 font-semibold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
            > 
              <span>{`${t('stepNav.step')} ${i+1}: ${t(`stepNav.titles.${i}`, title)}`}</span> 
              {flag ? 
                <AlertCircle size={16} className="text-amber-500" /> : 
                <Check size={16} className="text-emerald-500" />
              }
            </button>
            
            {/* Predictive insights panel for current step */}
            {i === step && predictiveData && (
              <div className="ml-6 mt-2 p-2 bg-white dark:bg-slate-700 rounded-md text-sm space-y-2 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">{t('stepNav.completion')}:</span>
                  <span className="font-medium">{predictiveData.completion}%</span>
                </div>
                
                {/* Confidence level bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{t('stepNav.confidence')}:</span>
                    <span className="font-medium">{predictiveData.confidence}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-regulatory-500 rounded-full"
                      style={{ width: `${predictiveData.confidence}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Estimated completion date */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <Calendar size={12} />
                  <span>{t('stepNav.estimatedCompletion')}:</span>
                  <span className="font-medium">{dayjs(predictiveData.estimatedDate).format('MMM D, YYYY')}</span>
                </div>
                
                {/* Timeline sparkline if available */}
                {predictiveData.timelineData && (
                  <div className="pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mb-1">
                      <TrendingUp size={12} />
                      <span>{t('stepNav.trend')}</span>
                    </div>
                    <Sparklines 
                      data={predictiveData.timelineData.map(d => d.actual)} 
                      height={20} 
                      margin={2}
                    >
                      <SparklinesLine color="#7549ff" />
                    </Sparklines>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Help section at bottom */}
      <div className="mt-4 border-t pt-3 text-slate-500 dark:text-slate-400">
        <h3 className="text-xs uppercase font-medium mb-2">{t('stepNav.help')}</h3>
        <ul className="text-sm space-y-1.5">
          <li className="flex items-center gap-1.5">
            <Check size={14} className="text-emerald-500" />
            <span>{t('stepNav.validStep')}</span>
          </li>
          <li className="flex items-center gap-1.5">
            <AlertCircle size={14} className="text-amber-500" />
            <span>{t('stepNav.issuesDetected')}</span>
          </li>
        </ul>
      </div>
    </nav>
  );
}