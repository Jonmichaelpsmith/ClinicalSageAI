import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const tabItems = [
  { value: 'faers', label: 'Drug Safety (FAERS)' },
  { value: 'device', label: 'Device Complaints (MAUDE)' },
  { value: 'multi', label: 'Multi-Source CER' }
];
const viewModes = ['Chart', 'Table'];

export default function CERDashboard() {
  const [activeTab, setActiveTab] = useState("faers");

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-8">TrialSage Clinical Evaluation Reports</h1>
      
      <Tabs defaultValue="faers" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {tabItems.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-6 py-2">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="faers">
          <EndpointPanel
            type="faers"
            placeholder="Enter NDC code, e.g. 00002-3227"
          />
        </TabsContent>
        
        <TabsContent value="device">
          <EndpointPanel
            type="device"
            placeholder="Enter Device code, e.g. DSP"
          />
        </TabsContent>
        
        <TabsContent value="multi">
          <MultiSourcePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EndpointPanel({ type, placeholder }) {
  const [code, setCode] = useState('');
  const [periods, setPeriods] = useState(6);
  const [startDate, setStartDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().slice(0,10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0,10));
  const [viewMode, setViewMode] = useState(viewModes[0]);
  const [data, setData] = useState(null);
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const title = placeholder.split('(')[0].trim();
  const apiBase = `/api/narrative/${type}/${code}`;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setNarrative('');
    try {
      const params = new URLSearchParams({ 
        periods, 
        start_date: startDate, 
        end_date: endDate 
      });
      const res = await fetch(`${apiBase}?${params}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json);
      setNarrative(json.narrative);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!data || !data.analysis || !data.analysis.trend) return [];
    return Object.entries(data.analysis.trend).map(([date, value]) => ({ date, value }));
  }, [data]);

  return (
    <Card className="space-y-6">
      <CardHeader>
        <h2 className="text-2xl font-semibold">{title}</h2>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-4 items-end">
          <div className="col-span-2">
            <label className="text-sm mb-1 block text-muted-foreground">Product Code</label>
            <Input
              placeholder={placeholder}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm mb-1 block text-muted-foreground">Periods</label>
            <Input
              type="number"
              min={1}
              max={12}
              value={periods}
              onChange={(e) => setPeriods(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm mb-1 block text-muted-foreground">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm mb-1 block text-muted-foreground">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={fetchData} disabled={!code || loading} className="flex items-center">
              {loading ? <Spinner className="mr-2 h-4 w-4" /> : 'Generate'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const params = new URLSearchParams({ periods, start_date: startDate, end_date: endDate });
                window.open(`${apiBase}/pdf?${params}`, '_blank');
              }}
              disabled={!narrative}
            >
              Download PDF
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-800">
            <p>Error: {error}</p>
          </div>
        )}
        
        {chartData.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Trend Analysis</h3>
              <div className="flex border border-input rounded-md overflow-hidden">
                {viewModes.map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 text-sm ${
                      viewMode === mode
                        ? 'bg-primary text-white'
                        : 'bg-transparent hover:bg-muted/50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            
            {viewMode === 'Chart' ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--color-primary)" 
                    strokeWidth={2} 
                    dot={false} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ScrollArea className="max-h-64 mt-2 border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((row, i) => (
                      <tr key={i} className={i % 2 ? 'bg-muted/20' : ''}>
                        <td className="p-2">{row.date}</td>
                        <td className="p-2 text-right">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </div>
        )}
        
        {narrative && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-6"
          >
            <h3 className="text-lg font-medium mb-2">Generated Narrative</h3>
            <ScrollArea className="h-96 p-4 bg-muted/30 rounded-xl border">
              <div className="whitespace-pre-wrap text-base leading-relaxed">
                {narrative}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function MultiSourcePanel() {
  const [ndc, setNdc] = useState('00002-3227');
  const [device, setDevice] = useState('');
  const [periods, setPeriods] = useState(6);
  const [startDate, setStartDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().slice(0,10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0,10));
  const [viewMode, setViewMode] = useState(viewModes[0]);
  const [dataList, setDataList] = useState([]);
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [cachingStep, setCachingStep] = useState(false);
  const [error, setError] = useState(null);

  const fetchMulti = async () => {
    setLoading(true);
    setError(null);
    setNarrative('');
    setCachingStep(true);
    setDataList([]);
    
    try {
      const ndcCodes = ndc ? ndc.split(',').map(s => s.trim()) : [];
      const deviceCodes = device ? device.split(',').map(s => s.trim()) : [];
      
      const body = { 
        ndc_codes: ndcCodes, 
        device_codes: deviceCodes,
        periods,
        start_date: startDate,
        end_date: endDate
      };
      
      // Step 1: Generate and cache the narrative
      const res = await fetch('/api/narrative/multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) throw new Error(await res.text());
      
      const json = await res.json();
      setDataList(json.analysis?.analyses || []);
      setNarrative(json.narrative);
      setCachingStep(false);
    } catch (e) {
      setError(e.message);
      setCachingStep(false);
    } finally {
      setLoading(false);
    }
  };

  const generatePdf = async () => {
    if (!narrative) return;
    
    setPdfLoading(true);
    try {
      const ndcCodes = ndc ? ndc.split(',').map(s => s.trim()) : [];
      const deviceCodes = device ? device.split(',').map(s => s.trim()) : [];
      
      const body = { 
        ndc_codes: ndcCodes, 
        device_codes: deviceCodes, 
        periods,
        start_date: startDate,
        end_date: endDate
      };
      
      // Open a new window that will receive the PDF
      const win = window.open('', '_blank');
      
      // Make a fetch request to get the PDF
      const response = await fetch('/api/narrative/multi/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/pdf')) {
          // Get the PDF as a blob
          const blob = await response.blob();
          // Create a URL for the blob
          const url = URL.createObjectURL(blob);
          // Navigate the window to the URL
          win.location.href = url;
        } else {
          // If we got a JSON response, it means we need to generate the narrative first
          const data = await response.json();
          console.log('PDF response:', data);
          win.document.write(`<pre>${JSON.stringify(data, null, 2)}</pre>`);
        }
      } else {
        win.document.write('Error generating PDF. Please try again.');
      }
    } catch (e) {
      console.error('PDF generation error:', e);
      setError('PDF generation failed: ' + e.message);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <Card className="space-y-6">
      <CardHeader>
        <h2 className="text-2xl font-semibold">Multi-Source CER</h2>
        <p className="text-sm text-muted-foreground">Combine data from multiple regulatory sources into a comprehensive report</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-4 items-end">
          <div className="col-span-2">
            <label className="text-sm mb-1 block text-muted-foreground">NDC Codes (comma-separated)</label>
            <Input
              placeholder="e.g. 00002-3227, 00002-8215"
              value={ndc}
              onChange={(e) => setNdc(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm mb-1 block text-muted-foreground">Device Codes (comma-separated)</label>
            <Input
              placeholder="e.g. DSP, K123456"
              value={device}
              onChange={(e) => setDevice(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm mb-1 block text-muted-foreground">Periods</label>
            <Input
              type="number"
              min={1}
              max={12}
              value={periods}
              onChange={(e) => setPeriods(Number(e.target.value))}
            />
          </div>
          <div>
            <div className="flex space-x-2">
              <Button 
                onClick={fetchMulti} 
                disabled={loading || (!ndc && !device)}
                className="flex items-center"
              >
                {loading && <Spinner className="mr-2 h-4 w-4" />}
                {cachingStep ? 'Generating...' : 'Generate'}
              </Button>
              <Button
                variant="outline"
                onClick={generatePdf}
                disabled={!narrative || pdfLoading}
                className="flex items-center"
              >
                {pdfLoading && <Spinner className="mr-2 h-4 w-4" />}
                PDF
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-6 gap-4 mt-4">
          <div className="col-span-3">
            <label className="text-sm mb-1 block text-muted-foreground">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-span-3">
            <label className="text-sm mb-1 block text-muted-foreground">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-800 my-4">
            <p>Error: {error}</p>
          </div>
        )}
        
        {dataList.length > 0 && (
          <div className="my-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Data Source Analysis</h3>
              <div className="flex border border-input rounded-md overflow-hidden">
                {viewModes.map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 text-sm ${
                      viewMode === mode
                        ? 'bg-primary text-white'
                        : 'bg-transparent hover:bg-muted/50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataList.map((a, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="py-3 px-4 bg-muted/50">
                    <h4 className="font-medium text-sm">{a.source}: {a.product_code}</h4>
                  </CardHeader>
                  <CardContent className="p-4">
                    {viewMode === 'Chart' ? (
                      a.trend && Object.keys(a.trend).length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={Object.entries(a.trend).map(([date, value]) => ({ date, value }))} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{fontSize: 10}} />
                            <YAxis tick={{fontSize: 10}} />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-sm text-muted-foreground">No trend data available</p>
                      )
                    ) : (
                      a.trend && Object.keys(a.trend).length > 0 ? (
                        <ScrollArea className="max-h-44 border rounded-md">
                          <table className="w-full text-sm">
                            <thead className="bg-muted sticky top-0">
                              <tr>
                                <th className="p-2 text-left">Date</th>
                                <th className="p-2 text-right">Count</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(a.trend).map(([date, value], idx) => (
                                <tr key={idx} className={idx % 2 ? 'bg-muted/20' : ''}>
                                  <td className="p-2">{date}</td>
                                  <td className="p-2 text-right">{value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </ScrollArea>
                      ) : (
                        <p className="text-sm text-muted-foreground">No data available</p>
                      )
                    )}
                    
                    {a.total_count !== undefined && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-muted/30 rounded">
                          <span className="block text-xs text-muted-foreground">Total Reports</span>
                          <span className="font-semibold">{a.total_count}</span>
                        </div>
                        {a.serious_count !== undefined && (
                          <div className="p-2 bg-muted/30 rounded">
                            <span className="block text-xs text-muted-foreground">Serious Events</span>
                            <span className="font-semibold">{a.serious_count}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {narrative && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            className="mt-6"
          >
            <h3 className="text-lg font-medium mb-2">Combined Narrative</h3>
            <ScrollArea className="h-96 p-4 bg-muted/30 rounded-xl border">
              <div className="whitespace-pre-wrap text-base leading-relaxed">
                {narrative}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function AnalyticsChart({ data }) {
  const chartData = Object.entries(data || {}).map(([date, value]) => ({ date, value }));
  
  if (chartData.length === 0) {
    return <p className="text-sm text-muted-foreground">No data available for chart</p>;
  }
  
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis 
          dataKey="date" 
          angle={-45}
          textAnchor="end"
          height={50}
          tick={{fontSize: 10}}
        />
        <YAxis tick={{fontSize: 10}} />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="var(--color-primary)" 
          strokeWidth={2} 
          dot={{ r: 2 }} 
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}