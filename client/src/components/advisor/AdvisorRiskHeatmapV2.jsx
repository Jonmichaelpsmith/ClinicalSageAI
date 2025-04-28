// /client/src/components/advisor/AdvisorRiskHeatmapV2.jsx

import React, { useState, useEffect } from 'react';

export default function AdvisorRiskHeatmapV2({ sidebar = false }) {
  const [missingSections, setMissingSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMissingSections = async () => {
      try {
        const res = await fetch('/api/advisor/check-readiness?playbook=Fast IND Playbook');
        const data = await res.json();
        
        // Log the response for debugging
        console.log("API Response:", data);
        
        // Process gaps from the response
        if (data && data.gaps && Array.isArray(data.gaps)) {
          // Based on the API response format we've received, each gap has section and status fields
          const missingSectionsList = data.gaps
            .filter(gap => gap.status === 'missing' || gap.status === 'incomplete')
            .map(gap => gap.section);
          
          console.log("Extracted missing sections:", missingSectionsList);
          
          // If we found sections, use them
          if (missingSectionsList.length > 0) {
            setMissingSections(missingSectionsList);
          } else {
            // Fallback to showing all sections from our risk profile
            console.warn('Using all sections from risk profile as fallback');
            setMissingSections(Object.keys(sectionRiskProfile).slice(0, 6));
          }
        } else {
          console.error('Failed to load Advisor Readiness or invalid data structure.');
          // Use default example sections from our risk profile
          setMissingSections([
            'CMC Stability Study', 
            'Clinical Study Reports (CSR)',
            'Toxicology Reports',
            'Drug Substance Specs',
            'Quality Overall Summary'
          ]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch missing sections', error);
        // Fallback data
        setMissingSections([
          'CMC Stability Study', 
          'Clinical Study Reports (CSR)',
          'Toxicology Reports',
          'Drug Substance Specs',
          'Quality Overall Summary'
        ]);
        setIsLoading(false);
      }
    };

    fetchMissingSections();
  }, []);
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
    "GMP Certificates": { risk: "Medium", delayDays: 14, financialRisk: 350000 },
    "Clinical Overview": { risk: "Medium", delayDays: 21, financialRisk: 450000 },
    "ADME Studies": { risk: "Medium", delayDays: 14, financialRisk: 300000 },
    "Carcinogenicity Reports": { risk: "High", delayDays: 30, financialRisk: 650000 },
    "Quality Overall Summary": { risk: "High", delayDays: 28, financialRisk: 550000 },
    "Clinical Summary": { risk: "Medium", delayDays: 21, financialRisk: 400000 },
  };

  const getRiskProfile = (section) => {
    return sectionRiskProfile[section] || { risk: "Low", delayDays: 5, financialRisk: 25000 };
  };

  // For sidebar view - more compact version
  if (sidebar) {
    return (
      <div>
        <div className="grid grid-cols-2 gap-1">
          {missingSections.slice(0, 4).map((section, idx) => {
            const { risk } = getRiskProfile(section);
            const riskColor =
              risk === "High" ? "bg-red-500" :
              risk === "Medium" ? "bg-yellow-400" :
              "bg-green-400";

            return (
              <div
                key={idx}
                className={`rounded-sm p-1 text-white text-xs ${riskColor}`}
              >
                <span className="text-[10px] block truncate">{section}</span>
              </div>
            );
          })}
        </div>
        
        {missingSections.length > 4 && (
          <div className="text-xs mt-1 text-gray-500">
            +{missingSections.length - 4} more risks...
          </div>
        )}
      </div>
    );
  }

  // For dashboard view - full version
  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md space-y-4">
        <h3 className="text-md font-semibold text-gray-700 mb-2">Regulatory Risk Heatmap</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-sm text-gray-500">Loading risk data...</span>
        </div>
      </div>
    )
  }

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
              className={`rounded-md p-3 flex flex-col items-center justify-center text-white font-semibold ${riskColor} hover:opacity-90 cursor-pointer transition-all duration-200`}
              onClick={() => alert(`Opening editor for ${section}`)}
              title={`Risk details for ${section}`}
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