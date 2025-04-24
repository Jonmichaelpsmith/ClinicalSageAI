import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  FileText, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight, 
  FileBarChart, 
  Microscope, 
  BookOpen,
  ChevronRight
} from 'lucide-react';

const LumenBioLanding = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Lumen Biosciences | Regulatory Documentation Platform</title>
      </Helmet>
      
      {/* Header with gradient background */}
      <header className="bg-gradient-to-b from-blue-50 to-white pt-6 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome to Lumen Biosciences</h1>
              <p className="text-slate-600 mt-2">Regulatory compliance documentation platform</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <FileText className="h-4 w-4 mr-2" />
                New Document
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-800 flex items-center">
                  <FileBarChart className="h-5 w-5 mr-2 text-blue-600" />
                  Active Trials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-900">5</p>
                <p className="text-sm text-blue-700">2 phase 2, 3 phase 1</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-800 flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                  Compliance Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-900">94%</p>
                <p className="text-sm text-green-700">Across all projects</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-amber-600" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-amber-900">42</p>
                <p className="text-sm text-amber-700">8 require attention</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-5">Active Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Spirulina-based Antibody Cocktail</CardTitle>
                <CardDescription>LB-301 Phase 2 Trial</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Trial Status:</span>
                    <span className="font-medium text-blue-600">Ongoing</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subjects Enrolled:</span>
                    <span className="font-medium">72/120 (60%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Last Updated:</span>
                    <span className="font-medium">Apr 22, 2025</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/lumen-bio/report-demo">
                  <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                    View Trial Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Ultra-High Yield Production System</CardTitle>
                <CardDescription>LB-201 Phase 1 Trial</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Trial Status:</span>
                    <span className="font-medium text-green-600">Completed</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subjects Enrolled:</span>
                    <span className="font-medium">48/48 (100%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Last Updated:</span>
                    <span className="font-medium">Mar 15, 2025</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                  View Trial Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Oral Biotherapeutic Platform</CardTitle>
                <CardDescription>LB-405 Phase 1 Trial</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Trial Status:</span>
                    <span className="font-medium text-purple-600">Recruiting</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subjects Enrolled:</span>
                    <span className="font-medium">14/40 (35%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Last Updated:</span>
                    <span className="font-medium">Apr 18, 2025</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                  View Trial Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-5">Recent Updates</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">ICH Guidelines Updates</CardTitle>
                <CardDescription>Recent regulatory changes affecting your submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 pb-3 border-b border-gray-100">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">ICH E6(R3) Good Clinical Practice</p>
                      <p className="text-sm text-slate-600 mt-1">Updated on March 15, 2025 with enhanced requirements for data integrity</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 pb-3 border-b border-gray-100">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">ICH M4Q(R2) Quality Module Updates</p>
                      <p className="text-sm text-slate-600 mt-1">Published on February 8, 2025 with focus on biologic products</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                  View All Guidelines
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Document Activity</CardTitle>
                <CardDescription>Latest activity across your regulatory documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 pb-3 border-b border-gray-100">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Interim Clinical Study Report - LB-301</p>
                      <p className="text-sm text-slate-600 mt-1">Updated by Dr. Sarah Chen - Apr 18, 2025</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 pb-3 border-b border-gray-100">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Investigator's Brochure - Spirulina-based Antibody Cocktail</p>
                      <p className="text-sm text-slate-600 mt-1">Updated by Dr. James Wilson - Apr 5, 2025</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Statistical Analysis Plan - LB-405</p>
                      <p className="text-sm text-slate-600 mt-1">Created by Dr. Michelle Lee - Apr 2, 2025</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                  View All Documents
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-3 px-4 flex justify-between items-center text-left bg-white border-gray-200 shadow-sm hover:bg-blue-50 hover:border-blue-200">
              <div className="flex items-center">
                <FileBarChart className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-slate-900">Compliance Reports</span>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </Button>
            
            <Button variant="outline" className="h-auto py-3 px-4 flex justify-between items-center text-left bg-white border-gray-200 shadow-sm hover:bg-blue-50 hover:border-blue-200">
              <div className="flex items-center">
                <Microscope className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-slate-900">Study Designs</span>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </Button>
            
            <Link href="/lumen-bio/report-demo">
              <Button variant="outline" className="h-auto py-3 px-4 flex justify-between items-center text-left bg-white border-gray-200 shadow-sm hover:bg-blue-50 hover:border-blue-200 w-full">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium text-slate-900">LB-301 Reports</span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </Button>
            </Link>
            
            <Button variant="outline" className="h-auto py-3 px-4 flex justify-between items-center text-left bg-white border-gray-200 shadow-sm hover:bg-blue-50 hover:border-blue-200">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-slate-900">ICH Guidelines</span>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LumenBioLanding;