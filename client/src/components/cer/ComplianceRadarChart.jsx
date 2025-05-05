import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

/**
 * Compliance Radar Chart Component
 * 
 * Displays a radar chart of compliance scores across different regulatory frameworks
 * specified in the Master Data Model (EU MDR, ISO 14155, FDA 21 CFR 812)
 */
export default function ComplianceRadarChart({ complianceData, isLoading = false }) {
  const noData = !complianceData || !complianceData.regulatoryScores;
  
  // Calculate radar chart coordinates based on regulatory scores
  const calculateRadarCoordinates = (scores) => {
    // Define the number of vertices (regulatory frameworks)
    const sides = Object.keys(scores).length;
    if (sides === 0) return [];
    
    // Calculate the angle between each vertex
    const angleStep = (Math.PI * 2) / sides;
    
    // Calculate the coordinates for each vertex
    return Object.entries(scores).map(([framework, score], index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from the top (270 degrees)
      const radius = score * 100; // Convert from 0-1 to percentage
      const x = 100 + (radius * Math.cos(angle));
      const y = 100 + (radius * Math.sin(angle));
      
      return { framework, score, x, y };
    });
  };
  
  // Generate SVG polygon points for the radar chart
  const getPolygonPoints = (coordinates) => {
    if (coordinates.length < 3) return '';
    return coordinates.map(coord => `${coord.x},${coord.y}`).join(' ');
  };
  
  // Generate label positions for each regulatory framework
  const getLabelPosition = (index, total) => {
    const angleStep = (Math.PI * 2) / total;
    const angle = index * angleStep - Math.PI / 2; // Start from the top
    const x = 100 + (130 * Math.cos(angle)); // 130 is slightly outside the radius
    const y = 100 + (130 * Math.sin(angle));
    
    return { x, y };
  };
  
  // Default regulatory frameworks to display if data is missing
  const defaultFrameworks = [
    { name: 'EU MDR', score: 0 },
    { name: 'ISO 14155', score: 0 },
    { name: 'FDA 21 CFR 812', score: 0 },
    { name: 'MEDDEV 2.7/1', score: 0 },
    { name: 'GSPRs', score: 0 }
  ];
  
  // Prepare data for rendering
  const regulatoryScores = noData ? 
    {} : 
    complianceData.regulatoryScores;
    
  const coordinates = noData ? 
    [] : 
    calculateRadarCoordinates(regulatoryScores);
  
  const polygonPoints = getPolygonPoints(coordinates);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Regulatory Compliance Map</CardTitle>
        <CardDescription>
          Compliance against key regulatory frameworks (EU MDR, ISO 14155, FDA 21 CFR 812)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : noData ? (
          <div className="flex flex-col justify-center items-center h-64 text-center">
            <p className="text-muted-foreground">
              No compliance data available.
              <br />
              Run compliance analysis to see your scores.
            </p>
          </div>
        ) : (
          <div className="relative h-72 w-full">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Background circles */}
              <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="1" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="#e5e7eb" strokeWidth="1" />
              <circle cx="100" cy="100" r="40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
              <circle cx="100" cy="100" r="20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
              
              {/* Axes */}
              {defaultFrameworks.map((_, index) => {
                const angleStep = (Math.PI * 2) / defaultFrameworks.length;
                const angle = index * angleStep - Math.PI / 2; // Start from the top
                const x2 = 100 + (100 * Math.cos(angle));
                const y2 = 100 + (100 * Math.sin(angle));
                
                return (
                  <line 
                    key={index}
                    x1="100" 
                    y1="100" 
                    x2={x2} 
                    y2={y2} 
                    stroke="#e5e7eb" 
                    strokeWidth="1"
                  />
                );
              })}
              
              {/* Data polygon */}
              {coordinates.length >= 3 && (
                <polygon 
                  points={polygonPoints} 
                  fill="rgba(59, 130, 246, 0.3)" 
                  stroke="rgb(59, 130, 246)" 
                  strokeWidth="2"
                />
              )}
              
              {/* Data points */}
              {coordinates.map((coord, index) => (
                <circle 
                  key={index}
                  cx={coord.x} 
                  cy={coord.y} 
                  r="4" 
                  fill="rgb(59, 130, 246)"
                />
              ))}
              
              {/* Framework labels */}
              {defaultFrameworks.map((framework, index) => {
                const position = getLabelPosition(index, defaultFrameworks.length);
                const score = regulatoryScores[framework.name] || 0;
                const scoreDisplay = Math.round(score * 100);
                
                // Adjust text-anchor based on position
                let textAnchor = "middle";
                if (position.x < 90) textAnchor = "end";
                if (position.x > 110) textAnchor = "start";
                
                return (
                  <g key={index}>
                    <text 
                      x={position.x} 
                      y={position.y} 
                      fontSize="8" 
                      fontWeight="bold"
                      textAnchor={textAnchor}
                      fill="currentColor"
                    >
                      {framework.name}
                    </text>
                    <text 
                      x={position.x} 
                      y={position.y + 10} 
                      fontSize="7"
                      textAnchor={textAnchor}
                      fill="currentColor"
                      className={scoreDisplay >= 80 ? 'text-green-600' : scoreDisplay >= 70 ? 'text-amber-600' : 'text-red-600'}
                    >
                      {scoreDisplay}%
                    </text>
                  </g>
                );
              })}
              
              {/* Center label */}
              <text 
                x="100" 
                y="100" 
                fontSize="10" 
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
              >
                {Math.round(complianceData.overallScore * 100)}%
              </text>
              <text 
                x="100" 
                y="110" 
                fontSize="7"
                textAnchor="middle"
                fill="currentColor"
              >
                Overall
              </text>
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
