// SimpleSolutionBundles.jsx - A streamlined bundle + demo component
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
  Beaker,
  BookOpen,
  Shield,
  User,
  Bot,
  Layout,
  FileCheck
} from 'lucide-react';

const bundles = [
  {
    id: 'ind-nda',
    name: 'IND & NDA Submission Accelerator',
    audience: 'Regulatory teams filing INDs/NDAs/CTAs',
    description: 'File 60% faster with zero formatting errors and live compliance checks across FDA, EMA, PMDA, and more.',
    color: 'blue',
    modules: [
      {
        id: 'submission-builder',
        name: 'Submission Builder',
        description: 'Build and validate eCTD submissions',
        icon: <FileArchive />,
        route: '/builder',
        bgColor: 'bg-blue-600'
      },
      {
        id: 'ind-architect',
        name: 'IND Architect™',
        description: 'Design and manage INDs',
        icon: <FileSymlink />,
        route: '/ind-architect',
        bgColor: 'bg-blue-700'
      },
      {
        id: 'ectd-manager',
        name: 'eCTD Manager',
        description: 'Centralized eCTD lifecycle management',
        icon: <Folder />,
        route: '/ectd-manager',
        bgColor: 'bg-blue-600'
      },
      {
        id: 'ind-full-solution',
        name: 'IND Full Solution',
        description: 'End-to-end IND package templates',
        icon: <FileCheck />,
        route: '/ind-full-solution',
        bgColor: 'bg-blue-800'
      }
    ]
  },
  {
    id: 'csr-intel',
    name: 'Global CSR Intelligent Library',
    audience: 'Clinical ops & biostatisticians',
    description: 'See trial performance in real time, optimize your protocol up front, and benchmark against peer studies instantly.',
    color: 'emerald',
    modules: [
      {
        id: 'csr-intelligence',
        name: 'CSR Intelligence',
        description: 'CSR analysis and optimization',
        icon: <Database />,
        route: '/csr-intelligence',
        bgColor: 'bg-emerald-600'
      },
      {
        id: 'study-designer',
        name: 'Study Designer',
        description: 'Statistical model-driven protocol design',
        icon: <BarChart />,
        route: '/study-designer',
        bgColor: 'bg-emerald-700'
      },
      {
        id: 'protocol-designer',
        name: 'Protocol Designer',
        description: 'Create optimized clinical protocols',
        icon: <FileSymlink />,
        route: '/protocol-designer',
        bgColor: 'bg-emerald-600'
      },
      {
        id: 'use-case-library',
        name: 'Use Case Library',
        description: 'Regulatory case studies & templates',
        icon: <Library />,
        route: '/use-case-library',
        bgColor: 'bg-emerald-600'
      }
    ]
  },
  {
    id: 'report-review',
    name: 'Report & Review Toolkit',
    audience: 'Medical writers & safety/risk teams',
    description: 'Draft compliant reports in hours, with built‑in GSPR mapping, reference linking, and audit‑ready formatting.',
    color: 'rose',
    modules: [
      {
        id: 'cer-generator',
        name: 'CER Generator',
        description: 'Clinical evaluation reports',
        icon: <Beaker />,
        route: '/cer-generator',
        bgColor: 'bg-rose-600'
      },
      {
        id: 'cer-intelligence',
        name: 'CER Intelligence Builder',
        description: 'Enhanced clinical evaluation building',
        icon: <FileText />,
        route: '/cer-intelligence',
        bgColor: 'bg-rose-600'
      },
      {
        id: 'report-templates',
        name: 'Report Templates',
        description: 'Regulatory report examples',
        icon: <Layout />,
        route: '/report-templates',
        bgColor: 'bg-rose-600'
      },
      {
        id: 'literature-review',
        name: 'Literature Review Guide',
        description: 'Systematic literature review',
        icon: <BookOpen />,
        route: '/literature-review',
        bgColor: 'bg-rose-600'
      }
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Command Center',
    audience: 'CEOs, Partners, & IT integration leads',
    description: 'Unify your entire operation—centralize visibility, empower every team with on‑demand AI support, and scale securely.',
    color: 'amber',
    modules: [
      {
        id: 'client-access',
        name: 'Client Access',
        description: 'Secure portal login',
        icon: <User />,
        route: '/client-access',
        bgColor: 'bg-amber-600'
      },
      {
        id: 'ai-copilot',
        name: 'AI Co-pilot',
        description: 'Advanced AI assistance',
        icon: <Bot />,
        route: '/ai-copilot',
        bgColor: 'bg-amber-600'
      },
      {
        id: 'regulatory-dashboard',
        name: 'Regulatory Dashboard',
        description: 'Program lifecycle overview',
        icon: <Layout />,
        route: '/regulatory-dashboard',
        bgColor: 'bg-amber-600'
      }
    ]
  }
];

export default function SimpleSolutionBundles() {
  return (
    <section className="py-10 bg-white" id="solution-bundles">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 solution-bundle-header" data-tour="solution-header">
          <span className="inline-flex mx-auto px-4 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium mb-2">
            SOLUTION BUNDLES
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Regulatory Intelligence Platform</h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Four specialized bundles tailored to your organization's regulatory and clinical needs
          </p>
        </div>
        
        <div className="space-y-8">
          {bundles.map((bundle) => (
            <div key={bundle.id} className={`mb-8 ${bundle.id}-section`} data-tour={`bundle-${bundle.id}`}>
              <div className={`rounded-lg shadow-sm p-4 mb-4 bg-${bundle.color}-50 border border-${bundle.color}-100`}>
                <h3 className={`text-lg font-bold text-${bundle.color}-700 mb-1`}>{bundle.name}</h3>
                <div className="flex flex-wrap text-sm">
                  <span className="text-gray-600 mr-1"><strong>For:</strong> {bundle.audience} |</span>
                  <span className="text-gray-700"><strong>Value:</strong> {bundle.description}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {bundle.modules.map((module) => (
                  <Link key={module.id} href={module.route}>
                    <div className={`${module.bgColor} text-white p-3 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer h-full`}>
                      <div className="flex items-center">
                        <div className="bg-white/20 p-1.5 rounded-full mr-2">
                          {React.cloneElement(module.icon, { size: 14 })}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{module.name}</div>
                          <div className="text-xs text-white/80">{module.description}</div>
                        </div>
                        <ChevronRight size={14} className="text-white/60" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}