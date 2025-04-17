import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, AlertTriangle, Loader2, TrendingUp, BarChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Mock data for visualizations
const MOCK_ADVERSE_EVENTS = [
  { name: 'Headache', count: 87 },
  { name: 'Nausea', count: 76 },
  { name: 'Fatigue', count: 59 },
  { name: 'Dizziness', count: 47 },
  { name: 'Rash', count: 33 }
];

const MOCK_MONTHLY_DATA = [
  { month: 'Jan', events: 42 },
  { month: 'Feb', events: 38 },
  { month: 'Mar', events: 47 },
  { month: 'Apr', events: 62 },
  { month: 'May', events: 55 },
  { month: 'Jun', events: 43 }
];

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export default function CERAPIDemo() {
  const [activeTab, setActiveTab] = useState('faers');
  const [ndcCode, setNdcCode] = useState('');
  const [deviceCode, setDeviceCode] = useState('');
  const [multiSourceCodes, setMultiSourceCodes] = useState('');
  const [period, setPeriod] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [visualizationData, setVisualizationData] = useState(null);
  const { toast } = useToast();

  // Initialize visualization data on component mount
  useEffect(() => {
    setVisualizationData({
      adverseEvents: MOCK_ADVERSE_EVENTS,
      monthlyTrends: MOCK_MONTHLY_DATA
    });
  }, []);

  const handleFetchData = async () => {
    setLoading(true);
    setDownloadReady(false);
    setResponseData(null);
    
    try {
      let endpoint;
      let payload = {};
      
      switch (activeTab) {
        case 'faers':
          if (!ndcCode.trim()) {
            throw new Error('Please enter a valid NDC code');
          }
          endpoint = '/api/cer/generate';
          payload = { ndc_code: ndcCode, period: period || undefined };
          break;
          
        case 'device':
          if (!deviceCode.trim()) {
            throw new Error('Please enter a valid device code');
          }
          endpoint = '/api/cer/device';
          payload = { device_code: deviceCode, period: period || undefined };
          break;
          
        case 'multi':
          if (!multiSourceCodes.trim()) {
            throw new Error('Please enter at least one code');
          }
          
          const codes = multiSourceCodes.split(',').map(code => code.trim());
          endpoint = '/api/cer/multi-source';
          payload = { 
            ndc_codes: codes.filter(code => code.includes('-')), 
            device_codes: codes.filter(code => !code.includes('-')),
            period: period || undefined
          };
          break;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      setResponseData(data);
      setDownloadReady(true);
      
      // In a real implementation, we would extract visualization data from the API response
      // For now, we'll use our mock data with a slight randomization
      setVisualizationData({
        adverseEvents: MOCK_ADVERSE_EVENTS.map(item => ({
          ...item,
          count: item.count + Math.floor(Math.random() * 10 - 5)
        })),
        monthlyTrends: MOCK_MONTHLY_DATA.map(item => ({
          ...item,
          events: item.events + Math.floor(Math.random() * 10 - 5)
        }))
      });
      
      toast({
        title: "Success",
        description: "Data fetched successfully. You can now download the PDF.",
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch data from API",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      
      let endpoint;
      let payload = {};
      
      switch (activeTab) {
        case 'faers':
          endpoint = '/api/cer/pdf';
          payload = { ndc_code: ndcCode };
          break;
          
        case 'device':
          endpoint = '/api/cer/device-pdf';
          payload = { device_code: deviceCode };
          break;
          
        case 'multi':
          const codes = multiSourceCodes.split(',').map(code => code.trim());
          endpoint = '/api/cer/multi-pdf';
          payload = { 
            ndc_codes: codes.filter(code => code.includes('-')), 
            device_codes: codes.filter(code => !code.includes('-')) 
          };
          break;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PDF API Error: ${response.status} - ${errorText}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element to trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `cer-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your PDF report is being downloaded.",
      });
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Download Error",
        description: error.message || "Failed to download PDF report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>CER API Demo</CardTitle>
        <CardDescription>
          Directly interact with the CER generation API endpoints
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>API Testing Tool</AlertTitle>
          <AlertDescription>
            This is a direct interface to the CER API endpoints. Use this to test the generation of CER narratives and PDFs.
          </AlertDescription>
        </Alert>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="faers">FAERS (Drug)</TabsTrigger>
            <TabsTrigger value="device">Device</TabsTrigger>
            <TabsTrigger value="multi">Multi-Source</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faers" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">NDC Code:</label>
              <Input 
                placeholder="Enter NDC code (e.g., 0078-0357-15)" 
                value={ndcCode}
                onChange={(e) => setNdcCode(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Period (Optional):</label>
              <Input 
                placeholder="Time period in months (e.g., 12)" 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="device" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Device Code:</label>
              <Input 
                placeholder="Enter device code (e.g., DEN123456)" 
                value={deviceCode}
                onChange={(e) => setDeviceCode(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Period (Optional):</label>
              <Input 
                placeholder="Time period in months (e.g., 12)" 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="multi" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Multiple Codes:</label>
              <Textarea 
                placeholder="Enter NDC and/or device codes, separated by commas (e.g., 0078-0357-15, DEN123456)" 
                value={multiSourceCodes}
                onChange={(e) => setMultiSourceCodes(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                NDC codes contain hyphens (0078-0357-15), device codes don't (DEN123456)
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Period (Optional):</label>
              <Input 
                placeholder="Time period in months (e.g., 12)" 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex space-x-2 mt-6">
          <Button 
            onClick={handleFetchData} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate CER Narrative
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleDownloadPDF} 
            disabled={loading || !downloadReady}
            variant={downloadReady ? "default" : "outline"}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </CardContent>
      
      {(responseData || visualizationData) && (
        <CardFooter className="flex flex-col">
          <AnimatePresence>
            {visualizationData && (
              <motion.div 
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={containerVariants}
                className="w-full mb-6"
              >
                <motion.h3 variants={itemVariants} className="text-lg font-medium mb-4">
                  Visualization
                </motion.h3>
                
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Adverse Events Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart data={visualizationData.adverseEvents} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Trend Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={visualizationData.monthlyTrends} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="events" stroke="#8884d8" activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
            
            {responseData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full space-y-2"
              >
                <label className="text-sm font-medium">API Response:</label>
                <div className="bg-muted/50 p-4 rounded-md overflow-auto max-h-80">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(responseData, null, 2)}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      )}
    </Card>
  );
}