import React from "react";
import { BarChart3 } from "lucide-react";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-800">Biotech Compound Analytics</h3>
          <p className="mt-1 text-sm text-slate-600">Statistical analysis and trends from your clinical trial data to accelerate drug development.</p>
        </div>
        <div className="p-6">
          <div className="text-center py-20 text-slate-600">
            <Microscope className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">Compound Analytics Dashboard Coming Soon</h3>
            <p className="max-w-md mx-auto">
              Our analytics dashboard is currently in development. Soon you'll be able to visualize biomarker trends, compare efficacy across similar compounds, and generate predictive models for trial success rates to support your R&D decision-making.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
