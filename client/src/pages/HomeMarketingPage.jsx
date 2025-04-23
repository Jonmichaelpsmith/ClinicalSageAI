import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { 
  ArrowRight, 
  CheckCircle2, 
  Shield, 
  Clock, 
  FileText, 
  Database, 
  Sparkles,
  ChevronDown,
  Play,
  Bookmark,
  Globe,
  Award,
  Wand2
} from 'lucide-react';

// Apple-style modern hero component
const AppleHero = () => {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      ref={heroRef} 
      className="relative min-h-[90vh] w-full overflow-hidden bg-white flex items-center justify-center"
      style={{
        paddingTop: Math.max(100 - scrollY * 0.4, 20) + 'px',
        paddingBottom: Math.max(100 - scrollY * 0.4, 20) + 'px',
      }}
    >
      {/* Apple-style extremely subtle gradient background */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#fbfbfd] to-[#f5f5f7]"></div>
      
      {/* Content container */}
      <div className="container mx-auto px-6 z-10 max-w-[980px]">
        <div className="text-center mb-16">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-[#06c] font-medium mb-1 tracking-tight text-[17px]"
          >
            Introducing
          </motion.p>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-[1.1] text-[#1d1d1f] mb-1"
            style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}
          >
            TrialSage™
          </motion.h1>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[21px] md:text-[27px] font-semibold leading-tight text-[#1d1d1f] mb-3 max-w-2xl mx-auto"
            style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}
          >
            Regulatory intelligence. Reimagined.
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-[17px] leading-[1.47059] text-[#86868b] mb-8 max-w-[600px] mx-auto"
            style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}
          >
            The complete AI-powered platform that transforms how pharmaceutical companies create, manage, and submit regulatory documents.
          </motion.p>
        </div>
        
        {/* Hero image - Apple Style */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="relative mx-auto max-w-3xl"
        >
          <div className="rounded-[20px] overflow-hidden shadow-[0_8px_42px_rgba(0,0,0,0.12)]">
            <div className="relative aspect-[16/9] bg-gradient-to-br from-[#f5f5f7] to-[#fff]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[85%] h-[85%] bg-white rounded-[18px] shadow-[0_4px_30px_rgba(0,0,0,0.09)] overflow-hidden flex flex-col">
                  <div className="h-[38px] bg-[#f2f2f7] border-b border-[#d2d2d7] flex items-center px-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="text-[13px] text-[#86868b] font-medium">TrialSage™ IND Wizard</div>
                    </div>
                  </div>
                  <div className="flex-1 p-6 flex">
                    {/* Left panel - Document structure */}
                    <div className="w-[25%] border-r border-[#e5e5e7] pr-4">
                      <div className="mb-3 text-[13px] font-medium text-[#1d1d1f]">IND Structure</div>
                      <div className="space-y-2">
                        {['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5'].map((module, idx) => (
                          <div key={idx} className={`py-1 px-2 rounded-md text-[13px] ${idx === 2 ? 'bg-[#0066cc1a] text-[#0066cc]' : 'text-[#4b4b4f]'}`}>
                            {module}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Right panel - Document editor */}
                    <div className="flex-1 pl-6">
                      <div className="flex justify-between mb-4">
                        <div className="text-[15px] font-medium text-[#1d1d1f]">Module 3: Quality</div>
                        <div className="bg-[#0071e3] text-white text-[12px] py-1 px-3 rounded-full">AI Assistance</div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-[#f5f5f7] h-4 rounded-[4px] w-full"></div>
                        <div className="bg-[#f5f5f7] h-4 rounded-[4px] w-5/6"></div>
                        <div className="bg-[#f5f5f7] h-4 rounded-[4px] w-4/5"></div>
                        <div className="bg-[#f5f5f7] h-4 rounded-[4px] w-full"></div>
                        <div className="bg-[#f5f5f7] h-4 rounded-[4px] w-3/4"></div>
                        <div className="mt-6 flex items-center text-[#0066cc]">
                          <Sparkles className="w-4 h-4 mr-2" />
                          <span className="text-[13px]">AI is generating compliant CMC content...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Action buttons - Exact Apple style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
        >
          <Link to="/versions" 
            className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-[22px] py-[8px] rounded-full text-[17px] font-normal transition-all"
            style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}
          >
            See the Document Vault
          </Link>
          <Link to="/ind-wizard" 
            className="bg-white hover:bg-[#f5f5f7] text-[#0071e3] border border-[#d2d2d7] px-[22px] py-[8px] rounded-full text-[17px] font-normal transition-all"
            style={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif" }}
          >
            Explore IND Wizard
          </Link>
        </motion.div>
      </div>
      
      {/* Scroll indicator - Apple subtle style */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronDown className="w-5 h-5 text-[#86868b]" />
      </motion.div>
    </section>
  );
};

// Simple Feature Section
const SimpleFeatureSection = () => {
  return (
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
              icon: <Wand2 className="text-[#06c]" />,
              route: "/ind-wizard"
            },
            {
              title: "Document Vault™",
              description: "Securely store and manage all regulatory documents with compliance built-in.",
              icon: <Database className="text-[#5e5ce6]" />,
              route: "/versions"
            },
            {
              title: "Ask Lumen",
              description: "Your AI guide to regulatory questions and document preparation.",
              icon: <Globe className="text-[#ff9f0a]" />,
              route: "/ask-lumen"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-[#f5f5f7] rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-6">
                {feature.icon}
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
  );
};

// Simple CTA section
const SimpleCTA = () => {
  return (
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
        <AppleHero />
        <SimpleFeatureSection />
        <SimpleCTA />
      </div>
    </Layout>
  );
}