import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { FileText, Database, Clock, Upload, FileType, BarChart3 } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickAction } from "@/components/dashboard/QuickAction";
import { ReportCard } from "@/components/reports/ReportCard";
import { ReportDetailModal } from "@/components/reports/ReportDetailModal";
import { type CsrReport, type Stats } from "@/lib/types";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [selectedReport, setSelectedReport] = useState<CsrReport | null>(null);
  
  // Fetch reports data
  const { data: reports, isLoading: isLoadingReports } = useQuery({
    queryKey: ['/api/reports'],
  });
  
  // Fetch stats data
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats'],
  });
  
  const recentReports = reports?.slice(0, 5) || [];
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingStats ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-5 border border-slate-200 animate-pulse">
              <div className="h-20"></div>
            </div>
          ))
        ) : (
          <>
            <StatsCard 
              title="Total CSRs" 
              value={stats?.totalReports || 0} 
              icon={<FileText />} 
              iconBgColor="bg-blue-100" 
              iconColor="text-blue-600" 
            />
            <StatsCard 
              title="Processed CSRs" 
              value={stats?.processedReports || 0} 
              icon={<FileType />} 
              iconBgColor="bg-green-100" 
              iconColor="text-green-600" 
              trend={{ value: "+2 this week", up: true }}
            />
            <StatsCard 
              title="Data Points Extracted" 
              value={stats?.dataPointsExtracted || 0} 
              icon={<Database />} 
              iconBgColor="bg-indigo-100" 
              iconColor="text-indigo-600" 
            />
            <StatsCard 
              title="Processing Time Saved" 
              value={`${stats?.processingTimeSaved || 0} hrs`} 
              icon={<Clock />} 
              iconBgColor="bg-purple-100" 
              iconColor="text-purple-600" 
            />
          </>
        )}
      </div>
      
      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-800">Recent CSR Reports</h3>
        </div>
        <div className="overflow-x-auto">
          {isLoadingReports ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="mt-2 text-sm text-slate-600">Loading reports...</p>
            </div>
          ) : reports?.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-slate-600">No CSR reports available.</p>
              <button 
                onClick={() => navigate('/upload')}
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Upload your first CSR
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sponsor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Indication</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phase</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Uploaded</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {recentReports.map((report: CsrReport) => (
                  <ReportCard 
                    key={report.id} 
                    report={report} 
                    onClick={(report) => setSelectedReport(report)} 
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
          <button 
            onClick={() => navigate('/reports')}
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            View all reports →
          </button>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction 
          title="Upload New CSR" 
          description="Upload a new CSR report for AI-powered processing and analysis." 
          icon={<Upload />}
          buttonText="Upload CSR" 
          onClick={() => navigate('/upload')}
        />
        <QuickAction 
          title="Generate Protocol" 
          description="Use AI to generate a protocol based on similar historical CSRs." 
          icon={<FileText />}
          buttonText="Generate Protocol" 
          onClick={() => {}}
          buttonClassName="bg-accent hover:bg-accent-dark focus:ring-accent"
        />
        <QuickAction 
          title="Compare CSRs" 
          description="Compare multiple CSRs to identify patterns and differences." 
          icon={<BarChart3 />}
          buttonText="Compare CSRs" 
          onClick={() => {}}
          buttonClassName="bg-secondary hover:bg-secondary-dark focus:ring-secondary"
        />
      </div>
      
      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
