import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, PieChart, FileText, Upload, Search, 
  ArrowRight, BookOpen, Brain, Lightbulb, Users, 
  Sparkles, Server, Rocket, Beaker, Microscope
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

const Dashboard = () => {
  const { data: reports, isLoading: isLoadingReports } = useQuery({
    queryKey: ['/api/reports'],
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats'],
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="p-6 rounded-lg border bg-gradient-to-r from-primary/10 to-blue-500/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Welcome to TrialSage</h1>
              <p className="text-slate-600 mt-1">
                AI-powered clinical study report intelligence platform
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/upload">
                <Button className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload CSR
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Browse Reports
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalReports || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Processed Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.processedReports || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Data Points Extracted</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.dataPointsExtracted?.toLocaleString() || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Time Saved</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.processingTimeSaved || 0} hrs</div>
              )}
            </CardContent>
          </Card>
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
                            report.status === "Processed" ? "success" :
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
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;