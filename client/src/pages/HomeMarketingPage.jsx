import React, { useEffect } from 'react';
import { Link } from 'wouter';
import Layout from '../components/Layout';
import { ArrowRight, Sparkles, Shield, Database, FileText, Globe } from 'lucide-react';

export default function HomeMarketingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="bg-white text-[#1d1d1f]">
        {/* Hero section with Apple styling */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfd] to-[#f5f5f7]"></div>
          <div className="container mx-auto px-6 relative z-10 max-w-[980px]">
            <div className="text-center mb-20">
              <p className="text-[#06c] font-medium mb-1 tracking-tight text-[17px]">
                Introducing
              </p>
              
              <h1 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-[1.1] text-[#1d1d1f] mb-1"
                  style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                TrialSage™
              </h1>
              
              <h2 className="text-[21px] md:text-[27px] font-semibold leading-tight text-[#1d1d1f] mb-3 max-w-2xl mx-auto"
                  style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Regulatory intelligence. Reimagined.
              </h2>
              
              <p className="text-[17px] leading-[1.47059] text-[#86868b] mb-12 max-w-[600px] mx-auto"
                 style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                The complete AI-powered platform that transforms how pharmaceutical companies create, manage, and submit regulatory documents.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
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
            
            {/* App visualization - simplified */}
            <div className="mx-auto max-w-3xl mb-20 rounded-2xl overflow-hidden shadow-lg bg-white">
              <div className="h-10 bg-[#f5f5f7] border-b border-[#e5e5e7] flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="text-[13px] text-[#86868b] font-medium">TrialSage™ Platform</div>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1 bg-[#f5f5f7] rounded-lg p-4">
                    <div className="font-medium text-[#1d1d1f] mb-3">Modules</div>
                    <div className="space-y-2">
                      <div className="bg-[#0071e3] text-white py-1 px-3 rounded-md text-sm">IND Wizard™</div>
                      <div className="text-[#4b4b4f] py-1 px-3 rounded-md text-sm">CSR Intelligence™</div>
                      <div className="text-[#4b4b4f] py-1 px-3 rounded-md text-sm">Document Vault™</div>
                      <div className="text-[#4b4b4f] py-1 px-3 rounded-md text-sm">Protocol Design™</div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="font-medium text-[#1d1d1f] mb-3">AI-Powered Document Generation</div>
                    <div className="space-y-3">
                      <div className="bg-[#f5f5f7] h-6 rounded w-full"></div>
                      <div className="bg-[#f5f5f7] h-6 rounded w-5/6"></div>
                      <div className="bg-[#f5f5f7] h-6 rounded w-full"></div>
                      <div className="bg-[#f5f5f7] h-6 rounded w-4/6"></div>
                      <div className="flex items-center text-[#06c] mt-6">
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span className="text-sm">AI is generating compliant content...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features section - Apple style cards */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-[#06c] text-lg font-medium mb-3">Features</h3>
              <h2 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] max-w-3xl mx-auto"
                  style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Everything you need for regulatory excellence
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: "IND Wizard™",
                  description: "Build INDs twice as fast with AI-powered templates and validation.",
                  icon: <FileText className="w-6 h-6 text-[#06c]" />,
                  color: "#f1f8ff",
                  route: "/ind-wizard"
                },
                {
                  title: "Document Vault™",
                  description: "21 CFR Part 11 compliant storage with version control.",
                  icon: <Database className="w-6 h-6 text-[#5e5ce6]" />,
                  color: "#f6f1ff",
                  route: "/versions"
                },
                {
                  title: "CSR Intelligence™",
                  description: "Extract insights from clinical study reports automatically.",
                  icon: <Sparkles className="w-6 h-6 text-[#00b9e6]" />,
                  color: "#f0faff",
                  route: "/csr-library"
                },
                {
                  title: "Ask Lumen",
                  description: "Your AI guide to regulatory questions and documents.",
                  icon: <Globe className="w-6 h-6 text-[#ff9f0a]" />,
                  color: "#fff8ec",
                  route: "/ask-lumen"
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-[#e5e5e7] p-6 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-full mb-5 flex items-center justify-center" style={{ backgroundColor: feature.color }}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2"
                      style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                    {feature.title}
                  </h3>
                  <p className="text-[#86868b] text-sm mb-4"
                     style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                    {feature.description}
                  </p>
                  <Link to={feature.route} className="text-[#06c] text-sm font-medium flex items-center">
                    Learn more
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Metrics section */}
        <section className="py-24 bg-[#f5f5f7]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-[#06c] font-medium mb-3">Results that matter</h3>
              <h2 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] max-w-3xl mx-auto"
                  style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Measurable impact for regulatory teams
              </h2>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { value: "60%", label: "Time Savings", desc: "Document preparation" },
                  { value: "98%", label: "Approval Rate", desc: "First-time submissions" },
                  { value: "$2M+", label: "Cost Savings", desc: "Per submission" },
                  { value: "42%", label: "Productivity", desc: "For regulatory teams" }
                ].map((metric, index) => (
                  <div key={index} className="p-8 text-center border-b lg:border-b-0 lg:border-r border-[#e5e5e7] last:border-r-0">
                    <h3 className="text-3xl font-semibold text-[#1d1d1f] mb-1"
                        style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                      {metric.value}
                    </h3>
                    <p className="font-medium text-[#1d1d1f] mb-1">
                      {metric.label}
                    </p>
                    <p className="text-[#86868b] text-xs">
                      {metric.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="py-24 bg-[#f5f5f7]">
          <div className="container mx-auto px-6">
            <div className="bg-white rounded-xl shadow-sm p-12 text-center max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#1d1d1f] mb-4 max-w-xl mx-auto"
                  style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Ready to transform your regulatory strategy?
              </h2>
              <p className="text-[#86868b] mb-8 max-w-xl mx-auto"
                 style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Join leading pharmaceutical companies using TrialSage™ for faster approvals.
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
              
              <div className="mt-10 flex justify-center gap-8">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-[#06c] mr-2" />
                  <span className="text-xs text-[#86868b]">21 CFR Part 11 Compliant</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 text-[#06c] mr-2" />
                  <span className="text-xs text-[#86868b]">Global Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}