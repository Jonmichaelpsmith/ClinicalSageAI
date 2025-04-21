// SolutionBundles.jsx - Organized solution packages with clear value propositions
import React from 'react';
import { Link } from 'wouter';
import { 
  FileArchive, 
  Database, 
  FileSymlink, 
  Folder, 
  BarChart2, 
  Beaker,
  Library,
  Shield,
  User,
  ChevronRight,
  Bot,
  BookOpen,
  ArrowRight
} from 'lucide-react';

const bundles = [
  {
    id: 'submission-accelerator',
    name: 'Submission Accelerator',
    audience: 'Regulatory teams filing INDs/NDAs/CTAs',
    modules: [
      { name: 'Submission Builder', description: 'eCTD assembly & regional validation', icon: <FileArchive className="w-5 h-5" /> },
      { name: 'IND Architect™', description: 'AI‑powered Module 1–5 creator', icon: <FileSymlink className="w-5 h-5" /> },
      { name: 'eCTD Manager', description: 'lifecycle tracking & publishing', icon: <Folder className="w-5 h-5" /> }
    ],
    value: 'File 60% faster with zero formatting errors and live compliance checks across FDA, EMA, PMDA, and more.',
    color: 'from-blue-600 to-blue-700'
  },
  {
    id: 'clinical-intelligence',
    name: 'Clinical Intelligence Suite',
    audience: 'Clinical ops & biostatisticians',
    modules: [
      { name: 'CSR Intelligence', description: 'deep‑learning CSR parsing & dashboards', icon: <Database className="w-5 h-5" /> },
      { name: 'Study Designer', description: 'model‑driven protocol simulation', icon: <BarChart2 className="w-5 h-5" /> },
      { name: 'Use Case Library', description: 'annotated case studies & templates', icon: <Library className="w-5 h-5" /> }
    ],
    value: 'See trial performance in real time, optimize your protocol up front, and benchmark against peer studies instantly.',
    color: 'from-emerald-600 to-emerald-700'
  },
  {
    id: 'report-review',
    name: 'Report & Review Toolkit',
    audience: 'Medical writers & safety/risk teams',
    modules: [
      { name: 'CER Generator', description: 'auto‑draft Clinical Evaluation Reports', icon: <Beaker className="w-5 h-5" /> },
      { name: 'Use Case Library', description: 'regulatory CER examples', icon: <Library className="w-5 h-5" /> },
      { name: 'Literature Review Guide*', description: 'systematic review workflows', icon: <BookOpen className="w-5 h-5" /> }
    ],
    value: 'Draft compliant reports in hours, with built‑in GSPR mapping, reference linking, and audit‑ready formatting.',
    color: 'from-purple-600 to-purple-700'
  },
  {
    id: 'enterprise-command',
    name: 'Enterprise Command Center',
    audience: 'CEOs, Partners, & IT integration leads',
    modules: [
      { name: 'Lumen Bio Portal', description: 'white‑label client dashboards', icon: <Shield className="w-5 h-5" /> },
      { name: 'Client Access', description: 'secure multi‑tenant login', icon: <User className="w-5 h-5" /> },
      { name: 'AI Co‑pilot', description: 'role‑based smart assistant', icon: <Bot className="w-5 h-5" /> }
    ],
    value: 'Unify your entire operation—centralize visibility, empower every team with on‑demand AI support, and scale securely.',
    color: 'from-amber-600 to-amber-700'
  }
];

export default function SolutionBundles() {
  return (
    <section className="py-16 bg-white" id="bundles">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="inline-flex mx-auto px-6 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            SOLUTION BUNDLES
          </h2>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Perfect Package</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our offerings are organized into four clear bundles, each tailored to specific roles and needs within your organization.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
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
              
              <div className="px-6 pb-6 mt-auto">
                <Link to={`/${bundle.id}`}>
                  <button className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                    Explore {bundle.name}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>*Note: "Literature Review Guide" is included as part of the CER module deliverables.</p>
        </div>
      </div>
    </section>
  );
}