// /client/src/components/navigation/UnifiedTopNavV3.jsx

import { useLocation } from 'wouter'; // wouter doesn't have useNavigate
import { useState } from 'react';

export default function UnifiedTopNavV3({ activeTab, onTabChange }) {
  const [location, navigate] = useLocation();
  const [showModuleSwitcher, setShowModuleSwitcher] = useState(false);

  const modules = [
    { name: 'Client Portal', path: '/client-portal' },
    { name: 'Regulatory Intelligence Hub', path: '/regulatory-intelligence-hub' },
    { name: 'IND Wizard', path: '/ind-wizard' },
    { name: 'CMC Wizard', path: '/cmc-wizard' },
    { name: 'CER Generator', path: '/cer-generator' },
    { name: 'CSR Analyzer', path: '/csr-analyzer' },
    { name: 'Study Architect', path: '/study-architect' },
    { name: 'TrialSage Vault', path: '/vault' },
    { name: 'Analytics Dashboard', path: '/analytics' },
  ];

  // Navigate to a path safely
  const navigateTo = (path) => {
    // Use window.location for more reliable navigation between modules
    window.location.href = path;
  };

  return (
    <div className="w-full sticky top-0 z-50 bg-white shadow-md flex flex-col">

      {/* Top Row - Navigation and Module Switcher */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="px-3 py-1 text-xs font-medium bg-gray-100 rounded hover:bg-gray-200"
          >
            ← Back
          </button>

          <button
            onClick={() => window.history.forward()}
            className="px-3 py-1 text-xs font-medium bg-gray-100 rounded hover:bg-gray-200"
          >
            → Forward
          </button>

          <button
            onClick={() => navigateTo('/client-portal')}
            className="px-3 py-1 text-xs font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            🏠 Client Portal
          </button>
        </div>

        <div>
          <button
            onClick={() => setShowModuleSwitcher(true)}
            className="px-4 py-1 text-xs font-medium bg-indigo-50 rounded hover:bg-indigo-100 text-indigo-600"
          >
            🔍 Switch Module
          </button>
        </div>
      </div>

      {/* Second Row - Functional Tabs */}
      <div className="flex justify-center gap-8 border-t border-gray-100 p-2 bg-white">
        <button
          onClick={() => onTabChange('RiskHeatmap')}
          className={`text-sm font-semibold ${
            activeTab === 'RiskHeatmap' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'
          }`}
        >
          Risk Heatmap
        </button>

        <button
          onClick={() => onTabChange('TimelineSimulator')}
          className={`text-sm font-semibold ${
            activeTab === 'TimelineSimulator' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'
          }`}
        >
          Timeline Simulator
        </button>

        <button
          onClick={() => onTabChange('AskLumenAI')}
          className={`text-sm font-semibold ${
            activeTab === 'AskLumenAI' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'
          }`}
        >
          Ask Lumen AI
        </button>
      </div>

      {/* Module Switcher Modal */}
      {showModuleSwitcher && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-20 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:w-[50%] space-y-6">
            <h2 className="text-lg font-bold text-gray-800">Switch to Module</h2>
            <div className="grid grid-cols-2 gap-4">
              {modules.map((mod, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigateTo(mod.path);
                    setShowModuleSwitcher(false);
                  }}
                  className="border border-gray-300 hover:border-indigo-500 rounded-md p-4 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition"
                >
                  {mod.name}
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowModuleSwitcher(false)}
                className="px-4 py-2 text-xs bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}