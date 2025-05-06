import React, { useEffect, useRef } from 'react';

const ComplianceRadarChart = ({ data, thresholdValue = 70, enableLegend = true }) => {
  const canvasRef = useRef(null);
  
  // Draw radar chart on canvas
  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size with proper device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Configuration
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.8;
    const numPoints = data.length;
    const angleStep = (2 * Math.PI) / numPoints;
    
    // Draw circular guides
    const guideRadii = [0.25, 0.5, 0.75, 1.0];
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);
    
    guideRadii.forEach(ratio => {
      const radius = maxRadius * ratio;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#e5e7eb'; // Light gray
      ctx.stroke();
      
      // Add percentage labels
      if (enableLegend) {
        ctx.fillStyle = '#6b7280'; // Text color
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(ratio * 100)}%`, centerX, centerY - radius - 3);
      }
    });
    
    // Draw axis lines
    ctx.setLineDash([]);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#d1d5db';
    
    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep - Math.PI / 2; // Start from top
      const endX = centerX + maxRadius * Math.cos(angle);
      const endY = centerY + maxRadius * Math.sin(angle);
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Add labels for each axis
      if (enableLegend) {
        const labelX = centerX + (maxRadius + 10) * Math.cos(angle);
        const labelY = centerY + (maxRadius + 10) * Math.sin(angle);
        
        ctx.fillStyle = '#000';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(data[i].name, labelX, labelY);
      }
    }
    
    // Draw threshold circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * (thresholdValue / 100), 0, 2 * Math.PI);
    ctx.strokeStyle = '#f59e0b'; // Amber for threshold
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw data points and connect them
    const points = data.map((item, i) => {
      const angle = i * angleStep - Math.PI / 2; // Start from top
      const radius = maxRadius * (item.score / 100);
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        score: item.score
      };
    });
    
    // Fill the radar area
    ctx.beginPath();
    points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)'; // Light blue fill
    ctx.fill();
    
    // Draw the radar outline
    ctx.beginPath();
    points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3b82f6'; // Blue outline
    ctx.stroke();
    
    // Draw points
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      
      // Color based on threshold
      if (point.score >= thresholdValue) {
        ctx.fillStyle = '#10b981'; // Green for good
      } else {
        ctx.fillStyle = '#ef4444'; // Red for below threshold
      }
      
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    });
    
  }, [data, thresholdValue, enableLegend]);
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {data && data.length > 0 ? (
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <div className="text-center text-gray-500 text-sm">
          No compliance data available
        </div>
      )}
    </div>
  );
};

export default ComplianceRadarChart;