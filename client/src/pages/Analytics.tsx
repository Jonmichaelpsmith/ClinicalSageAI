
import React from "react";
import { BarChart3, PieChart, LineChart, Microscope, Pill, Activity, Flask, Dna } from "lucide-react";
import { motion } from "framer-motion";

export default function Analytics() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-lg shadow border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-800">Biomarker & Efficacy Analytics</h3>
          <p className="mt-1 text-sm text-slate-600">Insights and trends from your processed clinical trial data.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border border-slate-200 rounded-lg p-5">
              <div className="flex items-center mb-4">
                <Microscope className="h-5 w-5 text-primary mr-2" />
                <h4 className="text-md font-medium text-slate-800">Biomarker Correlation</h4>
              </div>
              <div className="h-[200px] bg-muted/20 rounded-md flex items-center justify-center">
                <span className="text-muted-foreground">Cross-trial biomarker analysis coming soon</span>
              </div>
            </div>
            
            <div className="border border-slate-200 rounded-lg p-5">
              <div className="flex items-center mb-4">
                <Activity className="h-5 w-5 text-accent mr-2" />
                <h4 className="text-md font-medium text-slate-800">Efficacy Endpoints</h4>
              </div>
              <div className="h-[200px] bg-muted/20 rounded-md flex items-center justify-center">
                <span className="text-muted-foreground">Endpoint comparison tools coming soon</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="border border-slate-200 rounded-lg p-5">
              <div className="flex items-center mb-4">
                <Pill className="h-5 w-5 text-secondary mr-2" />
                <h4 className="text-md font-medium text-slate-800">Adverse Events</h4>
              </div>
              <div className="h-[150px] bg-muted/20 rounded-md flex items-center justify-center">
                <span className="text-muted-foreground">AE frequency analysis coming soon</span>
              </div>
            </div>
            
            <div className="border border-slate-200 rounded-lg p-5">
              <div className="flex items-center mb-4">
                <Dna className="h-5 w-5 text-indigo-600 mr-2" />
                <h4 className="text-md font-medium text-slate-800">Genetic Markers</h4>
              </div>
              <div className="h-[150px] bg-muted/20 rounded-md flex items-center justify-center">
                <span className="text-muted-foreground">Genomic correlation tools coming soon</span>
              </div>
            </div>
            
            <div className="border border-slate-200 rounded-lg p-5">
              <div className="flex items-center mb-4">
                <Flask className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="text-md font-medium text-slate-800">Dosing Analysis</h4>
              </div>
              <div className="h-[150px] bg-muted/20 rounded-md flex items-center justify-center">
                <span className="text-muted-foreground">Dose response visualization coming soon</span>
              </div>
            </div>
          </div>
          
          <div className="text-center py-6 px-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-medium text-slate-800 mb-2">Analytics Platform Roadmap</h3>
            <p className="text-slate-600 max-w-2xl mx-auto mb-4">
              Our comprehensive analytics suite is currently in development. Soon you'll be able to:
            </p>
            <ul className="text-left max-w-2xl mx-auto space-y-2 text-sm text-slate-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Cross-reference biomarkers across multiple clinical trials</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Visualize efficacy trends by therapeutic area and mechanism of action</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Compare safety profiles between related compounds</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Generate predictive models for trial success based on historical data</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Identify optimal patient populations based on biomarker responses</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
