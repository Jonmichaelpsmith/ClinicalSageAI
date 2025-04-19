// HomeLanding.jsx – Concepts2Cures.AI rebrand (TrialSage platform)
// Tailwind + i18n + dark‑mode ready

import React, { useState } from "react";
import { Link } from "../stub-router-dom";
import { PlayCircle, ArrowRight, LogIn, UserPlus, BarChart2, Brain, User, Users, Microscope, FileText, Beaker, TrendingUp, Building2, LineChart, Briefcase } from "lucide-react";
import { useTranslation } from "../i18n";
// Import i18n to initialize it
import "../i18n";
import RegulatoryConfidenceStrip from "../components/RegulatoryConfidenceStrip";
import IntelligenceCounter from "../components/IntelligenceCounter";

export default function HomeLanding() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const [selectedPersona, setSelectedPersona] = useState(null);

  const Button = ({ to, children, variant = "primary", external = false }) => {
    const base = "px-5 py-2.5 rounded-lg inline-flex items-center gap-2 text-sm sm:text-base font-medium transition focus:outline-none";
    const classes = {
      primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow focus:ring-2 focus:ring-emerald-400",
      ghost: "bg-white dark:bg-slate-900/20 border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-900/50",
    }[variant];
    if (external) return <a href={to} className={`${base} ${classes}`} target="_blank" rel="noreferrer noopener">{children}</a>;
    return <Link to={to} className={`${base} ${classes}`}>{children}</Link>;
  };

  /* ——————————————————— Data */
  const featureBanner = [
    t('Deep‑Learning CER Narratives'),
    t('Full IND Builder & Validator'),
    t('eCTD One‑Click ESG Send'),
    t('Real‑Time Risk Dashboards'),
    t('Benchling & FAERS Connectors'),
    t('Conversational Reg‑Affairs Agent'),
  ];

  const products = [
    { color:'sky',    tag:'CSR Deep‑Intel',  title:t('CSR Intelligence'), desc:t('3 000+ machine‑read CSRs with comparator & endpoint analytics.'), link:'/csr-library' },
    { color:'emerald', tag:'CER AI',          title:t('CER Generator'),   desc:t('EU MDR 2/7‑1 Word/PDF with auto FAERS trend graphs.'), link:'/cer-dashboard' },
    { color:'violet',  tag:'IND Suite',       title:t('IND Automation'),  desc:t('Module 1–5 builder, GPT‑4 Module 2, eCTD packaging, ESG push.'), link:'/ind-automation' },
    { color:'purple',  tag:'AI Assistant',    title:t('TrialSage CSR Assistant'), desc:t('Conversational agent with specialized medical writing and regulatory affairs expertise.'), link:'/assistant' },
    { color:'teal',    tag:'Ops IQ',          title:t('KPI Analytics'),   desc:t('Drag‑and‑drop SQL widgets, alert routing, weekly PDFs.'), link:'/dashboard#kpi' },
  ];

  const competitorRows = [
    ['TrialSage',          '✅', '✅', '✅', 'Auto',     '$'],
    ['Cortellis / Cortera','⚠️ manual', '✅', '—',    '—',       '$$$$'],
    ['Phlexglobal',        '⚠️ add‑on', '✅', '—',    '—',       '$$$'],
    ['Traditional CRO',    '—', '—', '—', '—', '$$$$$'],
  ];
  
  const personas = [
    { 
      id: 'ceo',
      title: t('Biotech CEOs'),
      icon: <Building2 size={24} />,
      description: t('Drive strategic decision-making with comprehensive intelligence and visibility into your clinical development pipeline.'),
      features: [
        t('Executive dashboards with milestone tracking'),
        t('Competitive landscape intelligence by indication'),
        t('Protocol optimization for faster time-to-market')
      ],
      link: '/solutions/biotech-ceo'
    },
    { 
      id: 'investor',
      title: t('Biotech Investors'),
      icon: <TrendingUp size={24} />,
      description: t('Get deep intelligence on pipeline progress, clinical trial success rates, and competitive positioning for smarter investments.'),
      features: [
        t('Historical success rate analytics by indication'),
        t('Protocol quality scoring and benchmarking'),
        t('Therapeutic area trend tracking')
      ],
      link: '/solutions/biotech-investor'
    },
    { 
      id: 'cro',
      title: t('CRO Leaders'),
      icon: <Users size={24} />,
      description: t('Streamline your clinical operations and regulatory affairs with AI-powered tools that help you deliver more value to sponsors.'),
      features: [
        t('Predictive analytics for protocol optimization'),
        t('Structured CSR insights from 3,000+ trials'),
        t('White-label portal for sponsor access')
      ],
      link: '/solutions/cro'
    },
    { 
      id: 'medical',
      title: t('Medical Affairs'),
      icon: <Microscope size={24} />,
      description: t('Turn CSR intelligence into compelling clinical narratives and evidence that bridges the gap between R&D and commercial.'),
      features: [
        t('Evidence-backed clinical narratives'),
        t('Automatic FAERS trend monitoring'),
        t('Public CSR database integration')
      ],
      link: '/solutions/medical-affairs'
    },
    { 
      id: 'regulatory',
      title: t('Regulatory Affairs'),
      icon: <FileText size={24} />,
      description: t('Accelerate submissions with automated IND/CTA preparation, AI-assisted Module 2 writing, and validated eCTD packaging.'),
      features: [
        t('One-click eCTD packaging'),
        t('FDA/EMA/HC submission validation'),
        t('Full ESG integration')
      ],
      link: '/solutions/regulatory'
    },
    { 
      id: 'clinical',
      title: t('Clinical Development'),
      icon: <Beaker size={24} />,
      description: t('Design more successful protocols with AI-powered endpoints research, historical CSR insights, and competitive intelligence.'),
      features: [
        t('Endpoint analytics across TAs'),
        t('Protocol success predictor'),
        t('Comparable protocol library')
      ],
      link: '/solutions/clinical'
    },
  ];

  return (
    <main className="font-sans text-gray-800 dark:text-gray-100 w-full overflow-x-hidden">
      {/* Top Nav */}
      <nav className="fixed top-0 inset-x-0 h-14 bg-white/80 dark:bg-slate-900/70 backdrop-blur flex justify-between items-center px-6 z-40 shadow-sm">
        <Link to="/" className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Concepts2Cures.AI</Link>
        <div className="flex gap-3">
          <Button to="/login" variant="ghost"><LogIn size={16}/> {t('Login')}</Button>
          <Button to="/register" variant="ghost"><UserPlus size={16}/> {t('Register')}</Button>
          <Button to="/demo" variant="primary"><PlayCircle size={16}/> {t('Live Demo')}</Button>
        </div>
      </nav>
      
      {/* Regulatory Confidence Strip - adds scrolling agency logos */}
      <div className="pt-14">
        <RegulatoryConfidenceStrip />
      </div>
      
      {/* Intelligence Counter */}
      <div className="mb-2">
        <IntelligenceCounter />
      </div>

      {/* Hero */}
      <header className="pt-24 pb-14 bg-gradient-to-b from-emerald-50 via-white to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-800 text-center relative">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-400 mb-2">
          {t('TrialSage® Platform')}
        </h1>
        <p className="text-xl sm:text-2xl max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
          {t('Accelerate every regulatory milestone—from CSR insights to FDA submission—with enterprise‑grade AI agents.')}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Button to="/roi" variant="primary"><BarChart2 size={18}/> {t('Instant ROI Estimate')}</Button>
          <Button to="/contact" variant="ghost"><ArrowRight size={16}/> {t('Speak to an Expert')}</Button>
        </div>
      </header>

      {/* Feature banner */}
      <section className="py-3 bg-emerald-600 dark:bg-emerald-700 text-white text-center text-xs sm:text-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-4 animate-marquee whitespace-nowrap">
          {featureBanner.map(f=> (
            <span key={f} className="inline-flex items-center gap-1 px-2"><Brain size={12}/> {f}</span>
          ))}
        </div>
      </section>

      {/* Product Cards */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid gap-6 md:grid-cols-2">
        {products.map(p=> (
          <article key={p.title} className={`p-5 rounded-lg shadow bg-white dark:bg-slate-900 border-t-4 border-${p.color}-600 dark:border-${p.color}-400 flex flex-col`}>
            <span className="uppercase text-xs tracking-wide text-gray-400 mb-1">{p.tag}</span>
            <h3 className={`text-${p.color}-700 dark:text-${p.color}-300 text-xl font-semibold mb-2`}>{p.title}</h3>
            <p className="flex-grow text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{p.desc}</p>
            <Link to={p.link} className={`text-${p.color}-700 dark:text-${p.color}-300 font-medium hover:underline`}>{t('Learn more')}</Link>
          </article>
        ))}
      </section>
      
      {/* Buyer Persona Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
        <h2 className="text-2xl font-bold mb-8 text-center">{t('Solutions for Your Role')}</h2>
        
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {personas.map(persona => (
            <button
              key={persona.id}
              onClick={() => setSelectedPersona(selectedPersona === persona.id ? null : persona.id)}
              className={`
                px-4 py-2 rounded-full border transition flex items-center gap-2
                ${selectedPersona === persona.id ? 
                  'bg-emerald-100 border-emerald-600 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-400 dark:text-emerald-300' : 
                  'bg-white border-gray-200 hover:border-emerald-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-emerald-800'}
              `}
            >
              {persona.icon}
              <span>{persona.title}</span>
            </button>
          ))}
        </div>
        
        {selectedPersona && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-slate-700 animate-fadeIn">
            {personas.filter(p => p.id === selectedPersona).map(persona => (
              <div key={persona.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {persona.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{persona.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{persona.description}</p>
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-200">{t('Key Benefits:')}</h4>
                  <ul className="space-y-2">
                    {persona.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button to={persona.link}>{t('View Solutions for')} {persona.title} <ArrowRight size={16}/></Button>
              </div>
            ))}
          </div>
        )}
        
        {!selectedPersona && (
          <div className="text-center p-8 text-gray-600 dark:text-gray-300">
            <User size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <p className="mb-4">{t('Select your role above to see personalized solutions')}</p>
          </div>
        )}
      </section>

      {/* Technology Section */}
      <section className="py-12 bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 text-center px-6">
        <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-2"><Brain/> {t('Deep Intelligence Engine')}</h2>
        <p className="max-w-3xl mx-auto text-gray-700 dark:text-gray-300 text-lg mb-5">
          {t('Our AI pipeline links every statement to a verifiable data point—CSR paragraph, FAERS case, or Benchling record—so reviewers can trust and trace every sentence.')}
        </p>
        <Button variant="primary" to="/tech">{t('Explore Technology')} <ArrowRight size={16}/></Button>
      </section>

      {/* Competitor Table */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-4 text-center">{t('Why innovators choose TrialSage')}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border divide-y divide-gray-200 dark:divide-slate-600">
            <thead className="bg-gray-100 dark:bg-slate-800 text-left">
              <tr>
                <th className="py-1.5 px-3 font-semibold">{t('Platform')}</th>
                <th className="py-1.5 px-3">{t('AI Narratives')}</th>
                <th className="py-1.5 px-3">{t('eCTD End‑to‑End')}</th>
                <th className="py-1.5 px-3">{t('ESG Send')}</th>
                <th className="py-1.5 px-3">{t('Traceability')}</th>
                <th className="py-1.5 px-3">{t('Pricing')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {competitorRows.map((row, i) => (
                <tr key={i} className={i === 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}>
                  {row.map((cell, j) => (
                    <td key={j} className="py-1.5 px-3">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-50 dark:bg-slate-900 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="max-w-6xl mx-auto px-6">
          <p>© {year} Concepts2Cures.AI • {t('All rights reserved')}</p>
          <p className="mt-1 text-xs">{t('TrialSage is a registered trademark')}</p>
        </div>
      </footer>
    </main>
  );
}