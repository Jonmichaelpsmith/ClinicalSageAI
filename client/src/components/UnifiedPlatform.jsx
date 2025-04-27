import React from 'react';
import { Link } from 'wouter';
import { 
  Database, 
  FileText, 
  Layers, 
  Flask, 
  ShieldCheck,
  BookOpenText,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useModuleIntegration } from './integration/ModuleIntegrationLayer';

const ModuleCard = ({ title, description, icon: Icon, path, color }) => {
  return (
    <Link href={path}>
      <a className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col h-full border border-gray-100">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm flex-grow">{description}</p>
        <div className="mt-4 flex items-center text-pink-600 text-sm font-medium">
          <span>Open Module</span>
          <ExternalLink size={16} className="ml-1" />
        </div>
      </a>
    </Link>
  );
};

const UnifiedPlatform = () => {
  const { user } = useAuth();
  const integration = useModuleIntegration();

  const modules = [
    {
      id: 'vault',
      title: 'TrialSage Vault™',
      description: 'Secure storage and management for all your clinical trial documents with advanced metadata tagging.',
      icon: Database,
      path: '/vault',
      color: 'bg-blue-600'
    },
    {
      id: 'csr',
      title: 'CSR Intelligence™',
      description: 'AI-powered analysis and extraction of insights from Clinical Study Reports.',
      icon: FileText,
      path: '/csr-intelligence',
      color: 'bg-purple-600'
    },
    {
      id: 'architect',
      title: 'Study Architect™',
      description: 'Design and optimize clinical study protocols with intelligent assistance.',
      icon: Layers,
      path: '/study-architect',
      color: 'bg-green-600'
    },
    {
      id: 'ind',
      title: 'IND Wizard™',
      description: 'Streamlined creation and submission of Investigational New Drug applications.',
      icon: Flask,
      path: '/ind-wizard',
      color: 'bg-pink-600'
    },
    {
      id: 'ich',
      title: 'ICH Wiz™',
      description: 'Digital compliance coach for ICH guidelines across global regulatory submissions.',
      icon: ShieldCheck,
      path: '/compliance',
      color: 'bg-orange-600'
    },
    {
      id: 'cmdr',
      title: 'Clinical Metadata Repository',
      description: 'Centralized management of study metadata for consistency across submissions.',
      icon: BookOpenText,
      path: '/cmdr',
      color: 'bg-teal-600'
    },
    {
      id: 'analytics',
      title: 'Analytics Module',
      description: 'Comprehensive insights across your regulatory and clinical operations.',
      icon: BarChart3,
      path: '/analytics',
      color: 'bg-indigo-600'
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <section className="mb-10">
        <div className="bg-black text-white rounded-lg p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-pink-400 to-purple-600"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome to TrialSage™, {user?.name || 'User'}</h1>
            <p className="text-xl text-gray-300 mb-6">
              AI-powered regulatory writing and document management platform
            </p>
            <div className="max-w-3xl">
              <p className="text-gray-300 mb-4">
                The integrated suite of tools for managing global regulatory submissions across FDA, EMA, PMDA, and NMPA markets.
                Our platform leverages AI to streamline document creation, management, and submission.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard">
                <a className="px-5 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors">
                  Go to Dashboard
                </a>
              </Link>
              <a 
                href="#modules" 
                className="px-5 py-2 bg-transparent border border-white text-white rounded-md hover:bg-white hover:text-black transition-colors"
              >
                Explore Modules
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="modules" className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Platform Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              title={module.title}
              description={module.description}
              icon={module.icon}
              path={module.path}
              color={module.color}
            />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="bg-gradient-to-r from-white to-pink-50 rounded-lg p-6 border border-pink-100">
          <h2 className="text-xl font-bold mb-4">Enhanced Security Features</h2>
          <p className="text-gray-700">
            Our platform utilizes blockchain technology for document verification and secure audit trails, 
            ensuring that all your regulatory documents maintain integrity throughout their lifecycle.
          </p>
        </div>
      </section>
    </div>
  );
};

export default UnifiedPlatform;