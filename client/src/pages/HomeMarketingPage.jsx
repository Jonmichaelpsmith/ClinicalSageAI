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
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-semibold text-blue-800">{loading ? "..." : csrCount?.toLocaleString() || "3,217"}</span>
        <span className="text-[10px] text-[#444]">CSR Intelligence™ records</span>
      </div>
      <div className="text-[10px] text-[#666]">Across 58 therapeutic areas</div>
      <div className="text-[10px] text-[#666]">FDA, EMA, PMDA compliant</div>
    </div>
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
        <div className="bg-[#003057] text-white">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            {/* Company info */}
            <div className="flex items-center">
              <Link to="/" className="text-[14px] font-bold text-white">CONCEPT2CURE.AI</Link>
            </div>
            
            {/* Right side utilities INCLUDING SOLUTIONS */}
            <div className="flex items-center space-x-6">
              {/* SOLUTIONS dropdown positioned with other nav items */}
              <div className="relative group">
                <Link to="/use-case-library" className="text-[12px] flex items-center text-white hover:text-gray-200 transition font-semibold">
                  <span>SOLUTIONS</span>
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Link>
                <div className="absolute right-0 mt-1 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white shadow-lg border border-gray-200 z-50 py-2 rounded">
                  <Link to="/ind-wizard" className="block px-4 py-2 text-[12px] text-[#444] hover:bg-gray-50 flex justify-between items-center">
                    <span>IND Wizard™</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">New</span>
                  </Link>
                  <Link to="/enterprise-csr-intelligence" className="block px-4 py-2 text-[12px] text-[#444] hover:bg-gray-50">
                    CSR Intelligence™
                  </Link>
                  <Link to="/protocol-design-use-case" className="block px-4 py-2 text-[12px] text-[#444] hover:bg-gray-50">
                    Protocol Design™
                  </Link>
                  <Link to="/cmc-insights-use-case" className="block px-4 py-2 text-[12px] text-[#444] hover:bg-gray-50">
                    CMC Insights™
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link to="/use-case-library" className="block px-4 py-2 text-[12px] font-semibold text-[#0078d4] hover:bg-blue-50">
                    View All Solutions
                  </Link>
                </div>
              </div>

              <Link to="/enterprise-csr-intelligence" className="text-[12px] text-white hover:text-gray-200 transition">News</Link>
              <Link to="/document-management" className="text-[12px] text-white hover:text-gray-200 transition">Resources</Link>
              <Link to="/team-signup" className="text-[12px] text-white hover:text-gray-200 transition">Contact</Link>
              <div className="relative group">
                <a className="text-[12px] flex items-center text-white hover:text-gray-200 transition cursor-pointer">
                  <span>English</span>
                  <ChevronDown className="ml-1 h-3 w-3" />
                </a>
                <div className="absolute right-0 mt-1 w-24 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white shadow-lg border border-gray-200 z-50 py-1 rounded">
                  <a className="block px-4 py-1 text-[12px] text-[#444] hover:bg-gray-50">English</a>
                  <a className="block px-4 py-1 text-[12px] text-[#444] hover:bg-gray-50">French</a>
                  <a className="block px-4 py-1 text-[12px] text-[#444] hover:bg-gray-50">German</a>
                </div>
              </div>
              <Link to="/enterprise-csr-intelligence" className="text-white hover:text-gray-200">
                <Search className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Main navigation - exactly like Certara */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              {/* Logo & Brand */}
              <div className="flex items-center">
                <Link to="/">
                  <div className="flex flex-col">
                    <span className="text-[18px] font-bold text-[#003057]">CONCEPT2CURE.AI</span>
                    <span className="text-[12px] text-[#666] -mt-1">TrialSage™ Platform</span>
                  </div>
                </Link>
              </div>

              {/* Main Navigation - Certara style */}
              <nav className="hidden lg:flex">
                <ul className="flex items-center space-x-6">
                  <li className="group relative">
                    <Link to="/use-case-library" className="inline-flex items-center px-4 py-2 text-[14px] font-medium text-[#333] hover:text-[#0078d4] transition">
                      Solutions
                      <ChevronDown className="ml-1 h-3 w-3 transition" />
                    </Link>
                  </li>
                  
                  <li className="group relative">
                    <Link to="/ind-wizard" className="inline-flex items-center px-4 py-2 text-[14px] font-medium text-[#333] hover:text-[#0078d4] transition">
                      IND Wizard
                    </Link>
                  </li>
                  
                  <li className="group relative">
                    <Link to="/enterprise-csr-intelligence" className="inline-flex items-center px-4 py-2 text-[14px] font-medium text-[#333] hover:text-[#0078d4] transition">
                      CSR Intelligence
                    </Link>
                  </li>
                  
                  <li className="group relative">
                    <Link to="/versions" className="inline-flex items-center px-4 py-2 text-[14px] font-semibold text-[#0078d4] hover:text-[#0078d4] transition bg-blue-50 rounded">
                      TrialSage.AI Solutions
                    </Link>
                  </li>
                  
                  <li className="group relative">
                    <Link to="/analytics-dashboard" className="inline-flex items-center px-4 py-2 text-[14px] font-medium text-[#333] hover:text-[#0078d4] transition">
                      Analytics
                    </Link>
                  </li>
                  
                  <li className="group relative">
                    <Link to="/ask-lumen" className="inline-flex items-center px-4 py-2 text-[14px] font-medium text-[#333] hover:text-[#0078d4] transition">
                      Ask Lumen™
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Right utilities - Certara style */}
              <div className="flex items-center space-x-4">
                <Link to="/auth" className="text-[14px] font-medium text-[#333] hover:text-[#0078d4] transition pr-4">
                  Sign In
                </Link>
                
                <Link to="/auth">
                  <button className="bg-[#0078d4] hover:bg-[#005fa6] text-white py-2 px-4 text-[14px] font-medium transition">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-[#f7f7f7] border-b border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-light text-[#003057] mb-6 leading-tight">
                <span className="font-semibold">Accelerate</span> Regulatory Submissions with AI
              </h1>
              <p className="text-lg text-[#444] mb-8">
                TrialSage™ delivers enterprise-grade document automation, intelligent analytics, and regulatory compliance for pharmaceutical R&D teams with a deep semantic understanding of clinical trial data.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/ind-wizard">
                  <button className="bg-[#0078d4] hover:bg-[#005fa6] text-white py-3 px-6 text-[15px] font-medium transition w-full sm:w-auto">
                    Start with IND Wizard™
                  </button>
                </Link>
                <Link to="/enterprise-csr-intelligence">
                  <button className="bg-white hover:bg-gray-50 text-[#333] border border-gray-300 py-3 px-6 text-[15px] font-medium transition w-full sm:w-auto">
                    Explore CSR Intelligence™
                  </button>
                </Link>
              </div>
              
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-[#444] text-sm">FDA Compliant</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-[#444] text-sm">21 CFR Part 11</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-[#444] text-sm">3,217+ Clinical Study Reports</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Modules with Detailed Explanations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#003057] mb-4">Revolutionary Regulatory AI Modules</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform's deep semantic understanding of regulatory documents delivers unprecedented efficiency gains and compliance confidence.
            </p>
          </div>

          {/* IND Wizard Module */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="bg-blue-50 p-8 rounded-lg border border-blue-100">
                <h3 className="text-2xl font-bold text-[#003057] mb-4">IND Wizard™ Module</h3>
                <p className="text-gray-700 mb-4">
                  Our flagship AI-powered solution transforms the FDA IND submission process with intelligent automation that dramatically reduces time-to-filing by up to 67%.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span>Proprietary deep learning architecture extracts critical protocol insights and regulatory guidance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span>Auto-generation of compliant Form 1571, cover letters, and supporting documentation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span>Real-time validation against FDA guidelines, flag and fix compliance issues instantly</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span>Seamless integration with your existing document management systems</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link to="/ind-wizard">
                    <button className="bg-[#0078d4] hover:bg-[#005fa6] text-white py-2.5 px-5 text-sm font-medium rounded-md transition">
                      Explore IND Wizard™
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="text-right">
                <div className="inline-block bg-blue-600 text-white text-sm font-semibold py-1 px-3 rounded-md mb-3">
                  67% Faster IND Preparation
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
                <h4 className="text-[#003057] font-semibold mb-3">Key Differentiators:</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full p-1 mr-2">
                      <span className="block h-2 w-2 bg-blue-600 rounded-full"></span>
                    </span>
                    <span>Only solution with true semantic understanding of protocol elements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full p-1 mr-2">
                      <span className="block h-2 w-2 bg-blue-600 rounded-full"></span>
                    </span>
                    <span>Real-time FDA guidance synchronization for always-current compliance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full p-1 mr-2">
                      <span className="block h-2 w-2 bg-blue-600 rounded-full"></span>
                    </span>
                    <span>Proprietary AI-driven document correctness verification</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CSR Intelligence Module */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-center">
            <div className="lg:col-span-5 order-1">
              <div className="text-left">
                <div className="inline-block bg-green-600 text-white text-sm font-semibold py-1 px-3 rounded-md mb-3">
                  3,217+ CSR Advanced Analytics
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
                <h4 className="text-[#003057] font-semibold mb-3">Unmatched CSR Intelligence:</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full p-1 mr-2">
                      <span className="block h-2 w-2 bg-green-600 rounded-full"></span>
                    </span>
                    <span>Proprietary deep semantic layer understands regulatory context, not just text</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full p-1 mr-2">
                      <span className="block h-2 w-2 bg-green-600 rounded-full"></span>
                    </span>
                    <span>25 enterprise-grade dashboards with actionable insights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full p-1 mr-2">
                      <span className="block h-2 w-2 bg-green-600 rounded-full"></span>
                    </span>
                    <span>Only solution with multi-modal analysis across text, tables, and images</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="lg:col-span-7 order-2">
              <div className="bg-green-50 p-8 rounded-lg border border-green-100">
                <h3 className="text-2xl font-bold text-[#003057] mb-4">CSR Intelligence™ Module</h3>
                <p className="text-gray-700 mb-4">
                  The most comprehensive CSR analytics platform with deep semantic understanding of 3,217+ clinical study reports across 58 therapeutic areas, delivering insights impossible with traditional methods.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span>Proprietary vector embeddings extract protocol design patterns and success predictors from global CSR database</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span>Real-time protocol validation against successful historical trials in your therapeutic area</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span>Automated identification of exclusion/inclusion criteria optimization opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span>FDA, EMA, and PMDA regulatory alignment verification across all documents</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link to="/enterprise-csr-intelligence">
                    <button className="bg-[#0078d4] hover:bg-[#005fa6] text-white py-2.5 px-5 text-sm font-medium rounded-md transition">
                      Discover CSR Intelligence™
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* CRC & CER Modules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
            <div className="bg-purple-50 p-8 rounded-lg border border-purple-100">
              <h3 className="text-2xl font-bold text-[#003057] mb-4">CRC Module</h3>
              <p className="text-gray-700 mb-4">
                Our Clinical Research Coordinator module transforms study management with AI-powered workflow automation and predictive analytics.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <span>Real-time site performance tracking with predictive enrollment models</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <span>Automated protocol deviation identification and resolution tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <span>Integrated compliance monitoring with 21 CFR Part 11 validation</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link to="/crc-module">
                  <button className="bg-[#0078d4] hover:bg-[#005fa6] text-white py-2.5 px-5 text-sm font-medium rounded-md transition">
                    Explore CRC Module
                  </button>
                </Link>
              </div>
            </div>
            
            <div className="bg-orange-50 p-8 rounded-lg border border-orange-100">
              <h3 className="text-2xl font-bold text-[#003057] mb-4">CER Module</h3>
              <p className="text-gray-700 mb-4">
                Revolutionize Clinical Evaluation Reports with our AI-driven CER Module that ensures MDR and IVDR compliance while reducing preparation time by 58%.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <span>Automated literature search and relevance ranking across global databases</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <span>Intelligent evidence extraction and MEDDEV 2.7/1 rev.4 alignment</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <span>Dynamic safety profile monitoring with automated PMS updates</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link to="/cer-module">
                  <button className="bg-[#0078d4] hover:bg-[#005fa6] text-white py-2.5 px-5 text-sm font-medium rounded-md transition">
                    Explore CER Module
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Intelligent Document Management & AI Guide */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="bg-blue-50 p-8 rounded-lg border border-blue-100">
                <h3 className="text-2xl font-bold text-[#003057] mb-4">Intelligent Document Management</h3>
                <p className="text-gray-700 mb-4">
                  Our proprietary document management system goes beyond storage with AI-powered semantic understanding, version control, and regulatory compliance tracking.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span>Advanced document fingerprinting for 100% accurate duplicate detection</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span>AI-driven document classification with regulatory alignment verification</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span>Automatic metadata extraction and enrichment from all document types</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span>Real-time compliance monitoring across document lifecycle</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link to="/document-management">
                    <button className="bg-[#0078d4] hover:bg-[#005fa6] text-white py-2.5 px-5 text-sm font-medium rounded-md transition">
                      See Document Management
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="bg-indigo-50 p-8 rounded-lg border border-indigo-100">
                <h3 className="text-2xl font-bold text-[#003057] mb-4">Ask Lumen™ - AI Driven Guide</h3>
                <p className="text-gray-700 mb-4">
                  Your Digital Compliance Coach powered by OpenAI GPT-4o technology with specialized knowledge of CMC requirements and global regulatory standards.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span>Real-time regulatory guidance across FDA, EMA, and PMDA standards</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span>Context-aware assistance during document preparation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span>Comprehensive Chemistry, Manufacturing, and Controls expertise</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link to="/ask-lumen">
                    <button className="bg-[#0078d4] hover:bg-[#005fa6] text-white py-2.5 px-5 text-sm font-medium rounded-md transition">
                      Meet Ask Lumen™
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI and Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#003057] mb-4">Proven ROI Through Deep Semantic Intelligence</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our deep semantic layer and AI-driven understanding of regulatory documents deliver measurable time and cost savings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">67%</div>
              <p className="text-gray-700">Faster IND submission preparation</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">58%</div>
              <p className="text-gray-700">Reduction in regulatory document creation time</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">92%</div>
              <p className="text-gray-700">First-pass approval rate on submissions</p>
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