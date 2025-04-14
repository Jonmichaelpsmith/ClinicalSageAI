import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Filter, 
  Eye, 
  ArrowRight, 
  TrendingUp, 
  LineChart,
  BarChartHorizontal,
  TestTube,
  FileCheck,
  Briefcase,
  ChevronRight,
  CheckCircle,
  Presentation,
  Lightbulb,
  Target,
  CalendarRange,
  Users,
  Percent
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";

export default function ExampleReportsPage() {
  const [reportIndex, setReportIndex] = useState({ personas: [], reportTypes: [], featuredReports: [] });
  const [reportManifests, setReportManifests] = useState({});
  const [selectedPersona, setSelectedPersona] = useState("all");
  const [selectedReportType, setSelectedReportType] = useState("all");
  const [activeTab, setActiveTab] = useState("featured");
  const [isLoading, setIsLoading] = useState(true);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch report index data
  useEffect(() => {
    const fetchReportIndex = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest("GET", "/api/reports/manifest/index");
        if (!response.ok) {
          throw new Error("Failed to fetch report index");
        }
        const data = await response.json();
        setReportIndex(data);
        
        // Pre-fetch manifests for all personas
        const manifestPromises = data.personas.map(async (persona) => {
          try {
            const manifestResponse = await apiRequest("GET", `/api/reports/manifest/persona/${persona.id}`);
            if (manifestResponse.ok) {
              const manifestData = await manifestResponse.json();
              return { persona: persona.id, data: manifestData };
            }
            return { persona: persona.id, data: null };
          } catch (error) {
            console.error(`Error fetching manifest for ${persona.id}:`, error);
            return { persona: persona.id, data: null };
          }
        });
        
        const manifests = await Promise.all(manifestPromises);
        const manifestMap = {};
        manifests.forEach((manifest) => {
          if (manifest.data) {
            manifestMap[manifest.persona] = manifest.data;
          }
        });
        
        setReportManifests(manifestMap);
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast({
          title: "Error",
          description: "Failed to load report examples. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReportIndex();
  }, [toast]);

  // Handle persona selection
  const handlePersonaChange = (value) => {
    setSelectedPersona(value);
    if (value !== "all") {
      setActiveTab("persona");
    }
  };

  // Handle report type selection
  const handleReportTypeChange = (value) => {
    setSelectedReportType(value);
    if (value !== "all") {
      setActiveTab("type");
    }
  };

  // Filter reports by selected criteria
  const getFilteredReports = () => {
    const { featuredReports = [] } = reportIndex;
    
    return featuredReports.filter((report) => {
      const personaMatch = selectedPersona === "all" || report.persona === selectedPersona;
      const typeMatch = selectedReportType === "all" || report.type === selectedReportType;
      return personaMatch && typeMatch;
    });
  };

  // Get reports for a specific persona
  const getPersonaReports = (personaId) => {
    const manifest = reportManifests[personaId];
    if (!manifest || !manifest.files) {
      return [];
    }
    
    // Map files to report objects
    return manifest.files.map((file, index) => ({
      id: `${personaId}-${index}`,
      name: file.replace('.pdf', '').replace(/_/g, ' ').replace(/-/g, ' '),
      description: manifest.description || "Example report",
      file: file,
      persona: personaId,
      type: getReportTypeFromFileName(file),
    }));
  };

  // Helper to determine report type from filename
  const getReportTypeFromFileName = (filename) => {
    const lowerFilename = filename.toLowerCase();
    if (lowerFilename.includes('success') || lowerFilename.includes('prediction')) {
      return 'success-prediction';
    } else if (lowerFilename.includes('protocol') || lowerFilename.includes('optimization')) {
      return 'protocol-optimization';
    } else if (lowerFilename.includes('endpoint')) {
      return 'endpoint-selection';
    } else if (lowerFilename.includes('regul') || lowerFilename.includes('bundle')) {
      return 'regulatory-package';
    } else if (lowerFilename.includes('invest') || lowerFilename.includes('portfolio')) {
      return 'investment-analysis';
    } else if (lowerFilename.includes('compet') || lowerFilename.includes('market')) {
      return 'competitive-intelligence';
    }
    return 'other';
  };

  // Get all reports across all personas
  const getAllReports = () => {
    return Object.keys(reportManifests).flatMap(getPersonaReports);
  };

  // Preview a report (simplified version - would display PDF in real app)
  const previewReport = async (report) => {
    setCurrentReport(report);
    // In a real implementation, this would fetch the actual PDF
    setPdfPreviewUrl(`/api/reports/download/${report.persona}/${report.file}`);
    setIsPreviewOpen(true);
  };

  // Download a report
  const downloadReport = async (report) => {
    try {
      const response = await apiRequest("GET", `/api/reports/download/${report.persona}/${report.file}`);
      if (!response.ok) {
        throw new Error("Failed to download report");
      }
      
      // Create a blob from the PDF stream
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = report.file;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: `${report.name} is being downloaded.`,
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download report. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get icon for persona
  const getPersonaIcon = (personaId) => {
    const iconMap = {
      clinical: <TestTube className="h-5 w-5" />,
      regulatory: <FileCheck className="h-5 w-5" />,
      statistical: <BarChartHorizontal className="h-5 w-5" />,
      investor: <TrendingUp className="h-5 w-5" />,
      executive: <Briefcase className="h-5 w-5" />,
      medical: <Lightbulb className="h-5 w-5" />
    };
    
    return iconMap[personaId] || <FileText className="h-5 w-5" />;
  };

  // Get icon for report type
  const getReportTypeIcon = (typeId) => {
    const iconMap = {
      'success-prediction': <Percent className="h-5 w-5" />,
      'protocol-optimization': <Target className="h-5 w-5" />,
      'endpoint-selection': <Target className="h-5 w-5" />,
      'regulatory-package': <FileCheck className="h-5 w-5" />,
      'investment-analysis': <LineChart className="h-5 w-5" />,
      'competitive-intelligence': <Users className="h-5 w-5" />
    };
    
    return iconMap[typeId] || <FileText className="h-5 w-5" />;
  };

  // Get color for persona
  const getPersonaColor = (personaId) => {
    const persona = reportIndex.personas.find(p => p.id === personaId);
    if (!persona) return "blue";
    
    const colorMap = {
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      purple: "bg-purple-100 text-purple-800",
      teal: "bg-teal-100 text-teal-800",
      amber: "bg-amber-100 text-amber-800",
      indigo: "bg-indigo-100 text-indigo-800"
    };
    
    return colorMap[persona.color] || "bg-blue-100 text-blue-800";
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading example reports...</p>
        </div>
      </div>
    );
  }

  const filteredReports = getFilteredReports();
  const allReports = getAllReports();

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 md:px-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Example Intelligence Reports
          </h1>
          <p className="text-xl text-muted-foreground">
            Browse our comprehensive collection of report templates tailored for different roles in clinical development.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/2">
            <Select value={selectedPersona} onValueChange={handlePersonaChange}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>{selectedPersona === "all" ? "All Personas" : reportIndex.personas.find(p => p.id === selectedPersona)?.name || "All Personas"}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Personas</SelectItem>
                {reportIndex.personas.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id} className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      {getPersonaIcon(persona.id)}
                      <span>{persona.name}</span>
                      {persona.new && <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">New</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-1/2">
            <Select value={selectedReportType} onValueChange={handleReportTypeChange}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>{selectedReportType === "all" ? "All Report Types" : reportIndex.reportTypes.find(t => t.id === selectedReportType)?.name || "All Report Types"}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Report Types</SelectItem>
                {reportIndex.reportTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      {getReportTypeIcon(type.id)}
                      <span>{type.name}</span>
                      {type.new && <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">New</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="featured">Featured Reports</TabsTrigger>
            <TabsTrigger value="persona">By Persona</TabsTrigger>
            <TabsTrigger value="type">By Report Type</TabsTrigger>
          </TabsList>
          
          <TabsContent value="featured" className="space-y-6">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No reports match your current filter selection.</p>
                <Button variant="link" onClick={() => { setSelectedPersona("all"); setSelectedReportType("all"); }}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => {
                  const persona = reportIndex.personas.find(p => p.id === report.persona);
                  const reportType = reportIndex.reportTypes.find(t => t.id === report.type);
                  
                  return (
                    <Card key={report.id} className="overflow-hidden border-2 hover:border-primary/50 transition-all group">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className={getPersonaColor(report.persona)}>
                            <div className="flex items-center gap-1.5">
                              {getPersonaIcon(report.persona)}
                              <span>{persona?.name || report.persona}</span>
                            </div>
                          </Badge>
                          {report.new && <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">New</Badge>}
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {report.name}
                        </CardTitle>
                        <CardDescription className="h-12 line-clamp-2">
                          {report.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 pb-4">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          {getReportTypeIcon(report.type)}
                          <span>{reportType?.name || report.type}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-muted-foreground">{getRandomFeature(report.type, i)}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2 pt-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => previewReport({
                            ...report,
                            file: report.id.includes('-') ? `${report.id.split('-')[0]}_${report.id.split('-')[1]}.pdf` : `${report.id}.pdf`,
                            persona: report.persona
                          })}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button size="sm" className="flex-1">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Full Demo
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="persona" className="space-y-8">
            {reportIndex.personas
              .filter(persona => selectedPersona === "all" || persona.id === selectedPersona)
              .map((persona) => {
                const personaReports = getPersonaReports(persona.id);
                
                return (
                  <div key={persona.id} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-md ${getPersonaBackgroundColor(persona.color)}`}>
                        {getPersonaIcon(persona.id)}
                      </div>
                      <h2 className="text-2xl font-bold">{persona.name}</h2>
                      {persona.new && <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">New</Badge>}
                    </div>
                    
                    <p className="text-muted-foreground">{persona.description}</p>
                    
                    {personaReports.length === 0 ? (
                      <div className="p-4 border rounded-md bg-muted/20">
                        <p className="text-muted-foreground">No example reports available for this persona.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {personaReports.map((report) => (
                          <Card key={report.id} className="hover:border-primary/50 transition-all">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">{formatReportName(report.name)}</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                                {getReportTypeIcon(report.type)}
                                <span>
                                  {reportIndex.reportTypes.find(t => t.id === report.type)?.name || 
                                   formatReportType(report.type)}
                                </span>
                              </div>
                              
                              <div className="text-sm text-muted-foreground">
                                {getReportDescription(report)}
                              </div>
                            </CardContent>
                            <CardFooter className="grid grid-cols-2 gap-2 pt-0">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => previewReport(report)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => downloadReport(report)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </TabsContent>
          
          <TabsContent value="type" className="space-y-8">
            {reportIndex.reportTypes
              .filter(type => selectedReportType === "all" || type.id === selectedReportType)
              .map((type) => {
                const typeReports = allReports.filter(report => report.type === type.id);
                
                return (
                  <div key={type.id} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-md bg-primary/10">
                        {getReportTypeIcon(type.id)}
                      </div>
                      <h2 className="text-2xl font-bold">{type.name}</h2>
                      {type.new && <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">New</Badge>}
                    </div>
                    
                    <p className="text-muted-foreground">{type.description}</p>
                    
                    {typeReports.length === 0 ? (
                      <div className="p-4 border rounded-md bg-muted/20">
                        <p className="text-muted-foreground">No example reports available for this type.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {typeReports.map((report) => {
                          const persona = reportIndex.personas.find(p => p.id === report.persona);
                          
                          return (
                            <Card key={report.id} className="hover:border-primary/50 transition-all">
                              <CardHeader className="pb-2">
                                <Badge className={`${getPersonaColor(report.persona)} mb-2 w-fit`}>
                                  <div className="flex items-center gap-1.5">
                                    {getPersonaIcon(report.persona)}
                                    <span>{persona?.name || report.persona}</span>
                                  </div>
                                </Badge>
                                <CardTitle className="text-lg">{formatReportName(report.name)}</CardTitle>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <div className="text-sm text-muted-foreground">
                                  {getReportDescription(report)}
                                </div>
                              </CardContent>
                              <CardFooter className="grid grid-cols-2 gap-2 pt-0">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => previewReport(report)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={() => downloadReport(report)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </CardFooter>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 p-6 border rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="space-y-4 flex-1">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none mb-2">Premium Intelligence</Badge>
              <h2 className="text-2xl lg:text-3xl font-bold">Ready to access the full suite of intelligence tools?</h2>
              <p className="text-muted-foreground">
                Subscribe today to access our complete suite of protocol optimization tools, success prediction models, 
                and regulatory-ready report generators.
              </p>
              <div className="flex gap-4 pt-2">
                <Button size="lg" className="gap-2">
                  <Presentation className="h-5 w-5" />
                  <span>Schedule Demo</span>
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  <CalendarRange className="h-5 w-5" />
                  <span>View Pricing</span>
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl">
              <div className="grid grid-cols-2 gap-4 w-full max-w-[240px]">
                <div className="flex flex-col gap-2 items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                  <TrendingUp className="h-10 w-10 text-primary" />
                  <span className="text-sm font-medium">92%</span>
                  <span className="text-xs text-center text-muted-foreground">Success Rate</span>
                </div>
                <div className="flex flex-col gap-2 items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                  <Target className="h-10 w-10 text-primary" />
                  <span className="text-sm font-medium">14.2x</span>
                  <span className="text-xs text-center text-muted-foreground">ROI</span>
                </div>
                <div className="flex flex-col gap-2 items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                  <LineChart className="h-10 w-10 text-primary" />
                  <span className="text-sm font-medium">31%</span>
                  <span className="text-xs text-center text-muted-foreground">Cost Savings</span>
                </div>
                <div className="flex flex-col gap-2 items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                  <CheckCircle className="h-10 w-10 text-primary" />
                  <span className="text-sm font-medium">43%</span>
                  <span className="text-xs text-center text-muted-foreground">Time Saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Report Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{currentReport ? formatReportName(currentReport.name) : "Report Preview"}</DialogTitle>
            <DialogDescription>
              {currentReport ? getReportDescription(currentReport) : "Preview of the selected report"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden rounded-md border mt-4 bg-muted/20 min-h-[50vh] flex flex-col">
            {/* PDF Preview (Simulated) */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 border-b">
              <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Interactive Preview</h3>
                <p className="text-muted-foreground mb-4">
                  This report preview demonstrates the comprehensive analysis and insights provided in our intelligence reports.
                </p>
                <div className="w-full space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Loading preview...</span>
                      <span className="font-medium">42%</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-muted/5 flex flex-col gap-3">
              <h4 className="font-medium">Report Highlights:</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">{getRandomFeature(currentReport?.type || 'default', i)}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-2 pt-3 border-t">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>Subscribe to access complete reports</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsPreviewOpen(false)}
                  >
                    Close Preview
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setIsPreviewOpen(false);
                      navigate("/subscriptions");
                    }}
                  >
                    Unlock Full Reports
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper functions

// Format report name for display
function formatReportName(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Format report type for display
function formatReportType(type) {
  return type
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Get background color for persona
function getPersonaBackgroundColor(color) {
  const colorMap = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    purple: "bg-purple-100",
    teal: "bg-teal-100",
    amber: "bg-amber-100",
    indigo: "bg-indigo-100"
  };
  
  return colorMap[color] || "bg-blue-100";
}

// Get a description for a report based on its type and name
function getReportDescription(report) {
  const typeMap = {
    'success-prediction': "AI-powered prediction model for trial success with key risk factors identified",
    'protocol-optimization': "Evidence-based protocol enhancement with regulatory compliance checks",
    'endpoint-selection': "Optimal endpoint selection with statistical power analysis",
    'regulatory-package': "Complete documentation package for regulatory submissions",
    'investment-analysis': "Risk-adjusted valuation model with competitive positioning analysis",
    'competitive-intelligence': "Comprehensive landscape analysis with differentiation scoring"
  };
  
  if (report.description && report.description !== "Example report") {
    return report.description;
  }
  
  return typeMap[report.type] || "Comprehensive analysis report with actionable insights";
}

// Get random features based on report type (for demo)
function getRandomFeature(type, index) {
  const featuresByType = {
    'success-prediction': [
      "Success probability with confidence interval",
      "Risk factor identification with quantitative impact",
      "Mitigation recommendations with success impact scores"
    ],
    'protocol-optimization': [
      "Inclusion/exclusion criteria optimization",
      "Statistical power enhancement recommendations",
      "Study design optimization with benchmark comparisons"
    ],
    'endpoint-selection': [
      "Primary endpoint selection with historical success rates",
      "Secondary endpoint recommendations with rationale",
      "Statistical power analysis with sample size implications"
    ],
    'regulatory-package': [
      "Regulatory-ready documentation with cross-referencing",
      "Compliance check against global regulatory standards",
      "Automatic citations from peer-reviewed literature"
    ],
    'investment-analysis': [
      "Risk-adjusted NPV with sensitivity analysis",
      "Probability of clinical and commercial success",
      "Competition positioning with differentiation scoring"
    ],
    'competitive-intelligence': [
      "Competitive landscape mapping with positioning matrix",
      "Feature differentiation analysis with scoring",
      "Market opportunity assessment with gap analysis"
    ],
    'default': [
      "Evidence-based recommendations with citations",
      "Quantitative analysis with benchmark comparisons",
      "Actionable insights with implementation guidance"
    ]
  };
  
  return (featuresByType[type] || featuresByType.default)[index % 3];
}