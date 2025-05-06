import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import ComplianceRadarChart from './ComplianceRadarChart';

const ComplianceScorePanel = ({ onScoresGenerated, thresholds }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [complianceData, setComplianceData] = useState(null);
  
  // Set default thresholds if not provided
  const defaultThresholds = {
    OVERALL_THRESHOLD: 0.80, // 80% threshold for passing
    FLAG_THRESHOLD: 0.70     // 70% threshold for warnings/flagging
  };
  
  const finalThresholds = thresholds || defaultThresholds;
  
  // Generate a compliance assessment report with AI
  const generateComplianceAssessment = () => {
    setIsGenerating(true);
    
    // Simulate API call to AI compliance analysis service
    setTimeout(() => {
      // This would be real data from the API in production
      const mockComplianceData = {
        overallScore: 78,
        criticalIssues: 3,
        standards: {
          euMdr: {
            name: 'EU MDR',
            score: 82,
            issues: [
              { severity: 'low', description: 'Missing device classification justification' },
              { severity: 'medium', description: 'Incomplete post-market surveillance plan' }
            ]
          },
          iso14155: {
            name: 'ISO 14155',
            score: 75,
            issues: [
              { severity: 'high', description: 'Inadequate adverse event reporting process' },
              { severity: 'medium', description: 'Clinical investigation plan lacks detail' }
            ]
          },
          fda21cfr812: {
            name: 'FDA 21 CFR 812',
            score: 83,
            issues: [
              { severity: 'low', description: 'Missing investigator agreements documentation' }
            ]
          },
          meddevGuidance: {
            name: 'MEDDEV 2.7/1',
            score: 71,
            issues: [
              { severity: 'medium', description: 'Literature search methodology not comprehensive' },
              { severity: 'high', description: 'Insufficient clinical evidence for intended use' }
            ]
          },
        },
        recommendations: [
          'Enhance the post-market surveillance plan with specific protocols',
          'Provide detailed methodology for adverse event reporting',
          'Expand literature search to include more recent studies',
          'Include complete device classification with justification'
        ]
      };
      
      setComplianceData(mockComplianceData);
      setIsGenerating(false);
      
      if (typeof onScoresGenerated === 'function') {
        onScoresGenerated(mockComplianceData);
      }
    }, 2000);
  };
  
  // Determine badge color based on score
  const getBadgeColor = (score) => {
    if (score >= finalThresholds.OVERALL_THRESHOLD * 100) return 'bg-green-100 text-green-800';
    if (score >= finalThresholds.FLAG_THRESHOLD * 100) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };
  
  // Get icon based on severity
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500 mr-1.5" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-amber-500 mr-1.5" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 text-blue-500 mr-1.5" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Compliance Assessment</h2>
          <p className="text-sm text-gray-500 mt-1">
            Automated analysis against regulatory standards and guidelines
          </p>
        </div>
        
        {!complianceData && (
          <Button 
            onClick={generateComplianceAssessment}
            disabled={isGenerating}
            className="text-xs h-8"
          >
            {isGenerating ? 'Analyzing...' : 'Generate Compliance Report'}
          </Button>
        )}
        
        {complianceData && (
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-3">Compliance Score:</span>
            <Badge className={`text-xs ${getBadgeColor(complianceData.overallScore)}`}>
              {complianceData.overallScore}%
            </Badge>
          </div>
        )}
      </div>
      
      {isGenerating && (
        <div className="bg-gray-50 border rounded-md p-8 text-center space-y-3">
          <div className="animate-pulse">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-200"></div>
            <div className="mt-4 h-4 w-1/3 mx-auto rounded bg-gray-200"></div>
            <div className="mt-2 h-4 w-1/2 mx-auto rounded bg-gray-200"></div>
          </div>
          <p className="text-sm text-gray-500">
            Analyzing CER against regulatory standards...
          </p>
        </div>
      )}
      
      {!isGenerating && !complianceData && (
        <div className="bg-gray-50 border rounded-md p-8 text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100">
            <AlertCircle className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-2 text-sm font-medium">No Compliance Assessment</h3>
          <p className="mt-1 text-sm text-gray-500">
            Click the button above to generate an AI-powered compliance assessment for your Clinical Evaluation Report.
          </p>
        </div>
      )}
      
      {!isGenerating && complianceData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-4 border">
              <h3 className="text-sm font-medium mb-4">Overall Compliance Score</h3>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">Overall Report Score</span>
                <Badge className={`text-xs ${getBadgeColor(complianceData.overallScore)}`}>
                  {complianceData.overallScore}%
                </Badge>
              </div>
              
              <div className="mb-4">
                <Progress 
                  value={complianceData.overallScore} 
                  className="h-2" 
                  indicatorClassName={complianceData.overallScore >= finalThresholds.OVERALL_THRESHOLD * 100 ? 'bg-green-500' : 
                                   complianceData.overallScore >= finalThresholds.FLAG_THRESHOLD * 100 ? 'bg-amber-500' : 
                                   'bg-red-500'} 
                />
                
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-red-500 mr-1.5"></div>
                  <span>Below {finalThresholds.FLAG_THRESHOLD * 100}% - Critical Issues</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-amber-500 mr-1.5"></div>
                  <span>{finalThresholds.FLAG_THRESHOLD * 100}% to {finalThresholds.OVERALL_THRESHOLD * 100}% - Needs Improvement</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-1.5"></div>
                  <span>Above {finalThresholds.OVERALL_THRESHOLD * 100}% - Compliant</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border">
              <h3 className="text-sm font-medium mb-4">Standards Compliance</h3>
              
              <div className="h-48">
                <ComplianceRadarChart 
                  data={Object.values(complianceData.standards).map(standard => ({
                    name: standard.name,
                    score: standard.score
                  }))}
                  thresholdValue={finalThresholds.FLAG_THRESHOLD * 100}
                />
              </div>
            </Card>
          </div>
          
          <Card className="p-4 border">
            <h3 className="text-sm font-medium mb-4">Compliance Issues</h3>
            
            <div className="space-y-4">
              {Object.values(complianceData.standards).map((standard, idx) => (
                <div key={idx} className="border-t pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{standard.name}</span>
                    <Badge className={`text-xs ${getBadgeColor(standard.score)}`}>
                      {standard.score}%
                    </Badge>
                  </div>
                  
                  <ul className="space-y-2">
                    {standard.issues.map((issue, issueIdx) => (
                      <li key={issueIdx} className="flex items-start text-xs">
                        {getSeverityIcon(issue.severity)}
                        <span>{issue.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="p-4 border">
            <h3 className="text-sm font-medium mb-4">Recommendations</h3>
            
            <ul className="space-y-2">
              {complianceData.recommendations.map((recommendation, idx) => (
                <li key={idx} className="flex items-start text-xs">
                  <ArrowRight className="h-3.5 w-3.5 text-blue-500 mr-1.5 flex-shrink-0 mt-0.5" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </Card>
          
          <div className="flex justify-end">
            <Button size="sm" className="text-xs h-7">
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              Export Compliance Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceScorePanel;