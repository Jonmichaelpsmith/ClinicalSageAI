import React from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  Clock, 
  Database, 
  FileText, 
  Brain, 
  BarChart, 
  Lock, 
  Beaker, 
  FileSpreadsheet, 
  Zap, 
  Users, 
  FileCheck,
  Search,
  Microscope
} from 'lucide-react';

const HomeMarketingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      <Helmet>
        <title>TrialSage™ - AI-Powered Regulatory Compliance for Life Sciences</title>
        <meta name="description" content="TrialSage™ automates regulatory compliance and trial initiation, cutting timelines and costs for biotech and CROs with AI-driven innovations." />
      </Helmet>

      {/* Navigation */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 border-b bg-white">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold tracking-tight">TrialSage™</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/solutions" className="text-gray-600 hover:text-gray-900">Solutions</Link>
            <Link href="/benefits" className="text-gray-600 hover:text-gray-900">Benefits</Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">About Us</Link>
            <Link href="/resources" className="text-gray-600 hover:text-gray-900">Resources</Link>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/auth">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/auth?signup=true">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Transform Regulatory Compliance with AI
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                TrialSage™ automates document drafting, predicts risks, and optimizes trial design to cut timelines by up to 67%, accelerating your path to First Patient In.
              </p>
              
              {/* Solutions Banner */}
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-8">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Solutions & Entry Points</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/ind-wizard" className="flex items-center space-x-2 p-2 bg-green-50 rounded-md hover:bg-green-100 transition-colors">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-sm">IND Wizard™</span>
                  </Link>
                  <Link href="/ask-lumen" className="flex items-center space-x-2 p-2 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
                    <Search className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-sm">Ask Lumen™</span>
                  </Link>
                  <Link href="/csr-intelligence" className="flex items-center space-x-2 p-2 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors">
                    <Microscope className="h-5 w-5 text-amber-600" />
                    <span className="font-medium text-sm">CSR Intelligence™</span>
                  </Link>
                  <Link href="/vault-document-hub" className="flex items-center space-x-2 p-2 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors">
                    <Lock className="h-5 w-5 text-indigo-600" />
                    <span className="font-medium text-sm">Vault™ Document Hub</span>
                  </Link>
                  <Link href="/crc-module" className="flex items-center space-x-2 p-2 bg-pink-50 rounded-md hover:bg-pink-100 transition-colors">
                    <Users className="h-5 w-5 text-pink-600" />
                    <span className="font-medium text-sm">CRC Module</span>
                  </Link>
                  <Link href="/cer-module" className="flex items-center space-x-2 p-2 bg-green-50 rounded-md hover:bg-green-100 transition-colors">
                    <FileCheck className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-sm">CER Module</span>
                  </Link>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/demo">
                  <Button size="lg" className="w-full sm:w-auto">
                    Schedule a Demo
                  </Button>
                </Link>
                <Link href="/auth?signup=true">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center text-sm text-gray-500">
                <CheckCircle className="text-green-500 h-4 w-4 mr-2" />
                No credit card required for trial
              </div>
            </div>
            <div>
              <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-500">TrialSage™ Dashboard</div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-semibold text-sm text-green-800">Time Savings: 67% faster IND submission</span>
                    </div>
                    <div className="mt-2 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[67%]"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-2">
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-xs text-blue-800">IND Wizard™</span>
                      </div>
                      <div className="text-xs text-gray-600">Auto-generates compliant regulatory narratives</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex items-center mb-2">
                        <Search className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="font-medium text-xs text-purple-800">Ask Lumen™</span>
                      </div>
                      <div className="text-xs text-gray-600">Real-time regulatory guidance</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center mb-2">
                      <Microscope className="h-5 w-5 text-amber-600 mr-2" />
                      <span className="font-medium text-sm text-amber-800">CSR Intelligence™</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      3,217+ analyzed reports
                      <div className="mt-2 flex justify-between text-xs">
                        <span>Safety Signals</span>
                        <span>Endpoint Analysis</span>
                        <span>Risk Prediction</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-pink-50 rounded-lg border border-pink-100">
                      <div className="flex items-center mb-2">
                        <Users className="h-5 w-5 text-pink-600 mr-2" />
                        <span className="font-medium text-xs text-pink-800">CRC Module</span>
                      </div>
                      <div className="text-xs text-gray-600">Trial operations optimizer</div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <div className="flex items-center mb-2">
                        <Lock className="h-5 w-5 text-indigo-600 mr-2" />
                        <span className="font-medium text-xs text-indigo-800">Vault™</span>
                      </div>
                      <div className="text-xs text-gray-600">Compliant document hub</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Highlight Label */}
              <div className="absolute -top-6 -right-6 bg-yellow-100 p-3 rounded-lg shadow-md border border-yellow-200 transform rotate-3 hidden md:block">
                <div className="text-sm font-medium text-yellow-800">New: 92% IND Acceptance Rate</div>
                <div className="text-xs text-yellow-700">AI-powered compliance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Disrupting Clinical Trial Processes</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              TrialSage™ addresses major industry inefficiencies, accelerating your path to First Patient In (FPI).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Risk Reduction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  AI tools predict and mitigate risks like supply chain issues and regulatory delays before they impact your trial.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">Compliance validation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">Supply chain monitoring</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">Predictive analytics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Speed to FPI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Automate site selection, patient recruitment, and documentation to accelerate First Patient In timelines.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">67% faster IND submissions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">Optimized site selection</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">Streamlined patient recruitment</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Intelligent Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Our AI-powered modules handle compliance and documentation, reducing manual work and human error.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">GPT-4o powered assistance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">Auto-generated documents</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">Real-time compliance checks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Comprehensive AI-Powered Solutions</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform's specialized modules work together to streamline every aspect of regulatory compliance and trial management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Brain className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>IND Wizard™</CardTitle>
                <CardDescription>67% faster regulatory submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Automates preparation of IND applications with AI-drafted narratives for Module 2 and 5, ensuring compliance with FDA, EMA, PMDA, and NMPA standards.
                </p>
                <Link href="/ind-wizard">
                  <Button variant="outline" size="sm" className="w-full">Learn More</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Microscope className="h-10 w-10 text-amber-600 mb-2" />
                <CardTitle>CSR Intelligence™</CardTitle>
                <CardDescription>3,217+ analyzed study reports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Analyzes Clinical Study Reports using semantic NLP to identify safety signals, cross-trial endpoint comparisons, and critical insights.
                </p>
                <Link href="/csr-intelligence">
                  <Button variant="outline" size="sm" className="w-full">Learn More</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Search className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Ask Lumen™</CardTitle>
                <CardDescription>On-demand regulatory co-pilot</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  AI-powered regulatory assistant built on GPT-4o with specialized expertise in FDA, EMA, PMDA, and NMPA guidelines.
                </p>
                <Link href="/ask-lumen">
                  <Button variant="outline" size="sm" className="w-full">Learn More</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-pink-600 mb-2" />
                <CardTitle>CRC Module</CardTitle>
                <CardDescription>Clinical trial operations optimizer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Streamlines clinical trial operations with predictive enrollment models and deviation tracking for optimal site selection and patient recruitment.
                </p>
                <Link href="/crc-module">
                  <Button variant="outline" size="sm" className="w-full">Learn More</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileCheck className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>CER Module</CardTitle>
                <CardDescription>5-minute clinical evaluation reports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Generates compliant Clinical Evaluation Reports for medical devices in minutes instead of weeks, with MedDRA validation.
                </p>
                <Link href="/cer-module">
                  <Button variant="outline" size="sm" className="w-full">Learn More</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-10 w-10 text-indigo-600 mb-2" />
                <CardTitle>Vault™ Document Hub</CardTitle>
                <CardDescription>Secure document management</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  AI-enhanced document management with smart search, version control, and audit-ready logs compliant with 21 CFR Part 11, HIPAA, and GDPR.
                </p>
                <Link href="/vault-document-hub">
                  <Button variant="outline" size="sm" className="w-full">Learn More</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Measurable Impact for Biotech and CROs</h2>
              <p className="text-lg text-gray-600 mb-6">
                TrialSage delivers concrete benefits that transform how small and mid-sized teams compete in the life sciences market.
              </p>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Time Savings</span>
                    <span className="font-medium text-green-600">67%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 w-[67%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">IND Acceptance Rate</span>
                    <span className="font-medium text-green-600">92%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 w-[92%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">CER Generation Speed</span>
                    <span className="font-medium text-green-600">5 min</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 w-[95%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Analyzed CSRs</span>
                    <span className="font-medium text-green-600">3,217+</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 w-[85%]"></div>
                  </div>
                </div>
              </div>
              <Link href="/benefits">
                <Button className="mt-8">
                  View Full Benefits
                </Button>
              </Link>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-4">Client Success Stories</h3>
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">BioTech Innovations</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    "IND Wizard reduced our submission preparation time from 3 months to just 4 weeks. The AI-generated narratives were accepted by the FDA with minimal revisions."
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Device Dynamics</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    "The CER Module generated our clinical evaluation report in 5 minutes flat. What used to take our team weeks now takes minutes, accelerating our CE marking process."
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">CureCRO</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    "CSR Intelligence helped us identify a critical safety signal across our oncology trials that we had missed. This insight informed our protocol design and likely prevented issues."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-green-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Level the Playing Field with TrialSage™</h2>
          <p className="text-xl opacity-90 mb-10 max-w-3xl mx-auto">
            Don't let outdated manual processes hold you back. Join the future of biotech compliance and accelerate your path to success.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/demo">
              <Button size="lg" variant="secondary">
                Schedule a Demo
              </Button>
            </Link>
            <Link href="/auth?signup=true">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-green-700">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-6 w-6 text-green-400" />
                <span className="text-xl font-bold tracking-tight text-white">TrialSage™</span>
              </div>
              <p className="text-gray-400 mb-4">
                Advanced AI-powered platform revolutionizing regulatory compliance for biotech and CROs.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Solutions</h3>
              <ul className="space-y-3">
                <li><Link href="/ind-wizard" className="text-gray-400 hover:text-white">IND Wizard™</Link></li>
                <li><Link href="/csr-intelligence" className="text-gray-400 hover:text-white">CSR Intelligence™</Link></li>
                <li><Link href="/ask-lumen" className="text-gray-400 hover:text-white">Ask Lumen™</Link></li>
                <li><Link href="/crc-module" className="text-gray-400 hover:text-white">CRC Module</Link></li>
                <li><Link href="/cer-module" className="text-gray-400 hover:text-white">CER Module</Link></li>
                <li><Link href="/vault-document-hub" className="text-gray-400 hover:text-white">Vault™ Document Hub</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white">Careers</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link href="/press" className="text-gray-400 hover:text-white">Press</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><Link href="/resources/documentation" className="text-gray-400 hover:text-white">Documentation</Link></li>
                <li><Link href="/resources/case-studies" className="text-gray-400 hover:text-white">Case Studies</Link></li>
                <li><Link href="/resources/webinars" className="text-gray-400 hover:text-white">Webinars</Link></li>
                <li><Link href="/resources/regulatory-guides" className="text-gray-400 hover:text-white">Regulatory Guides</Link></li>
                <li><Link href="/resources/support" className="text-gray-400 hover:text-white">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 Concept2Cure.AI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeMarketingPage;