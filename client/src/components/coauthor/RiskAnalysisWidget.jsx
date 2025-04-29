import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Shield, AlertCircle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function RiskAnalysisWidget({ sectionId }) {
  // This would typically fetch from '/api/regulatory/risk/' + sectionId
  const riskAnalysis = {
    complianceScore: 76,
    risks: [
      {
        id: 'risk-1',
        severity: 'high',
        description: 'Missing safety endpoint analysis',
        recommendation: 'Add safety analysis with statistical significance'
      },
      {
        id: 'risk-2',
        severity: 'medium',
        description: 'Incomplete sub-population analysis',
        recommendation: 'Include stratified analysis for age groups'
      },
      {
        id: 'risk-3',
        severity: 'low',
        description: 'References outdated (pre-2020)',
        recommendation: 'Update references to include recent publications'
      }
    ]
  };
  
  // Helper to map severity to icons and colors
  const severityMap = {
    high: { 
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    medium: { 
      icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700'
    },
    low: { 
      icon: <Info className="h-4 w-4 text-blue-500" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    }
  };
  
  // Get color for compliance score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-md flex items-center">
          <Shield className="h-4 w-4 mr-2 text-blue-600" />
          Regulatory Risk Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Compliance Score</span>
            <span className={`text-sm font-bold ${getScoreColor(riskAnalysis.complianceScore)}`}>
              {riskAnalysis.complianceScore}%
            </span>
          </div>
          <Progress 
            value={riskAnalysis.complianceScore} 
            className="h-2"
          />
        </div>
        
        <h4 className="text-sm font-medium mb-2">Identified Risks</h4>
        <div className="space-y-3">
          {riskAnalysis.risks.map(risk => (
            <div 
              key={risk.id}
              className={`p-3 rounded-md ${severityMap[risk.severity].bgColor}`}
            >
              <div className="flex items-start gap-2">
                {severityMap[risk.severity].icon}
                <div>
                  <h5 className={`text-sm font-medium ${severityMap[risk.severity].textColor}`}>
                    {risk.description}
                  </h5>
                  <p className="text-xs mt-1 text-gray-600">
                    {risk.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {riskAnalysis.risks.length === 0 && (
          <div className="flex items-center justify-center p-4 text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>No risks detected</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}