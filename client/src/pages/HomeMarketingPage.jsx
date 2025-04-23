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
  ChevronRight,
  Play,
  Bookmark,
  Globe,
  Award,
  Wand2
} from 'lucide-react';

// Apple-style animated hero component with parallax effect
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
      className="relative h-screen w-full overflow-hidden bg-black text-white flex items-center"
    >
      {/* Parallax background */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: "url('https://i.imgur.com/jKQnRHw.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateY(${scrollY * 0.5}px)`,
          opacity: 1 - scrollY / 1000,
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
      
      {/* Content */}
      <div className="container mx-auto px-6 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h5 className="text-blue-400 font-medium mb-3">Introducing</h5>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
              TrialSage™
            </span>
          </h1>
          <p className="text-xl md:text-2xl font-light text-gray-300 mb-6">
            Regulatory intelligence. Reimagined.
          </p>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            The complete AI-powered platform that transforms how pharmaceutical companies create, manage, and submit regulatory documents.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/versions" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105">
              See the Document Vault
            </Link>
            <Link to="/ind-wizard" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-full font-medium transition-all">
              Explore IND Wizard
            </Link>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronRight className="w-8 h-8 text-white/60 rotate-90" />
      </motion.div>
    </section>
  );
};

// Apple-style product showcase component
const ProductShowcase = ({ title, description, imageSrc, features, reversed, primaryColor = 'blue' }) => {
  return (
    <section className={`py-20 ${reversed ? 'bg-gradient-to-br from-gray-900 to-gray-950' : 'bg-black'} text-white`}>
      <div className="container mx-auto px-6">
        <div className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}>
          {/* Image */}
          <motion.div 
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, x: reversed ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative">
              <div className={`absolute inset-0 bg-${primaryColor}-500/20 blur-2xl rounded-full transform scale-90 -z-10`}></div>
              <img 
                src={imageSrc} 
                alt={title} 
                className="w-full h-auto rounded-2xl shadow-2xl" 
              />
            </div>
          </motion.div>
          
          {/* Content */}
          <motion.div 
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 text-${primaryColor}-400`}>{title}</h2>
            <p className="text-xl text-gray-300 mb-8">{description}</p>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle2 className={`w-6 h-6 text-${primaryColor}-500 mt-0.5 mr-3 flex-shrink-0`} />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <Link to={`/${title.toLowerCase().replace(/\s+/g, '-')}`} className="group flex items-center text-lg font-medium text-blue-400 hover:text-blue-300 transition-colors">
                Learn more about {title}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Apple-style metrics display
const MetricsDisplay = () => {
  const metrics = [
    { value: '60%', label: 'Time Savings', description: 'Average reduction in document preparation' },
    { value: '98%', label: 'First-time Approval Rate', description: 'For submissions using TrialSage' },
    { value: '$2M+', label: 'Cost Savings', description: 'Average per regulatory submission' },
    { value: '42%', label: 'Increased Productivity', description: 'For regulatory affairs teams' },
  ];
  
  return (
    <section className="py-20 bg-gradient-to-br from-blue-950 to-indigo-950 text-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Measurable Impact</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">TrialSage delivers meaningful results for regulatory teams worldwide</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/10 hover:border-blue-500/30 transition-colors"
            >
              <h3 className="text-4xl font-bold text-white mb-2">{metric.value}</h3>
              <p className="text-lg font-medium text-blue-300 mb-2">{metric.label}</p>
              <p className="text-gray-400">{metric.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Apple-style CTA section
const CTASection = () => {
  return (
    <section className="py-24 bg-black text-white relative overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-700 rounded-full filter blur-3xl opacity-20 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-700 rounded-full filter blur-3xl opacity-20 transform translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Transform Your Regulatory Strategy</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Join leading pharmaceutical companies that are accelerating approvals, reducing costs, and ensuring compliance with TrialSage.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/contact" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-medium text-lg transition-all transform hover:scale-105">
              Request a Demo
            </Link>
            <Link to="/ask-lumen" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-full font-medium text-lg transition-all">
              Try Ask Lumen
            </Link>
          </div>
          
          <div className="mt-16 flex flex-wrap justify-center gap-8">
            <div className="flex items-center text-gray-400">
              <Shield className="w-5 h-5 mr-2" />
              <span>21 CFR Part 11 Compliant</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Award className="w-5 h-5 mr-2" />
              <span>SOC 2 Type II Certified</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Globe className="w-5 h-5 mr-2" />
              <span>Global Regulatory Support</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Apple-style product cards section
const ProductCards = () => {
  const products = [
    {
      title: "IND Wizard™",
      description: "Build, validate and submit INDs twice as fast with intelligent automation and templates.",
      icon: <Wand2 className="w-6 h-6" />,
      color: "blue",
      route: "/ind-wizard"
    },
    {
      title: "CSR Intelligence™",
      description: "Extract insights from thousands of clinical study reports to optimize trial designs.",
      icon: <Sparkles className="w-6 h-6" />,
      color: "indigo",
      route: "/csr-library"
    },
    {
      title: "Document Vault™",
      description: "Securely store, manage, and collaborate on regulatory documents with 21 CFR Part 11 compliance.",
      icon: <Database className="w-6 h-6" />,
      color: "purple",
      route: "/versions"
    },
    {
      title: "Protocol Design™",
      description: "Create optimized protocols using AI-powered insights from successful trials.",
      icon: <FileText className="w-6 h-6" />,
      color: "sky",
      route: "/protocol-optimization"
    },
    {
      title: "CMC Insights™",
      description: "Streamline Chemistry, Manufacturing, and Controls documentation with intelligent templates.",
      icon: <Bookmark className="w-6 h-6" />,
      color: "emerald",
      route: "/cmc-module"
    },
    {
      title: "Ask Lumen",
      description: "Get instant answers to regulatory questions from our specialized AI assistant.",
      icon: <Globe className="w-6 h-6" />,
      color: "amber",
      route: "/ask-lumen"
    }
  ];
  
  return (
    <section className="py-24 bg-black text-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h5 className="text-blue-400 font-medium mb-3">Features</h5>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">TrialSage™ Platform</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A complete ecosystem for regulatory excellence
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={product.route}>
                <div className={`h-full bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-8 border border-gray-800 hover:border-${product.color}-500/50 transition-all group transform hover:-translate-y-1`}>
                  <div className={`w-12 h-12 rounded-full bg-${product.color}-900/50 flex items-center justify-center mb-6 text-${product.color}-400 group-hover:text-${product.color}-300`}>
                    {product.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{product.title}</h3>
                  <p className="text-gray-400 mb-6">{product.description}</p>
                  <div className={`flex items-center text-${product.color}-400 group-hover:text-${product.color}-300`}>
                    <span className="font-medium">Learn more</span>
                    <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
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