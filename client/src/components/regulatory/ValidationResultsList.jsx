import React, { useState } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  ChevronDown, 
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';

/**
 * Validation Results List Component
 * 
 * Displays validation issues for regulatory submissions with filtering
 * capabilities by severity level.
 */
const ValidationResultsList = ({ 
  validationResults, 
  onItemClick,
  onClearAll
}) => {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [expandedResults, setExpandedResults] = useState({});

  if (!validationResults || validationResults.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md bg-gray-50">
        No validation issues found
      </div>
    );
  }

  const toggleExpanded = (id) => {
    setExpandedResults(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const errorCount = validationResults.filter(result => result.severity === 'error').length;
  const warningCount = validationResults.filter(result => result.severity === 'warning').length;
  const infoCount = validationResults.filter(result => result.severity === 'info').length;

  const filteredResults = severityFilter === 'all' 
    ? validationResults 
    : validationResults.filter(result => result.severity === severityFilter);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500 mr-2" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500 mr-2" />;
      default:
        return <Info className="h-5 w-5 text-blue-500 mr-2" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-amber-200 bg-amber-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="validation-results space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={severityFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setSeverityFilter('all')}
          >
            All ({validationResults.length})
          </Button>
          <Button
            size="sm"
            variant={severityFilter === 'error' ? 'default' : 'outline'}
            className={severityFilter !== 'error' ? 'text-red-600' : ''}
            onClick={() => setSeverityFilter('error')}
          >
            Errors ({errorCount})
          </Button>
          <Button
            size="sm"
            variant={severityFilter === 'warning' ? 'default' : 'outline'}
            className={severityFilter !== 'warning' ? 'text-amber-600' : ''}
            onClick={() => setSeverityFilter('warning')}
          >
            Warnings ({warningCount})
          </Button>
          <Button
            size="sm"
            variant={severityFilter === 'info' ? 'default' : 'outline'}
            className={severityFilter !== 'info' ? 'text-blue-600' : ''}
            onClick={() => setSeverityFilter('info')}
          >
            Info ({infoCount})
          </Button>
        </div>
        
        {onClearAll && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearAll}
          >
            <X className="h-4 w-4 mr-1" /> Clear All
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {filteredResults.map((result) => (
          <Collapsible
            key={result.id}
            open={expandedResults[result.id]}
            onOpenChange={() => toggleExpanded(result.id)}
            className={cn(
              'border rounded-md overflow-hidden',
              getSeverityColor(result.severity)
            )}
          >
            <div className="flex items-start p-3">
              {getSeverityIcon(result.severity)}
              <div className="flex-1">
                <div className="font-medium">{result.validationType}</div>
                <div className="text-sm text-gray-700 line-clamp-1">
                  {result.message}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {result.locationPath && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8"
                    onClick={() => onItemClick?.(result)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Go to location
                  </Button>
                )}
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {expandedResults[result.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
            <CollapsibleContent>
              <div className="border-t p-3 bg-white">
                <div className="text-sm">{result.message}</div>
                {result.locationPath && (
                  <div className="mt-2 text-xs text-gray-500">
                    <strong>Location:</strong> {result.locationPath}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default ValidationResultsList;