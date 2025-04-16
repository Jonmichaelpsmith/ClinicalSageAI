import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter,
  Input,
  Label,
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, FileCheck, Download, RefreshCw, Ban } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

/**
 * Clinical Evaluation Report (CER) Generator Component
 * 
 * This component allows users to generate CER narratives and PDF reports
 * based on FAERS data using a simple interface.
 */
const CERGenerator = () => {
  const [ndcCode, setNdcCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [cerContent, setCerContent] = useState('');
  const [cerReportId, setCerReportId] = useState(null);
  const [error, setError] = useState(null);
  const [pdfTask, setPdfTask] = useState(null);
  const [pdfList, setPdfList] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loadingPdfList, setLoadingPdfList] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');

  // Load PDFs and recent reports on initial mount
  useEffect(() => {
    fetchRecentReports();
    fetchPdfList();
  }, []);

  // Poll for PDF task status if there's an active task
  useEffect(() => {
    if (pdfTask && pdfTask.status === 'scheduled' || pdfTask.status === 'processing') {
      const interval = setInterval(() => {
        checkPdfTaskStatus(pdfTask.task_id);
      }, 3000); // Check every 3 seconds
      
      return () => clearInterval(interval);
    }
  }, [pdfTask]);

  // Fetch the list of available PDFs
  const fetchPdfList = async () => {
    try {
      setLoadingPdfList(true);
      const response = await apiRequest('GET', '/api/cer/pdfs');
      const data = await response.json();
      setPdfList(data);
    } catch (err) {
      console.error('Error fetching PDF list:', err);
    } finally {
      setLoadingPdfList(false);
    }
  };

  // Fetch recent CER reports
  const fetchRecentReports = async () => {
    try {
      setLoadingReports(true);
      const response = await apiRequest('GET', '/api/cer/reports');
      const data = await response.json();
      setRecentReports(data);
    } catch (err) {
      console.error('Error fetching recent reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  // Check the status of a PDF generation task
  const checkPdfTaskStatus = async (taskId) => {
    try {
      const response = await apiRequest('GET', `/api/cer/tasks/${taskId}/status`);
      const taskStatus = await response.json();
      
      setPdfTask(taskStatus);
      
      // If the task is complete, refresh the PDF list
      if (taskStatus.status === 'completed') {
        fetchPdfList();
        toast({
          title: 'PDF Generated',
          description: 'Your CER PDF has been successfully generated.',
        });
      } else if (taskStatus.status === 'failed') {
        toast({
          title: 'PDF Generation Failed',
          description: taskStatus.message || 'There was an error generating the PDF.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error checking task status:', err);
    }
  };

  // Generate a CER report for the specified NDC code
  const generateCER = async (useBasicMode = false) => {
    if (!ndcCode.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter an NDC code',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setCerContent('');
      setCerReportId(null);
      
      // Add the basic parameter to disable enhanced generation if requested
      const url = useBasicMode 
        ? `/api/cer/${ndcCode.trim()}?basic=true` 
        : `/api/cer/${ndcCode.trim()}`;
        
      const response = await apiRequest('GET', url);
      const data = await response.json();
      
      if (response.ok) {
        setCerContent(data.cer_report);
        setCerReportId(data.report_id);
        fetchRecentReports();
        
        // Check if the response indicates enhanced generation
        const enhancedMode = data.enhanced === true;
        
        toast({
          title: 'CER Generated',
          description: `Clinical evaluation report has been generated successfully ${enhancedMode ? 'with enhanced AI' : ''}.`,
        });
      } else {
        setError(data.error || 'An error occurred while generating the CER');
        
        toast({
          title: 'Generation Failed',
          description: data.error || 'An error occurred while generating the CER',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error generating CER:', err);
      setError('Network error: Could not connect to the server');
      
      toast({
        title: 'Network Error',
        description: 'Could not connect to the server',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate a PDF version of the CER
  const generatePDF = async () => {
    if (!ndcCode.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter an NDC code',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setGeneratingPdf(true);
      setPdfTask(null);
      
      const response = await apiRequest('POST', `/api/cer/${ndcCode.trim()}/enhanced-pdf-task`, {
        user_id: 'current_user' // Replace with actual user ID when available
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPdfTask(data);
        
        toast({
          title: 'PDF Generation Started',
          description: 'Your PDF is being generated. This may take a few moments.',
        });
      } else {
        toast({
          title: 'PDF Generation Failed',
          description: data.error || 'Failed to start PDF generation',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      
      toast({
        title: 'Network Error',
        description: 'Could not connect to the server',
        variant: 'destructive',
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Handle download of a generated PDF
  const downloadPdf = (filename) => {
    window.open(`/api/cer/pdfs/${filename}`, '_blank');
  };

  // Load a previous report
  const loadReport = async (reportId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('GET', `/api/cer/reports/${reportId}`);
      const data = await response.json();
      
      if (response.ok) {
        setCerContent(data.content);
        setCerReportId(data.id);
        setNdcCode(data.ndcCode || '');
        
        toast({
          title: 'Report Loaded',
          description: 'Previous CER report has been loaded successfully.',
        });
      } else {
        setError(data.error || 'An error occurred while loading the report');
        
        toast({
          title: 'Loading Failed',
          description: data.error || 'An error occurred while loading the report',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error loading report:', err);
      setError('Network error: Could not connect to the server');
      
      toast({
        title: 'Network Error',
        description: 'Could not connect to the server',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Render the PDF task status
  const renderPdfTaskStatus = () => {
    if (!pdfTask) return null;
    
    let icon, color, message;
    
    switch (pdfTask.status) {
      case 'scheduled':
        icon = <RefreshCw className="h-5 w-5 animate-spin" />;
        color = "bg-blue-50 text-blue-800 border-blue-200";
        message = "PDF generation has been scheduled and will start soon.";
        break;
      case 'processing':
        icon = <Loader2 className="h-5 w-5 animate-spin" />;
        color = "bg-yellow-50 text-yellow-800 border-yellow-200";
        message = "Generating your PDF. This may take a moment.";
        break;
      case 'completed':
        icon = <FileCheck className="h-5 w-5" />;
        color = "bg-green-50 text-green-800 border-green-200";
        message = "PDF generated successfully! You can download it from the PDFs tab.";
        break;
      case 'failed':
        icon = <Ban className="h-5 w-5" />;
        color = "bg-red-50 text-red-800 border-red-200";
        message = `PDF generation failed: ${pdfTask.message || 'Unknown error'}`;
        break;
      default:
        return null;
    }
    
    return (
      <div className={`flex items-center p-3 rounded-md border mt-4 ${color}`}>
        <div className="mr-3">{icon}</div>
        <div className="text-sm">{message}</div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="generate" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate CER</TabsTrigger>
          <TabsTrigger value="reports">Recent Reports</TabsTrigger>
          <TabsTrigger value="pdfs">Generated PDFs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Clinical Evaluation Report</CardTitle>
              <CardDescription>
                Create a Clinical Evaluation Report based on FDA Adverse Event Reporting System data
                for a specific drug or medical device using its National Drug Code (NDC).
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ndc-code">National Drug Code (NDC)</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input 
                      id="ndc-code"
                      placeholder="Enter NDC code (e.g., 0074-3799)"
                      value={ndcCode}
                      onChange={(e) => setNdcCode(e.target.value)}
                      className="flex-1"
                      disabled={loading || generatingPdf}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => generateCER()} 
                        disabled={loading || generatingPdf || !ndcCode.trim()}
                        variant="default"
                      >
                        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Generate Enhanced
                      </Button>
                      <Button 
                        onClick={() => generateCER(true)} 
                        disabled={loading || generatingPdf || !ndcCode.trim()}
                        variant="outline"
                      >
                        Basic Mode
                      </Button>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Enhanced mode uses OpenAI to generate a more comprehensive and professionally formatted report.
                  </div>
                </div>
                
                {renderPdfTaskStatus()}
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {cerContent && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">Generated Report</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={generatePDF}
                        disabled={generatingPdf || loading}
                      >
                        {generatingPdf ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <FileCheck className="h-4 w-4 mr-2" />
                        )}
                        Generate PDF
                      </Button>
                    </div>
                    <div className="bg-secondary p-4 rounded-md overflow-auto max-h-[60vh] whitespace-pre-wrap font-mono text-sm">
                      {cerContent}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent CER Reports</CardTitle>
              <CardDescription>
                Previously generated Clinical Evaluation Reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingReports ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : recentReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reports generated yet. Create your first report in the Generate tab.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReports.map(report => (
                    <Card key={report.id} className="overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{report.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              NDC: {report.ndcCode || 'N/A'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground">
                                Generated on {formatDate(report.created_at)}
                              </p>
                              {report.metadata?.enhanced && (
                                <span className="px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                  Enhanced
                                </span>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => loadReport(report.id)}
                          >
                            Load Report
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={fetchRecentReports}
                disabled={loadingReports}
              >
                {loadingReports ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh List
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="pdfs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated PDFs</CardTitle>
              <CardDescription>
                PDF versions of Clinical Evaluation Reports for download
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPdfList ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pdfList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No PDFs have been generated yet. Generate a report and create a PDF from the Generate tab.
                </div>
              ) : (
                <div className="space-y-4">
                  {pdfList.map(pdf => (
                    <Card key={pdf.filename} className="overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{pdf.filename}</h3>
                            <p className="text-sm text-muted-foreground">
                              NDC: {pdf.ndcCode || 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Created on {formatDate(pdf.created)}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => downloadPdf(pdf.filename)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={fetchPdfList}
                disabled={loadingPdfList}
              >
                {loadingPdfList ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh List
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CERGenerator;