// HeroMessagingVariants.jsx – role‑aware hero with auto‑detection (UTM / session)
import React, { useEffect, useState } from "react";
import { useLocation } from "wouter"; // Using wouter instead of react-router-dom

// Define message variants for different audience segments
const variants = {
  exec: {
    headline: "From Concepts to Cures — in Half the Time",
    subhead:
      "TrialSage automates regulatory writing, submission assembly, and ESG delivery across FDA, EMA, PMDA, and more. Cut costs. Launch faster. Stay compliant.",
    cta: "Calculate Your ROI",
    ctaLink: "/roi-calculator",
    secondaryCta: "Request a Strategic Demo",
    secondaryCtaLink: "/demo",
    color: "emerald"
  },
  medwriter: {
    headline: "Let the Assistant Draft Your IND While You Sleep",
    subhead:
      "Generate Module 2 summaries, CERs, and CSRs in hours — not weeks. Track reviews, collect e-signatures, and stay always audit‑ready.",
    cta: "Try AI‑Powered Drafting",
    ctaLink: "/assistant",
    secondaryCta: "View Document Workflow",
    secondaryCtaLink: "/workflow",
    color: "purple"
  },
  ops: {
    headline: "Faster Documents, Smoother Approvals, Fewer Vendors",
    subhead:
      "TrialSage centralizes protocol authoring, team reviews, and submission packaging into one platform — no handoffs, no delays.",
    cta: "Launch a New Study",
    ctaLink: "/new-study",
    secondaryCta: "Schedule a CRO Replacement Briefing",
    secondaryCtaLink: "/cro-demo",
    color: "sky"
  },
  qa: {
    headline: "Audit Trails Built for Inspectors. Not Just Checklists.",
    subhead:
      "Secure, time‑stamped logs. Immutable signatures. GxP‑ready workflows. 21 CFR Part 11 compliance — built in from day one.",
    cta: "Explore Validation Tools",
    ctaLink: "/validation",
    secondaryCta: "See Audit Tools in Action",
    secondaryCtaLink: "/audit-demo",
    color: "amber"
  },
  investor: {
    headline: "AI for Biotech That Actually Moves the Needle",
    subhead:
      "TrialSage automates the painful parts of development — INDs, CERs, CSRs — so your pipeline gets to patients sooner.",
    cta: "Read the Results",
    ctaLink: "/case-studies",
    secondaryCta: "Explore the Platform",
    secondaryCtaLink: "/platform",
    color: "rose"
  },
};

const validKeys = Object.keys(variants);

// Helper to resolve persona from session role
const roleMap = {
  RegulatoryLead: "exec",
  Exec: "exec",
  MedicalWriter: "medwriter",
  ClinicalOps: "ops",
  QA: "qa",
  Investor: "investor",
};

// Define button component for hero section
const HeroButton = ({ children, variant = "primary", to, onClick, className = "", color = "emerald" }) => {
  const baseClasses = "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm md:text-base font-medium transition focus:outline-none";
  
  const primaryClasses = {
    emerald: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow focus:ring-2 focus:ring-emerald-400",
    purple: "bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow focus:ring-2 focus:ring-purple-400",
    sky: "bg-sky-600 hover:bg-sky-700 text-white shadow-sm hover:shadow focus:ring-2 focus:ring-sky-400",
    amber: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow focus:ring-2 focus:ring-amber-400",
    rose: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow focus:ring-2 focus:ring-rose-400",
  };
  
  const ghostClasses = {
    emerald: "bg-white dark:bg-slate-900/20 border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-900/50",
    purple: "bg-white dark:bg-slate-900/20 border border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-900/50",
    sky: "bg-white dark:bg-slate-900/20 border border-sky-600 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-900/50",
    amber: "bg-white dark:bg-slate-900/20 border border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-slate-900/50",
    rose: "bg-white dark:bg-slate-900/20 border border-rose-600 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-slate-900/50",
  };
  
  const classes = variant === "primary" ? primaryClasses[color] : ghostClasses[color];
  
  return (
    <a href={to} onClick={onClick} className={`${baseClasses} ${classes} ${className}`}>
      {children}
    </a>
  );
};

export default function HeroMessagingVariants({ t }) {
  const [location] = useLocation();
  const [audience, setAudience] = useState("exec");

  // Detect on first render
  useEffect(() => {
    // 1️⃣ UTM param ?persona=medwriter
    const params = new URLSearchParams(window.location.search);
    const utm = params.get("persona");
    if (utm && validKeys.includes(utm)) {
      setAudience(utm);
      return;
    }
    
    // 2️⃣ For now, we don't have session/auth implementation
    // We'll use localStorage as a fallback to simulate session
    const savedPersona = localStorage.getItem("preferredPersona");
    if (savedPersona && validKeys.includes(savedPersona)) {
      setAudience(savedPersona);
      return;
    }
    
    // Default remains "exec"
  }, [location]);

  // Save audience preference when changed
  useEffect(() => {
    localStorage.setItem("preferredPersona", audience);
  }, [audience]);

  const { headline, subhead, cta, ctaLink, secondaryCta, secondaryCtaLink, color } = variants[audience];

  // Get translated text if t function is available
  const getTranslatedText = (text) => {
    return t ? t(text) : text;
  };

  return (
    <header className="pt-16 pb-12 bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -right-5 top-1/4 w-72 h-72 bg-emerald-500 rounded-full filter blur-3xl"></div>
        <div className="absolute -left-10 bottom-1/4 w-72 h-72 bg-sky-500 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Main content */}
        <div className="grid md:grid-cols-5 gap-8 items-center">
          {/* Left content (3 columns) */}
          <div className="md:col-span-3 text-center md:text-left">
            <div className="inline-block px-3 py-1 mb-4 rounded-full border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-medium">
              {getTranslatedText('Trusted by 100+ Global Pharmaceutical Companies')}
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              <span className={`text-${color}-700 dark:text-${color}-400`}>{getTranslatedText(headline)}</span>
            </h1>
            
            <p className="text-lg mb-6 text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
              {getTranslatedText(subhead)}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 md:justify-start justify-center mb-8">
              <HeroButton to={ctaLink} variant="primary" color={color} className="text-base px-6 py-3">
                {getTranslatedText(cta)}
              </HeroButton>
              <HeroButton to={secondaryCtaLink} variant="ghost" color={color} className="text-base px-6 py-3">
                {getTranslatedText(secondaryCta)}
              </HeroButton>
            </div>
            
            {/* Segment Selector */}
            <div className="flex flex-wrap gap-2 md:justify-start justify-center">
              {validKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setAudience(key)}
                  className={`px-3 py-1 text-xs rounded transition ${
                    key === audience
                      ? `bg-${color}-600 text-white`
                      : "border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Right content - ROI Calculator Preview - 2 columns */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-${color}-500/20 to-sky-500/20 blur-lg`}></div>
              <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-5 w-5 rounded-md bg-gradient-to-br from-${color}-500 to-${color}-700 flex items-center justify-center text-white font-bold text-xs`}>T</div>
                    <span className="font-semibold text-sm">TrialSage Platform</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-100 dark:bg-slate-700/50 p-2 rounded">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Annual Submissions</div>
                      <div className="text-base font-semibold">12</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-slate-700/50 p-2 rounded">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg. Cost per Sub.</div>
                      <div className="text-base font-semibold">$175,000</div>
                    </div>
                  </div>
                </div>
                
                <div className={`bg-${color}-50 dark:bg-${color}-900/20 rounded-lg p-3 mb-3`}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium">Annual Savings</div>
                    <div className={`text-lg font-bold text-${color}-600 dark:text-${color}-400`}>$840,000</div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-${color}-500 rounded-full`} style={{ width: "40%" }}></div>
                  </div>
                  <div className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">40% efficiency gain</div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-sm">
                    <svg className={`w-4 h-4 text-${color}-500 mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Reduced submission time: 14 → 8 weeks
                  </div>
                  <div className="flex items-center text-sm">
                    <svg className={`w-4 h-4 text-${color}-500 mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    27% fewer FDA information requests
                  </div>
                  <div className="flex items-center text-sm">
                    <svg className={`w-4 h-4 text-${color}-500 mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    98.7% document processing accuracy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}