import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2, Database, Search, Shield, FlaskConical, Brain } from "lucide-react";
import { Link } from "wouter";

const LumenValuePropositionBanner = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 py-12 px-4 sm:px-6 lg:px-8 rounded-lg border border-blue-100 dark:border-indigo-900 mb-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-blue-900 dark:text-blue-100 sm:text-5xl md:text-6xl">
            <span className="block">LumenTrialGuide.AI</span>
            <span className="block text-indigo-600 dark:text-indigo-400 mt-1">Evidence-Driven Clinical Trial Intelligence</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-lg text-gray-600 dark:text-gray-300 sm:text-xl md:mt-5 md:max-w-3xl">
            Transforming thousands of clinical study reports into actionable intelligence for better trial design, faster execution, and higher success rates.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href="/spra-direct">
                <Button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                  Try Protocol Advisor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link href="/csr-search">
                <Button variant="outline" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                  Explore CSR Library
                  <Search className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          <Card className="border-indigo-100 dark:border-indigo-900 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-indigo-100 dark:bg-indigo-900 p-3 mr-4">
                  <Database className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Unified CSR Repository
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Access 3,000+ structured clinical study reports across therapeutic areas, pulled from regulatory agencies worldwide with our standardized ICH-compliant data model.
              </p>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 dark:border-indigo-900 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-indigo-100 dark:bg-indigo-900 p-3 mr-4">
                  <FlaskConical className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Evidence-Based Protocol Design
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Generate optimized clinical trial protocols based on real-world evidence, revealing successful design patterns and optimal endpoints for your therapeutic area.
              </p>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 dark:border-indigo-900 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-indigo-100 dark:bg-indigo-900 p-3 mr-4">
                  <BarChart2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Success Probability Modeling
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Predict trial outcomes with our advanced analytics engine that identifies what factors impact success rates across indications, phases, and design parameters.
              </p>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 dark:border-indigo-900 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-indigo-100 dark:bg-indigo-900 p-3 mr-4">
                  <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Risk Identification & Mitigation
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Automatically identify potential risks and design flaws in your protocols by comparing against patterns from successful and failed trials in your therapeutic area.
              </p>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 dark:border-indigo-900 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-indigo-100 dark:bg-indigo-900 p-3 mr-4">
                  <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Strategic Protocol Advisor
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Receive AI-powered recommendations for optimal sample size, inclusion/exclusion criteria, endpoint selection, and study duration tailored to your specific indication.
              </p>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 dark:border-indigo-900 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-indigo-100 dark:bg-indigo-900 p-3 mr-4">
                  <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Regulatory Intelligence
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Stay aligned with evolving regulatory standards with our built-in analysis of successful submissions, common deficiencies, and agency expectations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Results section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-10">
            Proven Results for Top Biopharmaceutical Companies
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">28%</p>
              <p className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-300">Increase in trial success probability</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">35%</p>
              <p className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-300">Reduction in protocol amendments</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">40%</p>
              <p className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-300">Faster protocol development time</p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-16 bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-12 w-12 text-indigo-500" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-lg leading-tight font-medium text-gray-900 dark:text-gray-100">
                  "LumenTrialGuide.AI transformed our approach to protocol development. Using the platform's evidence-based insights, we optimized our Phase 2 oncology trial design and achieved statistical significance with a smaller sample size, saving millions in development costs."
                </p>
                <div className="mt-4">
                  <p className="text-base font-semibold text-indigo-600 dark:text-indigo-400">Dr. Sarah Johnson</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Clinical Development Director, Leading Biotech</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Ready to transform your clinical development?
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-600 dark:text-gray-300">
            Join leading biopharmaceutical companies using Lumen's evidence-driven approach.
          </p>
          <div className="mt-6">
            <Link href="/spra-direct">
              <Button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LumenValuePropositionBanner;