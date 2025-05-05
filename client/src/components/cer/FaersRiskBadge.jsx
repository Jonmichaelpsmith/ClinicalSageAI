import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * FAERS Risk Badge Component
 * 
 * Displays a visual representation of risk level from FAERS data
 */
export function FaersRiskBadge({ riskLevel, score, compact = false }) {
  const levelInfo = {
    low: {
      icon: <CheckCircle className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />,
      color: 'bg-green-100 text-green-800 hover:bg-green-200',
      description: 'Low risk level based on FAERS adverse event reports'
    },
    medium: {
      icon: <AlertTriangle className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />,
      color: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
      description: 'Medium risk level based on FAERS adverse event reports'
    },
    high: {
      icon: <AlertCircle className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />,
      color: 'bg-red-100 text-red-800 hover:bg-red-200',
      description: 'High risk level based on FAERS adverse event reports'
    }
  };

  // Default to medium if level not found
  const level = riskLevel ? riskLevel.toLowerCase() : 'medium';
  const { icon, color, description } = levelInfo[level] || levelInfo.medium;
  
  // Format risk level for display
  const formattedLevel = level.charAt(0).toUpperCase() + level.slice(1);
  
  // Determine badge size class
  const sizeClass = compact ? 'text-xs py-0 px-2 font-normal' : 'text-sm';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${color} ${sizeClass} flex items-center`}>
            {icon}
            {formattedLevel} {score !== undefined && !compact && `(${score.toFixed(2)})`}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
          {score !== undefined && (
            <p className="text-xs mt-1">Calculated risk score: {score.toFixed(2)}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
