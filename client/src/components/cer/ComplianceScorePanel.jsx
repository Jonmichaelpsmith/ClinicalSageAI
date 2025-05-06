import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, AlertCircle, Loader2, Check } from 'lucide-react';
import ComplianceRadarChart from './ComplianceRadarChart';

const ComplianceScorePanel = ({ onScoresGenerated, thresholds = { OVERALL_THRESHOLD: 0.80, FLAG_THRESHOLD: 0.70 } }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [complianceScores, setComplianceScores] = useState(null);
  const [selectedTab, setSelectedTab] = useState('euMdr');
  const [standards, setStandards] = useState({
    euMdr: true,
    iso14155: true,
    fda21cfr812: true,
    meddev: false,
    ghtf: false,
    ukMdr: false
  });
  
  // Generate compliance scores
  const generateComplianceScores = () => {
    setIsAnalyzing(true);
    
    // Simulate API call to analyze compliance
    setTimeout(() => {
      // Mock compliance score data
      const mockScores = {
        overallScore: 78, // out of 100
        criticalIssues: 3,
        majorIssues: 5,
        minorIssues: 8,
        standards: {
          euMdr: {
            name: 'EU MDR',
            score: 82,
            issues: [
              { id: 1, type: 'critical', description: 'Missing clinical evaluation methodology', section: 'Section 4.2' },
              { id: 2, type: 'minor', description: 'Inadequate description of state of the art', section: 'Section 2.1' },
            ]
          },
          iso14155: {
            name: 'ISO 14155',
            score: 75,
            issues: [
              { id: 3, type: 'major', description: 'Incomplete adverse event reporting criteria', section: 'Section 6.3' },
              { id: 4, type: 'major', description: 'Statistical analysis approach not fully defined', section: 'Section 7.1' },
            ]
          },
          fda21cfr812: {
            name: 'FDA 21 CFR 812',
            score: 68,
            issues: [
              { id: 5, type: 'critical', description: 'Significant risk determination missing justification', section: 'Section 3.2' },
              { id: 6, type: 'critical', description: 'Informed consent documentation incomplete', section: 'Appendix B' },
              { id: 7, type: 'minor', description: 'IRB approval documentation not correctly formatted', section: 'Appendix C' },
            ]
          },
          meddev: {
            name: 'MEDDEV 2.7/1',
            score: 88,
            issues: [
              { id: 8, type: 'minor', description: 'PMS plan details insufficient', section: 'Section 8.1' },
            ]
          }
        }
      };
      
      setComplianceScores(mockScores);
      setIsAnalyzing(false);
      
      // Callback to parent
      if (onScoresGenerated) {
        onScoresGenerated(mockScores);
      }
    }, 3000);
  };
  
  // Get badge for issue type
  const getIssueBadge = (type) => {
    switch(type) {
      case 'critical':
        return (
          <Badge className="bg-red-100 text-red-800 text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Critical
          </Badge>
        );
      case 'major':
        return (
          <Badge className="bg-amber-100 text-amber-800 text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Major
          </Badge>
        );
      case 'minor':
        return (
          <Badge className="bg-blue-100 text-blue-800 text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Minor
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // Get color for score
  const getScoreColor = (score) => {
    if (score >= thresholds.OVERALL_THRESHOLD * 100) {
      return 'text-green-600';
    } else if (score >= thresholds.FLAG_THRESHOLD * 100) {
      return 'text-amber-600';
    } else {
      return 'text-red-600';
    }
  };
  
  // Get progress bar color for score
  const getProgressColor = (score) => {
    if (score >= thresholds.OVERALL_THRESHOLD * 100) {
      return 'bg-green-600';
    } else if (score >= thresholds.FLAG_THRESHOLD * 100) {
      return 'bg-amber-500';
    } else {
      return 'bg-red-500';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Regulatory Compliance Assessment</h2>
          <p className="text-sm text-gray-500 mt-1">
            Verify compliance with relevant standards and regulations
          </p>
        </div>
        
        {!complianceScores && (
          <Button 
            onClick={generateComplianceScores} 
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Start Compliance Analysis
              </>
            )}
          </Button>
        )}
        
        {complianceScores && (
          <div className="flex items-center">
            <span className="text-sm mr-2">Overall Score:</span>
            <Badge 
              className={`${complianceScores.overallScore >= thresholds.OVERALL_THRESHOLD * 100 ? 'bg-green-100 text-green-800' : 
                        complianceScores.overallScore >= thresholds.FLAG_THRESHOLD * 100 ? 'bg-amber-100 text-amber-800' : 
                        'bg-red-100 text-red-800'} text-sm font-medium`}
            >
              {complianceScores.overallScore}%
            </Badge>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={generateComplianceScores}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Re-analyzing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Re-run Analysis
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      
      {/* Standards selection */}
      <div className="bg-gray-50 border rounded-md p-4">
        <h3 className="text-sm font-medium mb-3">Standards for Compliance Analysis</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox 
                id="euMdr" 
                checked={standards.euMdr}
                onCheckedChange={(checked) => setStandards({...standards, euMdr: checked})}
                className="mr-2"
              />
              <Label htmlFor="euMdr">EU MDR (2017/745)</Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="iso14155" 
                checked={standards.iso14155}
                onCheckedChange={(checked) => setStandards({...standards, iso14155: checked})}
                className="mr-2"
              />
              <Label htmlFor="iso14155">ISO 14155:2020</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox 
                id="fda21cfr812" 
                checked={standards.fda21cfr812}
                onCheckedChange={(checked) => setStandards({...standards, fda21cfr812: checked})}
                className="mr-2"
              />
              <Label htmlFor="fda21cfr812">FDA 21 CFR 812</Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="meddev" 
                checked={standards.meddev}
                onCheckedChange={(checked) => setStandards({...standards, meddev: checked})}
                className="mr-2"
              />
              <Label htmlFor="meddev">MEDDEV 2.7/1 Rev.4</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox 
                id="ghtf" 
                checked={standards.ghtf}
                onCheckedChange={(checked) => setStandards({...standards, ghtf: checked})}
                className="mr-2"
              />
              <Label htmlFor="ghtf">GHTF SG5</Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="ukMdr" 
                checked={standards.ukMdr}
                onCheckedChange={(checked) => setStandards({...standards, ukMdr: checked})}
                className="mr-2"
              />
              <Label htmlFor="ukMdr">UK MDR 2002</Label>
            </div>
          </div>
        </div>
      </div>
      
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <h3 className="text-lg font-medium mb-2">Analyzing Document Compliance</h3>
          <p className="text-sm text-gray-500">
            AI is analyzing your CER against selected standards. This may take a moment...
          </p>
        </div>
      )}
      
      {!isAnalyzing && complianceScores && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="p-4 shadow-sm">
              <div className="flex flex-col">
                <h3 className="text-sm font-medium mb-2">Document Compliance</h3>
                <div className="flex items-end mb-2">
                  <div className={`text-3xl font-bold ${getScoreColor(complianceScores.overallScore)}`}>
                    {complianceScores.overallScore}%
                  </div>
                  <div className="text-sm text-gray-500 ml-2 mb-1">
                    Overall Score
                  </div>
                </div>
                <Progress 
                  value={complianceScores.overallScore} 
                  className="h-2" 
                  indicatorClassName={getProgressColor(complianceScores.overallScore)}
                />
                <div className="text-xs text-gray-500 mt-2">
                  Score reflects compliance with selected standards
                </div>
              </div>
            </Card>
            
            <Card className="p-4 shadow-sm">
              <div className="flex flex-col">
                <h3 className="text-sm font-medium mb-2">Issues Summary</h3>
                <div className="flex space-x-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 mb-1">
                      {complianceScores.criticalIssues}
                    </div>
                    <div className="text-xs text-gray-500">Critical</div>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 mb-1">
                      {complianceScores.majorIssues}
                    </div>
                    <div className="text-xs text-gray-500">Major</div>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mb-1">
                      {complianceScores.minorIssues}
                    </div>
                    <div className="text-xs text-gray-500">Minor</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-4">
                  {complianceScores.criticalIssues > 0 ? 
                    "Critical issues must be addressed before submission" : 
                    "No critical issues detected"}
                </div>
              </div>
            </Card>
            
            <Card className="p-4 shadow-sm">
              <div className="flex flex-col">
                <h3 className="text-sm font-medium mb-3">Standard Scores</h3>
                <div className="space-y-3">
                  {Object.values(complianceScores.standards).map((standard, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{standard.name}</span>
                        <span className={getScoreColor(standard.score)}>{standard.score}%</span>
                      </div>
                      <Progress 
                        value={standard.score} 
                        className="h-1.5" 
                        indicatorClassName={getProgressColor(standard.score)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
          
          {/* Compliance Radar Chart */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1">
              <Card className="p-4 shadow-sm">
                <h3 className="text-sm font-medium mb-4">Compliance Visualization</h3>
                <div className="h-64">
                  <ComplianceRadarChart 
                    data={Object.values(complianceScores.standards).map(standard => ({
                      name: standard.name,
                      score: standard.score
                    }))}
                    thresholdValue={thresholds.FLAG_THRESHOLD * 100}
                  />
                </div>
              </Card>
            </div>
            
            <div className="col-span-2">
              <Card className="p-4 shadow-sm">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">Compliance Issues</h3>
                    <TabsList className="bg-gray-100 h-7 p-0.5">
                      {Object.keys(complianceScores.standards).map(key => (
                        complianceScores.standards[key].issues.length > 0 && (
                          <TabsTrigger 
                            key={key}
                            value={key}
                            className="h-6 px-2 text-xs"
                          >
                            {complianceScores.standards[key].name}
                            <Badge 
                              className={`ml-1.5 ${getScoreColor(complianceScores.standards[key].score)} bg-opacity-20 text-xs px-1.5 py-0`}
                            >
                              {complianceScores.standards[key].issues.length}
                            </Badge>
                          </TabsTrigger>
                        )
                      ))}
                    </TabsList>
                  </div>
                  
                  {Object.keys(complianceScores.standards).map(key => (
                    <TabsContent key={key} value={key} className="m-0">
                      <div className="divide-y">
                        {complianceScores.standards[key].issues.map(issue => (
                          <div key={issue.id} className="py-3 first:pt-0 last:pb-0">
                            <div className="flex justify-between">
                              <div className="flex items-center">
                                {getIssueBadge(issue.type)}
                                <span className="ml-2 text-sm font-medium">{issue.description}</span>
                              </div>
                              <span className="text-xs text-gray-500">{issue.section}</span>
                            </div>
                            <div className="mt-2 flex justify-end">
                              <Button variant="link" size="sm" className="text-xs p-0 h-auto">
                                <Check className="h-3 w-3 mr-1" />
                                Fix Issue
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {complianceScores.standards[key].issues.length === 0 && (
                          <div className="py-6 text-center">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                              No compliance issues found for {complianceScores.standards[key].name}.
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline">
              Export Compliance Report
            </Button>
            
            <Button variant="destructive" size="sm" className="text-xs">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              Auto-Fix Critical Issues
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceScorePanel;