import React, { useState, useEffect } from "react";
import { CsrReport, CsrDetails } from "@/lib/types";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiRequest } from "@/lib/queryClient";

interface ReportDetailModalProps {
  report: CsrReport | null;
  onClose: () => void;
}

export function ReportDetailModal({ report, onClose }: ReportDetailModalProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Reset active tab when report changes
  useEffect(() => {
    if (report) {
      setActiveTab("overview");
    }
  }, [report]);
  
  // Fetch report details when a report is selected
  const { data: details, isLoading } = useQuery({
    queryKey: [`/api/reports/${report?.id}/details`],
    enabled: !!report,
  });
  
  if (!report) return null;
  
  const exportReport = async (format: 'csv' | 'json') => {
    try {
      // For CSV, we need to handle downloading the file
      if (format === 'csv') {
        const response = await apiRequest('GET', `/api/reports/${report.id}/export?format=csv`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${report.id}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        // For JSON, we'll just open in a new tab
        window.open(`/api/reports/${report.id}/export?format=json`, '_blank');
      }
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div 
        className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-5xl z-10 m-4"
      >
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">{report.title}</h3>
          <button onClick={onClose} className="text-white hover:text-slate-200">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* CSR Summary */}
          <div className="bg-slate-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-slate-800 mb-2">CSR Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500">Sponsor</p>
                <p className="text-sm font-medium text-slate-800">{report.sponsor}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Indication</p>
                <p className="text-sm font-medium text-slate-800">{report.indication}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Phase</p>
                <p className="text-sm font-medium text-slate-800">{report.phase}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Report Date</p>
                <p className="text-sm font-medium text-slate-800">{report.date}</p>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="space-y-4">
            <div className="border-b border-slate-200">
              <nav className="-mb-px flex space-x-8">
                <a 
                  onClick={() => setActiveTab("overview")} 
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                    activeTab === "overview" 
                      ? "border-primary text-primary" 
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  Overview
                </a>
                <a 
                  onClick={() => setActiveTab("design")} 
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                    activeTab === "design" 
                      ? "border-primary text-primary" 
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  Study Design
                </a>
                <a 
                  onClick={() => setActiveTab("endpoints")} 
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                    activeTab === "endpoints" 
                      ? "border-primary text-primary" 
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  Endpoints
                </a>
                <a 
                  onClick={() => setActiveTab("results")} 
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                    activeTab === "results" 
                      ? "border-primary text-primary" 
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  Results
                </a>
                <a 
                  onClick={() => setActiveTab("safety")} 
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                    activeTab === "safety" 
                      ? "border-primary text-primary" 
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  Safety
                </a>
              </nav>
            </div>
            
            {isLoading ? (
              <div className="py-10 text-center">
                <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <p className="mt-2 text-sm text-slate-600">Loading report details...</p>
              </div>
            ) : !details ? (
              <div className="py-10 text-center">
                <p className="text-slate-600">No detailed information available for this report.</p>
                {report.status === "Processing" && (
                  <p className="mt-2 text-sm text-slate-500">This report is still being processed. Check back soon.</p>
                )}
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                <div className={activeTab === "overview" ? "space-y-4" : "hidden"}>
                  <div className="prose prose-sm max-w-none">
                    <h4>Study Description</h4>
                    <p>{details.studyDescription || "No study description available."}</p>
                    
                    <h4>Primary Objective</h4>
                    <p>{details.primaryObjective || "No primary objective available."}</p>
                    
                    <h4>Key Inclusion Criteria</h4>
                    <p>{details.inclusionCriteria || "No inclusion criteria available."}</p>
                    
                    <h4>Key Exclusion Criteria</h4>
                    <p>{details.exclusionCriteria || "No exclusion criteria available."}</p>
                  </div>
                </div>
                
                {/* Study Design Tab */}
                <div className={activeTab === "design" ? "space-y-4" : "hidden"}>
                  <div className="prose prose-sm max-w-none">
                    <h4>Study Design</h4>
                    <p>{details.studyDesign || "No study design information available."}</p>
                    
                    {details.treatmentArms && details.treatmentArms.length > 0 && (
                      <>
                        <h4>Treatment Arms</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Arm</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Intervention</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dosing Regimen</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Participants</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                              {details.treatmentArms.map((arm, index) => (
                                <tr key={index}>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-800">{arm.arm}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-600">{arm.intervention}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-600">{arm.dosingRegimen}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-600">{arm.participants}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                    
                    <h4>Study Duration</h4>
                    <p>{details.studyDuration || "No study duration information available."}</p>
                  </div>
                </div>
                
                {/* Endpoints Tab */}
                <div className={activeTab === "endpoints" ? "space-y-6" : "hidden"}>
                  {details.endpoints && (
                    <>
                      <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                        <h4 className="font-medium text-slate-800">Primary Endpoint</h4>
                        <div className="pl-4 border-l-2 border-primary">
                          <p className="text-sm text-slate-700">{details.endpoints.primary || "No primary endpoint specified."}</p>
                        </div>
                      </div>
                      
                      {details.endpoints.secondary && details.endpoints.secondary.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-slate-800">Secondary Endpoints</h4>
                          <ul className="space-y-2">
                            {details.endpoints.secondary.map((endpoint, index) => (
                              <li key={index} className="flex">
                                <span className="text-primary">•</span>
                                <span className="ml-2 text-sm text-slate-700">{endpoint}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Results Tab */}
                <div className={activeTab === "results" ? "space-y-6" : "hidden"}>
                  {details.results && (
                    <div className="prose prose-sm max-w-none">
                      <h4>Primary Endpoint Results</h4>
                      <p>{details.results.primaryResults || "No primary results available."}</p>
                      
                      <h4>Secondary Endpoint Results</h4>
                      <p>{details.results.secondaryResults || "No secondary results available."}</p>
                      
                      <h4>Biomarker Results</h4>
                      <p>{details.results.biomarkerResults || "No biomarker results available."}</p>
                    </div>
                  )}
                </div>
                
                {/* Safety Tab */}
                <div className={activeTab === "safety" ? "space-y-6" : "hidden"}>
                  {details.safety && (
                    <div className="prose prose-sm max-w-none">
                      <h4>Overall Safety Summary</h4>
                      <p>{details.safety.overallSafety || "No safety information available."}</p>
                      
                      {details.safety.ariaResults && (
                        <>
                          <h4>Amyloid-Related Imaging Abnormalities (ARIA)</h4>
                          <p>{details.safety.ariaResults}</p>
                        </>
                      )}
                      
                      <h4>Common Adverse Events</h4>
                      <p>{details.safety.commonAEs || "No common adverse events information available."}</p>
                      
                      {details.safety.severeEvents && (
                        <>
                          <h4>Severe Events</h4>
                          <p>{details.safety.severeEvents}</p>
                        </>
                      )}
                      
                      {details.safety.discontinuationRates && (
                        <>
                          <h4>Discontinuation Rates</h4>
                          <p>{details.safety.discontinuationRates}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
          <div>
            <StatusBadge status={report.status as "Processing" | "Processed" | "Failed"} />
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => exportReport('csv')}
              className="inline-flex items-center px-3 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
              disabled={report.status !== "Processed"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export CSV
            </button>
            <button 
              onClick={() => exportReport('json')}
              className="inline-flex items-center px-3 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
              disabled={report.status !== "Processed"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
