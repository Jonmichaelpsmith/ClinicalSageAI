import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertTriangle, Clock, ChevronRight, Info } from 'lucide-react';

/**
 * CerSectionCard - Represents a section in the Clinical Evaluation Report
 * based on the Master Data Model structure.
 */
export default function CerSectionCard({ 
  title, 
  description, 
  status = 'pending', // 'pending', 'in-progress', 'completed', 'non-compliant'
  compliance = null,  // { score: 0.85, remarks: 'Some issues found...' }
  lastUpdated = null,
  onClick,
  thresholds = {
    OVERALL_THRESHOLD: 0.8, // 80% threshold for passing
    FLAG_THRESHOLD: 0.7     // 70% threshold for warnings/flagging
  }
}) {
  // Format the ISO date string to a readable format
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Get status-based styling
  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 font-medium">
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-blue-100 text-blue-800 font-medium">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'non-compliant':
        return (
          <Badge className="bg-red-100 text-red-800 font-medium">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Non-Compliant
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-500 font-medium">
            Pending
          </Badge>
        );
    }
  };
  
  // Get border styling based on compliance status
  const getBorderStyle = () => {
    if (!compliance) return '';
    
    if (compliance.score < thresholds.FLAG_THRESHOLD) {
      return 'border-red-300';
    } else if (compliance.score < thresholds.OVERALL_THRESHOLD) {
      return 'border-amber-300';
    } else {
      return 'border-green-300';
    }
  };
  
  return (
    <Card 
      className={`transition-all hover:shadow-md ${getBorderStyle()} ${status === 'non-compliant' || (compliance && compliance.score < thresholds.FLAG_THRESHOLD) ? 'bg-red-50' : ''}`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-base">{title}</h3>
            {getStatusBadge()}
          </div>
          
          <p className="text-sm text-gray-500">{description}</p>
          
          {compliance && compliance.score < thresholds.FLAG_THRESHOLD && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-red-600 mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Below {Math.round(thresholds.FLAG_THRESHOLD * 100)}% compliance threshold
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{compliance.remarks}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="py-2 justify-between border-t bg-gray-50">
        {lastUpdated ? (
          <span className="text-xs text-gray-500">Updated {formatDate(lastUpdated)}</span>
        ) : (
          <span className="text-xs text-gray-500">Not started</span>
        )}
        
        <Button variant="ghost" size="sm" className="h-7 px-2">
          <span className="text-xs">Open</span>
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
