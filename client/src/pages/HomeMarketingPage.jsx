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
      className="relative min-h-screen w-full overflow-hidden bg-white flex items-center justify-center"
      style={{
        paddingTop: Math.max(120 - scrollY * 0.5, 30) + 'px',
        paddingBottom: Math.max(120 - scrollY * 0.5, 30) + 'px',
      }}
    >
      <div className="absolute inset-0 w-full h-full bg-[#FAFAFA]"></div>
      
      {/* Content container */}
      <div className="container mx-auto px-6 z-10 max-w-6xl">
        <div className="text-center mb-16">
          <motion.h5 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-[#06c] font-medium mb-4 tracking-tight"
          >
            Introducing
          </motion.h5>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-semibold tracking-tight text-[#1d1d1f] mb-6"
          >
            TrialSage™
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl md:text-3xl font-medium text-[#1d1d1f] mb-4 max-w-3xl mx-auto"
          >
            Regulatory intelligence.
            <span className="block">Reimagined.</span>
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg text-[#86868b] mb-12 max-w-2xl mx-auto"
          >
            The complete AI-powered platform for regulatory excellence.
          </motion.p>
        </div>
        
        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="relative mx-auto max-w-4xl"
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative aspect-[16/9] bg-gradient-to-br from-[#f5f5f7] to-[#fafafa]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4/5 h-4/5 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                  <div className="h-10 bg-[#f5f5f7] border-b border-[#e5e5e7] flex items-center px-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                    </div>
                  </div>
                  <div className="flex-1 p-6 flex">
                    {/* Left panel - Document structure */}
                    <div className="w-1/4 border-r border-[#e5e5e7] pr-4">
                      <div className="mb-3 text-sm font-medium text-[#1d1d1f]">IND Structure</div>
                      <div className="space-y-2">
                        {['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5'].map((module, idx) => (
                          <div key={idx} className={`py-1 px-2 rounded-md text-sm ${idx === 2 ? 'bg-[#0066cc1a] text-[#0066cc]' : 'text-[#4b4b4f]'}`}>
                            {module}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Right panel - Document editor */}
                    <div className="flex-1 pl-6">
                      <div className="flex justify-between mb-4">
                        <div className="text-lg font-medium text-[#1d1d1f]">Module 3: Quality</div>
                        <div className="bg-[#0066cc] text-white text-sm py-1 px-3 rounded-full">AI Assistance</div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-[#f5f5f7] h-4 rounded w-full"></div>
                        <div className="bg-[#f5f5f7] h-4 rounded w-5/6"></div>
                        <div className="bg-[#f5f5f7] h-4 rounded w-4/5"></div>
                        <div className="bg-[#f5f5f7] h-4 rounded w-full"></div>
                        <div className="bg-[#f5f5f7] h-4 rounded w-3/4"></div>
                        <div className="mt-6 flex items-center text-[#0066cc]">
                          <Sparkles className="w-4 h-4 mr-2" />
                          <span className="text-sm">AI is generating compliant CMC content...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Action buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-5 justify-center mt-12"
        >
          <Link to="/versions" className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-8 py-3 rounded-full font-medium text-lg transition-all">
            Try Document Vault
          </Link>
          <Link to="/ind-wizard" className="bg-transparent border border-[#0071e3] hover:bg-[#0071e3]/5 text-[#0071e3] px-8 py-3 rounded-full font-medium text-lg transition-all">
            Explore IND Wizard
          </Link>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronDown className="w-6 h-6 text-[#86868b]" />
      </motion.div>
    </section>
  );
};

// Apple-style product showcase component
const ProductShowcase = ({ title, description, features, reversed }) => {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className={`text-${reversed ? 'right' : 'left'} mb-12`}
        >
          <h3 className="text-[#06c] mb-3 text-lg font-medium">{title}</h3>
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] tracking-tight">{description}</h2>
        </motion.div>
        
        {/* Feature grid - Apple style with clean UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mt-20">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Apple-style feature card */}
              <div className="relative bg-[#f5f5f7] rounded-3xl overflow-hidden group">
                {/* Feature top color bar - different color per feature */}
                <div className={`h-1.5 w-full ${
                  index % 4 === 0 ? 'bg-[#06c]' : 
                  index % 4 === 1 ? 'bg-[#ac39ff]' : 
                  index % 4 === 2 ? 'bg-[#00b9e6]' : 
                  'bg-[#66bf4f]'
                }`}></div>
                
                <div className="p-8">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                    <CheckCircle2 className={`w-5 h-5 ${
                      index % 4 === 0 ? 'text-[#06c]' : 
                      index % 4 === 1 ? 'text-[#ac39ff]' : 
                      index % 4 === 2 ? 'text-[#00b9e6]' : 
                      'text-[#66bf4f]'
                    }`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">{feature.title}</h3>
                  <p className="text-[#86868b] leading-relaxed">{feature.description}</p>
                  
                  {/* Feature visualization - stylized */}
                  <div className="mt-8 h-32 bg-white rounded-xl overflow-hidden shadow-sm">
                    <div className="h-full w-full flex items-center justify-center">
                      <div className={`w-5/6 h-4/6 ${
                        index % 4 === 0 ? 'bg-[#e9f0fd]' : 
                        index % 4 === 1 ? 'bg-[#f5edff]' : 
                        index % 4 === 2 ? 'bg-[#e5f6fb]' : 
                        'bg-[#e8f5e3]'
                      } rounded-lg flex items-center justify-center`}>
                        <div className={`h-2 w-20 rounded-full ${
                          index % 4 === 0 ? 'bg-[#06c]' : 
                          index % 4 === 1 ? 'bg-[#ac39ff]' : 
                          index % 4 === 2 ? 'bg-[#00b9e6]' : 
                          'bg-[#66bf4f]'
                        } opacity-60`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Learn more link - Apple style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Link to={`/${title.toLowerCase().replace(/\s+/g, '-')}`} 
            className="group inline-flex items-center text-[#06c] font-medium hover:underline">
            <span>Learn more about {title}</span>
            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// Apple-style metrics display component
const MetricsDisplay = () => {
  const metrics = [
    { value: '60%', label: 'Time Savings', description: 'Average reduction in document preparation' },
    { value: '98%', label: 'First-time Approval Rate', description: 'For submissions using TrialSage' },
    { value: '$2M+', label: 'Cost Savings', description: 'Average per regulatory submission' },
    { value: '42%', label: 'Increased Productivity', description: 'For regulatory affairs teams' },
  ];
  
  return (
    <section className="py-32 bg-[#f5f5f7]">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-24"
        >
          <h3 className="text-[#06c] font-medium mb-3">Results that matter</h3>
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] max-w-3xl mx-auto">
            Measurable impact for regulatory teams
          </h2>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden bg-white shadow-xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-10 text-center ${index !== metrics.length - 1 ? 'border-r border-[#e5e5e7] lg:border-r md:border-b lg:border-b-0' : ''} ${index < metrics.length - (metrics.length % 2) ? 'border-b border-[#e5e5e7]' : ''}`}
              >
                <div className="inline-block">
                  <h3 className="text-5xl font-semibold text-[#1d1d1f] mb-3">{metric.value}</h3>
                  <div className={`h-1 w-16 mx-auto ${
                    index % 4 === 0 ? 'bg-[#06c]' : 
                    index % 4 === 1 ? 'bg-[#ac39ff]' : 
                    index % 4 === 2 ? 'bg-[#00b9e6]' : 
                    'bg-[#66bf4f]'
                  } mb-4`}></div>
                </div>
                <p className="text-xl font-medium text-[#1d1d1f] mb-2">{metric.label}</p>
                <p className="text-[#86868b]">{metric.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 text-center"
        >
          <p className="text-[#86868b] text-sm max-w-2xl mx-auto">
            Based on aggregated customer experience data. Individual results may vary depending on implementation scope and regulatory context.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Apple-style CTA section
const CTASection = () => {
  return (
    <section className="py-32 bg-[#f5f5f7] relative overflow-hidden">
      {/* Apple-style gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-[#f5f5f7]"></div>
      
      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h3 className="text-[#06c] font-medium mb-3">Ready to get started?</h3>
          <h2 className="text-4xl md:text-6xl font-semibold text-[#1d1d1f] mb-6 tracking-tight">
            Transform your regulatory strategy
          </h2>
          <p className="text-xl text-[#86868b] mb-10 max-w-2xl mx-auto leading-relaxed">
            Join leading pharmaceutical companies accelerating approvals and ensuring compliance with TrialSage.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5 mt-12">
            <Link to="/contact" className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-8 py-4 rounded-full font-medium text-lg transition-all">
              Request a Demo
            </Link>
            <Link to="/ask-lumen" className="bg-[#f5f5f7] hover:bg-[#e5e5e7] text-[#1d1d1f] border border-[#d2d2d7] px-8 py-4 rounded-full font-medium text-lg transition-all">
              Try Ask Lumen
            </Link>
          </div>
          
          <div className="mt-20 max-w-3xl mx-auto border-t border-[#d2d2d7] pt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Shield className="w-6 h-6 text-[#06c]" />
                </div>
                <p className="text-[#1d1d1f] font-medium mb-1">21 CFR Part 11 Compliant</p>
                <p className="text-[#86868b] text-sm">Complete audit trails and E-signatures</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Award className="w-6 h-6 text-[#06c]" />
                </div>
                <p className="text-[#1d1d1f] font-medium mb-1">SOC 2 Type II Certified</p>
                <p className="text-[#86868b] text-sm">Enterprise-grade security</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Globe className="w-6 h-6 text-[#06c]" />
                </div>
                <p className="text-[#1d1d1f] font-medium mb-1">Global Support</p>
                <p className="text-[#86868b] text-sm">FDA, EMA, and PMDA compliant</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Apple-style products grid - fully matches Apple.com design language
const ProductCards = () => {
  const products = [
    {
      title: "IND Wizard™",
      description: "Build, validate and submit INDs twice as fast with intelligent automation and templates.",
      icon: <Wand2 className="w-6 h-6" />,
      bgColor: "#d1e4ff",
      iconColor: "#06c",
      route: "/ind-wizard"
    },
    {
      title: "CSR Intelligence™",
      description: "Extract insights from thousands of clinical study reports to optimize trial designs.",
      icon: <Sparkles className="w-6 h-6" />,
      bgColor: "#e8ecfd",
      iconColor: "#5e5ce6",
      route: "/csr-library"
    },
    {
      title: "Document Vault™",
      description: "Securely store, manage, and collaborate on regulatory documents with 21 CFR Part 11 compliance.",
      icon: <Database className="w-6 h-6" />,
      bgColor: "#f5e6ff",
      iconColor: "#bf5af2",
      route: "/versions"
    },
    {
      title: "Protocol Design™",
      description: "Create optimized protocols using AI-powered insights from successful trials.",
      icon: <FileText className="w-6 h-6" />,
      bgColor: "#d9f8ff",
      iconColor: "#00c7be",
      route: "/protocol-optimization"
    },
    {
      title: "CMC Insights™",
      description: "Streamline Chemistry, Manufacturing, and Controls documentation with intelligent templates.",
      icon: <Bookmark className="w-6 h-6" />,
      bgColor: "#e3f5e3",
      iconColor: "#34c759",
      route: "/cmc-module"
    },
    {
      title: "Ask Lumen",
      description: "Get instant answers to regulatory questions from our specialized AI assistant.",
      icon: <Globe className="w-6 h-6" />,
      bgColor: "#fff8e3",
      iconColor: "#ff9f0a", 
      route: "/ask-lumen"
    }
  ];
  
  return (
    <section className="py-36 bg-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <h3 className="text-[#06c] mb-3 text-lg font-medium">Features</h3>
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] max-w-2xl mx-auto">
            Everything you need for regulatory excellence
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={product.route} className="block">
                <div className="group">
                  {/* Card with Apple-style subtle styling */}
                  <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e7] overflow-hidden hover:shadow-md transition-all duration-300">
                    {/* Top colored section with icon */}
                    <div 
                      className="p-6 flex items-center"
                      style={{ backgroundColor: product.bgColor }}
                    >
                      <div 
                        className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
                        style={{ color: product.iconColor }}
                      >
                        {product.icon}
                      </div>
                    </div>
                    
                    {/* Content section */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2 group-hover:text-[#06c] transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-[#86868b]">
                        {product.description}
                      </p>
                    </div>
                    
                    {/* Footer with arrow link - Apple style */}
                    <div className="px-6 pb-6">
                      <div className="flex items-center text-[#06c] font-medium">
                        <span>Learn more</span>
                        <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
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
      <div className="bg-black text-white">
        {/* Apple-style hero section */}
        <AppleHero />
        
        {/* Product showcase sections */}
        <ProductShowcase 
          title="IND Wizard™" 
          description="Streamline the IND preparation process with AI-powered tools that automatically generate, validate, and compile submission-ready documents."
          imageSrc="https://i.imgur.com/2cE17xz.jpg"
          features={[
            { title: "Rapid Document Creation", description: "Generate compliant IND documents in minutes, not weeks" },
            { title: "Intelligent Validation", description: "Real-time error checking and compliance validation" },
            { title: "Pre-IND Planning", description: "Strategic guidance based on thousands of successful submissions" },
            { title: "Auto-Assembly", description: "One-click compilation of complete submission packages" }
          ]}
          primaryColor="blue"
        />
        
        <ProductShowcase 
          title="Document Vault™" 
          description="Securely store, manage, and track all your regulatory documents with powerful version control and collaboration features."
          imageSrc="https://i.imgur.com/yMY3q50.jpg"
          features={[
            { title: "21 CFR Part 11 Compliant", description: "Secure electronic signatures and audit trails" },
            { title: "Version Control", description: "Track changes and maintain document history" },
            { title: "Collaborative Workflow", description: "Streamlined review and approval processes" },
            { title: "Global Accessibility", description: "Access your documents securely from anywhere" }
          ]}
          reversed={true}
          primaryColor="indigo"
        />
        
        {/* Metrics display */}
        <MetricsDisplay />
        
        {/* Product cards grid */}
        <ProductCards />
        
        {/* CTA section */}
        <CTASection />
      </div>
    </Layout>
  );
}