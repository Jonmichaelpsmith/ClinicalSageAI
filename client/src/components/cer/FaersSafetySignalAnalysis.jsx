import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  AlertTriangle, 
  FileBarChart, 
  ChevronDown, 
  FileText, 
  BarChart,
  PieChart,
  Download,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';

/**
 * FaersSafetySignalAnalysis - Component for analyzing and visualizing FDA FAERS data
 * with professional styling matching the Omnia design system
 */
export default function FaersSafetySignalAnalysis() {
  const [ndcCode, setNdcCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [reportData, setReportData] = useState(null);
  
  // Sample data for demo visualization
  const sampleData = {
    productName: 'Enzalex XR',
    ndcCode: '01234-5678-90',
    totalReports: 342,
    reportDetails: {
      serious: 87,
      nonSerious: 255,
      fatal: 12,
      lifeThreatening: 28,
      hospitalization: 47,
      disability: 16,
      congenitalAnomaly: 0,
      other: 34
    },
    adverseEvents: [
      { name: 'Headache', count: 78, serious: 12, percentage: 22.8 },
      { name: 'Nausea', count: 64, serious: 15, percentage: 18.7 },
      { name: 'Dizziness', count: 51, serious: 8, percentage: 14.9 },
      { name: 'Fatigue', count: 47, serious: 5, percentage: 13.7 },
      { name: 'Vomiting', count: 32, serious: 10, percentage: 9.4 },
      { name: 'Abdominal pain', count: 29, serious: 6, percentage: 8.5 },
      { name: 'Rash', count: 22, serious: 3, percentage: 6.4 },
      { name: 'Insomnia', count: 19, serious: 0, percentage: 5.6 }
    ],
    demographicData: {
      gender: {
        female: 192,
        male: 138,
        unknown: 12
      },
      ageGroups: {
        'Under 18': 15,
        '18-34': 73,
        '35-49': 104,
        '50-64': 87,
        '65+': 54,
        'Unknown': 9
      }
    },
    timeIntervals: [
      { period: '2023 Q1', reports: 75 },
      { period: '2023 Q2', reports: 89 },
      { period: '2023 Q3', reports: 96 },
      { period: '2023 Q4', reports: 82 }
    ],
    riskAssessment: {
      overallRisk: 'Moderate',
      riskScore: 64, // 0-100 scale
      signals: [
        { name: 'Cardiovascular events', severity: 'High', score: 82 },
        { name: 'Hepatotoxicity', severity: 'Moderate', score: 58 },
        { name: 'Neurological effects', severity: 'Low', score: 35 }
      ]
    }
  };
  
  // Handle search for NDC code
  const handleSearch = () => {
    if (!ndcCode.trim()) return;
    
    setLoading(true);
    
    // Simulate API call to FAERS database
    setTimeout(() => {
      setReportData(sampleData);
      setLoading(false);
    }, 1200);
  };
  
  // Handle key press for search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Reset the search
  const handleReset = () => {
    setNdcCode('');
    setReportData(null);
  };
  
  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'moderate':
        return 'text-amber-600 bg-amber-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };
  
  // Get risk score color
  const getRiskScoreColor = (score) => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-amber-600';
    if (score >= 25) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  // Get risk score progress color
  const getRiskScoreProgressColor = (score) => {
    if (score >= 75) return 'bg-red-600';
    if (score >= 50) return 'bg-amber-600';
    if (score >= 25) return 'bg-yellow-600';
    return 'bg-green-600';
  };
  
  return (
    <Card className="shadow-md border border-gray-200">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">FDA FAERS Safety Signal Analysis</CardTitle>
            <CardDescription>
              Analyze safety signals from FDA Adverse Event Reporting System (FAERS)
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Enter NDC Code or Product Name"
              className="pl-9 pr-36"
              value={ndcCode}
              onChange={(e) => setNdcCode(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            {ndcCode && !loading && (
              <button
                className="absolute right-14 top-1.5 text-xs text-gray-500 hover:text-gray-800"
                onClick={handleReset}
              >
                Clear
              </button>
            )}
            <Button 
              className="absolute right-2 top-1 h-7 text-xs"
              size="sm"
              disabled={loading || !ndcCode.trim()}
              onClick={handleSearch}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          <div className="text-sm">
            <span className="text-gray-500">Format:</span> 12345-6789-01
          </div>
        </div>
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-8 w-8 rounded-full border-t-2 border-b-2 border-gray-900 animate-spin"></div>
            <p className="mt-4 text-gray-500">Searching FAERS database...</p>
          </div>
        )}
        
        {!loading && !reportData && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <FileBarChart className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Search for FAERS Data</h3>
            <p className="text-sm text-gray-500 max-w-md mb-4">
              Enter an NDC code or product name to retrieve adverse event reports 
              and analyze safety signals from the FDA FAERS database.
            </p>
            <div className="text-xs text-gray-500 flex flex-col items-center">
              <span className="flex items-center">
                <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                The analysis may take a few moments to complete.
              </span>
            </div>
          </div>
        )}
        
        {!loading && reportData && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{reportData.productName}</h2>
                <div className="text-sm text-gray-500 flex items-center">
                  <span>NDC: {reportData.ndcCode}</span>
                  <span className="mx-2">•</span>
                  <span>{reportData.totalReports} Total Reports</span>
                </div>
              </div>
              
              <Badge 
                className={`px-3 py-1 text-sm ${reportData.riskAssessment.riskScore >= 75 ? 'bg-red-100 text-red-800' : 
                              reportData.riskAssessment.riskScore >= 50 ? 'bg-amber-100 text-amber-800' : 
                              reportData.riskAssessment.riskScore >= 25 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'}`}
              >
                {reportData.riskAssessment.overallRisk} Risk Profile
              </Badge>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 bg-gray-100">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="adverse-events">Adverse Events</TabsTrigger>
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
                <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-0">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-white border rounded-md p-4">
                    <div className="text-sm text-gray-500 mb-1">Total Reports</div>
                    <div className="text-2xl font-bold">{reportData.totalReports}</div>
                  </div>
                  
                  <div className="bg-white border rounded-md p-4">
                    <div className="text-sm text-gray-500 mb-1">Serious</div>
                    <div className="text-2xl font-bold">{reportData.reportDetails.serious}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((reportData.reportDetails.serious / reportData.totalReports) * 100)}% of total
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-md p-4">
                    <div className="text-sm text-gray-500 mb-1">Fatal</div>
                    <div className="text-2xl font-bold">{reportData.reportDetails.fatal}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((reportData.reportDetails.fatal / reportData.totalReports) * 100)}% of total
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-md p-4">
                    <div className="text-sm text-gray-500 mb-1">Hospitalization</div>
                    <div className="text-2xl font-bold">{reportData.reportDetails.hospitalization}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((reportData.reportDetails.hospitalization / reportData.totalReports) * 100)}% of total
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border rounded-md p-4 mb-6">
                  <h3 className="font-medium mb-4">Report Trends</h3>
                  <div className="flex justify-between items-end h-32 mb-2">
                    {reportData.timeIntervals.map((interval, index) => (
                      <div key={index} className="flex flex-col items-center w-full">
                        <div className="w-12 bg-blue-600 mx-auto relative" 
                             style={{
                               height: `${(interval.reports / Math.max(...reportData.timeIntervals.map(i => i.reports))) * 120}px`
                             }}>
                          <div className="absolute -top-6 w-full text-center text-xs">
                            {interval.reports}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    {reportData.timeIntervals.map((interval, index) => (
                      <div key={index} className="text-xs text-center w-full">
                        {interval.period}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white border rounded-md p-4">
                  <h3 className="font-medium mb-4">Top Adverse Events</h3>
                  <div className="space-y-4">
                    {reportData.adverseEvents.slice(0, 5).map((event, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">{event.name}</span>
                          <div className="flex items-center">
                            <span className="text-sm font-medium">{event.count}</span>
                            {event.serious > 0 && (
                              <Badge className="ml-2 bg-red-100 text-red-800 text-xs">
                                {event.serious} Serious
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600" 
                            style={{ width: `${event.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="adverse-events" className="mt-0">
                <div className="bg-white border rounded-md p-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Adverse Event Distribution</h3>
                    <Button variant="outline" size="sm" className="text-xs">
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Filter
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {reportData.adverseEvents.map((event, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">{event.name}</span>
                          <div className="flex items-center">
                            <span className="text-sm font-medium">{event.count}</span>
                            <span className="ml-2 text-xs text-gray-500">
                              {event.percentage}%
                            </span>
                            {event.serious > 0 && (
                              <Badge className="ml-2 bg-red-100 text-red-800 text-xs">
                                {event.serious} Serious
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${event.serious > 10 ? 'bg-red-500' : 
                                          event.serious > 5 ? 'bg-amber-500' : 'bg-blue-600'}`} 
                            style={{ width: `${event.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white border rounded-md p-4">
                    <h3 className="font-medium mb-4">Serious vs. Non-Serious</h3>
                    <div className="flex items-center justify-center py-8">
                      <div className="relative w-40 h-40">
                        {/* This is a simplified representation of a pie chart */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl font-bold">{reportData.totalReports}</div>
                            <div className="text-xs text-gray-500">Total Reports</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-8">
                        <div className="flex items-center mb-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span className="text-sm">
                            Non-Serious ({reportData.reportDetails.nonSerious})
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                          <span className="text-sm">
                            Serious ({reportData.reportDetails.serious})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-md p-4">
                    <h3 className="font-medium mb-4">Serious Event Breakdown</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Fatal</span>
                          <span>{reportData.reportDetails.fatal}</span>
                        </div>
                        <Progress value={Math.round((reportData.reportDetails.fatal / reportData.reportDetails.serious) * 100)} className="h-2 bg-gray-100">
                          <div className="h-full bg-red-600" style={{width: `${Math.round((reportData.reportDetails.fatal / reportData.reportDetails.serious) * 100)}%`}}></div>
                        </Progress>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Life-threatening</span>
                          <span>{reportData.reportDetails.lifeThreatening}</span>
                        </div>
                        <Progress value={Math.round((reportData.reportDetails.lifeThreatening / reportData.reportDetails.serious) * 100)} className="h-2 bg-gray-100">
                          <div className="h-full bg-red-500" style={{width: `${Math.round((reportData.reportDetails.lifeThreatening / reportData.reportDetails.serious) * 100)}%`}}></div>
                        </Progress>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Hospitalization</span>
                          <span>{reportData.reportDetails.hospitalization}</span>
                        </div>
                        <Progress value={Math.round((reportData.reportDetails.hospitalization / reportData.reportDetails.serious) * 100)} className="h-2 bg-gray-100">
                          <div className="h-full bg-amber-500" style={{width: `${Math.round((reportData.reportDetails.hospitalization / reportData.reportDetails.serious) * 100)}%`}}></div>
                        </Progress>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Disability</span>
                          <span>{reportData.reportDetails.disability}</span>
                        </div>
                        <Progress value={Math.round((reportData.reportDetails.disability / reportData.reportDetails.serious) * 100)} className="h-2 bg-gray-100">
                          <div className="h-full bg-amber-500" style={{width: `${Math.round((reportData.reportDetails.disability / reportData.reportDetails.serious) * 100)}%`}}></div>
                        </Progress>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Other</span>
                          <span>{reportData.reportDetails.other}</span>
                        </div>
                        <Progress value={Math.round((reportData.reportDetails.other / reportData.reportDetails.serious) * 100)} className="h-2 bg-gray-100">
                          <div className="h-full bg-blue-500" style={{width: `${Math.round((reportData.reportDetails.other / reportData.reportDetails.serious) * 100)}%`}}></div>
                        </Progress>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="demographics" className="mt-0">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white border rounded-md p-4">
                    <h3 className="font-medium mb-4">Gender Distribution</h3>
                    <div className="flex items-center justify-center py-8">
                      <div className="relative w-40 h-40">
                        {/* This is a simplified representation of a pie chart */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl font-bold">{reportData.totalReports}</div>
                            <div className="text-xs text-gray-500">Total Reports</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-8">
                        <div className="flex items-center mb-2">
                          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                          <span className="text-sm">
                            Female ({reportData.demographicData.gender.female})
                          </span>
                        </div>
                        <div className="flex items-center mb-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span className="text-sm">
                            Male ({reportData.demographicData.gender.male})
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                          <span className="text-sm">
                            Unknown ({reportData.demographicData.gender.unknown})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-md p-4">
                    <h3 className="font-medium mb-4">Age Group Distribution</h3>
                    <div className="space-y-3">
                      {Object.entries(reportData.demographicData.ageGroups).map(([group, count], index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{group}</span>
                            <span>{count}</span>
                          </div>
                          <Progress value={Math.round((count / reportData.totalReports) * 100)} className="h-2 bg-gray-100">
                            <div className="h-full bg-blue-600" style={{width: `${Math.round((count / reportData.totalReports) * 100)}%`}}></div>
                          </Progress>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="risk-assessment" className="mt-0">
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="col-span-1 bg-white border rounded-md p-4">
                    <h3 className="font-medium mb-3">Overall Risk Assessment</h3>
                    <div className="flex flex-col items-center">
                      <div className={`w-36 h-36 rounded-full flex items-center justify-center mb-4 ${reportData.riskAssessment.riskScore >= 75 ? 'bg-red-100' : 
                                 reportData.riskAssessment.riskScore >= 50 ? 'bg-amber-100' : 
                                 reportData.riskAssessment.riskScore >= 25 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                        <div className="text-center">
                          <div className={`text-4xl font-bold ${getRiskScoreColor(reportData.riskAssessment.riskScore)}`}>
                            {reportData.riskAssessment.riskScore}
                          </div>
                          <div className="text-sm mt-1">{reportData.riskAssessment.overallRisk} Risk</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500 text-center mt-2">
                        Based on {reportData.totalReports} adverse event reports
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 bg-white border rounded-md p-4">
                    <h3 className="font-medium mb-4">Safety Signals</h3>
                    
                    <div className="space-y-6">
                      {reportData.riskAssessment.signals.map((signal, index) => (
                        <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{signal.name}</h4>
                              <Badge className={`mt-1 ${getSeverityColor(signal.severity)}`}>
                                {signal.severity} Severity
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className={`text-xl font-bold ${getRiskScoreColor(signal.score)}`}>
                                {signal.score}
                              </div>
                              <div className="text-xs text-gray-500">Signal Score</div>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={getRiskScoreProgressColor(signal.score)} 
                                style={{ width: `${signal.score}%`, height: '100%' }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Low</span>
                              <span>Moderate</span>
                              <span>High</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Full Risk Report
                        </Button>
                        
                        <span className="text-xs text-gray-500">
                          Last updated: May 6, 2025
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-amber-800 mb-1">Important Safety Notice</h3>
                      <p className="text-sm text-amber-700">
                        This risk assessment is based on spontaneous reporting data from FAERS and should be 
                        interpreted alongside other clinical and epidemiological data. Signal detection 
                        does not establish causality.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}