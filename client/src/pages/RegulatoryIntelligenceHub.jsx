// /client/src/pages/RegulatoryIntelligenceHub.jsx

import React, { useState } from 'react';
import UnifiedTopNav from '../components/navigation/UnifiedTopNav';
import AdvisorSummaryPanel from '../components/advisor/AdvisorSummaryPanel';
import AdvisorRiskHeatmapV2 from '../components/advisor/AdvisorRiskHeatmapV2';
import AdvisorTimelineSimulator from '../components/advisor/AdvisorTimelineSimulator';
import AskLumenAI from '../components/advisor/AskLumenAI';

export default function RegulatoryIntelligenceHub() {
  const [activeTab, setActiveTab] = useState('RiskHeatmap');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Always show Unified Navigation at top */}
      <UnifiedTopNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Regulatory Intelligence Panels */}
      <div className="p-8 space-y-6">
        {/* Top Readiness Metrics */}
        <AdvisorSummaryPanel />

        {/* Tab Area */}
        {activeTab === 'RiskHeatmap' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">CTD Critical Gap Risk Analysis</h2>
            <AdvisorRiskHeatmapV2 />
          </div>
        )}
        
        {activeTab === 'TimelineSimulator' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <AdvisorTimelineSimulator />
          </div>
        )}
        
        {activeTab === 'AskLumenAI' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <AskLumenAI />
          </div>
        )}
      </div>

      {/* Floating Ask Lumen AI Co-Pilot - Only visible when not on AskLumenAI tab */}
      {activeTab !== 'AskLumenAI' && (
        <div className="fixed bottom-8 right-8 z-50">
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
            title="Ask Regulatory AI"
            onClick={() => setActiveTab('AskLumenAI')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}