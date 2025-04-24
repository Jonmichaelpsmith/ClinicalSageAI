import React, { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Search, 
  History, 
  FileText, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  GitBranch, 
  Clipboard, 
  RefreshCw, 
  AlertTriangle,
  BarChart
} from 'lucide-react';

const ClinicalMetadataRepository = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Clinical Metadata Repository (CMDR) | TrialSage™</title>
        <meta name="description" content="Centralized management of clinical trial metadata for regulatory compliance and operational efficiency" />
      </Helmet>

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Clinical Metadata Repository (CMDR)</h1>
            <div className="flex space-x-3">
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-blue-900">Centralized Metadata Management</h2>
                <p className="text-lg text-slate-700">
                  The Clinical Metadata Repository (CMDR) provides a single source of truth for all clinical trial metadata, 
                  helping you standardize, govern, and optimize your clinical data and standards.
                </p>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-3">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Request Demo
                  </Button>
                  <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    View Documentation
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg transform rotate-3"></div>
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Database className="h-6 w-6 text-blue-600 mr-2" />
                        <h3 className="font-semibold text-lg">Centralized Repository</h3>
                      </div>
                      <div className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Active</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                        <span className="text-gray-600">Forms:</span>
                        <span className="font-medium">142</span>
                      </div>
                      <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                        <span className="text-gray-600">Terminologies:</span>
                        <span className="font-medium">74</span>
                      </div>
                      <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                        <span className="text-gray-600">Datasets:</span>
                        <span className="font-medium">53</span>
                      </div>
                      <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                        <span className="text-gray-600">Mappings:</span>
                        <span className="font-medium">32</span>
                      </div>
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-gray-600">Version Control:</span>
                        <span className="font-medium text-green-600">Enabled</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Value Proposition</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                  Regulatory Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                <p className="text-sm text-slate-600">
                  Ensure compliance with FDA, EMA, and ICH standards through standardized, governed metadata with audit trails and version control.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2 text-blue-600" />
                  Operational Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                <p className="text-sm text-slate-600">
                  Reduce study startup time by 30-45% through reuse of validated forms, controlled terminologies, and standardized datasets.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-purple-600" />
                  Data Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                <p className="text-sm text-slate-600">
                  Improve clinical data quality with standardized forms, consistent terminologies, and validated datasets across all trials.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Key Use Cases</h2>
          <Tabs defaultValue="forms">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="forms">Forms Management</TabsTrigger>
              <TabsTrigger value="terminology">Terminology Management</TabsTrigger>
              <TabsTrigger value="datasets">Dataset Standards</TabsTrigger>
              <TabsTrigger value="governance">Governance & Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="forms" className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Standardized Form Management</h3>
                    <p className="text-slate-700 mb-4">
                      Create, manage, and version eCRF forms with full governance and reuse capabilities across studies.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Centralized library of validated eCRF forms with reusable components</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Version control with full history tracking for regulatory compliance</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Form validation against standards with automated quality checks</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Direct export to EDC systems with validated mappings</span>
                      </li>
                    </ul>
                    <div className="mt-6">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Explore Form Management
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Impact Statistics</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Time Savings</span>
                          <span className="font-medium">45%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Error Reduction</span>
                          <span className="font-medium">62%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "62%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>EDC Integration</span>
                          <span className="font-medium">83%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "83%" }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-xs text-gray-500">Without standardized forms, 32% of studies face deployment delays.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="terminology" className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Controlled Terminology Management</h3>
                    <p className="text-slate-700 mb-4">
                      Govern industry-standard and custom terminologies with semantic mappings and cross-study consistency.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Support for CDISC, MedDRA, LOINC, SNOMED-CT, and custom dictionaries</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Semantic search with intelligent term matching</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Version control for terminology updates with differential analysis</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Cross-terminology mappings for enhanced interoperability</span>
                      </li>
                    </ul>
                    <div className="mt-6">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Explore Terminology Management
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Impact Statistics</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Data Consistency</span>
                          <span className="font-medium">89%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "89%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Mapping Efficiency</span>
                          <span className="font-medium">72%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "72%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Reuse Rate</span>
                          <span className="font-medium">65%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-xs text-gray-500">Inconsistent terminology can increase data cleaning costs by 40%.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="datasets" className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Dataset Standards Management</h3>
                    <p className="text-slate-700 mb-4">
                      Define, validate, and govern SDTM, ADaM, and custom datasets with full lifecycle management and submission readiness.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">CDISC SDTM and ADaM dataset templates with validation rules</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Automated impact analysis for dataset specification changes</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Traceability from raw data to standardized datasets</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Submission-ready dataset validation with FDA/PMDA compliance checks</span>
                      </li>
                    </ul>
                    <div className="mt-6">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Explore Dataset Standards
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Impact Statistics</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Validation Success</span>
                          <span className="font-medium">94%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "94%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Submission Readiness</span>
                          <span className="font-medium">87%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "87%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Time-to-Submission</span>
                          <span className="font-medium">-38%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "38%" }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-xs text-gray-500">Non-standardized datasets are 5x more likely to have submission delays.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="governance" className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Governance & Compliance</h3>
                    <p className="text-slate-700 mb-4">
                      Implement robust governance processes with full audit trails, approval workflows, and regulatory compliance checks.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Role-based access control with fine-grained permissions</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Configurable approval workflows with electronic signatures</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Comprehensive audit trails for 21 CFR Part 11 compliance</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Automated validation reports for regulatory inspections</span>
                      </li>
                    </ul>
                    <div className="mt-6">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Explore Governance Features
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Impact Statistics</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Compliance Rate</span>
                          <span className="font-medium">98%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "98%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Audit Readiness</span>
                          <span className="font-medium">96%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "96%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Process Efficiency</span>
                          <span className="font-medium">74%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "74%" }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-xs text-gray-500">Poor governance can lead to 60% higher inspection findings.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Core Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
              <div className="mb-4">
                <div className="bg-blue-100 p-2 rounded-lg inline-block">
                  <Search className="h-5 w-5 text-blue-700" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Semantic Search</h3>
              <p className="text-sm text-gray-600 flex-grow">
                Intelligent semantic search capabilities let you find forms, terminologies, and 
                datasets based on meaning, not just exact text matches.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
              <div className="mb-4">
                <div className="bg-green-100 p-2 rounded-lg inline-block">
                  <GitBranch className="h-5 w-5 text-green-700" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Version Control</h3>
              <p className="text-sm text-gray-600 flex-grow">
                Comprehensive versioning for all metadata with history tracking, 
                comparisons, and the ability to restore previous versions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
              <div className="mb-4">
                <div className="bg-purple-100 p-2 rounded-lg inline-block">
                  <History className="h-5 w-5 text-purple-700" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Audit Trails</h3>
              <p className="text-sm text-gray-600 flex-grow">
                Complete, tamper-proof audit trails for all metadata changes with 
                user information, timestamps, and change details.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
              <div className="mb-4">
                <div className="bg-amber-100 p-2 rounded-lg inline-block">
                  <AlertTriangle className="h-5 w-5 text-amber-700" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Impact Analysis</h3>
              <p className="text-sm text-gray-600 flex-grow">
                Proactively assess the impact of metadata changes on dependent 
                systems, studies, and submissions before implementation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
              <div className="mb-4">
                <div className="bg-red-100 p-2 rounded-lg inline-block">
                  <FileText className="h-5 w-5 text-red-700" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">EDC Export</h3>
              <p className="text-sm text-gray-600 flex-grow">
                Direct export to leading EDC systems with validation to ensure 
                forms and datasets transfer correctly with proper mappings.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
              <div className="mb-4">
                <div className="bg-indigo-100 p-2 rounded-lg inline-block">
                  <Layers className="h-5 w-5 text-indigo-700" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Standards Library</h3>
              <p className="text-sm text-gray-600 flex-grow">
                Comprehensive library of industry standards (CDISC, LOINC, MedDRA) 
                with automatic updates and version management.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl overflow-hidden shadow-md">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Optimize Your Clinical Metadata?</h2>
              <p className="text-blue-100 mb-6 max-w-3xl">
                Streamline your clinical trial metadata management, ensure compliance, and 
                accelerate your studies with our enterprise-grade Clinical Metadata Repository.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button className="bg-white text-blue-700 hover:bg-blue-50">
                  Request a Demo
                </Button>
                <Button variant="outline" className="text-white border-white/30 hover:bg-blue-700/50">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ClinicalMetadataRepository;