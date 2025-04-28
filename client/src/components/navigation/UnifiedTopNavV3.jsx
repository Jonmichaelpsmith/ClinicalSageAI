// /client/src/components/navigation/UnifiedTopNavV3.jsx
import React, { useState } from 'react';
import { useLocation } from 'wouter';

// Module data with icons and groupings
const modules = [
  {
    group: 'Regulatory Preparation',
    modules: [
      { id: 'ind-wizard', name: 'IND Wizard™', icon: '📋', path: '/client-portal/ind-wizard', readiness: 75, risk: 'Medium' },
      { id: 'csr-intelligence', name: 'CSR Intelligence™', icon: '📊', path: '/client-portal/csr-intelligence', readiness: 85, risk: 'Low' },
      { id: 'regulatory-dashboard', name: 'Regulatory Dashboard', icon: '📈', path: '/regulatory-intelligence-hub', readiness: 65, risk: 'Medium' },
    ]
  },
  {
    group: 'Document Management',
    modules: [
      { id: 'trialsage-vault', name: 'TrialSage Vault™', icon: '🗄️', path: '/client-portal/vault', readiness: 90, risk: 'Low' },
      { id: 'document-builder', name: 'Document Builder', icon: '📄', path: '/client-portal/document-builder', readiness: 70, risk: 'Medium' },
    ]
  },
  {
    group: 'Intelligence & Analytics',
    modules: [
      { id: 'study-architect', name: 'Study Architect™', icon: '🔬', path: '/client-portal/study-architect', readiness: 60, risk: 'High' },
      { id: 'analytics', name: 'Analytics Module', icon: '📊', path: '/client-portal/analytics', readiness: 80, risk: 'Low' },
      { id: 'ich-wiz', name: 'ICH Wiz™', icon: '🌐', path: '/client-portal/ich-wiz', readiness: 70, risk: 'Medium' },
    ]
  }
];

const getRiskColor = (risk) => {
  switch(risk) {
    case 'High': return 'bg-red-500';
    case 'Medium': return 'bg-yellow-400';
    case 'Low': return 'bg-green-400';
    default: return 'bg-gray-400';
  }
};

export default function UnifiedTopNavV3({ activeTab, onTabChange }) {
  const [location, navigate] = useLocation();
  const [isModuleSwitcherOpen, setIsModuleSwitcherOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredModule, setHoveredModule] = useState(null);

  // Get current module name based on path
  const getCurrentModuleName = () => {
    const path = location;
    if (path.includes('regulatory-intelligence-hub')) return 'Regulatory Dashboard';
    if (path.includes('ind-wizard')) return 'IND Wizard™';
    if (path.includes('vault')) return 'TrialSage Vault™';
    // Default
    return 'TrialSage™';
  };

  // Filter modules based on search term
  const filteredModules = modules.map(group => ({
    ...group,
    modules: group.modules.filter(module => 
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.modules.length > 0);

  return (
    <div className="w-full flex flex-col sticky top-0 z-50">
      {/* Top Row - Global Navigation */}
      <div className="w-full bg-white shadow-sm py-3 px-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex space-x-2 mr-3">
            <button
              onClick={() => window.history.back()}
              className="p-1.5 text-gray-600 rounded hover:bg-gray-100 transition-colors"
              title="Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => window.history.forward()}
              className="p-1.5 text-gray-600 rounded hover:bg-gray-100 transition-colors"
              title="Forward"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Logo + Module Selector */}
          <div className="relative">
            <button 
              className="flex items-center gap-2 py-1.5 px-3 rounded-md hover:bg-gray-100 transition-colors font-medium"
              onClick={() => setIsModuleSwitcherOpen(!isModuleSwitcherOpen)}
            >
              <span className="text-indigo-600 font-bold">TrialSage</span>
              <span className="hidden sm:inline text-gray-700">{getCurrentModuleName()}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Module Switcher Popup */}
            {isModuleSwitcherOpen && (
              <div className="absolute left-0 top-full mt-1 w-[520px] bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
                <div className="mb-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search modules..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-2.5 top-2.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div className="overflow-y-auto max-h-[400px]">
                  {filteredModules.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-4">
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{group.group}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {group.modules.map((module, moduleIndex) => (
                          <div 
                            key={moduleIndex}
                            className={`p-3 border border-gray-200 rounded-md flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${location === module.path ? 'ring-2 ring-indigo-500' : ''}`}
                            onClick={() => {
                              navigate(module.path);
                              setIsModuleSwitcherOpen(false);
                            }}
                            onMouseEnter={() => setHoveredModule(module)}
                            onMouseLeave={() => setHoveredModule(null)}
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-md flex items-center justify-center text-lg">
                              {module.icon}
                            </div>
                            <div className="flex-grow">
                              <h4 className="text-sm font-medium text-gray-900">{module.name}</h4>
                              {hoveredModule === module ? (
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="flex items-center text-xs">
                                    <span className="w-1.5 h-1.5 rounded-full mr-1 inline-block" style={{ backgroundColor: `var(--${module.readiness < 60 ? 'red' : module.readiness < 80 ? 'yellow' : 'green'})` }}></span>
                                    {module.readiness}% Ready
                                  </span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${getRiskColor(module.risk)} bg-opacity-20 text-${module.risk === 'High' ? 'red' : module.risk === 'Medium' ? 'yellow' : 'green'}-800`}>
                                    {module.risk} Risk
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">{/* Module description */}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => navigate('/client-portal')}
            className="ml-2 py-1.5 px-3 text-sm font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Return to Client Portal
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {/* User Profile & Settings - Placeholder */}
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-gray-600 rounded hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="p-1.5 text-gray-600 rounded hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
              <span className="font-medium text-sm">AU</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Second Row - Context-Specific Tabs */}
      <div className="w-full bg-white shadow-sm px-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onTabChange('RiskHeatmap')}
              className={`py-4 text-sm font-medium border-b-2 ${
                activeTab === 'RiskHeatmap' 
                  ? 'text-indigo-600 border-indigo-600' 
                  : 'text-gray-600 border-transparent hover:text-indigo-600 hover:border-indigo-300'
              } transition-colors`}
            >
              Risk Heatmap
            </button>
            
            <button
              onClick={() => onTabChange('TimelineSimulator')}
              className={`py-4 text-sm font-medium border-b-2 ${
                activeTab === 'TimelineSimulator' 
                  ? 'text-indigo-600 border-indigo-600' 
                  : 'text-gray-600 border-transparent hover:text-indigo-600 hover:border-indigo-300'
              } transition-colors`}
            >
              Timeline Simulator
            </button>
            
            <button
              onClick={() => onTabChange('AskLumenAI')}
              className={`py-4 text-sm font-medium border-b-2 ${
                activeTab === 'AskLumenAI' 
                  ? 'text-indigo-600 border-indigo-600' 
                  : 'text-gray-600 border-transparent hover:text-indigo-600 hover:border-indigo-300'
              } transition-colors`}
            >
              Ask Lumen AI
            </button>
          </div>
        </div>
      </div>
      
      {/* For Development: Click away listener to close module switcher */}
      {isModuleSwitcherOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsModuleSwitcherOpen(false)}
        ></div>
      )}
    </div>
  );
}