import React from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Database, FileText, Brain, BarChart, Lock, Zap, Globe, Shield, Beaker, FlaskConical, FileSpreadsheet } from 'lucide-react';

const HomeMarketingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      <Helmet>
        <title>TrialSage™ - AI-Powered Regulatory Document Management</title>
        <meta name="description" content="TrialSage™ is an advanced AI-powered SaaS platform revolutionizing clinical and pharmaceutical document workflows" />
      </Helmet>

      {/* Navigation */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 border-b bg-white">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold tracking-tight">TrialSage™</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="/solutions" className="text-gray-600 hover:text-gray-900">Solutions</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
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
                Revolutionize Your Regulatory Document Workflow with AI
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                TrialSage™ is the all-in-one platform for pharmaceutical R&D teams, offering intelligent submission building, validation, and compliance checking with enterprise-grade analytics.
              </p>
              
              {/* Solutions and Entry Points Banner */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Solutions & Entry Points</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/ind-wizard" className="flex items-center p-2 bg-white rounded-md shadow-sm hover:bg-green-100 transition-colors">
                    <Brain className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium">IND Wizard™</span>
                  </Link>
                  <Link href="/clinical-metadata" className="flex items-center p-2 bg-white rounded-md shadow-sm hover:bg-green-100 transition-colors">
                    <Database className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">Metadata Repository</span>
                  </Link>
                  <Link href="/study-architect" className="flex items-center p-2 bg-white rounded-md shadow-sm hover:bg-green-100 transition-colors">
                    <Beaker className="h-5 w-5 text-amber-600 mr-2" />
                    <span className="text-sm font-medium">Study Architect™</span>
                  </Link>
                  <Link href="/csr-intelligence" className="flex items-center p-2 bg-white rounded-md shadow-sm hover:bg-green-100 transition-colors">
                    <FileText className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium">CSR Intelligence™</span>
                  </Link>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/auth?signup=true">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Request Demo
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center text-sm text-gray-500">
                <CheckCircle className="text-green-500 h-4 w-4 mr-2" />
                No credit card required for trial
              </div>
            </div>
            <div className="relative">
              <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="ml-auto text-sm text-gray-500">TrialSage™ Dashboard</div>
                </div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-100 rounded w-3/4"></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-24 bg-green-100 rounded flex items-center justify-center">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="h-24 bg-blue-100 rounded flex items-center justify-center">
                      <Database className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="h-24 bg-purple-100 rounded flex items-center justify-center">
                      <Brain className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="h-32 bg-gray-100 rounded"></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-yellow-100 p-3 rounded-lg shadow-md border border-yellow-200 transform rotate-3">
                <div className="text-sm font-medium text-yellow-800">New: ICH Wiz™</div>
                <div className="text-xs text-yellow-700">AI Regulatory Coach</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-gray-400 text-sm font-medium uppercase tracking-wide mb-8">
            Trusted by leading pharmaceutical companies
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 justify-items-center">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="h-8 w-32 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Transforming Regulatory Documentation</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform optimizes every aspect of the regulatory documentation process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>ICH Wiz™</CardTitle>
                <CardDescription>Comprehensive regulatory knowledge at your fingertips</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our Digital Compliance Coach has expert knowledge of global regulatory guidelines, helping you navigate complex requirements with ease.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>IND Wizard™</CardTitle>
                <CardDescription>Guided questionnaires for automated content creation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Quickly generate Module 2 and 5 narratives through intuitive questionnaires that autopopulate with compliant content.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Database className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>CSR Intelligence™</CardTitle>
                <CardDescription>3,217+ parsed study reports for cross-trial benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access a vast repository of clinical study reports to benchmark your trials against industry standards and identify optimization opportunities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-10 w-10 text-indigo-600 mb-2" />
                <CardTitle>Vault™ Workspace</CardTitle>
                <CardDescription>Secure document management and collaboration</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Store, access, and collaborate on your regulatory documents in a secure environment with robust version control and audit trails.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileSpreadsheet className="h-10 w-10 text-red-600 mb-2" />
                <CardTitle>Clinical Metadata Repository</CardTitle>
                <CardDescription>Centralized metadata management</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Manage clinical metadata with our cutting-edge repository that makes standardization, reuse, and governance simple and efficient.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart className="h-10 w-10 text-amber-600 mb-2" />
                <CardTitle>Analytics Layer</CardTitle>
                <CardDescription>25+ dashboards for comprehensive insights</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Gain valuable insights from our extensive analytics dashboards, covering everything from document quality to regulatory timelines.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Study Architect Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Study Architect™</h2>
              <p className="text-lg text-gray-600 mb-6">
                Our advanced AI-driven end-to-end protocol and study design module with sophisticated statistical simulation capabilities.
              </p>
              <ul className="space-y-4">
                {[
                  "AI-generated optimal study design recommendations",
                  "Monte Carlo statistical simulations",
                  "Protocol optimization with compliance checking",
                  "Seamless integration with eCTD submission",
                  "Automated cross-referencing and consistency validation"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-6">
                Learn More
              </Button>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
              <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="h-8 bg-gray-100 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 rounded"></div>
                  <div className="h-4 bg-gray-100 rounded"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center mb-3">
                    <Beaker className="h-5 w-5 text-blue-600 mr-2" />
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded"></div>
                    <div className="h-3 bg-gray-100 rounded"></div>
                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center mb-3">
                    <FlaskConical className="h-5 w-5 text-green-600 mr-2" />
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded"></div>
                    <div className="h-3 bg-gray-100 rounded"></div>
                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-green-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Regulatory Document Workflows?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-3xl mx-auto">
            Join the hundreds of pharmaceutical companies already benefiting from TrialSage™'s AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/auth?signup=true">
              <Button size="lg" variant="secondary">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-green-700">
                Schedule a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-6 w-6 text-green-400" />
                <span className="text-xl font-bold tracking-tight text-white">TrialSage™</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Advanced AI-powered SaaS platform revolutionizing clinical and pharmaceutical document workflows.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Solutions</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white">IND Wizard</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Study Architect</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">CSR Intelligence</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Vault Workspace</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Clinical MDR</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Partners</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">News</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Regulatory Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Webinars</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Case Studies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 TrialSage™. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeMarketingPage;