// HomeLandingEnhanced.jsx – enterprise-grade landing page with hero section, metrics, features, and testimonials

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  FileText, 
  BarChart2, 
  Clock, 
  Check, 
  Zap, 
  Shield, 
  Globe, 
  Sparkles,
  Users,
  ArrowRight,
  Database,
  FileSymlink,
  Loader2
} from 'lucide-react';
import AppPackagesBanner from '../components/AppPackagesBanner';
import UnifiedPlatformFeatures from '../components/UnifiedPlatformFeatures';
import EnhancedVisionCards from '../components/EnhancedVisionCards';
import { apiRequest } from '../lib/queryClient';

const TAGLINES = [
  'Turning Concepts into Cures – 2× faster INDs',
  'Automated CER & CSR intelligence that eliminates 90% manual formatting',
  'Regulatory‑grade PDFs, eCTD, ESG in one click',
  'AI‑guided study protocols save $2M average per trial',
];

const FEATURES = [
  {
    title: 'AI-powered Protocol Optimization',
    description: 'Intelligently build stronger protocols using CSR data from thousands of similar trials',
    icon: <Sparkles className="w-6 h-6 text-blue-500" />
  },
  {
    title: 'Automatic Document Generation',
    description: 'Create submission-ready regulatory documents with a single click',
    icon: <FileText className="w-6 h-6 text-indigo-500" />
  },
  {
    title: 'Multi-region Compliance',
    description: 'Ensure compliance with FDA, EMA, PMDA and Health Canada standards automatically',
    icon: <Globe className="w-6 h-6 text-emerald-500" />
  },
  {
    title: 'Real-time Validation',
    description: 'Identify and fix regulatory issues before submission with built-in validation',
    icon: <Check className="w-6 h-6 text-green-500" />
  },
  {
    title: 'Accelerated Time-to-Market',
    description: 'Reduce regulatory preparation time by up to 60% with automated workflows',
    icon: <Zap className="w-6 h-6 text-amber-500" />
  },
  {
    title: 'Enterprise-grade Security',
    description: 'Part 11 compliant with comprehensive audit trails and role-based access control',
    icon: <Shield className="w-6 h-6 text-red-500" />
  }
];

const METRICS = [
  { 
    label: 'Time Savings', 
    value: '60%', 
    description: 'Average reduction in regulatory preparation time',
    icon: <Clock className="w-12 h-12 text-blue-500" />
  },
  { 
    label: 'Cost Reduction', 
    value: '$2M', 
    description: 'Average savings per trial with AI-guided protocols',
    icon: <BarChart2 className="w-12 h-12 text-indigo-500" />
  },
  { 
    label: 'Success Rate', 
    value: '98%', 
    description: 'First-time acceptance rate for submissions',
    icon: <Check className="w-12 h-12 text-emerald-500" />
  },
  { 
    label: 'Client Satisfaction', 
    value: '4.9/5', 
    description: 'Average client satisfaction rating',
    icon: <Users className="w-12 h-12 text-amber-500" />
  }
];

const TESTIMONIALS = [
  {
    quote: "TrialSage has transformed our regulatory operations. What used to take months now takes days, with higher quality and fewer revisions.",
    author: "Sarah Johnson",
    title: "VP Regulatory Affairs",
    company: "Nexgen Biotech"
  },
  {
    quote: "The automation and AI capabilities have saved us millions in consulting fees and accelerated our time to market significantly.",
    author: "Michael Chen",
    title: "Chief Medical Officer",
    company: "Lumina Therapeutics"
  },
  {
    quote: "Using TrialSage for our IND submissions has been a game-changer. We're filing faster, with fewer errors, and at lower cost.",
    author: "Jessica Rodriguez",
    title: "Director of Regulatory Science",
    company: "Precision Bio"
  }
];

const AGENCIES = [
  { name: 'FDA', url: 'https://www.fda.gov', logo: 'https://raw.githubusercontent.com/Concepts2Cures/logos/main/fda.svg' },
  { name: 'EMA', url: 'https://www.ema.europa.eu', logo: 'https://raw.githubusercontent.com/Concepts2Cures/logos/main/ema.svg' },
  { name: 'MHRA', url: 'https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency', logo: 'https://raw.githubusercontent.com/Concepts2Cures/logos/main/mhra.svg' },
  { name: 'PMDA', url: 'https://www.pmda.go.jp', logo: 'https://raw.githubusercontent.com/Concepts2Cures/logos/main/pmda.svg' },
  { name: 'TGA', url: 'https://www.tga.gov.au', logo: 'https://raw.githubusercontent.com/Concepts2Cures/logos/main/tga.svg' },
  { name: 'NMPA', url: 'https://www.nmpa.gov.cn', logo: 'https://raw.githubusercontent.com/Concepts2Cures/logos/main/nmpa.svg' },
  { name: 'MFDS', url: 'https://www.mfds.go.kr', logo: 'https://raw.githubusercontent.com/Concepts2Cures/logos/main/mfds.svg' },
];

export default function HomeLandingEnhanced() {
  const [location] = useLocation();
  const [csrCount, setCsrCount] = useState(3021);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchCSRCount = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest('GET', '/api/reports/count');
        const data = await response.json();
        if (data && data.count) {
          setCsrCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching CSR count:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCSRCount();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Application Packages Banner */}
      <AppPackagesBanner currentPath={location} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-blue-900 to-blue-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/Concepts2Cures/assets/main/dna-pattern.svg')] bg-repeat opacity-30"></div>
        </div>
        <div className="container mx-auto px-6 pt-20 pb-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-700/30 backdrop-blur-sm text-blue-200 text-sm font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2"></span>
              Enterprise Regulatory Intelligence Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-300 via-blue-100 to-indigo-200 text-transparent bg-clip-text">
              Transforming Regulatory <br className="hidden md:block" /> Intelligence for Life Sciences
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
              Concept2Cures.AI delivers a comprehensive regulatory suite integrating <br className="hidden md:block" /> advanced machine learning with industry-compliant frameworks to revolutionize global submissions, clinical intelligence, and regulatory strategy across therapeutic domains.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-blue-900/30 transition-all duration-200">
                Start Free Trial
              </Link>
              <Link to="/demo" className="px-8 py-4 bg-blue-800/40 hover:bg-blue-700/40 border border-blue-600/30 backdrop-blur-sm text-blue-100 font-medium rounded-lg shadow transition-all duration-200">
                Request Demo
              </Link>
            </div>
          </div>
          
          {/* Highlighted Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {METRICS.map((metric, i) => (
              <div key={i} className="bg-gradient-to-br from-blue-800/40 to-indigo-900/40 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6 text-center transform transition-transform hover:-translate-y-1 duration-200">
                <div className="flex justify-center mb-4">
                  {metric.icon}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-1">{metric.value}</h3>
                <p className="font-medium text-blue-200 mb-2">{metric.label}</p>
                <p className="text-sm text-blue-300">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto -mb-1">
            <path fill="#ffffff" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>
      
      {/* Value Proposition Section */}
      <EnhancedVisionCards />
      
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Redefining Regulatory Intelligence for the Modern Life Sciences Enterprise</h2>
              <p className="text-lg text-gray-700 mb-8">Concept2Cures.AI's proprietary intelligence platform streamlines complex regulatory processes through sophisticated machine learning algorithms, delivering unprecedented efficiency and precision while maintaining rigorous compliance with evolving global regulatory frameworks.</p>
              <ul className="space-y-4">
                {TAGLINES.map((tagline, i) => (
                  <li key={i} className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">
                      <Check size={14} />
                    </span>
                    <span className="text-gray-700">{tagline}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/features" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800">
                  Explore All Features <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-100 to-blue-100 transform rotate-6"></div>
              <div className="relative">
                <div className="bg-white shadow-xl rounded-2xl p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">TrialSage AI Dashboard</h3>
                      <p className="text-sm text-gray-500">Real-time submission status</p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">LIVE</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-500 mb-1">Current Projects</div>
                      <div className="text-2xl font-bold text-gray-900">12</div>
                      <div className="text-xs mt-1 text-green-600">↑ 3 from last month</div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-500 mb-1">Avg. Time Savings</div>
                      <div className="text-2xl font-bold text-gray-900">68%</div>
                      <div className="text-xs mt-1 text-green-600">↑ 5% from last quarter</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">IND</div>
                        <div>
                          <div className="text-sm font-medium">Oncology IND-23845</div>
                          <div className="text-xs text-gray-500">Phase 1/2 Trial</div>
                        </div>
                      </div>
                      <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">Ready for submission</div>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">CSR</div>
                        <div>
                          <div className="text-sm font-medium">Phase 2 Report: LUM-578</div>
                          <div className="text-xs text-gray-500">Final Report</div>
                        </div>
                      </div>
                      <div className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">95% Complete</div>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">CER</div>
                        <div>
                          <div className="text-sm font-medium">Regulatory Response MHRA</div>
                          <div className="text-xs text-gray-500">Expedited Review</div>
                        </div>
                      </div>
                      <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">In Progress</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      

      
      {/* Unified Platform Features Section */}
      <UnifiedPlatformFeatures />
      
      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 to-blue-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Trusted by Leading Biotech Companies</h2>
            <p className="text-xl text-blue-100">See what our clients say about the impact TrialSage has on their regulatory operations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, i) => (
              <div key={i} className="bg-gradient-to-br from-blue-800/40 to-indigo-900/40 backdrop-blur-sm border border-blue-700/30 rounded-xl p-8">
                <div className="flex mb-6">
                  {[...Array(5)].map((_, idx) => (
                    <svg key={idx} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="italic mb-6 text-blue-100">{testimonial.quote}</p>
                <div>
                  <p className="font-bold text-white">{testimonial.author}</p>
                  <p className="text-blue-200 text-sm">{testimonial.title}, {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/case-studies" className="inline-flex items-center px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg shadow-lg shadow-blue-900/30 transition-all duration-200">
              View Success Stories <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Agency support carousel */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <h3 className="text-center text-lg font-medium text-gray-700 mb-6">Multi-Jurisdictional Regulatory Authority Integration</h3>
          <div className="overflow-hidden">
            <div className="flex animate-scroll space-x-16 whitespace-nowrap">
              {AGENCIES.concat(AGENCIES).map((a, idx) => (
                <a key={idx} href={a.url} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity inline-block">
                  <img src={a.logo} alt={a.name + ' logo'} className="h-14 grayscale hover:grayscale-0" loading="lazy" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3 p-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to accelerate your regulatory process?</h2>
                <p className="text-lg text-gray-600 mb-6">Schedule a personalized demo to see how TrialSage can transform your clinical and regulatory operations.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors">
                    Start Free Trial
                  </Link>
                  <Link to="/demo" className="px-6 py-3 bg-white border border-blue-600 text-blue-600 font-medium rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
                    Request Demo
                  </Link>
                </div>
              </div>
              <div className="md:w-1/3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10 flex flex-col justify-center">
                <h3 className="text-xl font-bold mb-4">Enterprise Solutions</h3>
                <p className="mb-6">Custom solutions available for enterprise teams managing multiple programs.</p>
                <Link to="/enterprise" className="text-white font-medium inline-flex items-center hover:underline">
                  Learn More <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">TrialSage Platform</h3>
              <ul className="space-y-2">
                <li><Link to="/solutions" className="hover:text-white transition-colors">Solutions</Link></li>
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/enterprise" className="hover:text-white transition-colors">Enterprise</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/case-studies" className="hover:text-white transition-colors">Case Studies</Link></li>
                <li><Link to="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/webinars" className="hover:text-white transition-colors">Webinars</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/team" className="hover:text-white transition-colors">Team</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/compliance" className="hover:text-white transition-colors">Compliance</Link></li>
                <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} Concepts2Cures.AI – All rights reserved.</p>
            <p className="mt-4 md:mt-0">Logos shown for regulatory context only; no endorsement implied.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}