// SolutionTour.jsx - Comprehensive table showing all TrialSage modules and their capabilities
import React from 'react';

const modules = [
  {
    name: 'Submission Builder',
    description: 'Build & validate region‑specific eCTD submissions',
    features: [
      'Drag‑&‑drop eCTD assembly',
      'FDA/EMA/PMDA validation rules engine',
      'Error reporting & fix suggestions'
    ],
    benefits: 'Eliminates manual formatting errors, ensuring 100% compliance across global regions.'
  },
  {
    name: 'IND Architect™',
    description: 'Auto‑generate your entire IND dossier',
    features: [
      'AI‑powered Modules 1–5 writer',
      'Real‑time gap analysis',
      'FDA ESG SFTP integration'
    ],
    benefits: 'Cuts IND prep from 12 months to 5–7 months with zero guesswork and end‑to‑end audit trails.'
  },
  {
    name: 'CSR Intelligence',
    description: 'Parse, analyze, and dashboard Clinical Study Reports (CSRs)',
    features: [
      'Deep‑learning text extraction → JSON',
      'Safety/efficacy trend dashboards',
      'AI Q&A on any CSR data'
    ],
    benefits: 'Turns 500+ page static reports into live insights—spot safety signals weeks earlier.'
  },
  {
    name: 'eCTD Manager',
    description: 'Lifecycle tracking & publishing for all your submissions',
    features: [
      'Centralized status boards',
      'Version control & approval gating',
      'Automated publishing workflows'
    ],
    benefits: 'Gives you one source of truth for every submission, from draft → publish → archive.'
  },
  {
    name: 'Study Designer',
    description: 'Stat‑model driven protocol & statistical analysis planning',
    features: [
      'What‑if enrollment simulators',
      'Adaptive sample size calculators',
      'Comparator arm benchmarking'
    ],
    benefits: 'Optimize your study design up‑front—minimize amendments, control costs, maximize power.'
  },
  {
    name: 'CER Generator',
    description: 'Automated Clinical Evaluation Report drafting',
    features: [
      'MDR/IVDR CER templates',
      'GSPR & risk/benefit rationale',
      'Auto‑formatted references & citations'
    ],
    benefits: 'Produce audit‑ready CERs in hours—free up writers to focus on interpretation, not formatting.'
  },
  {
    name: 'Use Case Library',
    description: 'Central repository of regulatory case studies, templates, and best‑practice examples',
    features: [
      'Redacted IND/CER examples',
      'Annotated decision‑rationale',
      'Template downloads'
    ],
    benefits: 'Learn from 50+ real submissions—accelerate your own package build with proven patterns.'
  },
  {
    name: 'Lumen Bio Portal',
    description: 'White‑label client dashboards & reporting portal',
    features: [
      'Customizable KPI widgets',
      'Secure multi‑tenant login',
      'Exportable status snapshots'
    ],
    benefits: 'Impress stakeholders with up‑to‑the‑minute program metrics in your own branded portal.'
  },
  {
    name: 'Client Access',
    description: 'Role‑based permissions & secure data sharing',
    features: [
      'SSO & 2FA support',
      'Dynamic ACLs by role/phase',
      'Encrypted data at rest & in transit'
    ],
    benefits: 'Keep your data safe and your partners in sync—without building your own authentication stack.'
  },
  {
    name: 'AI Co‑pilot',
    description: 'Role‑based smart assistants embedded across the platform',
    features: [
      'Regulatory Q&A ("What\'s the latest IND status?")',
      'Writing suggestions',
      'Automated compliance alerts'
    ],
    benefits: 'Elevate every user—from CEO to writer—with on‑demand AI guidance tailored to their tasks.'
  }
];

export default function SolutionTour() {
  return (
    <section className="py-16 bg-gray-50" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="inline-flex mx-auto px-6 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            SOLUTION TOUR
          </h2>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How TrialSage Powers Every Stage of Your Submission & Trial</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform integrates every aspect of regulatory intelligence and submission management.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="py-4 px-6 text-left">Module</th>
                <th className="py-4 px-6 text-left">What It Does</th>
                <th className="py-4 px-6 text-left">Key Features</th>
                <th className="py-4 px-6 text-left">How It Helps</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((module, index) => (
                <tr 
                  key={index} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 hover:bg-blue-50 transition-colors`}
                >
                  <td className="py-4 px-6 font-semibold">{module.name}</td>
                  <td className="py-4 px-6">{module.description}</td>
                  <td className="py-4 px-6">
                    <ul className="list-disc pl-5 space-y-1">
                      {module.features.map((feature, idx) => (
                        <li key={idx} className="text-gray-700">{feature}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-4 px-6 text-gray-700">{module.benefits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-lg font-medium text-gray-700 flex items-center justify-center">
            <span>Next up: scroll down to pick the perfect bundle for your role</span>
            <span className="ml-2 text-blue-600">↓</span>
          </p>
        </div>
      </div>
    </section>
  );
}