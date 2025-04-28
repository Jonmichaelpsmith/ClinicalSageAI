// client/src/pages/RegulatoryRiskDashboard.jsx
import { useState, useEffect } from 'react';
import AdvisorRiskHeatmapV2 from '../components/advisor/AdvisorRiskHeatmapV2';
import AdvisorSidebarV3 from '../components/advisor/AdvisorSidebarV3';
import { getAdvisorReadiness } from '../lib/advisorService';

export default function RegulatoryRiskDashboard() {
  const [selectedPlaybook, setSelectedPlaybook] = useState('Fast IND Playbook');
  const [readinessData, setReadinessData] = useState(null);
  const [loading, setLoading] = useState(true);

  const playbooks = [
    'Fast IND Playbook',
    'Full NDA Playbook',
    'EMA IMPD Playbook'
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAdvisorReadiness(selectedPlaybook);
        setReadinessData(data);
      } catch (error) {
        console.error('Error fetching advisor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPlaybook]);

  const handlePlaybookChange = (e) => {
    setSelectedPlaybook(e.target.value);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Regulatory Risk Intelligence Dashboard</h1>
        <p className="text-gray-600">
          Comprehensive visualization of CTD readiness, risk levels, and critical submission gaps.
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Regulatory Strategy:</label>
        <select
          className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm w-full sm:w-64"
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
      
      {loading ? (
        <div className="text-center p-8">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Enhanced Risk Visualization (takes 3/4 of the screen on large displays) */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">CTD Critical Risk Analysis</h2>
                
                {/* Summary cards at the top */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-700">Readiness</h3>
                    <p className="text-2xl font-bold text-blue-800">{readinessData?.readinessScore}%</p>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-red-700">Risk Level</h3>
                    <p className="text-2xl font-bold text-red-800">{readinessData?.riskLevel}</p>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-amber-700">Delay Estimate</h3>
                    <p className="text-2xl font-bold text-amber-800">{readinessData?.estimatedDelayDays} days</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-700">Financial Impact</h3>
                    <p className="text-2xl font-bold text-purple-800">${(readinessData?.estimatedDelayDays * 50000).toLocaleString()}</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-3">Critical CTD Gaps</h3>
                {readinessData && (
                  <AdvisorRiskHeatmapV2 missingSections={readinessData.missingSections || []} />
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold mb-3">Immediate Action Recommendations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {readinessData?.recommendations?.slice(0, 6).map((rec, idx) => (
                      <div key={idx} className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full mr-3">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar (takes 1/4 of the screen on large displays) */}
            <div>
              <AdvisorSidebarV3 />
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-700 mb-1">Information</h3>
            <p className="text-xs text-blue-600">
              This dashboard visualizes submission readiness across CTD sections, highlighting critical regulatory gaps 
              and risks. Select different regulatory playbooks to see how strategy changes affect submission timelines 
              and requirements. Each missing section displays its risk level, delay impact, and estimated financial cost.
            </p>
          </div>
        </>
      )}
    </div>
  );
}