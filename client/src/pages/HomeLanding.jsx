// HomeLanding.jsx – polished buyer‑centric marketing landing page for Concepts2Cures.AI
import React from 'react';
import { Link } from 'wouter';
import { ArrowRight, ShieldCheck, BarChart2, UploadCloud } from 'lucide-react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const logos = [
  'fda.svg','ema.svg','pmda.svg','mhra.svg','tga.svg','nmpa.svg','korea_mfds.svg'
];

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

export default function HomeLanding() {
  const sliderSettings = { arrows:false, infinite:true, autoplay:true, autoplaySpeed:3000, slidesToShow:5, slidesToScroll:1, pauseOnHover:false, cssEase:'linear', responsive:[{breakpoint:768, settings:{slidesToShow:3}}] };

  // Add gradient text style
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `.gradient-text{background:linear-gradient(90deg,#10b981 0%,#3b82f6 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}`;
    document.head.append(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col dark:bg-slate-900">
      {/* Hero */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight gradient-text">Concepts&nbsp;→&nbsp;Cures, 10× Faster</h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          TrialSage® unifies AI‑driven protocol design, regulatory authoring & eCTD submission—turning biotech ambition into approved therapies at warp speed.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/signup" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
            Get Started <ArrowRight size={18}/>
          </Link>
          <Link to="/demo" className="px-6 py-3 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800">Request Live Demo</Link>
        </div>
      </section>

      {/* Logos */}
      <section className="bg-gray-50 dark:bg-slate-800 py-6">
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