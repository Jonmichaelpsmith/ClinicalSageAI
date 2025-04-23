import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  ArrowRight, Clock, DollarSign, ShieldCheck, Brain, 
  FileText, FileCheck, BarChart2, BarChart3, Zap, 
  CheckCircle, X, ArrowUpRight, BookOpen,
  LayoutDashboard, Beaker, Sparkles, Database,
  Target, SearchCheck, Combine, LineChart, CalendarClock,
  Microscope, Phone, Mail, User, UserPlus, Globe, 
  Building2, Users, Calendar, Shield, Check, Plus, Trash2, AlertCircle,
  ChevronRight, Menu, Search, ExternalLink
} from 'lucide-react';

// Platform Differentiators vs. Legacy Systems
const platformDifferences = [
  {
    category: "IND Preparation",
    trialsage: {
      title: "Automated & AI-Assisted",
      description: "Auto-builds IND sections with AI suggestions; ensures no module is overlooked. Teams review high-level content, not stitch pages together."
    },
    legacy: {
      title: "Manual & Labor-Intensive",
      description: "IND dossiers drafted in Word by humans or from templates. High risk of missing pieces, requires external medical writers. Takes months of effort."
    },
    icon: <FileCheck className="h-10 w-10 text-white" />
  },
  {
    category: "CSR Creation & Analysis",
    trialsage: {
      title: "Real-Time & Data-Driven",
      description: "CSR evolves live during trial via interactive dashboard. AI highlights trends and outliers as data arrives. By study end, CSR is essentially done."
    },
    legacy: {
      title: "After-the-Fact & Static",
      description: "CSR compiled after trial as a static document. No insights until trial ends, then teams manually analyze PDFs. Opportunities to adjust are lost."
    },
    icon: <LayoutDashboard className="h-10 w-10 text-white" />
  },
  {
    category: "Analytics & Insights",
    trialsage: {
      title: "Predictive & Transparent",
      description: "Built-in ML models predict outcomes with explainable factors. Drill down into why a prediction was made. Advanced queryable databases for ad-hoc questions."
    },
    legacy: {
      title: "Limited or Opaque",
      description: "Basic reporting at best. Any AI features are separate add-ons with black-box outputs that few trust. Teams rely on manual data science or intuition."
    },
    icon: <Brain className="h-10 w-10 text-white" />
  }
];

// Main component
export default function HomeMarketingPage() {
  // Render the component
  try {
    // Return the main UI
    return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" }}>
      {/* Certara-style top utility banner */}
      <div className="bg-[#004f9f] text-white text-sm">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
          <div className="flex space-x-6">
            <a href="tel:+18007235372" className="hover:text-blue-100 flex items-center">
              <Phone className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">1-800-723-5372</span>
            </a>
            <a href="mailto:info@concept2cure.ai" className="hover:text-blue-100 flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">info@concept2cure.ai</span>
            </a>
          </div>
          <div className="hidden md:flex space-x-4 text-xs items-center">
            <a href="#" className="hover:text-blue-100 px-2 py-0.5">About</a>
            <span className="mx-0.5 text-blue-300">|</span>
            <a href="#" className="hover:text-blue-100 px-2 py-0.5">Investors</a>
            <span className="mx-0.5 text-blue-300">|</span>
            <a href="#" className="hover:text-blue-100 px-2 py-0.5">News</a>
            <span className="mx-0.5 text-blue-300">|</span>
            <a href="#" className="hover:text-blue-100 px-2 py-0.5">Careers</a>
            <span className="mx-0.5 text-blue-300">|</span>
            <button className="bg-white/10 rounded px-2 py-0.5 hover:bg-white/20 transition-colors flex items-center">
              <Globe className="w-3 h-3 mr-1" />
              EN
            </button>
          </div>
        </div>
      </div>
      
      {/* Enterprise-grade navigation */}
      <header className="bg-white sticky top-0 z-50 py-3 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center">
              <div className="bg-[#004f9f] text-white font-bold text-sm p-2 rounded mr-3">
                C2C.AI
              </div>
              <div className="ml-0 flex flex-col">
                <span className="font-semibold tracking-tight text-gray-900 text-xl">CONCEPT2CURE.AI</span>
                <span className="text-xs text-gray-500 -mt-1">TrialSage™ Platform</span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden xl:flex items-center space-x-8">
            <div className="group relative">
              <div className="flex items-center cursor-pointer">
                <span className="text-gray-800 font-medium">Solutions</span>
                <ChevronRight className="w-4 h-4 ml-1 transform rotate-90 text-gray-500 group-hover:text-blue-600 transition-transform group-hover:rotate-[270deg]" />
              </div>
              <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 left-0 top-full w-[550px] bg-white shadow-lg rounded-md border border-gray-100 transition-all duration-200 z-50">
                <div className="grid grid-cols-2 gap-2 p-6">
                  <Link to="/ind-wizard" className="flex p-3 hover:bg-gray-50 rounded-lg group/item">
                    <div className="w-10 h-10 flex items-center justify-center bg-[#004f9f] rounded-lg shrink-0">
                      <FileCheck className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-900 group-hover/item:text-[#004f9f]">IND Wizard™</h4>
                      <p className="text-sm text-gray-500 mt-0.5">Complete IND assembly & submission</p>
                    </div>
                  </Link>
                  <Link to="/enterprise-csr-intelligence" className="flex p-3 hover:bg-gray-50 rounded-lg group/item">
                    <div className="w-10 h-10 flex items-center justify-center bg-[#004f9f] rounded-lg shrink-0">
                      <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-900 group-hover/item:text-[#004f9f]">CSR Intelligence™</h4>
                      <p className="text-sm text-gray-500 mt-0.5">Extract & analyze CSR data</p>
                    </div>
                  </Link>
                  <Link to="/versions" className="flex p-3 hover:bg-gray-50 rounded-lg group/item">
                    <div className="w-10 h-10 flex items-center justify-center bg-[#004f9f] rounded-lg shrink-0">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-900 group-hover/item:text-[#004f9f]">Document Vault™</h4>
                      <p className="text-sm text-gray-500 mt-0.5">21 CFR Part 11 compliant storage</p>
                    </div>
                  </Link>
                  <Link to="/cmc-blueprint-generator" className="flex p-3 hover:bg-gray-50 rounded-lg group/item">
                    <div className="w-10 h-10 flex items-center justify-center bg-[#004f9f] rounded-lg shrink-0">
                      <Microscope className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-900 group-hover/item:text-[#004f9f]">CMC Blueprint™</h4>
                      <p className="text-sm text-gray-500 mt-0.5">Chemistry & manufacturing controls</p>
                    </div>
                  </Link>
                </div>
                <div className="bg-gray-50 p-3 rounded-b-md flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">Need a custom solution?</span>
                  <Link to="/contact" className="text-sm text-[#004f9f] font-medium hover:underline flex items-center">
                    Talk to our team <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
            
            <Link to="/ind-wizard" className="text-gray-800 hover:text-[#004f9f] font-medium transition-colors">
              IND Wizard
            </Link>
            <Link to="/enterprise-csr-intelligence" className="text-gray-800 hover:text-[#004f9f] font-medium transition-colors">
              CSR Intelligence
            </Link>
            <Link to="/versions" className="text-gray-800 hover:text-[#004f9f] font-medium transition-colors">
              Document Vault
            </Link>
            <Link to="/analytics-dashboard" className="text-gray-800 hover:text-[#004f9f] font-medium transition-colors">
              Analytics
            </Link>
            <Link to="/ask-lumen" className="text-violet-700 hover:text-violet-800 bg-violet-50 px-3 py-1 rounded-md font-medium transition-colors flex items-center">
              <Sparkles className="h-4 w-4 mr-1.5 text-violet-600" />
              Ask Lumen
            </Link>
          </nav>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center mr-2">
              <button className="text-gray-500 hover:text-gray-900">
                <Search className="w-5 h-5" />
              </button>
            </div>
            
            <Link to="/auth" className="hidden md:block text-gray-800 hover:text-[#004f9f] font-medium">
              Log in
            </Link>
            
            <Link to="/auth" 
              className="bg-[#004f9f] hover:bg-blue-800 text-white px-5 py-2 rounded-md font-medium transition-colors">
              Get Started
            </Link>
            
            <div className="border-l border-gray-200 h-6 hidden xl:block"></div>
            
            <Link to="/team-signup" 
              className="hidden xl:flex items-center text-gray-800 hover:text-[#004f9f] font-medium">
              <UserPlus className="w-4 h-4 mr-2" />
              For Enterprise
            </Link>
            
            <button className="xl:hidden text-gray-800 ml-2 bg-gray-100 hover:bg-gray-200 p-2 rounded-md transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Ask Lumen prominent feature banner */}
      <div className="bg-gradient-to-r from-violet-700 to-purple-600 text-white border-b border-violet-800">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            <div className="bg-white/20 p-2 rounded-lg mr-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Ask Lumen™ AI Assistant</h3>
              <p className="text-sm text-violet-100">
                Regulatory compliance coach trained on 200k+ submissions and global regulations
              </p>
            </div>
          </div>
          <Link to="/ask-lumen">
            <button className="bg-white text-violet-700 hover:bg-violet-50 font-medium py-2 px-5 rounded-md transition-colors whitespace-nowrap flex items-center">
              Try 10-Minute Free Trial <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* Hero Section - Enterprise Edition */}
      <section className="bg-white overflow-hidden pt-16 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-blue-50 px-3 py-1.5 rounded-full mb-6">
                <div className="mr-2 text-blue-600 font-bold text-xs px-2 py-0.5 bg-blue-100 rounded">NEW</div>
                <p className="text-blue-600 font-medium text-sm">TrialSage™ AI Regulatory Platform</p>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
                Get your science to <span className="text-blue-600">patients faster</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-xl leading-relaxed">
                Transform clinical data into actionable regulatory insights with an AI platform built for global submissions. Reduce IND preparation time by 55% across FDA, EMA, and PMDA.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/ind-wizard">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium text-base transition-colors w-full sm:w-auto flex items-center justify-center">
                    Start IND Wizard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </Link>
                <Link to="/enterprise-csr-intelligence">
                  <button className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-6 py-3 rounded-md font-medium text-base transition-colors w-full sm:w-auto flex items-center justify-center">
                    Explore CSR Intelligence
                  </button>
                </Link>
              </div>
              
              <div className="mt-10">
                <p className="text-sm text-gray-500 mb-3">Trusted by leading pharmaceutical companies</p>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="text-gray-400 font-medium">PHARMA CORP</div>
                  <div className="text-gray-400 font-medium">MEDISCI</div>
                  <div className="text-gray-400 font-medium">BIOTECH LABS</div>
                  <div className="text-gray-400 font-medium">GENOMED</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-8 relative z-10">
                <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">TrialSage™ Platform Impact</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-4xl font-bold text-blue-600">55%</p>
                    <p className="text-sm text-gray-600">Faster IND preparation</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-blue-600">61%</p>
                    <p className="text-sm text-gray-600">Fewer protocol amendments</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-blue-600">83%</p>
                    <p className="text-sm text-gray-600">Faster regulatory response</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-blue-600">68%</p>
                    <p className="text-sm text-gray-600">Lower eCTD publishing costs</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-700">FDA, EMA, PMDA submission-ready</span>
                  </div>
                  <div className="flex items-center text-sm mt-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-700">21 CFR Part 11 compliant</span>
                  </div>
                  <div className="flex items-center text-sm mt-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-700">Multi-modal AI with GPT-4o</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200/30 rounded-full blur-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Enterprise-Grade Solutions Showcase */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center justify-center px-3 py-1 bg-blue-50 rounded-full mb-4">
              <span className="text-blue-600 text-sm font-medium">Enterprise-Grade Platform</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Integrated AI-Powered Regulatory Solutions
            </h2>
            <p className="text-lg text-gray-600">
              Our seamlessly connected modules share a unified knowledge base, delivering exceptional performance while ensuring regulatory compliance across global markets.
            </p>
          </div>
          
          {/* Special Featured Ask Lumen Card - Full Width */}
          <div className="mb-12 relative overflow-hidden rounded-xl border border-violet-100 bg-gradient-to-r from-violet-500 to-purple-600">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMjAgMCBMIDAgMCAwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImEiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIHN0b3AtY29sb3I9IiNmZmYiIHN0b3Atb3BhY2l0eT0iLjA1Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9IjAiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSIzMDAiIGN5PSIzMDAiIHI9IjMwMCIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')]"></div>
            
            <div className="relative p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-start gap-12">
                {/* Content */}
                <div className="flex-1">
                  <div className="inline-flex items-center mb-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <div className="bg-white text-violet-600 text-xs font-bold px-2 py-0.5 rounded mr-2">NEW</div>
                    <span className="text-white text-sm font-medium">10-Minute Free Trial</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                    Ask Lumen™ AI Assistant
                  </h2>
                  
                  <p className="text-violet-100 text-lg mb-6 max-w-xl">
                    Your intelligent regulatory compliance coach trained on 200,000+ global submissions, FDA guidance, EMA regulations, and PMDA standards.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-white text-sm ml-3">Get real-time regulatory guidance</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-white text-sm ml-3">Industry best practices and standards</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-white text-sm ml-3">Multi-modal analysis of any document</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-white text-sm ml-3">GPT-4o powered recommendations</span>
                    </div>
                  </div>
                  
                  <Link to="/ask-lumen">
                    <button className="bg-white text-violet-700 hover:bg-violet-50 px-6 py-3 rounded-lg font-medium text-base transition-colors flex items-center">
                      Try Ask Lumen Free
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </Link>
                </div>
                
                {/* Visual */}
                <div className="hidden md:flex items-center justify-center md:w-1/3">
                  <div className="w-40 h-40 bg-white/20 backdrop-blur-sm p-8 rounded-3xl">
                    <Sparkles className="w-full h-full text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* IND Wizard */}
            <div className="group relative bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
              <div className="h-44 bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMjAgMCBMIDAgMCAwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>
                <div className="w-20 h-20 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl flex items-center justify-center relative z-10">
                  <FileCheck className="h-10 w-10 text-white" />
                </div>
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm py-1 px-2 rounded text-xs font-semibold text-blue-700">
                  Most Popular
                </div>
              </div>
              
              <div className="flex-1 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  IND Wizard™
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Automates IND submissions with AI-generated regulatory documents, reducing time to submission by 55% across global regulatory agencies.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 ml-3">Auto-generate Modules 1-5</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 ml-3">FDA, EMA, PMDA submission-ready</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 ml-3">3x faster than competitive solutions</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 pt-0 mt-auto">
                <Link to="/ind-wizard" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center transition-colors">
                  Launch IND Wizard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
            
            {/* CSR Intelligence */}
            <div className="group relative bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
              <div className="h-44 bg-gradient-to-r from-indigo-600 to-indigo-500 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMjAgMCBMIDAgMCAwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>
                <div className="w-20 h-20 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl flex items-center justify-center relative z-10">
                  <LayoutDashboard className="h-10 w-10 text-white" />
                </div>
              </div>
              
              <div className="flex-1 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  CSR Intelligence™
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Transforms static CSRs into interactive dashboards with structured data extraction and advanced analytics capabilities.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 ml-3">Extract structured data from any CSR</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 ml-3">Compare across trials by any parameter</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 ml-3">Natural language search across trials</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 pt-0 mt-auto">
                <Link to="/enterprise-csr-intelligence" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center transition-colors">
                  Explore CSR Intelligence
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
            
            {/* Document Vault */}
            <div className="group relative bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
              <div className="h-44 bg-gradient-to-r from-teal-600 to-teal-500 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMjAgMCBMIDAgMCAwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>
                <div className="w-20 h-20 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl flex items-center justify-center relative z-10">
                  <Database className="h-10 w-10 text-white" />
                </div>
              </div>
              
              <div className="flex-1 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">
                  Document Vault™
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Secure, 21 CFR Part 11 compliant document storage with intelligent version control and regulatory submission output.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 ml-3">21 CFR Part 11 compliant</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 ml-3">DocuShare integration</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 ml-3">Intelligent version tracking</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 pt-0 mt-auto">
                <Link to="/versions" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center transition-colors">
                  Access Document Vault
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Additional Modules Section - Enterprise Grade */}
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/cmc-blueprint-generator" className="group flex items-center p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-200 hover:shadow transition-all">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <Microscope className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">CMC Blueprint™</h4>
                <p className="text-sm text-gray-500">Chemistry & manufacturing controls</p>
              </div>
            </Link>
            
            <Link to="/analytics-dashboard" className="group flex items-center p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-200 hover:shadow transition-all">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Analytics Dashboard</h4>
                <p className="text-sm text-gray-500">25 interactive data visualizations</p>
              </div>
            </Link>
            
            <Link to="/ask-lumen" className="group flex items-center p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-200 hover:shadow transition-all">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Ask Lumen™</h4>
                <p className="text-sm text-gray-500">AI regulatory assistant</p>
              </div>
            </Link>
            
            <div className="group flex items-center p-5 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <ArrowUpRight className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <Link to="/team-signup" className="font-semibold text-blue-600 hover:underline">View All Solutions</Link>
                <p className="text-sm text-gray-500">Explore our complete platform</p>
              </div>
            </div>
          </div>
          
          {/* Feature Highlights */}
          <div className="mt-20 border-t border-gray-100 pt-16">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Leading Life Sciences Companies Choose TrialSage™</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">Our enterprise platform delivers measurable results across the entire regulatory lifecycle.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-y-10 gap-x-8">
              <div>
                <div className="bg-blue-50 p-3 rounded-lg w-fit mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">55% Faster Time to Submission</h3>
                <p className="text-gray-600">Complete IND preparation in 5-7 months instead of 14+ months with traditional methods, accelerating time to patient impact.</p>
              </div>
              
              <div>
                <div className="bg-blue-50 p-3 rounded-lg w-fit mb-4">
                  <FileCheck className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">61% Fewer Protocol Amendments</h3>
                <p className="text-gray-600">AI-guided protocol design reduces amendments from 2.3 to 0.9 per study, preventing costly delays and rework.</p>
              </div>
              
              <div>
                <div className="bg-blue-50 p-3 rounded-lg w-fit mb-4">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">100% 21 CFR Part 11 Compliant</h3>
                <p className="text-gray-600">Enterprise-grade platform built from the ground up to meet regulatory standards with complete audit trails and electronic signatures.</p>
              </div>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl overflow-hidden">
            <div className="relative p-12">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>
              <div className="relative z-10 max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-white mb-6">Ready to accelerate your regulatory submissions?</h2>
                <p className="text-xl text-blue-100 mb-8">Join the leading biopharma companies already using TrialSage™ to transform their regulatory processes.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/team-signup">
                    <button className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-lg text-base font-medium transition-colors">
                      Schedule a Demo
                    </button>
                  </Link>
                  <Link to="/auth">
                    <button className="bg-blue-500 bg-opacity-20 text-white hover:bg-opacity-30 px-8 py-3 rounded-lg text-base font-medium transition-colors">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h5 className="font-semibold text-gray-900 mb-4">
                Solutions
              </h5>
              <ul className="space-y-2 text-sm">
                <li><Link to="/ind-wizard" className="text-gray-500 hover:text-blue-600">IND Wizard™</Link></li>
                <li><Link to="/enterprise-csr-intelligence" className="text-gray-500 hover:text-blue-600">CSR Intelligence™</Link></li>
                <li><Link to="/versions" className="text-gray-500 hover:text-blue-600">Document Vault™</Link></li>
                <li><Link to="/cmc-blueprint-generator" className="text-gray-500 hover:text-blue-600">CMC Blueprint™</Link></li>
                <li><Link to="/ask-lumen" className="text-gray-500 hover:text-blue-600">Ask Lumen™</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 mb-4">
                Resources
              </h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-500 hover:text-blue-600">Documentation</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600">Webinars</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600">Regulatory Resources</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600">ROI Calculator</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600">API Access</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 mb-4">
                Company
              </h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-500 hover:text-blue-600">About Us</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600">Leadership</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600">Careers</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600">Contact</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600">Press</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 mb-4">
                Contact Us
              </h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <a href="mailto:info@concept2cure.ai" className="text-gray-500 hover:text-blue-600">info@concept2cure.ai</a>
                </li>
                <li className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <a href="tel:+18001234567" className="text-gray-500 hover:text-blue-600">+1 (800) 123-4567</a>
                </li>
                <li className="flex items-center">
                  <Globe className="w-4 h-4 text-gray-400 mr-2" />
                  <a href="https://www.concept2cure.ai" className="text-gray-500 hover:text-blue-600">www.concept2cure.ai</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 flex flex-wrap justify-between items-center">
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Concept2Cure.AI. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-500 hover:text-blue-600">Terms</a>
              <a href="#" className="text-gray-500 hover:text-blue-600">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-blue-600">Security</a>
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
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <div className="mb-6 flex justify-center">
            <div className="bg-blue-600 rounded-lg p-2">
              <div className="text-white font-bold text-sm">C2C.AI</div>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-4 text-center">We're updating our platform</h1>
          <p className="text-gray-600 mb-6 text-center">
            Our team is currently refreshing the TrialSage experience. Please check back shortly.
          </p>
          <div className="flex justify-center">
            <Link to="/solutions" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-base font-medium transition-all">
              Browse Solutions
            </Link>
          </div>
        </div>
      </div>
    );
  }
}