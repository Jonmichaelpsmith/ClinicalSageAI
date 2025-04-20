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
    <div className={`flex flex-col h-full rounded-md border p-4 transition-all duration-200 hover:shadow-md hover:border-blue-400 ${highlight ? 'bg-blue-50 border-blue-400' : 'bg-white'}`}>
      <div className="flex items-center mb-2">
        <div className={`p-2 rounded-full ${highlight ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
          {icon}
        </div>
        <h3 className="text-lg font-medium ml-2">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
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
    <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100 border-b shadow-sm py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-3 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">TrialSage Platform</h2>
          <Link to="/">
            <div className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
              <Shield size={16} className="mr-1" />
              Admin Dashboard
            </div>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
  );
}