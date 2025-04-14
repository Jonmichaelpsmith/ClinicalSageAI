import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  FileText,
  ChevronRight,
  Filter,
  Download,
  ArrowUpDown,
  Search,
  AlertCircle,
  Loader2,
  FileBarChart2,
  ClipboardList,
  TrendingUp,
  BarChart2,
  PieChart,
  LineChart,
  FileDown,
  FolderUp,
  Microscope,
  Lightbulb,
  FileOutput,
  FileDigit
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";

// Import any additional components you need for analytics
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ReportsAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("reports");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string>("all");
  const [selectedIndication, setSelectedIndication] = useState<string>("all");
  const [reports, setReports] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [availableIndications, setAvailableIndications] = useState([]);
  const [reportTypes, setReportTypes] = useState([
    {
      id: "csr",
      name: "CSR (Clinical Study Report)",
      description: "Complete analysis of clinical study data and outcomes",
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      count: 779
    },
    {
      id: "protocol",
      name: "Protocol Analysis",
      description: "Detailed assessment of study design and methodology",
      icon: <ClipboardList className="h-5 w-5 text-purple-500" />,
      count: 342
    },
    {
      id: "prediction",
      name: "Success Prediction",
      description: "AI-powered forecast of trial success probability",
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      count: 215
    },
    {
      id: "analytics",
      name: "Statistical Analysis",
      description: "In-depth statistical evaluation of trial data",
      icon: <BarChart2 className="h-5 w-5 text-amber-500" />,
      count: 128
    },
    {
      id: "regulatory",
      name: "Regulatory Bundle",
      description: "Comprehensive package for regulatory submission",
      icon: <FileOutput className="h-5 w-5 text-indigo-500" />,
      count: 95
    },
    {
      id: "summaryPacket",
      name: "Summary Packet",
      description: "Executive summary of key findings and insights",
      icon: <FileDigit className="h-5 w-5 text-cyan-500" />,
      count: 180
    }
  ]);

  // Fetch reports when components loads or filters change
  useEffect(() => {
    fetchReports();
    fetchAnalyticsData();
    fetchAvailableIndications();
  }, [selectedPhase, selectedIndication]);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest(
        "GET", 
        `/api/reports?phase=${selectedPhase !== "all" ? selectedPhase : ""}&indication=${selectedIndication !== "all" ? selectedIndication : ""}`
      );
      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError("Failed to load reports. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load reports. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const response = await apiRequest("GET", "/api/analytics/summary");
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error("Failed to load analytics data:", err);
    }
  };

  const fetchAvailableIndications = async () => {
    try {
      const response = await apiRequest("GET", "/api/analytics/indications");
      const data = await response.json();
      setAvailableIndications(data);
    } catch (err) {
      console.error("Failed to load indications:", err);
    }
  };

  const filteredReports = reports.filter(report => 
    report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.indication?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.sponsor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // This would normally come from your API
  const phaseOptions = [
    { value: "all", label: "All Phases" },
    { value: "Phase I", label: "Phase I" },
    { value: "Phase II", label: "Phase II" },
    { value: "Phase III", label: "Phase III" },
    { value: "Phase IV", label: "Phase IV" }
  ];

  const renderReportsList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Loading reports...</span>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (filteredReports.length === 0) {
      return (
        <div className="text-center py-10">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No reports found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters or search criteria</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="overflow-hidden border border-slate-200 hover:border-primary/50 transition-colors">
            <div className="flex flex-col md:flex-row">
              <div className="p-4 md:p-6 flex-1">
                <div className="flex justify-between">
                  <Badge variant="outline" className="mb-2">
                    {report.phase || "Unknown Phase"}
                  </Badge>
                  <Badge variant="secondary" className="mb-2">
                    ID: {report.id}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                  {report.title}
                </h3>
                <div className="text-sm text-slate-500 mb-3">
                  <span className="font-medium text-slate-700">Sponsor:</span> {report.sponsor || "Unknown"}
                </div>
                <div className="text-sm text-slate-500 mb-3">
                  <span className="font-medium text-slate-700">Indication:</span> {report.indication || "Not specified"}
                </div>
                {report.summary && (
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{report.summary}</p>
                )}
              </div>
              <div className="bg-slate-50 p-4 md:p-6 flex flex-row md:flex-col justify-between items-center md:w-48">
                <div className="text-center mb-auto">
                  <div className="text-xs text-slate-500 mb-1">Uploaded</div>
                  <div className="text-sm font-medium">
                    {report.uploadDate 
                      ? new Date(report.uploadDate).toLocaleDateString() 
                      : "Unknown"}
                  </div>
                </div>
                <Link href={`/report/${report.id}`}>
                  <Button variant="default" size="sm" className="w-full">
                    View Report
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderReportTypes = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {reportTypes.map((type) => (
          <Card key={type.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2 flex flex-row items-center gap-2">
              <div className="p-2 rounded-full bg-slate-100">
                {type.icon}
              </div>
              <div>
                <CardTitle className="text-lg">{type.name}</CardTitle>
                <CardDescription className="text-xs mt-1">{type.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Available Reports</span>
                <Badge variant="secondary">{type.count}</Badge>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Link href={`/reports/${type.id}`}>
                <Button variant="ghost" size="sm" className="w-full">
                  View {type.name} Reports
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const renderAnalyticsTab = () => {
    if (!analyticsData) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Loading analytics data...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analyticsData.totalReports || 779}</div>
              <p className="text-xs text-slate-500 mt-1">Across all trial phases</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Therapeutic Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analyticsData.therapeuticAreas || 87}</div>
              <p className="text-xs text-slate-500 mt-1">Unique disease areas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Average Trial Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analyticsData.avgDuration || 32} <span className="text-xl">weeks</span></div>
              <p className="text-xs text-slate-500 mt-1">All phases combined</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Reports by Phase</CardTitle>
              <CardDescription>Distribution of reports across trial phases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Phase I</div>
                    <div className="text-sm text-slate-500">{analyticsData.phaseI || 189}</div>
                  </div>
                  <Progress value={24} className="h-2 mt-1" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Phase II</div>
                    <div className="text-sm text-slate-500">{analyticsData.phaseII || 245}</div>
                  </div>
                  <Progress value={32} className="h-2 mt-1" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Phase III</div>
                    <div className="text-sm text-slate-500">{analyticsData.phaseIII || 287}</div>
                  </div>
                  <Progress value={37} className="h-2 mt-1" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Phase IV</div>
                    <div className="text-sm text-slate-500">{analyticsData.phaseIV || 58}</div>
                  </div>
                  <Progress value={7} className="h-2 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Top Therapeutic Areas</CardTitle>
              <CardDescription>Most common disease areas in the database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Oncology</div>
                    <div className="text-sm text-slate-500">197 reports</div>
                  </div>
                  <Progress value={25} className="h-2 mt-1" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Cardiology</div>
                    <div className="text-sm text-slate-500">152 reports</div>
                  </div>
                  <Progress value={19} className="h-2 mt-1" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Neurology</div>
                    <div className="text-sm text-slate-500">145 reports</div>
                  </div>
                  <Progress value={18} className="h-2 mt-1" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Immunology</div>
                    <div className="text-sm text-slate-500">134 reports</div>
                  </div>
                  <Progress value={17} className="h-2 mt-1" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Infectious Disease</div>
                    <div className="text-sm text-slate-500">112 reports</div>
                  </div>
                  <Progress value={14} className="h-2 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center">
                <PieChart className="h-5 w-5 text-primary mr-2" />
                <CardTitle className="text-lg">Trial Success Rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-5xl font-bold text-primary mb-2">67%</div>
                <p className="text-sm text-slate-600">Overall success rate</p>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Phase I</span>
                  <span className="font-medium">88%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phase II</span>
                  <span className="font-medium">63%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phase III</span>
                  <span className="font-medium">58%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phase IV</span>
                  <span className="font-medium">92%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-primary mr-2" />
                <CardTitle className="text-lg">Avg. Patient Enrollment</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Phase I</div>
                    <div className="text-sm text-slate-500">42 patients</div>
                  </div>
                  <Progress value={10} className="h-2 mt-1" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Phase II</div>
                    <div className="text-sm text-slate-500">187 patients</div>
                  </div>
                  <Progress value={25} className="h-2 mt-1" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Phase III</div>
                    <div className="text-sm text-slate-500">742 patients</div>
                  </div>
                  <Progress value={75} className="h-2 mt-1" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Phase IV</div>
                    <div className="text-sm text-slate-500">1,248 patients</div>
                  </div>
                  <Progress value={100} className="h-2 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center">
                <LineChart className="h-5 w-5 text-primary mr-2" />
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="p-1.5 rounded-full bg-blue-100">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New CSR Added</p>
                    <p className="text-xs text-slate-500">Diabetes Type 2 Phase III Trial</p>
                    <p className="text-xs text-slate-400 mt-1">Today, 9:42 AM</p>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-3">
                  <div className="p-1.5 rounded-full bg-green-100">
                    <Microscope className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Analysis Completed</p>
                    <p className="text-xs text-slate-500">Oncology Meta-Analysis</p>
                    <p className="text-xs text-slate-400 mt-1">Yesterday, 4:15 PM</p>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-3">
                  <div className="p-1.5 rounded-full bg-amber-100">
                    <FolderUp className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dataset Updated</p>
                    <p className="text-xs text-slate-500">Cardiovascular Trials</p>
                    <p className="text-xs text-slate-400 mt-1">Apr 12, 2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1">
            Explore clinical study reports and gain insights from analytics
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Link href="/upload">
            <Button variant="outline" className="gap-1">
              <FolderUp className="h-4 w-4 mr-1" />
              Upload CSR
            </Button>
          </Link>
          <Button className="gap-1">
            <Download className="h-4 w-4 mr-1" />
            Export Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="reports" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="reports" className="text-sm">
            <FileText className="h-4 w-4 mr-2" />
            Report Library
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics & Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {activeTab === "reports" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Search reports by title, indication, or sponsor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                    prefix={<Search className="h-4 w-4 text-gray-400" />}
                  />
                </div>
                <div>
                  <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Phase" />
                    </SelectTrigger>
                    <SelectContent>
                      {phaseOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedIndication} onValueChange={setSelectedIndication}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Indication" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Indications</SelectItem>
                      {availableIndications.map(indication => (
                        <SelectItem key={indication} value={indication}>
                          {indication}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h2 className="font-medium">Clinical Study Reports</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8">
                      <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
                      Sort
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Filter className="h-3.5 w-3.5 mr-1" />
                      Filter
                    </Button>
                  </div>
                </div>
                <ScrollArea className="max-h-[600px] overflow-auto">
                  {renderReportsList()}
                </ScrollArea>
              </div>

              <h2 className="text-xl font-semibold mt-8 mb-2">Report Types</h2>
              <p className="text-slate-500 mb-2">Browse different types of reports available in the platform</p>
              
              {renderReportTypes()}
            </>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {activeTab === "analytics" && renderAnalyticsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}