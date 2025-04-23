// HomeMarketingPage.jsx - Category-Defining Platform for Clinical Intelligence with Apple-inspired design
// Last update: Fixed module showcase with premium card design
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

// The Status Quo Problems - based on customer pain points
const statusQuoProblems = [
  {
    title: "CSRs: Massive PDFs Nobody Reads",
    description: "Critical CSRs are massive static PDFs that nobody reads in time. No insights until trial ends, then teams manually analyze documents when it's too late to make adjustments.",
    icon: <FileText className="w-6 h-6 text-red-500" />,
    stat: "500+",
    statLabel: "Pages per CSR"
  },
  {
    title: "INDs Take 12+ Months & $1M",
    description: "INDs take a full year and require expensive consultants. Teams compile applications in Word documents with high risk of missing critical pieces or regulatory issues.",
    icon: <Clock className="w-6 h-6 text-red-500" />,
    stat: "$1M+",
    statLabel: "In consulting fees"
  },
  {
    title: "Every Tool is a Silo",
    description: "Every submission is a war room. Regulatory submissions, trial operations, and data analysis live in separate systems that don't communicate, creating inefficiencies and delays.",
    icon: <X className="w-6 h-6 text-red-500" />,
    stat: "5-7",
    statLabel: "Disconnected systems"
  },
  {
    title: "Protocol Design is Guesswork",
    description: "Protocol design is based on intuition rather than data. AI 'assistants' don't understand regulatory requirements, leading to costly amendments and delays.",
    icon: <Brain className="w-6 h-6 text-red-500" />,
    stat: "2.3",
    statLabel: "Amendments per study"
  }
];

// ROI Metrics - real numbers showing the business impact
const roiMetrics = [
  { 
    metric: "IND Preparation Time", 
    traditional: "14 months", 
    withTrialSage: "5-7 months", 
    savings: "50-64%",
    icon: <Clock className="w-6 h-6 text-emerald-600" />
  },
  { 
    metric: "Protocol Amendments", 
    traditional: "2.3 per study", 
    withTrialSage: "0.9 per study", 
    savings: "61%",
    icon: <FileText className="w-6 h-6 text-emerald-600" />
  },
  { 
    metric: "Regulatory Query Response", 
    traditional: "8-12 days", 
    withTrialSage: "24-48 hours", 
    savings: "Up to 83%",
    icon: <Zap className="w-6 h-6 text-emerald-600" />
  },
  { 
    metric: "eCTD Publishing Costs", 
    traditional: "$54,000/submission", 
    withTrialSage: "$17,500/submission", 
    savings: "68%",
    icon: <DollarSign className="w-6 h-6 text-emerald-600" />
  },
  { 
    metric: "Clinical Trial Duration", 
    traditional: "Standard", 
    withTrialSage: "15-25% faster", 
    savings: "20% avg",
    icon: <BarChart2 className="w-6 h-6 text-emerald-600" />
  }
];

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
    category: "CER & Report Generation",
    trialsage: {
      title: "One-Click Automated",
      description: "Generates CERs and other reports using validated AI trained on past submissions. Writers just refine the auto-generated draft. Consistent compliance every time."
    },
    legacy: {
      title: "Hand-Crafted Each Time",
      description: "Each report written from scratch or outdated templates. Inconsistent styles and potential errors without extensive review. Slow turnaround, often weeks or months."
    },
    icon: <FileText className="h-10 w-10 text-white" />
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
  const [activeTab, setActiveTab] = useState('problems');
  
  // Render the component
  try {
    // Return the main UI
    return (
    <div className="min-h-screen bg-white text-[#1d1d1f]" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Enterprise-grade navigation */}
      <header className="bg-white sticky top-0 z-50 py-4 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm p-2 rounded">
                C2C.AI
              </div>
              <div className="ml-3 flex flex-col">
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
              {/* Certara-style mega-menu */}
              <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 left-0 top-full w-[900px] bg-white shadow-lg rounded-md border border-gray-100 transition-all duration-200 z-50">
                {/* Mega menu header with categories */}
                <div className="grid grid-cols-3 gap-0 border-b bg-gray-50">
                  <div className="border-r border-gray-200 py-3 px-5">
                    <h3 className="font-semibold text-gray-900">IND Acceleration</h3>
                  </div>
                  <div className="border-r border-gray-200 py-3 px-5">
                    <h3 className="font-semibold text-gray-900">CSR & Data Analysis</h3>
                  </div>
                  <div className="py-3 px-5">
                    <h3 className="font-semibold text-gray-900">Documentation & Compliance</h3>
                  </div>
                </div>
                
                {/* Solutions grid */}
                <div className="grid grid-cols-3 gap-0">
                  {/* IND Acceleration column */}
                  <div className="border-r border-gray-200">
                    <Link to="/ind-wizard" className="flex p-4 hover:bg-gray-50 group/item">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <FileCheck className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">IND Wizard™</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Complete IND assembly & submission</p>
                      </div>
                    </Link>
                    <Link to="/cmc-blueprint-generator" className="flex p-4 hover:bg-gray-50 group/item border-t border-gray-100">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <Microscope className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">CMC Blueprint™</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Chemistry & manufacturing controls</p>
                      </div>
                    </Link>
                    <Link to="/protocol-optimization" className="flex p-4 hover:bg-gray-50 group/item border-t border-gray-100">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">Protocol Optimization™</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Data-driven protocol design</p>
                      </div>
                    </Link>
                  </div>
                  
                  {/* CSR & Data Analysis column */}
                  <div className="border-r border-gray-200">
                    <Link to="/enterprise-csr-intelligence" className="flex p-4 hover:bg-gray-50 group/item">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">CSR Intelligence™</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Extract & analyze CSR data</p>
                      </div>
                    </Link>
                    <Link to="/analytics-dashboard" className="flex p-4 hover:bg-gray-50 group/item border-t border-gray-100">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">Analytics Suite™</h4>
                        <p className="text-sm text-gray-500 mt-0.5">25 interactive dashboards</p>
                      </div>
                    </Link>
                    <Link to="/ask-lumen" className="flex p-4 hover:bg-gray-50 group/item border-t border-gray-100">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">Ask Lumen™ AI</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Regulatory intelligence assistant</p>
                      </div>
                    </Link>
                  </div>
                  
                  {/* Documentation & Compliance column */}
                  <div>
                    <Link to="/versions" className="flex p-4 hover:bg-gray-50 group/item">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">Document Vault™</h4>
                        <p className="text-sm text-gray-500 mt-0.5">21 CFR Part 11 compliant storage</p>
                      </div>
                    </Link>
                    <Link to="/cer-generator" className="flex p-4 hover:bg-gray-50 group/item border-t border-gray-100">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">CER Generator™</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Clinical evaluation reports</p>
                      </div>
                    </Link>
                    <Link to="/document-management" className="flex p-4 hover:bg-gray-50 group/item border-t border-gray-100">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">DocuFlow™</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Document management workflow</p>
                      </div>
                    </Link>
                  </div>
                </div>
                
                {/* Explore all solutions footer */}
                <div className="bg-gray-50 p-3.5 rounded-b-md flex items-center justify-between border-t border-gray-200">
                  <span className="text-sm text-gray-700 font-medium">Enterprise-grade regulatory solutions</span>
                  <Link to="/solutions" className="text-blue-600 font-medium hover:underline flex items-center text-sm">
                    Explore all solutions <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Industries Mega-Menu - Certara Style */}
            <div className="group relative">
              <div className="flex items-center cursor-pointer">
                <span className="text-gray-800 font-medium">Industries</span>
                <ChevronRight className="w-4 h-4 ml-1 transform rotate-90 text-gray-500 group-hover:text-blue-600 transition-transform group-hover:rotate-[270deg]" />
              </div>
              
              {/* Industries Mega Menu */}
              <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 left-0 top-full w-[650px] bg-white shadow-lg rounded-md border border-gray-100 transition-all duration-200 z-50">
                <div className="p-6">
                  <h3 className="text-gray-900 font-semibold text-lg mb-5 border-b pb-2 border-gray-200">
                    Industry-Specific Solutions
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-5">
                    {/* Pharma */}
                    <Link to="/industries/pharma" className="flex hover:bg-gray-50 p-3 rounded-lg group/item">
                      <div className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <Flask className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">Pharmaceutical</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Accelerate NDA preparation and CSR analysis for pharma companies</p>
                      </div>
                    </Link>
                    
                    {/* Biotech */}
                    <Link to="/industries/biotech" className="flex hover:bg-gray-50 p-3 rounded-lg group/item">
                      <div className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <Beaker className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">Biotech</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Streamline IND assembly and regulatory strategy for innovative therapies</p>
                      </div>
                    </Link>
                    
                    {/* Medical Devices */}
                    <Link to="/industries/medical-devices" className="flex hover:bg-gray-50 p-3 rounded-lg group/item">
                      <div className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <Stethoscope className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">Medical Devices</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Clinical evaluation reports and device registration acceleration</p>
                      </div>
                    </Link>
                    
                    {/* CRO */}
                    <Link to="/industries/cro" className="flex hover:bg-gray-50 p-3 rounded-lg group/item">
                      <div className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">Contract Research</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Enhance CRO service offerings with regulatory document automation</p>
                      </div>
                    </Link>
                  </div>
                </div>
                
                {/* View all industries footer */}
                <div className="bg-gray-50 p-3.5 rounded-b-md flex items-center justify-between border-t border-gray-200">
                  <span className="text-sm text-gray-700 font-medium">Specialized solutions for your industry</span>
                  <Link to="/industries" className="text-blue-600 font-medium hover:underline flex items-center text-sm">
                    View all industries <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Resources Mega-Menu - Certara Style */}
            <div className="group relative">
              <div className="flex items-center cursor-pointer">
                <span className="text-gray-800 font-medium">Resources</span>
                <ChevronRight className="w-4 h-4 ml-1 transform rotate-90 text-gray-500 group-hover:text-blue-600 transition-transform group-hover:rotate-[270deg]" />
              </div>
              
              {/* Resources Mega Menu */}
              <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 left-0 top-full w-[650px] bg-white shadow-lg rounded-md border border-gray-100 transition-all duration-200 z-50">
                <div className="p-6">
                  <h3 className="text-gray-900 font-semibold text-lg mb-5 border-b pb-2 border-gray-200">
                    Knowledge Resources
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-5">
                    {/* Whitepapers */}
                    <Link to="/resources/whitepapers" className="flex hover:bg-gray-50 p-3 rounded-lg group/item">
                      <div className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">Whitepapers</h4>
                        <p className="text-sm text-gray-500 mt-0.5">In-depth analysis of regulatory trends and best practices</p>
                      </div>
                    </Link>
                    
                    {/* Case Studies */}
                    <Link to="/resources/case-studies" className="flex hover:bg-gray-50 p-3 rounded-lg group/item">
                      <div className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <CheckSquare className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">Case Studies</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Real-world success stories from leading life science companies</p>
                      </div>
                    </Link>
                    
                    {/* Webinars */}
                    <Link to="/resources/webinars" className="flex hover:bg-gray-50 p-3 rounded-lg group/item">
                      <div className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">Webinars</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Expert-led sessions on AI-powered regulatory innovation</p>
                      </div>
                    </Link>
                    
                    {/* Blog */}
                    <Link to="/resources/blog" className="flex hover:bg-gray-50 p-3 rounded-lg group/item">
                      <div className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-lg shrink-0">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 group-hover/item:text-blue-600">Blog</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Latest insights on regulatory science and compliance</p>
                      </div>
                    </Link>
                  </div>
                </div>
                
                {/* View all resources footer */}
                <div className="bg-gray-50 p-3.5 rounded-b-md flex items-center justify-between border-t border-gray-200">
                  <span className="text-sm text-gray-700 font-medium">Stay informed with our latest resources</span>
                  <Link to="/resources" className="text-blue-600 font-medium hover:underline flex items-center text-sm">
                    View all resources <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
            
            <Link to="/pricing" className="text-gray-800 hover:text-blue-600 font-medium transition-colors">
              Pricing
            </Link>
            
            <Link to="/ask-lumen" className="text-gray-800 hover:text-blue-600 font-medium transition-colors">
              Ask Lumen
            </Link>
          </nav>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center mr-2">
              <button className="text-gray-500 hover:text-gray-900">
                <Search className="w-5 h-5" />
              </button>
            </div>
            
            <Link to="/auth" className="hidden md:block text-gray-800 hover:text-blue-600 font-medium">
              Log in
            </Link>
            
            <Link to="/auth" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium transition-colors">
              Get Started
            </Link>
            
            <div className="border-l border-gray-200 h-6 hidden xl:block"></div>
            
            <Link to="/team-signup" 
              className="hidden xl:flex items-center text-gray-800 hover:text-blue-600 font-medium">
              <UserPlus className="w-4 h-4 mr-2" />
              For Enterprise
            </Link>
            
            <button className="xl:hidden text-gray-800 ml-2 bg-gray-100 hover:bg-gray-200 p-2 rounded-md transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Ask Lumen banner - enterprise style */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="w-5 h-5 mr-3" />
            <p className="text-sm font-medium">
              Ask Lumen™ AI Assistant now available with free 10-minute trial for regulatory advice
            </p>
          </div>
          <Link to="/ask-lumen">
            <button className="text-white bg-white/20 hover:bg-white/30 text-sm font-medium py-1 px-4 rounded-md transition-colors whitespace-nowrap">
              Try Free
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
          
          <div className="grid grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
            {/* CER Generator Card */}
            <Link to="/cer-generator" className="bg-white p-6 rounded-xl shadow-sm border border-[#e5e5e7] hover:shadow-md transition-all hover:border-[#0071e3] group flex flex-col">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-[#f5f5f7] rounded-lg group-hover:bg-[#f0f7ff]">
                  <Target className="h-6 w-6 text-[#06c]" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-[#1d1d1f] group-hover:text-[#06c]">
                  CER Generator™
                </h3>
              </div>
              <p className="text-sm text-[#86868b] mb-auto">
                Clinical evaluation reports with intelligent data extraction from regulatory sources.
              </p>
              <div className="flex items-center justify-end mt-4 pt-3 border-t border-[#e5e5e7]">
                <span className="text-[#06c] text-sm font-medium group-hover:underline flex items-center">
                  Launch <ArrowRight className="ml-1 w-3 h-3" />
                </span>
              </div>
            </Link>
            
            {/* CMC Blueprint */}
            <Link to="/cmc-blueprint-generator" className="bg-white p-6 rounded-xl shadow-sm border border-[#e5e5e7] hover:shadow-md transition-all hover:border-[#0071e3] group flex flex-col">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-[#f5f5f7] rounded-lg group-hover:bg-[#f0f7ff]">
                  <Beaker className="h-6 w-6 text-[#06c]" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-[#1d1d1f] group-hover:text-[#06c]">
                  CMC Blueprint™
                </h3>
              </div>
              <p className="text-sm text-[#86868b] mb-auto">
                Chemistry, manufacturing and controls AI assistant for regulatory submissions.
              </p>
              <div className="flex items-center justify-end mt-4 pt-3 border-t border-[#e5e5e7]">
                <span className="text-[#06c] text-sm font-medium group-hover:underline flex items-center">
                  Launch <ArrowRight className="ml-1 w-3 h-3" />
                </span>
              </div>
            </Link>
            
            {/* Ask Lumen */}
            <Link to="/chat" className="bg-white p-6 rounded-xl shadow-sm border border-[#e5e5e7] hover:shadow-md transition-all hover:border-[#0071e3] group flex flex-col">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-[#f5f5f7] rounded-lg group-hover:bg-[#f0f7ff]">
                  <Sparkles className="h-6 w-6 text-[#06c]" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-[#1d1d1f] group-hover:text-[#06c]">
                  Ask Lumen™
                </h3>
              </div>
              <p className="text-sm text-[#86868b] mb-auto">
                AI regulatory assistant with expert guidance and compliance insights in seconds.
              </p>
              <div className="flex items-center justify-end mt-4 pt-3 border-t border-[#e5e5e7]">
                <span className="text-[#06c] text-sm font-medium group-hover:underline flex items-center">
                  Launch <ArrowRight className="ml-1 w-3 h-3" />
                </span>
              </div>
            </Link>
          </div>
          
          <div className="max-w-4xl mx-auto bg-[#f8f8fc] rounded-2xl p-8 md:p-10 border border-[#e5e5e7] shadow-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between md:space-x-8">
              <div className="md:max-w-sm mb-8 md:mb-0">
                <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-4"
                    style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Ready to transform your regulatory operations?
                </h3>
                <p className="text-[#424245] mb-6">
                  Get started with a focused implementation or deploy the full platform.
                  Our team will guide you through every step.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/ind-wizard" 
                    className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 py-2.5 rounded-xl text-base font-medium transition-all flex items-center gap-2">
                    Launch IND Wizard <ArrowRight size={16}/>
                  </Link>
                  <Link to="/solutions" 
                    className="bg-white hover:bg-[#f5f5f7] text-[#0071e3] border border-[#d2d2d7] px-5 py-2.5 rounded-xl text-base font-medium transition-all flex items-center gap-2">
                    View Full Platform
                  </Link>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e5e5e7] md:min-w-[280px]">
                <h4 className="text-lg font-medium text-[#1d1d1f] mb-4">Success Metrics</h4>
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#424245]">IND Preparation Time</span>
                      <span className="text-sm font-semibold text-[#06c]">-54%</span>
                    </div>
                    <div className="w-full h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                      <div className="h-full bg-[#06c] rounded-full" style={{ width: "54%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#424245]">Protocol Amendments</span>
                      <span className="text-sm font-semibold text-[#06c]">-61%</span>
                    </div>
                    <div className="w-full h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                      <div className="h-full bg-[#06c] rounded-full" style={{ width: "61%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#424245]">First-pass Approval Rate</span>
                      <span className="text-sm font-semibold text-[#06c]">97%</span>
                    </div>
                    <div className="w-full h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                      <div className="h-full bg-[#06c] rounded-full" style={{ width: "97%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex items-center justify-center">
            <p className="text-sm text-[#86868b] mr-2">Trusted by leading biotechs and pharma companies</p>
            <div className="flex space-x-6">
              <div className="w-20 h-8 bg-[#f5f5f7] rounded"></div>
              <div className="w-20 h-8 bg-[#f5f5f7] rounded"></div>
              <div className="w-20 h-8 bg-[#f5f5f7] rounded"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Status Quo Section - Apple Style */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <p className="text-[#06c] font-medium mb-2 tracking-tight text-[17px]">
              The Problem
            </p>
            <h2 className="text-2xl md:text-3xl font-medium mb-4 text-[#1d1d1f]"
                style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
              The Legacy Approach is Holding You Back
            </h2>
            <p className="text-base text-[#86868b]">
              Current industry-standard platforms and processes waste your time, budget, and competitive edge.
              TrialSage changes everything.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusQuoProblems.map((problem, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 flex flex-col h-full border border-[#e5e5e7] hover:shadow-md transition-all"
                style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}
              >
                <div className="flex items-center mb-4">
                  {problem.icon}
                  <h3 className="text-xl font-semibold ml-3 text-[#1d1d1f]">{problem.title}</h3>
                </div>
                <p className="text-[#86868b] mb-6 flex-grow">{problem.description}</p>
                <div className="border-t border-[#e5e5e7] pt-4 mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-semibold text-red-500">{problem.stat}</div>
                    <div className="text-sm text-[#86868b]">{problem.statLabel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/pain-points" className="inline-flex items-center text-[#06c] font-medium hover:underline transition-all">
              See how we solve these challenges <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ROI Section - Apple Style */}
      <section className="py-20 bg-[#f5f5f7]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <p className="text-[#06c] font-medium mb-2 tracking-tight text-[17px]">
              The Results
            </p>
            <h2 className="text-2xl md:text-3xl font-medium mb-4 text-[#1d1d1f]"
                style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
              Game-Changing ROI That Legacy Vendors Cannot Match
            </h2>
            <p className="text-base text-[#86868b]">
              What does upgrading to an intelligent, integrated platform mean for your organization?
              Tangible results that translate directly to your bottom line.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden"
               style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
            <div className="p-6 bg-[#0071e3] text-white">
              <h3 className="text-xl font-semibold">TrialSage ROI Metrics vs. Traditional Approaches</h3>
              <p className="opacity-90">Based on aggregate customer data across multiple therapeutic areas</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f5f5f7] border-b border-[#e5e5e7]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1d1d1f]">Metric</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1d1d1f]">Traditional Approach</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1d1d1f]">With TrialSage</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-[#1d1d1f]">Improvement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e7]">
                  {roiMetrics.map((metric, index) => (
                    <tr key={index} className="hover:bg-[#f5f5f7]">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {metric.icon}
                          <span className="ml-3 font-medium text-[#1d1d1f]">{metric.metric}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#86868b]">{metric.traditional}</td>
                      <td className="px-6 py-4 text-[#2ecc71] font-medium">{metric.withTrialSage}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-block px-3 py-1 bg-[#f2f7ff] text-[#0071e3] rounded-full font-medium text-sm">
                          {metric.savings}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-[#f5f5f7] border-t border-[#e5e5e7]">
              <div className="flex items-start gap-3">
                <div className="bg-[#0071e3] p-2 rounded-full">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#1d1d1f]">Bottom line:</h4>
                  <p className="text-[#86868b]">
                    Shorter timelines, lower costs, fewer risks. In an industry where each month can mean millions
                    in opportunity or expenses, TrialSage pays for itself many times over by turbocharging your development
                    and de-risking your path to approval.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Systems Section - Modern and Clear */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex justify-center items-center mb-4">
              <span className="px-3 py-1 bg-[#f2f7ff] text-[#06c] rounded-full text-sm font-medium">Our Solution Suite</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-[#1d1d1f]"
                style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
              The Complete Clinical & Regulatory Platform
            </h2>
            <p className="text-lg text-[#424245]" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
              One integrated platform to manage the entire regulatory process from protocol development to approval and beyond.
              Powered by OpenAI's GPT-4o technology for unmatched accuracy and compliance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-10 max-w-6xl mx-auto mb-16">
            {/* IND Architect - Apple Style */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#e5e5e7] p-0">
              <div className="grid md:grid-cols-7 items-center">
                <div className="md:col-span-3 p-10">
                  <div className="mb-4 flex items-center">
                    <div className="bg-[#f5f5f7] p-3 rounded-full">
                      <FileCheck className="h-6 w-6 text-[#06c]" />
                    </div>
                    <h3 className="ml-3 text-xl font-medium text-[#1d1d1f]" 
                        style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                      IND Wizard™
                    </h3>
                  </div>
                  <p className="text-[#86868b] mb-5" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                    Build INDs in one-third the time with zero guesswork. Our intelligent system guides you through 
                    each step with regulatory-compliant templates and AI assistance.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-[#1d1d1f]">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-[#06c] flex-shrink-0" />
                      <span>FDA, EMA, PMDA ready</span>
                    </li>
                    <li className="flex items-start gap-2 text-[#1d1d1f]">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-[#06c] flex-shrink-0" />
                      <span>Auto-generate Modules 1–5</span>
                    </li>
                    <li className="flex items-start gap-2 text-[#1d1d1f]">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-[#06c] flex-shrink-0" />
                      <span>AI-guided summaries and rationales</span>
                    </li>
                    <li className="flex items-start gap-2 text-[#1d1d1f]">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-[#06c] flex-shrink-0" />
                      <span>21 CFR Part 11 compliant</span>
                    </li>
                  </ul>
                  <Link to="/ind-wizard" className="text-[#06c] text-sm font-medium flex items-center hover:underline">
                    Learn more <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
                <div className="md:col-span-4 bg-[#f5f5f7] h-full p-10">
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-[#e5e5e7]">
                    <div className="h-6 flex items-center mb-4">
                      <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]"></div>
                      </div>
                      <div className="ml-3 text-xs text-[#86868b]">IND Wizard™</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-[#f5f5f7] rounded-full w-full"></div>
                      <div className="h-4 bg-[#f5f5f7] rounded-full w-5/6"></div>
                      <div className="h-4 bg-[#f5f5f7] rounded-full w-4/6"></div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="h-16 bg-[#f5f5f7] rounded-md"></div>
                      <div className="h-16 bg-[#f5f5f7] rounded-md"></div>
                      <div className="h-16 bg-[#f5f5f7] rounded-md"></div>
                    </div>
                    <div className="mt-4 text-xs text-[#06c] flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      <span>AI generating compliant document...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CSR Oracle - Apple Style */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#e5e5e7] p-0">
              <div className="grid md:grid-cols-7 items-center">
                <div className="md:col-span-4 bg-[#f5f5f7] h-full p-10 order-2 md:order-1">
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-[#e5e5e7]">
                    <div className="h-6 flex items-center mb-4">
                      <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]"></div>
                      </div>
                      <div className="ml-3 text-xs text-[#86868b]">CSR Intelligence™</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="col-span-2 h-4 bg-[#f5f5f7] rounded-full w-3/4"></div>
                      <div className="h-28 bg-[#f5f5f7] rounded-md"></div>
                      <div className="h-28 bg-[#f5f5f7] rounded-md"></div>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-1">
                      <div className="h-4 bg-[#f5f5f7] rounded-full"></div>
                      <div className="h-4 bg-[#f5f5f7] rounded-full"></div>
                      <div className="h-4 bg-[#f5f5f7] rounded-full"></div>
                      <div className="h-4 bg-[#f5f5f7] rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-3 p-10 order-1 md:order-2">
                  <div className="mb-4 flex items-center">
                    <div className="bg-[#f5f5f7] p-3 rounded-full">
                      <LayoutDashboard className="h-6 w-6 text-[#06c]" />
                    </div>
                    <h3 className="ml-3 text-xl font-medium text-[#1d1d1f]"
                        style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                      CSR Intelligence™
                    </h3>
                  </div>
                  <p className="text-[#86868b] mb-5" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                    Transform static 500-page CSRs into interactive dashboards and structured data. Extract insights automatically 
                    and search across all your trials with natural language.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-[#1d1d1f]">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-[#06c] flex-shrink-0" />
                      <span>Extract structured data from any CSR</span>
                    </li>
                    <li className="flex items-start gap-2 text-[#1d1d1f]">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-[#06c] flex-shrink-0" />
                      <span>Compare across trials by any parameter</span>
                    </li>
                    <li className="flex items-start gap-2 text-[#1d1d1f]">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-[#06c] flex-shrink-0" />
                      <span>Natural language search across all documents</span>
                    </li>
                    <li className="flex items-start gap-2 text-[#1d1d1f]">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-[#06c] flex-shrink-0" />
                      <span>Real-time safety signal monitoring</span>
                    </li>
                  </ul>
                  <Link to="/csr-library" className="text-[#06c] text-sm font-medium flex items-center hover:underline">
                    Learn more <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Document Vault - Apple Style */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#e5e5e7] p-0">
              <div className="grid md:grid-cols-7 items-center">
                <div className="md:col-span-3 p-10">
                  <div className="mb-4 flex items-center">
                    <div className="bg-[#f5f5f7] p-3 rounded-full">
                      <Database className="h-6 w-6 text-[#06c]" />
                    </div>
                    <h3 className="ml-3 text-xl font-medium text-[#1d1d1f]"
                        style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                      Document Vault™
                    </h3>
                  </div>
                  <p className="text-[#86868b] mb-5" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                    Secure, compliant storage with intelligent versioning and analytics. Store, organize, and retrieve all 
                    your regulatory documents in one centralized system.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-[#1d1d1f]">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-[#06c] flex-shrink-0" />
                      <span>21 CFR Part 11 compliant storage</span>
                    </li>
                    <li className="flex items-start gap-2 text-[#1d1d1f]">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-[#06c] flex-shrink-0" />
                      <span>Versioning, approvals, and audit trails</span>
                    </li>
                    <li className="flex items-start gap-2 text-[#1d1d1f]">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-[#06c] flex-shrink-0" />
                      <span>Auto-classify any document type</span>
                    </li>
                    <li className="flex items-start gap-2 text-[#1d1d1f]">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-[#06c] flex-shrink-0" />
                      <span>Ask questions across your entire corpus</span>
                    </li>
                  </ul>
                  <Link to="/versions" className="text-[#06c] text-sm font-medium flex items-center hover:underline">
                    Learn more <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
                <div className="md:col-span-4 bg-[#f5f5f7] h-full p-10">
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-[#e5e5e7]">
                    <div className="h-6 flex items-center mb-4">
                      <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]"></div>
                      </div>
                      <div className="ml-3 text-xs text-[#86868b]">Document Vault™</div>
                    </div>
                    <div className="flex flex-col space-y-2 mt-2">
                      <div className="flex items-center p-2 border border-[#e5e5e7] rounded">
                        <div className="w-7 h-7 bg-[#f5f5f7] rounded mr-2"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-[#f5f5f7] rounded-full w-3/4"></div>
                          <div className="h-2 bg-[#f5f5f7] rounded-full w-1/2 mt-1"></div>
                        </div>
                      </div>
                      <div className="flex items-center p-2 border border-[#e5e5e7] rounded">
                        <div className="w-7 h-7 bg-[#f5f5f7] rounded mr-2"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-[#f5f5f7] rounded-full w-2/3"></div>
                          <div className="h-2 bg-[#f5f5f7] rounded-full w-1/3 mt-1"></div>
                        </div>
                      </div>
                      <div className="flex items-center p-2 border border-[#e5e5e7] rounded">
                        <div className="w-7 h-7 bg-[#f5f5f7] rounded mr-2"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-[#f5f5f7] rounded-full w-1/2"></div>
                          <div className="h-2 bg-[#f5f5f7] rounded-full w-1/4 mt-1"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ask Lumen Section - Modern, Premium */}
          <div className="mt-14 max-w-6xl mx-auto bg-gradient-to-r from-[#f8f8fc] to-[#f3f9ff] rounded-2xl shadow-sm p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#0071e3] to-[#2b8fff]"></div>
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-r from-[#0071e3] to-[#2b8fff] p-4 rounded-xl shadow-md">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-[#f2f7ff] rounded-full mb-3">
                  <span className="text-[#06c] text-sm font-medium">Exclusive Technology</span>
                </div>
                <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-3"
                    style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Ask Lumen™ — Your Digital Compliance Coach
                </h3>
                <p className="text-lg text-[#424245] mb-6 leading-relaxed" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Every TrialSage product includes access to Ask Lumen™, our AI-powered assistant that delivers 
                  regulatory guidance in seconds instead of weeks. Built exclusively on OpenAI's GPT-4o technology 
                  and trained on our proprietary dataset of FDA/EMA/PMDA submissions, Lumen eliminates guesswork from 
                  regulatory writing.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <CalendarClock className="w-5 h-5 text-[#06c] mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-[#1d1d1f] block text-sm">24/7 Regulatory Guidance</span>
                      <span className="text-xs text-[#86868b]">Get answers when you need them</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <BookOpen className="w-5 h-5 text-[#06c] mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-[#1d1d1f] block text-sm">CMC Expertise Built-in</span>
                      <span className="text-xs text-[#86868b]">Complete chemistry & manufacturing guidance</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <Link to="/ask-lumen" className="px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-lg text-sm font-medium transition-all inline-flex items-center">
                    Try Ask Lumen™ Now <ArrowRight className="ml-1.5 w-4 h-4" />
                  </Link>
                  <Link to="/lumen-capabilities" className="text-[#06c] text-sm font-medium flex items-center hover:underline">
                    View capabilities <ArrowRight className="ml-1 w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 max-w-6xl mx-auto bg-white rounded-2xl overflow-hidden shadow-md border border-[#e5e5e7]">
            <div className="p-8 bg-gradient-to-r from-[#0071e3] to-[#2b8fff] text-white">
              <h3 className="text-2xl font-semibold" style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                One Unified Platform for the Entire Clinical & Regulatory Lifecycle
              </h3>
              <p className="mt-2 opacity-90">
                From protocol design to submissions and post-market surveillance
              </p>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="flex flex-col">
                  <div className="mb-3 flex items-center">
                    <Clock className="w-5 h-5 text-[#06c] mr-2" />
                    <span className="font-medium text-[#1d1d1f]">Development Acceleration</span>
                  </div>
                  <p className="text-sm text-[#86868b] mb-2">Protocol optimization and automated study design</p>
                </div>
                <div className="flex flex-col">
                  <div className="mb-3 flex items-center">
                    <ShieldCheck className="w-5 h-5 text-[#06c] mr-2" />
                    <span className="font-medium text-[#1d1d1f]">Compliance Assurance</span>
                  </div>
                  <p className="text-sm text-[#86868b] mb-2">FDA, EMA and PMDA submission-ready outputs</p>
                </div>
                <div className="flex flex-col">
                  <div className="mb-3 flex items-center">
                    <LineChart className="w-5 h-5 text-[#06c] mr-2" />
                    <span className="font-medium text-[#1d1d1f]">Performance Analytics</span>
                  </div>
                  <p className="text-sm text-[#86868b] mb-2">Real-time insights across your entire portfolio</p>
                </div>
              </div>
              <Link to="/platform" 
                    className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 py-2.5 rounded-lg text-base font-medium transition-all inline-flex items-center">
                Explore the full platform <ArrowUpRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Action Path Section - Apple Style */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-[#e5e5e7] shadow-sm flex flex-col h-full">
              <div className="p-3 bg-[#f5f5f7] rounded-full w-max mb-4">
                <LayoutDashboard className="h-6 w-6 text-[#06c]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2" 
                  style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                See It in Action
              </h3>
              <p className="text-[#86868b] mb-6 flex-grow" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Schedule a live demo with our product specialists to see how TrialSage transforms your 
                clinical and regulatory workflows.
              </p>
              <Link to="/demo" className="mt-auto inline-flex items-center text-[#06c] text-sm font-medium hover:underline">
                Request Demo <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-[#e5e5e7] shadow-sm flex flex-col h-full">
              <div className="p-3 bg-[#f5f5f7] rounded-full w-max mb-4">
                <BookOpen className="h-6 w-6 text-[#06c]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2"
                  style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Read Customer Stories
              </h3>
              <p className="text-[#86868b] mb-6 flex-grow" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Discover how leading biotechs and pharma companies are using TrialSage to accelerate 
                their development timelines.
              </p>
              <Link to="/case-studies" className="mt-auto inline-flex items-center text-[#06c] text-sm font-medium hover:underline">
                View Case Studies <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-[#e5e5e7] shadow-sm flex flex-col h-full">
              <div className="p-3 bg-[#f5f5f7] rounded-full w-max mb-4">
                <Beaker className="h-6 w-6 text-[#06c]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2"
                  style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Start Using TrialSage
              </h3>
              <p className="text-[#86868b] mb-6 flex-grow" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Ready to transform your clinical and regulatory operations? Connect with our team
                to get started with TrialSage.
              </p>
              <Link to="/auth" className="mt-auto inline-flex items-center text-[#06c] text-sm font-medium hover:underline">
                Get Started <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* First-to-Market Advantage - Modern, Premium */}
      <section className="py-24 bg-gradient-to-b from-[#f2f7ff] to-[#f8f8fc]">
        <div className="container mx-auto px-4">
          <div className="bg-white p-10 md:p-14 rounded-2xl shadow-md border border-[#e5e5e7] max-w-6xl mx-auto relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0071e3] opacity-5 rounded-full"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#0071e3] opacity-5 rounded-full"></div>
            
            <div className="max-w-3xl mx-auto text-center mb-12 relative z-10">
              <span className="inline-block px-4 py-1 bg-[#f2f7ff] text-[#06c] rounded-full text-sm font-medium mb-4">
                THE C2C.AI DIFFERENCE
              </span>
              <h2 className="text-3xl md:text-5xl font-semibold mb-6 text-[#1d1d1f] leading-tight"
                  style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Not Just Another<br/>Regulatory Tool
              </h2>
              <p className="text-xl text-[#424245]" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                TrialSage is the first platform that transforms clinical data and regulatory expertise into 
                an AI-powered intelligence system that actually accelerates approvals.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e5e5e7] hover:shadow-md transition-all hover:border-[#d1d1d6]">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-[#0071e3] to-[#2b8fff] rounded-xl shadow-sm mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2"
                    style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Execution, Not Just Insight
                </h3>
                <p className="text-[#86868b]" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Competitors give you insights. TrialSage builds the actual regulatory documents for you.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e5e5e7] hover:shadow-md transition-all hover:border-[#d1d1d6]">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-[#0071e3] to-[#2b8fff] rounded-xl shadow-sm mb-4">
                  <SearchCheck className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2"
                    style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Transparent Reasoning
                </h3>
                <p className="text-[#86868b]" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Every recommendation is backed by regulatory precedent with a clear explanation you can cite.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e5e5e7] hover:shadow-md transition-all hover:border-[#d1d1d6]">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-[#0071e3] to-[#2b8fff] rounded-xl shadow-sm mb-4">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2"
                    style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Regulatory Compliant
                </h3>
                <p className="text-[#86868b]" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Built for HIPAA, 21 CFR Part 11, and EU MDR compliance from the ground up.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e5e5e7] hover:shadow-md transition-all hover:border-[#d1d1d6]">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-[#0071e3] to-[#2b8fff] rounded-xl shadow-sm mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2"
                    style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Strategic Intelligence
                </h3>
                <p className="text-[#86868b]" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Specifically optimized for your trial, your risk profile, and your path to success.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-10 px-4 py-8 bg-[#f8f8fc] rounded-xl border border-[#e5e5e7] mb-8">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3"
                    style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Trusted by Industry Leaders
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-[#e8f3ff] mt-0.5">
                      <CheckCircle className="h-4 w-4 text-[#06c]" />
                    </div>
                    <div>
                      <span className="font-medium text-[#1d1d1f] block text-sm">FDA and EMA Veterans</span>
                      <span className="text-xs text-[#86868b]">Teams with former regulatory leadership trust our platform</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-[#e8f3ff] mt-0.5">
                      <CheckCircle className="h-4 w-4 text-[#06c]" />
                    </div>
                    <div>
                      <span className="font-medium text-[#1d1d1f] block text-sm">Research-Focused Organizations</span>
                      <span className="text-xs text-[#86868b]">From early-stage biotechs to global pharma companies</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-[#e8f3ff] mt-0.5">
                      <CheckCircle className="h-4 w-4 text-[#06c]" />
                    </div>
                    <div>
                      <span className="font-medium text-[#1d1d1f] block text-sm">Validated by Submission Success</span>
                      <span className="text-xs text-[#86868b]">Real INDs submitted and approved using our platform</span>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="md:w-1/2 md:border-l border-[#e5e5e7] md:pl-10 flex flex-col justify-center">
                <div className="mb-6">
                  <div className="text-[#1d1d1f] font-semibold text-4xl mb-2">50%</div>
                  <p className="text-[#86868b]">Faster time to IND approval versus traditional approach</p>
                </div>
                <div className="mb-6">
                  <div className="text-[#1d1d1f] font-semibold text-4xl mb-2">97%</div>
                  <p className="text-[#86868b]">First-time IND submission acceptance rate with TrialSage</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/ind-wizard" 
                    className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-6 py-3 rounded-lg text-lg font-medium transition-all flex items-center gap-2">
                Start Using TrialSage <ArrowRight size={16} />
              </Link>
              <Link to="/demo" 
                    className="bg-white hover:bg-[#f5f5f7] text-[#0071e3] border border-[#d2d2d7] px-6 py-3 rounded-lg text-lg font-medium transition-all flex items-center gap-2">
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action - Apple Style */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto bg-[#f5f5f7] rounded-3xl p-12 shadow-sm">
            <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-[#1d1d1f]"
                style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
              Build Smarter Biotech Together
            </h2>
            <p className="text-xl text-[#86868b] mb-10 max-w-2xl mx-auto"
               style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
              TrialSage is how tomorrow's biotech gets built: faster, safer, smarter.
              If you're tired of waiting on consultants, wrangling PDFs, or crossing your fingers at submission—
              this is your moment.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/ind/wizard" 
                    className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-[22px] py-[12px] rounded-full text-[17px] font-normal transition-all">
                IND Now
              </Link>
              <Link to="/pricing" 
                    className="bg-white hover:bg-[#f5f5f7] text-[#0071e3] border border-[#d2d2d7] px-[22px] py-[12px] rounded-full text-[17px] font-normal transition-all">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Apple Style */}
      <footer className="bg-[#f5f5f7] py-12 text-[#1d1d1f] border-t border-[#d2d2d7]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold text-[#1d1d1f] mb-6"
                  style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Concept2Cures.AI
              </h4>
              <p className="text-[#86868b] mb-6 text-sm" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                From scientific concepts to approved therapies with AI-driven regulatory intelligence and automation.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-[#86868b] hover:text-[#1d1d1f]">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
                <a href="#" className="text-[#86868b] hover:text-[#1d1d1f]">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-[#86868b] hover:text-[#1d1d1f]">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold text-[#1d1d1f] mb-4 text-sm"
                  style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Solutions
              </h5>
              <ul className="space-y-2 text-sm" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                <li><Link to="/ind-architect" className="text-[#86868b] hover:text-[#06c]">Global IND Architect</Link></li>
                <li><Link to="/csr-intelligence" className="text-[#86868b] hover:text-[#06c]">Protocol Designer + CSR Oracle</Link></li>
                <li><Link to="/document-suite" className="text-[#86868b] hover:text-[#06c]">SmartDoc Suite</Link></li>
                <li><Link to="/ind/wizard" className="text-[#86868b] hover:text-[#06c]">IND</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-[#1d1d1f] mb-4 text-sm"
                  style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Resources
              </h5>
              <ul className="space-y-2 text-sm" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                <li><a href="#" className="text-[#86868b] hover:text-[#06c]">Documentation</a></li>
                <li><a href="#" className="text-[#86868b] hover:text-[#06c]">Webinars</a></li>
                <li><a href="#" className="text-[#86868b] hover:text-[#06c]">Case Studies</a></li>
                <li><a href="#" className="text-[#86868b] hover:text-[#06c]">Knowledge Base</a></li>
                <li><a href="#" className="text-[#86868b] hover:text-[#06c]">API Reference</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-[#1d1d1f] mb-4 text-sm"
                  style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Company
              </h5>
              <ul className="space-y-2 text-sm" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                <li><a href="#" className="text-[#86868b] hover:text-[#06c]">About Us</a></li>
                <li><a href="#" className="text-[#86868b] hover:text-[#06c]">Leadership</a></li>
                <li><a href="#" className="text-[#86868b] hover:text-[#06c]">Careers</a></li>
                <li><a href="#" className="text-[#86868b] hover:text-[#06c]">Contact</a></li>
                <li><a href="#" className="text-[#86868b] hover:text-[#06c]">News</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#d2d2d7] flex flex-wrap justify-between items-center">
            <div className="text-[#86868b] text-xs" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
              © {new Date().getFullYear()} Concept2Cures.AI. All rights reserved.
            </div>
            <div className="flex space-x-6 text-xs" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
              <a href="#" className="text-[#86868b] hover:text-[#06c]">Terms</a>
              <a href="#" className="text-[#86868b] hover:text-[#06c]">Privacy</a>
              <a href="#" className="text-[#86868b] hover:text-[#06c]">Security</a>
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
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border border-[#e5e5e7]">
          <div className="mb-6 flex justify-center">
            <div className="bg-gradient-to-r from-[#0071e3] to-[#2b8fff] rounded p-2">
              <div className="text-white font-bold text-sm tracking-wide">C2C.AI</div>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-[#1d1d1f] mb-4 text-center">We're updating our platform</h1>
          <p className="text-[#424245] mb-6 text-center">
            Our team is currently refreshing the TrialSage experience. Please check back shortly.
          </p>
          <div className="flex justify-center">
            <Link to="/solutions" className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 py-2.5 rounded-xl text-base font-medium transition-all">
              Browse Solutions
            </Link>
          </div>
        </div>
      </div>
    );
  }
}