import React from 'react';
import { Link } from 'wouter';
import { 
  ArrowRight, FileCheck, Database, LayoutDashboard, 
  Sparkles, CheckCircle, Phone, Mail, 
  Globe, UserPlus, Search, Menu, Microscope,
  ShieldCheck, Clock, ChevronRight, BarChart3
} from 'lucide-react';

export default function HomeMarketingPage() {
  try {
    return (
      <div className="min-h-screen bg-white" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
        {/* Top utility navbar (Certara style) */}
        <div className="bg-[#f5f5f7]">
          <div className="max-w-6xl mx-auto px-4 py-1 flex justify-end items-center">
            <div className="flex space-x-5 text-[10px] text-[#333333]">
              <a href="#" className="hover:text-[#06c]">Support</a>
              <span>|</span>
              <a href="#" className="hover:text-[#06c]">For Investors</a>
              <span>|</span>
              <a href="#" className="hover:text-[#06c]">News</a>
              <span>|</span>
              <a href="#" className="hover:text-[#06c]">Contact</a>
            </div>
          </div>
        </div>

        {/* Main navigation */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/">
              <div className="flex items-center">
                <div>
                  <h1 className="font-semibold text-[#333] text-lg leading-none">CONCEPT2CURE.AI</h1>
                  <p className="text-[10px] text-gray-500 -mt-0.5">TrialSage™ Platform</p>
                </div>
              </div>
            </Link>

            {/* Main Nav */}
            <nav className="hidden lg:flex items-center space-x-8">
              <div className="relative group">
                <button className="flex items-center text-[#333] font-medium text-sm">
                  Solutions
                  <ChevronRight className="w-4 h-4 ml-1 transform rotate-90 text-gray-400 group-hover:text-[#004f9f]" />
                </button>
                <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 left-0 top-full w-[520px] bg-white shadow-lg rounded-md border border-gray-100 transition-all duration-200 z-50">
                  <div className="grid grid-cols-2 gap-3 p-5">
                    <Link to="/ind-wizard" className="flex p-3 hover:bg-gray-50 rounded">
                      <div className="w-9 h-9 bg-[#004f9f] rounded flex items-center justify-center flex-shrink-0">
                        <FileCheck className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-[#333] text-sm">IND Wizard™</h4>
                        <p className="text-xs text-gray-500">Complete IND assembly & submission</p>
                      </div>
                    </Link>
                    <Link to="/enterprise-csr-intelligence" className="flex p-3 hover:bg-gray-50 rounded">
                      <div className="w-9 h-9 bg-[#004f9f] rounded flex items-center justify-center flex-shrink-0">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-[#333] text-sm">CSR Intelligence™</h4>
                        <p className="text-xs text-gray-500">Extract & analyze CSR data</p>
                      </div>
                    </Link>
                    <Link to="/versions" className="flex p-3 hover:bg-gray-50 rounded">
                      <div className="w-9 h-9 bg-[#004f9f] rounded flex items-center justify-center flex-shrink-0">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-[#333] text-sm">Document Vault™</h4>
                        <p className="text-xs text-gray-500">21 CFR Part 11 compliant storage</p>
                      </div>
                    </Link>
                    <Link to="/cmc-blueprint-generator" className="flex p-3 hover:bg-gray-50 rounded">
                      <div className="w-9 h-9 bg-[#004f9f] rounded flex items-center justify-center flex-shrink-0">
                        <Microscope className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-[#333] text-sm">CMC Blueprint™</h4>
                        <p className="text-xs text-gray-500">Chemistry & manufacturing controls</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              
              <Link to="/ind-wizard" className="text-[#333] text-sm font-medium hover:text-[#004f9f]">
                IND Wizard
              </Link>
              <Link to="/enterprise-csr-intelligence" className="text-[#333] text-sm font-medium hover:text-[#004f9f]">
                CSR Intelligence
              </Link>
              <Link to="/versions" className="text-[#333] text-sm font-medium hover:text-[#004f9f]">
                Document Vault
              </Link>
              <Link to="/analytics-dashboard" className="text-[#333] text-sm font-medium hover:text-[#004f9f]">
                Analytics
              </Link>
              <Link to="/ask-lumen" className="bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium px-3 py-1.5 rounded flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Ask Lumen™
              </Link>
            </nav>

            {/* Right utilities */}
            <div className="flex items-center space-x-3">
              <button className="text-gray-400 hover:text-gray-700">
                <Search className="w-4 h-4" />
              </button>
              
              <Link to="/auth" className="hidden md:block text-[#333] text-sm font-medium hover:text-[#004f9f] mr-1">
                Log in
              </Link>
              
              <Link to="/auth" className="bg-[#004f9f] hover:bg-[#003d7a] text-white text-sm font-medium px-4 py-1.5 rounded">
                Get Started
              </Link>
              
              <Link to="/team-signup" className="hidden md:flex text-[#333] text-sm font-medium hover:text-[#004f9f] items-center ml-2">
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                Enterprise
              </Link>
              
              <button className="lg:hidden text-gray-700 bg-gray-100 p-1.5 rounded">
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Hero section with clean, professional layout */}
        <section className="bg-gradient-to-br from-[#f8f9fd] to-[#f0f5fe] border-b border-gray-200 pt-10 md:pt-16 pb-12 md:pb-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-blue-50 px-3 py-1 rounded-full mb-6">
                  <span className="text-[#004f9f] text-sm font-medium">Regulatory Excellence</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#111827] leading-tight mb-5">
                  Your regulatory submissions, <span className="text-[#004f9f]">accelerated</span>
                </h1>
                
                <p className="text-lg text-gray-600 mb-8 max-w-xl">
                  The complete regulatory writing platform with AI-powered automation for FDA, EMA, and PMDA submissions. Reduce IND preparation time by 55%.
                </p>
                
                <div className="flex space-x-4">
                  <Link to="/ind-wizard">
                    <button className="bg-[#06c] hover:bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-medium flex items-center">
                      Launch IND Wizard
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </Link>
                  <Link to="/ask-lumen">
                    <button className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-full text-sm font-medium flex items-center">
                      Try Ask Lumen™ Free
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </Link>
                </div>
                
                <div className="mt-10 flex items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs text-gray-700 font-bold">
                        {i}
                      </div>
                    ))}
                  </div>
                  <p className="ml-3 text-sm text-gray-500">
                    <span className="font-medium">200+</span> regulatory professionals use TrialSage™ daily
                  </p>
                </div>
              </div>
              
              <div className="relative hidden md:block">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-violet-200/20 rounded-full blur-xl"></div>
                
                <div className="relative bg-white rounded-xl shadow-lg border border-gray-100 p-6 z-10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-[#333]">Ask Lumen™ AI Assistant</h3>
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <Sparkles className="w-5 h-5 text-violet-600" />
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-5">
                    Your digital regulatory compliance coach with deep knowledge of 200k+ submissions, FDA guidelines, and global regulations.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-2.5 w-2.5 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700 ml-2">Real-time regulatory guidance</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-2.5 w-2.5 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700 ml-2">Multi-modal document analysis</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-2.5 w-2.5 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700 ml-2">Powered by OpenAI GPT-4o</span>
                    </div>
                  </div>
                  
                  <Link to="/ask-lumen">
                    <button className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 px-4 rounded text-sm font-medium flex items-center justify-center">
                      Try 10-Minute Free Trial
                      <ArrowRight className="ml-2 w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Enterprise-Grade Solutions Showcase */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="inline-block px-3 py-1 bg-blue-50 rounded-full mb-4">
                <span className="text-[#004f9f] text-sm font-medium">Enterprise-Grade Platform</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#111827] mb-4">
                Integrated Regulatory Solutions
              </h2>
              <p className="text-gray-600">
                Our seamlessly connected modules share a unified knowledge base, ensuring compliance across global markets.
              </p>
            </div>
            
            {/* Key modules */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* IND Wizard */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                <div className="h-36 bg-gradient-to-r from-[#004f9f] to-[#0067ce] relative">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.15) 2px, transparent 0)',
                    backgroundSize: '50px 50px'
                  }}></div>
                  <div className="relative h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <FileCheck className="h-9 w-9 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#111827] mb-2">
                    IND Wizard™
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    AI-powered IND preparation with auto-generated modules, reducing submission time by 55%.
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Auto-generate Modules 1-5</span>
                    </li>
                    <li className="flex text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">FDA, EMA, PMDA submission-ready</span>
                    </li>
                  </ul>
                  
                  <Link to="/ind-wizard">
                    <button className="w-full text-[#004f9f] border border-[#004f9f] hover:bg-blue-50 py-2 px-4 rounded text-sm font-medium flex items-center justify-center">
                      Launch IND Wizard
                      <ArrowRight className="ml-2 w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* CSR Intelligence */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                <div className="h-36 bg-gradient-to-r from-indigo-600 to-indigo-500 relative">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.15) 2px, transparent 0)',
                    backgroundSize: '50px 50px'
                  }}></div>
                  <div className="relative h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <LayoutDashboard className="h-9 w-9 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#111827] mb-2">
                    CSR Intelligence™
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Transform static CSRs into interactive dashboards with structured data extraction.
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Extract structured data from any CSR</span>
                    </li>
                    <li className="flex text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Natural language search across trials</span>
                    </li>
                  </ul>
                  
                  <Link to="/enterprise-csr-intelligence">
                    <button className="w-full text-indigo-600 border border-indigo-600 hover:bg-indigo-50 py-2 px-4 rounded text-sm font-medium flex items-center justify-center">
                      Explore CSR Intelligence
                      <ArrowRight className="ml-2 w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* Document Vault */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                <div className="h-36 bg-gradient-to-r from-teal-600 to-teal-500 relative">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.15) 2px, transparent 0)',
                    backgroundSize: '50px 50px'
                  }}></div>
                  <div className="relative h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Database className="h-9 w-9 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#111827] mb-2">
                    Document Vault™
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Secure, 21 CFR Part 11 compliant document storage with intelligent version control.
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">21 CFR Part 11 compliant</span>
                    </li>
                    <li className="flex text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">DocuShare integration</span>
                    </li>
                  </ul>
                  
                  <Link to="/versions">
                    <button className="w-full text-teal-600 border border-teal-600 hover:bg-teal-50 py-2 px-4 rounded text-sm font-medium flex items-center justify-center">
                      Access Document Vault
                      <ArrowRight className="ml-2 w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Additional modules grid */}
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <Link to="/analytics-dashboard" className="group flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-200 hover:shadow transition-all">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <BarChart3 className="h-5 w-5 text-[#004f9f]" />
                </div>
                <div>
                  <h4 className="font-medium text-[#111827] group-hover:text-[#004f9f] text-sm transition-colors">Analytics Dashboard</h4>
                  <p className="text-xs text-gray-500">25 interactive visualizations</p>
                </div>
              </Link>
              
              <Link to="/cmc-blueprint-generator" className="group flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-200 hover:shadow transition-all">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <Microscope className="h-5 w-5 text-[#004f9f]" />
                </div>
                <div>
                  <h4 className="font-medium text-[#111827] group-hover:text-[#004f9f] text-sm transition-colors">CMC Blueprint™</h4>
                  <p className="text-xs text-gray-500">Chemistry & manufacturing controls</p>
                </div>
              </Link>
              
              <div className="group flex items-center p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <ArrowRight className="h-5 w-5 text-[#004f9f]" />
                </div>
                <div>
                  <Link to="/team-signup" className="font-medium text-[#004f9f] hover:underline text-sm">View All Solutions</Link>
                  <p className="text-xs text-gray-500">Explore our complete platform</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Business outcomes section */}
        <section className="py-16 bg-gray-50 border-y border-gray-200">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-[#111827] mb-4">
                Proven Business Outcomes
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our enterprise platform delivers measurable results across the entire regulatory lifecycle.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="bg-blue-50 p-2 rounded-lg w-fit mb-4">
                  <Clock className="h-5 w-5 text-[#004f9f]" />
                </div>
                <h3 className="text-lg font-semibold text-[#111827] mb-2">55% Faster Time to Submission</h3>
                <p className="text-sm text-gray-600">Complete IND preparation in 5-7 months instead of 14+ months with traditional methods.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="bg-blue-50 p-2 rounded-lg w-fit mb-4">
                  <FileCheck className="h-5 w-5 text-[#004f9f]" />
                </div>
                <h3 className="text-lg font-semibold text-[#111827] mb-2">61% Fewer Protocol Amendments</h3>
                <p className="text-sm text-gray-600">AI-guided protocol design reduces amendments from 2.3 to 0.9 per study, preventing costly delays.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="bg-blue-50 p-2 rounded-lg w-fit mb-4">
                  <ShieldCheck className="h-5 w-5 text-[#004f9f]" />
                </div>
                <h3 className="text-lg font-semibold text-[#111827] mb-2">100% 21 CFR Part 11 Compliant</h3>
                <p className="text-sm text-gray-600">Enterprise-grade platform built from the ground up to meet regulatory standards with audit trails.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-gradient-to-r from-[#004f9f] to-[#0067ce] rounded-xl overflow-hidden">
              <div className="p-8 md:p-12 relative">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.1) 2px, transparent 0)',
                  backgroundSize: '50px 50px'
                }}></div>
                <div className="relative z-10 max-w-2xl mx-auto text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to accelerate your regulatory submissions?</h2>
                  <p className="text-blue-100 mb-8">Join the leading biopharma companies already using TrialSage™ to transform their regulatory processes.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/team-signup">
                      <button className="bg-white text-[#004f9f] hover:bg-blue-50 px-6 py-2.5 rounded text-sm font-medium">
                        Schedule a Demo
                      </button>
                    </Link>
                    <Link to="/auth">
                      <button className="bg-blue-700 text-white hover:bg-blue-800 px-6 py-2.5 rounded text-sm font-medium">
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
        <footer className="bg-gray-50 border-t border-gray-200 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div>
                <h5 className="font-medium text-sm text-[#111827] mb-4">
                  Solutions
                </h5>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/ind-wizard" className="text-gray-500 hover:text-[#004f9f]">IND Wizard™</Link></li>
                  <li><Link to="/enterprise-csr-intelligence" className="text-gray-500 hover:text-[#004f9f]">CSR Intelligence™</Link></li>
                  <li><Link to="/versions" className="text-gray-500 hover:text-[#004f9f]">Document Vault™</Link></li>
                  <li><Link to="/cmc-blueprint-generator" className="text-gray-500 hover:text-[#004f9f]">CMC Blueprint™</Link></li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-sm text-[#111827] mb-4">
                  Resources
                </h5>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-500 hover:text-[#004f9f]">Documentation</a></li>
                  <li><a href="#" className="text-gray-500 hover:text-[#004f9f]">Regulatory Resources</a></li>
                  <li><a href="#" className="text-gray-500 hover:text-[#004f9f]">ROI Calculator</a></li>
                  <li><a href="#" className="text-gray-500 hover:text-[#004f9f]">API Access</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-sm text-[#111827] mb-4">
                  Company
                </h5>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-500 hover:text-[#004f9f]">About Us</a></li>
                  <li><a href="#" className="text-gray-500 hover:text-[#004f9f]">Leadership</a></li>
                  <li><a href="#" className="text-gray-500 hover:text-[#004f9f]">Careers</a></li>
                  <li><a href="#" className="text-gray-500 hover:text-[#004f9f]">Contact</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-sm text-[#111827] mb-4">
                  Contact Us
                </h5>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Mail className="w-3.5 h-3.5 text-gray-400 mr-2" />
                    <a href="mailto:info@concept2cure.ai" className="text-gray-500 hover:text-[#004f9f]">info@concept2cure.ai</a>
                  </li>
                  <li className="flex items-center">
                    <Phone className="w-3.5 h-3.5 text-gray-400 mr-2" />
                    <a href="tel:+18007235372" className="text-gray-500 hover:text-[#004f9f]">1-800-723-5372</a>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200 flex flex-wrap justify-between items-center">
              <div className="text-gray-500 text-xs">
                © {new Date().getFullYear()} Concept2Cure.AI. All rights reserved.
              </div>
              <div className="flex space-x-6 text-xs">
                <a href="#" className="text-gray-500 hover:text-[#004f9f]">Terms</a>
                <a href="#" className="text-gray-500 hover:text-[#004f9f]">Privacy</a>
                <a href="#" className="text-gray-500 hover:text-[#004f9f]">Security</a>
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
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <div className="mb-6 flex justify-center">
            <div className="bg-[#004f9f] rounded p-2">
              <div className="text-white font-bold text-sm">C2C.AI</div>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-4 text-center">We're updating our platform</h1>
          <p className="text-gray-600 mb-6 text-center">
            Our team is currently refreshing the TrialSage experience. Please check back shortly.
          </p>
          <div className="flex justify-center">
            <Link to="/solutions" className="bg-[#004f9f] hover:bg-blue-800 text-white px-5 py-2.5 rounded text-sm font-medium">
              Browse Solutions
            </Link>
          </div>
        </div>
      </div>
    );
  }
}