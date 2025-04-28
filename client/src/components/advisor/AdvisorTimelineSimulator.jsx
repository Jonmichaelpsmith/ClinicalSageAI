// /client/src/components/advisor/AdvisorTimelineSimulator.jsx

import React, { useState } from 'react';
import { Calendar, ChevronRight, RefreshCcw } from 'lucide-react';

export default function AdvisorTimelineSimulator() {
  const [selectedSection, setSelectedSection] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  
  // Demo data - would come from API in real implementation
  const missingSections = [
    "CMC Stability Study", 
    "Clinical Study Reports (CSR)", 
    "Toxicology Reports", 
    "Drug Substance Specs", 
    "Pharmacology Reports", 
    "Investigator Brochure Updates"
  ];
  
  const originalMetrics = {
    readinessScore: 65,
    delayDays: 45,
    financialImpact: 2250000,
    submissionDate: "July 15, 2025"
  };
  
  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };
  
  const handleDateChange = (e) => {
    setCompletionDate(e.target.value);
  };
  
  const runSimulation = () => {
    if (!selectedSection || !completionDate) return;
    
    setIsSimulating(true);
    
    // In a real implementation, this would be an API call
    setTimeout(() => {
      const today = new Date();
      const targetDate = new Date(completionDate);
      const daysUntilCompletion = Math.round((targetDate - today) / (86400000)); // ms in a day
      
      // Section impact data - would come from API
      const sectionImpacts = {
        "CMC Stability Study": { readiness: 15, delay: 30, financial: 1500000 },
        "Clinical Study Reports (CSR)": { readiness: 20, delay: 45, financial: 2250000 },
        "Toxicology Reports": { readiness: 10, delay: 14, financial: 700000 },
        "Drug Substance Specs": { readiness: 8, delay: 21, financial: 1050000 },
        "Pharmacology Reports": { readiness: 5, delay: 7, financial: 350000 },
        "Investigator Brochure Updates": { readiness: 3, delay: 5, financial: 250000 }
      };
      
      const impact = sectionImpacts[selectedSection];
      
      // Calculate improvements based on completion time
      // Longer completion times reduce the benefit
      const timeFactorAdjustment = Math.max(0.5, 1 - (daysUntilCompletion / 60));
      
      const newReadiness = originalMetrics.readinessScore + (impact.readiness * timeFactorAdjustment);
      const newDelay = Math.max(0, originalMetrics.delayDays - (impact.delay * timeFactorAdjustment));
      const newFinancial = Math.max(0, originalMetrics.financialImpact - (impact.financial * timeFactorAdjustment));
      
      // Calculate new submission date
      const submissionDate = new Date();
      submissionDate.setDate(submissionDate.getDate() + newDelay);
      const formattedDate = submissionDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      setSimulationResults({
        original: originalMetrics,
        new: {
          readinessScore: Math.round(newReadiness),
          delayDays: Math.round(newDelay),
          financialImpact: Math.round(newFinancial),
          submissionDate: formattedDate
        },
        improvement: {
          readinessScore: Math.round(newReadiness - originalMetrics.readinessScore),
          delayDays: Math.round(originalMetrics.delayDays - newDelay),
          financialImpact: Math.round(originalMetrics.financialImpact - newFinancial)
        },
        section: selectedSection,
        completionDate: completionDate
      });
      
      setIsSimulating(false);
    }, 1000);
  };
  
  const resetSimulation = () => {
    setSimulationResults(null);
    setSelectedSection('');
    setCompletionDate('');
  };
  
  // Get today's date in YYYY-MM-DD format for min date value
  const today = new Date().toISOString().split('T')[0];
  
  // Get default date (14 days from now) for completion date field
  const getDefaultDate = () => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 14);
    return defaultDate.toISOString().split('T')[0];
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Timeline Simulator</h2>
      <p className="text-gray-600 mb-6">
        Simulate how document completion timelines impact your regulatory readiness, submission date, and financial metrics.
      </p>
      
      {/* Simulation Controls */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Document to Complete:</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={selectedSection}
              onChange={handleSectionChange}
              disabled={isSimulating}
            >
              <option value="">-- Select Document --</option>
              {missingSections.map((section) => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Completion Date:</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                min={today}
                value={completionDate || getDefaultDate()}
                onChange={handleDateChange}
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={isSimulating}
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={runSimulation}
              disabled={!selectedSection || !completionDate || isSimulating}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white ${
                !selectedSection || !completionDate || isSimulating
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSimulating ? (
                <>Simulating <RefreshCcw className="ml-2 h-4 w-4 animate-spin" /></>
              ) : (
                <>Run Simulation <ChevronRight className="ml-1 h-4 w-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Simulation Results */}
      {simulationResults ? (
        <div className="bg-white border border-indigo-100 rounded-lg p-6">
          <div className="flex justify-between mb-6">
            <h3 className="text-lg font-semibold text-indigo-900">Simulation Results</h3>
            <button 
              onClick={resetSimulation}
              className="flex items-center text-sm text-gray-600 hover:text-indigo-600"
              disabled={isSimulating}
            >
              <RefreshCcw className="mr-1 h-4 w-4" /> Reset
            </button>
          </div>
          
          <p className="text-sm text-indigo-700 mb-4">
            Completing <strong>{simulationResults.section}</strong> by {new Date(simulationResults.completionDate).toLocaleDateString()} would result in:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Current Status</h4>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Readiness Score</p>
                  <p className="text-2xl font-bold text-gray-900">{simulationResults.original.readinessScore}%</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Estimated Delay</p>
                  <p className="text-2xl font-bold text-gray-900">{simulationResults.original.delayDays} days</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Financial Impact</p>
                  <p className="text-2xl font-bold text-gray-900">${(simulationResults.original.financialImpact).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">After Completion</h4>
              
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-indigo-500">Readiness Score</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-indigo-900">{simulationResults.new.readinessScore}%</p>
                    <span className="ml-2 text-sm font-medium text-green-600">
                      +{simulationResults.improvement.readinessScore}%
                    </span>
                  </div>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-indigo-500">Estimated Delay</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-indigo-900">{simulationResults.new.delayDays} days</p>
                    <span className="ml-2 text-sm font-medium text-green-600">
                      -{simulationResults.improvement.delayDays} days
                    </span>
                  </div>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-indigo-500">Financial Impact</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-indigo-900">${(simulationResults.new.financialImpact).toLocaleString()}</p>
                    <span className="ml-2 text-sm font-medium text-green-600">
                      -${(simulationResults.improvement.financialImpact).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg">
            <h3 className="text-sm font-semibold text-green-800 mb-1">New Estimated Submission Date: <span className="font-bold">{simulationResults.new.submissionDate}</span></h3>
            <p className="text-sm text-green-700">
              This simulation projects that completing {simulationResults.section} by the target date could save your team 
              approximately ${(simulationResults.improvement.financialImpact).toLocaleString()} and accelerate your submission 
              by {simulationResults.improvement.delayDays} days.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Run Your First Simulation</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Select a document and estimated completion date to see how it impacts your regulatory 
            timeline, readiness score, and financial projections.
          </p>
          <p className="text-sm text-gray-500">
            The simulator will predict timeline acceleration, readiness improvements, and potential financial savings.
          </p>
        </div>
      )}
      
      {/* Helpful Tips */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-700 mb-1">High Impact Documents</h3>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• CMC Stability Studies (30+ day impact)</li>
            <li>• Clinical Study Reports (45+ day impact)</li>
            <li>• Toxicology Reports (14+ day impact)</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-700 mb-1">Optimization Tips</h3>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• Prioritize highest-impact documents first</li>
            <li>• Consider interim reports for fastest timeline impact</li>
            <li>• Complete CMC sections before clinical documents</li>
          </ul>
        </div>
      </div>
    </div>
  );
}