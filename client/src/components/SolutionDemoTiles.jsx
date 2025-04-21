// SolutionDemoTiles.jsx - Interactive demo access tiles organized by solution bundles
import React from 'react';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';
import { 
  FileArchive, 
  FileSymlink, 
  Folder, 
  Database, 
  BarChart, 
  Library, 
  FileText,
  Shield,
  User,
  Bot,
  BarChart2,
  ExternalLink,
  Layout,
  FileCheck
} from 'lucide-react';

// Define module tiles with their routes, descriptions, and visual styling
const moduleTiles = [
  // Submission Accelerator Bundle
  {
    id: 'submission-builder',
    name: 'Submission Builder',
    description: 'Build and validate submissions',
    icon: <FileArchive className="w-5 h-5 text-white" />,
    route: '/builder',
    color: 'bg-blue-600 hover:bg-blue-700',
    bundle: 'submission-accelerator'
  },
  {
    id: 'ind-architect',
    name: 'IND Architect',
    description: 'Design and manage INDs',
    icon: <FileSymlink className="w-5 h-5 text-white" />,
    route: '/ind-architect',
    color: 'bg-violet-600 hover:bg-violet-700',
    bundle: 'submission-accelerator'
  },
  {
    id: 'ectd-manager',
    name: 'eCTD Manager',
    description: 'Centralized eCTD lifecycle management',
    icon: <Folder className="w-5 h-5 text-white" />,
    route: '/portal/ind/planner',
    color: 'bg-blue-500 hover:bg-blue-600',
    bundle: 'submission-accelerator'
  },
  {
    id: 'ind-full-solution',
    name: 'IND Full Solution',
    description: 'End-to-end IND package templates',
    icon: <FileCheck className="w-5 h-5 text-white" />,
    route: '/ind-full-solution',
    color: 'bg-blue-700 hover:bg-blue-800',
    bundle: 'submission-accelerator'
  },
  
  // Clinical Intelligence Suite Bundle
  {
    id: 'csr-intelligence',
    name: 'CSR Intelligence',
    description: 'CSR analysis and optimization',
    icon: <Database className="w-5 h-5 text-white" />,
    route: '/csr-intelligence',
    color: 'bg-emerald-600 hover:bg-emerald-700',
    bundle: 'clinical-intelligence'
  },
  {
    id: 'study-designer',
    name: 'Study Designer',
    description: 'Statistical model-driven protocol design',
    icon: <BarChart className="w-5 h-5 text-white" />,
    route: '/study-designer',
    color: 'bg-emerald-700 hover:bg-emerald-800',
    bundle: 'clinical-intelligence'
  },
  {
    id: 'use-case-library',
    name: 'Use Case Library',
    description: 'Regulatory case studies & templates',
    icon: <Library className="w-5 h-5 text-white" />,
    route: '/use-case-library',
    color: 'bg-teal-600 hover:bg-teal-700',
    bundle: 'clinical-intelligence'
  },
  
  // Report & Review Toolkit Bundle
  {
    id: 'cer-generator',
    name: 'CER Module',
    description: 'Clinical evaluation reports',
    icon: <FileText className="w-5 h-5 text-white" />,
    route: '/cer-generator',
    color: 'bg-red-600 hover:bg-red-700',
    bundle: 'report-review'
  },
  {
    id: 'report-templates',
    name: 'Report Templates',
    description: 'Regulatory report examples',
    icon: <Layout className="w-5 h-5 text-white" />,
    route: '/use-case-library?category=reports',
    color: 'bg-red-500 hover:bg-red-600',
    bundle: 'report-review'
  },
  
  // Enterprise Command Center Bundle
  {
    id: 'lumen-bio-portal',
    name: 'Lumen Bio Portal',
    description: 'Client dashboard & reports',
    icon: <Shield className="w-5 h-5 text-white" />,
    route: '/lumen-bio/dashboard',
    color: 'bg-amber-600 hover:bg-amber-700',
    bundle: 'enterprise-command'
  },
  {
    id: 'client-access',
    name: 'Client Access',
    description: 'Secure portal login',
    icon: <User className="w-5 h-5 text-white" />,
    route: '/client-portal',
    color: 'bg-rose-600 hover:bg-rose-700',
    bundle: 'enterprise-command'
  },
  {
    id: 'ai-copilot',
    name: 'AI Co-pilot',
    description: 'Advanced AI assistance',
    icon: <Bot className="w-5 h-5 text-white" />,
    route: '/ai-agent',
    color: 'bg-purple-600 hover:bg-purple-700',
    bundle: 'enterprise-command'
  }
];

// Define bundles with their colors and titles
const bundles = [
  {
    id: 'submission-accelerator',
    name: 'IND & NDA Submission Accelerator',
    color: 'text-blue-600',
    description: 'Access demo environments for regulatory submission tools',
  },
  {
    id: 'clinical-intelligence',
    name: 'Global CSR Intelligent Library',
    color: 'text-emerald-600',
    description: 'Explore clinical protocol design and optimization',
  },
  {
    id: 'report-review',
    name: 'Report & Review Toolkit',
    color: 'text-red-600',
    description: 'Generate and manage clinical evaluation reports',
  },
  {
    id: 'enterprise-command',
    name: 'Enterprise Command Center',
    color: 'text-amber-600',
    description: 'Centralized dashboard and AI-powered assistance',
  }
];

export default function SolutionDemoTiles() {
  // Group the tiles by bundle
  const tilesByBundle = bundles.map(bundle => {
    const bundleTiles = moduleTiles.filter(tile => tile.bundle === bundle.id);
    return {
      ...bundle,
      tiles: bundleTiles
    };
  });

  return (
    <section className="py-16 bg-slate-50" id="demo-environments">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="inline-flex mx-auto px-6 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            DEMO ENVIRONMENTS
          </h2>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Module Demos</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore interactive demos of each module organized by solution bundle.
          </p>
        </div>
        
        <div className="space-y-16">
          {tilesByBundle.map((bundle) => (
            <div key={bundle.id} className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h3 className={`text-2xl font-bold ${bundle.color}`}>
                  {bundle.name}
                </h3>
                <p className="text-gray-600">{bundle.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bundle.tiles.map((tile) => (
                  <Link key={tile.id} href={tile.route}>
                    <div className={`${tile.color} rounded-xl p-6 cursor-pointer shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02]`}>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                          {tile.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-white">{tile.name}</h4>
                          <p className="text-white/80">{tile.description}</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-white/70" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link to="/demo" className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors">
            Schedule Guided Demo <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}