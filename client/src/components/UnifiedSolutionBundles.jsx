// UnifiedSolutionBundles.jsx - Integrated solution bundles with demo tiles
import React from 'react';
import { Link } from 'wouter';
import { 
  ChevronRight,
  FileArchive, 
  FileSymlink, 
  Folder, 
  Database, 
  BarChart, 
  BarChart2,
  Library, 
  Beaker,
  BookOpen,
  Shield,
  User,
  Bot,
  ExternalLink,
  Layout,
  FileCheck
} from 'lucide-react';

// Define the bundles with all their information
const bundles = [
  {
    id: 'submission-accelerator',
    name: 'IND & NDA Submission Accelerator',
    audience: 'Regulatory teams filing INDs/NDAs/CTAs',
    description: 'Streamline regulatory submissions and ensure compliance',
    value: 'File 60% faster with zero formatting errors and live compliance checks across FDA, EMA, PMDA, and more.',
    color: 'blue',
    modules: [
      { 
        id: 'submission-builder',
        name: 'Submission Builder', 
        description: 'Build and validate eCTD submissions',
        icon: <FileArchive className="w-5 h-5 text-white" />,
        route: '/builder',
        detailText: 'eCTD assembly & regional validation'
      },
      { 
        id: 'ind-architect',
        name: 'IND Architect™', 
        description: 'Design and manage INDs',
        icon: <FileSymlink className="w-5 h-5 text-white" />,
        route: '/ind-architect',
        detailText: 'AI‑powered Module 1–5 creator'
      },
      { 
        id: 'ectd-manager',
        name: 'eCTD Manager', 
        description: 'Centralized eCTD lifecycle management',
        icon: <Folder className="w-5 h-5 text-white" />,
        route: '/portal/ind/planner',
        detailText: 'lifecycle tracking & publishing'
      },
      { 
        id: 'ind-full-solution',
        name: 'IND Full Solution', 
        description: 'End-to-end IND package templates',
        icon: <FileCheck className="w-5 h-5 text-white" />,
        route: '/ind-full-solution',
        detailText: 'Complete IND package templates'
      }
    ]
  },
  {
    id: 'clinical-intelligence',
    name: 'Global CSR Intelligent Library',
    audience: 'Clinical ops & biostatisticians',
    description: 'Data-driven clinical protocol design and optimization',
    value: 'See trial performance in real time, optimize your protocol up front, and benchmark against peer studies instantly.',
    color: 'emerald',
    modules: [
      { 
        id: 'csr-intelligence',
        name: 'CSR Intelligence', 
        description: 'Deep learning CSR analysis',
        icon: <Database className="w-5 h-5 text-white" />,
        route: '/csr-intelligence',
        detailText: 'deep‑learning CSR parsing & dashboards'
      },
      { 
        id: 'study-designer',
        name: 'Study Designer', 
        description: 'Statistical model-driven protocol design',
        icon: <BarChart2 className="w-5 h-5 text-white" />,
        route: '/study-designer',
        detailText: 'model‑driven protocol simulation' 
      },
      { 
        id: 'protocol-designer',
        name: 'Protocol Designer', 
        description: 'AI-optimized clinical protocols',
        icon: <BarChart className="w-5 h-5 text-white" />,
        route: '/protocol-designer',
        detailText: 'optimized clinical protocol creation'
      },
      { 
        id: 'use-case-library-clinical',
        name: 'Use Case Library', 
        description: 'Clinical trial case studies & templates',
        icon: <Library className="w-5 h-5 text-white" />,
        route: '/use-case-library?category=clinical',
        detailText: 'annotated case studies & templates'
      }
    ]
  },
  {
    id: 'report-review',
    name: 'Report & Review Toolkit',
    audience: 'Medical writers & safety/risk teams',
    description: 'Generate and manage clinical evaluation reports',
    value: 'Draft compliant reports in hours, with built‑in GSPR mapping, reference linking, and audit‑ready formatting.',
    color: 'rose',
    modules: [
      { 
        id: 'cer-generator',
        name: 'CER Generator', 
        description: 'Clinical evaluation reports',
        icon: <Beaker className="w-5 h-5 text-white" />,
        route: '/cer-generator',
        detailText: 'auto‑draft Clinical Evaluation Reports'
      },
      { 
        id: 'cer-intelligence',
        name: 'CER Intelligence Builder', 
        description: 'Enhanced clinical evaluation insights',
        icon: <FileSymlink className="w-5 h-5 text-white" />,
        route: '/cer-intelligence',
        detailText: 'AI-driven evaluation report builder'
      },
      { 
        id: 'report-templates',
        name: 'Report Templates', 
        description: 'Regulatory report examples',
        icon: <Layout className="w-5 h-5 text-white" />,
        route: '/use-case-library?category=reports',
        detailText: 'regulatory CER examples'
      },
      { 
        id: 'literature-review',
        name: 'Literature Review Guide', 
        description: 'Systematic review workflows',
        icon: <BookOpen className="w-5 h-5 text-white" />,
        route: '/literature-review',
        detailText: 'systematic review workflows'
      }
    ]
  },
  {
    id: 'enterprise-command',
    name: 'Enterprise Command Center',
    audience: 'CEOs, Partners, & IT integration leads',
    description: 'Centralized visibility and AI-powered assistance',
    value: 'Unify your entire operation—centralize visibility, empower every team with on‑demand AI support, and scale securely.',
    color: 'amber',
    modules: [
      { 
        id: 'lumen-bio-portal',
        name: 'Lumen Bio Portal', 
        description: 'Client dashboard & reports',
        icon: <Shield className="w-5 h-5 text-white" />,
        route: '/lumen-bio/dashboard',
        detailText: 'white‑label client dashboards'
      },
      { 
        id: 'client-access',
        name: 'Client Access', 
        description: 'Secure portal login',
        icon: <User className="w-5 h-5 text-white" />,
        route: '/client-portal',
        detailText: 'secure multi‑tenant login'
      },
      { 
        id: 'ai-copilot',
        name: 'AI Co-pilot', 
        description: 'Advanced AI assistance',
        icon: <Bot className="w-5 h-5 text-white" />,
        route: '/ai-agent',
        detailText: 'role‑based smart assistant'
      }
    ]
  }
];

// Get the appropriate background color class based on bundle color
const getBgColorClasses = (color, isHover = false) => {
  const colorMap = {
    blue: isHover ? 'bg-blue-700' : 'bg-blue-600',
    emerald: isHover ? 'bg-emerald-700' : 'bg-emerald-600',
    rose: isHover ? 'bg-rose-700' : 'bg-rose-600',
    amber: isHover ? 'bg-amber-700' : 'bg-amber-600'
  };
  return colorMap[color] || (isHover ? 'bg-gray-700' : 'bg-gray-600');
};

// Get the appropriate text color class based on bundle color
const getTextColorClass = (color) => {
  const colorMap = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    rose: 'text-rose-600',
    amber: 'text-amber-600'
  };
  return colorMap[color] || 'text-gray-600';
};

export default function UnifiedSolutionBundles() {
  return (
    <section className="py-16 bg-white" id="solutions">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="inline-flex mx-auto px-6 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            SOLUTION BUNDLES
          </h2>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Our Solutions</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our offerings are organized into four clear bundles, each tailored to specific roles and needs within your organization.
          </p>
        </div>
        
        <div className="space-y-16">
          {bundles.map((bundle) => (
            <div key={bundle.id} className="space-y-8">
              {/* Bundle Header with Description */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="md:w-2/5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  <div className={`bg-gradient-to-r from-${bundle.color}-600 to-${bundle.color}-700 p-6 text-white`}>
                    <h3 className="text-2xl font-bold mb-2">{bundle.name}</h3>
                    <p className="text-white/80 font-medium">{bundle.audience}</p>
                  </div>
                  
                  <div className="p-6">
                    <h4 className="text-gray-700 font-medium mb-4">Key Value:</h4>
                    <p className="text-gray-600 mb-6">{bundle.value}</p>
                    
                    <Link to={`/${bundle.id}`}>
                      <button className={`flex items-center justify-center w-full ${getBgColorClasses(bundle.color)} hover:${getBgColorClasses(bundle.color, true)} text-white font-medium py-3 px-4 rounded-lg transition-colors`}>
                        Explore {bundle.name}
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
                
                <div className="md:w-3/5 space-y-2">
                  <h3 className={`text-xl font-bold ${getTextColorClass(bundle.color)} mb-1`}>
                    Module Demo Environment
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Access interactive demos of each module in the {bundle.name} bundle.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bundle.modules.map((module) => (
                      <Link key={module.id} href={module.route}>
                        <div className={`${getBgColorClasses(bundle.color)} rounded-xl p-5 cursor-pointer shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:${getBgColorClasses(bundle.color, true)}`}>
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                              {module.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-white">{module.name}</h4>
                              <p className="text-white/80 text-sm">{module.description}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/70" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link to="/demo" className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors">
            Schedule Full Demo <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </div>
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>*Note: "Literature Review Guide" is included as part of the CER module deliverables.</p>
        </div>
      </div>
    </section>
  );
}