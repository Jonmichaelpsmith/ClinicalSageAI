import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle, HelpCircle, Lightbulb, Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

/**
 * BenefitRiskAssessment - Component for displaying benefit-risk assessment information
 * Implements section 7 of the CER Master Data Model
 */
export default function BenefitRiskAssessment({ 
  benefitRiskData,
  complianceThresholds = {
    OVERALL_THRESHOLD: 0.8, // 80% threshold for passing
    FLAG_THRESHOLD: 0.7     // 70% threshold for warnings/flagging
  },
  readOnly = false
}) {
  // If no data is provided, show placeholder/empty state
  if (!benefitRiskData || !benefitRiskData.benefits || !benefitRiskData.risks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Benefit-Risk Assessment</CardTitle>
          <CardDescription>
            Structured assessment of benefits versus risks per ISO 14971
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <ShieldAlert className="h-10 w-10 text-amber-500 mb-3" />
          <h3 className="text-lg font-medium">No Benefit-Risk Data Available</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            A comprehensive benefit-risk assessment is required for your Clinical Evaluation Report.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Get risk acceptability color based on matrix
  const getRiskAcceptabilityColor = (acceptability) => {
    if (!acceptability) return 'text-gray-500';
    
    switch (acceptability.toLowerCase()) {
      case 'acceptable':
        return 'text-green-600';
      case 'acceptable with mitigation':
      case 'needs mitigation':
        return 'text-amber-600';
      case 'unacceptable':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };
  
  // Get risk acceptability badge
  const getRiskAcceptabilityBadge = (acceptability) => {
    if (!acceptability) return null;
    
    switch (acceptability.toLowerCase()) {
      case 'acceptable':
        return (
          <Badge className="bg-green-100 text-green-800 font-medium">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Acceptable
          </Badge>
        );
      case 'acceptable with mitigation':
      case 'needs mitigation':
        return (
          <Badge className="bg-amber-100 text-amber-800 font-medium">
            <Shield className="h-3 w-3 mr-1" />
            With Mitigation
          </Badge>
        );
      case 'unacceptable':
        return (
          <Badge className="bg-red-100 text-red-800 font-medium">
            <ShieldX className="h-3 w-3 mr-1" />
            Unacceptable
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Not Assessed
          </Badge>
        );
    }
  };
  
  // Calculate benefit-risk ratio
  const calculateBenefitRiskRatio = () => {
    const totalBenefitScore = benefitRiskData.benefits.reduce((sum, benefit) => sum + benefit.score, 0);
    const totalRiskScore = benefitRiskData.risks.reduce((sum, risk) => sum + risk.score, 0);
    
    if (totalRiskScore === 0) return 'N/A';
    return (totalBenefitScore / totalRiskScore).toFixed(2);
  };
  
  return (
    <Card className="border-indigo-200">
      <CardHeader className="bg-indigo-50 border-b border-indigo-100">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Benefit-Risk Assessment</CardTitle>
            <CardDescription>
              Based on ISO 14971 Risk Management and EU MDR Annex I requirements
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Overall Assessment:</span>
            {getRiskAcceptabilityBadge(benefitRiskData.overallAcceptability)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Summary Section */}
        <div className="bg-gray-50 border rounded-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Benefit-Risk Ratio</div>
              <div className="text-2xl font-bold text-indigo-600">{calculateBenefitRiskRatio()}</div>
              <div className="text-xs text-gray-500">Benefit score / Risk score</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium">Risk Management File</div>
              <div className="text-base font-medium">{benefitRiskData.riskManagementFileReference || 'N/A'}</div>
              <div className="text-xs text-gray-500">ISO 14971 compliance</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium">Risk Analysis Method</div>
              <div className="text-base font-medium">{benefitRiskData.riskAnalysisMethodology || 'N/A'}</div>
              <div className="text-xs text-gray-500">e.g., FMEA, FTA, HAZOP</div>
            </div>
          </div>
        </div>
        
        {/* Benefits Table */}
        <div>
          <h3 className="font-medium text-base mb-3 flex items-center">
            <Lightbulb className="h-4 w-4 mr-2 text-indigo-500" />
            Clinical Benefits
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Benefit</TableHead>
                <TableHead>Evidence Level</TableHead>
                <TableHead>Strength</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benefitRiskData.benefits.map((benefit, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{benefit.name}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            <Badge variant="outline" className="bg-blue-50 text-blue-800 font-medium">
                              {benefit.evidenceLevel || 'Unknown'}
                            </Badge>
                            <HelpCircle className="h-3.5 w-3.5 ml-1 text-gray-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">
                            Evidence Levels: High (Multiple well-designed clinical studies), 
                            Moderate (Limited clinical data), Low (Theoretical or bench data only)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Progress value={benefit.score * 20} className="h-1.5 w-20 mr-2" />
                        <span>{benefit.score}/5</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{benefit.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Risks Table */}
        <div>
          <h3 className="font-medium text-base mb-3 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
            Identified Risks
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Risk</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Mitigation</TableHead>
                <TableHead>Acceptability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benefitRiskData.risks.map((risk, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{risk.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={risk.severity.toLowerCase() === 'high' ? 'bg-red-50 text-red-800' : 
                      risk.severity.toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'}
                    >
                      {risk.severity || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={risk.probability.toLowerCase() === 'high' ? 'bg-red-50 text-red-800' : 
                      risk.probability.toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'}
                    >
                      {risk.probability || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>{risk.score}/5</TableCell>
                  <TableCell className="text-sm">{risk.mitigation || 'None'}</TableCell>
                  <TableCell>
                    <span className={getRiskAcceptabilityColor(risk.acceptability)}>
                      {risk.acceptability || 'Not assessed'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Comparison to Standard of Care */}
        {benefitRiskData.standardOfCareComparison && (
          <div className="border rounded-md p-4">
            <h3 className="font-medium text-base mb-3 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Comparison to Standard of Care
            </h3>
            <div className="prose prose-sm max-w-none">
              <p>{benefitRiskData.standardOfCareComparison}</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t p-4">
        <div className="w-full flex flex-col space-y-2">
          <div className="text-sm font-medium">Conclusion</div>
          <div className="text-sm">
            {benefitRiskData.conclusion || 'No conclusion has been provided for this benefit-risk assessment.'}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
