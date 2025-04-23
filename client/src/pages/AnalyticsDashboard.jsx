import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  BarChart4, 
  LineChart, 
  PieChart,
  BrainCircuit, 
  RefreshCw,
  Lightbulb,
  ChevronDown,
  Filter,
  Download
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('study-risk');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Simulated state for the actual implementation
  const [insight, setInsight] = useState("");
  
  // List of dashboards from the document
  const dashboards = [
    { id: 'study-risk', name: 'Study-Risk Overview', icon: <BarChart4 className="w-4 h-4" /> },
    { id: 'ind-readiness', name: 'IND Readiness Heat-map', icon: <BarChart4 className="w-4 h-4" /> },
    { id: 'ai-writer', name: 'AI Writer ROI', icon: <LineChart className="w-4 h-4" /> },
    { id: 'ectd-velocity', name: 'eCTD Sequence Velocity', icon: <LineChart className="w-4 h-4" /> },
    { id: 'csr-similarity', name: 'CSR Similarity Explorer', icon: <PieChart className="w-4 h-4" /> },
    { id: 'sdtm-violations', name: 'SDTM Rule Violations', icon: <BarChart4 className="w-4 h-4" /> },
    { id: 'protocol-deviation', name: 'Protocol Deviation Monitor', icon: <BarChart4 className="w-4 h-4" /> },
    { id: 'adverse-events', name: 'Adverse Event Density', icon: <LineChart className="w-4 h-4" /> },
    { id: 'enrollment', name: 'Enrollment Burn-Down', icon: <LineChart className="w-4 h-4" /> },
    { id: 'site-activation', name: 'Site Activation Funnel', icon: <BarChart4 className="w-4 h-4" /> },
    { id: 'patient-nps', name: 'Patient-Reported NPS', icon: <LineChart className="w-4 h-4" /> },
    { id: 'investigator-nps', name: 'Investigator NPS', icon: <LineChart className="w-4 h-4" /> },
    { id: 'document-qc', name: 'Document QC Turnaround', icon: <BarChart4 className="w-4 h-4" /> },
    { id: 'writer-utilization', name: 'Medical Writer Utilisation', icon: <PieChart className="w-4 h-4" /> },
    { id: 'ai-chat', name: 'AI Chat Assist Usage', icon: <BarChart4 className="w-4 h-4" /> },
    { id: 'regulatory-query', name: 'Regulatory Query Lag', icon: <LineChart className="w-4 h-4" /> },
    { id: 'hallucination-rate', name: 'Hallucination Rate', icon: <BarChart4 className="w-4 h-4" /> },
    { id: 'content-reuse', name: 'Content Re-use Ratio', icon: <PieChart className="w-4 h-4" /> },
    { id: 'language-consistency', name: 'Language Consistency', icon: <BarChart4 className="w-4 h-4" /> },
    { id: 'audit-trail', name: 'Audit Trail Exceptions', icon: <BarChart4 className="w-4 h-4" /> },
    { id: 'data-drift', name: 'Data Drift Sentinel', icon: <LineChart className="w-4 h-4" /> },
    { id: 'molecule-similarity', name: 'Molecule Similarity Hotlist', icon: <PieChart className="w-4 h-4" /> },
    { id: 'budget-overrun', name: 'Forecasted Budget Overrun', icon: <LineChart className="w-4 h-4" /> },
    { id: 'query-bot', name: 'Query Bot Resolution Time', icon: <BarChart4 className="w-4 h-4" /> },
    { id: 'ind-radar', name: 'IND "Next 90 days" Radar', icon: <BarChart4 className="w-4 h-4" /> },
  ];

  // Simulated refresh action
  const refreshDashboard = () => {
    setIsLoading(true);
    
    // Simulate API call to refresh data
    setTimeout(() => {
      setIsLoading(false);
      // Update insight based on the refreshed data
      setInsight(getInsightForDashboard(activeTab));
    }, 1500);
  };

  // Simulated API response for insights based on dashboard ID
  const getInsightForDashboard = (dashboardId) => {
    // In a real implementation, this would come from the OpenAI API through our backend
    const insights = {
      'study-risk': "Critical findings trending 14% lower this quarter compared to Q1. Three sites (Stockholm, Cleveland, Sydney) account for 68% of all critical findings - recommend CAPA meetings with these sites next week.",
      'ind-readiness': "Module 3 CMC documentation is approaching readiness (92% complete) but Module 4 Tox still shows significant gaps (68%). At current pace, IND submission is forecast for June 8, approximately 2 weeks behind schedule.",
      'ai-writer': "AI Writer ROI increased 32% month-over-month. Average document creation time reduced from 6.2 hours to 2.1 hours. Hallucination rate remains stable at 0.8%, well below the industry benchmark of 3.4%.",
      'protocol-deviation': "Protocol deviations have increased 8% over the last 30 days, primarily in the Boston site. Critical deviations remain below threshold at 2.3%. Consider protocol clarification for inclusion criteria which accounts for 41% of all deviations.",
      'default': "Analyzing dashboard metrics... Key metrics are tracking within expected ranges. No significant anomalies detected in the current data. Would you like a deeper analysis of any specific aspect?"
    };
    
    return insights[dashboardId] || insights['default'];
  };

  // Update insight when dashboard changes
  useEffect(() => {
    setInsight(getInsightForDashboard(activeTab));
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/">
                <a className="flex items-center text-[#0071e3] font-medium">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </a>
              </Link>
              <h1 className="text-xl font-semibold text-[#1d1d1f] ml-6">Analytics Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                className="px-3 py-1.5 bg-[#f5f5f7] text-[#1d1d1f] rounded-md flex items-center gap-1.5 text-sm hover:bg-[#e5e5e7]"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button 
                className="px-3 py-1.5 text-[#0071e3] border border-[#0071e3] rounded-md flex items-center gap-1.5 text-sm hover:bg-[#f0f7ff]"
                onClick={refreshDashboard}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="px-3 py-1.5 text-[#0071e3] border border-[#0071e3] rounded-md flex items-center gap-1.5 text-sm hover:bg-[#f0f7ff]">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-[#e5e5e7] bg-[#f9f9fb] overflow-y-auto">
          <div className="p-3 sticky top-0 bg-[#f9f9fb] border-b border-[#e5e5e7] z-10">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search dashboards..." 
                className="w-full px-3 py-1.5 pr-8 text-sm border border-[#e5e5e7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-[#86868b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="p-1">
            {dashboards.map((dashboard) => (
              <button
                key={dashboard.id}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md ${
                  activeTab === dashboard.id 
                    ? 'bg-[#0071e3] text-white font-medium' 
                    : 'text-[#1d1d1f] hover:bg-[#f0f0f5]'
                }`}
                onClick={() => setActiveTab(dashboard.id)}
              >
                {dashboard.icon}
                <span className="truncate">{dashboard.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-auto bg-[#f5f5f7]">
          {/* Frame for Metabase Embed */}
          <div className="col-span-9 bg-white rounded-xl shadow overflow-hidden min-h-[calc(100vh-8rem)] flex flex-col">
            <div className="p-4 border-b border-[#e5e5e7] flex justify-between items-center">
              <h2 className="font-semibold text-[#1d1d1f]">
                {dashboards.find(d => d.id === activeTab)?.name}
              </h2>
              <div className="text-xs text-[#86868b]">Last updated: April 23, 2025 at 11:42 AM</div>
            </div>
            
            <div className="flex-1 p-4 flex flex-col items-center justify-center">
              {/* This would be an iframe in the actual implementation */}
              <div className="border-2 border-dashed border-[#e5e5e7] rounded-lg w-full h-full flex flex-col items-center justify-center p-6">
                <BarChart4 className="w-12 h-12 text-[#e5e5e7] mb-4" />
                <p className="text-[#86868b] text-center max-w-md">
                  Metabase dashboard would be embedded here with real analytics from PostgreSQL materialized views. 
                  This placeholder represents the iframe that would load the corresponding dashboard.
                </p>
                <button className="mt-4 px-4 py-2 bg-[#0071e3] text-white rounded-md text-sm">
                  Connect to Metabase
                </button>
              </div>
            </div>
          </div>
          
          {/* Copilot Insights Panel */}
          <div className="col-span-3 bg-white rounded-xl shadow overflow-hidden min-h-[calc(100vh-8rem)] flex flex-col">
            <div className="p-4 border-b border-[#e5e5e7] flex items-center">
              <BrainCircuit className="w-5 h-5 text-[#0071e3] mr-2" />
              <h2 className="font-semibold text-[#1d1d1f]">Copilot Insights</h2>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-start mb-4">
                <div className="p-1.5 rounded-full bg-[#f0f7ff] mr-3 mt-0.5">
                  <Lightbulb className="w-4 h-4 text-[#0071e3]" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-[#1d1d1f] mb-1">Key Insights</h3>
                  <p className="text-sm text-[#424245]">{insight}</p>
                </div>
              </div>
              
              {activeTab === 'study-risk' && (
                <div className="mt-6 space-y-4">
                  <div className="p-3 bg-[#f9f9ff] rounded-lg border border-[#e5e5e7]">
                    <h4 className="font-medium text-sm text-[#1d1d1f] mb-1">Recommended Actions</h4>
                    <ul className="text-xs text-[#424245] space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-4 h-4 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[10px] font-bold mt-0.5">1</span>
                        <span>Schedule CAPA meetings with Stockholm, Cleveland, and Sydney sites by end of week</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-4 h-4 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[10px] font-bold mt-0.5">2</span>
                        <span>Review and update site monitoring plan to address critical findings pattern</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-4 h-4 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[10px] font-bold mt-0.5">3</span>
                        <span>Initiate root cause analysis for top 3 recurring critical findings</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-[#f9fff9] rounded-lg border border-[#e5e5e7]">
                    <h4 className="font-medium text-sm text-[#1d1d1f] mb-1">Positive Trends</h4>
                    <ul className="text-xs text-[#424245] space-y-1">
                      <li className="flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        <span>Overall critical findings down 14% QoQ</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        <span>Paris and Toronto sites show zero critical findings for 90+ days</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-[#e5e5e7] bg-[#f9f9fb]">
              <button className="w-full py-1.5 text-[#0071e3] text-sm font-medium hover:underline">
                Ask Copilot a question
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}