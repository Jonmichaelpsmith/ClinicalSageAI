// HomeLandingProtected.jsx - Premium Enterprise Landing Page for Concept2Cures.AI
// VERSION: 3.0 ENTERPRISE EDITION APR 2025
// LAST APPROVAL: EXECUTIVE TEAM 

import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  ArrowRight, ShieldCheck, BarChart2, UploadCloud, 
  FileText, Building2, Users, BrainCircuit, Microscope,
  ScrollText, FileCheck, BookOpen, Workflow, Award
} from 'lucide-react';
import Slider from 'react-slick';
// Import version control system
import { validateComponentIntegrity, logProtectedComponentModificationAttempt } from '../utils/versionControl';

// PROTECTED: DO NOT MODIFY THESE BRAND ASSETS WITHOUT EXECUTIVE APPROVAL
const logos = [
  'fda.svg','ema.svg','pmda.svg','mhra.svg','tga.svg','nmpa.svg','korea_mfds.svg'
];

// This section is now replaced with the documented solution packages below

// Core Engines (Based on the provided documentation)
const coreEngines = [
  {
    name: "CSR Intelligence™ Engine",
    icon: <BrainCircuit size={24} className="text-white" />,
    description: "Transforms thousands of Clinical Study Reports into a continuously-learning knowledge graph with semantic embedding via OpenAI + pgvector for instant retrieval.",
    features: [
      "Deep objective extraction (endpoints, populations, AEs, stats)",
      "Transformer reasoning to surface patterns & anomalies",
      "Reduces literature-review labor by 90%",
      "Detects hidden efficacy/safety signals months earlier"
    ],
    image: "/static/images/csr-intelligence.jpg",
    color: "from-blue-600 to-indigo-700"
  },
  {
    name: "CER Developer",
    icon: <FileText size={24} className="text-white" />,
    description: "Auto-generates device & drug Clinical Evaluation Reports with real-time ingestion of MAUDE, FAERS, EUDAMED data sources.",
    features: [
      "Time-series forecasting & anomaly detection",
      "GPT-powered narrative builder (ICH compliant)",
      "Creates regulator-ready CERs in minutes, not weeks",
      "Cuts external writing spend >$40k per report"
    ],
    image: "/static/images/cer-developer.jpg",
    color: "from-emerald-600 to-teal-700"
  },
  {
    name: "Protocol Optimizer",
    icon: <ScrollText size={24} className="text-white" />,
    description: "Designs protocols that are statistically powered and operationally feasible by mining CSR data for enrollment rates and screen-fail drivers.",
    features: [
      "Simulates adaptive designs via Bayesian MCMC",
      "Suggests endpoints aligned to FDA/EMA precedents",
      "Increases study power while trimming arms/visits → 15-25% faster trials",
      "De-risks FDA protocol questions upfront"
    ],
    image: "/static/images/protocol-optimizer.jpg",
    color: "from-purple-600 to-violet-700"
  },
  {
    name: "IND/eCTD Automation",
    icon: <FileCheck size={24} className="text-white" />,
    description: "One-click assembly, validation & ESG submission of IND/CTA sequences with drag-and-drop builder and PDF QC integration.",
    features: [
      "Regional XML builders (FDA, EMA, PMDA)",
      "Lorenz eValidator orchestration",
      "SFTP to FDA ESG + ACK badges",
      "Eliminates 100% of technical-rejection risk and saves 200+ hrs per sequence"
    ],
    image: "/static/images/ind-automation.jpg",
    color: "from-amber-600 to-orange-700"
  },
  {
    name: "Study Designer",
    icon: <Workflow size={24} className="text-white" />,
    description: "Comprehensive trial design tool with integrated statistical power analysis, operation feasibility checks, and regulatory alignment verification.",
    features: [
      "Statistical modeling and power calculation",
      "Endpoint selection with regulatory precedent analysis",
      "Eligibility criteria evaluation against historical enrollment data",
      "Interactive scenario testing for sample size and duration"
    ],
    image: "/static/images/study-designer.jpg",
    color: "from-rose-600 to-pink-700"
  },
  {
    name: "CSR Deep Learning Module",
    icon: <Microscope size={24} className="text-white" />,
    description: "Advanced pattern recognition across 3000+ trial reports with transformer-based extraction and anomaly detection for innovative insights.",
    features: [
      "Transformer-based table extraction",
      "Time-series forecasting for enrollment and outcomes",
      "Multi-modal document understanding",
      "Cross-study pattern mining and knowledge inference"
    ],
    image: "/static/images/deep-learning.jpg",
    color: "from-indigo-600 to-purple-700"
  }
];

// Solution Packages (Based on provided documentation)
const solutionPackages = [
  {
    title: "Insight Starter",
    icon: <BrainCircuit size={40} className="text-blue-600" />,
    price: "$14,999",
    description: "CSR query console with AI-searchable corpus and advanced analytics tools for medical writers and safety scientists.",
    features: [
      "CSR query console with semantic search",
      "5 GB K-graph storage",
      "PDF QC pipeline",
      "Replaces static SharePoint dumps with AI-searchable corpus"
    ],
    cta: "Get Insights Access",
    variant: "bg-gradient-to-br from-blue-50 to-indigo-50 border-t-4 border-blue-600"
  },
  {
    title: "CER Turbo",
    icon: <FileText size={40} className="text-emerald-600" />,
    price: "$19,999",
    description: "Complete Clinical Evaluation Report generator with real-time safety data integration and regulatory-compliant outputs.",
    features: [
      "CER Developer engine",
      "MAUDE + FAERS feeds integration",
      "PDF export + branded templates",
      "Delivers in hours with live safety trending vs $30-50k consultant CERs"
    ],
    cta: "Explore CER Turbo",
    variant: "bg-gradient-to-br from-emerald-50 to-teal-50 border-t-4 border-emerald-600"
  },
  {
    title: "Protocol Builder Pro",
    icon: <ScrollText size={40} className="text-violet-600" />,
    price: "$24,999",
    description: "Data-driven protocol design suite with adaptive modeling capabilities for clinical operations and biostatistics teams.",
    features: [
      "Protocol Optimizer engine",
      "Adaptive design simulator",
      "Benchmark enrollment dashboards",
      "Data-driven protocol design versus competitors' heuristics"
    ],
    cta: "See Protocol Builder",
    variant: "bg-gradient-to-br from-violet-50 to-purple-50 border-t-4 border-violet-600"
  },
  {
    title: "IND Auto-Pilot",
    icon: <FileCheck size={40} className="text-amber-600" />,
    price: "$29,999",
    description: "First SaaS to unify authoring, QC, XML build, validation, and ESG in one seamless workflow for regulatory publishing.",
    features: [
      "Drag Dossier Builder",
      "Region switch (FDA/EMA/PMDA)",
      "Lorenz eValidator & ESG gateway",
      "One-step validation and submission"
    ],
    cta: "Launch IND Auto-Pilot",
    variant: "bg-gradient-to-br from-amber-50 to-orange-50 border-t-4 border-amber-600"
  },
  {
    title: "Enterprise 360",
    icon: <Building2 size={40} className="text-slate-800" />,
    price: "$69,999",
    description: "Complete end-to-end solution with all engines integrated for mid-large biotechs and CROs, slashing outsourcing and tool sprawl.",
    features: [
      "All engines + SSO, RBAC",
      "KPIs dashboard",
      "On-prem/TLS installer",
      "Weekly AI audit reports"
    ],
    cta: "Request Enterprise Demo",
    variant: "bg-gradient-to-br from-slate-50 to-gray-100 border-t-4 border-slate-800"
  }
];

// Example Report Packages
const reportPackages = [
  {
    title: "Cardiovascular Risk Assessment",
    thumbnail: "/static/images/cv-report.jpg",
    description: "Comprehensive analysis of cardiac safety signals across 400+ trials with machine learning pattern detection.",
    format: "53-page PDF + Interactive Dashboard",
    sample: "/samples/cv-risk-sample.pdf"
  },
  {
    title: "Oncology Trial Success Factors",
    thumbnail: "/static/images/onc-report.jpg",
    description: "Meta-analysis of successful vs. failed oncology trials with predictive enrollment and outcome models.",
    format: "85-page PDF + Data Explorer",
    sample: "/samples/onc-success-sample.pdf"
  },
  {
    title: "Regulatory Submission Strategy",
    thumbnail: "/static/images/reg-report.jpg",
    description: "Multi-region regulatory pathway analysis with timing optimization and rejection risk assessment.",
    format: "47-page PDF + Strategy Roadmap",
    sample: "/samples/reg-strategy-sample.pdf"
  }
];

// ROI Calculator Data
const roiMetrics = [
  { metric: "IND Preparation Time", traditional: "4-6 months", withTrialSage: "6-8 weeks", savings: "Up to 67%" },
  { metric: "Protocol Amendments", traditional: "2.3 per study", withTrialSage: "0.9 per study", savings: "61%" },
  { metric: "Regulatory Query Response", traditional: "8-12 days", withTrialSage: "24-48 hours", savings: "Up to 83%" },
  { metric: "eCTD Publishing Costs", traditional: "$54,000/submission", withTrialSage: "$17,500/submission", savings: "68%" }
];

// Implement version verification with version control system
const verifyVersionIntegrity = () => {
  const isValid = validateComponentIntegrity('home-landing');
  if (!isValid) {
    // Log unauthorized modification attempt
    logProtectedComponentModificationAttempt(
      'home-landing', 
      'unknown_user', 
      'edit'
    );
  }
  return isValid;
};

export default function HomeLanding() {
  const [activeTab, setActiveTab] = useState('solutions');
  const [videoPlaying, setVideoPlaying] = useState(false);
  
  const sliderSettings = { 
    arrows: false, 
    infinite: true, 
    autoplay: true, 
    autoplaySpeed: 3000, 
    slidesToShow: 5, 
    slidesToScroll: 1, 
    pauseOnHover: false, 
    cssEase: 'linear', 
    responsive: [{breakpoint: 768, settings: {slidesToShow: 3}}] 
  };

  const testimonialSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000
  };
  
  // Add premium styles
  React.useEffect(() => {
    // Verify version integrity on component load
    if (!verifyVersionIntegrity()) {
      console.error("Landing page integrity check failed. Please contact the development team.");
    }
    
    // Add diagnostic logging
    console.log("TrialSage/Concept2Cures.AI premium landing page loaded");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Current route:", window.location.pathname);
    
    // Create premium styles
    const style = document.createElement('style');
    style.textContent = `
      .gradient-text {
        background: linear-gradient(90deg, #10b981 0%, #3b82f6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .hero-gradient {
        background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%);
      }
      .premium-card {
        transition: all 0.3s ease;
      }
      .premium-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      .tab-active {
        border-bottom: 3px solid #10b981;
        color: #10b981;
      }
      .enterprise-badge {
        background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%);
      }
    `;
    document.head.append(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      {/* Premium Navigation Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center">
            <span className="text-2xl font-extrabold gradient-text">Concept2Cures.AI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/solutions" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 font-medium">Solutions</Link>
            <Link to="/reports" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 font-medium">Report Library</Link>
            <Link to="/csr-intelligence" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 font-medium">CSR Intelligence</Link>
            <Link to="/portal" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 font-medium">Client Portal</Link>
            <Link to="/builder" className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-700 hover:to-teal-800 shadow-md font-medium transition-all">
              eCTD Builder
            </Link>
          </nav>
          <div className="md:hidden">
            <button className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Video Background Option */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium text-sm mb-6">
                Trusted by 80+ Biotechs & Pharma Companies
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white mb-6">
                Transform Concepts <br/>Into <span className="gradient-text">Cures</span> <br/>10× Faster
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl">
                TrialSage® unifies AI‑driven protocol design, regulatory authoring & eCTD submission—delivering approved therapies at unprecedented speed.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/builder" className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-700 hover:to-teal-800 shadow-lg flex items-center gap-2 font-medium transition-all">
                  Launch eCTD Builder <ArrowRight size={18}/>
                </Link>
                <Link to="/demo" className="px-6 py-3 rounded-lg border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-2 font-medium">
                  Schedule Demo
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-lg rounded-xl overflow-hidden shadow-2xl">
                {videoPlaying ? (
                  <iframe 
                    className="w-full aspect-video rounded-xl"
                    src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1" 
                    title="TrialSage Platform Overview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="relative">
                    <img 
                      src="/static/images/platform-preview.jpg" 
                      alt="TrialSage Platform Preview" 
                      className="w-full rounded-xl"
                    />
                    <button 
                      onClick={() => setVideoPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-50 transition-all"
                    >
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto px-6">
          <h3 className="text-center text-sm uppercase font-semibold text-gray-500 dark:text-gray-400 mb-8">
            Trusted by global regulatory authorities and leading biopharma
          </h3>
          <Slider {...sliderSettings} className="container mx-auto flex items-center">
            {logos.map((l,i)=>(
              <div key={i} className="px-4 opacity-80 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                <img src={`/static/logos/${l}`} alt={l} className="h-14 mx-auto"/>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Product Tabs Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Enterprise Solutions</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive regulatory intelligence and automation tools built for every stage of the drug development lifecycle.
            </p>
          </div>
          
          <div className="flex justify-center border-b border-gray-200 mb-10">
            <button 
              onClick={() => setActiveTab('solutions')}
              className={`px-6 py-3 font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 ${activeTab === 'solutions' ? 'tab-active' : ''}`}
            >
              Enterprise Solutions
            </button>
            <button 
              onClick={() => setActiveTab('modules')}
              className={`px-6 py-3 font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 ${activeTab === 'modules' ? 'tab-active' : ''}`}
            >
              Product Modules
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-3 font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 ${activeTab === 'reports' ? 'tab-active' : ''}`}
            >
              Report Packages
            </button>
          </div>
          
          {/* Enterprise Solutions Tab */}
          {activeTab === 'solutions' && (
            <div className="grid md:grid-cols-3 gap-8">
              {solutionPackages.map((pkg, i) => (
                <div 
                  key={i}
                  className={`rounded-xl shadow-lg overflow-hidden premium-card ${pkg.variant}`}
                >
                  <div className="p-8">
                    <div className="mb-6">{pkg.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{pkg.title}</h3>
                    <div className="text-xl font-semibold mb-4 text-gray-700">{pkg.price}</div>
                    <p className="text-gray-600 mb-6">{pkg.description}</p>
                    <ul className="mb-8">
                      {pkg.features.map((feature, j) => (
                        <li key={j} className="flex items-start mb-3">
                          <svg className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      className="w-full py-3 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800 font-medium transition-all"
                    >
                      {pkg.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Core Engines Tab */}
          {activeTab === 'modules' && (
            <div className="grid md:grid-cols-2 gap-8">
              {coreEngines.map((engine, i) => (
                <div 
                  key={i}
                  className="rounded-xl overflow-hidden shadow-lg premium-card bg-white dark:bg-slate-800"
                >
                  <div className={`bg-gradient-to-r ${engine.color} p-6 flex items-center`}>
                    <div className="bg-white bg-opacity-20 rounded-full p-2 mr-4">
                      {engine.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white">{engine.name}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {engine.description}
                    </p>
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">Key Capabilities:</h4>
                      <ul className="space-y-1">
                        {engine.features.map((feature, j) => (
                          <li key={j} className="flex items-start">
                            <svg className="h-5 w-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-4">
                      <button className="px-5 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-medium transition-all">
                        Learn More
                      </button>
                      <button className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-all">
                        Request Demo
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Report Packages Tab */}
          {activeTab === 'reports' && (
            <div className="grid md:grid-cols-3 gap-8">
              {reportPackages.map((report, i) => (
                <div 
                  key={i}
                  className="rounded-xl overflow-hidden shadow-lg premium-card bg-white dark:bg-slate-800"
                >
                  <img 
                    src={report.thumbnail} 
                    alt={report.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">{report.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {report.description}
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Format: {report.format}
                    </div>
                    <div className="flex gap-3">
                      <a 
                        href={report.sample}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium text-sm transition-all"
                      >
                        Download Sample
                      </a>
                      <button className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all">
                        Request Full Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">ROI Calculator</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              See the measurable impact TrialSage delivers across your regulatory operations.
            </p>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white border-opacity-20">
                    <th className="py-4 px-4 text-left">Metric</th>
                    <th className="py-4 px-4 text-left">Traditional Process</th>
                    <th className="py-4 px-4 text-left">With TrialSage</th>
                    <th className="py-4 px-4 text-left">Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {roiMetrics.map((item, i) => (
                    <tr key={i} className="border-b border-white border-opacity-10">
                      <td className="py-4 px-4 font-medium">{item.metric}</td>
                      <td className="py-4 px-4 text-gray-400">{item.traditional}</td>
                      <td className="py-4 px-4 text-emerald-400 font-medium">{item.withTrialSage}</td>
                      <td className="py-4 px-4">
                        <span className="bg-emerald-500 bg-opacity-20 text-emerald-300 px-2 py-1 rounded-full font-medium">
                          {item.savings}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-8 text-center">
              <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-700 hover:to-teal-800 shadow-lg font-medium transition-all">
                Calculate Your Custom ROI
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Client Success Stories</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Hear from biotechs and pharmaceutical companies that transformed their regulatory operations with TrialSage.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Slider {...testimonialSettings}>
              <div className="px-8">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-10">
                  <div className="flex items-center mb-6">
                    <img 
                      src="/static/images/logo-bioventure.png" 
                      alt="BioVenture Therapeutics"
                      className="h-10 mr-4"
                    />
                    <div>
                      <div className="font-bold text-lg">BioVenture Therapeutics</div>
                      <div className="text-sm text-gray-500">Oncology | Series C</div>
                    </div>
                  </div>
                  <p className="text-lg italic text-gray-700 dark:text-gray-300 mb-6">
                    "TrialSage reduced our IND preparation time by 70% and caught critical protocol issues that would have delayed our Phase 1 study. The ROI was immediate and substantial."
                  </p>
                  <div className="flex items-center">
                    <img 
                      src="/static/images/avatar-sarah.jpg" 
                      alt="Sarah Chen, PhD"
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-medium">Sarah Chen, PhD</div>
                      <div className="text-sm text-gray-500">Chief Scientific Officer</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-8">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-10">
                  <div className="flex items-center mb-6">
                    <img 
                      src="/static/images/logo-nexgen.png" 
                      alt="NexGen Pharma"
                      className="h-10 mr-4"
                    />
                    <div>
                      <div className="font-bold text-lg">NexGen Pharma</div>
                      <div className="text-sm text-gray-500">Autoimmune | Public (NXGP)</div>
                    </div>
                  </div>
                  <p className="text-lg italic text-gray-700 dark:text-gray-300 mb-6">
                    "The multi-region capabilities saved us months of work. We submitted to FDA, EMA, and PMDA simultaneously with perfect eCTD compliance. Our regulatory team couldn't imagine going back."
                  </p>
                  <div className="flex items-center">
                    <img 
                      src="/static/images/avatar-michael.jpg" 
                      alt="Michael Rodriguez"
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-medium">Michael Rodriguez</div>
                      <div className="text-sm text-gray-500">VP of Regulatory Affairs</div>
                    </div>
                  </div>
                </div>
              </div>
            </Slider>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to accelerate your regulatory journey?</h2>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-10">
            Join the leading biotechs and pharma companies using TrialSage to bring life-changing therapies to patients faster.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/demo" className="px-8 py-4 rounded-lg bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-lg shadow-lg transition-all">
              Schedule a Demo
            </Link>
            <Link to="/pricing" className="px-8 py-4 rounded-lg border-2 border-white text-white hover:bg-white hover:bg-opacity-10 font-bold text-lg transition-all">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-xl mb-6 gradient-text">Concept2Cures.AI</h4>
              <p className="text-gray-400 mb-6">
                Accelerating the path from scientific concepts to approved therapies with AI-driven regulatory intelligence.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Products</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">IND Automation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">CSR Intelligence</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Regulatory Portal</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Trial Risk Analyzer</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">eCTD Builder</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Resources</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Webinars</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Case Studies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Knowledge Base</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API Reference</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Leadership</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">News</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-wrap justify-between items-center">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Concept2Cures.AI. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}