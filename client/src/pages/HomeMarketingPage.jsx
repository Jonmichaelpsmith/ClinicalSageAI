import React from 'react';
import { Link } from 'wouter';
import { 
  ArrowRight, 
  Database, 
  LayoutDashboard, 
  FileCheck, 
  BarChart3,
  Search,
  ChevronDown,
  CheckCircle,
  Sparkles
} from 'lucide-react';

// HomeMarketingPage.jsx - Main landing page with Certara-inspired design
// IMPORTANT: This file contains the main marketing page design.
// For maximum stability:
// 1. Always test changes in a safe environment before deploying
// 2. Keep error boundaries in place
// 3. Avoid removing the core layout structure
// 4. Maintain fallback error handling

export default function HomeMarketingPage() {
  // Error protection wrapper ensures graceful fallbacks
  try {
    // Main rendering with comprehensive error handling
    return (
      <div className="min-h-screen bg-white font-sans antialiased">
        {/* Soft gradient element at top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-300 via-green-300 to-blue-300 z-50"></div>
        
        {/* Certara-style header */}
        <header className="relative z-40">
          {/* Top utility bar (matches Certara exactly) - HEOR Bar with SOLUTIONS dropdown */}
          <div className="bg-[#003057] text-white">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
              {/* Left side - SOLUTIONS dropdown */}
              <div className="relative group">
                <a className="text-[11px] flex items-center text-white hover:text-gray-200 transition font-semibold cursor-pointer">
                  <span>SOLUTIONS</span>
                  <ChevronDown className="ml-1 h-3 w-3" />
                </a>
                <div className="absolute left-0 mt-1 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white shadow-lg border border-gray-200 z-50 py-1">
                  <Link to="/ind-wizard" className="block px-4 py-2 text-[11px] text-[#444] hover:bg-gray-50 flex justify-between items-center">
                    <span>IND Wizard™</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">New</span>
                  </Link>
                  <Link to="/enterprise-csr-intelligence" className="block px-4 py-2 text-[11px] text-[#444] hover:bg-gray-50">
                    CSR Intelligence™
                  </Link>
                  <Link to="/protocol-design-use-case" className="block px-4 py-2 text-[11px] text-[#444] hover:bg-gray-50">
                    Protocol Design™
                  </Link>
                  <Link to="/cmc-insights-use-case" className="block px-4 py-2 text-[11px] text-[#444] hover:bg-gray-50">
                    CMC Insights™
                  </Link>
                  <Link to="/document-vault-use-case" className="block px-4 py-2 text-[11px] text-[#444] hover:bg-gray-50">
                    Document Vault™
                  </Link>
                  <Link to="/ai-copilot-use-case" className="block px-4 py-2 text-[11px] text-[#444] hover:bg-gray-50">
                    AI Copilot™
                  </Link>
                  <Link to="/cer-generator-use-case" className="block px-4 py-2 text-[11px] text-[#444] hover:bg-gray-50">
                    CER Generator™
                  </Link>
                  <Link to="/use-case-library" className="block px-4 py-2 text-[11px] text-[#444] hover:bg-gray-50 border-t border-gray-100">
                    Use Case Library
                  </Link>
                </div>
              </div>
              
              {/* Right side utilities */}
              <div className="flex items-center space-x-6">
                <Link to="/enterprise-csr-intelligence" className="text-[11px] text-white hover:text-gray-200 transition">News</Link>
                <Link to="/document-management" className="text-[11px] text-white hover:text-gray-200 transition">Resources</Link>
                <Link to="/team-signup" className="text-[11px] text-white hover:text-gray-200 transition">Contact</Link>
                <div className="relative group">
                  <a className="text-[11px] flex items-center text-white hover:text-gray-200 transition cursor-pointer">
                    <span>English</span>
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </a>
                  <div className="absolute right-0 mt-1 w-24 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white shadow-lg border border-gray-200 z-50 py-1">
                    <a className="block px-4 py-1 text-[11px] text-[#444] hover:bg-gray-50">English</a>
                    <a className="block px-4 py-1 text-[11px] text-[#444] hover:bg-gray-50">French</a>
                    <a className="block px-4 py-1 text-[11px] text-[#444] hover:bg-gray-50">German</a>
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
                      <button className="inline-flex items-center px-4 py-2 text-[14px] font-medium text-[#333] hover:text-[#0078d4] transition bg-transparent border-none cursor-pointer">
                        Solutions
                        <ChevronDown className="ml-1 h-3 w-3 transition group-hover:rotate-180" />
                      </button>
                      
                      {/* Dropdown with delay to make it easier to click */}
                      <div className="absolute left-0 mt-2 w-[240px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 bg-white shadow-lg border border-gray-200 z-50 py-4"
                           style={{ transitionDelay: '0.15s' }}
                      >
                        <Link to="/ind-wizard" className="block px-6 py-3 text-[14px] text-[#444] hover:text-[#0078d4] hover:bg-gray-50">
                          IND Wizard™
                        </Link>
                        <Link to="/enterprise-csr-intelligence" className="block px-6 py-3 text-[14px] text-[#444] hover:text-[#0078d4] hover:bg-gray-50">
                          CSR Intelligence™
                        </Link>
                        <Link to="/versions" className="block px-6 py-3 text-[14px] text-[#444] hover:text-[#0078d4] hover:bg-gray-50">
                          Document Vault™
                        </Link>
                        <Link to="/analytics-dashboard" className="block px-6 py-3 text-[14px] text-[#444] hover:text-[#0078d4] hover:bg-gray-50">
                          Analytics
                        </Link>
                        <Link to="/cmc-blueprint-generator" className="block px-6 py-3 text-[14px] text-[#444] hover:text-[#0078d4] hover:bg-gray-50">
                          CMC Blueprint™
                        </Link>
                        <Link to="/ask-lumen" className="block px-6 py-3 text-[14px] text-[#444] hover:text-[#0078d4] hover:bg-gray-50">
                          Ask Lumen™
                        </Link>
                        <Link to="/case-studies" className="block px-6 py-3 text-[14px] text-[#444] hover:text-[#0078d4] hover:bg-gray-50">
                          Case Studies
                        </Link>
                      </div>
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
                      <Link to="/versions" className="inline-flex items-center px-4 py-2 text-[14px] font-medium text-[#333] hover:text-[#0078d4] transition">
                        Document Vault
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

        {/* Hero Section - Certara style with soft orange/green gradient */}
        <section className="relative bg-[#f7f7f7] border-b border-gray-200 overflow-hidden">
          {/* Soft gradient background elements */}
          <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-orange-100 opacity-30 blur-3xl"></div>
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-green-100 opacity-30 blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 pr-0 md:pr-16 mb-10 md:mb-0">
                <h1 className="text-4xl font-light text-[#003057] leading-tight mb-6">
                  Your regulatory submissions, <span className="font-bold">accelerated</span>
                </h1>
                
                <p className="text-lg text-[#444] mb-8 leading-relaxed">
                  The complete AI-powered platform for regulatory writing and submissions across FDA, EMA, and PMDA markets.
                </p>
                
                <div className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
                  <Link to="/ind-wizard">
                    <button className="w-full sm:w-auto bg-gradient-to-r from-[#0078d4] to-[#0063af] hover:from-[#0063af] hover:to-[#005696] text-white px-6 py-3 text-[14px] font-medium transition flex items-center justify-center shadow-sm">
                      Launch IND Wizard™
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </Link>
                  
                  <Link to="/ask-lumen">
                    <button className="w-full sm:w-auto bg-white hover:bg-gray-50 text-[#0078d4] border border-[#0078d4] px-6 py-3 text-[14px] font-medium transition flex items-center justify-center">
                      Try Ask Lumen™
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
              
              <div className="w-full md:w-1/2">
                <div className="bg-white rounded-sm shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-[#003057] to-[#004f9f] px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Sparkles className="h-5 w-5 text-white mr-2" />
                        <h3 className="text-lg font-semibold text-white">Ask Lumen™</h3>
                      </div>
                      <div className="text-xs text-white bg-white/10 rounded px-2 py-1">10-Min Free Trial</div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-[#444] text-sm mb-5">
                      Your digital regulatory compliance coach with deep knowledge of FDA guidelines and global regulations.
                    </p>
                    
                    <div className="mb-5 space-y-3">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-[#0078d4] mr-3 flex-shrink-0" />
                        <div className="text-sm text-[#444]">Real-time regulatory guidance</div>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-[#0078d4] mr-3 flex-shrink-0" />
                        <div className="text-sm text-[#444]">Multi-modal document analysis</div>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-[#0078d4] mr-3 flex-shrink-0" />
                        <div className="text-sm text-[#444]">Powered by OpenAI GPT-4o</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Link to="/ask-lumen">
                        <button className="bg-[#0078d4] hover:bg-[#005fa6] text-white px-5 py-2 text-sm font-medium flex items-center transition">
                          Start Free Trial
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CSR Intelligence Counter Section */}
        <section className="bg-gray-50 py-6 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <BarChart3 className="h-5 w-5 text-[#0078d4] mr-2" />
                <span className="text-sm text-[#333]">
                  <span className="font-semibold">3,021</span> clinical study reports analyzed in our intelligence engine
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-[#666] mr-3">Powered by:</span>
                <span className="text-sm font-semibold text-[#444] mr-1">GPT-4o</span>
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Complete Product Suite Navigation - Compact design with all modules */}
        <section className="bg-white py-4 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
              <Link to="/ind-wizard" className="flex flex-col items-center justify-center p-3 rounded-md hover:bg-gray-50 transition">
                <FileCheck className="h-5 w-5 text-[#0078d4] mb-1" />
                <span className="text-xs font-medium text-[#333] text-center">IND Wizard™</span>
              </Link>
              
              <Link to="/enterprise-csr-intelligence" className="flex flex-col items-center justify-center p-3 rounded-md hover:bg-gray-50 transition">
                <LayoutDashboard className="h-5 w-5 text-[#0078d4] mb-1" />
                <span className="text-xs font-medium text-[#333] text-center">CSR Intelligence™</span>
              </Link>
              
              <Link to="/protocol-design-use-case" className="flex flex-col items-center justify-center p-3 rounded-md hover:bg-gray-50 transition">
                <FileSymlink className="h-5 w-5 text-[#0078d4] mb-1" />
                <span className="text-xs font-medium text-[#333] text-center">Protocol Design™</span>
              </Link>
              
              <Link to="/cmc-insights-use-case" className="flex flex-col items-center justify-center p-3 rounded-md hover:bg-gray-50 transition">
                <Database className="h-5 w-5 text-[#0078d4] mb-1" />
                <span className="text-xs font-medium text-[#333] text-center">CMC Insights™</span>
              </Link>
              
              <Link to="/document-vault-use-case" className="flex flex-col items-center justify-center p-3 rounded-md hover:bg-gray-50 transition">
                <Shield className="h-5 w-5 text-[#0078d4] mb-1" />
                <span className="text-xs font-medium text-[#333] text-center">Document Vault™</span>
              </Link>
              
              <Link to="/ask-lumen" className="flex flex-col items-center justify-center p-3 rounded-md hover:bg-gray-50 transition">
                <Sparkles className="h-5 w-5 text-[#0078d4] mb-1" />
                <span className="text-xs font-medium text-[#333] text-center">Ask Lumen™</span>
              </Link>
              
              <Link to="/cer-generator-use-case" className="flex flex-col items-center justify-center p-3 rounded-md hover:bg-gray-50 transition">
                <FileText className="h-5 w-5 text-[#0078d4] mb-1" />
                <span className="text-xs font-medium text-[#333] text-center">CER Generator™</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ROI Story Section */}
        <section className="bg-gray-50 py-8 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/3 mb-6 md:mb-0 md:pr-8">
                <h3 className="text-lg font-semibold text-[#003057] mb-2">Clear ROI in Regulatory Operations</h3>
                <p className="text-sm text-[#555]">Our clients experience measurable improvements in submission quality, timeline reduction, and resource optimization.</p>
              </div>
              
              <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xl font-bold text-[#0078d4]">55%</div>
                  <div className="text-xs text-[#666]">Reduced Time to Submission</div>
                </div>
                
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xl font-bold text-[#0078d4]">$2.1M</div>
                  <div className="text-xs text-[#666]">Average Cost Savings Per Trial</div>
                </div>
                
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xl font-bold text-[#0078d4]">87%</div>
                  <div className="text-xs text-[#666]">Improved First-Pass Acceptance</div>
                </div>
                
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xl font-bold text-[#0078d4]">68%</div>
                  <div className="text-xs text-[#666]">Reduced Review Cycles</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Grid - Certara style */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-light text-[#003057] mb-3">Integrated Regulatory Solutions</h2>
              <p className="text-[#666] max-w-3xl mx-auto">
                Our seamlessly connected modules share a unified knowledge base, ensuring compliance across global markets.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* IND Wizard Card - Certara style */}
              <div className="bg-white border border-gray-200 shadow-sm transition hover:shadow-md">
                <div className="h-[160px] bg-[#f7f7f7] flex items-center justify-center">
                  <FileCheck className="h-12 w-12 text-[#0078d4]" />
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#003057] mb-3">
                    IND Wizard™
                  </h3>
                  
                  <p className="text-sm text-[#666] mb-4 min-h-[60px]">
                    AI-powered IND preparation with auto-generated modules, reducing submission time by 55%.
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-[#0078d4] mr-2 flex-shrink-0" />
                      <span className="text-[#444]">Auto-generate Modules 1-5</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-[#0078d4] mr-2 flex-shrink-0" />
                      <span className="text-[#444]">FDA, EMA, PMDA submission-ready</span>
                    </li>
                  </ul>
                  
                  <Link to="/ind-wizard">
                    <button className="w-full text-[#0078d4] border border-[#0078d4] hover:bg-gray-50 py-2 px-4 text-sm font-medium flex items-center justify-center transition">
                      Learn More
                      <ArrowRight className="ml-2 w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* CSR Intelligence Card - Certara style */}
              <div className="bg-white border border-gray-200 shadow-sm transition hover:shadow-md">
                <div className="h-[160px] bg-[#f7f7f7] flex items-center justify-center">
                  <LayoutDashboard className="h-12 w-12 text-[#0078d4]" />
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#003057] mb-3">
                    CSR Intelligence™
                  </h3>
                  
                  <p className="text-sm text-[#666] mb-4 min-h-[60px]">
                    Transform static CSRs into interactive dashboards with structured data extraction.
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-[#0078d4] mr-2 flex-shrink-0" />
                      <span className="text-[#444]">Extract structured data from any CSR</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-[#0078d4] mr-2 flex-shrink-0" />
                      <span className="text-[#444]">Natural language search across trials</span>
                    </li>
                  </ul>
                  
                  <Link to="/enterprise-csr-intelligence">
                    <button className="w-full text-[#0078d4] border border-[#0078d4] hover:bg-gray-50 py-2 px-4 text-sm font-medium flex items-center justify-center transition">
                      Learn More
                      <ArrowRight className="ml-2 w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* Document Vault Card - Certara style */}
              <div className="bg-white border border-gray-200 shadow-sm transition hover:shadow-md">
                <div className="h-[160px] bg-[#f7f7f7] flex items-center justify-center">
                  <Database className="h-12 w-12 text-[#0078d4]" />
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#003057] mb-3">
                    Document Vault™
                  </h3>
                  
                  <p className="text-sm text-[#666] mb-4 min-h-[60px]">
                    Secure, 21 CFR Part 11 compliant document storage with intelligent version control.
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-[#0078d4] mr-2 flex-shrink-0" />
                      <span className="text-[#444]">21 CFR Part 11 compliant</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-[#0078d4] mr-2 flex-shrink-0" />
                      <span className="text-[#444]">DocuShare integration</span>
                    </li>
                  </ul>
                  
                  <Link to="/versions">
                    <button className="w-full text-[#0078d4] border border-[#0078d4] hover:bg-gray-50 py-2 px-4 text-sm font-medium flex items-center justify-center transition">
                      Learn More
                      <ArrowRight className="ml-2 w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/use-case-library">
                <button className="bg-[#0078d4] hover:bg-[#005fa6] text-white px-6 py-3 text-[14px] font-medium rounded-md transition flex items-center mx-auto">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Explore Use Case Library
                </button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Stats Section - with soft gradient backgrounds */}
        <section className="relative bg-[#f7f7f7] py-16 border-y border-gray-200 overflow-hidden">
          {/* Soft gradient background elements */}
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-orange-50 opacity-40 blur-3xl"></div>
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-green-50 opacity-40 blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-[#003057] mb-3">Proven Results</h2>
              <p className="text-[#666] max-w-3xl mx-auto">
                Our platform delivers measurable performance improvements across regulatory workflows.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-center rounded-sm">
                <div className="text-4xl font-bold bg-gradient-to-r from-[#0078d4] to-[#005fa6] bg-clip-text text-transparent mb-2">55%</div>
                <p className="text-lg font-medium text-[#003057] mb-3">Faster Submissions</p>
                <p className="text-sm text-[#666]">Complete IND preparation in 5-7 months instead of 14+ months with traditional methods.</p>
              </div>
              
              <div className="bg-white p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-center rounded-sm">
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent mb-2">61%</div>
                <p className="text-lg font-medium text-[#003057] mb-3">Fewer Amendments</p>
                <p className="text-sm text-[#666]">AI-guided protocol design reduces amendments from 2.3 to 0.9 per study.</p>
              </div>
              
              <div className="bg-white p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-center rounded-sm">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent mb-2">100%</div>
                <p className="text-lg font-medium text-[#003057] mb-3">Compliance</p>
                <p className="text-sm text-[#666]">Enterprise-grade platform meets 21 CFR Part 11 compliance requirements with full audit trails.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section - Certara style */}
        <section className="bg-[#003057] py-16 text-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-light mb-4">Ready to accelerate your regulatory submissions?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join leading biopharma companies already using TrialSage™ to transform their regulatory processes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/team-signup">
                <button className="w-full sm:w-auto bg-white text-[#003057] hover:bg-gray-100 px-6 py-3 text-[14px] font-medium transition">
                  Schedule a Demo
                </button>
              </Link>
              <Link to="/auth">
                <button className="w-full sm:w-auto bg-[#0078d4] hover:bg-[#005fa6] text-white px-6 py-3 text-[14px] font-medium transition">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Footer - Certara style */}
        <footer className="bg-[#f7f7f7] border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h5 className="text-base font-semibold text-[#003057] mb-4">
                  Solutions
                </h5>
                <ul className="space-y-2">
                  <li><Link to="/ind-wizard" className="text-sm text-[#666] hover:text-[#0078d4] transition">IND Wizard™</Link></li>
                  <li><Link to="/enterprise-csr-intelligence" className="text-sm text-[#666] hover:text-[#0078d4] transition">CSR Intelligence™</Link></li>
                  <li><Link to="/versions" className="text-sm text-[#666] hover:text-[#0078d4] transition">Document Vault™</Link></li>
                  <li><Link to="/analytics-dashboard" className="text-sm text-[#666] hover:text-[#0078d4] transition">Analytics</Link></li>
                </ul>
              </div>
              
              <div>
                <h5 className="text-base font-semibold text-[#003057] mb-4">
                  Company
                </h5>
                <ul className="space-y-2">
                  <li><Link to="/solutions" className="text-sm text-[#666] hover:text-[#0078d4] transition">About</Link></li>
                  <li><Link to="/analytics-dashboard" className="text-sm text-[#666] hover:text-[#0078d4] transition">Leadership</Link></li>
                  <li><Link to="/team-signup" className="text-sm text-[#666] hover:text-[#0078d4] transition">Careers</Link></li>
                  <li><Link to="/team-signup" className="text-sm text-[#666] hover:text-[#0078d4] transition">Contact</Link></li>
                </ul>
              </div>
              
              <div>
                <h5 className="text-base font-semibold text-[#003057] mb-4">
                  Resources
                </h5>
                <ul className="space-y-2">
                  <li><Link to="/document-management" className="text-sm text-[#666] hover:text-[#0078d4] transition">Documentation</Link></li>
                  <li><Link to="/enterprise-csr-intelligence" className="text-sm text-[#666] hover:text-[#0078d4] transition">Regulatory Resources</Link></li>
                  <li><Link to="/enterprise-csr-intelligence" className="text-sm text-[#666] hover:text-[#0078d4] transition">Blog</Link></li>
                  <li><Link to="/team-signup" className="text-sm text-[#666] hover:text-[#0078d4] transition">Events</Link></li>
                </ul>
              </div>
              
              <div>
                <h5 className="text-base font-semibold text-[#003057] mb-4">
                  Legal
                </h5>
                <ul className="space-y-2">
                  <li><Link to="/team-signup" className="text-sm text-[#666] hover:text-[#0078d4] transition">Privacy Policy</Link></li>
                  <li><Link to="/team-signup" className="text-sm text-[#666] hover:text-[#0078d4] transition">Terms of Service</Link></li>
                  <li><Link to="/team-signup" className="text-sm text-[#666] hover:text-[#0078d4] transition">Cookie Policy</Link></li>
                  <li><Link to="/team-signup" className="text-sm text-[#666] hover:text-[#0078d4] transition">GDPR</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-gray-300 flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <div className="flex flex-col">
                  <span className="text-base font-bold text-[#003057]">CONCEPT2CURE.AI</span>
                  <span className="text-xs text-[#666]">TrialSage™ Platform</span>
                </div>
              </div>
              
              <div className="text-sm text-[#666]">
                © {new Date().getFullYear()} Concept2Cure.AI. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  } catch (error) {
    console.error("Error rendering HomeMarketingPage:", error);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded shadow-md border border-gray-200">
          <h1 className="text-xl font-semibold text-[#003057] mb-4 text-center">We're updating our platform</h1>
          <p className="text-[#666] mb-6 text-center">
            Our team is currently refreshing the TrialSage experience. Please check back shortly.
          </p>
          <div className="flex justify-center">
            <Link to="/solutions" className="bg-[#0078d4] hover:bg-[#005fa6] text-white px-5 py-2.5 rounded text-sm font-medium">
              Browse Solutions
            </Link>
          </div>
        </div>
      </div>
    );
  }
}