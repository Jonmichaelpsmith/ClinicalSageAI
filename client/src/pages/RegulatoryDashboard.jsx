// /client/src/pages/RegulatoryDashboard.jsx

import React from 'react';
import AdvisorSummaryPanel from '../components/advisor/AdvisorSummaryPanel';
import AdvisorRiskHeatmapV2 from '../components/advisor/AdvisorRiskHeatmapV2';
import AdvisorTimelineSimulator from '../components/advisor/AdvisorTimelineSimulator';
import LumenAssistantButton from '../components/assistant/LumenAssistantButton'; // Chat Co-Pilot button

export default function RegulatoryDashboard() {
  return (
    <div className="p-8 space-y-10 bg-gray-50 min-h-screen">
      
      {/* Top Metrics Section */}
      <AdvisorSummaryPanel />

      {/* Dynamic Risk Heatmap */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">CTD Critical Gap Risk Analysis</h2>
        <AdvisorRiskHeatmapV2 />
      </div>

      {/* Timeline Impact Simulator */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <AdvisorTimelineSimulator />
      </div>

      {/* Floating Ask Lumen AI Co-Pilot */}
      <div className="fixed bottom-8 right-8 z-50">
        <LumenAssistantButton variant="default" size="lg" tooltip="Ask Regulatory AI" />
      </div>

    </div>
  );
}