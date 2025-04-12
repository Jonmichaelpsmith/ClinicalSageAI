
import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { LumenBioReport } from "@/components/reports/LumenBioReport";
import ObesityStudyProtocol from "@/components/lumen-bio/ObesityStudyProtocol";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, Microscope, BarChart, PieChart, 
  BookOpen, Download, Share, AlertCircle, Beaker, Target,
  Weight, ChevronRight
} from "lucide-react";

export default function LumenBioDashboard() {
  const { data: recentReports, isLoading } = useQuery({
    queryKey: ['/api/reports/lumen-bio/recent'],
    // Mocked data for now
    initialData: [
      {
        id: "rep_001",
        title: "LUM-1 Phase 2 Interim Analysis",
        type: "Analysis",
        date: "2025-04-01",
        indication: "Non-Small Cell Lung Cancer"
      },
      {
        id: "rep_002",
        title: "Competitive Intelligence: Oncology Checkpoint Inhibitors",
        type: "Market",
        date: "2025-03-15",
        indication: "Oncology"
      },
      {
        id: "rep_003",
        title: "LUM-2 Phase 1 Protocol Review",
        type: "Protocol",
        date: "2025-03-05",
        indication: "Inflammatory Bowel Disease"
      }
    ]
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
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Lumen Biosciences Dashboard</h1>
              <p className="text-slate-600 mt-1">
                Clinical development analytics and intelligence for your pipeline
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Download Full Report
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Share className="h-4 w-4" />
                Share Insights
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (wider) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Obesity Study Protocol (WT02) */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Weight className="h-5 w-5 text-indigo-600 mr-2" />
                  Obesity Program - Protocol WT02
                </CardTitle>
                <CardDescription>
                  Active protocol for LMN-0801 dose-ranging POC study in obesity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ObesityStudyProtocol />
              </CardContent>
            </Card>
            
            {/* Pipeline Report */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Pipeline Analysis</CardTitle>
                <CardDescription>
                  Current status and competitive positioning of Lumen Bio's pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LumenBioReport />
              </CardContent>
            </Card>
            
            {/* Recent Reports */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  Recent Lumen Bio Reports
                </CardTitle>
                <CardDescription>
                  Latest analyses and reports specific to your pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentReports.map(report => (
                    <div key={report.id} className="flex items-center justify-between p-3 rounded-md hover:bg-slate-50 transition-colors border">
                      <div className="flex items-center gap-3">
                        {report.type === "Analysis" ? (
                          <BarChart className="h-8 w-8 text-indigo-500" />
                        ) : report.type === "Market" ? (
                          <PieChart className="h-8 w-8 text-amber-500" />
                        ) : (
                          <BookOpen className="h-8 w-8 text-emerald-500" />
                        )}
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <div className="flex items-center text-xs text-slate-500 gap-2">
                            <span>{report.date}</span>
                            <span>•</span>
                            <span>{report.indication}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Link href={`/reports/${report.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Link href="/reports/lumen-bio">
                  <Button variant="outline" className="w-full">View All Lumen Bio Reports</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Right column (narrower) */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Target className="h-5 w-5 text-blue-600 mr-2" />
                  Lumen Bio Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-slate-500">Pipeline Candidates</p>
                    <p className="text-2xl font-bold">5</p>
                    <div className="flex items-center text-xs mt-1">
                      <span className="text-green-600 font-medium">↑ 1 from previous year</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-slate-500">Active Clinical Trials</p>
                    <p className="text-2xl font-bold">3</p>
                    <div className="flex items-center text-xs mt-1">
                      <span className="text-green-600 font-medium">↑ 2 from previous year</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-slate-500">Total Patients Enrolled</p>
                    <p className="text-2xl font-bold">128</p>
                    <div className="flex items-center text-xs mt-1">
                      <span className="text-green-600 font-medium">86% of target</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-slate-500">Time to First Patient Enrolled</p>
                    <p className="text-2xl font-bold">4.2 mo</p>
                    <div className="flex items-center text-xs mt-1">
                      <span className="text-green-600 font-medium">1.8 mo faster than industry avg</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Alerts and Updates */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                  Pipeline Alerts
                </CardTitle>
                <CardDescription>
                  Important updates for your therapeutic areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-md">
                    <p className="font-medium text-amber-800">Competitor Trial Update</p>
                    <p className="text-sm text-amber-700 mt-1">
                      CompetitorX initiated Phase 2 trial for similar NSCLC indication as LUM-1
                    </p>
                    <p className="text-xs text-amber-600 mt-2">
                      April 5, 2025 • High Priority
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-md">
                    <p className="font-medium text-green-800">Regulatory Update</p>
                    <p className="text-sm text-green-700 mt-1">
                      FDA released new guidance for checkpoint inhibitor combination trials
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      March 28, 2025 • Medium Priority
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-md">
                    <p className="font-medium text-blue-800">Publication Alert</p>
                    <p className="text-sm text-blue-700 mt-1">
                      New meta-analysis published on dual cytokine inhibitors in IBD
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      March 15, 2025 • Medium Priority
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Link href="/alerts/lumen-bio">
                  <Button variant="outline" className="w-full">View All Alerts</Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/analytics/trial-comparison/LUM-1">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Microscope className="h-4 w-4" />
                    Compare LUM-1 to Similar Trials
                  </Button>
                </Link>
                <Link href="/protocols/templates/new">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Beaker className="h-4 w-4" />
                    Generate Protocol Template
                  </Button>
                </Link>
                <Link href="/analytics/market/oncology">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <BarChart className="h-4 w-4" />
                    View Oncology Market Trends
                  </Button>
                </Link>
                <Link href="/analytics/enrollment-strategies">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <PieChart className="h-4 w-4" />
                    Analyze Enrollment Strategies
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
