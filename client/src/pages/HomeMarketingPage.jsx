import React, { useEffect } from 'react';
import { Link } from 'wouter';
import Layout from '../components/Layout';
import { ArrowRight } from 'lucide-react';

export default function HomeMarketingPage() {
  useEffect(() => {
    // Scroll to top when the component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="bg-white text-[#1d1d1f]">
        {/* Hero section with Apple styling */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfd] to-[#f5f5f7]"></div>
          <div className="container mx-auto px-6 z-10 max-w-[980px] relative">
            <div className="text-center mb-16">
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
              
              <p className="text-[17px] leading-[1.47059] text-[#86868b] mb-8 max-w-[600px] mx-auto"
                 style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                The complete AI-powered platform that transforms how pharmaceutical companies create, manage, and submit regulatory documents.
              </p>
            </div>
            
            {/* App visualization - simplified */}
            <div className="mx-auto max-w-3xl mb-12">
              <div className="rounded-[20px] overflow-hidden shadow-lg bg-white p-8">
                <div className="bg-[#f5f5f7] h-64 rounded-lg flex items-center justify-center">
                  <div className="text-center px-6">
                    <div className="w-12 h-12 bg-[#06c] rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 15-6-6m6 0-6 6"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">TrialSage™ IND Wizard</h3>
                    <p className="text-[#86868b]">Generate compliant IND submissions with <br/>AI-powered intelligent automation</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action buttons - Apple style */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        </section>
        
        {/* Features section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h3 className="text-[#06c] text-lg font-medium mb-3">Features</h3>
              <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] max-w-3xl mx-auto">
                Everything you need for regulatory excellence
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "IND Wizard™",
                  description: "Build, validate and submit INDs twice as fast with intelligent automation.",
                  color: "#06c",
                  route: "/ind-wizard"
                },
                {
                  title: "Document Vault™",
                  description: "Securely store and manage all regulatory documents with compliance built-in.",
                  color: "#5e5ce6",
                  route: "/versions"
                },
                {
                  title: "Ask Lumen",
                  description: "Your AI guide to regulatory questions and document preparation.",
                  color: "#ff9f0a",
                  route: "/ask-lumen"
                }
              ].map((feature, index) => (
                <div key={index} className="bg-[#f5f5f7] rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                    <div style={{ color: feature.color }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76Z"/>
                        <path d="M16 8 2 22"/>
                        <path d="M17.5 15H9"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">{feature.title}</h3>
                  <p className="text-[#86868b] mb-6">{feature.description}</p>
                  <Link to={feature.route} className="text-[#06c] font-medium flex items-center">
                    Learn more
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="py-24 bg-[#f5f5f7]">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] mb-6">
              Ready to transform your regulatory strategy?
            </h2>
            <p className="text-xl text-[#86868b] mb-10 max-w-2xl mx-auto">
              Join leading pharmaceutical companies accelerating approvals with TrialSage™.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" 
                className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-6 py-3 rounded-full text-lg font-medium">
                Request a Demo
              </Link>
              <Link to="/ask-lumen" 
                className="bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] border border-[#d2d2d7] px-6 py-3 rounded-full text-lg font-medium">
                Try Ask Lumen
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}