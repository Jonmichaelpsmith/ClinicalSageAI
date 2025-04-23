import React from 'react';
import { Link } from 'wouter';
import { 
  ArrowRight, 
  ChevronRight, 
  Database, 
  LayoutDashboard, 
  FileCheck, 
  Microscope, 
  BarChart3,
  Clock,
  Search,
  ExternalLink,
  ChevronDown,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export default function HomeMarketingPage() {
  try {
    return (
      <div className="font-sans antialiased text-[#1d1d1f]">
        {/* Main Header - inspired by Certara's enterprise design */}
        <header className="relative">
          {/* Top bar with enterprise utilities */}
          <div className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
            <div className="container mx-auto px-6 py-2 flex justify-end">
              <div className="flex items-center space-x-8">
                <a href="#" className="text-[11px] text-[#555] hover:text-[#06c] transition">Support</a>
                <a href="#" className="text-[11px] text-[#555] hover:text-[#06c] transition">Resources</a>
                <a href="#" className="text-[11px] text-[#555] hover:text-[#06c] transition">Contact</a>
                <a href="#" className="text-[11px] flex items-center text-[#555] hover:text-[#06c] transition">
                  EN <ChevronDown className="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Main navigation - sophisticated design */}
          <div className="bg-white border-b border-[#e5e5e5]">
            <div className="container mx-auto px-6">
              <div className="flex items-center justify-between h-16">
                {/* Logo & Brand */}
                <div className="flex items-center">
                  <Link to="/">
                    <div className="flex flex-col">
                      <span className="text-[16px] tracking-tight font-semibold text-[#06c]">CONCEPT2CURE.AI</span>
                      <span className="text-[11px] text-[#666] -mt-1">TrialSage™ Platform</span>
                    </div>
                  </Link>
                </div>

                {/* Main Navigation */}
                <nav className="hidden lg:flex">
                  <ul className="flex items-center space-x-8">
                    <li className="group relative">
                      <a className="inline-flex items-center px-1 pt-1 text-[13px] font-medium text-[#333] hover:text-[#06c] transition">
                        <span>Solutions</span>
                        <ChevronDown className="ml-1 h-3 w-3 transition group-hover:rotate-180" />
                      </a>
                      
                      {/* Mega dropdown with custom styling */}
                      <div className="absolute left-0 mt-2 w-[540px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 bg-white shadow-lg rounded-md border border-[#e5e5e5] overflow-hidden z-50">
                        <div className="p-6">
                          <div className="text-[13px] font-medium text-[#666] mb-4">Enterprise Solutions</div>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                            <Link to="/ind-wizard" className="flex items-start group/item">
                              <div className="mr-4 w-10 h-10 rounded-full bg-[#eff5ff] flex items-center justify-center flex-shrink-0">
                                <FileCheck className="h-5 w-5 text-[#06c]" />
                              </div>
                              <div>
                                <h4 className="text-[14px] font-semibold text-[#333] group-hover/item:text-[#06c] transition">IND Wizard™</h4>
                                <p className="text-[12px] text-[#666] mt-1">Complete IND assembly & submission</p>
                              </div>
                            </Link>
                            
                            <Link to="/enterprise-csr-intelligence" className="flex items-start group/item">
                              <div className="mr-4 w-10 h-10 rounded-full bg-[#eff5ff] flex items-center justify-center flex-shrink-0">
                                <LayoutDashboard className="h-5 w-5 text-[#06c]" />
                              </div>
                              <div>
                                <h4 className="text-[14px] font-semibold text-[#333] group-hover/item:text-[#06c] transition">CSR Intelligence™</h4>
                                <p className="text-[12px] text-[#666] mt-1">Extract & analyze CSR data</p>
                              </div>
                            </Link>
                            
                            <Link to="/versions" className="flex items-start group/item">
                              <div className="mr-4 w-10 h-10 rounded-full bg-[#eff5ff] flex items-center justify-center flex-shrink-0">
                                <Database className="h-5 w-5 text-[#06c]" />
                              </div>
                              <div>
                                <h4 className="text-[14px] font-semibold text-[#333] group-hover/item:text-[#06c] transition">Document Vault™</h4>
                                <p className="text-[12px] text-[#666] mt-1">21 CFR Part 11 compliant storage</p>
                              </div>
                            </Link>
                            
                            <Link to="/analytics-dashboard" className="flex items-start group/item">
                              <div className="mr-4 w-10 h-10 rounded-full bg-[#eff5ff] flex items-center justify-center flex-shrink-0">
                                <BarChart3 className="h-5 w-5 text-[#06c]" />
                              </div>
                              <div>
                                <h4 className="text-[14px] font-semibold text-[#333] group-hover/item:text-[#06c] transition">Analytics</h4>
                                <p className="text-[12px] text-[#666] mt-1">25 custom insight dashboards</p>
                              </div>
                            </Link>
                            
                            <Link to="/cmc-blueprint-generator" className="flex items-start group/item">
                              <div className="mr-4 w-10 h-10 rounded-full bg-[#eff5ff] flex items-center justify-center flex-shrink-0">
                                <Microscope className="h-5 w-5 text-[#06c]" />
                              </div>
                              <div>
                                <h4 className="text-[14px] font-semibold text-[#333] group-hover/item:text-[#06c] transition">CMC Blueprint™</h4>
                                <p className="text-[12px] text-[#666] mt-1">Chemistry & manufacturing controls</p>
                              </div>
                            </Link>
                            
                            <Link to="/ask-lumen" className="flex items-start group/item">
                              <div className="mr-4 w-10 h-10 rounded-full bg-[#f4efff] flex items-center justify-center flex-shrink-0">
                                <Sparkles className="h-5 w-5 text-violet-600" />
                              </div>
                              <div>
                                <h4 className="text-[14px] font-semibold text-[#333] group-hover/item:text-violet-600 transition">Ask Lumen™</h4>
                                <p className="text-[12px] text-[#666] mt-1">AI regulatory guidance assistant</p>
                              </div>
                            </Link>
                          </div>
                          
                          <div className="mt-6 pt-4 border-t border-[#e5e5e5]">
                            <Link to="/team-signup" className="inline-flex items-center text-[13px] font-medium text-[#06c] hover:underline">
                              View all enterprise solutions
                              <ArrowRight className="ml-1 h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <Link to="/ind-wizard" className="inline-flex items-center px-1 pt-1 text-[13px] font-medium text-[#333] hover:text-[#06c] transition">
                        IND Wizard
                      </Link>
                    </li>
                    
                    <li>
                      <Link to="/enterprise-csr-intelligence" className="inline-flex items-center px-1 pt-1 text-[13px] font-medium text-[#333] hover:text-[#06c] transition">
                        CSR Intelligence
                      </Link>
                    </li>
                    
                    <li>
                      <Link to="/versions" className="inline-flex items-center px-1 pt-1 text-[13px] font-medium text-[#333] hover:text-[#06c] transition">
                        Document Vault
                      </Link>
                    </li>
                    
                    <li>
                      <Link to="/analytics-dashboard" className="inline-flex items-center px-1 pt-1 text-[13px] font-medium text-[#333] hover:text-[#06c] transition">
                        Analytics
                      </Link>
                    </li>
                    
                    <li>
                      <Link to="/ask-lumen" className="inline-flex items-center px-1 pt-1 text-[13px] font-medium border-b-2 border-violet-600 text-violet-600 transition">
                        Ask Lumen™
                      </Link>
                    </li>
                  </ul>
                </nav>

                {/* Right utilities */}
                <div className="flex items-center space-x-6">
                  <button className="text-[#555] hover:text-[#06c] transition">
                    <Search className="h-4 w-4" />
                  </button>
                  
                  <Link to="/auth" className="text-[13px] font-medium text-[#333] hover:text-[#06c] transition">
                    Sign In
                  </Link>
                  
                  <Link to="/auth">
                    <button className="bg-[#06c] hover:bg-[#004f9f] text-white py-2 px-4 rounded-md text-[13px] font-medium transition">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section - Sophisticated Enterprise Design */}
        <section className="bg-gradient-to-b from-white to-[#f9fafb]">
          <div className="container mx-auto px-6 py-16 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-7">
                <h1 className="text-4xl md:text-5xl font-light text-[#1d1d1f] leading-tight mb-6">
                  Regulatory submissions, <span className="font-medium">reimagined</span>
                </h1>
                
                <p className="text-xl text-[#444] mb-8 max-w-2xl font-light leading-relaxed">
                  The complete AI-powered platform for regulatory writing and submissions across FDA, EMA, and PMDA markets.
                </p>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
                  <Link to="/ind-wizard">
                    <button className="bg-[#06c] hover:bg-[#004f9f] text-white px-8 py-3 rounded-md text-sm font-medium transition shadow-sm hover:shadow flex items-center">
                      Launch IND Wizard™
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </Link>
                  
                  <Link to="/ask-lumen">
                    <button className="bg-white hover:bg-[#f9fafb] text-[#06c] border border-[#06c] px-8 py-3 rounded-md text-sm font-medium transition shadow-sm hover:shadow flex items-center">
                      Try Ask Lumen™
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </Link>
                </div>
                
                <div className="flex items-center">
                  <div className="px-4 py-3 bg-[#f9fafb] border border-[#e5e5e5] rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-[#06c] mr-2.5" />
                      <div>
                        <div className="text-sm font-semibold text-[#1d1d1f]">55% Faster Submissions</div>
                        <div className="text-xs text-[#666]">Verified by independent researchers</div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 text-sm text-[#666]">
                    <span className="font-medium text-[#1d1d1f]">200+</span> regulatory professionals use TrialSage™ daily
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-5">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-[#e5e5e5]">
                  <div className="bg-gradient-to-r from-violet-700 to-violet-900 px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-5 w-5 text-violet-200" />
                        <h3 className="text-lg font-semibold text-white">Ask Lumen™</h3>
                      </div>
                      <div className="text-xs text-violet-200 bg-white/10 rounded-full px-2 py-0.5">10-Min Free Trial</div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-[#444] text-sm mb-5">
                      Your digital regulatory compliance coach with deep knowledge of FDA guidelines, CMC requirements, and global regulations.
                    </p>
                    
                    <div className="mb-5 grid gap-3">
                      <div className="flex items-start">
                        <div className="mr-3 flex-shrink-0 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </div>
                        <div className="text-sm text-[#444]">Real-time regulatory guidance with expert-level insights</div>
                      </div>
                      <div className="flex items-start">
                        <div className="mr-3 flex-shrink-0 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </div>
                        <div className="text-sm text-[#444]">Multi-modal analysis of documents and protocols</div>
                      </div>
                      <div className="flex items-start">
                        <div className="mr-3 flex-shrink-0 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </div>
                        <div className="text-sm text-[#444]">Powered by OpenAI GPT-4o for state-of-the-art intelligence</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Link to="/ask-lumen">
                        <button className="bg-violet-700 hover:bg-violet-800 text-white px-5 py-2 rounded-md text-sm font-medium flex items-center transition shadow-sm hover:shadow">
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

        {/* Featured Solutions Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-6">
            <div className="mb-12 text-center">
              <div className="inline-block text-xs font-semibold uppercase tracking-wider text-[#06c] bg-blue-50 rounded-full px-3 py-1 mb-3">
                Enterprise-Grade Platform
              </div>
              <h2 className="text-3xl font-light text-[#1d1d1f] mb-2">Integrated Regulatory Solutions</h2>
              <p className="text-[#666] max-w-2xl mx-auto">
                Our seamlessly connected modules share a unified knowledge base, ensuring compliance across global markets.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* IND Wizard Card */}
              <div className="bg-white border border-[#e5e5e5] rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition">
                <div className="h-36 bg-[#f0f7ff] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#06c]/80 to-[#0086ff]/80 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative h-full flex items-center justify-center">
                    <FileCheck className="h-12 w-12 text-[#06c] group-hover:text-white transition duration-300" />
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2 group-hover:text-[#06c] transition">
                    IND Wizard™
                  </h3>
                  
                  <p className="text-sm text-[#666] mb-4">
                    AI-powered IND preparation with auto-generated modules, reducing submission time by 55%.
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex text-sm">
                      <CheckCircle className="h-4 w-4 text-[#06c] mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-[#444]">Auto-generate Modules 1-5</span>
                    </li>
                    <li className="flex text-sm">
                      <CheckCircle className="h-4 w-4 text-[#06c] mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-[#444]">FDA, EMA, PMDA submission-ready</span>
                    </li>
                  </ul>
                  
                  <Link to="/ind-wizard">
                    <button className="w-full text-[#06c] border border-[#06c] hover:bg-[#f0f7ff] py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center transition">
                      Launch IND Wizard
                      <ArrowRight className="ml-2 w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* CSR Intelligence Card */}
              <div className="bg-white border border-[#e5e5e5] rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition">
                <div className="h-36 bg-[#f0f7ff] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#06c]/80 to-[#0086ff]/80 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative h-full flex items-center justify-center">
                    <LayoutDashboard className="h-12 w-12 text-[#06c] group-hover:text-white transition duration-300" />
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2 group-hover:text-[#06c] transition">
                    CSR Intelligence™
                  </h3>
                  
                  <p className="text-sm text-[#666] mb-4">
                    Transform static CSRs into interactive dashboards with structured data extraction.
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex text-sm">
                      <CheckCircle className="h-4 w-4 text-[#06c] mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-[#444]">Extract structured data from any CSR</span>
                    </li>
                    <li className="flex text-sm">
                      <CheckCircle className="h-4 w-4 text-[#06c] mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-[#444]">Natural language search across trials</span>
                    </li>
                  </ul>
                  
                  <Link to="/enterprise-csr-intelligence">
                    <button className="w-full text-[#06c] border border-[#06c] hover:bg-[#f0f7ff] py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center transition">
                      Explore CSR Intelligence
                      <ArrowRight className="ml-2 w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* Document Vault Card */}
              <div className="bg-white border border-[#e5e5e5] rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition">
                <div className="h-36 bg-[#f0f7ff] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#06c]/80 to-[#0086ff]/80 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative h-full flex items-center justify-center">
                    <Database className="h-12 w-12 text-[#06c] group-hover:text-white transition duration-300" />
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2 group-hover:text-[#06c] transition">
                    Document Vault™
                  </h3>
                  
                  <p className="text-sm text-[#666] mb-4">
                    Secure, 21 CFR Part 11 compliant document storage with intelligent version control.
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex text-sm">
                      <CheckCircle className="h-4 w-4 text-[#06c] mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-[#444]">21 CFR Part 11 compliant</span>
                    </li>
                    <li className="flex text-sm">
                      <CheckCircle className="h-4 w-4 text-[#06c] mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-[#444]">DocuShare integration</span>
                    </li>
                  </ul>
                  
                  <Link to="/versions">
                    <button className="w-full text-[#06c] border border-[#06c] hover:bg-[#f0f7ff] py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center transition">
                      Access Document Vault
                      <ArrowRight className="ml-2 w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/team-signup">
                <button className="bg-[#06c] hover:bg-[#004f9f] text-white px-8 py-3 rounded-md text-sm font-medium flex items-center mx-auto transition shadow-sm hover:shadow">
                  Explore All Enterprise Solutions
                  <ExternalLink className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="bg-[#f9fafb] border-t border-[#e5e5e5] py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h5 className="text-sm font-semibold text-[#1d1d1f] mb-4">
                  Solutions
                </h5>
                <ul className="space-y-2">
                  <li><Link to="/ind-wizard" className="text-[13px] text-[#666] hover:text-[#06c] transition">IND Wizard™</Link></li>
                  <li><Link to="/enterprise-csr-intelligence" className="text-[13px] text-[#666] hover:text-[#06c] transition">CSR Intelligence™</Link></li>
                  <li><Link to="/versions" className="text-[13px] text-[#666] hover:text-[#06c] transition">Document Vault™</Link></li>
                  <li><Link to="/cmc-blueprint-generator" className="text-[13px] text-[#666] hover:text-[#06c] transition">CMC Blueprint™</Link></li>
                </ul>
              </div>
              
              <div>
                <h5 className="text-sm font-semibold text-[#1d1d1f] mb-4">
                  Company
                </h5>
                <ul className="space-y-2">
                  <li><a href="#" className="text-[13px] text-[#666] hover:text-[#06c] transition">About</a></li>
                  <li><a href="#" className="text-[13px] text-[#666] hover:text-[#06c] transition">Leadership</a></li>
                  <li><a href="#" className="text-[13px] text-[#666] hover:text-[#06c] transition">Careers</a></li>
                  <li><a href="#" className="text-[13px] text-[#666] hover:text-[#06c] transition">News</a></li>
                </ul>
              </div>
              
              <div>
                <h5 className="text-sm font-semibold text-[#1d1d1f] mb-4">
                  Resources
                </h5>
                <ul className="space-y-2">
                  <li><a href="#" className="text-[13px] text-[#666] hover:text-[#06c] transition">Documentation</a></li>
                  <li><a href="#" className="text-[13px] text-[#666] hover:text-[#06c] transition">Regulatory Resources</a></li>
                  <li><a href="#" className="text-[13px] text-[#666] hover:text-[#06c] transition">Customer Stories</a></li>
                  <li><a href="#" className="text-[13px] text-[#666] hover:text-[#06c] transition">Blog</a></li>
                </ul>
              </div>
              
              <div>
                <h5 className="text-sm font-semibold text-[#1d1d1f] mb-4">
                  Legal
                </h5>
                <ul className="space-y-2">
                  <li><a href="#" className="text-[13px] text-[#666] hover:text-[#06c] transition">Privacy</a></li>
                  <li><a href="#" className="text-[13px] text-[#666] hover:text-[#06c] transition">Terms</a></li>
                  <li><a href="#" className="text-[13px] text-[#666] hover:text-[#06c] transition">Cookie Policy</a></li>
                  <li><a href="#" className="text-[13px] text-[#666] hover:text-[#06c] transition">GDPR</a></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-[#e5e5e5] flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <Link to="/">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#06c]">CONCEPT2CURE.AI</span>
                    <span className="text-[10px] text-[#666] -mt-0.5">TrialSage™ Platform</span>
                  </div>
                </Link>
              </div>
              
              <div className="text-[13px] text-[#666]">
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
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-4 text-center">We're updating our platform</h1>
          <p className="text-gray-600 mb-6 text-center">
            Our team is currently refreshing the TrialSage experience. Please check back shortly.
          </p>
          <div className="flex justify-center">
            <Link to="/solutions" className="bg-[#06c] hover:bg-[#004f9f] text-white px-5 py-2.5 rounded-md text-sm font-medium">
              Browse Solutions
            </Link>
          </div>
        </div>
      </div>
    );
  }
}