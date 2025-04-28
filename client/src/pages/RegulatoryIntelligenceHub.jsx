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
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h3 className="text-md font-semibold text-gray-700 mb-2">CTD Critical Gap Risk Analysis</h3>
            <p className="text-sm text-gray-500 mb-4">
              Interactive visualization of CTD gaps with dynamic risk assessment. Click any risk tile for detailed analysis and remediation options.
            </p>

            {/* Real Risk Heatmap Component */}
            <AdvisorRiskHeatmapV2 />
          </div>
        )}
        
        {activeTab === 'TimelineSimulator' && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Timeline Simulation Tool</h3>
            <p className="text-sm text-gray-500 mb-4">
              Predict how document completion impacts your estimated submission date. Test different document completion schedules to optimize your timeline.
            </p>
            
            {/* Real Timeline Simulator Component */}
            <AdvisorTimelineSimulator />
          </div>
        )}
        
        {activeTab === 'AskLumenAI' && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Regulatory Intelligence AI Assistant</h3>
            <p className="text-sm text-gray-500 mb-4">
              Ask questions about your regulatory strategy, timeline, and compliance requirements. Get personalized guidance from Lumen AI.
            </p>
            
            {/* Real Lumen AI Assistant Component */}
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