import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, AlertTriangle, ShieldCheck, ChevronRight, FileText, XCircle, Zap } from 'lucide-react';

export default function RiskAnalysisWidget({ sectionId }) {
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('regulatory');

  // Generate risk analysis data based on section ID
  const getRiskData = (section) => {
    return {
      regulatory: [
        {
          id: 'risk-1',
          category: 'Clinical Compliance',
          severity: 'medium',
          description: 'Efficacy data presentation may not meet ICH E3 requirements for integrated summary.',
          recommendation: 'Include additional statistical analysis tables comparing treatment groups across all studies.'
        },
        {
          id: 'risk-2',
          category: 'Consistency',
          severity: 'high',
          description: 'Discrepancy found between adverse event data in this section versus Module 5 reports.',
          recommendation: 'Reconcile adverse event counts across all document sections before submission.'
        },
        {
          id: 'risk-3',
          category: 'Data Integrity',
          severity: 'low',
          description: 'Some patient demographic information contains minor inconsistencies in age groupings.',
          recommendation: 'Standardize age group categorization across clinical documentation.'
        }
      ],
      content: [
        {
          id: 'content-1',
          category: 'Completeness',
          severity: 'medium',
          description: 'Missing discussion of dose-response relationship in special populations.',
          recommendation: 'Add analysis of dose adjustments needed for geriatric and hepatic impairment populations.'
        },
        {
          id: 'content-2',
          category: 'Scientific Justification',
          severity: 'low',
          description: 'Limited discussion of mechanism of action related to observed adverse events.',
          recommendation: 'Expand scientific rationale connecting pharmacology to safety findings.'
        }
      ],
      formatting: [
        {
          id: 'format-1',
          category: 'eCTD Structure',
          severity: 'low',
          description: 'Some cross-references to Module 5 lack hyperlink functionality.',
          recommendation: 'Update cross-references using proper eCTD linking format.'
        },
        {
          id: 'format-2',
          category: 'Readability',
          severity: 'medium',
          description: 'Tables exceed recommended width for PDF display in review systems.',
          recommendation: 'Reformat wide tables to ensure proper display in regulatory review tools.'
        }
      ]
    };
  };
  
  const riskData = getRiskData(sectionId);
  const activeRisks = riskData[activeTab] || [];
  
  // Count risks by severity
  const countBySeverity = (risks) => {
    return risks.reduce((counts, risk) => {
      counts[risk.severity] = (counts[risk.severity] || 0) + 1;
      return counts;
    }, {});
  };
  
  const getSeverityColor = (severity) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-amber-500',
      low: 'text-green-600'
    };
    return colors[severity] || 'text-gray-500';
  };
  
  const getSeverityBgColor = (severity) => {
    const colors = {
      high: 'bg-red-50 border-red-100',
      medium: 'bg-amber-50 border-amber-100',
      low: 'bg-green-50 border-green-100'
    };
    return colors[severity] || 'bg-gray-50 border-gray-100';
  };
  
  const totalRisks = Object.values(riskData).reduce((sum, risks) => sum + risks.length, 0);
  const regulatoryCounts = countBySeverity(riskData.regulatory);
  const contentCounts = countBySeverity(riskData.content);
  const formattingCounts = countBySeverity(riskData.formatting);
  
  return (
    <Card className="shadow-sm overflow-hidden">
      <div 
        className="flex items-center justify-between bg-blue-50 p-3 border-b cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-blue-800">Risk Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
            {totalRisks} findings
          </span>
          <ChevronDown 
            className={`h-5 w-5 text-blue-600 transition-transform ${expanded ? 'transform rotate-180' : ''}`} 
          />
        </div>
      </div>
      
      {expanded && (
        <CardContent className="p-0">
          <div className="grid grid-cols-3 border-b text-sm">
            <Button
              variant="ghost"
              className={`rounded-none h-10 border-b-2 ${activeTab === 'regulatory' ? 'border-blue-600 text-blue-800 font-medium' : 'border-transparent text-gray-500'}`}
              onClick={() => setActiveTab('regulatory')}
            >
              Regulatory
              {regulatoryCounts.high > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                  {regulatoryCounts.high}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              className={`rounded-none h-10 border-b-2 ${activeTab === 'content' ? 'border-blue-600 text-blue-800 font-medium' : 'border-transparent text-gray-500'}`}
              onClick={() => setActiveTab('content')}
            >
              Content
              {contentCounts.high > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                  {contentCounts.high}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              className={`rounded-none h-10 border-b-2 ${activeTab === 'formatting' ? 'border-blue-600 text-blue-800 font-medium' : 'border-transparent text-gray-500'}`}
              onClick={() => setActiveTab('formatting')}
            >
              Formatting
              {formattingCounts.high > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                  {formattingCounts.high}
                </span>
              )}
            </Button>
          </div>
          
          <ScrollArea className="h-[240px]">
            <div className="p-3 space-y-3">
              {activeRisks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <ShieldCheck className="h-10 w-10 text-green-500 mb-2" />
                  <p className="text-sm text-gray-500">No issues found in this category</p>
                </div>
              ) : (
                activeRisks.map((risk) => (
                  <div 
                    key={risk.id} 
                    className={`rounded-md border p-3 ${getSeverityBgColor(risk.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <div 
                            className={`uppercase text-xs font-semibold ${getSeverityColor(risk.severity)}`}
                          >
                            {risk.severity} risk
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs text-gray-600">{risk.category}</span>
                        </div>
                        
                        <p className="text-sm mt-1 text-gray-800">
                          {risk.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                      <div className="flex items-center">
                        <Zap className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
                        <span className="text-xs text-blue-700 font-medium">Recommendation:</span>
                      </div>
                      <p className="text-xs mt-1 text-gray-700">
                        {risk.recommendation}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 mt-2 text-xs">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-blue-600"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        <span>View Details</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-red-600"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        <span>Dismiss</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <div className="p-2 border-t bg-gray-50">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full h-7 text-xs text-gray-600 flex justify-center items-center"
            >
              <span>Run Full Risk Analysis</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}