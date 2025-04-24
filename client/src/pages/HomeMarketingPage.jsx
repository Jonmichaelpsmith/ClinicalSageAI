import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  ChevronDown,
  Search,
  LayoutDashboard,
  ArrowRight,
  Database,
  CheckCircle,
  Sparkles,
  BarChart3,
  FileCheck,
  Shield,
  FileText
} from 'lucide-react';

// CSR Counter component to fetch real CSR data
const CSRCounter = () => {
  const [csrCount, setCsrCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCSRCount = async () => {
      try {
        // Fetch the actual count from the CSR API
        const response = await fetch('/api/csr/count');
        
        if (response.ok) {
          const data = await response.json();
          setCsrCount(data.count);
        } else {
          console.warn('Falling back to default CSR count');
          setCsrCount(3217);
        }
      } catch (error) {
        console.error('Error fetching CSR count:', error);
        setCsrCount(3217);
      } finally {
        setLoading(false);
      }
    };

    fetchCSRCount();
  }, []);

  return (
    <span className="inline-flex items-baseline">
      <span className="text-xs font-semibold text-blue-800">{loading ? "..." : csrCount?.toLocaleString() || "3,217"}</span>
      <span className="text-[10px] text-[#444] ml-1">CSR Intelligence™ records</span>
    </span>
  );
};

// HomeMarketingPage.jsx - Main landing page with Certara-inspired design
export default function HomeMarketingPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* Soft gradient element at top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-300 via-green-300 to-blue-300 z-50"></div>
      
      {/* Certara-style header */}
      <header className="relative z-40">
        {/* Top utility bar with solutions alongside other nav items */}
        <div className="bg-[#002240] text-white">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            {/* Company info */}
            <div className="flex items-center">
              <Link to="/" className="text-[14px] font-bold text-white">CONCEPT2CURE.AI</Link>
            </div>
            
            {/* Right side utilities - Simplified */}
            <div className="flex items-center space-x-6">
              <Link to="/enterprise-csr-intelligence" className="text-white hover:text-gray-200">
                <Search className="h-4 w-4" />
              </Link>
              <Link to="/auth" className="text-[12px] bg-white/30 rounded px-3 py-1 text-white font-medium hover:bg-white/40 transition">
                Sign In
              </Link>
            </div>
          </div>
        </div>
        
        {/* Main navigation - exactly like Certara */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              {/* Logo & Brand - Enhanced contrast */}
              <div className="flex items-center">
                <Link to="/" className="inline-flex items-center group hover:opacity-90 transition-opacity">
                  <div className="bg-[#003057] rounded-md p-1.5 mr-2">
                    <span className="text-white font-bold text-xs">C2C</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[18px] font-bold text-[#003057]">CONCEPT2CURE.AI</span>
                    <span className="text-[12px] font-medium text-[#333] -mt-1">TrialSage™ Platform</span>
                  </div>
                </Link>
              </div>

              {/* Main Navigation - Improved Layout */}
              <nav className="hidden lg:flex justify-between flex-grow mx-8">
                {/* Primary Navigation Items */}
                <ul className="flex items-center space-x-4">
                  <li className="group relative">
                    <Link to="/use-case-library" className="inline-flex items-center px-3 py-2 text-[14px] font-bold text-[#000000] hover:text-[#0055aa] transition">
                      Solutions
                      <ChevronDown className="ml-1 h-3 w-3 transition" />
                    </Link>
                    <div className="absolute top-full left-0 mt-1 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white shadow-lg border border-gray-200 z-50 py-2 rounded">
                      <Link to="/ind-wizard" className="block px-4 py-2 text-[13px] font-medium text-[#222] hover:bg-gray-50 flex justify-between items-center">
                        <span>IND Wizard™</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">New</span>
                      </Link>
                      <Link to="/enterprise-csr-intelligence" className="block px-4 py-2 text-[13px] font-medium text-[#222] hover:bg-gray-50">
                        CSR Intelligence™
                      </Link>
                      <Link to="/protocol-design-use-case" className="block px-4 py-2 text-[13px] font-medium text-[#222] hover:bg-gray-50">
                        Protocol Design™
                      </Link>
                      <Link to="/cmc-insights-use-case" className="block px-4 py-2 text-[13px] font-medium text-[#222] hover:bg-gray-50">
                        CMC Insights™
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <Link to="/use-case-library" className="block px-4 py-2 text-[13px] font-semibold text-[#003057] hover:bg-blue-50">
                        View All Solutions
                      </Link>
                    </div>
                  </li>
                  
                  <li className="group relative">
                    <Link to="/ind-wizard" className="inline-flex items-center px-3 py-2 text-[14px] font-bold text-[#000000] hover:text-[#0055aa] transition">
                      IND Wizard
                    </Link>
                  </li>
                  
                  <li className="group relative">
                    <Link to="/enterprise-csr-intelligence" className="inline-flex items-center px-3 py-2 text-[14px] font-bold text-[#000000] hover:text-[#0055aa] transition">
                      CSR Intelligence
                    </Link>
                  </li>
                  
                  <li className="group relative">
                    <Link to="/versions" className="inline-flex items-center px-3 py-2 text-[14px] font-bold text-[#003057] hover:text-[#0055aa] transition bg-blue-50 rounded">
                      TrialSage.AI Solutions
                    </Link>
                  </li>
                </ul>
                
                {/* Secondary Navigation Items (Moved from top bar) */}
                <ul className="flex items-center space-x-4">
                  <li>
                    <Link to="/analytics-dashboard" className="inline-flex items-center px-3 py-2 text-[14px] font-bold text-[#000000] hover:text-[#0055aa] transition">
                      Analytics
                    </Link>
                  </li>
                  
                  <li>
                    <Link to="/ask-lumen" className="inline-flex items-center px-3 py-2 text-[14px] font-bold text-[#000000] hover:text-[#0055aa] transition">
                      Ask Lumen™
                    </Link>
                  </li>
                  
                  <li>
                    <Link to="/enterprise-csr-intelligence" className="text-[14px] font-bold text-[#000000] hover:text-[#0055aa] transition">
                      News
                    </Link>
                  </li>
                  
                  <li>
                    <Link to="/document-management" className="text-[14px] font-bold text-[#000000] hover:text-[#0055aa] transition">
                      Resources
                    </Link>
                  </li>
                  
                  <li>
                    <Link to="/team-signup" className="text-[14px] font-semibold text-[#111] hover:text-[#0078d4] transition">
                      Contact
                    </Link>
                  </li>
                  
                  <li className="relative group">
                    <a className="text-[14px] flex items-center font-semibold text-[#111] hover:text-[#0078d4] transition cursor-pointer">
                      English
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </a>
                    <div className="absolute right-0 mt-1 w-24 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white shadow-lg border border-gray-200 z-50 py-1 rounded">
                      <a className="block px-4 py-1 text-[12px] font-medium text-[#222] hover:bg-gray-50">English</a>
                      <a className="block px-4 py-1 text-[12px] font-medium text-[#222] hover:bg-gray-50">French</a>
                      <a className="block px-4 py-1 text-[12px] font-medium text-[#222] hover:bg-gray-50">German</a>
                    </div>
                  </li>
                </ul>
              </nav>

              {/* Right utilities - Improved contrast */}
              <div className="flex items-center space-x-4">
                <Link to="/auth" className="text-[14px] font-semibold text-[#111] hover:text-[#0078d4] transition pr-4">
                  Sign In
                </Link>
                
                <Link to="/auth">
                  <button className="bg-[#0066bb] hover:bg-[#005299] text-white py-2 px-4 text-[14px] font-semibold transition">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-[#f7f7f7] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-14 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
                Regulatory Intelligence—Reimagined.
              </div>
              <h1 className="text-3xl md:text-4xl font-light text-[#003057] mb-3 leading-tight">
                <span className="font-semibold">AI-Powered</span> Regulatory Document Intelligence
              </h1>
              <p className="text-[15px] text-[#444] mb-2">
                TrialSage™ slashes regulatory submission time by 67% with deep semantic understanding of clinical trial data across <CSRCounter /> and 58 therapeutic areas.
              </p>
              <p className="text-[13px] text-blue-600 font-medium mb-4">
                From Protocol to Product Approval—One Platform.
              </p>
              <div className="flex flex-wrap space-x-3 mb-5">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-[#444]">21 CFR Part 11</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-[#444]">FDA/EMA/PMDA Compliant</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-[#444]">92% First-Pass Success</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link to="/ind-wizard">
                  <button className="bg-[#0066bb] hover:bg-[#005299] text-white py-2 px-4 text-sm font-semibold rounded-md transition">
                    Start IND Wizard™
                  </button>
                </Link>
                <Link to="/use-case-library">
                  <button className="bg-white hover:bg-gray-50 text-[#111] border border-gray-300 py-2 px-4 text-sm font-semibold rounded-md transition">
                    View Solutions
                  </button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white rounded-lg shadow-xl p-4 border border-blue-100">
                <div className="text-[#003057] font-bold text-lg mb-2">Why TrialSage™?</div>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <div className="bg-blue-600 rounded-full h-2 w-2 mt-1.5 mr-2 flex-shrink-0"></div>
                    <span className="text-sm">Build & Submit with Confidence: Intelligently draft INDs, NDAs, and CTAs with one-click validation</span>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-600 rounded-full h-2 w-2 mt-1.5 mr-2 flex-shrink-0"></div>
                    <span className="text-sm">Data to Regulatory-Ready Outputs: AI-driven CSR Intelligence across <CSRCounter /> documents</span>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-600 rounded-full h-2 w-2 mt-1.5 mr-2 flex-shrink-0"></div>
                    <span className="text-sm">Single Source of Truth: Vault™ Workspace for CMC, CER, protocols and submissions</span>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-600 rounded-full h-2 w-2 mt-1.5 mr-2 flex-shrink-0"></div>
                    <span className="text-sm">AI Co-Pilot: Ask natural-language questions, get GPT-4o explanations, and fix validation errors</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Solutions */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#003057]">Enterprise-Grade Regulatory AI Solutions</h2>
            <p className="text-sm text-blue-600 mt-1">AI-Powered Document Drafting. Global-Ready Compliance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* IND Wizard */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-start mb-3">
                <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center mr-3">
                  <FileCheck className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-[#003057]">IND Wizard™</h3>
              </div>
              <div className="ml-11">
                <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                  67% Faster Submissions
                </div>
                <p className="text-[13px] text-gray-700 mb-3">
                  Guided questionnaire autopopulates Module 2 & 5 narratives with one-click eCTD packaging, validation, and health authority delivery.
                </p>
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <div className="bg-green-500 rounded-full h-1.5 w-1.5 mr-1.5"></div>
                    <span className="text-xs text-gray-600">Semantic protocol understanding</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-green-500 rounded-full h-1.5 w-1.5 mr-1.5"></div>
                    <span className="text-xs text-gray-600">Real-time FDA guidance sync</span>
                  </div>
                </div>
                <Link to="/ind-wizard" className="text-[13px] font-bold text-[#003057] hover:text-[#0066bb] inline-flex items-center">
                  Learn more <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* CSR Intelligence */}
            <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-start mb-3">
                <div className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center mr-3">
                  <BarChart3 className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-[#003057]">CSR Intelligence™</h3>
              </div>
              <div className="ml-11">
                <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mb-2">
                  <CSRCounter /> Analyzed
                </div>
                <p className="text-[13px] text-gray-700 mb-3">
                  Semantic NLP analysis of clinical study reports for cross-trial endpoint comparisons and safety signal detection with AI-powered risk mitigation.
                </p>
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <div className="bg-green-500 rounded-full h-1.5 w-1.5 mr-1.5"></div>
                    <span className="text-xs text-gray-600">25 enterprise analytics dashboards</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-green-500 rounded-full h-1.5 w-1.5 mr-1.5"></div>
                    <span className="text-xs text-gray-600">Protocol success predictors</span>
                  </div>
                </div>
                <Link to="/enterprise-csr-intelligence" className="text-[13px] font-bold text-[#003057] hover:text-[#0066bb] inline-flex items-center">
                  Learn more <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Ask Lumen */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-start mb-3">
                <div className="w-8 h-8 rounded-md bg-purple-100 flex items-center justify-center mr-3">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-[#003057]">Ask Lumen™</h3>
              </div>
              <div className="ml-11">
                <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mb-2">
                  Your Clinical, CMC, & CER Co-Pilot
                </div>
                <p className="text-[13px] text-gray-700 mb-3">
                  GPT-4o powered assistant with specialized knowledge of CMC requirements, global regulatory standards, and context-aware document assistance.
                </p>
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <div className="bg-green-500 rounded-full h-1.5 w-1.5 mr-1.5"></div>
                    <span className="text-xs text-gray-600">FDA/EMA/PMDA guidance</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-green-500 rounded-full h-1.5 w-1.5 mr-1.5"></div>
                    <span className="text-xs text-gray-600">Context-aware document help</span>
                  </div>
                </div>
                <Link to="/ask-lumen" className="text-[13px] font-bold text-[#003057] hover:text-[#0066bb] inline-flex items-center">
                  Learn more <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Solutions */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* CRC Module */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
              <h3 className="text-[15px] font-bold text-[#003057] mb-2 flex items-center">
                <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <span className="block h-1.5 w-1.5 bg-blue-600 rounded-full"></span>
                </span>
                CRC Module
              </h3>
              <p className="text-xs text-gray-700 mb-2">
                AI-powered study management with predictive enrollment models and deviation tracking.
              </p>
              <Link to="/crc-module" className="text-xs font-bold text-[#003057] hover:text-[#0066bb] inline-flex items-center">
                Explore <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
            
            {/* CER Module */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
              <h3 className="text-[15px] font-bold text-[#003057] mb-2 flex items-center">
                <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <span className="block h-1.5 w-1.5 bg-green-600 rounded-full"></span>
                </span>
                CER Module
              </h3>
              <p className="text-xs text-gray-700 mb-2">
                "Clinical Evaluation Report in 5 minutes" with AI-drafted sections and integrated safety data validation via MedDRA.
              </p>
              <Link to="/cer-module" className="text-xs font-bold text-[#003057] hover:text-[#0066bb] inline-flex items-center">
                Explore <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
            
            {/* Intelligent Doc Management */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
              <h3 className="text-[15px] font-bold text-[#003057] mb-2 flex items-center">
                <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                  <span className="block h-1.5 w-1.5 bg-orange-600 rounded-full"></span>
                </span>
                Vault™ Document Hub
              </h3>
              <p className="text-xs text-gray-700 mb-2">
                Microsoft-style file explorer with drag-and-drop, folder tree, version history, and audit-ready logs.
              </p>
              <Link to="/document-management" className="text-xs font-bold text-[#003057] hover:text-[#0066bb] inline-flex items-center">
                Explore <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
            
            {/* All Solutions */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
              <h3 className="text-[15px] font-bold text-[#003057] mb-2 flex items-center">
                <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                  <span className="block h-1.5 w-1.5 bg-purple-600 rounded-full"></span>
                </span>
                All Solutions
              </h3>
              <p className="text-xs text-gray-700 mb-2">
                Explore our complete regulatory intelligence suite with 25 enterprise dashboards.
              </p>
              <Link to="/use-case-library" className="text-xs font-bold text-[#003057] hover:text-[#0066bb] inline-flex items-center">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#003057]">Measurable ROI</h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Our deep semantic layer with FDA, EMA, PMDA, and NMPA compliance delivers quantifiable time and cost savings
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">67%</div>
              <p className="text-xs text-gray-600">Faster IND submissions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">58%</div>
              <p className="text-xs text-gray-600">Faster document creation</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">92%</div>
              <p className="text-xs text-gray-600">First-pass approval rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#003057] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-300 text-sm">© 2025 CONCEPT2CURE.AI. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-300 hover:text-white text-sm">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-300 hover:text-white text-sm">Terms of Service</Link>
              <Link to="/compliance" className="text-gray-300 hover:text-white text-sm">Compliance</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}