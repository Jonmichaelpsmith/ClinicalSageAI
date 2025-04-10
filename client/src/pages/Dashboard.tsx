import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, PieChart, FileText, Upload, Search, 
  ArrowRight, BookOpen, Brain, Lightbulb, Users, 
  Sparkles, Server, Rocket, Beaker, Microscope,
  MessageSquare, FileType, Database
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CsrReport } from "@/lib/types";
import StatsCard from "@/components/dashboard/StatsCard"; 
import QuickAction from "@/components/dashboard/QuickAction"; 
import LumenBioPipelineInsights from "@/components/dashboard/LumenBioPipelineInsights"; 


const Dashboard = () => {
  const { toast } = useToast();
  const { data: reports, isLoading: isLoadingReports } = useQuery({
    queryKey: ['/api/reports'],
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats'],
  });

  const importBatchMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/import/batch');
    },
    onSuccess: (data) => {
      toast({
        title: "Batch import started",
        description: "The batch import process has been started successfully. Check back soon to see the imported trials.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to start batch import: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="p-8 rounded-xl border-0 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome to TrialSage</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="shadow-sm border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-lg">Study Design Tools</CardTitle>
              <CardDescription>
                Optimize the scientific architecture of your trials
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <PieChart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Statistical Modeling</h4>
                    <p className="text-sm text-gray-500">Optimize endpoint selection & sample size</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileSearch className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Design Comparator</h4>
                    <p className="text-sm text-gray-500">Compare your design to precedent studies</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate("/statistical-modeling")}>
                  Access Design Tools
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-emerald-100">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardTitle className="text-lg">Protocol Development</CardTitle>
              <CardDescription>
                Generate comprehensive protocol documents
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Protocol Designer</h4>
                    <p className="text-sm text-gray-500">Create complete protocol documents</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <CheckSquare className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Regulatory Validator</h4>
                    <p className="text-sm text-gray-500">Ensure alignment with agency expectations</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate("/protocol-generator")}>
                  Create Protocol
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

              <p className="text-blue-100 mt-2 max-w-lg">
                AI-powered clinical study report intelligence platform that transforms your research workflow
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Link href="/upload">
                <Button className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                  <Upload className="h-4 w-4" />
                  Upload CSR
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className="flex items-center gap-2 border-white text-white hover:bg-white/20">
                  <Search className="h-4 w-4" />
                  Browse Reports
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Badge className="bg-blue-500/60 hover:bg-blue-500/70 text-white font-normal py-1">Smart Analysis</Badge>
            <Badge className="bg-blue-500/60 hover:bg-blue-500/70 text-white font-normal py-1">Improved Efficiency</Badge>
            <Badge className="bg-blue-500/60 hover:bg-blue-500/70 text-white font-normal py-1">Data Extraction</Badge>
            <Badge className="bg-blue-500/60 hover:bg-blue-500/70 text-white font-normal py-1">AI-Powered</Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <div className="p-2 rounded-lg bg-blue-100 mr-3">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Reports</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <div className="text-2xl font-bold mt-1">{stats?.totalReports || 0}</div>
                )}
              </div>
            </div>
            <div className="mt-2">
              <Progress value={75} className="h-1" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <div className="p-2 rounded-lg bg-emerald-100 mr-3">
                <BarChart className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Processed Reports</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <div className="text-2xl font-bold mt-1">{stats?.processedReports || 0}</div>
                )}
              </div>
            </div>
            <div className="mt-2">
              <Progress value={60} className="h-1" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <div className="p-2 rounded-lg bg-indigo-100 mr-3">
                <Database className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Data Points Extracted</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <div className="text-2xl font-bold mt-1">{stats?.dataPointsExtracted?.toLocaleString() || 0}</div>
                )}
              </div>
            </div>
            <div className="mt-2">
              <Progress value={85} className="h-1" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <div className="p-2 rounded-lg bg-amber-100 mr-3">
                <Sparkles className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Time Saved</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <div className="text-2xl font-bold mt-1">{stats?.processingTimeSaved || 0} hrs</div>
                )}
              </div>
            </div>
            <div className="mt-2">
              <Progress value={90} className="h-1" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BarChart className="h-5 w-5 text-blue-600 mr-2" />
                  Recent CSR Reports
                </CardTitle>
                <CardDescription>
                  Your most recently analyzed clinical study reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingReports ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : reports && reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.slice(0, 5).map((report: CsrReport) => (
                      <div key={report.id} className="flex items-center justify-between p-3 rounded-md hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-slate-400" />
                          <div>
                            <p className="font-medium">{report.title}</p>
                            <div className="flex items-center text-xs text-slate-500 gap-2">
                              <span>{report.sponsor}</span>
                              <span>•</span>
                              <span>Phase {report.phase}</span>
                              <span>•</span>
                              <span>{report.indication}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            report.status === "Processed" ? "default" :
                            report.status === "Processing" ? "outline" :
                            "destructive"
                          }>
                            {report.status}
                          </Badge>
                          <Link href={`/reports/${report.id}`}>
                            <Button size="sm" variant="ghost">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                    <h3 className="text-lg font-medium text-slate-700">No reports yet</h3>
                    <p className="text-slate-500 mb-4">Upload your first CSR to get started</p>
                    <Link href="/upload">
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload CSR
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
              {reports && reports.length > 0 && (
                <CardFooter className="border-t px-6 py-4">
                  <Link href="/reports">
                    <Button variant="outline" className="w-full">View All Reports</Button>
                  </Link>
                </CardFooter>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                  Use Case Library
                </CardTitle>
                <CardDescription>
                  Explore different ways to leverage TrialSage in your clinical development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start gap-2 mb-2">
                        <Brain className="h-5 w-5 text-indigo-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium">AI Protocol Generator</h3>
                          <p className="text-sm text-slate-500">Generate optimized protocol drafts based on historical trials</p>
                        </div>
                      </div>
                      <Link href="/protocol-generator">
                        <Button size="sm" variant="ghost" className="w-full justify-start pl-2 mt-2">
                          <ArrowRight className="h-3 w-3 mr-2" /> Explore
                        </Button>
                      </Link>
                    </div>

                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start gap-2 mb-2">
                        <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Study Design Agent</h3>
                          <p className="text-sm text-slate-500">Get expert advice on trial design from our AI assistant</p>
                        </div>
                      </div>
                      <Link href="/study-design-agent">
                        <Button size="sm" variant="ghost" className="w-full justify-start pl-2 mt-2">
                          <ArrowRight className="h-3 w-3 mr-2" /> Explore
                        </Button>
                      </Link>
                    </div>
                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start gap-2 mb-2">
                        <FileType className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Statistical Modeling</h3>
                          <p className="text-sm text-slate-500">Build predictive models with advanced statistical tools</p>
                        </div>
                      </div>
                      <Link href="/statistical-modeling">
                        <Button size="sm" variant="ghost" className="w-full justify-start pl-2 mt-2">
                          <ArrowRight className="h-3 w-3 mr-2" /> Explore
                        </Button>
                      </Link>
                    </div>

                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start gap-2 mb-2">
                        <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Design Validator</h3>
                          <p className="text-sm text-slate-500">Validate your trial design against historical precedents</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="w-full justify-start pl-2 mt-2">
                        <ArrowRight className="h-3 w-3 mr-2" /> Explore
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Link href="/use-cases">
                  <Button variant="outline" className="w-full">View All Use Cases</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Rocket className="h-5 w-5 text-blue-600 mr-2" />
                  Get Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Upload CSR Documents</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Start by uploading clinical study reports to extract insights
                      </p>
                      <Link href="/upload">
                        <Button size="sm" className="mt-2">
                          <Upload className="h-3 w-3 mr-2" /> Upload
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium text-sm shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Explore Reports</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Search and filter through structured CSR data
                      </p>
                      <Link href="/reports">
                        <Button size="sm" variant="outline" className="mt-2">
                          <Search className="h-3 w-3 mr-2" /> Browse
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium text-sm shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Try AI Tools</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Use our AI-powered tools to generate protocols and insights
                      </p>
                      <Link href="/use-cases">
                        <Button size="sm" variant="outline" className="mt-2">
                          <Sparkles className="h-3 w-3 mr-2" /> Explore Tools
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Server className="h-5 w-5 text-blue-600 mr-2" />
                  Data Sources
                </CardTitle>
                <CardDescription>
                  Import and manage clinical trial data sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-indigo-600" />
                    <span className="font-medium">NCT XML Trials</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="ml-auto"
                      onClick={() => importBatchMutation.mutate()}
                      disabled={importBatchMutation.isPending}
                    >
                      {importBatchMutation.isPending ? 'Importing...' : 'Import Batch'}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Click "Import Batch" to process all NCT XML files from the attached_assets directory into the database.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Beaker className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm">Health Canada Portal</span>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <Progress value={83} className="h-2" />
                    <p className="text-xs text-slate-500">83% of available CSRs indexed</p>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Microscope className="h-5 w-5 text-indigo-600" />
                        <span className="text-sm">EMA Clinical Portal</span>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <Progress value={28} className="h-2" />
                    <p className="text-xs text-slate-500">28% of available CSRs indexed</p>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-amber-600" />
                        <span className="text-sm">Your Uploaded CSRs</span>
                      </div>
                      <Badge variant="outline">Custom</Badge>
                    </div>
                    <Progress value={100} className="h-2" />
                    <p className="text-xs text-slate-500">All uploaded CSRs processed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Lumen Bio Insights Component */}
        <div className="mt-4">
          <LumenBioPipelineInsights className="w-full" />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

// Using the imported LumenBioPipelineInsights component from @/components/dashboard/LumenBioPipelineInsights