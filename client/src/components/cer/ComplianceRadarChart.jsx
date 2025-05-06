import React from 'react';

/**
 * ComplianceRadarChart - A custom implementation of a radar chart for compliance visualization
 * that doesn't rely on external charting libraries
 */
export default function ComplianceRadarChart({
  data = [],
  size = 400,
  thresholdValue = 70,
  enableLegend = true
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-gray-500">No data available for visualization</p>
      </div>
    );
  }
  
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = Math.min(centerX, centerY) * 0.8;
  
  // Number of axes (categories)
  const numAxes = data.length;
  const angleStep = (Math.PI * 2) / numAxes;
  
  // Function to calculate coordinates on the radar chart
  const getCoordinates = (value, index) => {
    const angle = angleStep * index - Math.PI / 2; // Start from top (subtract PI/2)
    const normalizedValue = value / 100; // Assuming max score is 100
    const x = centerX + maxRadius * normalizedValue * Math.cos(angle);
    const y = centerY + maxRadius * normalizedValue * Math.sin(angle);
    return { x, y };
  };
  
  // Generate grid coordinates
  const gridLevels = 4; // Number of concentric circles
  const gridCoordinates = Array.from({ length: gridLevels }, (_, i) => {
    const level = (i + 1) / gridLevels;
    return Array.from({ length: numAxes }, (_, j) => {
      const angle = angleStep * j - Math.PI / 2;
      const x = centerX + maxRadius * level * Math.cos(angle);
      const y = centerY + maxRadius * level * Math.sin(angle);
      return { x, y };
    });
  });
  
  // Generate threshold circle coordinates
  const thresholdCoordinates = Array.from({ length: 60 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 60;
    const normalizedThreshold = thresholdValue / 100;
    const x = centerX + maxRadius * normalizedThreshold * Math.cos(angle);
    const y = centerY + maxRadius * normalizedThreshold * Math.sin(angle);
    return { x, y };
  });
  
  // Calculate the data polygon points
  const dataPoints = data.map((item, index) => getCoordinates(item.score, index));
  const dataPolygonPoints = dataPoints.map(point => `${point.x},${point.y}`).join(' ');
  
  // Generate color based on score compared to threshold
  const getScoreColor = (score) => {
    if (score >= 80) return 'rgb(34, 197, 94)'; // green-500
    if (score >= thresholdValue) return 'rgb(59, 130, 246)'; // blue-500
    if (score >= 50) return 'rgb(234, 179, 8)'; // yellow-500
    return 'rgb(239, 68, 68)'; // red-500
  };
  
  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Axis lines */}
        {Array.from({ length: numAxes }, (_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const endX = centerX + maxRadius * Math.cos(angle);
          const endY = centerY + maxRadius * Math.sin(angle);
          return (
            <line
              key={`axis-${i}`}
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke="#e5e7eb" // gray-200
              strokeWidth="1"
            />
          );
        })}
        
        {/* Grid circles */}
        {gridCoordinates.map((level, levelIndex) => (
          <polygon
            key={`grid-${levelIndex}`}
            points={level.map(point => `${point.x},${point.y}`).join(' ')}
            fill="none"
            stroke="#e5e7eb" // gray-200
            strokeWidth="1"
            strokeLinejoin="round"
          />
        ))}
        
        {/* Threshold circle */}
        <path
          d={`M ${thresholdCoordinates[0].x} ${thresholdCoordinates[0].y} ${thresholdCoordinates
            .map(point => `L ${point.x} ${point.y}`)
            .join(' ')}`}
          fill="none"
          stroke="#fbbf24" // amber-400
          strokeWidth="1.5"
          strokeDasharray="4"
        />
        
        {/* Data polygon */}
        <polygon
          points={dataPolygonPoints}
          fill="rgba(59, 130, 246, 0.2)" // blue-500 with transparency
          stroke="rgb(59, 130, 246)" // blue-500
          strokeWidth="2"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {dataPoints.map((point, i) => (
          <circle
            key={`point-${i}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={getScoreColor(data[i].score)}
            stroke="white"
            strokeWidth="1"
          />
        ))}
        
        {/* Labels */}
        {data.map((item, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const labelRadius = maxRadius + 20; // Position labels outside the chart
          const x = centerX + labelRadius * Math.cos(angle);
          const y = centerY + labelRadius * Math.sin(angle);
          
          // Adjust text anchor based on position
          let textAnchor = 'middle';
          if (angle > -Math.PI / 4 && angle < Math.PI / 4) textAnchor = 'start';
          else if (angle > Math.PI / 4 && angle < 3 * Math.PI / 4) textAnchor = 'start';
          else if (angle > 3 * Math.PI / 4 || angle < -3 * Math.PI / 4) textAnchor = 'middle';
          else textAnchor = 'end';
          
          return (
            <g key={`label-${i}`}>
              <text
                x={x}
                y={y}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="500"
                fill="#374151" // gray-700
              >
                {item.name}
              </text>
              <text
                x={x}
                y={y + 16}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="bold"
                fill={getScoreColor(item.score)}
              >
                {item.score}%
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Legend */}
      {enableLegend && (
        <div className="flex justify-center mt-4 text-sm">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
            <span>Score</span>
          </div>
          <div className="flex items-center mr-4">
            <div className="w-3 h-0.5 bg-amber-400 mr-1"></div>
            <span>Threshold ({thresholdValue}%)</span>
          </div>
        </div>
      )}
    </div>
  );
}