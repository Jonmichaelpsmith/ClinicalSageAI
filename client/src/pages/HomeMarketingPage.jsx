// HomeMarketingPage.jsx - Category-Defining Platform for Clinical Intelligence with Apple-inspired design
import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  ArrowRight, Clock, DollarSign, ShieldCheck, Brain, 
  FileText, FileCheck, BarChart2, Zap, 
  CheckCircle, X, ArrowUpRight, BookOpen,
  LayoutDashboard, Beaker, Sparkles, Database
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
  
  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Apple-style navigation */}
      <header className="bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center h-12">
          <div className="flex items-center ml-5">
            <Link to="/" className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-md p-1.5 mr-2">
                <div className="text-white font-bold text-xs tracking-wide">C2C</div>
              </div>
              <span className="text-sm font-medium text-white tracking-tight">TrialSage™</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center justify-center space-x-6 flex-1 px-12">
            <Link to="/" className="px-2 py-1 text-xs font-medium text-white cursor-pointer transition-colors">
              Home
            </Link>
            <Link to="/ind-wizard" className="px-2 py-1 text-xs font-medium text-gray-400 hover:text-white cursor-pointer transition-colors">
              IND Wizard™
            </Link>
            <Link to="/enterprise-csr-intelligence" className="px-2 py-1 text-xs font-medium text-gray-400 hover:text-white cursor-pointer transition-colors">
              CSR Intelligence™
            </Link>
            <Link to="/versions" className="px-2 py-1 text-xs font-medium text-gray-400 hover:text-white cursor-pointer transition-colors">
              Document Vault™
            </Link>
            <Link to="/auth" className="px-2 py-1 text-xs font-medium text-gray-400 hover:text-white cursor-pointer transition-colors">
              Login
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4 mr-5">
            <Link to="/ask-lumen" className="hidden sm:flex items-center space-x-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
              <span>Ask</span>
              <span className="font-semibold">Lumen</span>
            </Link>
            
            <button className="md:hidden text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section - Apple Style with White Background */}
      <section className="relative py-16 md:py-28 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfd] to-[#f5f5f7]"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[#06c] font-medium mb-2 tracking-tight text-[17px]">
              Introducing
            </p>
            
            <h1 className="text-3xl md:text-4xl font-medium text-[#1d1d1f] mb-4 leading-tight"
                style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
              The Clinical Intelligence System
              <span className="block mt-2">
                that thinks like a biotech founder
              </span>
            </h1>
            
            <p className="text-lg text-[#86868b] mb-10 max-w-3xl mx-auto">
              A sophisticated platform that transforms clinical data and regulatory workflows into 
              actionable intelligence, accelerating your path to market.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/ind-wizard" 
                className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-[22px] py-[12px] rounded-full text-[17px] font-normal transition-all flex items-center gap-2">
                Explore IND Wizard <ArrowRight size={16}/>
              </Link>
              <Link to="/demo" 
                className="bg-white hover:bg-[#f5f5f7] text-[#0071e3] border border-[#d2d2d7] px-[22px] py-[12px] rounded-full text-[17px] font-normal transition-all flex items-center gap-2">
                Request Demo
              </Link>
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

      {/* Core Systems Section - Apple Style */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <p className="text-[#06c] font-medium mb-2 tracking-tight text-[17px]">
              The Solution
            </p>
            <h2 className="text-2xl md:text-3xl font-medium mb-4 text-[#1d1d1f]"
                style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
              The Core Systems That Power TrialSage
            </h2>
            <p className="text-base text-[#86868b]" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
              TrialSage is a real-time, AI-powered platform that automates the parts of clinical and regulatory development 
              that don't need to be manual anymore—and enhances the parts that do, with precision insight and smart, embedded copilots.
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
          
          {/* Ask Lumen Section - Apple Style */}
          <div className="mt-14 max-w-6xl mx-auto bg-[#f5f5f7] rounded-3xl shadow-sm p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#06c]"></div>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="bg-[#06c] p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2"
                    style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Ask Lumen™ — Your Digital Compliance Coach
                </h3>
                <p className="text-[#86868b] mb-4" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Every TrialSage solution includes Ask Lumen™, our compliance-aware AI assistant that answers questions about your documents, protocols, regulations,
                  CMC requirements, and more. Trained on our proprietary knowledge base of successful submissions 
                  and regulatory precedent.
                </p>
                <Link to="/ask-lumen" className="text-[#06c] text-sm font-medium flex items-center hover:underline">
                  Learn more about Ask Lumen <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-16 max-w-6xl mx-auto bg-white rounded-3xl overflow-hidden shadow-sm border border-[#e5e5e7]">
            <div className="p-6 bg-[#0071e3] text-white">
              <h3 className="text-xl font-semibold" style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                All of this in one unified platform
              </h3>
            </div>
            <div className="p-8">
              <p className="text-[#86868b] mb-6" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                No more jumping between a CTMS, an EDC, a document repository, and an analytics dashboard – 
                TrialSage is your clinical and regulatory command center.
              </p>
              <Link to="/platform" 
                    className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-[22px] py-[8px] rounded-full text-[17px] font-normal transition-all inline-flex items-center">
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
              <Link to="/contact" className="mt-auto inline-flex items-center text-[#06c] text-sm font-medium hover:underline">
                Get Started <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* First-to-Market Advantage - Apple Style */}
      <section className="py-20 bg-[#f5f5f7]">
        <div className="container mx-auto px-4">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-[#e5e5e7] max-w-6xl mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <p className="text-[#06c] font-medium mb-2 tracking-tight text-[17px]">
                FIRST-TO-MARKET ADVANTAGE
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-[#1d1d1f]"
                  style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Not a Plugin. Not a Widget.<br/>Not a Data Viewer.
              </h2>
              <p className="text-xl text-[#86868b]" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                TrialSage is the first platform that turns your clinical data + regulatory knowledge into an AI-augmented intelligence engine.
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e5e7]">
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3 flex items-center"
                    style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  <span className="p-2 rounded-full bg-[#f5f5f7] mr-3">
                    <CheckCircle className="h-5 w-5 text-[#06c]" />
                  </span>
                  Actionable
                </h3>
                <p className="text-[#86868b]" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Never just insight—always integrated into your next step
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e5e7]">
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3 flex items-center"
                    style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  <span className="p-2 rounded-full bg-[#f5f5f7] mr-3">
                    <CheckCircle className="h-5 w-5 text-[#06c]" />
                  </span>
                  Explainable
                </h3>
                <p className="text-[#86868b]" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Never a black box—always traceable and editable
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e5e7]">
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3 flex items-center"
                    style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  <span className="p-2 rounded-full bg-[#f5f5f7] mr-3">
                    <CheckCircle className="h-5 w-5 text-[#06c]" />
                  </span>
                  Auditable
                </h3>
                <p className="text-[#86868b]" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Built for submission, built for safety
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e5e7]">
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3 flex items-center"
                    style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  <span className="p-2 rounded-full bg-[#f5f5f7] mr-3">
                    <CheckCircle className="h-5 w-5 text-[#06c]" />
                  </span>
                  Strategic
                </h3>
                <p className="text-[#86868b]" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Aligned to your trial, your risk profile, your success
                </p>
              </div>
            </div>
            
            <div className="border-t border-[#e5e5e7] pt-10 flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 text-center md:text-left">
                <h4 className="text-xl font-semibold text-[#1d1d1f] mb-2"
                    style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Who trusts TrialSage?
                </h4>
                <ul className="text-[#86868b] space-y-2" style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#06c]" />
                    <span>Teams with ex-FDA and ex-EMA leadership</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#06c]" />
                    <span>Early adopters already submitting INDs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#06c]" />
                    <span>HIPAA | 21 CFR Part 11 | EU MDR compliant</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-end gap-4">
                <Link to="/ind/wizard" 
                      className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-[22px] py-[12px] rounded-full text-[17px] font-normal transition-all flex items-center gap-2">
                  Launch Platform Now <ArrowRight size={16} />
                </Link>
                <Link to="/demo" 
                      className="bg-white hover:bg-[#f5f5f7] text-[#0071e3] border border-[#d2d2d7] px-[22px] py-[12px] rounded-full text-[17px] font-normal transition-all flex items-center gap-2">
                  Request Live Demo
                </Link>
              </div>
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
}