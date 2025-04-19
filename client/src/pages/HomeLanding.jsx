// HomeLanding.jsx – Concepts2Cures (TrialSage platform)
// Tailwind + i18n + dark‑mode ready

import React, { useState } from "react";
import { Link } from "wouter";
import { PlayCircle, ArrowRight, LogIn, UserPlus, BarChart2, Brain, User, Users, Microscope, FileText, Beaker, TrendingUp, Building2, LineChart, Briefcase } from "lucide-react";
import { useTranslation } from "../i18n";
// Import i18n to initialize it
import "../i18n";
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
    {
      id: 'cer',
      text: t('Deep-Learning CER Narratives'),
      link: '/cer-dashboard'
    },
    {
      id: 'ind',
      text: t('Full IND Builder & Validator'),
      link: '/ind-automation'
    },
    {
      id: 'ectd',
      text: t('eCTD One-Click ESG Send'),
      link: '/ectd-send'
    },
    {
      id: 'risk',
      text: t('Real-Time Risk Dashboards'),
      link: '/risk-dashboards'
    },
    {
      id: 'connectors',
      text: t('Benchling & FAERS Connectors'),
      link: '/integrations'
    },
    {
      id: 'agent',
      text: t('Conversational Reg-Affairs Agent'),
      link: '/assistant'
    },
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
      <nav className="fixed top-0 inset-x-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex justify-between items-center px-6 z-40 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-xl">T</div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600">TrialSage</span>
          </Link>
          
          {/* Desktop navigation links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 text-sm font-medium">Products</Link>
            <Link to="/solutions" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 text-sm font-medium">Solutions</Link>
            <Link to="/pricing" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 text-sm font-medium">Pricing</Link>
            <Link to="/about" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 text-sm font-medium">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 text-sm font-medium">Contact</Link>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Direct users to login which will take them to the client portal after authentication */}
          <div className="hidden sm:flex items-center">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 mr-6">Login</Link>
            <Link to="/demo" className="text-sm font-medium text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 mr-6">Register</Link>
          </div>
          <Button to="/portal" variant="primary" className="px-4 py-2">
            <PlayCircle size={18} className="mr-1.5"/> {t('Access Platform')}
          </Button>
        </div>
      </nav>
      
      {/* Intelligence Counter */}
      <div className="pt-14 mb-5 px-6">
        <IntelligenceCounter />
      </div>

      {/* Hero */}
      <header className="pt-20 pb-16 bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -right-5 top-1/4 w-72 h-72 bg-emerald-500 rounded-full filter blur-3xl"></div>
          <div className="absolute -left-10 bottom-1/4 w-72 h-72 bg-sky-500 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-center md:text-left">
              <div className="inline-block px-3 py-1 mb-6 rounded-full border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-medium">
                {t('Trusted by 100+ Global Pharmaceutical Companies')}
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-400 mb-4 leading-tight">
                {t('TrialSage®')} <br />
                <span className="text-slate-800 dark:text-white">{t('Clinical Intelligence')}</span>
              </h1>
              
              <p className="text-lg sm:text-xl mb-8 text-gray-700 dark:text-gray-300 leading-relaxed max-w-lg">
                {t('Accelerate every regulatory milestone—from CSR insights to FDA submission—with enterprise‑grade AI agents.')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 md:justify-start justify-center mb-8">
                <Button to="/portal" variant="primary" className="text-base px-6 py-3">
                  <PlayCircle size={20}/> {t('Access Platform')}
                </Button>
                <Button to="/roi" variant="ghost" className="text-base px-6 py-3">
                  <BarChart2 size={20}/> {t('Calculate ROI')}
                </Button>
              </div>
              
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center md:text-left">
                <div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">3,000+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('Clinical Reports')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">98%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('Accuracy Rate')}</div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">40%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('Time Saved')}</div>
                </div>
              </div>
            </div>
            
            {/* Right side - Feature demo */}
            <div className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 transform rotate-1 relative z-10">
                <div className="rounded-lg overflow-hidden border border-gray-100 dark:border-slate-700">
                  <div className="h-8 bg-gray-100 dark:bg-slate-700 flex items-center px-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-900">
                    <div className="mb-4 flex items-center">
                      <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                        <Beaker size={20} />
                      </div>
                      <div className="ml-3">
                        <div className="text-lg font-bold">Trial Intelligence</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Oncology Phase 3 Comparison</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-full w-full"></div>
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-full w-5/6"></div>
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-full w-4/6"></div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Endpoint Success</div>
                          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">86%</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Avg. Enrollment</div>
                          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">420</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl -z-10"></div>
              <div className="absolute -top-3 -left-3 w-24 h-24 bg-sky-100 dark:bg-sky-900/20 rounded-xl -z-10"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Feature banner buttons - Interactive entry points to key features */}
      <section className="py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 text-white text-center shadow-md">
        <h2 className="text-xl font-semibold mb-4">{t('Key Platform Features')}</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {featureBanner.map(feature => (
            <Link 
              key={feature.id}
              to={feature.link}
              className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-all transform hover:scale-105 shadow-sm backdrop-blur-sm"
            >
              <div className="p-2 rounded-full bg-emerald-500/30">
                <Brain size={20} className="animate-pulse text-white" /> 
              </div>
              <div className="text-left">
                <span className="font-medium">{feature.text}</span>
                <p className="text-xs text-emerald-100 mt-1 opacity-80">Click to explore</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Product Cards */}
      <section className="py-16 bg-gray-50 dark:bg-slate-800/20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-10 text-center">{t('Enterprise Intelligence Products')}</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map(p => (
              <article 
                key={p.title} 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col h-full"
              >
                <div className={`h-2 bg-${p.color}-500 dark:bg-${p.color}-400 w-full`}></div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">{p.tag}</span>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-${p.color}-100 dark:bg-${p.color}-900/30`}>
                      {p.title.includes('CSR') && <FileText className={`text-${p.color}-500 dark:text-${p.color}-400`} size={16} />}
                      {p.title.includes('CER') && <Brain className={`text-${p.color}-500 dark:text-${p.color}-400`} size={16} />}
                      {p.title.includes('IND') && <Beaker className={`text-${p.color}-500 dark:text-${p.color}-400`} size={16} />}
                      {p.title.includes('Assistant') && <User className={`text-${p.color}-500 dark:text-${p.color}-400`} size={16} />}
                      {p.title.includes('Analytics') && <BarChart2 className={`text-${p.color}-500 dark:text-${p.color}-400`} size={16} />}
                    </div>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 text-${p.color}-700 dark:text-${p.color}-300`}>{p.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">{p.desc}</p>
                  <div className="mt-auto">
                    <Link 
                      to={p.link} 
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-${p.color}-100 dark:bg-${p.color}-900/20 text-${p.color}-700 dark:text-${p.color}-300 font-medium hover:bg-${p.color}-200 dark:hover:bg-${p.color}-900/30 transition-colors`}
                    >
                      {t('Explore')} <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      
      {/* Buyer Persona Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
        <h2 className="text-2xl font-bold mb-8 text-center">{t('Intelligence Center by Role')}</h2>
        
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
                  <h3 className="text-xl font-semibold">{persona.title} Intelligence Hub</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{persona.description}</p>
                
                {/* Interactive Feature Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {persona.id === 'ceo' && (
                    <>
                      <Link to="/ceo-dashboard" className="p-4 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800 dark:hover:bg-emerald-900/20 transition flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart2 className="text-emerald-600 dark:text-emerald-400" size={20} />
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">Executive Dashboard</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Real-time view of all trials with milestone tracking and success predictions</p>
                      </Link>
                      <Link to="/competitive-intel" className="p-4 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800 dark:hover:bg-emerald-900/20 transition flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={20} />
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">Competitive Intelligence</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Benchmark your trials against competitors in your therapeutic area</p>
                      </Link>
                    </>
                  )}
                  
                  {persona.id === 'investor' && (
                    <>
                      <Link to="/success-rate-analytics" className="p-4 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800 dark:hover:bg-emerald-900/20 transition flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={20} />
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">Success Rate Analytics</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Historical success rates by indication, phase, and company</p>
                      </Link>
                      <Link to="/protocol-quality-score" className="p-4 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800 dark:hover:bg-emerald-900/20 transition flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="text-emerald-600 dark:text-emerald-400" size={20} />
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">Protocol Quality Score</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">AI-powered assessment of protocol quality with success prediction</p>
                      </Link>
                    </>
                  )}
                  
                  {persona.id === 'cro' && (
                    <>
                      <Link to="/protocol-optimization" className="p-4 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800 dark:hover:bg-emerald-900/20 transition flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="text-emerald-600 dark:text-emerald-400" size={20} />
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">Protocol Optimizer</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Upload protocols to get AI optimization suggestions based on 3,000+ trials</p>
                      </Link>
                      <Link to="/white-label" className="p-4 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800 dark:hover:bg-emerald-900/20 transition flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="text-emerald-600 dark:text-emerald-400" size={20} />
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">White-Label Portal</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Branded sponsor access to your TrialSage intelligence</p>
                      </Link>
                    </>
                  )}
                  
                  {persona.id === 'medical' && (
                    <>
                      <Link to="/evidence-builder" className="p-4 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800 dark:hover:bg-emerald-900/20 transition flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="text-emerald-600 dark:text-emerald-400" size={20} />
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">Evidence Builder</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Generate evidence-backed narratives from CSR data and FAERS trends</p>
                      </Link>
                      <Link to="/faers-monitor" className="p-4 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800 dark:hover:bg-emerald-900/20 transition flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <Microscope className="text-emerald-600 dark:text-emerald-400" size={20} />
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">FAERS Monitor</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Proactive adverse event tracking with real-time alerts</p>
                      </Link>
                    </>
                  )}
                  
                  {persona.id === 'regulatory' && (
                    <>
                      <Link to="/ind-automation" className="p-4 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800 dark:hover:bg-emerald-900/20 transition flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="text-emerald-600 dark:text-emerald-400" size={20} />
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">IND Builder</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Build module 1-5 with AI-assisted Module 2 and eCTD packaging</p>
                      </Link>
                      <Link to="/submission-validator" className="p-4 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800 dark:hover:bg-emerald-900/20 transition flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowRight className="text-emerald-600 dark:text-emerald-400" size={20} />
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">Submission Validator</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Validate submissions for FDA, EMA, and Health Canada requirements</p>
                      </Link>
                    </>
                  )}
                  
                  {persona.id === 'clinical' && (
                    <>
                      <Link to="/endpoint-analytics" className="p-4 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800 dark:hover:bg-emerald-900/20 transition flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <Beaker className="text-emerald-600 dark:text-emerald-400" size={20} />
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">Endpoint Analytics</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Find optimal endpoints based on historical success data by indication</p>
                      </Link>
                      <Link to="/protocol-success" className="p-4 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800 dark:hover:bg-emerald-900/20 transition flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <LineChart className="text-emerald-600 dark:text-emerald-400" size={20} />
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">Success Predictor</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">AI model to predict protocol success probability before execution</p>
                      </Link>
                    </>
                  )}
                </div>
                
                {/* Live Example Widget */}
                <div className="mb-6 p-4 border border-gray-200 rounded-md dark:border-gray-700 bg-gray-50 dark:bg-slate-900/50">
                  <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    {t('Live Example:')}
                  </h4>
                  
                  {persona.id === 'ceo' && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <div className="font-medium mb-1">Oncology Portfolio Performance:</div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded border border-gray-100 dark:border-slate-700">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Active Trials</div>
                          <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">14</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-2 rounded border border-gray-100 dark:border-slate-700">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Success Probability</div>
                          <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">68%</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-2 rounded border border-gray-100 dark:border-slate-700">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Time to Milestone</div>
                          <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">-3.5m</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {persona.id === 'investor' && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <div className="font-medium mb-1">Phase II Alzheimer's Success Rates:</div>
                      <div className="flex items-center mb-2">
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                          <div className="bg-emerald-600 dark:bg-emerald-400 h-2.5 rounded-full" style={{width: '34%'}}></div>
                        </div>
                        <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">34%</span>
                      </div>
                      <div className="text-xs">Top performers: Biogen (47%), Lilly (41%), Roche (38%)</div>
                    </div>
                  )}
                  
                  {persona.id === 'cro' && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <div className="font-medium mb-1">Protocol Optimization Opportunity:</div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                        <span>Inclusion criteria can be optimized (87% match to successful trials)</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-red-600 dark:text-red-400">✗</span>
                        <span>Primary endpoint has low historical success (29% match)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                        <span>Sample size calculation aligned with successful CSRs</span>
                      </div>
                    </div>
                  )}
                  
                  {persona.id === 'medical' && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <div className="font-medium mb-1">FAERS Trend Alert for Ozempic:</div>
                      <div className="flex items-center mb-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
                        <span>34% increase in reported GI events over 6 months</span>
                      </div>
                      <div className="text-xs italic mt-2">Click "FAERS Monitor" to view full analysis and comparison to class</div>
                    </div>
                  )}
                  
                  {persona.id === 'regulatory' && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <div className="font-medium mb-1">IND Submission Readiness Check:</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="flex items-center">
                          <span className="text-emerald-600 dark:text-emerald-400 mr-1">✓</span>
                          <span>Module 1: Complete</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-emerald-600 dark:text-emerald-400 mr-1">✓</span>
                          <span>Module 2: Complete</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-emerald-600 dark:text-emerald-400 mr-1">✓</span>
                          <span>Module 3: Complete</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-yellow-500 dark:text-yellow-400 mr-1">⚠</span>
                          <span>Module 4: In Progress</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {persona.id === 'clinical' && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <div className="font-medium mb-1">Top Performing NASH Endpoints:</div>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Liver fat reduction ≥ 30% (success rate: 72%)</li>
                        <li>≥ 2-point reduction in NAS (success rate: 64%)</li>
                        <li>Fibrosis improvement ≥ 1 stage (success rate: 51%)</li>
                      </ol>
                      <div className="text-xs italic mt-2">Based on analysis of 94 NASH trials in TrialSage database</div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 flex-wrap">
                  <Button to={persona.link} variant="primary">{t('Enter')} {persona.title} {t('Hub')} <ArrowRight size={16}/></Button>
                  <Button to={`/demo-${persona.id}`} variant="ghost">{t('Watch Demo')} <PlayCircle size={16}/></Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!selectedPersona && (
          <div className="text-center p-8 text-gray-600 dark:text-gray-300">
            <User size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <p className="mb-4">{t('Select your role above to access role-specific intelligence tools')}</p>
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

      {/* Customer Validation Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('Trusted by Industry Leaders')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('TrialSage is the trusted clinical intelligence platform for pharmaceutical companies, biotechs, and CROs worldwide.')}
            </p>
          </div>
          
          {/* Logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center mb-16 opacity-70">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-12 flex items-center">
                <div className="w-32 h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
          
          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="flex mb-6 text-emerald-500">
                {Array(5).fill(0).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                "{t('TrialSage has transformed how we approach regulatory submissions. The AI-driven IND module saved us 6 weeks on our last submission, and the CSR intelligence gives us insights we never had before.')}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <User size={20} />
                </div>
                <div className="ml-3">
                  <div className="font-medium">Sarah Johnson</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">VP Regulatory Affairs, BioAdvance</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="flex mb-6 text-emerald-500">
                {Array(5).fill(0).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                "{t('As a CRO managing hundreds of trials, the TrialSage platform helps us deliver superior value to sponsors. Their AI-powered CSR analytics has become our secret weapon for designing better protocols.')}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <User size={20} />
                </div>
                <div className="ml-3">
                  <div className="font-medium">Michael Chen</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Clinical Operations Director, GlobalTrials</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="flex mb-6 text-emerald-500">
                {Array(5).fill(0).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                "{t('The CER Generator has completely transformed our MDR compliance workflow. What used to take 3-4 weeks now takes days, and the reports are more comprehensive than our manually created ones.')}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <User size={20} />
                </div>
                <div className="ml-3">
                  <div className="font-medium">Elena Rodriguez</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Medical Director, EuroMed Devices</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Validation Metrics */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">38%</div>
              <div className="text-lg font-medium mb-2">{t('Faster Submissions')}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('Average time savings on regulatory submissions with our AI-assisted workflows.')}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">98.7%</div>
              <div className="text-lg font-medium mb-2">{t('Document Accuracy')}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('Validated document processing accuracy across thousands of clinical documents.')}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">3,250+</div>
              <div className="text-lg font-medium mb-2">{t('Clinical Documents')}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('Structured CSRs and clinical documents in our intelligence platform.')}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">42%</div>
              <div className="text-lg font-medium mb-2">{t('ROI Improvement')}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('Average return on investment improvement reported by enterprise customers.')}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Use Case Library */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('Use Case Library')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('Explore how pharmaceutical companies, biotechs, and medical device manufacturers leverage TrialSage in their workflows.')}
            </p>
          </div>
          
          {/* Use Case Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-full font-medium">
              {t('All Use Cases')}
            </button>
            <button className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/20">
              {t('Regulatory Affairs')}
            </button>
            <button className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/20">
              {t('Clinical Development')}
            </button>
            <button className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/20">
              {t('Medical Affairs')}
            </button>
            <button className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/20">
              {t('CRO Solutions')}
            </button>
          </div>
          
          {/* Use Case Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="h-48 bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                <FileText size={48} className="text-emerald-500" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
                    {t('Regulatory Affairs')}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('Phase 3 • Oncology')}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{t('Accelerating IND Submissions')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('How a mid-size biotech automated their IND submission process and cut preparation time by 40%.')}
                </p>
                <Link to="/cases/ind-automation" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1">
                  {t('Read Case Study')} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="h-48 bg-sky-100 dark:bg-sky-900/20 flex items-center justify-center">
                <Brain size={48} className="text-sky-500" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 rounded-full text-xs font-medium">
                    {t('Medical Affairs')}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('Medical Devices • EU')}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{t('Streamlining EU MDR Compliance')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('How a medical device company automated CER generation for 12 product lines and achieved 100% MDR compliance.')}
                </p>
                <Link to="/cases/mdr-compliance" className="text-sky-600 dark:text-sky-400 font-medium hover:underline flex items-center gap-1">
                  {t('Read Case Study')} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="h-48 bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Beaker size={48} className="text-purple-500" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
                    {t('Clinical Development')}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('Phase 2 • CNS')}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{t('Optimizing Protocol Design')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('How a CNS-focused biotech leveraged CSR intelligence to optimize their Phase 2 trial design and improve endpoint selection.')}
                </p>
                <Link to="/cases/protocol-optimization" className="text-purple-600 dark:text-purple-400 font-medium hover:underline flex items-center gap-1">
                  {t('Read Case Study')} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <Link to="/use-cases" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
              {t('View All Use Cases')} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-50 dark:bg-slate-900 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="max-w-6xl mx-auto px-6">
          <p>© {year} Concepts2Cures • {t('All rights reserved')}</p>
          <p className="mt-1 text-xs">{t('TrialSage is a registered trademark')}</p>
        </div>
      </footer>
    </main>
  );
}