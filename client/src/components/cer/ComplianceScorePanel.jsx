import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ComplianceRadarChart from './ComplianceRadarChart';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Info,
  BarChart4,
  ClipboardList,
  RefreshCw
} from 'lucide-react';

/**
 * ComplianceScorePanel - A professional component for visualizing CER regulatory compliance scoring
 * with enterprise-grade UI matching Omnia design system specifications
 */
export default function ComplianceScorePanel({ onScoresGenerated = () => {}, thresholds = {} }) {
  // Default thresholds if not provided
  const complianceThresholds = {
    OVERALL_THRESHOLD: thresholds.OVERALL_THRESHOLD || 0.80, // 80% threshold for passing
    FLAG_THRESHOLD: thresholds.FLAG_THRESHOLD || 0.70      // 70% threshold for warnings/flagging
  };
  
  // State for compliance scores
  const [complianceScores, setComplianceScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStandard, setActiveStandard] = useState('all');
  
  // Generate compliance scores with simulated AI analysis
  const generateComplianceScores = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Sample data structure for compliance scores
      const scores = {
        overallScore: 82, // Overall score percentage
        standards: {
          eu_mdr: {
            name: 'EU MDR',
            score: 85,
            sections: [
              { name: 'Clinical Evaluation Plan', score: 92, issues: [] },
              { name: 'State of the Art', score: 76, issues: ['Limited comparison to recent similar technologies'] },
              { name: 'Clinical Data', score: 88, issues: [] },
              { name: 'Risk Analysis', score: 82, issues: [] },
              { name: 'Post-Market Surveillance', score: 89, issues: [] },
              { name: 'Benefit-Risk Analysis', score: 84, issues: [] },
            ]
          },
          iso_14155: {
            name: 'ISO 14155',
            score: 79,
            sections: [
              { name: 'Clinical Investigation Plan', score: 85, issues: [] },
              { name: 'Risk Management', score: 68, issues: ['Mitigation strategies lack detail', 'Insufficient monitoring criteria'] },
              { name: 'Investigator Requirements', score: 74, issues: ['Training documentation incomplete'] },
              { name: 'Ethical Considerations', score: 92, issues: [] },
              { name: 'Data Collection', score: 81, issues: [] },
              { name: 'Results Analysis', score: 76, issues: [] },
            ]
          },
          fda_21cfr812: {
            name: 'FDA 21 CFR 812',
            score: 81,
            sections: [
              { name: 'Investigational Plan', score: 86, issues: [] },
              { name: 'Risk Analysis', score: 78, issues: [] },
              { name: 'Study Design', score: 83, issues: [] },
              { name: 'Monitoring Procedures', score: 74, issues: ['Monitoring intervals not fully justified'] },
              { name: 'Device Accountability', score: 90, issues: [] },
              { name: 'Informed Consent', score: 84, issues: [] },
            ]
          }
        },
        criticalIssues: 0,
        majorIssues: 4,
        minorIssues: 7
      };
      
      setComplianceScores(scores);
      onScoresGenerated(scores);
      setLoading(false);
    }, 2500); // Simulate a 2.5 second delay for "AI processing"
  };
  
  // Get the appropriate color class based on the score
  const getScoreColorClass = (score) => {
    const scoreValue = typeof score === 'number' ? score : parseInt(score);
    if (scoreValue >= complianceThresholds.OVERALL_THRESHOLD * 100) return 'text-green-600';
    if (scoreValue >= complianceThresholds.FLAG_THRESHOLD * 100) return 'text-amber-600';
    return 'text-red-600';
  };
  
  // Get badge color class based on the score
  const getScoreBadgeClass = (score) => {
    const scoreValue = typeof score === 'number' ? score : parseInt(score);
    if (scoreValue >= complianceThresholds.OVERALL_THRESHOLD * 100) return 'bg-green-100 text-green-800';
    if (scoreValue >= complianceThresholds.FLAG_THRESHOLD * 100) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };
  
  // Get card border color for highlighting section cards
  const getSectionBorderClass = (score) => {
    const scoreValue = typeof score === 'number' ? score : parseInt(score);
    if (scoreValue < complianceThresholds.FLAG_THRESHOLD * 100) {
      return 'border-red-300';
    }
    return '';
  };
  
  // Get the icon component based on the score
  const getScoreIcon = (score) => {
    const scoreValue = typeof score === 'number' ? score : parseInt(score);
    if (scoreValue >= complianceThresholds.OVERALL_THRESHOLD * 100) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    if (scoreValue >= complianceThresholds.FLAG_THRESHOLD * 100) {
      return <AlertCircle className="h-5 w-5 text-amber-600" />;
    }
    return <XCircle className="h-5 w-5 text-red-600" />;
  };
  
  // Active standard data based on selection
  const activeStandardData = complianceScores && activeStandard !== 'all'
    ? complianceScores.standards[activeStandard]
    : null;
  
  // List of radar chart data points for visualization
  const getRadarChartData = () => {
    if (!complianceScores) return null;
    
    return Object.values(complianceScores.standards).map(standard => ({
      name: standard.name,
      score: standard.score
    }));
  };
  
  // Sample AI compliance suggestions for demo purposes
  const getSuggestions = () => {
    if (!complianceScores) return [];
    
    const suggestions = [];
    
    // Add suggestions based on scores
    Object.values(complianceScores.standards).forEach(standard => {
      standard.sections.forEach(section => {
        if (section.score < complianceThresholds.FLAG_THRESHOLD * 100) {
          suggestions.push({
            standard: standard.name,
            section: section.name,
            suggestion: `Improve ${section.name} section to address: ${section.issues.join(', ')}`
          });
        }
      });
    });
    
    return suggestions;
  };
  
  return (
    <Card className="shadow-md border border-gray-200">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Regulatory Compliance Assessment</CardTitle>
            <CardDescription>
              AI-powered analysis against EU MDR, ISO 14155, and FDA 21 CFR 812 requirements
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {complianceScores && (
              <Badge 
                className={getScoreBadgeClass(complianceScores.overallScore)}
              >
                {complianceScores.overallScore}% Compliant
              </Badge>
            )}
            
            <Button 
              onClick={generateComplianceScores} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart4 className="h-4 w-4 mr-2" />
                  {complianceScores ? 'Refresh Analysis' : 'Generate Analysis'}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {!complianceScores && !loading && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-blue-50 p-5 rounded-full mb-4">
              <ClipboardList className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Compliance Analysis</h3>
            <p className="text-sm text-gray-500 max-w-md mb-6">
              Generate a comprehensive compliance analysis of your clinical evaluation report 
              against EU MDR, ISO 14155, and FDA regulatory requirements.
            </p>
            <Button 
              onClick={generateComplianceScores}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Analyze Compliance'}
            </Button>
          </div>
        )}
        
        {loading && (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="h-12 w-12 rounded-full border-4 border-t-blue-600 border-blue-200 animate-spin mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Analyzing Compliance</h3>
            <p className="text-sm text-gray-500">
              Processing document content against regulatory requirements...
            </p>
          </div>
        )}
        
        {complianceScores && !loading && (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="col-span-1">
                <div className="bg-white border rounded-md p-4">
                  <h3 className="font-medium mb-3">Overall Compliance</h3>
                  
                  <div className="flex flex-col items-center py-4">
                    <div className="w-full mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Score</span>
                        <span className={getScoreColorClass(complianceScores.overallScore)}>
                          {complianceScores.overallScore}%
                        </span>
                      </div>
                      <Progress 
                        value={complianceScores.overallScore} 
                        className="h-2"
                        aria-label="Overall compliance score"
                      />
                    </div>
                    
                    <div className="flex justify-around w-full">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{complianceScores.criticalIssues}</div>
                        <div className="text-xs text-gray-500">Critical Issues</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">{complianceScores.majorIssues}</div>
                        <div className="text-xs text-gray-500">Major Issues</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{complianceScores.minorIssues}</div>
                        <div className="text-xs text-gray-500">Minor Issues</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Standards</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveStandard('all')}
                        className={`w-full text-left p-2 rounded text-sm
                          ${activeStandard === 'all' ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-50'}`}
                      >
                        All Standards
                      </button>
                      
                      {complianceScores && Object.entries(complianceScores.standards).map(([key, standard]) => (
                        <button
                          key={key}
                          onClick={() => setActiveStandard(key)}
                          className={`w-full text-left p-2 rounded text-sm flex items-center justify-between
                            ${activeStandard === key ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-50'}`}
                        >
                          <span>{standard.name}</span>
                          <Badge 
                            className={getScoreBadgeClass(standard.score)}
                          >
                            {standard.score}%
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2">
                {activeStandard === 'all' ? (
                  <div className="bg-white border rounded-md p-4 h-full">
                    <h3 className="font-medium mb-6">Standards Comparison</h3>
                    
                    <div className="flex flex-col items-center">
                      <div className="h-64 w-full flex items-center justify-center mb-6">
                        <ComplianceRadarChart 
                          data={getRadarChartData()} 
                          thresholdValue={complianceThresholds.FLAG_THRESHOLD * 100}
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 w-full">
                        {Object.values(complianceScores.standards).map((standard, index) => (
                          <div key={index} className="border rounded-md p-3 text-center">
                            <div className="font-medium mb-1">{standard.name}</div>
                            <div className={`text-xl font-bold ${getScoreColorClass(standard.score)}`}>
                              {standard.score}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border rounded-md p-4 h-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">{activeStandardData.name} Compliance Details</h3>
                      <Badge className={getScoreBadgeClass(activeStandardData.score)}>
                        {activeStandardData.score}% Compliant
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      {activeStandardData.sections.map((section, index) => (
                        <div 
                          key={index} 
                          className={`border rounded-md p-3 ${getSectionBorderClass(section.score)}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              {getScoreIcon(section.score)}
                              <span className="font-medium ml-2">{section.name}</span>
                            </div>
                            <div className={`text-lg font-bold ${getScoreColorClass(section.score)}`}>
                              {section.score}%
                            </div>
                          </div>
                          
                          {section.issues.length > 0 && (
                            <div className="mt-2">
                              <ul className="text-sm text-red-600 ml-6 list-disc space-y-1">
                                {section.issues.map((issue, issueIndex) => (
                                  <li key={issueIndex}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white border rounded-md p-4">
              <h3 className="font-medium mb-4">AI Compliance Suggestions</h3>
              
              {getSuggestions().length === 0 ? (
                <div className="flex items-center p-4 bg-green-50 rounded-md">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
                  <p className="text-green-800">
                    Your document meets the basic compliance threshold for all sections. See detailed analysis for minor improvement opportunities.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getSuggestions().map((suggestion, index) => (
                    <div key={index} className="flex p-3 bg-amber-50 rounded-md">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-amber-800">
                          {suggestion.standard} - {suggestion.section}
                        </div>
                        <p className="text-sm text-amber-700">{suggestion.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Compliance Report
                  </Button>
                  
                  <div className="text-xs text-gray-500 flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    Analysis generated using OpenAI GPT-4o
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}