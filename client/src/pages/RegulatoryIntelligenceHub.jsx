// /client/src/pages/RegulatoryIntelligenceHub.jsx

import React, { useState } from 'react';
import UnifiedTopNav from '../components/navigation/UnifiedTopNav';
import AdvisorSummaryPanel from '../components/advisor/AdvisorSummaryPanel';
import AdvisorRiskHeatmapV2 from '../components/advisor/AdvisorRiskHeatmapV2';
import AdvisorTimelineSimulator from '../components/advisor/AdvisorTimelineSimulator';
import AskLumenAI from '../components/advisor/AskLumenAI';
import LumenAssistantButton from '../components/assistant/LumenAssistantButton'; // Chat Co-Pilot button

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
          <LumenAssistantButton 
            variant="default" 
            size="lg" 
            tooltip="Ask Regulatory AI" 
            onClick={() => setActiveTab('AskLumenAI')}
          />
        </div>
      )}
    </div>
  );
}