import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

/**
 * FaersRiskBadge Component
 * 
 * Displays a visual representation of the risk assessment score from FDA FAERS data analysis.
 * The badge color and icon change based on the severity level.
 * 
 * @param {Object} props
 * @param {string} props.severity - Risk severity level ('Low', 'Medium', 'High', or undefined)
 * @param {string} props.score - Optional numerical score associated with severity
 * @param {string} props.size - Optional size of badge ('sm', 'md', 'lg')
 * @param {string} props.className - Optional additional CSS classes
 */
const FaersRiskBadge = ({ severity, score, size = 'md', className = '' }) => {
  if (!severity) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              variant="outline" 
              className={`bg-gray-100 text-gray-500 ${getSize(size)} ${className}`}
            >
              <HelpCircle className="mr-1 h-3 w-3" />
              No Data
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>No FDA FAERS risk data available</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Convert severity to lowercase for standardization
  const severityLower = severity.toLowerCase();
  
  // Determine badge styling based on severity
  const badgeStyles = getBadgeStyles(severityLower);
  
  // Get appropriate icon based on severity
  const Icon = getIconForSeverity(severityLower);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            variant="outline" 
            className={`${badgeStyles} ${getSize(size)} ${className}`}
          >
            <Icon className="mr-1 h-3 w-3" />
            {severity} {score ? `(${score})` : ''}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText(severityLower)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Get badge styling based on severity level
 */
function getBadgeStyles(severity) {
  switch (severity) {
    case 'low':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'high':
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

/**
 * Get icon component based on severity level
 */
function getIconForSeverity(severity) {
  switch (severity) {
    case 'low':
      return CheckCircle;
    case 'medium':
      return AlertTriangle;
    case 'high':
      return AlertCircle;
    default:
      return HelpCircle;
  }
}

/**
 * Get tooltip text based on severity level
 */
function getTooltipText(severity) {
  switch (severity) {
    case 'low':
      return 'Low risk profile based on FDA FAERS adverse event data';
    case 'medium':
      return 'Medium risk profile - regular monitoring recommended';
    case 'high':
      return 'High risk profile - careful assessment required';
    default:
      return 'Risk assessment based on FDA FAERS data';
  }
}

/**
 * Get badge size class based on size prop
 */
function getSize(size) {
  switch (size) {
    case 'sm':
      return 'text-xs py-0.5 px-2';
    case 'lg':
      return 'text-base py-1.5 px-3';
    case 'md':
    default:
      return 'text-sm py-1 px-2.5';
  }
}

export default FaersRiskBadge;