import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, AlertCircle, Edit2, Trash2 } from 'lucide-react';

/**
 * CER Section Card Component
 * 
 * Displays a clinical evaluation report section with compliance scoring,
 * following the MASTER DATA MODEL for CERs
 */
export default function CerSectionCard({ 
  section, 
  thresholds,
  onEdit,
  onDelete,
}) {
  // Check if section has compliance issues
  const isCompliant = section.complianceScore >= thresholds.OVERALL_THRESHOLD;
  const hasWarnings = !isCompliant && section.complianceScore >= thresholds.FLAG_THRESHOLD;
  const hasCritical = section.complianceScore < thresholds.FLAG_THRESHOLD;
  
  // Helper function to get category icon for section type
  const getCategoryIcon = (sectionType) => {
    // Icons corresponding to the MASTER DATA MODEL categories
    switch (sectionType) {
      case 'device-profile':
      case 'device-description':
        return '📌';
      case 'technical':
      case 'functional-description':
        return '⚙️';
      case 'preclinical':
      case 'non-clinical':
        return '🔬';
      case 'clinical-data':
      case 'clinical-investigation':
      case 'literature-analysis':
        return '🧪';
      case 'post-market':
      case 'pms-data':
      case 'vigilance':
        return '📈';
      case 'faers':
      case 'safety':
        return '⚠️';
      case 'benefit-risk':
        return '⚖️';
      case 'literature-review':
      case 'literature-appraisal':
        return '📚';
      case 'regulatory':
      case 'compliance-mapping':
        return '📊';
      case 'ai-enhanced':
        return '🧠';
      case 'metadata':
      case 'authorship':
        return '🧾';
      case 'conclusion':
      case 'final-report':
        return '📤';
      default:
        return '📄';
    }
  };
  
  return (
    <Card className={`border-l-4 ${hasCritical ? 'border-l-red-500 bg-red-50/30' : hasWarnings ? 'border-l-amber-500 bg-amber-50/30' : 'border-l-green-500 bg-green-50/30'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{getCategoryIcon(section.type)}</span>
            <div>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>
                {new Date(section.dateAdded).toLocaleDateString()} - Section ID: {section.id.split('-')[1]}
              </CardDescription>
            </div>
          </div>
          <Badge 
            className={`${hasCritical ? 'bg-red-100 text-red-800' : hasWarnings ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}
          >
            {section.complianceScore ? 
              `${Math.round(section.complianceScore * 100)}%` : 
              isCompliant ? 'Compliant' : hasWarnings ? 'Warnings' : 'Issues'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none text-sm">
          <p className="line-clamp-3">{section.content.substring(0, 250)}...</p>
        </div>
        
        {section.complianceIssues && section.complianceIssues.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              {hasCritical ? (
                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
              ) : hasWarnings ? (
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              )}
              Compliance Issues
            </h4>
            <ul className="space-y-1 text-xs">
              {section.complianceIssues.slice(0, 2).map((issue, index) => (
                <li key={index} className={`pl-2 py-1 border-l-2 ${hasCritical ? 'border-l-red-400' : 'border-l-amber-400'}`}>
                  {issue.description}
                </li>
              ))}
              {section.complianceIssues.length > 2 && (
                <li className="text-xs text-muted-foreground italic">
                  +{section.complianceIssues.length - 2} more issues...
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" size="sm" onClick={() => onDelete?.(section.id)}>
          <Trash2 className="h-4 w-4 mr-1" />
          Remove
        </Button>
        <Button size="sm" onClick={() => onEdit?.(section.id)}>
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
