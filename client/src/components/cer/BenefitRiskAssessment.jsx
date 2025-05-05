import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, AlertTriangle, CheckCircle, Scale } from 'lucide-react';

/**
 * Benefit-Risk Assessment Component
 * 
 * Provides a comprehensive benefit-risk analysis following 
 * the Master Data Model section 7 requirements
 */
export default function BenefitRiskAssessment({ 
  benefitRiskData = null,
  thresholds = {
    OVERALL_THRESHOLD: 0.8, // 80% threshold for passing
    FLAG_THRESHOLD: 0.7     // 70% threshold for warnings
  }
}) {
  if (!benefitRiskData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scale className="h-5 w-5 mr-2" />
            Benefit-Risk Assessment
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of benefits, risks, and residual risk acceptability following ISO 14971 standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">
              No benefit-risk assessment data available.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete the clinical evaluation to generate a benefit-risk assessment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const { benefits, risks, residualRisks, acceptabilityMatrix, comparison, riskFileReference } = benefitRiskData;
  
  // Helper to get severity icon based on risk level
  const getSeverityIcon = (level) => {
    if (!level) return null;
    
    switch(level.toLowerCase()) {
      case 'low':
      case 'acceptable':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'medium':
      case 'moderate':
      case 'tolerable':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'high':
      case 'severe':
      case 'unacceptable':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  // Helper to get badge variant based on risk level
  const getBadgeClass = (level) => {
    if (!level) return '';
    
    switch(level.toLowerCase()) {
      case 'low':
      case 'acceptable':
        return 'bg-green-100 text-green-800';
      case 'medium':
      case 'moderate':
      case 'tolerable':
        return 'bg-amber-100 text-amber-800';
      case 'high':
      case 'severe':
      case 'unacceptable':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Scale className="h-5 w-5 mr-2" />
              Benefit-Risk Assessment
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of benefits, risks, and residual risk acceptability following ISO 14971 standards
            </CardDescription>
          </div>
          {riskFileReference && (
            <Badge variant="outline" className="bg-blue-50 text-blue-800">
              Risk File: {riskFileReference}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Benefits Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Clinical Benefits</h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benefit</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Evidence Strength</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benefits?.map((benefit, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{benefit.name}</TableCell>
                    <TableCell>{benefit.description}</TableCell>
                    <TableCell>
                      <Badge className={getBadgeClass(benefit.evidenceStrength)}>
                        {benefit.evidenceStrength}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!benefits || benefits.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                      No benefits have been defined yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Risks Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Known and Foreseeable Risks</h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Probability</TableHead>
                  <TableHead>Mitigation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {risks?.map((risk, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{risk.name}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        {getSeverityIcon(risk.severity)}
                        <span className="ml-1">{risk.severity}</span>
                      </div>
                    </TableCell>
                    <TableCell>{risk.probability}</TableCell>
                    <TableCell>{risk.mitigation}</TableCell>
                  </TableRow>
                ))}
                {(!risks || risks.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      No risks have been defined yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Residual Risks after Mitigation */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Residual Risks after Mitigation</h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk</TableHead>
                  <TableHead>Post-Mitigation Severity</TableHead>
                  <TableHead>Post-Mitigation Probability</TableHead>
                  <TableHead>Acceptability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residualRisks?.map((risk, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{risk.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getSeverityIcon(risk.severity)}
                        <span className="ml-1">{risk.severity}</span>
                      </div>
                    </TableCell>
                    <TableCell>{risk.probability}</TableCell>
                    <TableCell>
                      <Badge className={getBadgeClass(risk.acceptability)}>
                        {risk.acceptability}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!residualRisks || residualRisks.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      No residual risks have been defined yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Risk Acceptability Matrix */}
        {acceptabilityMatrix && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Risk Acceptability Matrix</h3>
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-6 gap-2">
                <div className="col-span-1"></div>
                <div className="col-span-5 grid grid-cols-5 gap-2">
                  <div className="text-center font-medium text-sm">Negligible</div>
                  <div className="text-center font-medium text-sm">Minor</div>
                  <div className="text-center font-medium text-sm">Moderate</div>
                  <div className="text-center font-medium text-sm">Major</div>
                  <div className="text-center font-medium text-sm">Catastrophic</div>
                </div>
                
                {/* Probability rows */}
                {['Frequent', 'Probable', 'Occasional', 'Remote', 'Improbable'].map((prob, probIndex) => (
                  <React.Fragment key={probIndex}>
                    <div className="font-medium text-sm">{prob}</div>
                    {[0, 1, 2, 3, 4].map((sevIndex) => {
                      // Determine the color based on position in the matrix
                      let bgColorClass = 'bg-green-100';
                      if (probIndex <= 1 && sevIndex >= 2) bgColorClass = 'bg-red-100';
                      else if ((probIndex <= 2 && sevIndex >= 3) || (probIndex <= 1 && sevIndex >= 1)) bgColorClass = 'bg-amber-100';
                      
                      return (
                        <div 
                          key={sevIndex} 
                          className={`h-8 ${bgColorClass} border rounded flex items-center justify-center`}
                        >
                          {/* Map residual risks to cells */}
                          {residualRisks?.filter(r => {
                            const riskProb = r.probability.toLowerCase();
                            const riskSev = {
                              'low': 0,
                              'minor': 1,
                              'moderate': 2,
                              'major': 3,
                              'catastrophic': 4
                            }[r.severity.toLowerCase()];
                            
                            const matrixProb = ['frequent', 'probable', 'occasional', 'remote', 'improbable'].indexOf(prob.toLowerCase());
                            
                            return matrixProb === probIndex && riskSev === sevIndex;
                          }).map((risk, idx) => (
                            <span key={idx} className="h-4 w-4 rounded-full bg-white shadow-sm text-xs flex items-center justify-center" title={risk.name}>
                              {idx + 1}
                            </span>
                          ))}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
              
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 mr-1"></div>
                  <span>Acceptable</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-amber-100 mr-1"></div>
                  <span>Tolerable</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-100 mr-1"></div>
                  <span>Unacceptable</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison to Standard of Care */}
        {comparison && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Comparison to Standard of Care</h3>
            <div className="border rounded-lg p-4">
              <p className="text-sm">{comparison}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
