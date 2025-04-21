// IntegratedSolutionBundles.jsx - Unified component that combines bundle information with interactive demo tiles
import React, { useState } from 'react';
import { Link } from 'wouter';
import { ChevronRight, ArrowRight, ExternalLink } from 'lucide-react';
import {
  FileArchive,
  FileSymlink,
  Folder,
  Database,
  BarChart2,
  Library,
  FileText,
  Beaker,
  BookOpen,
  Shield,
  User,
  Bot,
  FileCheck,
  Layout
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define bundles with their content and demo tiles
const bundles = [
  {
    id: 'submission-accelerator',
    name: 'IND & NDA Submission Accelerator',
    audience: 'Regulatory teams filing INDs/NDAs/CTAs',
    modules: [
      { 
        id: 'submission-builder', 
        name: 'Submission Builder', 
        description: 'eCTD assembly & regional validation', 
        shortDescription: 'Build and validate submissions',
        icon: <FileArchive className="w-5 h-5" />,
        route: '/builder',
        color: 'bg-blue-600 hover:bg-blue-700'
      },
      { 
        id: 'ind-architect', 
        name: 'IND Architect™', 
        description: 'AI‑powered Module 1–5 creator', 
        shortDescription: 'Design and manage INDs',
        icon: <FileSymlink className="w-5 h-5" />,
        route: '/ind-architect',
        color: 'bg-violet-600 hover:bg-violet-700'
      },
      { 
        id: 'ectd-manager', 
        name: 'eCTD Manager', 
        description: 'lifecycle tracking & publishing', 
        shortDescription: 'Centralized eCTD lifecycle management',
        icon: <Folder className="w-5 h-5" />,
        route: '/portal/ind/planner',
        color: 'bg-blue-500 hover:bg-blue-600'
      },
      { 
        id: 'ind-full-solution', 
        name: 'IND Full Solution', 
        description: 'end-to-end IND package templates', 
        shortDescription: 'End-to-end IND package templates',
        icon: <FileCheck className="w-5 h-5" />,
        route: '/ind-full-solution',
        color: 'bg-blue-700 hover:bg-blue-800'
      }
    ],
    value: 'File 60% faster with zero formatting errors and live compliance checks across FDA, EMA, PMDA, and more.',
    color: 'from-blue-600 to-blue-700',
    accentColor: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'clinical-intelligence',
    name: 'Global CSR Intelligent Library',
    audience: 'Clinical ops & biostatisticians',
    modules: [
      { 
        id: 'csr-intelligence', 
        name: 'CSR Intelligence', 
        description: 'deep‑learning CSR parsing & dashboards', 
        shortDescription: 'CSR analysis and optimization',
        icon: <Database className="w-5 h-5" />,
        route: '/csr-intelligence',
        color: 'bg-emerald-600 hover:bg-emerald-700'
      },
      { 
        id: 'study-designer', 
        name: 'Study Designer', 
        description: 'model‑driven protocol simulation', 
        shortDescription: 'Statistical model-driven protocol design',
        icon: <BarChart2 className="w-5 h-5" />,
        route: '/study-designer',
        color: 'bg-emerald-700 hover:bg-emerald-800'
      },
      { 
        id: 'protocol-designer', 
        name: 'Protocol Designer', 
        description: 'optimized clinical protocol creation', 
        shortDescription: 'Create optimized clinical protocols',
        icon: <Library className="w-5 h-5" />,
        route: '/protocol-designer',
        color: 'bg-teal-600 hover:bg-teal-700'
      }
    ],
    value: 'See trial performance in real time, optimize your protocol up front, and benchmark against peer studies instantly.',
    color: 'from-emerald-600 to-emerald-700',
    accentColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  {
    id: 'report-review',
    name: 'Report & Review Toolkit',
    audience: 'Medical writers & safety/risk teams',
    modules: [
      { 
        id: 'cer-generator', 
        name: 'CER Generator', 
        description: 'auto‑draft Clinical Evaluation Reports', 
        shortDescription: 'Clinical evaluation reports',
        icon: <Beaker className="w-5 h-5" />,
        route: '/cer-generator',
        color: 'bg-red-600 hover:bg-red-700'
      },
      { 
        id: 'cer-intelligence', 
        name: 'CER Intelligence Builder', 
        description: 'enhanced clinical evaluation builder', 
        shortDescription: 'Enhanced evaluation building',
        icon: <FileText className="w-5 h-5" />,
        route: '/cer-intelligence',
        color: 'bg-red-500 hover:bg-red-600'
      },
      { 
        id: 'literature-review', 
        name: 'Literature Review Guide*', 
        description: 'systematic review workflows', 
        shortDescription: 'Systematic literature review',
        icon: <BookOpen className="w-5 h-5" />,
        route: '/literature-review',
        color: 'bg-rose-600 hover:bg-rose-700'
      }
    ],
    value: 'Draft compliant reports in hours, with built‑in GSPR mapping, reference linking, and audit‑ready formatting.',
    color: 'from-purple-600 to-purple-700',
    accentColor: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'enterprise-command',
    name: 'Enterprise Command Center',
    audience: 'CEOs, Partners, & IT integration leads',
    modules: [
      { 
        id: 'lumen-bio-portal', 
        name: 'Lumen Bio Portal', 
        description: 'white‑label client dashboards', 
        shortDescription: 'Client dashboard & reports',
        icon: <Shield className="w-5 h-5" />,
        route: '/lumen-bio/dashboard',
        color: 'bg-amber-600 hover:bg-amber-700'
      },
      { 
        id: 'client-access', 
        name: 'Client Access', 
        description: 'secure multi‑tenant login', 
        shortDescription: 'Secure portal login',
        icon: <User className="w-5 h-5" />,
        route: '/client-portal',
        color: 'bg-rose-600 hover:bg-rose-700'
      },
      { 
        id: 'ai-copilot', 
        name: 'AI Co‑pilot', 
        description: 'role‑based smart assistant', 
        shortDescription: 'Advanced AI assistance',
        icon: <Bot className="w-5 h-5" />,
        route: '/ai-agent',
        color: 'bg-purple-600 hover:bg-purple-700'
      }
    ],
    value: 'Unify your entire operation—centralize visibility, empower every team with on‑demand AI support, and scale securely.',
    color: 'from-amber-600 to-amber-700',
    accentColor: 'text-amber-600',
    bgColor: 'bg-amber-50'
  }
];

export default function IntegratedSolutionBundles() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <section className="py-16 bg-white" id="solutions">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="inline-flex mx-auto px-6 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            TRIALSAGE SOLUTIONS
          </h2>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Regulatory Intelligence Platform</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our modular solutions are tailored to specific roles and needs in your organization.
            Select a bundle or explore individual modules below.
          </p>
        </div>
        
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="overview">Bundle Overview</TabsTrigger>
              <TabsTrigger value="modules">Explore Modules</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Bundle Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {bundles.map((bundle) => (
                <div key={bundle.id} className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className={`bg-gradient-to-r ${bundle.color} p-6 text-white`}>
                    <h3 className="text-2xl font-bold mb-2">{bundle.name}</h3>
                    <p className="text-white/80 font-medium">{bundle.audience}</p>
                  </div>
                  
                  <div className="p-6 flex-grow">
                    <h4 className="text-gray-700 font-medium mb-4">Includes:</h4>
                    <ul className="space-y-3 mb-6">
                      {bundle.modules.map((module, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className="flex-shrink-0 mt-1 bg-blue-100 p-1.5 rounded-full text-blue-600">
                            {module.icon}
                          </div>
                          <div className="ml-3">
                            <span className="text-gray-800 font-medium">{module.name}</span>
                            <span className="text-gray-500 text-sm block">({module.description})</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                      <h4 className="text-gray-700 font-medium mb-2">Key Value:</h4>
                      <p className="text-gray-600">{bundle.value}</p>
                    </div>
                  </div>
                  
                  <div className="flex p-4 mt-auto border-t border-gray-100">
                    <button 
                      onClick={() => setActiveTab("modules")}
                      className="flex-1 flex items-center justify-center text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Explore Modules
                    </button>
                    <Link to={`/${bundle.id}`} className="flex-1 ml-3">
                      <button className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Learn More
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center text-gray-500 text-sm">
              <p>*Note: "Literature Review Guide" is included as part of the CER module deliverables.</p>
            </div>
          </TabsContent>
          
          {/* Modules Tab */}
          <TabsContent value="modules">
            <div className="space-y-16">
              {bundles.map((bundle) => (
                <div key={bundle.id} className={`p-8 ${bundle.bgColor} rounded-xl`}>
                  <div className="space-y-6">
                    <div className="border-b border-gray-200/50 pb-2">
                      <h3 className={`text-2xl font-bold ${bundle.accentColor}`}>
                        {bundle.name}
                      </h3>
                      <p className="text-gray-600">{bundle.audience}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {bundle.modules.map((module) => (
                        <Link key={module.id} href={module.route}>
                          <div className={`${module.color} rounded-xl p-6 cursor-pointer shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02]`}>
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                                {module.icon}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-white">{module.name}</h4>
                                <p className="text-white/80">{module.shortDescription}</p>
                              </div>
                              <ChevronRight className="w-6 h-6 text-white/70" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/demo" className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors">
                Schedule Guided Demo <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}