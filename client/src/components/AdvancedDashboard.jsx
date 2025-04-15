// AdvancedDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, AlertCircle, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdvancedDashboard({ ndcCodes = [] }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("comparisons");
  const { toast } = useToast();

  // Load comparison data for the NDC codes
  useEffect(() => {
    const fetchData = async () => {
      if (!ndcCodes || ndcCodes.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await apiRequest('POST', '/api/cer/compare', {
          ndc_codes: ndcCodes
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch comparison data: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result.comparative_data);
      } catch (err) {
        console.error('Error fetching comparative data:', err);
        setError(err.message);
        toast({
          title: "Data Loading Error",
          description: err.message || "Could not load comparison data",
          variant: "destructive",
        });
        
        // Use simulated data for development until backend is ready
        setData(generateSimulatedData(ndcCodes));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [ndcCodes, toast]);

  // Generate chart data for event comparisons
  const getEventComparisonData = () => {
    if (!data) return [];
    
    const events = new Set();
    Object.values(data).forEach(productData => {
      Object.keys(productData.event_summary || {}).forEach(event => events.add(event));
    });
    
    return Array.from(events).map(event => {
      const chartPoint = { name: event };
      Object.entries(data).forEach(([ndc, productData]) => {
        chartPoint[ndc] = productData.event_summary?.[event] || 0;
      });
      return chartPoint;
    });
  };

  // Generate forecast chart data
  const getForecastData = () => {
    if (!data) return [];
    
    // Get all quarters from all forecasts
    const quarters = new Set();
    Object.values(data).forEach(productData => {
      Object.values(productData.forecasts || {}).forEach(eventForecasts => {
        Object.keys(eventForecasts).forEach(quarter => quarters.add(quarter));
      });
    });
    
    // Create chart data for each quarter
    return Array.from(quarters).map(quarter => {
      const chartPoint = { name: quarter };
      Object.entries(data).forEach(([ndc, productData]) => {
        let total = 0;
        Object.values(productData.forecasts || {}).forEach(eventForecasts => {
          total += eventForecasts[quarter] || 0;
        });
        chartPoint[ndc] = total;
      });
      return chartPoint;
    }).sort((a, b) => {
      // Sort quarters chronologically
      return a.name.localeCompare(b.name);
    });
  };

  // Generate simulated data for development purposes
  const generateSimulatedData = (ndcCodes) => {
    const simulatedData = {};
    
    const commonEvents = [
      'Headache', 'Nausea', 'Dizziness', 'Fatigue', 'Rash',
      'Vomiting', 'Diarrhea', 'Pain', 'Fever', 'Insomnia'
    ];
    
    const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
    
    ndcCodes.forEach(ndc => {
      const eventSummary = {};
      commonEvents.forEach(event => {
        eventSummary[event] = Math.floor(Math.random() * 30) + 1;
      });
      
      const forecasts = {};
      commonEvents.slice(0, 5).forEach(event => {
        forecasts[event] = {};
        let baseValue = Math.floor(Math.random() * 10) + 5;
        quarters.forEach((quarter, index) => {
          // Simulate slight changes over quarters
          const adjustment = (Math.random() - 0.3) * 3;
          forecasts[event][quarter] = Math.max(1, Math.round(baseValue + adjustment - index * 0.5));
        });
      });
      
      simulatedData[ndc] = {
        report_count: Math.floor(Math.random() * 5) + 1,
        event_summary: eventSummary,
        forecasts: forecasts
      };
    });
    
    return simulatedData;
  };

  // Prepare data views
  const eventComparisonData = getEventComparisonData();
  const forecastData = getForecastData();

  // Define chart colors
  const chartColors = ['#2563eb', '#16a34a', '#db2777', '#ea580c', '#9333ea'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading comparative data...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-destructive/10 text-destructive p-6 rounded-lg space-y-3">
        <h3 className="text-xl font-medium flex items-center">
          <AlertCircle className="mr-2" />
          Error Loading Analytics
        </h3>
        <p>{error}</p>
        <Button variant="destructive" className="mt-2" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-muted p-8 rounded-lg text-center space-y-4">
        <div className="flex justify-center">
          <Shield className="w-16 h-16 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium">No Comparative Data Available</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Please select NDC codes to analyze, or check that the selected codes have available data in the system.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(data).map(([ndc, productData], index) => (
          <Card key={ndc}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: chartColors[index % chartColors.length] }}
                ></div>
                NDC: {ndc}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reports:</span>
                  <span className="font-medium">{productData.report_count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unique Events:</span>
                  <span className="font-medium">{Object.keys(productData.event_summary || {}).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Forecast Periods:</span>
                  <span className="font-medium">
                    {Object.values(productData.forecasts || {}).length > 0 
                      ? Object.keys(Object.values(productData.forecasts)[0]).length 
                      : 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="comparisons">Event Comparisons</TabsTrigger>
          <TabsTrigger value="forecasts">Trend Forecasts</TabsTrigger>
        </TabsList>
        
        {/* Event Comparisons Tab */}
        <TabsContent value="comparisons">
          <Card>
            <CardHeader>
              <CardTitle>Adverse Event Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={eventComparisonData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(data).map((ndc, index) => (
                      <Bar 
                        key={ndc} 
                        dataKey={ndc} 
                        fill={chartColors[index % chartColors.length]} 
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 space-y-4">
                <h4 className="text-lg font-medium flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Key Insights
                </h4>
                <ul className="space-y-2">
                  {eventComparisonData.length > 0 ? (
                    Object.keys(data).map((ndc, index) => {
                      // Find the highest event for this NDC
                      const highestEvent = eventComparisonData.reduce((prev, current) => 
                        (current[ndc] > (prev[ndc] || 0)) ? current : prev, 
                        {}
                      );
                      
                      return (
                        <li key={`insight-${index}`} className="flex">
                          <ChevronRight className="w-5 h-5 mr-1 flex-shrink-0 text-muted-foreground" />
                          <span><span className="font-medium">{ndc}</span>: Most common adverse event is <span className="font-medium">{highestEvent.name}</span> with {highestEvent[ndc]} occurrences.</span>
                        </li>
                      );
                    })
                  ) : (
                    <li className="text-muted-foreground">No significant insights available from current data.</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Forecast Tab */}
        <TabsContent value="forecasts">
          <Card>
            <CardHeader>
              <CardTitle>Trend Forecast (All Events)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={forecastData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(data).map((ndc, index) => (
                      <Line 
                        key={ndc} 
                        type="monotone" 
                        dataKey={ndc} 
                        stroke={chartColors[index % chartColors.length]} 
                        activeDot={{ r: 8 }} 
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 space-y-4">
                <h4 className="text-lg font-medium flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Forecast Analysis
                </h4>
                <ul className="space-y-2">
                  {forecastData.length > 0 ? (
                    Object.keys(data).map((ndc, index) => {
                      // Calculate trend direction
                      const firstValue = forecastData[0]?.[ndc] || 0;
                      const lastValue = forecastData[forecastData.length - 1]?.[ndc] || 0;
                      const trend = lastValue > firstValue 
                        ? "increasing" 
                        : lastValue < firstValue 
                          ? "decreasing" 
                          : "stable";
                      const trendDesc = trend === "increasing" 
                        ? "upward" 
                        : trend === "decreasing" 
                          ? "downward" 
                          : "stable";
                      
                      return (
                        <li key={`forecast-${index}`} className="flex">
                          <ChevronRight className="w-5 h-5 mr-1 flex-shrink-0 text-muted-foreground" />
                          <span>
                            <span className="font-medium">{ndc}</span>: Shows a <span className="font-medium">{trendDesc}</span> trend with
                            {trend === "increasing" 
                              ? ` an increase of ${Math.round((lastValue / firstValue - 1) * 100)}% projected.` 
                              : trend === "decreasing" 
                                ? ` a decrease of ${Math.round((1 - lastValue / firstValue) * 100)}% projected.`
                                : " no significant change projected."}
                          </span>
                        </li>
                      );
                    })
                  ) : (
                    <li className="text-muted-foreground">No forecast data available for trend analysis.</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}