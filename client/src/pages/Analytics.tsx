import React from "react";
import { BarChart3 } from "lucide-react";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-800">CSR Analytics Dashboard</h3>
          <p className="mt-1 text-sm text-slate-600">Insights and trends from your processed CSR documents.</p>
        </div>
        <div className="p-6">
          <div className="text-center py-20 text-slate-600">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">Analytics Coming Soon</h3>
            <p className="max-w-md mx-auto">
              Our analytics dashboard is currently in development. Soon you'll be able to visualize trends across CSRs, compare study designs, and gain deeper insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
