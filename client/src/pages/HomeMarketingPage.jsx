// HomeMarketingPage.jsx - Apple-inspired Premium Design for TrialSage
import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import Layout from '../components/Layout';
import { 
  ArrowRight, 
  Sparkles,
  FileText, 
  Database, 
  Zap, 
  Shield, 
  Globe, 
  CheckCircle,
  Brain,
  Beaker
} from 'lucide-react';

// Apple-style Hero Section for TrialSage
const AppleStyleHero = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Apple's subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfd] to-[#f5f5f7]"></div>
      
      <div className="container mx-auto px-6 z-10 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-4 inline-block">
            <span className="text-[#06c] font-medium text-[17px]">
              Introducing
            </span>
          </div>
          
          <h1 className="text-[40px] sm:text-[48px] lg:text-[56px] font-semibold tracking-tight leading-[1.1] text-[#1d1d1f] mb-4"
              style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
            TrialSage™
          </h1>
          
          <h2 className="text-[24px] sm:text-[27px] font-semibold leading-tight text-[#1d1d1f] mb-5 max-w-3xl mx-auto"
              style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
            Regulatory intelligence. Reimagined.
          </h2>
          
          <p className="text-[17px] leading-[1.47059] text-[#86868b] mb-8 max-w-[600px] mx-auto"
             style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
            The complete AI-powered platform that transforms how pharmaceutical companies 
            create, manage, and submit regulatory documents with unprecedented speed and accuracy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/versions" 
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-[22px] py-[8px] rounded-full text-[17px] font-normal transition-all"
              style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
              See the Document Vault
            </Link>
            <Link to="/ind-wizard" 
              className="bg-white hover:bg-[#f5f5f7] text-[#0071e3] border border-[#d2d2d7] px-[22px] py-[8px] rounded-full text-[17px] font-normal transition-all"
              style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
              Explore IND Wizard
            </Link>
          </div>
        </div>
        
        {/* Product visualization - Apple style with device image */}
        <div className="relative max-w-5xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
            <div className="aspect-video relative">
              {/* Header bar with controls */}
              <div className="absolute top-0 left-0 right-0 h-[40px] bg-[#f5f5f7] border-b border-[#e5e5e7] flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="text-[13px] text-[#86868b] font-medium">TrialSage™ - Regulatory Intelligence Platform</div>
                </div>
              </div>
              
              {/* Application visualization */}
              <div className="absolute top-[40px] left-0 right-0 bottom-0 flex">
                {/* Left sidebar */}
                <div className="w-[220px] border-r border-[#e5e5e7] bg-[#f9f9fa] p-4">
                  <div className="mb-3 text-[14px] font-medium text-[#1d1d1f]">Modules</div>
                  <div className="space-y-2">
                    {[
                      { name: 'IND Wizard', active: true }, 
                      { name: 'CSR Intelligence', active: false },
                      { name: 'Document Vault', active: false },
                      { name: 'Protocol Design', active: false },
                      { name: 'CMC Insights', active: false },
                    ].map((item, idx) => (
                      <div key={idx} className={`py-1.5 px-3 rounded-md text-[13px] ${item.active ? 'bg-[#0071e3] text-white' : 'text-[#4b4b4f] hover:bg-[#f5f5f7]'}`}>
                        {item.name}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Main content area */}
                <div className="flex-1 p-6 bg-white">
                  <div className="mb-6">
                    <div className="text-lg font-semibold text-[#1d1d1f] mb-2">IND Wizard™</div>
                    <div className="text-sm text-[#86868b]">Build your regulatory submission with AI assistance</div>
                  </div>
                  
                  {/* Document structure visualization */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-[#e5e5e7] rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center mr-3">
                          <FileText className="w-4 h-4 text-[#06c]" />
                        </div>
                        <div className="text-sm font-medium">Module Structure</div>
                      </div>
                      <div className="space-y-1.5">
                        {['Module 1: Administrative', 'Module 2: Overview', 'Module 3: Quality', 'Module 4: Nonclinical', 'Module 5: Clinical'].map((module, idx) => (
                          <div key={idx} className="text-xs text-[#4b4b4f] py-1 border-b border-[#f5f5f7] last:border-0">
                            {module}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border border-[#e5e5e7] rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center mr-3">
                          <Sparkles className="w-4 h-4 text-[#06c]" />
                        </div>
                        <div className="text-sm font-medium">AI Assistance</div>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2 bg-[#f5f5f7] rounded text-xs text-[#4b4b4f]">
                          Generating CMC documentation based on product specifications...
                        </div>
                        <div className="text-xs text-[#06c] flex items-center">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI has analyzed 342 similar submissions
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Apple-style product feature showcases
const FeatureSection = () => {
  const features = [
    {
      title: "IND Wizard™",
      description: "Build and submit INDs twice as fast with AI-powered document creation and real-time compliance checks.",
      icon: <Beaker className="w-6 h-6" />,
      color: "#06c",
      bgColor: "#f1f8ff"
    },
    {
      title: "CSR Intelligence™",
      description: "Extract insights from thousands of clinical study reports with advanced natural language processing.",
      icon: <Brain className="w-6 h-6" />,
      color: "#ac39ff",
      bgColor: "#f6f1ff"
    },
    {
      title: "Document Vault™",
      description: "Store, manage and collaborate on regulatory documents with 21 CFR Part 11 compliance built in.",
      icon: <Database className="w-6 h-6" />,
      color: "#00b9e6",
      bgColor: "#f0faff"
    },
    {
      title: "Protocol Design™",
      description: "Create optimized clinical trial protocols using AI-powered insights from successful studies.",
      icon: <FileText className="w-6 h-6" />,
      color: "#66bf4f",
      bgColor: "#f2fbef"
    }
  ];
  
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="text-[#06c] text-lg font-medium mb-3">Features</h3>
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] max-w-3xl mx-auto"
              style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
            Everything you need for regulatory excellence
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-[#e5e5e7] overflow-hidden group">
              {/* Top color bar */}
              <div className="h-1.5 w-full" style={{ backgroundColor: feature.color }}></div>
              
              <div className="p-8">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" 
                     style={{ backgroundColor: feature.bgColor }}>
                  <span style={{ color: feature.color }}>{feature.icon}</span>
                </div>
                
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3"
                    style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  {feature.title}
                </h3>
                <p className="text-[#86868b] mb-6"
                   style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  {feature.description}
                </p>
                
                <div className="text-[#06c] font-medium flex items-center">
                  <span>Learn more</span>
                  <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Apple-style metrics display section
const MetricsSection = () => {
  const metrics = [
    { value: "60%", label: "Time Savings", description: "Average reduction in document preparation" },
    { value: "98%", label: "First-time Approval Rate", description: "For submissions using TrialSage" },
    { value: "$2M+", label: "Cost Savings", description: "Average per regulatory submission" },
    { value: "42%", label: "Increased Productivity", description: "For regulatory affairs teams" },
  ];
  
  return (
    <section className="py-20 bg-[#f5f5f7]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="text-[#06c] font-medium mb-3">Results that matter</h3>
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] max-w-3xl mx-auto"
              style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
            Measurable impact for regulatory teams
          </h2>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md overflow-hidden max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <div key={index} className={`p-8 text-center border-b lg:border-b-0 border-r-0 lg:border-r ${index < metrics.length - 1 ? 'lg:border-[#e5e5e7]' : ''} ${index < metrics.length - 2 ? 'md:border-r md:border-[#e5e5e7]' : ''}`}>
                <h3 className="text-4xl font-semibold text-[#1d1d1f] mb-2"
                    style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  {metric.value}
                </h3>
                <p className="text-lg font-medium text-[#1d1d1f] mb-2">
                  {metric.label}
                </p>
                <p className="text-[#86868b] text-sm">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Apple-style call to action section
const CTASection = () => {
  return (
    <section className="py-20 bg-[#f5f5f7]">
      <div className="container mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden max-w-4xl mx-auto py-16 px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] mb-4 max-w-xl mx-auto"
              style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
            Ready to transform your regulatory strategy?
          </h2>
          <p className="text-[#86868b] mb-8 max-w-xl mx-auto"
             style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
            Join leading pharmaceutical companies accelerating approvals and ensuring compliance with TrialSage™.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" 
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-[22px] py-[8px] rounded-full text-[17px] font-normal transition-all"
              style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
              Request a Demo
            </Link>
            <Link to="/ask-lumen" 
              className="bg-white hover:bg-[#f5f5f7] text-[#0071e3] border border-[#d2d2d7] px-[22px] py-[8px] rounded-full text-[17px] font-normal transition-all"
              style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
              Try Ask Lumen
            </Link>
          </div>
          
          <div className="flex justify-center space-x-12 mt-12">
            <div className="flex flex-col items-center">
              <Shield className="w-5 h-5 text-[#06c] mb-2" />
              <span className="text-xs text-[#86868b]">21 CFR Part 11 Compliant</span>
            </div>
            <div className="flex flex-col items-center">
              <Globe className="w-5 h-5 text-[#06c] mb-2" />
              <span className="text-xs text-[#86868b]">Global Regulatory Support</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="w-5 h-5 text-[#06c] mb-2" />
              <span className="text-xs text-[#86868b]">SOC 2 Type II Certified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Main component
export default function HomeMarketingPage() {
  useEffect(() => {
    // Scroll to top when the component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="bg-white text-[#1d1d1f]">
        <AppleStyleHero />
        <FeatureSection />
        <MetricsSection />
        <CTASection />
      </div>
    </Layout>
  );
}