import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

export default function RiskPredictorPanel({ riskData }) {
  // If no risk data is available yet, show a placeholder
  if (!riskData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submission Risk Assessment</CardTitle>
          <CardDescription>
            Complete more fields to generate risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <Info className="mr-2 h-5 w-5" />
            <span>Risk prediction will appear as you complete the form</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function to determine risk level color
  const getRiskColor = (riskPercentage) => {
    if (riskPercentage >= 70) return "text-red-600";
    if (riskPercentage >= 40) return "text-amber-600";
    return "text-green-600";
  };

  // Helper function to determine progress bar color
  const getProgressColor = (riskPercentage) => {
    if (riskPercentage >= 70) return "bg-red-600";
    if (riskPercentage >= 40) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
          Submission Risk Assessment
        </CardTitle>
        <CardDescription>
          Real-time analysis of potential regulatory issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Clinical Hold Risk */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Clinical Hold Risk</span>
              <span className={`text-sm font-medium ${getRiskColor(riskData.clinical_hold_risk)}`}>
                {riskData.clinical_hold_risk}%
              </span>
            </div>
            <Progress 
              value={riskData.clinical_hold_risk} 
              className="h-2"
              indicatorClassName={getProgressColor(riskData.clinical_hold_risk)}
            />
          </div>

          {/* Refusal to File Risk */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Refusal to File Risk</span>
              <span className={`text-sm font-medium ${getRiskColor(riskData.refusal_to_file_risk)}`}>
                {riskData.refusal_to_file_risk}%
              </span>
            </div>
            <Progress 
              value={riskData.refusal_to_file_risk} 
              className="h-2"
              indicatorClassName={getProgressColor(riskData.refusal_to_file_risk)}
            />
          </div>

          {/* Information Request Risk */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Information Request Risk</span>
              <span className={`text-sm font-medium ${getRiskColor(riskData.information_request_risk)}`}>
                {riskData.information_request_risk}%
              </span>
            </div>
            <Progress 
              value={riskData.information_request_risk} 
              className="h-2"
              indicatorClassName={getProgressColor(riskData.information_request_risk)}
            />
          </div>

          {/* Key Risk Factors */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Key Risk Factors:</h4>
            <ul className="space-y-2">
              {riskData.key_factors && riskData.key_factors.map((factor, index) => (
                <li key={index} className="flex items-start text-sm">
                  <AlertCircle className="mr-2 h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}