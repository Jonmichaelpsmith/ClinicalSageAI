import React from 'react';

/**
 * Component for showing risk level as a color-coded badge with optional tooltip
 * 
 * @param {Object} props - Component props
 * @param {number} props.riskScore - Risk score (typically 0-3 range)
 * @param {string} props.size - Badge size (sm, md, lg)
 * @param {boolean} props.showLabel - Whether to show the risk level label
 * @param {boolean} props.showTooltip - Whether to show a tooltip on hover
 * @returns {JSX.Element} - Rendered component
 */
const FaersRiskBadge = ({ riskScore, size = 'md', showLabel = true, showTooltip = false }) => {
  const riskLevel = getRiskLevel(riskScore);
  const bgColor = getRiskColor(riskLevel);
  
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-6 w-6 text-sm',
    lg: 'h-8 w-8 text-base'
  };
  
  // Get the appropriate size class
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  // Generate tooltip content
  const tooltipContent = `Risk Score: ${riskScore.toFixed(2)} - ${riskLevel} Risk`;
  
  return (
    <div className="flex items-center">
      <div 
        className={`rounded-full flex items-center justify-center ${sizeClass} ${bgColor}`}
        title={showTooltip ? tooltipContent : undefined}
      >
        {size !== 'sm' && (
          <span className="text-white font-bold">
            {riskScore < 10 ? riskScore.toFixed(1) : Math.round(riskScore)}
          </span>
        )}
      </div>
      
      {showLabel && (
        <span className="ml-2 text-sm font-medium">{riskLevel}</span>
      )}
    </div>
  );
};

/**
 * Determine risk level based on risk score
 * 
 * @param {number} score - Risk score
 * @returns {string} - Risk level label
 */
function getRiskLevel(score) {
  if (score < 0.5) return 'Low';
  if (score < 1.0) return 'Medium';
  if (score < 1.5) return 'High';
  return 'Very High';
}

/**
 * Get the appropriate background color class based on risk level
 * 
 * @param {string} riskLevel - Risk level (Low, Medium, High, Very High)
 * @returns {string} - CSS class for background color
 */
function getRiskColor(riskLevel) {
  switch (riskLevel) {
    case 'Low':
      return 'bg-green-500';
    case 'Medium':
      return 'bg-yellow-500';
    case 'High':
      return 'bg-orange-500';
    case 'Very High':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export default FaersRiskBadge;
