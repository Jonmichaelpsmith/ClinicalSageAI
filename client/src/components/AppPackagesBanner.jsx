// AppPackagesBanner.jsx – Tiles of app packages for top navigation
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
  Shield
} from 'lucide-react';

const AppPackagesTile = ({ icon, title, description, to, highlight }) => (
  <Link to={to}>
    <div className={`flex flex-col h-full rounded-md border transition-all duration-200 p-4 min-w-[200px] ${
      highlight 
        ? 'bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-500/50 shadow-md shadow-blue-600/10' 
        : 'bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-slate-700 hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-600/5'
    }`}>
      <div className="flex items-center mb-2">
        <div className={`p-2 rounded-full ${
          highlight 
            ? 'bg-blue-600/30 text-blue-300' 
            : 'bg-slate-700 text-gray-300'
        }`}>
          {icon}
        </div>
        <h3 className={`text-lg font-medium ml-2 ${highlight ? 'text-blue-300' : 'text-gray-200'}`}>{title}</h3>
      </div>
      <p className={`text-sm mt-1 ${highlight ? 'text-blue-200/80' : 'text-gray-400'}`}>{description}</p>
    </div>
  </Link>
);

export default function AppPackagesBanner({ currentPath }) {
  // App packages configuration
  const packages = [
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
    <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top navigation bar with login and signup */}
        <div className="flex justify-between items-center py-3 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">TrialSage</span> Platform
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center border-r border-gray-700 pr-4 mr-4">
              <Link to="/lumen-bio/dashboard">
                <div className="text-gray-300 hover:text-white text-sm font-medium flex items-center">
                  <Shield size={16} className="mr-1" />
                  Lumen Bio Client Portal
                </div>
              </Link>
            </div>
            <Link to="/lumen-bio/reports">
              <div className="text-gray-300 hover:text-white text-sm font-medium flex items-center">
                <Database size={16} className="mr-1" />
                Trial Reports
              </div>
            </Link>
            <Link to="/signup">
              <div className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors">
                Sign Up
              </div>
            </Link>
          </div>
        </div>
        
        {/* AI Modules in horizontal scrollable row */}
        <div className="py-4 overflow-x-auto">
          <div className="flex space-x-4 min-w-max">
            {packages.map((pkg, index) => (
              <AppPackagesTile
                key={index}
                icon={pkg.icon}
                title={pkg.title}
                description={pkg.description}
                to={pkg.to}
                highlight={currentPath && pkg.path && currentPath.startsWith(pkg.path)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}