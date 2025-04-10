import React from "react";
import { Link } from "wouter";
import { 
  Search, FileText, Brain, Lock, Microscope, CheckCircle, 
  Database, BarChart2, PieChart, LineChart, BookOpen,
  Rocket, ChevronRight, AreaChart, Beaker, Users
} from "lucide-react";

import { PageContainer, HeaderSection, ContentSection, CardGrid, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <PageContainer>
      <HeaderSection>
        <Navbar />
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-3 py-8 md:py-10 lg:py-12">
          <div className="space-y-2">
            <Badge variant="outline" className="text-primary border-primary px-3 py-1">
              SaaS for Early-Stage Biotechs
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              TrialSage<span className="text-black dark:text-white"> - AI-Powered CSR Intelligence</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Extract, analyze, and generate insights from clinical study reports. 
              Design better trials, faster, at a fraction of the cost.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-2">
            <Link href="/dashboard">
              <Button size="lg" className="h-11">
                View Demo Dashboard <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="h-11">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </HeaderSection>
      <ContentSection className="bg-gradient-to-b from-white to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container px-4 md:px-6 py-12 md:py-16 lg:py-20">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
            <div className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Revolutionize Your Trial Design
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-5xl bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Turn Public CSRs Into Your Strategic Advantage
            </h2>
            <p className="mx-auto max-w-[800px] text-slate-600 text-lg md:text-xl dark:text-slate-400">
              TrialSage combines AI-powered analysis with the world's largest structured CSR database to help you design better trials, secure funding, and accelerate regulatory approval.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {/* Card 1 - Protocol Optimizer */}
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-xl transition-all hover:shadow-2xl dark:bg-slate-800/60 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-8">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-800 dark:text-white">Protocol Optimizer</h3>
                <p className="mb-5 text-slate-600 dark:text-slate-400">
                  Receive AI-generated protocol recommendations trained on 1,900+ successful clinical trials. Identify optimal endpoints, inclusion/exclusion criteria, and study design.
                </p>
                <Link href="/protocol-generator" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  Design Your Trial <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            {/* Card 2 - Competitive Intelligence */}
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-xl transition-all hover:shadow-2xl dark:bg-slate-800/60 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-8">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-800 dark:text-white">Competitive Intelligence</h3>
                <p className="mb-5 text-slate-600 dark:text-slate-400">
                  Compare your trial directly against competitors. Identify differentiation opportunities and benchmark against success rates for similar indications and phases.
                </p>
                <Link href="/dashboard" className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                  Benchmark Your Design <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            {/* Card 3 - Premium Dossier */}
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-xl transition-all hover:shadow-2xl dark:bg-slate-800/60 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-8">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-800 dark:text-white">Premium Dossier Creation</h3>
                <p className="mb-5 text-slate-600 dark:text-slate-400">
                  Request custom investor-ready dossiers combining AI analysis with expert review. Perfect for due diligence, regulatory meetings, and study design justification.
                </p>
                <Link href="/premium-dossier" className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300">
                  Request Custom Dossier <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            {/* Card 4 - CSR Search Engine */}
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-xl transition-all hover:shadow-2xl dark:bg-slate-800/60 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-8">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-800 dark:text-white">Intelligent CSR Search</h3>
                <p className="mb-5 text-slate-600 dark:text-slate-400">
                  Search across thousands of CSRs by indication, phase, outcomes, and more. Find critical data on similar trials that would take weeks to compile manually.
                </p>
                <Link href="/reports" className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">
                  Explore CSR Database <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            {/* Card 5 - Study Design Agent */}
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-xl transition-all hover:shadow-2xl dark:bg-slate-800/60 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-8">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-800 dark:text-white">Study Design Agent</h3>
                <p className="mb-5 text-slate-600 dark:text-slate-400">
                  Chat with our specialized AI agent trained on successful trial patterns. Get expert advice on study design questions, endpoints, and regulatory considerations.
                </p>
                <Link href="/study-design-agent" className="inline-flex items-center text-amber-600 font-medium hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300">
                  Chat with Design Agent <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            {/* Card 6 - Statistical Models */}
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-xl transition-all hover:shadow-2xl dark:bg-slate-800/60 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-8">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
                  <AreaChart className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-800 dark:text-white">Statistical Modeling</h3>
                <p className="mb-5 text-slate-600 dark:text-slate-400">
                  Use our advanced statistical tools to forecast trial outcomes, simulate different scenarios, and identify key risk factors that could impact your study.
                </p>
                <Link href="/statistical-modeling" className="inline-flex items-center text-red-600 font-medium hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                  Simulate Trial Outcomes <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-base rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md">
                Try Demo Dashboard <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/premium-dossier">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-xl">
                Get Custom Analysis
              </Button>
            </Link>
          </div>
        </div>
      </ContentSection>
      <ContentSection>
        <div className="container px-4 md:px-6 py-8 md:py-10 lg:py-12">
          <div className="grid gap-4 lg:grid-cols-[1fr_400px] lg:gap-8 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Why TrialSage?
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Early-stage biotechs waste significant resources designing trials from scratch or relying on generic consulting.
                  We turn buried trial intelligence into actionable insights.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="font-medium">Hard-to-find CSRs made accessible</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="font-medium">Structured and filterable data</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="font-medium">No proposal processes or wait times</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="font-medium">Startup-friendly pricing & interfaces</span>
                </div>
              </div>
              <div>
                <Link href="/use-cases">
                  <Button variant="outline" className="mt-4">
                    Explore Our Use Cases
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div className="grid gap-4 md:gap-8">
                  <div className="rounded-lg bg-gradient-to-b from-blue-500 to-blue-700 p-8 text-white">
                    <Database className="mb-2 h-10 w-10" />
                    <h3 className="text-xl font-bold">CSR Repository</h3>
                    <p className="text-blue-100">
                      Access hundreds of structured CSRs from public sources
                    </p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-b from-purple-500 to-purple-700 p-8 text-white">
                    <Microscope className="mb-2 h-10 w-10" />
                    <h3 className="text-xl font-bold">Biomarker Analysis</h3>
                    <p className="text-purple-100">
                      Cross-study analysis of biomarker response patterns
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:gap-8">
                  <div className="rounded-lg bg-gradient-to-b from-emerald-500 to-emerald-700 p-8 text-white">
                    <Beaker className="mb-2 h-10 w-10" />
                    <h3 className="text-xl font-bold">Protocol Design</h3>
                    <p className="text-emerald-100">
                      AI-generated protocol templates based on successful trials
                    </p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-b from-amber-500 to-amber-700 p-8 text-white">
                    <Users className="mb-2 h-10 w-10" />
                    <h3 className="text-xl font-bold">Patient Selection</h3>
                    <p className="text-amber-100">
                      Optimize inclusion/exclusion criteria for your study
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentSection>
      <ContentSection className="bg-slate-50 dark:bg-slate-900">
        <div className="container px-4 md:px-6 py-8 md:py-10 lg:py-12">
          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-4xl">
                Who Uses TrialSage
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Tailored for early-stage biotechs with limited resources but ambitious clinical development plans.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-5">
            <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow-sm dark:bg-gray-950">
              <Rocket className="h-10 w-10 text-blue-600 mb-2" />
              <h3 className="text-xl font-bold">Biotech Founders</h3>
              <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
                Seed to Series B companies needing fast, low-cost trial design support
              </p>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow-sm dark:bg-gray-950">
              <FileText className="h-10 w-10 text-indigo-600 mb-2" />
              <h3 className="text-xl font-bold">Clinical Operations</h3>
              <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
                Protocol designers requiring historical trial data and references
              </p>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow-sm dark:bg-gray-950">
              <Lock className="h-10 w-10 text-purple-600 mb-2" />
              <h3 className="text-xl font-bold">Regulatory Teams</h3>
              <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
                Consultants preparing submissions and benchmarking study designs
              </p>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow-sm dark:bg-gray-950">
              <LineChart className="h-10 w-10 text-green-600 mb-2" />
              <h3 className="text-xl font-bold">Biotech Investors</h3>
              <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
                VCs conducting due diligence on trial feasibility and design quality
              </p>
            </div>
          </div>
        </div>
      </ContentSection>
      <ContentSection>
        <div className="container px-4 md:px-6 py-8 md:py-10 lg:py-12">
          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-4xl">
                Pricing Plans
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Simple, transparent pricing for companies of all sizes.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 mt-6">
            <div className="flex flex-col rounded-xl border p-6 shadow-sm">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Free</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Basic access for evaluation
                </p>
              </div>
              <div className="mt-4">
                <div className="text-4xl font-bold">$0</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">per month</div>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>5 reports/month</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Basic search capabilities</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Simple export options</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/pricing">
                  <Button className="w-full" variant="outline">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex flex-col rounded-xl border bg-primary p-6 shadow-sm text-white">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Pro</h3>
                <p className="text-primary-foreground/80">
                  Full platform capabilities
                </p>
              </div>
              <div className="mt-4">
                <div className="text-4xl font-bold">$149</div>
                <div className="text-sm text-primary-foreground/80">per month</div>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-white" />
                  <span>Unlimited search & reports</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-white" />
                  <span>AI Protocol Generator</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-white" />
                  <span>Study Design Agent access</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-white" />
                  <span>Advanced exports (PDF, CSV)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-white" />
                  <span>Statistical modeling tools</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/pricing">
                  <Button className="w-full bg-white text-primary hover:bg-white/90">
                    Subscribe Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex flex-col rounded-xl border p-6 shadow-sm">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Enterprise</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Customized for larger organizations
                </p>
              </div>
              <div className="mt-4">
                <div className="text-4xl font-bold">Custom</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">contact for pricing</div>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>API access</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>White-label options</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/pricing">
                  <Button className="w-full" variant="outline">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ContentSection>
      <Footer className="border-t">
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <h4 className="text-base font-medium">Product</h4>
              <ul className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Use Cases</li>
                <li>API</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-medium">Resources</h4>
              <ul className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <li>Documentation</li>
                <li>FAQ</li>
                <li>Support</li>
                <li>Use Case Library</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-medium">Company</h4>
              <ul className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-medium">Legal</h4>
              <ul className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <li>Terms</li>
                <li>Privacy</li>
                <li>Cookies</li>
                <li>Licenses</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 TrialSage. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <Twitter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <Linkedin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <Github className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </Footer>
    </PageContainer>
  );
}

function Twitter(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}

function Linkedin(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function Github(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}