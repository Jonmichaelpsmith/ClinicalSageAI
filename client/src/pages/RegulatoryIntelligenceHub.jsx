// /client/src/pages/RegulatoryIntelligenceHub.jsx

import React, { useState } from 'react';
import AdvisorSummaryPanel from '../components/advisor/AdvisorSummaryPanel';
import AdvisorRiskHeatmapV2 from '../components/advisor/AdvisorRiskHeatmapV2';
import AdvisorTimelineSimulator from '../components/advisor/AdvisorTimelineSimulator';
import AskLumenAI from '../components/assistant/AskLumenAI'; // Enhanced AI assistant

export default function RegulatoryIntelligenceHub() {
  const [activeTab, setActiveTab] = useState('RiskHeatmap');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation is now handled at the App level */}

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
            <p className="text-sm font-medium text-indigo-600 mb-4">
              Click the chat icon in the bottom-right corner to open the new enhanced AI co-pilot assistant.
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Ask Lumen AI Assistant - Always available as a floating panel */}
      <AskLumenAI />
    </div>
  );
}