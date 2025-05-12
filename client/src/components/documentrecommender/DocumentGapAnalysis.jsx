import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle2, Info, ArrowRight } from 'lucide-react';

/**
 * DocumentGapAnalysis Component
 * 
 * Displays a comprehensive gap analysis for a document, highlighting missing
 * sections, potential regulatory issues, and recommendations for improvement.
 */
const DocumentGapAnalysis = ({ analysis, onSectionSelect }) => {
  if (!analysis || !analysis.gaps) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Gap analysis data is not available.</p>
      </div>
    );
  }

  // Get gap severity badge variant
  const getSeverityVariant = (severity) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'warning';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Get gap severity icon
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Info className="h-4 w-4" />;
      case 'low':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // Format completeness percentage
  const formatCompleteness = (value) => {
    return Math.round(value * 100);
  };

  // Generate completeness label based on percentage
  const getCompletenessLabel = (value) => {
    const percentage = formatCompleteness(value);
    if (percentage < 25) return 'Critical Gaps';
    if (percentage < 50) return 'Major Gaps';
    if (percentage < 75) return 'Some Gaps';
    if (percentage < 90) return 'Minor Gaps';
    return 'Nearly Complete';
  };

  // Get color class for completeness bar
  const getCompletenessColorClass = (value) => {
    const percentage = formatCompleteness(value);
    if (percentage < 25) return 'text-destructive';
    if (percentage < 50) return 'text-amber-500';
    if (percentage < 75) return 'text-yellow-500';
    if (percentage < 90) return 'text-emerald-500';
    return 'text-emerald-600';
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-sm">Document Completeness</h4>
          <span className={`text-sm font-medium ${getCompletenessColorClass(analysis.completeness)}`}>
            {formatCompleteness(analysis.completeness)}% - {getCompletenessLabel(analysis.completeness)}
          </span>
        </div>
        <Progress 
          value={formatCompleteness(analysis.completeness)} 
          className="h-2"
        />
      </div>
      
      <h4 className="font-medium text-sm">Detected Gaps</h4>
      <ScrollArea className="h-[300px] rounded-md border">
        <div className="p-4 space-y-3">
          {analysis.gaps.length > 0 ? (
            analysis.gaps.map((gap, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Badge 
                          variant={getSeverityVariant(gap.severity)}
                          className="mr-2 flex items-center gap-1"
                        >
                          {getSeverityIcon(gap.severity)}
                          {gap.severity}
                        </Badge>
                        <h5 className="font-medium text-sm">{gap.title}</h5>
                      </div>
                      <p className="text-xs mt-1 text-muted-foreground">{gap.description}</p>
                      
                      {gap.regulatory && (
                        <div className="mt-2 text-xs p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                          <span className="font-medium">Regulatory Impact:</span> {gap.regulatory}
                        </div>
                      )}
                      
                      {gap.recommendation && (
                        <div className="mt-2">
                          <p className="text-xs font-medium">Recommendation:</p>
                          <p className="text-xs">{gap.recommendation}</p>
                        </div>
                      )}
                    </div>
                    
                    {gap.sectionKey && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="ml-2 flex-shrink-0"
                        onClick={() => onSectionSelect(gap.sectionKey)}
                      >
                        Fix Now
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-4 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
              <span className="text-sm">No gaps detected. Your document looks complete!</span>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Recommendations</h4>
          <ul className="text-sm space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <Info className="h-4 w-4 mr-2 text-primary mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DocumentGapAnalysis;