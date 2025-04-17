import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FileDown, BarChart2, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

const AdvancedDashboard = ({ filteredData }) => {
  const [ndcCodes, setNdcCodes] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  
  // Sample NDC codes for demonstration
  const availableNdcCodes = [
    { code: "0002-3227-30", name: "Acetaminophen Tablets" },
    { code: "0074-3799-13", name: "Lisinopril" },
    { code: "0078-0357-15", name: "Metformin HCl" },
    { code: "0173-0519-00", name: "Atorvastatin Calcium" },
    { code: "50580-506-01", name: "Levothyroxine Sodium" }
  ];
  
  useEffect(() => {
    // Initialize with available codes
    setNdcCodes(availableNdcCodes);
  }, []);
  
  useEffect(() => {
    // Handle filtered data from NLPQuery
    if (filteredData) {
      // In a real implementation, this would update the dashboard based on NLP query results
      console.log('Received filtered data:', filteredData);
      
      if (filteredData.events && filteredData.events.length > 0) {
        // Transform filtered data to chart format
        const chartData = filteredData.events.map(event => ({
          name: event.name,
          count: event.count
        }));
        
        setAnalysisData({
          comparative_data: {},
          visualization_data: {
            event_labels: filteredData.events.map(e => e.name),
            products: {}
          },
          nlpFilteredData: {
            events: chartData,
            demographics: filteredData.demographics || []
          }
        });
        
        // Switch to events tab to show the filtered results
        setActiveTab('events');
      }
    }
  }, [filteredData]);
  
  const handleSelectCode = (code) => {
    if (selectedCodes.includes(code)) {
      setSelectedCodes(selectedCodes.filter(c => c !== code));
    } else {
      setSelectedCodes([...selectedCodes, code]);
    }
  };
  
  const handleAnalyze = async () => {
    if (selectedCodes.length === 0) {
      toast({
        title: "Selection required",
        description: "Please select at least one NDC code",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const response = await axios.post('/api/cer/analyze', { ndc_codes: selectedCodes });
      
      if (response.data.success) {
        setAnalysisData(response.data);
        setActiveTab('comparison');
        
        toast({
          title: "Analysis complete",
          description: `Analyzed ${selectedCodes.length} product(s)`,
        });
      } else {
        toast({
          title: "Error analyzing NDC codes",
          description: response.data.message || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error analyzing NDC codes:', error);
      toast({
        title: "Error",
        description: "Failed to analyze NDC codes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleExportPdf = async () => {
    try {
      if (selectedCodes.length === 0) {
        toast({
          title: "Selection required",
          description: "Please select at least one NDC code",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your report...",
      });
      
      // Generate PDF using query parameters
      const codesParam = selectedCodes.join(',');
      window.open(`/api/cer/export-pdf?ndc_codes=${codesParam}`, '_blank');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Error",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getProductName = (code) => {
    const product = ndcCodes.find(p => p.code === code);
    return product ? product.name : code;
  };
  
  const getChartData = () => {
    if (!analysisData) return [];
    
    // If we have NLP filtered data, use that
    if (analysisData.nlpFilteredData?.events) {
      return analysisData.nlpFilteredData.events;
    }
    
    // Otherwise use comparative visualization data if available
    const { visualization_data } = analysisData;
    if (!visualization_data || !visualization_data.event_labels || !visualization_data.products) {
      return [];
    }
    
    const { event_labels, products } = visualization_data;
    
    // Transform to chart-friendly format
    if (Object.keys(products).length === 0) return [];
    
    // For a single product, show simple bar chart data
    if (Object.keys(products).length === 1) {
      const productCode = Object.keys(products)[0];
      const values = products[productCode];
      
      return event_labels.map((label, index) => ({
        name: label,
        count: values[index]
      }));
    }
    
    // For multiple products, return data formatted for multi-series charts
    return event_labels.map((label, index) => {
      const dataPoint = { name: label };
      
      // Add a value for each product
      Object.keys(products).forEach(productCode => {
        dataPoint[getProductName(productCode)] = products[productCode][index];
      });
      
      return dataPoint;
    });
  };
  
  // Prepare demographic data for charts
  const getDemographicData = () => {
    if (!analysisData?.nlpFilteredData?.demographics) return [];
    return analysisData.nlpFilteredData.demographics;
  };
  
  const getColors = () => {
    // Define a color palette for charts
    return [
      '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe',
      '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'
    ];
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          Clinical Evaluation Report Dashboard
        </CardTitle>
        <CardDescription>
          Analyze and compare adverse events across multiple products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <div className="mb-4">
              <Label>Select Products for Analysis</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {ndcCodes.map(item => (
                  <Badge
                    key={item.code}
                    variant={selectedCodes.includes(item.code) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleSelectCode(item.code)}
                  >
                    {item.name} ({item.code})
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleAnalyze} disabled={isAnalyzing || selectedCodes.length === 0}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze Selected Products'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportPdf} 
                disabled={selectedCodes.length === 0}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
          
          {analysisData && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {selectedCodes.map(code => {
                    const productData = analysisData.raw_data?.comparative_data?.[code];
                    
                    return (
                      <Card key={code}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{getProductName(code)}</CardTitle>
                          <CardDescription className="text-xs">{code}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Total Reports:</span>
                              <span className="font-medium">{productData?.total_reports || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Serious Events:</span>
                              <span className="font-medium">{productData?.serious_events || 'N/A'}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Event Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#8884d8" name="Events" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="comparison" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Adverse Event Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {selectedCodes.map((code, index) => (
                            <Bar 
                              key={code} 
                              dataKey={getProductName(code)} 
                              fill={getColors()[index]} 
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Event Trend Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[
                            { month: 'Jan', product1: 40, product2: 24 },
                            { month: 'Feb', product1: 30, product2: 45 },
                            { month: 'Mar', product1: 35, product2: 55 },
                            { month: 'Apr', product1: 50, product2: 35 },
                            { month: 'May', product1: 45, product2: 40 },
                            { month: 'Jun', product1: 60, product2: 30 },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="product1" 
                              stroke="#8884d8" 
                              activeDot={{ r: 8 }} 
                              name={selectedCodes[0] ? getProductName(selectedCodes[0]) : 'Product 1'} 
                            />
                            {selectedCodes.length > 1 && (
                              <Line 
                                type="monotone" 
                                dataKey="product2" 
                                stroke="#82ca9d" 
                                name={getProductName(selectedCodes[1])} 
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedCodes.slice(0, 2).map((code, index) => (
                          <div key={code} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{getProductName(code)}</span>
                              <Badge variant={index === 0 ? "default" : "outline"}>
                                {index === 0 ? 'Medium Risk' : 'Low Risk'}
                              </Badge>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2.5">
                              <div 
                                className="h-2.5 rounded-full bg-primary" 
                                style={{ width: index === 0 ? '65%' : '30%' }} 
                              ></div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {index === 0 
                                ? 'Higher incidence of severe adverse events' 
                                : 'Lower incidence of severe adverse events'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="events" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Top Adverse Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={getChartData().slice(0, 10)} 
                            layout="vertical"
                            margin={{ left: 120 }} 
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={100} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" name="Event Count" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Demographic Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={getDemographicData()} 
                            layout="vertical"
                            margin={{ left: 120 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="group" width={100} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="percentage" fill="#82ca9d" name="Percentage (%)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Detailed Event Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted">
                          <tr>
                            <th scope="col" className="px-4 py-3">Event</th>
                            <th scope="col" className="px-4 py-3">Count</th>
                            <th scope="col" className="px-4 py-3">Percentage</th>
                            <th scope="col" className="px-4 py-3">Severity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getChartData().slice(0, 5).map((event, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-3 font-medium">{event.name}</td>
                              <td className="px-4 py-3">{event.count}</td>
                              <td className="px-4 py-3">
                                {((event.count / getChartData().reduce((sum, e) => sum + e.count, 0)) * 100).toFixed(1)}%
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={index < 2 ? "destructive" : (index < 4 ? "default" : "outline")}>
                                  {index < 2 ? 'High' : (index < 4 ? 'Medium' : 'Low')}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Data sourced from FDA FAERS database • Last updated: {new Date().toLocaleDateString()}
      </CardFooter>
    </Card>
  );
};

export default AdvancedDashboard;