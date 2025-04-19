// IntelligenceCounter.jsx
// Counter showcasing the platform's intelligence capabilities

import React, { useState, useEffect } from 'react';
import { Database, BookText, FlaskConical, TrendingUp, BrainCircuit } from 'lucide-react';

const IntelligenceCounter = () => {
  // Use real data from your database - these are example counts
  const [counts, setCounts] = useState({
    totalCSRs: 3021,
    therapeuticAreas: 28,
    protocolsOptimized: 482,
    dataBenchmarks: 1247,
    insightModels: 16
  });

  // Animation effect for counting up 
  const [displayCounts, setDisplayCounts] = useState({
    totalCSRs: 0,
    therapeuticAreas: 0,
    protocolsOptimized: 0,
    dataBenchmarks: 0,
    insightModels: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      let allDone = true;
      const newCounts = { ...displayCounts };
      
      Object.keys(counts).forEach(key => {
        if (newCounts[key] < counts[key]) {
          // Calculate increment based on total value
          const increment = Math.max(1, Math.floor(counts[key] / 20));
          newCounts[key] = Math.min(counts[key], newCounts[key] + increment);
          allDone = false;
        }
      });
      
      setDisplayCounts(newCounts);
      if (allDone) clearInterval(interval);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 py-4 shadow-sm rounded-lg">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-center text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-3">
          CSR Deep Learning Intelligence Library
        </h3>
        
        <div className="grid grid-cols-5 gap-4 px-4">
          <div className="flex flex-col items-center">
            <Database className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mb-1" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{displayCounts.totalCSRs.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Clinical Study Reports</div>
          </div>
          
          <div className="flex flex-col items-center">
            <BookText className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-1" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{displayCounts.therapeuticAreas}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Therapeutic Areas</div>
          </div>
          
          <div className="flex flex-col items-center">
            <FlaskConical className="h-5 w-5 text-purple-600 dark:text-purple-400 mb-1" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{displayCounts.protocolsOptimized.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Protocols Optimized</div>
          </div>
          
          <div className="flex flex-col items-center">
            <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400 mb-1" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{displayCounts.dataBenchmarks.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Data Benchmarks</div>
          </div>
          
          <div className="flex flex-col items-center">
            <BrainCircuit className="h-5 w-5 text-red-600 dark:text-red-400 mb-1" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{displayCounts.insightModels}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">AI Insight Models</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceCounter;