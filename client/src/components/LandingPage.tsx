import { useState } from 'react';
import { useLocation } from 'wouter';

// Landing page component for TrialSage
export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="landing-page bg-gradient-to-r from-emerald-600 via-slate-600 to-pink-600 min-h-screen text-white">
      {/* Header with navigation */}
      <header className="p-4 flex justify-between items-center">
        <div className="logo">
          <h1 className="text-xl md:text-2xl font-bold">
            <span className="text-white">TrialSage™ by </span>
            <span className="text-pink-500">Concept2Cures</span>
          </h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#solutions" className="hover:text-pink-200">Solutions</a>
          <a href="#features" className="hover:text-pink-200">Features</a>
          <a href="#ai-technology" className="hover:text-pink-200">AI Technology</a>
          <a href="#about" className="hover:text-pink-200">About</a>
          <a href="#contact" className="hover:text-pink-200">Contact</a>
        </nav>
        
        <div className="auth-buttons flex space-x-2">
          <button className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100">RFP</button>
          <button className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100">Demo</button>
          <button 
            className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
            onClick={() => navigate('/client-portal')}
          >
            Client Login
          </button>
          <button className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100">Support</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">
          TrialSage™: Enterprise Regulatory Intelligence Platform
        </h1>
        <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-12">
          TrialSage™ is a comprehensive AI-powered platform integrating enterprise document
          management, regulatory submissions, and intelligent workflow automation. Our
          Microsoft 365-style UI with advanced retention management exceeds industry
          demands for 21 CFR Part 11 compliance while accelerating submissions by up to
          85%.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-pink-600 hover:bg-pink-700 text-white text-lg px-8 py-3 rounded-md">
            Request Demo
          </button>
          <button className="bg-white/20 hover:bg-white/30 text-white text-lg px-8 py-3 rounded-md">
            Explore Solutions
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black/20 flex flex-wrap justify-center">
        <div className="text-center px-8 py-4 md:w-1/4">
          <div className="text-4xl md:text-5xl font-bold">5,750+</div>
          <div className="text-xl mt-2">Documents Processed</div>
        </div>
        <div className="text-center px-8 py-4 md:w-1/4">
          <div className="text-4xl md:text-5xl font-bold">85%</div>
          <div className="text-xl mt-2">Faster Submissions</div>
        </div>
        <div className="text-center px-8 py-4 md:w-1/4">
          <div className="text-4xl md:text-5xl font-bold">99.7%</div>
          <div className="text-xl mt-2">Audit Compliance</div>
        </div>
        <div className="text-center px-8 py-4 md:w-1/4">
          <div className="text-4xl md:text-5xl font-bold">8</div>
          <div className="text-xl mt-2">Enterprise Modules</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/30 py-12 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">TrialSage™</h3>
            <p>Enterprise Regulatory Intelligence</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Products</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-pink-300">510(k) Automation</a></li>
              <li><a href="#" className="hover:text-pink-300">CER Generator</a></li>
              <li><a href="#" className="hover:text-pink-300">IND Wizard</a></li>
              <li><a href="#" className="hover:text-pink-300">TrialSage Vault</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-pink-300">Documentation</a></li>
              <li><a href="#" className="hover:text-pink-300">Knowledge Base</a></li>
              <li><a href="#" className="hover:text-pink-300">Compliance Guides</a></li>
              <li><a href="#" className="hover:text-pink-300">Webinars</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-pink-300">About Us</a></li>
              <li><a href="#" className="hover:text-pink-300">Contact</a></li>
              <li><a href="#" className="hover:text-pink-300">Careers</a></li>
              <li><a href="#" className="hover:text-pink-300">Press</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/20 text-center">
          <p>© 2025 Concept2Cures. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}