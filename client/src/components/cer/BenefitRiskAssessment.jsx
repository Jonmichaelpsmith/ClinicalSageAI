import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  FileCheck, 
  Shield, 
  AlertTriangle, 
  Check, 
  X, 
  Download, 
  Plus,
  ChevronDown,
  BarChart4,
  Scale,
  FileText
} from 'lucide-react';

/**
 * BenefitRiskAssessment - Professional component for visualizing and managing benefit-risk
 * assessments for CER reports, matching the Omnia design system
 */
export default function BenefitRiskAssessment() {
  const [activeTab, setActiveTab] = useState('summary');
  
  // Sample data for demo
  const assessmentData = {
    deviceName: 'CardioStent XR',
    version: '1.2',
    summary: {
      benefitRiskRatio: 4.2, // > 1 means benefits outweigh risks
      overallRating: 'Favorable',
      regulatoryStatus: 'Compliant',
      reviewDate: '2025-05-06',
      nextReviewDate: '2026-05-06',
      benefits: [
        { name: 'Improved patient outcomes', rating: 'High', score: 87, clinicalEvidence: 'Strong' },
        { name: 'Reduced procedure time', rating: 'Medium', score: 72, clinicalEvidence: 'Moderate' },
        { name: 'Decreased complication rate', rating: 'High', score: 85, clinicalEvidence: 'Strong' },
        { name: 'Extended device longevity', rating: 'Medium', score: 76, clinicalEvidence: 'Moderate' }
      ],
      risks: [
        { name: 'Infection risk', rating: 'Low', score: 32, mitigationMeasures: 'Comprehensive' },
        { name: 'Device migration', rating: 'Low', score: 25, mitigationMeasures: 'Comprehensive' },
        { name: 'Thrombosis', rating: 'Medium', score: 56, mitigationMeasures: 'Adequate' },
        { name: 'Allergic reaction', rating: 'Very Low', score: 12, mitigationMeasures: 'Comprehensive' }
      ],
      uncertainties: [
        { name: 'Long-term performance beyond 10 years', impact: 'Medium', mitigationPlan: 'Extended follow-up study' },
        { name: 'Performance in pediatric populations', impact: 'Low', mitigationPlan: 'Additional clinical investigation' }
      ]
    },
    benefitAnalysis: {
      clinicalOutcomes: [
        { outcome: 'Increased procedure success rate', value: '+12.5%', evidence: 'Strong', source: 'Multicenter RCT' },
        { outcome: 'Reduced reoperation rate', value: '-8.3%', evidence: 'Strong', source: 'Multicenter RCT' },
        { outcome: 'Improved quality of life scores', value: '+18.7%', evidence: 'Moderate', source: 'Post-market surveillance' },
        { outcome: 'Shortened recovery time', value: '-2.4 days', evidence: 'Strong', source: 'Comparative study' },
      ],
      comparisonData: [
        { metric: 'Primary success rate', thisDev: '94.2%', predicate: '85.7%', difference: '+8.5%' },
        { metric: 'Complication rate', thisDev: '3.2%', predicate: '7.5%', difference: '-4.3%' },
        { metric: 'Reoperation need at 1 year', thisDev: '2.1%', predicate: '8.4%', difference: '-6.3%' },
        { metric: 'Patient satisfaction', thisDev: '91.3%', predicate: '82.5%', difference: '+8.8%' },
      ]
    },
    riskAnalysis: {
      knownRisks: [
        { risk: 'Infection', frequency: '2.1%', severity: 'Moderate', trend: 'Stable', mitigationEffectiveness: 'High' },
        { risk: 'Device migration', frequency: '1.5%', severity: 'Moderate', trend: 'Decreasing', mitigationEffectiveness: 'High' },
        { risk: 'Thrombosis', frequency: '3.2%', severity: 'Serious', trend: 'Stable', mitigationEffectiveness: 'Medium' },
        { risk: 'Allergic reaction', frequency: '0.8%', severity: 'Mild', trend: 'Stable', mitigationEffectiveness: 'High' },
      ],
      emergingRisks: [
        { risk: 'Material degradation at >5 years', status: 'Under Investigation', potentialImpact: 'Medium', action: 'Extended surveillance study initiated' },
      ],
      riskCategories: {
        critical: 0,
        high: 1,
        medium: 2,
        low: 5,
        negligible: 4
      }
    },
    evaluationHistory: [
      { version: '1.2', date: '2025-05-06', outcome: 'Favorable', reviewer: 'Dr. Sarah Johnson', changes: 'Updated with latest clinical data' },
      { version: '1.1', date: '2024-11-12', outcome: 'Favorable', reviewer: 'Dr. James Wilson', changes: 'Added emerging risk assessment' },
      { version: '1.0', date: '2024-05-28', outcome: 'Favorable', reviewer: 'Dr. Elizabeth Chen', changes: 'Initial assessment' },
    ]
  };
  
  // Get color based on rating
  const getRatingColor = (rating) => {
    switch(rating.toLowerCase()) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-amber-100 text-amber-800';
      case 'very low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get color based on evidence
  const getEvidenceColor = (evidence) => {
    switch(evidence.toLowerCase()) {
      case 'strong':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-blue-100 text-blue-800';
      case 'limited':
        return 'bg-amber-100 text-amber-800';
      case 'insufficient':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get color based on mitigation
  const getMitigationColor = (mitigation) => {
    switch(mitigation.toLowerCase()) {
      case 'comprehensive':
        return 'bg-green-100 text-green-800';
      case 'adequate':
        return 'bg-blue-100 text-blue-800';
      case 'partial':
        return 'bg-amber-100 text-amber-800';
      case 'limited':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get color for difference values (positive is good)
  const getDifferenceColor = (value, metric = '') => {
    if (value.startsWith('+')) return 'text-green-600';
    if (value.startsWith('-')) {
      // For complication-related metrics, negative is good
      if (metric.toLowerCase().includes('complication') || 
          metric.toLowerCase().includes('reoperation')) {
        return 'text-green-600';
      }
      return 'text-red-600';
    }
    return 'text-gray-900';
  };
  
  // Get color for benefit-risk ratio
  const getBRRatioColor = (ratio) => {
    if (ratio >= 4) return 'text-green-600';
    if (ratio >= 2) return 'text-blue-600';
    if (ratio >= 1) return 'text-amber-600';
    return 'text-red-600';
  };
  
  // Get color for overall rating
  const getOverallRatingColor = (rating) => {
    switch(rating.toLowerCase()) {
      case 'favorable':
        return 'bg-green-100 text-green-800';
      case 'moderately favorable':
        return 'bg-blue-100 text-blue-800';
      case 'neutral':
        return 'bg-amber-100 text-amber-800';
      case 'unfavorable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card className="shadow-md border border-gray-200">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Benefit-Risk Assessment</CardTitle>
            <CardDescription>
              Comprehensive evaluation of clinical benefits and risks for {assessmentData.deviceName}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getOverallRatingColor(assessmentData.summary.overallRating)}>
              {assessmentData.summary.overallRating}
            </Badge>
            
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export Assessment
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-100 w-full justify-start rounded-none px-6 h-12">
            <TabsTrigger value="summary" className="data-[state=active]:bg-white">
              Summary
            </TabsTrigger>
            <TabsTrigger value="benefits" className="data-[state=active]:bg-white">
              Benefits
            </TabsTrigger>
            <TabsTrigger value="risks" className="data-[state=active]:bg-white">
              Risks
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white">
              History
            </TabsTrigger>
          </TabsList>
          
          <div className="p-6">
            {/* Summary Tab */}
            <TabsContent value="summary" className="m-0">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1">
                  <div className="bg-white border rounded-md p-4 mb-6">
                    <h3 className="font-medium mb-3">Assessment Overview</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Device Name</span>
                        <span className="font-medium">{assessmentData.deviceName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Version</span>
                        <span className="font-medium">{assessmentData.version}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Review Date</span>
                        <span className="font-medium">{assessmentData.summary.reviewDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Next Review</span>
                        <span className="font-medium">{assessmentData.summary.nextReviewDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Regulatory Status</span>
                        <Badge variant="outline" className="font-normal">
                          {assessmentData.summary.regulatoryStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-md p-4">
                    <h3 className="font-medium mb-3">Benefit-Risk Ratio</h3>
                    <div className="flex flex-col items-center justify-center pt-4 pb-6">
                      <div className="relative w-36 h-36 flex items-center justify-center mb-4 rounded-full border-8 border-blue-100">
                        <div className={`text-3xl font-bold ${getBRRatioColor(assessmentData.summary.benefitRiskRatio)}`}>
                          {assessmentData.summary.benefitRiskRatio}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <Scale className="inline-block h-4 w-4 mr-1 mb-1" />
                        B:R Ratio
                      </div>
                    </div>
                    
                    <div className="pt-2 text-center border-t text-sm">
                      <div className="text-gray-500 mb-1">Assessment</div>
                      <Badge className={getOverallRatingColor(assessmentData.summary.overallRating)}>
                        {assessmentData.summary.overallRating}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <div className="bg-white border rounded-md p-4 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Key Benefits</h3>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Benefit
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {assessmentData.summary.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <div className="font-medium">{benefit.name}</div>
                            <div className="flex items-center mt-1 space-x-2">
                              <Badge className={getRatingColor(benefit.rating)}>
                                {benefit.rating}
                              </Badge>
                              <Badge className={getEvidenceColor(benefit.clinicalEvidence)}>
                                {benefit.clinicalEvidence} Evidence
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{benefit.score}</div>
                            <div className="text-xs text-gray-500">Benefit Score</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-md p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Key Risks</h3>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Risk
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {assessmentData.summary.risks.map((risk, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <div className="font-medium">{risk.name}</div>
                            <div className="flex items-center mt-1 space-x-2">
                              <Badge className={getRatingColor(risk.rating)}>
                                {risk.rating}
                              </Badge>
                              <Badge className={getMitigationColor(risk.mitigationMeasures)}>
                                {risk.mitigationMeasures} Mitigation
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-amber-600">{risk.score}</div>
                            <div className="text-xs text-gray-500">Risk Score</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border rounded-md p-4 mt-6">
                <h3 className="font-medium mb-4">Uncertainties & Data Gaps</h3>
                
                {assessmentData.summary.uncertainties.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No outstanding uncertainties or data gaps identified.
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Uncertainty</TableHead>
                          <TableHead>Impact</TableHead>
                          <TableHead>Mitigation Plan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assessmentData.summary.uncertainties.map((uncertainty, index) => (
                          <TableRow key={index}>
                            <TableCell>{uncertainty.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{uncertainty.impact}</Badge>
                            </TableCell>
                            <TableCell>{uncertainty.mitigationPlan}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Benefits Tab */}
            <TabsContent value="benefits" className="m-0">
              <div className="bg-white border rounded-md p-4 mb-6">
                <h3 className="font-medium mb-4">Clinical Outcomes</h3>
                
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Clinical Outcome</TableHead>
                        <TableHead>Improvement</TableHead>
                        <TableHead>Evidence Quality</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessmentData.benefitAnalysis.clinicalOutcomes.map((outcome, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{outcome.outcome}</TableCell>
                          <TableCell className="text-green-600 font-medium">{outcome.value}</TableCell>
                          <TableCell>
                            <Badge className={getEvidenceColor(outcome.evidence)}>
                              {outcome.evidence}
                            </Badge>
                          </TableCell>
                          <TableCell>{outcome.source}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="bg-white border rounded-md p-4">
                <h3 className="font-medium mb-4">Comparison to Predicate Device</h3>
                
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>{assessmentData.deviceName}</TableHead>
                        <TableHead>Predicate Device</TableHead>
                        <TableHead>Difference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessmentData.benefitAnalysis.comparisonData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.metric}</TableCell>
                          <TableCell>{item.thisDev}</TableCell>
                          <TableCell>{item.predicate}</TableCell>
                          <TableCell className={getDifferenceColor(item.difference, item.metric)}>
                            <strong>{item.difference}</strong>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
            
            {/* Risks Tab */}
            <TabsContent value="risks" className="m-0">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white border rounded-md p-4 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-red-600">
                    {assessmentData.riskAnalysis.riskCategories.critical}
                  </div>
                  <div className="text-sm text-gray-500">Critical</div>
                </div>
                
                <div className="bg-white border rounded-md p-4 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-amber-600">
                    {assessmentData.riskAnalysis.riskCategories.high}
                  </div>
                  <div className="text-sm text-gray-500">High</div>
                </div>
                
                <div className="bg-white border rounded-md p-4 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {assessmentData.riskAnalysis.riskCategories.medium}
                  </div>
                  <div className="text-sm text-gray-500">Medium</div>
                </div>
                
                <div className="bg-white border rounded-md p-4 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {assessmentData.riskAnalysis.riskCategories.low}
                  </div>
                  <div className="text-sm text-gray-500">Low</div>
                </div>
              </div>
              
              <div className="bg-white border rounded-md p-4 mb-6">
                <h3 className="font-medium mb-4">Known Risks</h3>
                
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Risk</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Mitigation Effectiveness</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessmentData.riskAnalysis.knownRisks.map((risk, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{risk.risk}</TableCell>
                          <TableCell>{risk.frequency}</TableCell>
                          <TableCell>
                            <Badge 
                              className={risk.severity === 'Serious' ? 'bg-red-100 text-red-800' : 
                                       risk.severity === 'Moderate' ? 'bg-amber-100 text-amber-800' : 
                                       'bg-blue-100 text-blue-800'}
                            >
                              {risk.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {risk.trend}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={risk.mitigationEffectiveness === 'High' ? 'bg-green-100 text-green-800' : 
                                       risk.mitigationEffectiveness === 'Medium' ? 'bg-blue-100 text-blue-800' : 
                                       'bg-amber-100 text-amber-800'}
                            >
                              {risk.mitigationEffectiveness}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="bg-white border rounded-md p-4">
                <h3 className="font-medium mb-4">Emerging Risks</h3>
                
                {assessmentData.riskAnalysis.emergingRisks.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No emerging risks identified.
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Risk</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Potential Impact</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assessmentData.riskAnalysis.emergingRisks.map((risk, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{risk.risk}</TableCell>
                            <TableCell>
                              <Badge className="bg-amber-100 text-amber-800">
                                {risk.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{risk.potentialImpact}</TableCell>
                            <TableCell>{risk.action}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* History Tab */}
            <TabsContent value="history" className="m-0">
              <div className="bg-white border rounded-md p-4">
                <h3 className="font-medium mb-4">Assessment History</h3>
                
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Outcome</TableHead>
                        <TableHead>Reviewer</TableHead>
                        <TableHead>Changes</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessmentData.evaluationHistory.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>{record.version}</TableCell>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>
                            <Badge className={getOverallRatingColor(record.outcome)}>
                              {record.outcome}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.reviewer}</TableCell>
                          <TableCell>{record.changes}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}