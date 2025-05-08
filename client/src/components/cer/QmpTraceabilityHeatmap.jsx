import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Maximize2, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Filter, 
  HelpCircle 
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * QMP Traceability Heatmap Component
 * 
 * Interactive visualization of quality objectives and CtQ factors mapped to CER sections,
 * highlighting coverage and potential gaps.
 */
const QmpTraceabilityHeatmap = ({ objectives, ctqFactors, complianceMetrics }) => {
  const { toast } = useToast();
  const [filterView, setFilterView] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [expandedView, setExpandedView] = useState(false);
  
  // List of all CER sections used in the application
  const cerSections = [
    'Literature Review',
    'Benefit-Risk Analysis',
    'Safety Analysis',
    'Clinical Background',
    'Device Description',
    'State of the Art Review',
    'Equivalence Assessment',
    'Post-Market Surveillance',
    'Conclusion'
  ];
  
  // Calculate traceability data
  const traceabilityData = useMemo(() => {
    // Create a mapping of objectives to sections
    const objectiveSectionMap = {};
    objectives.forEach(objective => {
      if (objective.scopeSections && objective.scopeSections.length > 0) {
        objective.scopeSections.forEach(section => {
          if (!objectiveSectionMap[section]) {
            objectiveSectionMap[section] = [];
          }
          objectiveSectionMap[section].push(objective);
        });
      }
    });
    
    // Create a mapping of CtQ factors to sections
    const ctqSectionMap = {};
    const ctqFactorsBySection = {};
    
    ctqFactors.forEach(factor => {
      const section = factor.associatedSection;
      if (section) {
        if (!ctqSectionMap[section]) {
          ctqSectionMap[section] = {
            high: 0,
            medium: 0,
            low: 0,
            total: 0
          };
        }
        
        ctqSectionMap[section][factor.riskLevel]++;
        ctqSectionMap[section].total++;
        
        if (!ctqFactorsBySection[section]) {
          ctqFactorsBySection[section] = [];
        }
        ctqFactorsBySection[section].push(factor);
      }
    });
    
    // Prepare the final data structure with coverage calculations
    return cerSections.map(section => {
      const objectiveCount = objectiveSectionMap[section]?.length || 0;
      const ctqCount = ctqSectionMap[section]?.total || 0;
      const highRiskCount = ctqSectionMap[section]?.high || 0;
      const mediumRiskCount = ctqSectionMap[section]?.medium || 0;
      const lowRiskCount = ctqSectionMap[section]?.low || 0;
      
      // Calculate coverage score (weighted by risk level)
      const weightedScore = (highRiskCount * 3) + (mediumRiskCount * 2) + lowRiskCount;
      const maxPossibleScore = 3 * 5; // Assume 5 high-risk factors would be the maximum
      const coverageScore = Math.min(100, Math.round((weightedScore / maxPossibleScore) * 100));
      
      return {
        section,
        objectiveCount,
        ctqCount,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        coverageScore,
        objectives: objectiveSectionMap[section] || [],
        ctqFactors: ctqFactorsBySection[section] || [],
        hasCriticalGap: highRiskCount === 0 && objectiveCount > 0,
      };
    });
  }, [objectives, ctqFactors, cerSections]);
  
  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return traceabilityData.filter(item => {
      // Filter by view
      if (filterView === 'with-objectives' && item.objectiveCount === 0) return false;
      if (filterView === 'with-ctq' && item.ctqCount === 0) return false;
      if (filterView === 'gaps' && !item.hasCriticalGap) return false;
      
      // Filter by risk level
      if (filterRisk === 'high' && item.highRiskCount === 0) return false;
      if (filterRisk === 'medium' && item.mediumRiskCount === 0) return false;
      if (filterRisk === 'low' && item.lowRiskCount === 0) return false;
      
      return true;
    });
  }, [traceabilityData, filterView, filterRisk]);
  
  // Sort data by coverage score (descending)
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => b.coverageScore - a.coverageScore);
  }, [filteredData]);
  
  const downloadReportAsCsv = () => {
    // Create CSV content
    const headers = [
      'CER Section',
      'Coverage Score',
      'Objectives',
      'CtQ Factors',
      'High Risk',
      'Medium Risk',
      'Low Risk',
      'Critical Gaps'
    ].join(',');
    
    const rows = traceabilityData.map(item => {
      return [
        `"${item.section}"`,
        item.coverageScore,
        item.objectiveCount,
        item.ctqCount,
        item.highRiskCount,
        item.mediumRiskCount,
        item.lowRiskCount,
        item.hasCriticalGap ? 'Yes' : 'No'
      ].join(',');
    });
    
    const csvContent = [headers, ...rows].join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `QMP_Traceability_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Traceability report downloaded',
      description: 'CSV file has been downloaded successfully.',
    });
  };
  
  // Get color for coverage score
  const getCoverageColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-300';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };
  
  // Get color for heatmap cell
  const getCellColor = (count, type) => {
    if (count === 0) return 'bg-gray-100';
    
    if (type === 'high') {
      if (count >= 3) return 'bg-red-600';
      if (count >= 2) return 'bg-red-500';
      return 'bg-red-400';
    }
    
    if (type === 'medium') {
      if (count >= 3) return 'bg-yellow-600';
      if (count >= 2) return 'bg-yellow-500';
      return 'bg-yellow-400';
    }
    
    if (type === 'low') {
      if (count >= 3) return 'bg-blue-600';
      if (count >= 2) return 'bg-blue-500';
      return 'bg-blue-400';
    }
    
    return 'bg-gray-100';
  };
  
  return (
    <div className={`space-y-4 ${expandedView ? 'fixed inset-0 bg-white z-50 p-4 overflow-auto' : ''}`}>
      {/* Filter and control bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-1.5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <Select value={filterView} onValueChange={setFilterView}>
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              <SelectItem value="with-objectives">With Objectives</SelectItem>
              <SelectItem value="with-ctq">With CtQ Factors</SelectItem>
              <SelectItem value="gaps">Critical Gaps</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="h-8 w-36">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm"
            onClick={downloadReportAsCsv}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm"
            onClick={() => setExpandedView(!expandedView)}
          >
            <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
            {expandedView ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs p-2 bg-gray-50 rounded-md mb-4">
        <div className="font-medium">Coverage Legend:</div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-400 mr-1"></span>
          High Risk CtQ
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-sm bg-yellow-400 mr-1"></span>
          Medium Risk CtQ
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-sm bg-blue-400 mr-1"></span>
          Low Risk CtQ
        </div>
        <div className="flex items-center">
          <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
          Critical Gap
        </div>
        <div className="flex items-center">
          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
          Full Coverage
        </div>
      </div>
      
      {/* Traceability heatmap */}
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-700">
              <th className="py-2 px-3 text-left font-medium border-b">CER Section</th>
              <th className="py-2 px-3 text-center font-medium border-b w-20">Coverage</th>
              <th className="py-2 px-3 text-center font-medium border-b w-20">Objectives</th>
              <th className="py-2 px-3 text-center font-medium border-b w-20">CtQ Factors</th>
              <th className="py-2 px-3 text-center font-medium border-b">High Risk</th>
              <th className="py-2 px-3 text-center font-medium border-b">Medium Risk</th>
              <th className="py-2 px-3 text-center font-medium border-b">Low Risk</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-6 text-center text-gray-500">
                  <Info className="h-5 w-5 mx-auto mb-2" />
                  No data matches the selected filters.
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <tr key={item.section} className="hover:bg-gray-50 text-sm border-b last:border-b-0">
                  <td className="py-3 px-3">
                    <div className="flex items-center">
                      {item.hasCriticalGap && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertCircle className="h-4 w-4 text-red-500 mr-1.5 flex-shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Critical gap: No high-risk CtQ factors defined</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {item.coverageScore >= 80 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1.5 flex-shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Full coverage with critical-to-quality factors</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <span className="font-medium text-gray-800">{item.section}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge 
                      variant="outline" 
                      className={`${getCoverageColor(item.coverageScore)} font-medium`}
                    >
                      {item.coverageScore}%
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-center font-medium">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            {item.objectiveCount > 0 
                              ? item.objectiveCount 
                              : <span className="text-gray-400">0</span>
                            }
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          {item.objectives.length > 0 ? (
                            <div>
                              <p className="font-medium mb-1">Quality Objectives:</p>
                              <ul className="list-disc pl-4 text-xs">
                                {item.objectives.map(obj => (
                                  <li key={obj.id} className="mb-1">{obj.title}</li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p>No quality objectives defined for this section</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="py-3 px-3 text-center font-medium">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            {item.ctqCount > 0 
                              ? item.ctqCount 
                              : <span className="text-gray-400">0</span>
                            }
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          {item.ctqFactors.length > 0 ? (
                            <div>
                              <p className="font-medium mb-1">Critical-to-Quality Factors:</p>
                              <ul className="list-disc pl-4 text-xs">
                                {item.ctqFactors.map(factor => (
                                  <li key={factor.id} className="mb-1">
                                    {factor.name}
                                    <span className={`ml-1 px-1 py-0.5 rounded-sm text-xs 
                                      ${factor.riskLevel === 'high' ? 'bg-red-100 text-red-800' : 
                                        factor.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-blue-100 text-blue-800'}`}>
                                      {factor.riskLevel}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p>No CtQ factors defined for this section</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className={`py-3 px-3 text-center font-medium ${getCellColor(item.highRiskCount, 'high')} text-white`}>
                    {item.highRiskCount}
                  </td>
                  <td className={`py-3 px-3 text-center font-medium ${getCellColor(item.mediumRiskCount, 'medium')} text-white`}>
                    {item.mediumRiskCount}
                  </td>
                  <td className={`py-3 px-3 text-center font-medium ${getCellColor(item.lowRiskCount, 'low')} text-white`}>
                    {item.lowRiskCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-blue-100 p-2 mr-3">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Quality Objectives</div>
              <div className="text-xl font-bold">{objectives.length}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-purple-100 p-2 mr-3">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Total CtQ Factors</div>
              <div className="text-xl font-bold">{ctqFactors.length}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-red-100 p-2 mr-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Sections with Critical Gaps</div>
              <div className="text-xl font-bold">
                {traceabilityData.filter(item => item.hasCriticalGap).length}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-green-100 p-2 mr-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Overall Coverage</div>
              <div className="text-xl font-bold">
                {Math.round(
                  (traceabilityData.reduce((sum, item) => sum + item.coverageScore, 0) / 
                  (traceabilityData.length * 100)) * 100
                )}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Helper text */}
      <div className="flex items-start mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-md">
        <HelpCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium mb-1">How to Use the Traceability Heatmap</p>
          <p className="text-blue-700">
            This heatmap visualizes how quality objectives and critical-to-quality factors are distributed 
            across CER sections. Sections with critical gaps (no high-risk CtQ factors) are highlighted with 
            a warning indicator. Hover over any cell to see detailed information. Use filters to focus on 
            specific risk levels or sections with gaps.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QmpTraceabilityHeatmap;