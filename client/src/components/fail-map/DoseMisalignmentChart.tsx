import React from 'react';

interface DoseData {
  drugType: string;
  doseLevel: string;
  failureRate: number;
  rootCause: string;
  count: number;
}

interface DoseMisalignmentChartProps {
  data: DoseData[];
}

export const DoseMisalignmentChart: React.FC<DoseMisalignmentChartProps> = ({ data }) => {
  // Group data by drug type
  const drugTypes = ['Small Molecule', 'Biologic', 'Peptide', 'Antibody-Drug Conjugate', 'Cell Therapy'];
  const doseFailuresByType = drugTypes.map(type => {
    // Calculate average failure rate for this drug type
    // (Using placeholder data until real data is available)
    const failureRate = Math.random() * 0.5 + 0.3; // 30-80%
    return { type, failureRate };
  }).sort((a, b) => b.failureRate - a.failureRate);

  // Most common root causes
  const rootCauses = [
    { cause: 'Phase 2 to Phase 3 dose selection error', percentage: 48 },
    { cause: 'Inadequate exposure-response modeling', percentage: 37 },
    { cause: 'Population PK variability underestimated', percentage: 32 },
    { cause: 'Combination therapy dose optimization', percentage: 29 },
    { cause: 'Failure to consider drug-drug interactions', percentage: 26 }
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Dose-Related Failure by Drug Type</h3>
          <div className="bg-white rounded-lg p-6 border border-dashed border-slate-300 h-[300px] flex items-center">
            {/* Simulated bar chart */}
            <div className="w-full flex items-end h-[200px] space-x-4">
              {doseFailuresByType.map((item, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t"
                    style={{ height: `${item.failureRate * 200}px` }}
                  ></div>
                  <div className="text-xs font-medium mt-2 text-center">{item.type}</div>
                  <div className="text-xs text-red-600 font-medium">{(item.failureRate * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Key Observations</h3>
            <ul className="space-y-1 text-sm text-slate-700">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Small molecules show 63% more dose-related failures than biologics</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">•</span>
                <span>Peptide therapies experience significant dose-finding challenges in Phase 2</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>ADCs require more precise dosing than traditional antibodies</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-3">Root Causes of Dose Misalignment</h3>
          
          <div className="bg-white rounded-lg p-6 border border-dashed border-slate-300">
            {rootCauses.map((item, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{item.cause}</span>
                  <span className="text-sm font-medium">{item.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-amber-500 h-3 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-100">
            <h3 className="text-sm font-medium text-amber-800 mb-2">
              Preventable Dose Optimizations
            </h3>
            <div className="flex items-center">
              <div className="w-40 h-40 flex-shrink-0">
                <div className="relative w-full h-full">
                  {/* Simulated donut chart */}
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#FDE68A"
                      strokeWidth="3"
                      strokeDasharray="100, 100"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="3"
                      strokeDasharray="68, 100"
                      strokeLinecap="round"
                    />
                    <text x="18" y="20.5" className="fill-amber-800 text-[0.5rem] font-medium text-center" textAnchor="middle">68%</text>
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">68% of dose-related failures</span> could potentially be prevented with:
                </p>
                <ul className="mt-2 space-y-1 text-xs text-amber-700">
                  <li className="flex items-center">
                    <span className="mr-1.5">•</span>
                    <span>Improved target exposure modeling</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-1.5">•</span>
                    <span>Patient stratification by PK profile</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-1.5">•</span>
                    <span>Adaptive design in late Phase 2</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h4 className="font-medium text-sm mb-2">Phase 2 to Phase 3 Transition</h4>
          <div className="flex items-center">
            <div className="w-12 h-12 flex-shrink-0 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-lg">48%</span>
            </div>
            <div className="ml-3 text-xs text-slate-600">
              of dose-related failures occur during the transition from Phase 2 to Phase 3
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h4 className="font-medium text-sm mb-2">Special Populations</h4>
          <div className="flex items-center">
            <div className="w-12 h-12 flex-shrink-0 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-amber-600 font-bold text-lg">37%</span>
            </div>
            <div className="ml-3 text-xs text-slate-600">
              of failures related to inadequate dose adjustment for special populations
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h4 className="font-medium text-sm mb-2">Therapeutic Index</h4>
          <div className="flex items-center">
            <div className="w-12 h-12 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">29%</span>
            </div>
            <div className="ml-3 text-xs text-slate-600">
              of failures due to narrow therapeutic index not accounted for in dose selection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};