import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, CheckCircle, AlertCircle, DatabaseIcon, BarChart4, BarChartHorizontal, HelpCircle, FileText } from 'lucide-react';
import { FaersRiskBadge } from './FaersRiskBadge';
import { FaersHowToModal } from './FaersHowToModal';

/**
 * FDA FAERS Data Panel Component
 * 
 * This component provides an interface for fetching and displaying adverse event data
 * from the FDA FAERS (FDA Adverse Event Reporting System) database for inclusion
 * in Clinical Evaluation Reports.
 */
const FdaFaersDataPanel = ({ onDataFetched }) => {
  const [productName, setProductName] = useState('');
  const [manufacturerName, setManufacturerName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [faersData, setFaersData] = useState(null);
  const [faersAnalysis, setFaersAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('raw-data');
  const [showHowTo, setShowHowTo] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  
  /**
   * Fetch raw FAERS data from the API
   */
  const fetchFaersData = async () => {
    if (!productName) {
      setError('Product name is required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query string for API request
      let queryParams = `productName=${encodeURIComponent(productName)}`;
      if (manufacturerName) queryParams += `&manufacturerName=${encodeURIComponent(manufacturerName)}`;
      if (startDate) queryParams += `&startDate=${startDate}`;
      if (endDate) queryParams += `&endDate=${endDate}`;
      
      // Fetch data from our API
      const response = await fetch(`/api/cer/faers/data?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching FAERS data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFaersData(data);
      
      // Call the callback if provided
      if (onDataFetched) {
        onDataFetched(data);
      }
      
      // Automatically fetch analysis as well
      fetchFaersAnalysis();
      
    } catch (error) {
      console.error('Error fetching FAERS data:', error);
      setError(error.message || 'Failed to fetch FDA FAERS data');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Fetch analyzed FAERS data from the API
   */
  const fetchFaersAnalysis = async () => {
    if (!productName) {
      setError('Product name is required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query string for API request
      let queryParams = `productName=${encodeURIComponent(productName)}`;
      if (manufacturerName) queryParams += `&manufacturerName=${encodeURIComponent(manufacturerName)}`;
      if (startDate) queryParams += `&startDate=${startDate}`;
      if (endDate) queryParams += `&endDate=${endDate}`;
      
      // Fetch analysis from our API
      const response = await fetch(`/api/cer/faers/analysis?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching FAERS analysis: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFaersAnalysis(data);
      setActiveTab('analysis'); // Switch to analysis tab when data is loaded
      
    } catch (error) {
      console.error('Error fetching FAERS analysis:', error);
      setError(error.message || 'Failed to fetch FDA FAERS analysis');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Render the raw FAERS data view
   */
  const renderRawDataView = () => {
    if (!faersData) {
      return (
        <div className="py-8 text-center text-gray-500">
          <DatabaseIcon className="mx-auto h-12 w-12 mb-3 text-gray-400" />
          <p>No FDA FAERS data loaded. Use the search form to fetch adverse event data.</p>
        </div>
      );
    }
    
    const { productName, totalReports, adverseEventCounts = [], seriousEvents = [] } = faersData;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Product</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{productName}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalReports}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Serious Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{seriousEvents.length}</p>
              <p className="text-sm text-gray-500">
                {((seriousEvents.length / totalReports) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Adverse Events</CardTitle>
            <CardDescription>
              Most frequently reported adverse events from FDA FAERS database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {adverseEventCounts.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center">
                    <span className="font-medium">{item.event}</span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">{item.count}</Badge>
                    <span className="text-sm text-gray-500">
                      {((item.count / totalReports) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  /**
   * Render the FAERS analysis view
   */
  const renderAnalysisView = () => {
    if (!faersAnalysis) {
      return (
        <div className="py-8 text-center text-gray-500">
          <BarChart4 className="mx-auto h-12 w-12 mb-3 text-gray-400" />
          <p>No FDA FAERS analysis available. First fetch the raw data to generate an analysis.</p>
        </div>
      );
    }
    
    const { 
      productInfo, 
      reportingPeriod, 
      summary, 
      topEvents = [],
      demographics,
      conclusion
    } = faersAnalysis;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.totalReports}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Serious Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.seriousEvents}</p>
              <p className="text-sm text-gray-500">{summary.seriousEventsPercentage} of total</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Event Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.eventsPerTenThousand}</p>
              <p className="text-sm text-gray-500">per 10,000 units</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Severity</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-2xl font-bold">{summary.severityAssessment}</p>
              <FaersRiskBadge 
                severity={summary.severityAssessment}
                score={summary.eventsPerTenThousand}
                size="lg"
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Reported Events</CardTitle>
              <CardDescription>
                Most frequently reported adverse events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topEvents.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{index + 1}. {item.event}</span>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">{item.count}</Badge>
                      <span className="text-sm text-gray-500">{item.percentage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Demographics</CardTitle>
              <CardDescription>
                Age and gender distribution of reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Age Distribution</h4>
                <div className="space-y-2">
                  {demographics?.ageDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm">{item.group}</span>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">{item.count}</Badge>
                        <span className="text-sm text-gray-500">{item.percentage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Gender Distribution</h4>
                <div className="space-y-2">
                  {demographics?.genderDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm">{item.gender}</span>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">{item.count}</Badge>
                        <span className="text-sm text-gray-500">{item.percentage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>CER Section Analysis</CardTitle>
            <CardDescription>
              Pre-formatted content for inclusion in Clinical Evaluation Report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p>{conclusion}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm" className="mr-2">
              Copy to Clipboard
            </Button>
            <Button size="sm">
              Add to Report
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>FDA FAERS Database Query</CardTitle>
          <CardDescription>
            Search the FDA Adverse Event Reporting System for device or drug-related adverse events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name <span className="text-red-500">*</span></Label>
              <Input
                id="productName"
                placeholder="e.g. CardioMonitor Pro 3000"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <p className="text-xs text-gray-500">Enter the exact product name as registered with FDA</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manufacturerName">Manufacturer Name (Optional)</Label>
              <Input
                id="manufacturerName"
                placeholder="e.g. MedTech Innovations, Inc."
                value={manufacturerName}
                onChange={(e) => setManufacturerName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date (Optional)</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-blue-600" 
              onClick={() => setShowHowTo(true)}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              How to use this module
            </Button>
            {error && (
              <Alert variant="destructive" className="p-2 text-sm ml-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                setProductName('');
                setManufacturerName('');
                setStartDate('');
                setEndDate('');
                setFaersData(null);
                setFaersAnalysis(null);
                setError(null);
              }}
            >
              Reset
            </Button>
            <Button 
              onClick={fetchFaersData} 
              disabled={isLoading || !productName}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search FAERS
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Results */}
      {(faersData || faersAnalysis) && (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>FDA FAERS Data Results</CardTitle>
            <CardDescription>
              {faersData?.productName} - {faersData?.totalReports} adverse event reports
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="raw-data">
                  <DatabaseIcon className="mr-2 h-4 w-4" />
                  Raw Data
                </TabsTrigger>
                <TabsTrigger value="analysis">
                  <BarChart4 className="mr-2 h-4 w-4" />
                  Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="raw-data">
                {renderRawDataView()}
              </TabsContent>
              
              <TabsContent value="analysis">
                {renderAnalysisView()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
  // Render the How-To modal
  const renderHowToModal = () => {
    return <FaersHowToModal isOpen={showHowTo} onClose={() => setShowHowTo(false)} />;
  };

  // Render the full CER report modal
  const renderFullCerReport = () => {
    if (!showFullReport) return null;
    // Import the FullCerReportModal component only when needed (code splitting)
    const FullCerReportModal = React.lazy(() => import('./FullCerReportModal'));
    
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <FullCerReportModal 
          isOpen={showFullReport} 
          onClose={() => setShowFullReport(false)} 
          faersData={faersData || faersAnalysis} 
        />
      </React.Suspense>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>FDA FAERS Database Query</CardTitle>
          <CardDescription>
            Search the FDA Adverse Event Reporting System for device or drug-related adverse events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name <span className="text-red-500">*</span></Label>
              <Input
                id="productName"
                placeholder="e.g. CardioMonitor Pro 3000"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <p className="text-xs text-gray-500">Enter the exact product name as registered with FDA</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manufacturerName">Manufacturer Name (Optional)</Label>
              <Input
                id="manufacturerName"
                placeholder="e.g. MedTech Innovations, Inc."
                value={manufacturerName}
                onChange={(e) => setManufacturerName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date (Optional)</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-blue-600" 
              onClick={() => setShowHowTo(true)}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              How to use this module
            </Button>
            {error && (
              <Alert variant="destructive" className="p-2 text-sm ml-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                setProductName('');
                setManufacturerName('');
                setStartDate('');
                setEndDate('');
                setFaersData(null);
                setFaersAnalysis(null);
                setError(null);
              }}
            >
              Reset
            </Button>
            <Button 
              onClick={fetchFaersData} 
              disabled={isLoading || !productName}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search FAERS
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Results */}
      {(faersData || faersAnalysis) && (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>FDA FAERS Data Results</CardTitle>
            <CardDescription>
              {faersData?.productName} - {faersData?.totalReports} adverse event reports
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="raw-data">
                  <DatabaseIcon className="mr-2 h-4 w-4" />
                  Raw Data
                </TabsTrigger>
                <TabsTrigger value="analysis">
                  <BarChart4 className="mr-2 h-4 w-4" />
                  Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="raw-data">
                {renderRawDataView()}
              </TabsContent>
              
              <TabsContent value="analysis">
                {renderAnalysisView()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Add Full CER Report Button */}
      {(faersData || faersAnalysis) && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            className="flex items-center" 
            onClick={() => setShowFullReport(true)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Full CER Report
          </Button>
        </div>
      )}
      
      {/* Render modals */}
      {renderHowToModal()}
      {renderFullCerReport()}
    </div>
  );
};

export default FdaFaersDataPanel;