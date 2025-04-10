import React, { useEffect, useRef } from 'react';
// import * as d3 from 'd3';

interface EndpointData {
  endpoint: string;
  indication: string;
  failureRate: number;
  count: number;
}

interface EndpointHeatmapProps {
  data: EndpointData[];
}

export const EndpointHeatmap: React.FC<EndpointHeatmapProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Generate placeholder content 
  // This would be replaced with real D3 visualization in production
  
  // Group data by endpoint for analysis
  const endpointGroups = data.reduce((acc, item) => {
    if (!acc[item.endpoint]) {
      acc[item.endpoint] = [];
    }
    acc[item.endpoint].push(item);
    return acc;
  }, {} as Record<string, EndpointData[]>);

  // Get top failing endpoints
  const endpointFailRates = Object.entries(endpointGroups).map(([endpoint, items]) => {
    const avgFailureRate = items.reduce((sum, item) => sum + item.failureRate, 0) / items.length;
    return { endpoint, avgFailureRate };
  }).sort((a, b) => b.avgFailureRate - a.avgFailureRate);

  return (
    <div className="w-full">
      {/* Placeholder for actual D3 visualization */}
      <div className="bg-white rounded-lg p-6 border border-dashed border-slate-300 mb-6">
        <div className="flex justify-center items-center h-[350px]">
          <div className="grid grid-cols-6 gap-1 w-full">
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              Array.from({ length: 10 }).map((_, colIndex) => {
                // Generate color based on position (simulating a heatmap)
                const intensity = Math.min(0.9, 0.2 + (rowIndex * 0.1) + (colIndex * 0.05));
                const opacity = 0.1 + intensity * 0.9;
                
                return (
                  <div 
                    key={`${rowIndex}-${colIndex}`}
                    className="aspect-[4/3] rounded-sm"
                    style={{ 
                      backgroundColor: `rgba(239, 68, 68, ${opacity})`,
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.zIndex = '10';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.zIndex = '1';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                );
              })
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <div>
            <div className="text-sm font-medium">Endpoints</div>
            <div className="text-xs text-slate-500 grid grid-cols-1 gap-1 mt-1">
              <div>Overall Response Rate (ORR)</div>
              <div>Progression-Free Survival (PFS)</div>
              <div>Overall Survival (OS)</div>
              <div>Disease-Free Survival (DFS)</div>
              <div>Patient-Reported Outcome (PRO)</div>
              <div>Quality of Life (QoL)</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">Indications</div>
            <div className="text-xs text-slate-500 grid grid-cols-1 gap-1 mt-1">
              <div>Oncology</div>
              <div>Neurology</div>
              <div>Cardiology</div>
              <div>Immunology</div>
              <div>Infectious Disease</div>
              <div>Rare Disease</div>
              <div>Metabolic Disease</div>
              <div>Respiratory</div>
              <div>Gastrointestinal</div>
              <div>Dermatology</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Top Failing Endpoints</h3>
          <div className="space-y-2">
            {[
              { endpoint: 'Overall Response Rate (ORR)', rate: 0.68 },
              { endpoint: 'Patient-Reported Outcomes (PRO)', rate: 0.64 },
              { endpoint: 'Quality of Life (QoL)', rate: 0.59 },
              { endpoint: 'Disease-Free Survival (DFS)', rate: 0.53 },
              { endpoint: 'Complete Response (CR)', rate: 0.51 },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 p-2 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{item.endpoint}</span>
                  <span className="text-sm font-medium text-red-700">{(item.rate * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-1">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${item.rate * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Most Problematic Indications</h3>
          <div className="space-y-2">
            {[
              { indication: 'Neurology', rate: 0.71 },
              { indication: 'Rare Disease', rate: 0.67 },
              { indication: 'Oncology', rate: 0.62 },
              { indication: 'Immunology', rate: 0.58 },
              { indication: 'Respiratory', rate: 0.52 },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 p-2 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{item.indication}</span>
                  <span className="text-sm font-medium text-red-700">{(item.rate * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-1">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${item.rate * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};