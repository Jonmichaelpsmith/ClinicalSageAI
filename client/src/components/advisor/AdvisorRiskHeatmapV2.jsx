// /client/src/components/advisor/AdvisorRiskHeatmapV2.jsx

import React from 'react';

export default function AdvisorRiskHeatmapV2({ missingSections = [] }) {
  // Define criticality and delay impact mappings
  const sectionRiskProfile = {
    "CMC Stability Study": { risk: "High", delayDays: 30, financialRisk: 750000 },
    "Clinical Study Reports (CSR)": { risk: "High", delayDays: 45, financialRisk: 1000000 },
    "Clinical Safety Reports": { risk: "High", delayDays: 30, financialRisk: 600000 },
    "Drug Substance Specs": { risk: "Medium", delayDays: 21, financialRisk: 400000 },
    "Drug Product Specs": { risk: "Medium", delayDays: 21, financialRisk: 400000 },
    "Nonclinical Overview": { risk: "Medium", delayDays: 14, financialRisk: 250000 },
    "Toxicology Reports": { risk: "Medium", delayDays: 14, financialRisk: 300000 },
    "Genotoxicity Reports": { risk: "Medium", delayDays: 14, financialRisk: 300000 },
    "Pharmacology Reports": { risk: "Low", delayDays: 7, financialRisk: 100000 },
    "Pharmacokinetics Reports": { risk: "Low", delayDays: 7, financialRisk: 100000 },
    "Cover Letter": { risk: "Low", delayDays: 2, financialRisk: 20000 },
    "Intro Summary": { risk: "Low", delayDays: 3, financialRisk: 15000 },
    "Tabulated Summaries": { risk: "Low", delayDays: 5, financialRisk: 25000 },
    "Investigator Brochure Updates": { risk: "Low", delayDays: 5, financialRisk: 25000 },
    "US Agent Appointment": { risk: "Low", delayDays: 2, financialRisk: 20000 },
  };

  const getRiskProfile = (section) => {
    return sectionRiskProfile[section] || { risk: "Low", delayDays: 5, financialRisk: 25000 };
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md space-y-4">
      <h3 className="text-md font-semibold text-gray-700 mb-2">Regulatory Risk Heatmap</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {missingSections.map((section, idx) => {
          const { risk, delayDays, financialRisk } = getRiskProfile(section);
          const riskColor =
            risk === "High" ? "bg-red-500" :
            risk === "Medium" ? "bg-yellow-400" :
            "bg-green-400";

          return (
            <div
              key={idx}
              className={`rounded-md p-3 flex flex-col items-center justify-center text-white font-semibold ${riskColor}`}
            >
              <span className="text-xs text-center">{section}</span>
              <span className="text-[10px] mt-2">{risk} Risk</span>
              <span className="text-[10px]">+{delayDays}d / ~${(financialRisk/1000).toLocaleString()}k</span>
            </div>
          );
        })}
      </div>

      {missingSections.length === 0 && (
        <div className="text-center text-sm text-green-600 font-semibold">
          🎉 All critical sections completed!
        </div>
      )}
    </div>
  );
}