import React from 'react';
import { Link } from 'wouter';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  Rocket, 
  RefreshCw, 
  Table, 
  Lightbulb, 
  Folder 
} from 'lucide-react';

// Main landing page layout
function Layout({ children }) {
  return (
    <div className="bg-white min-h-screen">
      <header className="bg-[#003057] text-white py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="font-bold text-xl">CONCEPT2CURE.AI</span>
            <span className="ml-2 text-sm opacity-80">TrialSage</span>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li><Link href="#" className="text-sm hover:text-gray-300">SOLUTIONS</Link></li>
              <li><Link href="#" className="text-sm hover:text-gray-300">NEWS</Link></li>
              <li><Link href="#" className="text-sm hover:text-gray-300">RESOURCES</Link></li>
              <li><Link href="#" className="text-sm hover:text-gray-300">CONTACT</Link></li>
            </ul>
          </nav>
        </div>
      </header>
      <main>
        {children}
      </main>
      <footer className="bg-[#003057] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-300 text-sm">© 2025 CONCEPT2CURE.AI. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-300 hover:text-white text-sm">Privacy Policy</Link>
              <Link href="#" className="text-gray-300 hover:text-white text-sm">Terms of Service</Link>
              <Link href="#" className="text-gray-300 hover:text-white text-sm">Compliance</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Solutions Grid Component
function SolutionsGrid() {
  const solutions = [
    {
      title: 'CSR Intelligence',
      description: 'Semantic NLP to mine safety signals, compare endpoints, and auto-summarize CSRs.',
      icon: FileText,
      color: 'green'
    },
    {
      title: 'IND Accelerator',
      description: 'Protocol-to-Module 2 & 5 wizards with one-click eCTD packaging.',
      icon: Rocket,
      color: 'blue'
    },
    {
      title: 'RegIntel Validator',
      description: 'Zero-install SDTM/ADaM validation with GPT-4 explanations & auto-fix.',
      icon: RefreshCw,
      color: 'indigo'
    },
    {
      title: 'CMC Blueprint',
      description: 'ICH Module 3 generator from process inputs with global change impact simulation.',
      icon: Table,
      color: 'purple'
    },
    {
      title: 'CER Composer',
      description: 'AI-draft Clinical Evaluation Reports with MedDRA & LOINC validation.',
      icon: Lightbulb,
      color: 'yellow'
    },
    {
      title: 'Vault Workspace',
      description: 'Microsoft-style explorer with version history, audit trails & DocuShare sync.',
      icon: Folder,
      color: 'orange'
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
        Comprehensive AI-Driven Solutions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {solutions.map(({ title, description, icon: Icon, color }) => (
          <div
            key={title}
            className="relative group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-full"
          >
            {/* Front of card */}
            <div className="p-6 flex flex-col items-center justify-center h-full">
              <Icon className={`text-green-500 group-hover:text-blue-600 w-12 h-12 transition-colors`} />
              <h3 className="mt-4 text-xl font-semibold text-gray-900 group-hover:text-blue-600 text-center">
                {title}
              </h3>
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-green-400 to-blue-500 opacity-0 group-hover:opacity-95 transition-opacity flex items-center justify-center p-6 text-center">
              <p className="text-white text-sm leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Comparison Table Component
function ComparisonTable() {
  const comps = [
    {
      feature: 'Installation Required',
      manual: <XCircle className="text-red-500 inline w-5 h-5" />,
      veeva: <XCircle className="text-red-500 inline w-5 h-5" />,
      certara: <XCircle className="text-red-500 inline w-5 h-5" />,
      pinnacle: <XCircle className="text-red-500 inline w-5 h-5" />,
      trialsage: <CheckCircle className="text-green-600 inline w-5 h-5" />,
    },
    {
      feature: 'AI-Powered Explanations',
      manual: <XCircle className="text-gray-400 inline w-5 h-5" />,
      veeva: <XCircle className="text-gray-400 inline w-5 h-5" />,
      certara: <XCircle className="text-gray-400 inline w-5 h-5" />,
      pinnacle: <XCircle className="text-gray-400 inline w-5 h-5" />,
      trialsage: <CheckCircle className="text-green-600 inline w-5 h-5" />,
    },
    {
      feature: 'SaaS-Native Multitenant',
      manual: <XCircle className="text-gray-400 inline w-5 h-5" />,
      veeva: <CheckCircle className="text-green-600 inline w-5 h-5" />,
      certara: <XCircle className="text-gray-400 inline w-5 h-5" />,
      pinnacle: <XCircle className="text-gray-400 inline w-5 h-5" />,
      trialsage: <CheckCircle className="text-green-600 inline w-5 h-5" />,
    },
    {
      feature: 'Integrated Workflow',
      manual: <XCircle className="text-gray-400 inline w-5 h-5" />,
      veeva: <CheckCircle className="text-green-600 inline w-5 h-5" />,
      certara: <XCircle className="text-gray-400 inline w-5 h-5" />,
      pinnacle: <XCircle className="text-gray-400 inline w-5 h-5" />,
      trialsage: <CheckCircle className="text-green-600 inline w-5 h-5" />,
    },
    {
      feature: 'Define.xml Auto-Generation',
      manual: <XCircle className="text-gray-400 inline w-5 h-5" />,
      veeva: <XCircle className="text-gray-400 inline w-5 h-5" />,
      certara: <XCircle className="text-gray-400 inline w-5 h-5" />,
      pinnacle: <XCircle className="text-gray-400 inline w-5 h-5" />,
      trialsage: <CheckCircle className="text-green-600 inline w-5 h-5" />,
    },
    {
      feature: 'Zero-Install Validation',
      manual: <XCircle className="text-gray-400 inline w-5 h-5" />,
      veeva: <XCircle className="text-gray-400 inline w-5 h-5" />,
      certara: <XCircle className="text-gray-400 inline w-5 h-5" />,
      pinnacle: <CheckCircle className="text-green-600 inline w-5 h-5" />,
      trialsage: <CheckCircle className="text-green-600 inline w-5 h-5" />,
    },
    {
      feature: 'AI Auto-Fix',
      manual: <XCircle className="text-gray-400 inline w-5 h-5" />,
      veeva: <XCircle className="text-gray-400 inline w-5 h-5" />,
      certara: <XCircle className="text-gray-400 inline w-5 h-5" />,
      pinnacle: <XCircle className="text-gray-400 inline w-5 h-5" />,
      trialsage: <CheckCircle className="text-green-600 inline w-5 h-5" />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 overflow-x-auto">
      <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
        TrialSage vs. The Rest
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-green-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Feature</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Manual</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Veeva</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Certara</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Pinnacle21</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">TrialSage</th>
            </tr>
          </thead>
          <tbody>
            {comps.map(({ feature, manual, veeva, certara, pinnacle, trialsage }) => (
              <tr key={feature} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">{feature}</td>
                <td className="px-6 py-4 text-center">{manual}</td>
                <td className="px-6 py-4 text-center">{veeva}</td>
                <td className="px-6 py-4 text-center">{certara}</td>
                <td className="px-6 py-4 text-center">{pinnacle}</td>
                <td className="px-6 py-4 text-center">{trialsage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main Page Export
export default function StagingLandingPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-5xl font-extrabold text-blue-900">
            TrialSage™
            <br />
            <span className="text-green-600">AI-Powered Regulatory Intelligence</span>
          </h1>
          <p className="mt-4 text-xl text-gray-700">
            From Protocol to Approval—Unify CSR, CMC, CER, IND, and Submission Workflows in One Secure SaaS Platform.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#demo"
              className="px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow hover:from-green-300 hover:to-blue-400 transition"
            >
              Request a Demo
            </a>
            <a
              href="#features"
              className="px-6 py-3 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Solutions Grid Component */}
      <SolutionsGrid />

      {/* Comparison Table Component */}
      <ComparisonTable />
    </Layout>
  );
}