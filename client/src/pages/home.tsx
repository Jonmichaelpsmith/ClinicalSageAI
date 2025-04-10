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
import HomeFeatures from "@/components/features/HomeFeatures";

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
      <HomeFeatures />
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
                <li><Link href="/product-features">Features</Link></li>
                <li><Link href="/pricing-page">Pricing</Link></li>
                <li><Link href="/use-case-library">Use Cases</Link></li>
                <li><Link href="/api-documentation">API</Link></li>
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