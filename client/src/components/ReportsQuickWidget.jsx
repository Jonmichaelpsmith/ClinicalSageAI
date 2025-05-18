import React from 'react';
import { BarChart3, FileText, Download, Gauge, Clock } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

/**
 * ReportsQuickWidget Component
 * 
 * A dashboard widget that provides quick access to the Comprehensive Reports feature.
 * This widget displays key metrics and a direct access button to the Reports tab.
 */
const ReportsQuickWidget = () => {
  const [, setLocation] = useLocation();

  // Navigate directly to the CER Reports tab
  const navigateToCerReports = () => {
    // Navigate to CERV2 page with reports tab
    window.location.href = window.location.origin + '/cerv2?tab=reports';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-800 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          Comprehensive Reports
        </h3>
        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">New</span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">
        Access comprehensive reports across all modules with detailed analytics and regulatory compliance metrics.
      </p>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-md p-2 border border-blue-100">
          <div className="flex items-center mb-1">
            <Gauge className="h-3.5 w-3.5 text-green-600 mr-1.5" />
            <span className="text-xs font-medium text-gray-600">Compliance</span>
          </div>
          <p className="text-lg font-bold text-gray-800">85%</p>
        </div>
        
        <div className="bg-white rounded-md p-2 border border-blue-100">
          <div className="flex items-center mb-1">
            <Clock className="h-3.5 w-3.5 text-amber-600 mr-1.5" />
            <span className="text-xs font-medium text-gray-600">Last Report</span>
          </div>
          <p className="text-sm font-medium text-gray-800">2 days ago</p>
        </div>
      </div>
      
      <Button
        onClick={navigateToCerReports}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Open Reports Dashboard
      </Button>
    </div>
  );
};

export default ReportsQuickWidget;