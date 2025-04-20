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
  ExternalLink
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
    }
  ];

  return (
    <div className="bg-gray-100 border-b border-gray-200">
      {/* Top navigation bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and company name */}
            <div className="flex items-center">
              <Link to="/">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-blue-600 text-white font-bold text-xl mr-3">TS</div>
                  <span className="font-bold text-xl text-gray-900">TrialSage</span>
                  <span className="ml-2 text-sm text-gray-500">by Concepts2Cures.AI</span>
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
                    <Link to="/lumen-bio/dashboard">
                      <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <Shield size={16} className="mr-2 text-blue-500" />
                        Lumen Bio Dashboard
                      </div>
                    </Link>
                    <Link to="/lumen-bio/reports">
                      <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <FileText size={16} className="mr-2 text-blue-500" />
                        Lumen Bio Reports
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
              <Link to="/login">
                <button className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md">
                  <LogIn size={16} className="mr-1" />
                  Sign In
                </button>
              </Link>
              <Link to="/signup">
                <button className="flex items-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md">
                  <User size={16} className="mr-1" />
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Module selection area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Our Solutions</h2>
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
  );
}