// client/src/pages/RegulatoryRiskDashboard.jsx
import { useState } from 'react';
import AdvisorRiskHeatmapV2 from '../components/advisor/AdvisorRiskHeatmapV2';
import AdvisorSidebarV3 from '../components/advisor/AdvisorSidebarV3';

export default function RegulatoryRiskDashboard() {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Regulatory Risk Intelligence Dashboard</h1>
        <p className="text-gray-600">
          Comprehensive visualization of CTD readiness, risk levels, and critical submission gaps.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main heatmap (takes 3/4 of the screen on large displays) */}
        <div className="lg:col-span-3">
          <AdvisorRiskHeatmapV2 />
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
          and requirements. Hover over individual section blocks to see detailed information.
        </p>
      </div>
    </div>
  );
}