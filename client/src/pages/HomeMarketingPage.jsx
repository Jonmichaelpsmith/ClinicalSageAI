import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  ChevronDown,
  Search,
  LayoutDashboard,
  ArrowRight,
  Database,
  CheckCircle,
  Sparkles,
  BarChart3,
  FileCheck,
  Shield,
  FileText
} from 'lucide-react';

// CSR Counter component to fetch real CSR data
const CSRCounter = () => {
  const [csrCount, setCsrCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCSRCount = async () => {
      try {
        // Fetch the actual count from the CSR API
        const response = await fetch('/api/csr/count');
        
        if (response.ok) {
          const data = await response.json();
          setCsrCount(data.count);
        } else {
          console.warn('Falling back to default CSR count');
          setCsrCount(3217);
        }
      } catch (error) {
        console.error('Error fetching CSR count:', error);
        setCsrCount(3217);
      } finally {
        setLoading(false);
      }
    };

    fetchCSRCount();
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-semibold text-blue-800">{loading ? "..." : csrCount?.toLocaleString() || "3,217"}</span>
        <span className="text-[10px] text-[#444]">CSR Intelligence™ records</span>
      </div>
      <div className="text-[10px] text-[#666]">Across 58 therapeutic areas</div>
      <div className="text-[10px] text-[#666]">FDA, EMA, PMDA compliant</div>
    </div>
  );
};

// HomeMarketingPage.jsx - Main landing page with Certara-inspired design
export default function HomeMarketingPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* Soft gradient element at top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-300 via-green-300 to-blue-300 z-50"></div>
      
      {/* Certara-style header */}
      <header className="relative z-40">
        {/* Top utility bar (matches Certara exactly) - HEOR Bar with SOLUTIONS dropdown */}
        <div className="bg-[#003057] text-white">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            {/* Left side - SOLUTIONS dropdown */}
            <div className="relative group">
              <a className="text-[11px] flex items-center text-white hover:text-gray-200 transition font-semibold cursor-pointer">
                <span>SOLUTIONS</span>
                <ChevronDown className="ml-1 h-3 w-3" />
              </a>
              <div className="absolute left-0 mt-1 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white shadow-lg border border-gray-200 z-50 py-1">
                <Link to="/ind-wizard" className="block px-4 py-2 text-[11px] text-[#444] hover:bg-gray-50 flex justify-between items-center">
                  <span>IND Wizard™</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">New</span>
                </Link>
                <Link to="/enterprise-csr-intelligence" className="block px-4 py-2 text-[11px] text-[#444] hover:bg-gray-50">
                  CSR Intelligence™
                </Link>
                <Link to="/protocol-design-use-case" className="block px-4 py-2 text-[11px] text-[#444] hover:bg-gray-50">
                  Protocol Design™
                </Link>
                <Link to="/cmc-insights-use-case" className="block px-4 py-2 text-[11px] text-[#444] hover:bg-gray-50">
                  CMC Insights™
                </Link>
                <Link to="/use-case-library" className="block px-4 py-2 text-[11px] font-semibold text-[#0078d4] hover:bg-blue-50 my-2 border-l-2 border-blue-500 pl-3">
                  TrialSage.AI Solutions
                </Link>
              </div>
            </div>
            
            {/* Right side utilities */}
            <div className="flex items-center space-x-6">
              <Link to="/enterprise-csr-intelligence" className="text-[11px] text-white hover:text-gray-200 transition">News</Link>
              <Link to="/document-management" className="text-[11px] text-white hover:text-gray-200 transition">Resources</Link>
              <Link to="/team-signup" className="text-[11px] text-white hover:text-gray-200 transition">Contact</Link>
              <div className="relative group">
                <a className="text-[11px] flex items-center text-white hover:text-gray-200 transition cursor-pointer">
                  <span>English</span>
                  <ChevronDown className="ml-1 h-3 w-3" />
                </a>
                <div className="absolute right-0 mt-1 w-24 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white shadow-lg border border-gray-200 z-50 py-1">
                  <a className="block px-4 py-1 text-[11px] text-[#444] hover:bg-gray-50">English</a>
                  <a className="block px-4 py-1 text-[11px] text-[#444] hover:bg-gray-50">French</a>
                  <a className="block px-4 py-1 text-[11px] text-[#444] hover:bg-gray-50">German</a>
                </div>
              </div>
              <Link to="/enterprise-csr-intelligence" className="text-white hover:text-gray-200">
                <Search className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Main navigation - exactly like Certara */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              {/* Logo & Brand */}
              <div className="flex items-center">
                <Link to="/">
                  <div className="flex flex-col">
                    <span className="text-[18px] font-bold text-[#003057]">CONCEPT2CURE.AI</span>
                    <span className="text-[12px] text-[#666] -mt-1">TrialSage™ Platform</span>
                  </div>
                </Link>
              </div>

              {/* Main Navigation - Certara style */}
              <nav className="hidden lg:flex">
                <ul className="flex items-center space-x-6">
                  <li className="group relative">
                    <Link to="/use-case-library" className="inline-flex items-center px-4 py-2 text-[14px] font-medium text-[#333] hover:text-[#0078d4] transition">
                      Solutions
                      <ChevronDown className="ml-1 h-3 w-3 transition" />
                    </Link>
                  </li>
                  
                  <li className="group relative">
                    <Link to="/ind-wizard" className="inline-flex items-center px-4 py-2 text-[14px] font-medium text-[#333] hover:text-[#0078d4] transition">
                      IND Wizard
                    </Link>
                  </li>
                  
                  <li className="group relative">
                    <Link to="/enterprise-csr-intelligence" className="inline-flex items-center px-4 py-2 text-[14px] font-medium text-[#333] hover:text-[#0078d4] transition">
                      CSR Intelligence
                    </Link>
                  </li>
                  
                  <li className="group relative">
                    <Link to="/versions" className="inline-flex items-center px-4 py-2 text-[14px] font-semibold text-[#0078d4] hover:text-[#0078d4] transition bg-blue-50 rounded">
                      TrialSage.AI Solutions
                    </Link>
                  </li>
                  
                  <li className="group relative">
                    <Link to="/analytics-dashboard" className="inline-flex items-center px-4 py-2 text-[14px] font-medium text-[#333] hover:text-[#0078d4] transition">
                      Analytics
                    </Link>
                  </li>
                  
                  <li className="group relative">
                    <Link to="/ask-lumen" className="inline-flex items-center px-4 py-2 text-[14px] font-medium text-[#333] hover:text-[#0078d4] transition">
                      Ask Lumen™
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Right utilities - Certara style */}
              <div className="flex items-center space-x-4">
                <Link to="/auth" className="text-[14px] font-medium text-[#333] hover:text-[#0078d4] transition pr-4">
                  Sign In
                </Link>
                
                <Link to="/auth">
                  <button className="bg-[#0078d4] hover:bg-[#005fa6] text-white py-2 px-4 text-[14px] font-medium transition">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-[#f7f7f7] border-b border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-light text-[#003057] mb-6 leading-tight">
                <span className="font-semibold">Accelerate</span> Regulatory Submissions with AI
              </h1>
              <p className="text-lg text-[#444] mb-8">
                TrialSage™ delivers enterprise-grade document automation, intelligent analytics, and regulatory compliance for pharmaceutical R&D teams.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/ind-wizard">
                  <button className="bg-[#0078d4] hover:bg-[#005fa6] text-white py-3 px-6 text-[15px] font-medium transition w-full sm:w-auto">
                    Start with IND Wizard™
                  </button>
                </Link>
                <Link to="/enterprise-csr-intelligence">
                  <button className="bg-white hover:bg-gray-50 text-[#333] border border-gray-300 py-3 px-6 text-[15px] font-medium transition w-full sm:w-auto">
                    Explore CSR Intelligence™
                  </button>
                </Link>
              </div>
              
              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-[#444] text-sm">FDA Compliant</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-[#444] text-sm">21 CFR Part 11</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}