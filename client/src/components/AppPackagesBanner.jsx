// AppPackagesBanner.jsx – Simplified top navigation with essential elements
import React from 'react';
import { Link } from 'wouter';
import { 
  FileText, 
  Database, 
  Beaker, 
  FileSymlink, 
  Folder, 
  BarChart2, 
  FileArchive,
  Shield,
  LogIn,
  User,
  ChevronRight,
  ExternalLink,
  Globe,
  Library,
  Bot,
  Sparkles
} from 'lucide-react';

// Clean, simplified module tile component
const ModuleTile = ({ icon, title, description, to, highlight }) => (
  <Link to={to}>
    <div className={`flex flex-col h-full rounded-lg transition-all duration-200 p-5 min-w-[200px] ${
      highlight 
        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-900/20' 
        : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-200 hover:shadow-md text-gray-800'
    }`}>
      <div className="flex items-center mb-3">
        <div className={`p-2 rounded-full ${
          highlight 
            ? 'bg-white/20 text-white' 
            : 'bg-blue-50 text-blue-600'
        }`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold ml-3">{title}</h3>
      </div>
      <p className={`text-sm ${highlight ? 'text-blue-100' : 'text-gray-600'}`}>{description}</p>
    </div>
  </Link>
);

export default function AppPackagesBanner({ currentPath }) {
  // Core application modules
  const modules = [
    {
      icon: <FileArchive size={20} />,
      title: "Submission Builder",
      description: "Build and validate eCTD submissions with region-specific validation",
      to: "/builder",
      path: "/builder"
    },
    {
      icon: <Database size={20} />,
      title: "CSR Intelligence",
      description: "Deep learning-powered CSR analysis and optimization",
      to: "/csr-intelligence",
      path: "/csr-intelligence"
    },
    {
      icon: <FileSymlink size={20} />,
      title: "IND Architect",
      description: "Design and manage INDs with multi-region compliance",
      to: "/ind-architect",
      path: "/ind-architect"
    },
    {
      icon: <Folder size={20} />,
      title: "eCTD Manager",
      description: "Centralized eCTD lifecycle management and tracking",
      to: "/ectd-manager",
      path: "/ectd-manager"
    },
    {
      icon: <BarChart2 size={20} />,
      title: "Study Designer",
      description: "Statistical model-driven clinical study design",
      to: "/study-designer",
      path: "/study-designer"
    },
    {
      icon: <Beaker size={20} />,
      title: "CER Generator",
      description: "Clinical Evaluation Report generation and optimization",
      to: "/cer-generator",
      path: "/cer-generator"
    },
    {
      icon: <Library size={20} />,
      title: "Use Case Library",
      description: "Comprehensive regulatory case studies and templates for reference",
      to: "/use-case-library",
      path: "/use-case-library"
    }
  ];

  // Top banner entry buttons
  const entryButtons = [
    {
      label: "Accelerate IND",
      description: "Your AI partner for IND success",
      to: "/ind-architect",
      icon: <FileSymlink size={18} />,
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      label: "CSR Intelligence",
      description: "CSR analysis and optimization",
      to: "/csr-intelligence",
      icon: <Database size={18} />,
      color: "bg-emerald-600 hover:bg-emerald-700"
    },
    {
      label: "CER Module",
      description: "Clinical evaluation reports",
      to: "/cer-generator",
      icon: <Beaker size={18} />,
      color: "bg-rose-600 hover:bg-rose-700"
    },
    {
      label: "Use Case Library",
      description: "Regulatory case studies & templates",
      to: "/use-case-library",
      icon: <Library size={18} />,
      color: "bg-teal-600 hover:bg-teal-700"
    }
  ];
  
  // Client portal buttons
  const clientPortals = [
    {
      label: "Client Access",
      description: "Secure portal login",
      to: "/client-portal",
      icon: <User size={18} />,
      color: "bg-rose-600 hover:bg-rose-700"
    },
    {
      label: "AI Co-pilot",
      description: "Advanced AI assistance",
      to: "/ai-agent",
      icon: <Bot size={18} />,
      color: "bg-violet-600 hover:bg-violet-700"
    }
  ];

  return (
    <div className="bg-gray-100 border-b border-gray-200">
      {/* Simplified top section - only login/signup buttons */}
      <div className="bg-slate-800 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center">
            <div className="flex items-center space-x-3">              
              <Link to="/login">
                <button className="flex items-center text-xs font-medium text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded">
                  <LogIn size={14} className="mr-1" />
                  Sign In
                </button>
              </Link>
              <Link to="/signup">
                <button className="flex items-center text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded">
                  <User size={14} className="mr-1" />
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main navigation bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and company name */}
            <div className="flex items-center">
              <Link to="/">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-blue-600 text-white font-bold text-xl mr-3">TS</div>
                  <span className="font-bold text-xl text-gray-900">TrialSage</span>
                  <span className="ml-2 text-sm text-gray-500">by Concept2Cures.AI</span>
                </div>
              </Link>
            </div>
            
            {/* Main navigation links */}
            <div className="hidden md:flex space-x-8">
              <Link to="/">
                <span className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500 hover:text-blue-600">
                  Home
                </span>
              </Link>
              <Link to="/solutions">
                <span className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 hover:text-blue-600">
                  Solutions
                </span>
              </Link>
              <Link to="/features">
                <span className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 hover:text-blue-600">
                  Features
                </span>
              </Link>
              <Link to="/pricing">
                <span className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 hover:text-blue-600">
                  Pricing
                </span>
              </Link>
              <div className="relative group">
                <span className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 hover:text-blue-600 cursor-pointer">
                  Client Portals
                  <ChevronRight size={16} className="ml-1 transform group-hover:rotate-90 transition-transform" />
                </span>
                <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 hidden group-hover:block">
                  <div className="py-1">
                    <Link to="/client-portal">
                      <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <User size={16} className="mr-2 text-rose-500" />
                        Client Access Portal
                      </div>
                    </Link>
                    <Link to="/ai-agent">
                      <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <Bot size={16} className="mr-2 text-violet-500" />
                        AI Co-pilot
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              <Link to="/contact">
                <span className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 hover:text-blue-600">
                  Contact
                </span>
              </Link>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-4">
              <Link to="/demo">
                <button className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                  <ExternalLink size={16} className="mr-1" />
                  Request Demo
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Company and platform description - sophisticated enterprise design */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col max-w-4xl mx-auto text-center mb-12">
            <h2 className="inline-flex mx-auto px-6 py-2 rounded-full bg-blue-900/30 text-blue-300 text-sm font-medium mb-6">
              ENTERPRISE REGULATORY INTELLIGENCE
            </h2>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent tracking-tight mb-6">
              Concept2Cures.AI
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              The industry leader in AI-driven regulatory technology, transforming how pharmaceutical and biotech organizations navigate global submission processes.
            </p>
          </div>
          
          {/* Feature Tiles Grid - Moved from the top banner */}
          <div className="grid md:grid-cols-4 gap-4 lg:gap-6 max-w-4xl mx-auto">
            {entryButtons.map((button, index) => (
              <Link key={index} to={button.to}>
                <div className={`${button.color} rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-3 h-full`}>
                  <div className="flex items-center mb-2">
                    <div className="bg-white/20 p-2 rounded-lg">
                      {button.icon}
                    </div>
                    <h3 className="text-base font-bold text-white ml-2">{button.label}</h3>
                  </div>
                  <p className="text-xs text-white/90 mb-2">{button.description}</p>
                  <div className="flex justify-end">
                    <div className="bg-white/10 hover:bg-white/20 transition-colors duration-200 rounded-full p-1">
                      <ChevronRight size={14} className="text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Client Portal Tiles */}
          <div className="grid md:grid-cols-4 gap-4 lg:gap-6 mt-6 max-w-4xl mx-auto">
            {clientPortals.map((portal, index) => (
              <Link key={index} to={portal.to}>
                <div className={`${portal.color} rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-3 h-full`}>
                  <div className="flex items-center mb-2">
                    <div className="bg-white/20 p-2 rounded-lg">
                      {portal.icon}
                    </div>
                    <h3 className="text-base font-bold text-white ml-2">{portal.label}</h3>
                  </div>
                  <p className="text-xs text-white/90 mb-2">{portal.description}</p>
                  <div className="flex justify-end">
                    <div className="bg-white/10 hover:bg-white/20 transition-colors duration-200 rounded-full p-1">
                      <ChevronRight size={14} className="text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="flex justify-center mt-10">
            <Link to="/about">
              <button className="inline-flex items-center px-5 py-3 border border-slate-600 rounded-md bg-slate-800/50 hover:bg-slate-700/50 text-white font-medium transition-colors">
                About Concept2Cures.AI
                <ChevronRight className="ml-2" />
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* TrialSage Platform Section - Enterprise Grade */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-16">
            <div className="md:w-5/12">
              <div className="sticky top-10">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-6">
                  INTRODUCING
                </div>
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-6">
                  The TrialSage<span className="text-blue-600">™</span> Platform
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Our flagship AI-driven platform transforms regulatory workflows with unprecedented efficiency, data-backed insights, and multi-region compliance automation.
                </p>
                <div className="space-y-6 mb-8">
                  <div className="flex">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-600 flex items-center justify-center">
                      <FileArchive className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Accelerate Submissions</h3>
                      <p className="mt-1 text-gray-600">Reduce preparation time by 60% with AI-powered generation, validation, and formatting.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-600 flex items-center justify-center">
                      <Database className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">CSR Intelligence</h3>
                      <p className="mt-1 text-gray-600">Access insights from thousands of clinical study reports to optimize your approach.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-emerald-600 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Global Compliance</h3>
                      <p className="mt-1 text-gray-600">Automated validation for FDA, EMA, PMDA and Health Canada regulatory standards.</p>
                    </div>
                  </div>
                </div>
                
                <Link to="/platform">
                  <button className="inline-flex items-center px-5 py-3 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 font-medium transition-colors">
                    Explore Platform Capabilities
                    <ChevronRight className="ml-2" />
                  </button>
                </Link>
              </div>
            </div>
            
            <div className="md:w-7/12 relative">
              <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 border-b border-slate-700 flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center text-gray-400 text-sm">TrialSage™ Intelligence Dashboard <span className="px-1.5 py-0.5 text-xs bg-slate-700 rounded ml-1">Interface Preview</span></div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-sm border border-blue-800/30 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-400 mb-1">Active Submissions</div>
                      <div className="text-2xl font-bold text-blue-300">14</div>
                      <div className="text-xs mt-2 text-emerald-400 flex items-center">
                        <span className="mr-1">↑</span> 3 from last month
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-800/30 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-400 mb-1">Time Saved</div>
                      <div className="text-2xl font-bold text-emerald-300">1,243 hrs</div>
                      <div className="text-xs mt-2 text-emerald-400 flex items-center">
                        <span className="mr-1">↑</span> 412 from Q1
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="bg-slate-800/70 border border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-md bg-blue-900/50 flex items-center justify-center text-blue-400 mr-3">
                            <FileArchive className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-gray-200 font-medium">Oncology IND-23845</div>
                            <div className="text-xs text-gray-400">FDA Submission</div>
                          </div>
                        </div>
                        <div className="bg-emerald-900/30 text-emerald-400 text-xs font-medium px-2.5 py-1 rounded">
                          Ready to Submit
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-400 mt-3">
                        <div>Technical validation: 100%</div>
                        <div>Last updated: 2h ago</div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/70 border border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-md bg-indigo-900/50 flex items-center justify-center text-indigo-400 mr-3">
                            <Database className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-gray-200 font-medium">LUM-578 CSR Analysis</div>
                            <div className="text-xs text-gray-400">Phase 2 Reports</div>
                          </div>
                        </div>
                        <div className="bg-amber-900/30 text-amber-400 text-xs font-medium px-2.5 py-1 rounded">
                          In Progress
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-400 mt-3">
                        <div>Analysis: 75% complete</div>
                        <div>ETA: 3h remaining</div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/70 border border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-md bg-purple-900/50 flex items-center justify-center text-purple-400 mr-3">
                            <Beaker className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-gray-200 font-medium">MHRA Investigational Device</div>
                            <div className="text-xs text-gray-400">CER Validation</div>
                          </div>
                        </div>
                        <div className="bg-blue-900/30 text-blue-400 text-xs font-medium px-2.5 py-1 rounded">
                          QC Review
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-400 mt-3">
                        <div>Compliance: 98.5%</div>
                        <div>Regional issues: 3 pending</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-gray-400 text-xs text-center">
                    <div className="inline-flex items-center px-1.5 py-0.5 bg-slate-700/50 rounded mb-1">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5 animate-pulse"></div>
                      Interface Demonstration - Sample Data
                    </div>
                    <div>Real-time AI-powered insights and automated region-specific validation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module selection area - Enterprise Grade */}
      <div className="bg-gray-50 py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium mb-4">
              UNIFIED PLATFORM
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Integrated AI-Powered Solutions</h2>
            <p className="text-lg text-gray-600">
              Our comprehensive suite of enterprise tools drives efficiency, compliance, and insight across your entire regulatory process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <ModuleTile
                key={index}
                icon={module.icon}
                title={module.title}
                description={module.description}
                to={module.to}
                highlight={currentPath && module.path && currentPath.startsWith(module.path)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}