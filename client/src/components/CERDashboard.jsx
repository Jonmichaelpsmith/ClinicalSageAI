import React, { useState, useEffect, useMemo, useContext, createContext } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Sun, Moon, Download, Share, Check } from 'lucide-react';

// Constants
const viewModes = ['Chart', 'Table'];

// --- Auth and Theme Contexts ---
const AuthContext = createContext({ isAuthenticated: false });
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  return { theme, toggleTheme };
}

export default function CERDashboard() {
  const [tab, setTab] = useState('FAERS');
  const themeContext = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('cer_auth') === 'true';
  });
  
  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('cer_auth', 'true');
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('cer_auth', 'false');
  };
  
  // Set from URL params if available
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['FAERS', 'Device', 'Multi-Source'].includes(tabParam)) {
      setTab(tabParam);
    }
  }, []);

  // Persist tab selection
  useEffect(() => {
    localStorage.setItem('cer_active_tab', tab);
  }, [tab]);

  // Check authentication status
  if (!isAuthenticated) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-muted/30">
            <h2 className="text-2xl font-bold">Authentication Required</h2>
            <p className="text-sm text-muted-foreground">Please log in to access the CER Dashboard</p>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="mb-6 text-center max-w-md">
              <p className="mb-4">You need to be authenticated to view the Enhanced CER Dashboard and its features.</p>
              <ul className="text-sm text-left list-disc pl-5 mb-4 space-y-1">
                <li>Access to FAERS data analysis</li>
                <li>Device analytics integration</li>
                <li>Multi-source regulatory reporting</li>
                <li>PDF report generation</li>
              </ul>
            </div>
            <Button 
              size="lg" 
              onClick={login} 
              className="px-8 py-2 font-medium"
            >
              Login to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = ['FAERS', 'Device', 'Multi-Source'];
  
  return (
    <ThemeContext.Provider value={themeContext}>
      <div className={`p-8 max-w-6xl mx-auto transition-colors duration-200 ${themeContext.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold">TrialSage CER Dashboard</h1>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout} 
              aria-label="Logout"
            >
              Logout
            </Button>
            <Button 
              variant="outline"
              onClick={themeContext.toggleTheme}
              aria-label="Toggle theme"
            >
              {themeContext.theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </Button>
          </div>
        </header>
        
        <nav className="mb-6 flex space-x-4" aria-label="Main navigation">
          {tabs.map(t => (
            <Button
              key={t}
              variant={tab === t ? 'default' : 'outline'}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              aria-label={`Switch to ${t} tab`}
            >
              {t}
            </Button>
          ))}
        </nav>
        
        <main>
          {tab === 'FAERS' && <EndpointPanel type="faers" />}
          {tab === 'Device' && <EndpointPanel type="device" />}
          {tab === 'Multi-Source' && <MultiSourcePanel />}
        </main>
      </div>
    </ThemeContext.Provider>
  );
}

function EndpointPanel({ type, placeholder }) {
  const storageKey = `cer_${type}_prefs`;
  const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
  const [code, setCode] = useState(saved.code || '');
  const [periods, setPeriods] = useState(saved.periods || 6);
  const [startDate, setStartDate] = useState(saved.startDate ? new Date(saved.startDate) : new Date(new Date().setFullYear(new Date().getFullYear() - 5)));
  const [endDate, setEndDate] = useState(saved.endDate ? new Date(saved.endDate) : new Date());
  const [viewMode, setViewMode] = useState(saved.viewMode || 'Chart');
  const [filterSeverity, setFilterSeverity] = useState(saved.filterSeverity || 'all');
  const [data, setData] = useState(null);
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const title = placeholder ? placeholder.split('(')[0].trim() : type.toUpperCase();
  const apiBase = `/api/narrative/${type}/${code}`;
  const { theme } = useContext(ThemeContext);

  // Check URL params on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('code')) setCode(params.get('code'));
    if (params.has('periods')) setPeriods(Number(params.get('periods')));
    if (params.has('start_date')) {
      try {
        setStartDate(new Date(params.get('start_date')));
      } catch (e) {
        console.error('Invalid start date in URL', e);
      }
    }
    if (params.has('end_date')) {
      try {
        setEndDate(new Date(params.get('end_date')));
      } catch (e) {
        console.error('Invalid end date in URL', e);
      }
    }
    if (params.has('severity')) setFilterSeverity(params.get('severity'));
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({
      code, periods, startDate, endDate, filterSeverity, viewMode
    }));
  }, [code, periods, startDate, endDate, filterSeverity, viewMode, storageKey]);
  
  // Apply severity filter to data
  const filteredData = useMemo(() => {
    if (!data || !data.trend) return null;
    
    if (filterSeverity === 'all') return data.trend;
    
    // This is a demo stub - in a real app we would filter based on severity
    // from the actual data. Here we're just showing how it would work.
    const filtered = { ...data.trend };
    if (filterSeverity === 'serious') {
      // For demo: only show dates with higher counts (simulating serious events)
      return Object.fromEntries(
        Object.entries(filtered).filter(([_, value]) => value > 3)
      );
    }
    return filtered;
  }, [data, filterSeverity]);

  // Prepare chart data from filtered data
  const chartData = useMemo(() => {
    if (!filteredData) return [];
    return Object.entries(filteredData).map(([date, value]) => ({ date, value }));
  }, [filteredData]);

  const fetchNarrative = async () => {
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ 
        periods, 
        start_date: startDate.toISOString(), 
        end_date: endDate.toISOString(),
        severity: filterSeverity
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

  // Export data as CSV
  const exportCSV = () => {
    if (!chartData.length) return;
    const csv = ['Date,Count', ...chartData.map(r => `${r.date},${r.value}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_${code}_trend.csv`;
    a.click();
  };

  // Generate shareable link
  const shareLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      tab: type,
      code,
      periods,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      severity: filterSeverity
    });
    
    const fullLink = `${baseUrl}?${params.toString()}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(fullLink)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        // Fallback
        window.prompt('Copy this link:', fullLink);
      });
  };

  return (
    <Card className="space-y-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <span className="text-xs text-muted-foreground">{type.toUpperCase()} Dataset</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Main controls */}
        <div className="grid grid-cols-6 gap-4 items-end">
          <div className="col-span-2">
            <label htmlFor={`${type}-product-code`} className="text-sm mb-1 block text-muted-foreground">
              Product Code
            </label>
            <Input
              id={`${type}-product-code`}
              placeholder={placeholder}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-label="Product code"
            />
          </div>
          <div>
            <label htmlFor={`${type}-periods`} className="text-sm mb-1 block text-muted-foreground">
              Periods
            </label>
            <Input
              id={`${type}-periods`}
              type="number"
              min={1}
              max={12}
              value={periods}
              onChange={(e) => setPeriods(Number(e.target.value))}
              aria-label="Forecast periods"
            />
          </div>
          <div>
            <label htmlFor={`${type}-start-date`} className="text-sm mb-1 block text-muted-foreground">
              Start Date
            </label>
            <Input
              id={`${type}-start-date`}
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              aria-label="Start date"
            />
          </div>
          <div>
            <label htmlFor={`${type}-end-date`} className="text-sm mb-1 block text-muted-foreground">
              End Date
            </label>
            <Input
              id={`${type}-end-date`}
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              aria-label="End date"
            />
          </div>
          <div>
            <label htmlFor={`${type}-severity-filter`} className="text-sm mb-1 block text-muted-foreground">
              Severity Filter
            </label>
            <Select 
              value={filterSeverity} 
              onValueChange={setFilterSeverity}
              aria-label="Filter by severity"
            >
              <SelectTrigger id={`${type}-severity-filter`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="serious">Serious Only</SelectItem>
                <SelectItem value="non-serious">Non-Serious Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-5">
          <Button 
            onClick={fetchNarrative} 
            disabled={!code || loading} 
            className="flex items-center"
            aria-label="Generate report"
          >
            {loading ? <Spinner className="mr-2 h-4 w-4" /> : 'Generate'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams({ 
                periods, 
                start_date: startDate, 
                end_date: endDate,
                severity: filterSeverity 
              });
              window.open(`${apiBase}/pdf?${params}`, '_blank');
            }}
            disabled={!narrative}
            aria-label="Download PDF report"
            className="flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={exportCSV}
            disabled={!chartData.length}
            aria-label="Export data as CSV"
          >
            Export CSV
          </Button>
          
          <Button
            variant={copySuccess ? "success" : "secondary"}
            onClick={shareLink}
            disabled={!code}
            aria-label="Share link to this view"
            className="flex items-center gap-1"
          >
            {copySuccess ? <Check className="w-4 h-4" /> : <Share className="w-4 h-4" />}
            <span>{copySuccess ? 'Copied!' : 'Share'}</span>
          </Button>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-800 dark:bg-red-900/50 dark:text-red-300">
            <p>Error: {error}</p>
          </div>
        )}
        
        {/* Chart/Table display */}
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
                    aria-label={`Switch to ${mode} view`}
                    aria-pressed={viewMode === mode}
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
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: theme === 'dark' ? '#ccc' : '#333' }}
                  />
                  <YAxis 
                    tick={{ fill: theme === 'dark' ? '#ccc' : '#333' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      color: theme === 'dark' ? '#fff' : '#000'
                    }}
                  />
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
            <div className="text-xs text-right mt-1 text-muted-foreground">
              Showing {chartData.length} data points {filterSeverity !== 'all' && `(filtered by ${filterSeverity})`}
            </div>
          </div>
        )}
        
        {/* Narrative */}
        {narrative && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <h3 className="text-lg font-medium mb-2">Generated Narrative</h3>
            <ScrollArea 
              className="h-96 p-4 bg-muted/30 rounded-xl border"
              aria-label="Generated narrative text"
            >
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
  // Get saved preferences from localStorage
  const storageKey = 'cer_multi_prefs';
  const savedPrefs = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch (e) {
      console.error('Error loading multi-source preferences:', e);
      return {};
    }
  }, []);

  // Initialize state with saved preferences or defaults
  const [ndc, setNdc] = useState(savedPrefs.ndc || '00002-3227');
  const [device, setDevice] = useState(savedPrefs.device || '');
  const [periods, setPeriods] = useState(savedPrefs.periods || 6);
  const [startDate, setStartDate] = useState(savedPrefs.startDate ? new Date(savedPrefs.startDate) : 
    new Date(new Date().setFullYear(new Date().getFullYear() - 5)));
  const [endDate, setEndDate] = useState(savedPrefs.endDate ? new Date(savedPrefs.endDate) : 
    new Date());
  const [viewMode, setViewMode] = useState(savedPrefs.viewMode || viewModes[0]);
  const [filterSeverity, setFilterSeverity] = useState(savedPrefs.filterSeverity || 'all');
  const [dataList, setDataList] = useState([]);
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [cachingStep, setCachingStep] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const { theme } = useContext(ThemeContext);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({
      ndc, device, periods, startDate, endDate, filterSeverity, viewMode
    }));
  }, [ndc, device, periods, startDate, endDate, filterSeverity, viewMode]);

  // Check URL params on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('ndc')) setNdc(params.get('ndc'));
    if (params.has('device')) setDevice(params.get('device'));
    if (params.has('periods')) setPeriods(Number(params.get('periods')));
    if (params.has('start_date')) {
      try {
        setStartDate(new Date(params.get('start_date')));
      } catch (e) {
        console.error('Invalid start date in URL', e);
      }
    }
    if (params.has('end_date')) {
      try {
        setEndDate(new Date(params.get('end_date')));
      } catch (e) {
        console.error('Invalid end date in URL', e);
      }
    }
    if (params.has('severity')) setFilterSeverity(params.get('severity'));
  }, []);

  // Apply severity filter to data
  const filteredDataList = useMemo(() => {
    if (!dataList.length) return [];
    
    if (filterSeverity === 'all') return dataList;
    
    // Filter data based on severity
    return dataList.map(item => {
      const filtered = { ...item };
      if (filterSeverity === 'serious' && filtered.trend) {
        // For demo: only show dates with higher counts (simulating serious events)
        filtered.trend = Object.fromEntries(
          Object.entries(filtered.trend).filter(([_, value]) => value > 3)
        );
      }
      return filtered;
    });
  }, [dataList, filterSeverity]);

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
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        severity: filterSeverity
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
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
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
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
            />
          </div>
          <div className="col-span-3">
            <label className="text-sm mb-1 block text-muted-foreground">End Date</label>
            <Input
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
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