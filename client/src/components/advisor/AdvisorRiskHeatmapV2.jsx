// client/src/components/advisor/AdvisorRiskHeatmapV2.jsx
import { useState, useEffect } from 'react';
import { getAdvisorReadiness } from '../../lib/advisorService';

// Color constants for risk levels
const RISK_COLORS = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500'
};

export default function AdvisorRiskHeatmapV2() {
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlaybook, setSelectedPlaybook] = useState('Fast IND Playbook');
  const [heatmapData, setHeatmapData] = useState([]);
  
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
        generateHeatmapData(data);
      } catch (error) {
        console.error('Error fetching Advisor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReadiness();
  }, [selectedPlaybook]);

  // Generate heatmap data based on CTD modules and sections
  const generateHeatmapData = (data) => {
    if (!data || !data.missingSections) return;
    
    const heatmap = [
      {
        module: 'Module 1',
        name: 'Administrative',
        sections: [
          { name: 'Form FDA 1571', missing: data.missingSections.includes('Form FDA 1571'), impact: 'high' },
          { name: 'Cover Letter', missing: data.missingSections.includes('Cover Letter'), impact: 'medium' },
          { name: 'Table of Contents', missing: data.missingSections.includes('Table of Contents'), impact: 'low' },
          { name: 'US Agent Appointment', missing: data.missingSections.includes('US Agent Appointment'), impact: 'medium' },
          { name: 'Financial Disclosure', missing: data.missingSections.includes('Financial Disclosure'), impact: 'high' }
        ]
      },
      {
        module: 'Module 2',
        name: 'CTD Summaries',
        sections: [
          { name: 'Introduction Summary', missing: data.missingSections.includes('Introduction Summary'), impact: 'medium' },
          { name: 'Quality Overall Summary', missing: data.missingSections.includes('Quality Overall Summary'), impact: 'high' },
          { name: 'Nonclinical Overview', missing: data.missingSections.includes('Nonclinical Overview'), impact: 'high' },
          { name: 'Clinical Overview', missing: data.missingSections.includes('Clinical Overview'), impact: 'high' },
          { name: 'Clinical Summary', missing: data.missingSections.includes('Clinical Summary'), impact: 'high' }
        ]
      },
      {
        module: 'Module 3',
        name: 'Quality',
        sections: [
          { name: 'Drug Substance Specs', missing: data.missingSections.includes('Drug Substance Specs'), impact: 'high' },
          { name: 'Drug Product Specs', missing: data.missingSections.includes('Drug Product Specs'), impact: 'high' },
          { name: 'CMC Stability Data', missing: data.missingSections.includes('CMC Stability Data'), impact: 'high' },
          { name: 'Analytical Methods', missing: data.missingSections.includes('Analytical Methods'), impact: 'medium' },
          { name: 'GMP Certificates', missing: data.missingSections.includes('GMP Certificates'), impact: 'medium' }
        ]
      },
      {
        module: 'Module 4',
        name: 'Nonclinical',
        sections: [
          { name: 'Toxicology Reports', missing: data.missingSections.includes('Toxicology Reports'), impact: 'high' },
          { name: 'Pharmacology Reports', missing: data.missingSections.includes('Pharmacology Reports'), impact: 'high' },
          { name: 'ADME Studies', missing: data.missingSections.includes('ADME Studies'), impact: 'medium' },
          { name: 'Carcinogenicity Studies', missing: data.missingSections.includes('Carcinogenicity Studies'), impact: 'medium' },
          { name: 'Genotoxicity Studies', missing: data.missingSections.includes('Genotoxicity Studies'), impact: 'medium' }
        ]
      },
      {
        module: 'Module 5',
        name: 'Clinical',
        sections: [
          { name: 'Clinical Study Reports (CSR)', missing: data.missingSections.includes('Clinical Study Reports (CSR)'), impact: 'high' },
          { name: 'Protocol', missing: data.missingSections.includes('Protocol'), impact: 'high' },
          { name: 'Investigator Brochure', missing: data.missingSections.includes('Investigator Brochure'), impact: 'high' },
          { name: 'Case Report Forms', missing: data.missingSections.includes('Case Report Forms'), impact: 'medium' },
          { name: 'Literature References', missing: data.missingSections.includes('Literature References'), impact: 'low' }
        ]
      }
    ];
    
    // Adjust heatmap based on playbook
    if (selectedPlaybook === 'Fast IND Playbook') {
      // Reduce importance of certain Module 4 items
      const mod4 = heatmap.find(m => m.module === 'Module 4');
      mod4.sections.forEach(section => {
        if (!section.name.includes('Toxicology') && !section.name.includes('Pharmacology')) {
          section.impact = 'low';
        }
      });
      
      // Find GMP Certificates and reduce importance
      const mod3 = heatmap.find(m => m.module === 'Module 3');
      const gmpSection = mod3.sections.find(s => s.name === 'GMP Certificates');
      if (gmpSection) gmpSection.impact = 'low';
    }
    else if (selectedPlaybook === 'EMA IMPD Playbook') {
      // Adjust for EMA requirements
      const mod1 = heatmap.find(m => m.module === 'Module 1');
      const usAgentSection = mod1.sections.find(s => s.name === 'US Agent Appointment');
      if (usAgentSection) usAgentSection.impact = 'low';
      
      // Emphasize specific Module 2 sections for EMA
      const mod2 = heatmap.find(m => m.module === 'Module 2');
      mod2.sections.forEach(section => {
        if (!section.name.includes('Introduction Summary') && !section.name.includes('Clinical Overview')) {
          section.impact = 'medium';
        }
      });
    }
    
    setHeatmapData(heatmap);
  };

  const calculateModuleRisk = (module) => {
    if (!module.sections) return 'low';
    
    const highImpactMissing = module.sections.some(s => s.missing && s.impact === 'high');
    if (highImpactMissing) return 'high';
    
    const mediumImpactMissing = module.sections.some(s => s.missing && s.impact === 'medium');
    if (mediumImpactMissing) return 'medium';
    
    const anyMissing = module.sections.some(s => s.missing);
    if (anyMissing) return 'low';
    
    return 'complete';
  };

  const handlePlaybookChange = (e) => {
    setSelectedPlaybook(e.target.value);
  };
  
  const getRiskColor = (impact, missing) => {
    if (!missing) return 'bg-green-500';
    
    switch(impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-yellow-300';
      default: return 'bg-gray-200';
    }
  };
  
  const getModuleRiskColor = (module) => {
    const riskLevel = calculateModuleRisk(module);
    
    switch(riskLevel) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-yellow-300';
      case 'complete': return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };
  
  // Calculate financial impact
  const calculateFinancialImpact = (item) => {
    const baseImpact = {
      high: 250000,
      medium: 150000,
      low: 50000
    };
    
    return item.missing ? baseImpact[item.impact] || 0 : 0;
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md w-full">
        <p className="text-gray-500 text-sm">Loading Regulatory Risk Heatmap...</p>
      </div>
    );
  }

  if (!readiness) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md w-full">
        <p className="text-red-500 text-sm">Risk data unavailable.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold mb-2">CTD Regulatory Risk Heatmap</h2>
          <p className="text-sm text-gray-600">
            Visualizes submission readiness and critical gaps across all CTD modules.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Regulatory Strategy:
          </label>
          <select
            className="block w-full md:w-64 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
      
      {/* Readiness Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Readiness Score</h3>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-indigo-600">{readiness.readinessScore}%</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Risk Level</h3>
          <div className="mt-1 flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
              readiness.riskLevel === 'High' ? 'bg-red-500' :
              readiness.riskLevel === 'Medium' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}></span>
            <p className="text-2xl font-semibold text-gray-800">{readiness.riskLevel}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Estimated Delay</h3>
          <p className="text-2xl font-semibold text-gray-800">{readiness.estimatedDelayDays} days</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Financial Impact</h3>
          <p className="text-2xl font-semibold text-red-600">
            ${(readiness.estimatedDelayDays * 50000).toLocaleString()}
          </p>
        </div>
      </div>
      
      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Module
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Status
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/3">
                Section Risk Levels
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {heatmapData.map((module, idx) => (
              <tr key={module.module} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900">{module.module}</div>
                  <div className="text-sm text-gray-500">{module.name}</div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                    calculateModuleRisk(module) === 'high' ? 'bg-red-100 text-red-800' :
                    calculateModuleRisk(module) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    calculateModuleRisk(module) === 'low' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {calculateModuleRisk(module) === 'high' ? 'Critical' :
                     calculateModuleRisk(module) === 'medium' ? 'At Risk' :
                     calculateModuleRisk(module) === 'low' ? 'Minor Issues' :
                     'Complete'}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="grid grid-cols-5 gap-2">
                    {module.sections.map((section) => (
                      <div key={section.name} className="relative group">
                        <div className={`h-8 rounded ${getRiskColor(section.impact, section.missing)}`}></div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute left-0 bottom-full mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 min-w-[200px] z-10">
                          <p className="font-bold">{section.name}</p>
                          <p>{section.missing ? 'Missing' : 'Complete'}</p>
                          <p>Impact: {section.impact.charAt(0).toUpperCase() + section.impact.slice(1)}</p>
                          {section.missing && (
                            <p className="text-red-300">
                              Est. Cost: ${calculateFinancialImpact(section).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Risk Legend</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 bg-red-500 rounded mr-2"></span>
            <span className="text-sm text-gray-600">Critical Risk</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 bg-yellow-500 rounded mr-2"></span>
            <span className="text-sm text-gray-600">Medium Risk</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 bg-yellow-300 rounded mr-2"></span>
            <span className="text-sm text-gray-600">Low Risk</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 bg-green-500 rounded mr-2"></span>
            <span className="text-sm text-gray-600">Complete</span>
          </div>
        </div>
      </div>
      
      {/* Critical Actions */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Critical Actions Needed</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {readiness.recommendations.slice(0, 6).map((action, idx) => (
            <li key={idx} className="flex items-start">
              <span className="inline-block w-5 h-5 flex items-center justify-center bg-red-100 text-red-500 rounded-full mr-2 mt-0.5 flex-shrink-0">
                !
              </span>
              <span className="text-sm text-gray-700">{action}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="text-center mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Powered by TrialSage™ Regulatory Intelligence
        </p>
      </div>
    </div>
  );
}