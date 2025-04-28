// /client/src/components/advisor/AdvisorSummaryPanel.jsx

import React, { useState, useEffect } from 'react';
import { getAdvisorReadiness } from '../../lib/advisorService';
import { AlertTriangle, Clock, DollarSign, BarChart2 } from 'lucide-react';

export default function AdvisorSummaryPanel() {
  const [readiness, setReadiness] = useState(null);
  const [selectedPlaybook, setSelectedPlaybook] = useState('Fast IND Playbook');
  const [loading, setLoading] = useState(true);
  
  const playbooks = [
    'Fast IND Playbook',
    'Full NDA Playbook',
    'EMA IMPD Playbook'
  ];
  
  useEffect(() => {
    const fetchReadiness = async () => {
      setLoading(true);
      try {
        const data = await getAdvisorReadiness(selectedPlaybook);
        setReadiness(data);
      } catch (error) {
        console.error('Failed to load Advisor Readiness.');
        console.log('Using fallback data for demonstration');
        
        // Fallback data for demonstration (will be replaced with API data in production)
        setReadiness({
          readinessScore: selectedPlaybook === 'Fast IND Playbook' ? 65 : 
                         selectedPlaybook === 'Full NDA Playbook' ? 35 : 75,
          riskLevel: selectedPlaybook === 'Full NDA Playbook' ? 'High' : 'Medium',
          missingSections: selectedPlaybook === 'Fast IND Playbook' 
            ? ['CMC Stability Study', 'Clinical Study Reports (CSR)', 'Toxicology Reports', 'Drug Substance Specs', 'Pharmacology Reports', 'Investigator Brochure Updates'] 
            : selectedPlaybook === 'Full NDA Playbook'
              ? ['CMC Stability Study', 'Clinical Study Reports (CSR)', 'Toxicology Reports', 'ADME Studies', 'Carcinogenicity Reports', 'Genotoxicity Reports', 'Quality Overall Summary', 'Nonclinical Overview', 'Clinical Summary', 'Drug Substance Specs', 'Drug Product Specs', 'Clinical Safety Reports']
              : ['CMC Stability Study', 'GMP Certificates', 'Clinical Overview', 'Clinical Safety Reports'],
          recommendations: [
            'Upload CMC Stability Study immediately.',
            'Upload Clinical Study Reports immediately.',
            'Complete Quality Overall Summary.',
            'Finalize Toxicology Reports within 14 days.',
            'Update Drug Substance Specifications.'
          ],
          estimatedDelayDays: selectedPlaybook === 'Fast IND Playbook' ? 45 : 
                              selectedPlaybook === 'Full NDA Playbook' ? 120 : 30,
          estimatedSubmissionDate: "July 15, 2025"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchReadiness();
  }, [selectedPlaybook]);
  
  const handlePlaybookChange = (e) => {
    setSelectedPlaybook(e.target.value);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!readiness) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <h3 className="text-lg font-medium text-red-800">Unable to load readiness data</h3>
        <p className="text-red-700 mt-1">Please try again later or contact support.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Regulatory Command Center</h1>
        
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Regulatory Strategy:</label>
          <select
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={selectedPlaybook}
            onChange={handlePlaybookChange}
          >
            {playbooks.map((playbook) => (
              <option key={playbook} value={playbook}>
                {playbook}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className={`p-4 rounded-lg flex items-center ${
          readiness.readinessScore >= 70 ? 'bg-green-50 text-green-800 border border-green-200' :
          readiness.readinessScore >= 50 ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="rounded-full p-2 mr-3 bg-white">
            <BarChart2 className={
              readiness.readinessScore >= 70 ? 'text-green-500' :
              readiness.readinessScore >= 50 ? 'text-yellow-500' :
              'text-red-500'
            } size={20} />
          </div>
          <div>
            <p className="text-xs opacity-80">Readiness Score</p>
            <p className="text-xl font-bold">{readiness.readinessScore}%</p>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg flex items-center ${
          readiness.riskLevel === 'Low' ? 'bg-green-50 text-green-800 border border-green-200' :
          readiness.riskLevel === 'Medium' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="rounded-full p-2 mr-3 bg-white">
            <AlertTriangle className={
              readiness.riskLevel === 'Low' ? 'text-green-500' :
              readiness.riskLevel === 'Medium' ? 'text-yellow-500' :
              'text-red-500'
            } size={20} />
          </div>
          <div>
            <p className="text-xs opacity-80">Risk Level</p>
            <p className="text-xl font-bold">{readiness.riskLevel}</p>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg flex items-center ${
          readiness.estimatedDelayDays <= 14 ? 'bg-green-50 text-green-800 border border-green-200' :
          readiness.estimatedDelayDays <= 30 ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="rounded-full p-2 mr-3 bg-white">
            <Clock className={
              readiness.estimatedDelayDays <= 14 ? 'text-green-500' :
              readiness.estimatedDelayDays <= 30 ? 'text-yellow-500' :
              'text-red-500'
            } size={20} />
          </div>
          <div>
            <p className="text-xs opacity-80">Estimated Delay</p>
            <p className="text-xl font-bold">{readiness.estimatedDelayDays} days</p>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg flex items-center ${
          readiness.estimatedDelayDays * 50000 <= 500000 ? 'bg-green-50 text-green-800 border border-green-200' :
          readiness.estimatedDelayDays * 50000 <= 1000000 ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="rounded-full p-2 mr-3 bg-white">
            <DollarSign className={
              readiness.estimatedDelayDays * 50000 <= 500000 ? 'text-green-500' :
              readiness.estimatedDelayDays * 50000 <= 1000000 ? 'text-yellow-500' :
              'text-red-500'
            } size={20} />
          </div>
          <div>
            <p className="text-xs opacity-80">Financial Impact</p>
            <p className="text-xl font-bold">${(readiness.estimatedDelayDays * 50000).toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2 mb-2">
        <div className="text-sm text-indigo-600">
          <span className="font-medium">Target Date:</span> {readiness.estimatedSubmissionDate || 'Calculating...'}
        </div>
        
        <div className="text-sm text-gray-500">
          {readiness.missingSections.length} critical sections missing
        </div>
      </div>
    </div>
  );
}