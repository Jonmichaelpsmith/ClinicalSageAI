import React from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Database, FileText, Brain, BarChart, Lock, Beaker, FileSpreadsheet } from 'lucide-react';

const HomeMarketingPage = () => {
  return (
    <div className="min-h-screen bg-white">
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
      <section className="pt-16 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-green-50">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900">
              Revolutionize Your Regulatory Document Workflow with AI
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The all-in-one platform for pharmaceutical R&D teams, offering intelligent submission building, validation, and compliance checking.
            </p>
            
            {/* Solutions and Entry Points Banner */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Solutions & Entry Points</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/ind-wizard" className="flex flex-col items-center p-3 bg-green-50 rounded-md hover:bg-green-100 transition-colors">
                  <Brain className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-center">IND Wizard™</span>
                </Link>
                <Link href="/clinical-metadata" className="flex flex-col items-center p-3 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
                  <Database className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-center">Metadata Repository</span>
                </Link>
                <Link href="/study-architect" className="flex flex-col items-center p-3 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors">
                  <Beaker className="h-8 w-8 text-amber-600 mb-2" />
                  <span className="text-sm font-medium text-center">Study Architect™</span>
                </Link>
                <Link href="/csr-intelligence" className="flex flex-col items-center p-3 bg-green-50 rounded-md hover:bg-green-100 transition-colors">
                  <FileText className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-center">CSR Intelligence™</span>
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
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
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Transforming Regulatory Documentation</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform optimizes every aspect of the regulatory documentation process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>ICH Wiz™</CardTitle>
                <CardDescription>Comprehensive regulatory knowledge</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our Digital Compliance Coach has expert knowledge of global regulatory guidelines, helping you navigate complex requirements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>IND Wizard™</CardTitle>
                <CardDescription>Guided regulatory document creation</CardDescription>
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
                <CardDescription>3,217+ parsed study reports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access a vast repository of clinical study reports to benchmark your trials against industry standards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Document Workflows?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-6 w-6 text-green-400" />
                <span className="text-xl font-bold tracking-tight text-white">TrialSage™</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Advanced AI-powered SaaS platform revolutionizing clinical and pharmaceutical document workflows.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Solutions</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white">IND Wizard</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Study Architect</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">CSR Intelligence</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Clinical MDR</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Regulatory Blog</a></li>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeMarketingPage;