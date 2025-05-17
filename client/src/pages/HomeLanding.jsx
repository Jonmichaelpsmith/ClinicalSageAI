// HomeLanding.jsx – comprehensive enterprise solution showcase for Concepts2Cures.AI
import React from 'react';
import { Link } from 'wouter';
import { ArrowRight, ShieldCheck, BarChart2, UploadCloud, BookOpen, FileText, ChartPie, Clipboard, Users, Microscope, Database, ZapOff } from 'lucide-react';
import { Slider } from "../lightweight-wrappers.jsx";
// // import 'slick-carousel/slick/slick.css' - commented out by resolver - commented out by resolver;
// // import 'slick-carousel/slick/slick-theme.css' - commented out by resolver - commented out by resolver;

const logos = [
  'fda.svg','ema.svg','pmda.svg','mhra.svg','tga.svg','nmpa.svg','korea_mfds.svg'
];

const features = [
  {
    icon: <Users size={32} className="text-emerald-600" />,
    title: 'Multi-tenant Architecture',
    desc: 'Isolated tenant workspaces with secure role-based access.'
  },
  {
    icon: <ShieldCheck size={32} className="text-emerald-600" />,
    title: 'Quality Management',
    desc: 'Risk-based controls with CTQ factor tracking.'
  },
  {
    icon: <Clipboard size={32} className="text-emerald-600" />,
    title: 'Regulatory Compliance',
    desc: 'Comprehensive validation and documentation tools.'
  },
  {
    icon: <FileText size={32} className="text-emerald-600" />,
    title: 'Document Management',
    desc: 'Streamlined creation, storage and retrieval of files.'
  },
  {
    icon: <BarChart2 size={32} className="text-emerald-600" />,
    title: 'AI-powered Analysis',
    desc: 'Advanced analysis of clinical data and literature.'
  }
];

const roleSolutions = [
  {
    role: 'Clinical Operations',
    solutions: [
      { icon: <Clipboard />, name: 'Protocol Automation', desc: 'AI-powered protocol optimization from 3,200+ historical trials' },
      { icon: <ChartPie />, name: 'Enrollment Forecasting', desc: 'Predictive analytics for patient recruitment targets' }
    ]
  },
  {
    role: 'Regulatory Affairs',
    solutions: [
      { icon: <FileText />, name: 'Multi-Regional IND/CTA', desc: 'Compliant packages for FDA, EMA, PMDA & more' },
      { icon: <Database />, name: 'eCTD Navigator', desc: 'Drag-and-drop submission management with real-time validation' }
    ]
  },
  {
    role: 'Medical Affairs',
    solutions: [
      { icon: <BookOpen />, name: 'CSR Intelligence', desc: '4,000+ CSR corpus with semantic search & benchmarking' },
      { icon: <Microscope />, name: 'FAERS Analysis', desc: 'Automated adverse event detection and summary' }
    ]
  },
  {
    role: 'Executive Team',
    solutions: [
      { icon: <Users />, name: 'Portfolio Simulator', desc: 'Multi-trial program modeling with success rates' },
      { icon: <ZapOff />, name: 'Risk Mitigation', desc: 'AI-driven protocol risk scoring and mitigation recommendations' }
    ]
  }
];

const caseStudies = [
  {
    title: 'Biotech Startup',
    highlight: 'Streamlined document management',
    desc: 'Implemented TrialSage to organize regulatory files across teams.'
  },
  {
    title: 'Academic Research Group',
    highlight: 'Centralized quality tracking',
    desc: 'Coordinated compliance tasks and maintained version control.'
  },
  {
    title: 'Medical Device Company',
    highlight: 'Improved collaboration',
    desc: 'Adopted the platform for shared access to clinical evaluation reports.'
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
      {/* Nav */}
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center">
            <span className="text-xl font-bold gradient-text">Concepts2Cures.AI</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300">Products</Link>
            <Link to="/solutions" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300">Solutions</Link>
            <Link to="/csr-library" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300">CSR Intelligence</Link>
            <Link to="/portal" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300">Client Portal</Link>
            <Link to="/builder" className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">eCTD Builder</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight gradient-text">TrialSage™ – Multi‑tenant Regulatory Intelligence Platform</h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Open-source project focused on Clinical Evaluation Report generation and regulatory compliance.
        </p>
        <p className="mt-2 text-sm italic text-gray-500 dark:text-gray-400">This platform is under active development.</p>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Link to="/signup" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
            Get Started <ArrowRight size={18}/>
          </Link>
          <Link to="/demo" className="px-6 py-3 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800">Request Live Demo</Link>
          <a href="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block">Client Login</a>
        </div>
      </section>

      {/* Logos */}
      <section className="bg-gray-50 dark:bg-slate-800 py-6">
        <h3 className="text-center text-sm uppercase text-gray-500 dark:text-gray-400 mb-4">Global regulatory authorities</h3>
        <Slider {...sliderSettings} className="container mx-auto flex items-center">
          {logos.map((l,i)=>(
            <div key={i} className="px-4 opacity-70 grayscale hover:opacity-100 transition">
              <img src={`/static/logos/${l}`} alt={l} className="h-12 mx-auto"/>
            </div>
          ))}
        </Slider>
      </section>

      {/* Core Features */}
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
      
      {/* Role-Based Solutions */}
      <section className="bg-gray-50 dark:bg-slate-800 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Person-Based Role Solutions</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
            Purpose-built tools for every stakeholder in the clinical research ecosystem
          </p>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {roleSolutions.map((role, i) => (
              <div key={i} className="bg-white dark:bg-slate-700 rounded-xl shadow overflow-hidden">
                <div className="bg-emerald-600 text-white py-3 px-5">
                  <h3 className="font-semibold">{role.role}</h3>
                </div>
                <div className="p-5">
                  {role.solutions.map((solution, j) => (
                    <div key={j} className="flex items-start mb-4 last:mb-0">
                      <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-lg mr-3">
                        {React.cloneElement(solution.icon, { size: 20, className: "text-emerald-600" })}
                      </div>
                      <div>
                        <h4 className="font-medium">{solution.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{solution.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CSR Intelligence */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl p-8 text-white">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">CSR Intelligence Center</h2>
              <p className="mb-4">Access our library of 4,000+ clinical study reports with AI-powered search, comparison, and analytics capabilities.</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="bg-white text-emerald-600 rounded-full p-1 mr-2"><CheckIcon size={14} /></span>
                  Semantic similarity search across global regulatory submissions
                </li>
                <li className="flex items-center">
                  <span className="bg-white text-emerald-600 rounded-full p-1 mr-2"><CheckIcon size={14} /></span>
                  Identify protocol design patterns and historical success rates
                </li>
                <li className="flex items-center">
                  <span className="bg-white text-emerald-600 rounded-full p-1 mr-2"><CheckIcon size={14} /></span>
                  Benchmark endpoint selection and statistical approaches
                </li>
              </ul>
              <a href="/dashboard" className="inline-block px-6 py-3 bg-white text-emerald-600 font-medium rounded shadow hover:bg-gray-50">
                Explore CSR Library
              </a>
            </div>
            <div className="hidden md:block text-center">
              <div className="bg-white/20 backdrop-blur rounded-xl p-6 inline-block">
                <DatabaseIcon size={120} className="mx-auto text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Case Studies */}
      <section className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Sample Use Cases</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {caseStudies.map((study, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-2">{study.title}</h3>
              <p className="text-emerald-600 font-bold text-xl mb-2">{study.highlight}</p>
              <p className="text-gray-600 dark:text-gray-400">{study.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Portal Button */}
      <section className="bg-gray-900 text-white py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Experience our end-to-end platform</h2>
        <p className="mb-8 max-w-2xl mx-auto">
          Access interactive demos of our eCTD Builder, protocol automation engine, and CSR intelligence platform
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/dashboard" className="px-6 py-3 bg-emerald-600 text-white font-medium rounded shadow hover:bg-emerald-700">
            Try eCTD Builder
          </a>
          <a href="/dashboard" className="px-6 py-3 bg-white text-gray-900 font-medium rounded shadow hover:bg-gray-100">
            View Demo Portal
          </a>
        </div>
      </section>

      {/* ROI Banner */}
      <section className="bg-emerald-600 text-white py-14 text-center">
        <h2 className="text-2xl font-semibold">See how much time & budget you can reclaim</h2>
        <p className="mt-2 opacity-90">Our ROI calculator quantifies savings across CMC, medical writing & regulatory ops.</p>
        <a href="/dashboard" className="inline-block mt-6 bg-white text-emerald-600 font-medium px-6 py-3 rounded shadow hover:bg-gray-50">Calculate ROI</a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-slate-800 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Concepts2Cures.AI</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Accelerating therapeutic development from concept to cure with AI-powered regulatory intelligence.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Products</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/dashboard" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400">TrialSage Platform</a></li>
                <li><a href="/dashboard" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400">CSR Intelligence</a></li>
                <li><a href="/dashboard" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400">IND Automation</a></li>
                <li><a href="/dashboard" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400">Protocol Designer</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Regulatory Regions</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/dashboard" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400">FDA (US)</a></li>
                <li><a href="/dashboard" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400">EMA (EU)</a></li>
                <li><a href="/dashboard" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400">PMDA (Japan)</a></li>
                <li><a href="/dashboard" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400">Health Canada</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/dashboard" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400">About Us</a></li>
                <li><a href="/dashboard" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400">Contact</a></li>
                <li><a href="/dashboard" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400">Careers</a></li>
                <li><a href="/dashboard" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400">Legal</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Concepts2Cures.AI • All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}

// Icons
const CheckIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const DatabaseIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);