import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, RefreshCw, CheckSquare, AlertTriangle, Check, Info } from 'lucide-react';

// Sample compliance data matching our API response
const sampleComplianceData = {
  success: true,
  progressSummary: {
    overallPercentage: 87,
    steps: {
      total: 12,
      completed: 10, 
      percentage: 83
    },
    validationRules: {
      total: 54,
      implemented: 49,
      percentage: 91
    }
  },
  implementedFeatures: [
    "PDF Generation System",
    "Section Validation",
    "eSTAR Package Builder",
    "Compliance Tracker",
    "Document Format Validator",
    "FDA Template Integration",
    "Predicate Comparison System",
    "Section Ordering",
    "Workflow Integration",
    "Status Reporting"
  ],
  pendingFeatures: [
    "Interactive FDA Review Comments",
    "Auto-correction for Non-compliant Sections"
  ],
  validationIssues: [
    {
      severity: "warning",
      section: "Performance Testing",
      message: "Section contains tables that may not meet FDA formatting requirements"
    },
    {
      severity: "warning",
      section: "Software Documentation",
      message: "Missing recommended cross-references to validation documentation"
    },
    {
      severity: "info",
      section: "General",
      message: "Consider adding more detailed device specifications"
    }
  ],
  lastUpdated: "2025-05-14T14:32:10Z"
};

/**
 * FDA 510k Compliance Status Display Demo
 * 
 * This component shows a demonstration of the FDA compliance status
 * section that appears in the WorkflowEnabledReportGenerator component.
 */
const FDA510kComplianceDemo = () => {
  const [complianceData, setComplianceData] = useState(null);
  const [loadingCompliance, setLoadingCompliance] = useState(true);

  // Simulate loading the compliance data
  useEffect(() => {
    const timer = setTimeout(() => {
      setComplianceData(sampleComplianceData);
      setLoadingCompliance(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-slate-50 pb-2">
        <CardTitle className="text-lg flex items-center">
          <ShieldCheck className="h-5 w-5 text-green-600 mr-2" />
          FDA 510(k) Compliance Status
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white p-4">
        {/* FDA Compliance Status */}
        <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mt-1">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <h3 className="font-medium">FDA Compliance Status</h3>
            {!loadingCompliance && complianceData && (
              <Badge className="ml-auto" variant="outline">
                {complianceData.progressSummary.overallPercentage}% Complete
              </Badge>
            )}
          </div>
          
          {loadingCompliance ? (
            <div className="text-center py-4">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading compliance data...</p>
            </div>
          ) : complianceData ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-sm">Implementation Progress</Label>
                  <span className="text-xs font-medium">{complianceData.progressSummary.steps.percentage}%</span>
                </div>
                <Progress value={complianceData.progressSummary.steps.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {complianceData.progressSummary.steps.completed} of {complianceData.progressSummary.steps.total} steps completed
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-sm">Validation Rules</Label>
                  <span className="text-xs font-medium">{complianceData.progressSummary.validationRules.percentage}%</span>
                </div>
                <Progress value={complianceData.progressSummary.validationRules.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {complianceData.progressSummary.validationRules.implemented} of {complianceData.progressSummary.validationRules.total} rules implemented
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label className="text-sm">Implemented Features</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {complianceData.implementedFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-1.5">
                      <Check className="h-3.5 w-3.5 text-green-600 mt-0.5" />
                      <span className="text-xs">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {complianceData.pendingFeatures.length > 0 && (
                <div className="grid gap-2">
                  <Label className="text-sm">Pending Implementation</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {complianceData.pendingFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-1.5">
                        <div className="h-3.5 w-3.5 rounded-full border border-gray-400 mt-0.5" />
                        <span className="text-xs">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {complianceData.validationIssues.length > 0 && (
                <div className="grid gap-2">
                  <Label className="text-sm">Validation Issues</Label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {complianceData.validationIssues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-1.5 text-xs">
                        {issue.severity === 'warning' ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5" />
                        ) : (
                          <Info className="h-3.5 w-3.5 text-blue-500 mt-0.5" />
                        )}
                        <div>
                          <span className="font-medium">{issue.section}: </span>
                          <span>{issue.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground pt-2 border-t text-right">
                Last updated: {new Date(complianceData.lastUpdated).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Could not load compliance data</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="text-center">
            This is a demonstration of the FDA compliance status section that appears in the WorkflowEnabledReportGenerator component.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FDA510kComplianceDemo;