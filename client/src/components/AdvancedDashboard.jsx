// AdvancedDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, LineChart as LineChartIcon, PieChart, TrendingUp, ChevronRight, AlertCircle, ListFilter } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiRequest } from "@/lib/queryClient";

export default function AdvancedDashboard({ ndcCodes, token }) {
  const [comparativeData, setComparativeData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ event: '', minCount: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  const fetchComparativeData = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/cer/compare', { 
        ndc_codes: ndcCodes 
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data.');
      }
      const data = await response.json();
      setComparativeData(data.comparative_data);
    } catch (err) {
      console.error('Error fetching comparative data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ndcCodes && ndcCodes.length > 0) {
      fetchComparativeData();
    }
  }, [ndcCodes]);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[350px] w-full" />
          <Skeleton className="h-[350px] w-full" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!comparativeData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>No comparative data available for the selected NDC codes.</AlertDescription>
      </Alert>
    );
  }

  // For simplicity, use data from the first NDC code if multiple are provided
  const firstNdc = ndcCodes[0];
  let ndcData = comparativeData[firstNdc];
  if (!ndcData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>No data available for NDC {firstNdc}</AlertDescription>
      </Alert>
    );
  }

  // Apply filters (e.g., filter by event name and min count)
  const filteredEventSummary = { ...ndcData.event_summary };
  if (filters.event) {
    Object.keys(filteredEventSummary).forEach(event => {
      if (event !== filters.event || filteredEventSummary[event] < filters.minCount) {
        delete filteredEventSummary[event];
      }
    });
  } else if (filters.minCount > 0) {
    Object.keys(filteredEventSummary).forEach(event => {
      if (filteredEventSummary[event] < filters.minCount) {
        delete filteredEventSummary[event];
      }
    });
  }

  const events = Object.keys(filteredEventSummary);
  const counts = events.map(event => filteredEventSummary[event]);

  const selectedForecast = 
    selectedEvent && ndcData.forecasts && ndcData.forecasts[selectedEvent]
      ? Object.entries(ndcData.forecasts[selectedEvent]).map(([quarter, count]) => ({ 
          quarter, 
          count 
        }))
      : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Advanced Comparative Analytics Dashboard</h2>
      
      <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="events">Event Analysis</TabsTrigger>
          <TabsTrigger value="forecast">Forecasting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Overview</CardTitle>
              <CardDescription>Statistical summary of reports analyzed for NDC {firstNdc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col p-4 border rounded-lg">
                  <span className="text-muted-foreground text-sm">Reports Analyzed</span>
                  <span className="text-3xl font-bold">{ndcData.report_count || 0}</span>
                </div>
                <div className="flex flex-col p-4 border rounded-lg">
                  <span className="text-muted-foreground text-sm">Unique Events</span>
                  <span className="text-3xl font-bold">{Object.keys(ndcData.event_summary).length}</span>
                </div>
                <div className="flex flex-col p-4 border rounded-lg">
                  <span className="text-muted-foreground text-sm">Data Quality</span>
                  <span className="text-3xl font-bold">
                    {ndcData.report_count > 10 ? 'High' : ndcData.report_count > 5 ? 'Medium' : 'Low'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Top Events</CardTitle>
                <CardDescription>Most frequently reported events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {events.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">No events found</div>
                  ) : (
                    events.slice(0, 5).map((event, index) => (
                      <div key={index} className="flex items-center justify-between border-b py-2">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          <span>{event}</span>
                        </div>
                        <Badge variant="outline">{ndcData.event_summary[event]}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Forecast Trends</CardTitle>
                <CardDescription>Projected event trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.keys(ndcData.forecasts || {}).length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">No forecast data available</div>
                  ) : (
                    Object.keys(ndcData.forecasts).slice(0, 5).map((event, index) => (
                      <div key={index} className="flex items-center justify-between border-b py-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>{event}</span>
                        </div>
                        <Badge variant={Object.values(ndcData.forecasts[event])[3] < Object.values(ndcData.forecasts[event])[0] ? "success" : "destructive"}>
                          {Object.values(ndcData.forecasts[event])[3] < Object.values(ndcData.forecasts[event])[0] ? "Decreasing" : "Increasing"}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Event Analysis</CardTitle>
              <CardDescription>Detailed breakdown of adverse events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <ListFilter className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Filter Events</span>
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Event Name:</label>
                    <select 
                      className="ml-2 p-1 border rounded"
                      value={filters.event}
                      onChange={(e) => applyFilters({ ...filters, event: e.target.value })}
                    >
                      <option value="">All Events</option>
                      {Object.keys(ndcData.event_summary).map((event) => (
                        <option key={event} value={event}>{event}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Min Count:</label>
                    <input
                      type="number"
                      className="ml-2 p-1 border rounded w-16"
                      value={filters.minCount}
                      onChange={(e) => applyFilters({ ...filters, minCount: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                </div>
              </div>
              
              <div className="h-[400px] overflow-y-auto">
                {events.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No events match the current filters
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-semibold">Event Summary for NDC {firstNdc}</h3>
                    </div>
                    
                    {/* Use Recharts for event visualization */}
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={events.map((event, index) => ({ 
                            name: event,
                            count: counts[index]
                          }))}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={150}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip
                            formatter={(value) => [`${value}`, 'Count']}
                          />
                          <Legend />
                          <Bar 
                            dataKey="count" 
                            name="Event Count"
                            fill="#8884d8" 
                            barSize={20}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>Event Forecasting</CardTitle>
              <CardDescription>Projected trends for adverse events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <label className="font-medium">Select an event for forecasting details: </label>
                <select 
                  className="ml-2 p-2 border rounded"
                  onChange={(e) => setSelectedEvent(e.target.value)} 
                  value={selectedEvent || ""}
                >
                  <option value="" disabled>-- Choose an event --</option>
                  {Object.keys(ndcData.forecasts || {}).map((event) => (
                    <option key={event} value={event}>{event}</option>
                  ))}
                </select>
              </div>
              
              <div className="h-[400px]">
                {!selectedEvent ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Select an event to view forecast data
                  </div>
                ) : selectedForecast.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No forecast data available for {selectedEvent}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <LineChart className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-semibold">Forecast for {selectedEvent}</h3>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      {selectedForecast.map((item, index) => (
                        <Card key={index} className="text-center">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md">{item.quarter}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <span className="text-2xl font-bold">{item.count}</span>
                            {index > 0 && (
                              <div className="mt-2">
                                <Badge variant={item.count < selectedForecast[index - 1].count ? "success" : 
                                  item.count > selectedForecast[index - 1].count ? "destructive" : "outline"}>
                                  {item.count < selectedForecast[index - 1].count ? "↓" : 
                                    item.count > selectedForecast[index - 1].count ? "↑" : "→"}
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="h-[250px] mt-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedForecast} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="quarter" />
                          <YAxis />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              border: '1px solid #ccc' 
                            }}
                            formatter={(value) => [`${value}`, 'Events']}
                            labelFormatter={(label) => `Quarter: ${label}`}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="count" 
                            name="Event Count" 
                            stroke="#8884d8" 
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}