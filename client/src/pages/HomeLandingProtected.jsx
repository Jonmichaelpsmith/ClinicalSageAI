// HomeLandingProtected.jsx – Official Concept2Cures.AI landing page (DO NOT MODIFY WITHOUT APPROVAL)
// This is the official approved landing page for TrialSage by Concept2Cures.AI
// VERSION: 2.1 RELEASED APR 2025
// LAST APPROVAL: EXECUTIVE TEAM

import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight, ShieldCheck, BarChart2, UploadCloud } from 'lucide-react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
// Import version control system
import { validateComponentIntegrity, logProtectedComponentModificationAttempt } from '../utils/versionControl';

// Define a basic fallback UI in case of render errors
const FallbackUI = () => (
  <div style={{padding: '20px', maxWidth: '800px', margin: '40px auto', fontFamily: 'system-ui, sans-serif'}}>
    <h1 style={{color: '#10b981', marginBottom: '20px'}}>Concept2Cures.AI - TrialSage Platform</h1>
    <p>Welcome to the TrialSage platform by Concept2Cures.AI. Please use the links below to navigate:</p>
    <ul style={{listStyle: 'none', padding: '20px 0'}}>
      <li style={{marginBottom: '15px'}}><a href="/builder" style={{color: '#10b981', padding: '8px 16px', background: '#f0fdf4', border: '1px solid #10b981', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold'}}>eCTD Builder</a></li>
      <li style={{marginBottom: '15px'}}><a href="/portal" style={{color: '#10b981', padding: '8px 16px', background: '#f0fdf4', border: '1px solid #10b981', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold'}}>Client Portal</a></li>
      <li style={{marginBottom: '15px'}}><a href="/csr-library" style={{color: '#10b981', padding: '8px 16px', background: '#f0fdf4', border: '1px solid #10b981', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold'}}>CSR Intelligence</a></li>
    </ul>
    <p style={{marginTop: '20px', fontSize: '14px', color: '#666'}}>
      © 2025 Concept2Cures.AI • All rights reserved
    </p>
  </div>
);

// PROTECTED: DO NOT MODIFY THESE BRAND ASSETS WITHOUT EXECUTIVE APPROVAL
const logos = [
  'fda.svg','ema.svg','pmda.svg','mhra.svg','tga.svg','nmpa.svg','korea_mfds.svg'
];

// PROTECTED: DO NOT MODIFY THESE PRODUCT FEATURES WITHOUT PRODUCT TEAM APPROVAL
const features = [
  {
    icon: <ShieldCheck size={32} className="text-emerald-600"/>,
    title: 'Regulatory‑Grade Automation',
    desc: 'Fully compliant IND, CTA & CSR generation with built‑in FDA, EMA & PMDA rulesets.'
  },
  {
    icon: <BarChart2 size={32} className="text-emerald-600"/>,
    title: 'Deep Intelligence Library',
    desc: '892 real‑world trial benchmarks & 14 AI models predict risk, cost & enrollment speed.'
  },
  {
    icon: <UploadCloud size={32} className="text-emerald-600"/>,
    title: 'One‑Click ESG / CESP / PMDA upload',
    desc: 'Push‑button submission with automated ACK tracking & dashboards.'
  }
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
    
    // In a production environment, this could also:
    // 1. Send an alert to administrators
    // 2. Revert the file to its last known good state
    // 3. Disable functionality until verified by authorized personnel
  }
  return isValid;
};

export default function HomeLanding() {
  const sliderSettings = { arrows:false, infinite:true, autoplay:true, autoplaySpeed:3000, slidesToShow:5, slidesToScroll:1, pauseOnHover:false, cssEase:'linear', responsive:[{breakpoint:768, settings:{slidesToShow:3}}] };

  // Add gradient text style and debug info
  React.useEffect(() => {
    // Verify version integrity on component load
    if (!verifyVersionIntegrity()) {
      console.error("Landing page integrity check failed. Please contact the development team.");
    }
    
    // Add diagnostic logging
    console.log("TrialSage/Concept2Cures.AI landing page loaded");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Current route:", window.location.pathname);
    console.log("Slider settings:", sliderSettings);
    
    // Create the gradient style
    const style = document.createElement('style');
    style.textContent = `.gradient-text{background:linear-gradient(90deg,#10b981 0%,#3b82f6 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}`;
    document.head.append(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const now = new Date();
  
  return (
    <div className="min-h-screen flex flex-col dark:bg-slate-900">
      {/* Indicator for rendering */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        background: 'red',
        color: 'white',
        padding: '5px 10px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        Concept2Cures.AI Landing - {now.toLocaleTimeString()}
      </div>
      
      {/* Navigation Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center">
            <span className="text-xl font-bold gradient-text">Concepts2Cures.AI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300">Products</Link>
            <Link to="/solutions" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300">Solutions</Link>
            <Link to="/csr-library" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300">CSR Intelligence</Link>
            <Link to="/portal" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300">Client Portal</Link>
            <Link to="/builder" className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">eCTD Builder</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight gradient-text">Concepts&nbsp;→&nbsp;Cures, 10× Faster</h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          TrialSage® unifies AI‑driven protocol design, regulatory authoring & eCTD submission—turning biotech ambition into approved therapies at warp speed.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/builder" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
            Open eCTD Builder <ArrowRight size={18}/>
          </Link>
          <Link to="/csr-library" className="px-6 py-3 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800">CSR Intelligence</Link>
        </div>
      </section>

      {/* Logos */}
      <section className="bg-gray-50 dark:bg-slate-800 py-6">
        <h3 className="text-center text-sm uppercase text-gray-500 dark:text-gray-400 mb-4">Trusted by global regulatory authorities</h3>
        <Slider {...sliderSettings} className="container mx-auto flex items-center">
          {logos.map((l,i)=>(
            <div key={i} className="px-4 opacity-70 grayscale hover:opacity-100 transition">
              <img src={`/static/logos/${l}`} alt={l} className="h-12 mx-auto"/>
            </div>
          ))}
        </Slider>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Why biotechs choose TrialSage</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f,i)=>(
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 text-center">
              {f.icon}
              <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROI Banner */}
      <section className="bg-emerald-600 text-white py-14 text-center">
        <h2 className="text-2xl font-semibold">See how much time & budget you can reclaim</h2>
        <p className="mt-2 opacity-90">Our ROI calculator quantifies savings across CMC, medical writing & regulatory ops.</p>
        <Link to="/roi" className="inline-block mt-6 bg-white text-emerald-600 font-medium px-6 py-3 rounded shadow hover:bg-gray-50">Calculate ROI</Link>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Concepts2Cures.AI • All rights reserved
      </footer>
    </div>
  );
}