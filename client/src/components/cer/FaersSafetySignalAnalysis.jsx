import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronDown, ChevronUp, FileDown, Info, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';

/**
 * FaersSafetySignalAnalysis - Component for displaying FDA FAERS safety signal analysis
 * Implements section 6 of the CER Master Data Model
 */
export default function FaersSafetySignalAnalysis({ 
  faersData, 
  comparators = [],
  selectedDateRange = '5 years',
  showCharts = true
}) {
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    adverseEvents: false,
    comparatorAnalysis: false,
    demographicPatterns: false,
    reporting: false
  });
  
  // Format date string
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Toggle expanded sections
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  // Get severity class
  const getSeverityClass = (severity) => {
    if (!severity) return 'text-gray-500';
    
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-amber-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-500';
    }
  };
  
  // Get severity badge
  const getSeverityBadge = (severity) => {
    if (!severity) return null;
    
    switch (severity.toLowerCase()) {
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Get trend icon
  const getTrendIcon = (trend) => {
    if (!trend) return null;
    
    if (trend === 'increasing') {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (trend === 'decreasing') {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    } else {
      return null;
    }
  };
  
  // If no data, show empty state
  if (!faersData || !faersData.reports || faersData.reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>FAERS Safety Signal Analysis</CardTitle>
          <CardDescription>
            FDA Adverse Event Reporting System data analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-8 w-8 text-amber-500 mb-3" />
            <h3 className="text-lg font-medium">No FAERS Data Available</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              To perform a safety signal analysis, first search for your device or product in the FAERS database.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-blue-200">
      <CardHeader className="bg-blue-50 border-b border-blue-100">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>FAERS Safety Signal Analysis</CardTitle>
            <CardDescription>
              Based on FDA Adverse Event Reporting System data from {selectedDateRange}
            </CardDescription>
          </div>
          {faersData.severityAssessment && (
            <div className="flex items-center">
              <span className="text-sm mr-2">Overall Signal Strength:</span>
              {getSeverityBadge(faersData.severityAssessment)}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Product Information */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">Product Information</h4>
            <div className="space-y-1 text-sm">
              <div><span className="text-gray-500">Name:</span> {faersData.product?.name || 'N/A'}</div>
              <div><span className="text-gray-500">Manufacturer:</span> {faersData.product?.manufacturer || 'N/A'}</div>
              <div><span className="text-gray-500">Classification:</span> {faersData.product?.classification || 'N/A'}</div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">Report Summary</h4>
            <div className="space-y-1 text-sm">
              <div><span className="text-gray-500">Total Reports:</span> {faersData.reports?.length || 0}</div>
              <div><span className="text-gray-500">Serious Events:</span> {faersData.seriousEvents?.length || 0}</div>
              <div><span className="text-gray-500">Date Range:</span> {faersData.dateRange || selectedDateRange}</div>
            </div>
          </div>
        </div>
        
        {/* Report Summary Section */}
        <Collapsible open={expandedSections.summary} onOpenChange={() => toggleSection('summary')}>
          <div className="border rounded-md overflow-hidden">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100">
              <h3 className="font-medium flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Safety Signal Summary
              </h3>
              <div className="flex items-center">
                {expandedSections.summary ? 
                  <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                  <ChevronDown className="h-4 w-4 text-gray-500" />}
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-4 text-sm border-t border-gray-200">
                <div className="prose prose-sm max-w-none">
                  {faersData.analysis?.reportSummary ? (
                    <p>{faersData.analysis.reportSummary}</p>
                  ) : (
                    <p>No summary information available for this product.</p>
                  )}
                  
                  {faersData.analysis?.recommendations && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md">
                      <h4 className="text-amber-800 text-sm font-medium flex items-center mb-2">
                        <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                        Signal Assessment Recommendations
                      </h4>
                      <p className="text-amber-800 text-sm">{faersData.analysis.recommendations}</p>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        {/* Adverse Events Section */}
        <Collapsible open={expandedSections.adverseEvents} onOpenChange={() => toggleSection('adverseEvents')}>
          <div className="border rounded-md overflow-hidden">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100">
              <h3 className="font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Top Adverse Events
              </h3>
              <div className="flex items-center">
                {expandedSections.adverseEvents ? 
                  <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                  <ChevronDown className="h-4 w-4 text-gray-500" />}
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-4 text-sm border-t border-gray-200">
                {faersData.adverseEvents && faersData.adverseEvents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Adverse Event</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Outcome</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faersData.adverseEvents.slice(0, 10).map((event, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{event.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{event.count || 0}</span>
                              <Progress 
                                value={(event.count / Math.max(...faersData.adverseEvents.map(e => e.count || 0))) * 100} 
                                className="h-1.5 mt-1"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={getSeverityClass(event.severity)}>
                              {event.severity || 'Unknown'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getTrendIcon(event.trend)}
                              <span className="ml-1">{event.trend || 'Stable'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{event.outcome || 'Not specified'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p>No adverse event data available for this product.</p>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        {/* Comparator Analysis Section */}
        {comparators && comparators.length > 0 && (
          <Collapsible open={expandedSections.comparatorAnalysis} onOpenChange={() => toggleSection('comparatorAnalysis')}>
            <div className="border rounded-md overflow-hidden">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100">
                <h3 className="font-medium flex items-center">
                  <ChartIcon className="h-4 w-4 mr-2" />
                  Comparator Product Signal Profiles
                </h3>
                <div className="flex items-center">
                  {expandedSections.comparatorAnalysis ? 
                    <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                    <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="p-4 text-sm border-t border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Reports</TableHead>
                        <TableHead>Serious Events</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Comparison</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Primary Product */}
                      <TableRow className="bg-blue-50">
                        <TableCell className="font-medium">
                          {faersData.product?.name || 'Subject Product'}
                          <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">Primary</Badge>
                        </TableCell>
                        <TableCell>{faersData.reports?.length || 0}</TableCell>
                        <TableCell>{faersData.seriousEvents?.length || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={getSeverityClass(faersData.severityAssessment)}>
                              {faersData.riskScore || 'N/A'}
                            </span>
                            {getSeverityBadge(faersData.severityAssessment)}
                          </div>
                        </TableCell>
                        <TableCell>Baseline</TableCell>
                      </TableRow>
                      
                      {/* Comparator Products */}
                      {comparators.map((comp, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{comp.name}</TableCell>
                          <TableCell>{comp.reportCount || 0}</TableCell>
                          <TableCell>{comp.seriousEventCount || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className={getSeverityClass(comp.severityAssessment)}>
                                {comp.riskScore || 'N/A'}
                              </span>
                              {getSeverityBadge(comp.severityAssessment)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {comp.comparisonToSubject ? (
                              <Badge 
                                variant="outline" 
                                className={comp.comparisonToSubject === 'Better' ? 
                                  'bg-green-50 text-green-700' : 
                                  comp.comparisonToSubject === 'Similar' ? 
                                    'bg-blue-50 text-blue-700' : 
                                    'bg-red-50 text-red-700'
                                }
                              >
                                {comp.comparisonToSubject}
                              </Badge>
                            ) : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}
      </CardContent>
      
      <CardFooter className="border-t bg-gray-50 py-3 flex justify-between">
        <div className="text-xs text-gray-500">
          Data retrieved from FDA FAERS database on {formatDate(faersData.retrievalDate || new Date())}
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <FileDown className="h-3.5 w-3.5" />
          <span className="text-xs">Export Analysis</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Simple chart icon component
function ChartIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="M8 17l4-8 4 4 4-10" />
    </svg>
  );
}
