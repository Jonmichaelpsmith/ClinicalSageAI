import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  FileX, 
  FileText, 
  FileSpreadsheet,
  FilePieChart,
  AlertTriangle,
  Lightbulb,
  Code,
  PresentationFile,
  PieChart,
  BarChartHorizontal
} from 'lucide-react';

/**
 * Intelligence Indicators Component
 * 
 * Displays the status of available intelligence artifacts for a session
 */
function IntelligenceIndicators({ sessionId }) {
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    
    // Fetch intelligence indicators status
    async function fetchIndicators() {
      try {
        setLoading(true);
        const response = await fetch(`/api/session/intelligence-indicators/${sessionId}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setIndicators(data);
      } catch (err) {
        console.error('Error fetching intelligence indicators:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchIndicators();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="p-4 border rounded-md bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full"></div>
          <span>Loading intelligence indicators...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-700">
        <div className="flex items-center space-x-2">
          <AlertTriangle size={18} />
          <span>Failed to load intelligence indicators: {error}</span>
        </div>
      </div>
    );
  }

  if (!indicators) return null;

  const indicatorItems = [
    { key: 'ind_summary', label: 'IND Summary', icon: FileText },
    { key: 'summary_packet', label: 'Summary Packet', icon: FileSpreadsheet },
    { key: 'sap_summary', label: 'SAP DOCX', icon: FileText },
    { key: 'success_model', label: 'Success Forecast', icon: PieChart },
    { key: 'risk_model', label: 'Dropout Risk', icon: BarChartHorizontal },
    { key: 'suggestions', label: 'Suggestions', icon: Lightbulb },
    { key: 'alignment_score', label: 'Alignment Report', icon: FilePieChart },
    { key: 'strategy_slide', label: 'Strategy Slide', icon: PresentationFile },
    { key: 'wisdom_trace', label: 'Wisdom Trace', icon: Code }
  ];
  
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Intelligence Artifacts</h3>
      <div className="grid grid-cols-3 gap-3">
        {indicatorItems.map(item => {
          const isAvailable = indicators[item.key];
          const Icon = item.icon;
          
          return (
            <div 
              key={item.key}
              className={`flex items-center p-2 rounded-md ${isAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}
            >
              {isAvailable ? (
                <FileCheck className="mr-2 h-5 w-5" />
              ) : (
                <FileX className="mr-2 h-5 w-5" />
              )}
              <div className="flex items-center">
                <Icon className="mr-1 h-4 w-4" />
                <span className="text-sm">{item.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IntelligenceIndicators;