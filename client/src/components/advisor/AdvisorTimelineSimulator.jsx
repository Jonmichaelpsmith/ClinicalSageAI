// /client/src/components/advisor/AdvisorTimelineSimulator.jsx

import React, { useState } from 'react';
import { Calendar, Calculator, CheckCircle, Clock, DollarSign, HeartPulse, TimerOff, XCircle } from 'lucide-react';

export default function AdvisorTimelineSimulator() {
  const [targetDate, setTargetDate] = useState('2025-06-15');
  const [selectedDocuments, setSelectedDocuments] = useState([
    'Clinical Study Report',
    'CMC Documentation',
    'Safety Database'
  ]);
  const [readinessScore, setReadinessScore] = useState(65);
  const [simulationResults, setSimulationResults] = useState({
    daysToSubmission: 78,
    risksIdentified: 3,
    financialImpact: '$1.95M',
    approvalProbability: '75%'
  });

  // All available documents to complete
  const availableDocuments = [
    { id: 'csr', name: 'Clinical Study Report', impact: 'High', daysSaved: 14 },
    { id: 'cmc', name: 'CMC Documentation', impact: 'Critical', daysSaved: 21 },
    { id: 'safety', name: 'Safety Database', impact: 'Medium', daysSaved: 8 },
    { id: 'tox', name: 'Toxicology Reports', impact: 'Medium', daysSaved: 7 },
    { id: 'stats', name: 'Statistical Analysis', impact: 'Low', daysSaved: 4 },
    { id: 'irs', name: 'IRB Submissions', impact: 'Low', daysSaved: 3 },
    { id: 'labels', name: 'Product Labeling', impact: 'Medium', daysSaved: 6 },
    { id: 'sae', name: 'SAE Documentation', impact: 'High', daysSaved: 12 }
  ];

  // Toggle document selection
  const toggleDocument = (docId) => {
    const doc = availableDocuments.find(d => d.id === docId);
    
    if (selectedDocuments.includes(doc.name)) {
      setSelectedDocuments(selectedDocuments.filter(d => d !== doc.name));
    } else {
      setSelectedDocuments([...selectedDocuments, doc.name]);
    }
  };

  // Run simulation
  const runSimulation = () => {
    // Sum up the days saved based on selected documents
    const totalDaysSaved = availableDocuments
      .filter(doc => selectedDocuments.includes(doc.name))
      .reduce((total, doc) => total + doc.daysSaved, 0);
    
    // Calculate new days to submission
    const baseDays = 120;
    const newDaysToSubmission = Math.max(0, baseDays - totalDaysSaved);
    
    // Calculate financial impact based on $25k per day saved
    const financialImpact = (totalDaysSaved * 25000).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });
    
    // Risk factors based on document selection
    const criticalSelected = selectedDocuments.includes('CMC Documentation');
    const highImpactSelected = selectedDocuments.includes('Clinical Study Report') && 
                              selectedDocuments.includes('SAE Documentation');
    
    // Calculate risks based on selected documents
    let risksIdentified = 5; // Start with maximum risks
    if (criticalSelected) risksIdentified -= 2;
    if (highImpactSelected) risksIdentified -= 1;
    if (selectedDocuments.length > 5) risksIdentified -= 1;
    
    // Calculate approval probability
    const baseProb = 60;
    const docBonus = selectedDocuments.length * 3;
    const criticalBonus = criticalSelected ? 10 : 0;
    const highBonus = highImpactSelected ? 5 : 0;
    const approvalProbability = Math.min(95, baseProb + docBonus + criticalBonus + highBonus) + '%';
    
    // Update simulation results
    setSimulationResults({
      daysToSubmission: newDaysToSubmission,
      risksIdentified,
      financialImpact,
      approvalProbability
    });
    
    // Update readiness score
    const newReadiness = Math.min(100, 40 + (selectedDocuments.length * 8));
    setReadinessScore(newReadiness);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Timeline Simulation Tool</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Settings */}
        <div className="space-y-6">
          {/* Target Date Selector */}
          <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200">
            <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              Target Submission Date
            </h3>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {/* Document Selection */}
          <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200">
            <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
              <CheckCircle size={18} className="text-indigo-600" />
              Document Completion Plan
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select which documents you plan to complete by {new Date(targetDate).toLocaleDateString()}:
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto p-2">
              {availableDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={doc.id}
                      checked={selectedDocuments.includes(doc.name)}
                      onChange={() => toggleDocument(doc.id)}
                      className="mr-2 h-4 w-4 text-indigo-600"
                    />
                    <label htmlFor={doc.id} className="text-sm">{doc.name}</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      doc.impact === 'Critical' ? 'bg-red-100 text-red-700' :
                      doc.impact === 'High' ? 'bg-orange-100 text-orange-700' :
                      doc.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {doc.impact}
                    </span>
                    <span className="text-xs text-gray-500">{doc.daysSaved} days</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={runSimulation}
              className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Run Simulation
            </button>
          </div>
        </div>
        
        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Readiness Gauge */}
          <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200">
            <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
              <Calculator size={18} className="text-indigo-600" />
              Submission Readiness
            </h3>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  readinessScore < 50 ? 'bg-red-500' :
                  readinessScore < 75 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${readinessScore}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">0%</span>
              <span className="text-sm font-medium">{readinessScore}%</span>
              <span className="text-xs text-gray-500">100%</span>
            </div>
          </div>
          
          {/* Simulation Results */}
          <div className="bg-indigo-50 rounded-md shadow-sm p-4 border border-indigo-100">
            <h3 className="text-md font-semibold mb-3 text-indigo-700">Simulation Results</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Days to Submission */}
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-indigo-600" />
                  <span className="text-xs text-gray-600">Timeline</span>
                </div>
                <p className="text-xl font-bold text-gray-800">{simulationResults.daysToSubmission} days</p>
                <p className="text-xs text-gray-500">to submission</p>
              </div>
              
              {/* Risks Identified */}
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle size={16} className="text-red-500" />
                  <span className="text-xs text-gray-600">Risks</span>
                </div>
                <p className="text-xl font-bold text-gray-800">{simulationResults.risksIdentified}</p>
                <p className="text-xs text-gray-500">critical risks identified</p>
              </div>
              
              {/* Financial Impact */}
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign size={16} className="text-green-600" />
                  <span className="text-xs text-gray-600">Financial Impact</span>
                </div>
                <p className="text-xl font-bold text-gray-800">{simulationResults.financialImpact}</p>
                <p className="text-xs text-gray-500">potential savings</p>
              </div>
              
              {/* Approval Probability */}
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <HeartPulse size={16} className="text-indigo-600" />
                  <span className="text-xs text-gray-600">Approval</span>
                </div>
                <p className="text-xl font-bold text-gray-800">{simulationResults.approvalProbability}</p>
                <p className="text-xs text-gray-500">estimated probability</p>
              </div>
            </div>
            
            {/* Action Recommendations */}
            <div className="mt-4 bg-white rounded-md p-3 border border-gray-200">
              <h4 className="text-sm font-medium mb-2">Recommended Actions</h4>
              <ul className="text-xs space-y-2">
                {!selectedDocuments.includes('CMC Documentation') && (
                  <li className="flex items-center gap-2 text-red-700">
                    <TimerOff size={14} />
                    <span>Complete CMC Documentation to avoid critical delays</span>
                  </li>
                )}
                {selectedDocuments.length < 4 && (
                  <li className="flex items-center gap-2 text-yellow-700">
                    <Calendar size={14} />
                    <span>Prioritize at least 4 critical documents for optimal timeline</span>
                  </li>
                )}
                {readinessScore >= 75 && (
                  <li className="flex items-center gap-2 text-green-700">
                    <CheckCircle size={14} />
                    <span>Current plan is on track for FDA acceptance</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}