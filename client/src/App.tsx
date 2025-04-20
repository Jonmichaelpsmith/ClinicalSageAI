// App.tsx – fully connected routing system with dashboard layout
import React, { lazy, Suspense, useState, useEffect } from 'react';
// Using wouter for routing
import { Route, Switch } from 'wouter';

// Import layouts and core components
import { Toaster } from "@/components/ui/toaster";
import { Loader2, Beaker, MessageSquare } from 'lucide-react';
import DashboardLayout from "@/components/DashboardLayout";
import { AuthProvider } from '@/hooks/use-auth';

// Import ToastContainer from react-toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import page components
import CsrIntelligence from './pages/CsrIntelligence';
import DocumentsPage from './pages/DocumentsPage';
import SubmissionBuilder from './pages/SubmissionBuilder';
import ValidationPage from './pages/ValidationPage';
import ValidationDocuments from './pages/ValidationDocuments';
import RiskAnalysis from './pages/RiskAnalysis';
import AssistantPage from './pages/AssistantPage';
import IndSequenceManager from './pages/IndSequenceManager';
import SequenceDetail from './pages/SequenceDetail';
import IndSequenceDetail from './pages/IndSequenceDetail';
import AdminPage from './pages/AdminPage';
import FullAuditDashboardPage from './pages/FullAuditDashboardPage';

// Fixed the missing Flask icon issue by using Beaker instead
// Note: If you need a Flask icon, make sure to import it correctly

// Public pages
import HomeLanding from './pages/HomeLanding';
import ChatAssistant from './pages/ChatAssistant';
import CopilotDrawer from './pages/CopilotDrawer';

// Create a loading component for lazy-loaded routes
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
  </div>
);

// Dashboard placeholder pages
const Dashboard = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
        <ul className="space-y-2">
          <li className="text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>Protocol analyzed</span>
            <span className="text-gray-500 dark:text-gray-400">5 min ago</span>
          </li>
          <li className="text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>CSR uploaded</span>
            <span className="text-gray-500 dark:text-gray-400">2 hours ago</span>
          </li>
          <li className="text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>IND module updated</span>
            <span className="text-gray-500 dark:text-gray-400">1 day ago</span>
          </li>
        </ul>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-medium mb-4">Current Projects</h2>
        <ul className="space-y-2">
          <li className="text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>Oncology Phase II - GBM</span>
            <span className="text-emerald-600 dark:text-emerald-400">Active</span>
          </li>
          <li className="text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>Dermatology IND</span>
            <span className="text-yellow-600 dark:text-yellow-400">Review</span>
          </li>
          <li className="text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>Rare Disease CSR</span>
            <span className="text-gray-500 dark:text-gray-400">Draft</span>
          </li>
        </ul>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-medium mb-4">System Status</h2>
        <ul className="space-y-2">
          <li className="text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>CSR Database</span>
            <span className="flex items-center text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></span>
              Online (3,021)
            </span>
          </li>
          <li className="text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>Protocol Analyzer</span>
            <span className="flex items-center text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></span>
              Ready
            </span>
          </li>
          <li className="text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>IND API</span>
            <span className="flex items-center text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></span>
              Connected
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-screen text-gray-700 dark:text-gray-300">
    <h1 className="text-6xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">404</h1>
    <p className="text-xl mb-6">Page Not Found</p>
    <a href="/" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors">
      Return to Home
    </a>
  </div>
);

// Dashboard Feature Pages
const CsrLibrary = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">CSR Intelligence Library</h1>
    <p className="text-gray-700 dark:text-gray-300">
      Search, analyze, and compare 3,021 clinical study reports across 34 therapeutic areas
    </p>
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-md">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total CSRs</div>
          <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">3,021</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-md">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Therapeutic Areas</div>
          <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">34</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-md">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sponsor Companies</div>
          <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">412</div>
        </div>
      </div>
      <div className="space-y-3">
        <button className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-left rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors">
          <span className="font-medium">Search CSR Library</span>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Find CSRs by indication, phase, sponsor, endpoints and more</p>
        </button>
        <button className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-left rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors">
          <span className="font-medium">Upload New CSR</span>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Process and analyze a new clinical study report</p>
        </button>
        <button className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-left rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors">
          <span className="font-medium">Analytics Dashboard</span>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Visualize success rates, endpoint trends, and inclusion/exclusion criteria</p>
        </button>
      </div>
    </div>
  </div>
);

const CerDashboard = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">CER Generator</h1>
    <p className="text-gray-700 dark:text-gray-300">
      Create Clinical Evaluation Reports with AI-powered FAERS trend analysis
    </p>
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="space-y-3">
        <button className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-left rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors">
          <span className="font-medium">Create New CER</span>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Generate a new Clinical Evaluation Report from FAERS data</p>
        </button>
        <button className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-left rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors">
          <span className="font-medium">FAERS Monitoring</span>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Track adverse events for specific products or therapeutic areas</p>
        </button>
        <button className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-left rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors">
          <span className="font-medium">Export Options</span>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Generate Word, PDF or MDR-compliant formats with customized styles</p>
        </button>
      </div>
    </div>
  </div>
);

const IndAutomation = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">IND Automation</h1>
    <p className="text-gray-700 dark:text-gray-300">
      Build Module 1-5 with AI-assisted Module 2 and eCTD packaging
    </p>
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="space-y-3">
        <button className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-left rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors">
          <span className="font-medium">Create New IND Submission</span>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Start a new Investigational New Drug application</p>
        </button>
        <button className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-left rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors">
          <span className="font-medium">Module Builder</span>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Create and edit IND modules with AI assistance</p>
        </button>
        <button className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-left rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors">
          <span className="font-medium">eCTD Packager</span>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Format and validate submission packages for FDA standards</p>
        </button>
        <button className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-left rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors">
          <span className="font-medium">ESG Gateway</span>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">One-click submission to the FDA Electronic Submissions Gateway</p>
        </button>
      </div>
    </div>
  </div>
);

const ProtocolOptimizer = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Protocol Optimizer</h1>
    <p className="text-gray-700 dark:text-gray-300">
      Optimize clinical trial protocols with intelligence from 3,000+ successful studies
    </p>
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-md">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Oncology Success Rate</div>
          <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">58%</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-md">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cardiology Success Rate</div>
          <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">64%</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-md">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Neurology Success Rate</div>
          <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">43%</div>
        </div>
      </div>
      <div className="space-y-3">
        <button className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-left rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors">
          <span className="font-medium">Create New Protocol</span>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Generate a protocol template with optimized sections</p>
        </button>
        <button className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-left rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors">
          <span className="font-medium">Upload Existing Protocol</span>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Get optimization suggestions for your draft protocol</p>
        </button>
        <button className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-left rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors">
          <span className="font-medium">Protocol Intelligence Panel</span>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">View success rates, optimization insights, and competitive landscape</p>
        </button>
      </div>
    </div>
  </div>
);

const TrialSageAssistant = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">TrialSage Assistant</h1>
    <p className="text-gray-700 dark:text-gray-300">
      Conversational AI assistant with specialized medical writing and regulatory affairs expertise
    </p>
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-md">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-semibold">TS</div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm max-w-[80%] text-gray-700 dark:text-gray-300">
              Hello! I'm TrialSage Assistant. How can I help you with your clinical trials and regulatory documentation today?
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Ask a question about clinical trials, CSRs, protocols, or regulatory requirements..."
        />
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors">
          Send
        </button>
      </div>
    </div>
  </div>
);

const KpiAnalytics = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">KPI Analytics</h1>
    <p className="text-gray-700 dark:text-gray-300">
      Drag-and-drop SQL widgets, alert routing, weekly PDF reports
    </p>
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="space-y-3">
        <button className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-left rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors">
          <span className="font-medium">Custom Dashboards</span>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Build and customize KPI dashboards with drag-and-drop widgets</p>
        </button>
        <button className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-left rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors">
          <span className="font-medium">Data Sources</span>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Connect to external databases and APIs</p>
        </button>
        <button className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-left rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors">
          <span className="font-medium">Alert Configuration</span>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Set up threshold-based alerts and notification routing</p>
        </button>
      </div>
    </div>
  </div>
);

// Import the ClientPortal
import ClientPortal from './pages/ClientPortal';

// Missing Database icon component for ClientPortal 
const Database = ({ className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

// Missing Bell component for ClientPortal
const Bell = ({ className = "", size = 24 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

// Simple login page component 
const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Mock login function - in a real app, would call the API
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    // Simulate successful login - in a real app this would call the API
    // After login, redirect to client portal
    window.location.href = '/portal';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-slate-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-slate-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {isLogin ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Simple placeholder components for pages referenced in routes
const DemoPage = () => <div>Demo Page</div>;
const ROICalculator = () => <div>ROI Calculator</div>;

export default function App() {
  const [copilotOpen, setCopilotOpen] = useState(false);

  const toggleCopilot = () => {
    setCopilotOpen(prev => !prev);
  };

  return (
    <AuthProvider>
      {/* Toast container removed */}
      {/* Copilot drawer available on all pages */}
      <CopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
      
      {/* Fixed button to open Copilot */}
      <button 
        className="fixed bottom-4 right-4 bg-emerald-600 text-white p-3 rounded-full shadow-lg z-50 hover:bg-emerald-700 transition-colors"
        onClick={toggleCopilot}
      >
        <MessageSquare size={20} />
      </button>
      
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          {/* === Public routes === */}
          <Route path="/" component={HomeLanding} />
          <Route path="/demo" component={DemoPage} />
          <Route path="/roi" component={ROICalculator} />
          <Route path="/login" component={LoginPage} />

          {/* === Client portal (main entry point after login) === */}
          <Route path="/portal">
            {() => (
              <DashboardLayout>
                <ClientPortal />
              </DashboardLayout>
            )}
          </Route>
          
          {/* === Submission Builder === */}
          <Route path="/portal/submissions">
            {() => (
              <DashboardLayout>
                <SubmissionBuilder />
              </DashboardLayout>
            )}
          </Route>
          
          {/* === Risk Analysis === */}
          <Route path="/portal/risk-analysis/:submissionId">
            {() => (
              <DashboardLayout>
                <RiskAnalysis />
              </DashboardLayout>
            )}
          </Route>
          
          {/* === AI Assistant === */}
          <Route path="/portal/assistant">
            {() => (
              <DashboardLayout>
                <AssistantPage />
              </DashboardLayout>
            )}
          </Route>
          
          {/* === Sequence Detail with FDA Submission === */}
          <Route path="/portal/ind/:sequenceId">
            {() => (
              <DashboardLayout>
                <IndSequenceDetail />
              </DashboardLayout>
            )}
          </Route>

          {/* === Validation Profiles and Rules === */}
          <Route path="/portal/validation">
            {() => (
              <DashboardLayout>
                <ValidationPage />
              </DashboardLayout>
            )}
          </Route>

          {/* === Validation Documents (IQ/OQ/PQ) === */}
          <Route path="/portal/validation-documents">
            {() => (
              <DashboardLayout>
                <ValidationDocuments />
              </DashboardLayout>
            )}
          </Route>

          {/* === Dashboard layout routes === */}
          {/* Main dashboard */}
          <Route path="/dashboard">
            {() => (
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            )}
          </Route>

          {/* CSR Library */}
          <Route path="/csr-library">
            {() => (
              <DashboardLayout>
                <CsrLibrary />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/csr-library/:id">
            {() => (
              <DashboardLayout>
                <CsrLibrary />
              </DashboardLayout>
            )}
          </Route>
          
          {/* CSR Intelligence */}
          <Route path="/csr-intelligence">
            {() => (
              <DashboardLayout>
                <CsrIntelligence />
              </DashboardLayout>
            )}
          </Route>

          {/* Protocol Optimizer */}
          <Route path="/protocol-optimization">
            {() => (
              <DashboardLayout>
                <ProtocolOptimizer />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/protocol-optimization/:id">
            {() => (
              <DashboardLayout>
                <ProtocolOptimizer />
              </DashboardLayout>
            )}
          </Route>

          {/* CER Generator */}
          <Route path="/cer-dashboard">
            {() => (
              <DashboardLayout>
                <CerDashboard />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/cer-dashboard/:id">
            {() => (
              <DashboardLayout>
                <CerDashboard />
              </DashboardLayout>
            )}
          </Route>
          
          {/* IND Sequence Manager */}
          <Route path="/ind-sequence-manager">
            {() => (
              <DashboardLayout>
                <IndSequenceManager />
              </DashboardLayout>
            )}
          </Route>

          {/* IND Automation */}
          <Route path="/ind-automation">
            {() => (
              <DashboardLayout>
                <IndAutomation />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/ind-automation/:id">
            {() => (
              <DashboardLayout>
                <IndAutomation />
              </DashboardLayout>
            )}
          </Route>
          
          {/* Documents Workspace */}
          <Route path="/documents">
            {() => (
              <DashboardLayout>
                <DocumentsPage />
              </DashboardLayout>
            )}
          </Route>

          {/* Assistant */}
          <Route path="/assistant">
            {() => (
              <DashboardLayout>
                <TrialSageAssistant />
              </DashboardLayout>
            )}
          </Route>
          
          {/* Admin */}
          <Route path="/admin">
            {() => (
              <DashboardLayout>
                <AdminPage />
              </DashboardLayout>
            )}
          </Route>
          
          {/* Full Audit Dashboard */}
          <Route path="/admin/audit-dashboard">
            {() => (
              <DashboardLayout>
                <FullAuditDashboardPage />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/chat-assistant">
            {() => (
              <DashboardLayout>
                <TrialSageAssistant />
              </DashboardLayout>
            )}
          </Route>

          {/* KPI Analytics */}
          <Route path="/kpi">
            {() => (
              <DashboardLayout>
                <KpiAnalytics />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/kpi/:section">
            {() => (
              <DashboardLayout>
                <KpiAnalytics />
              </DashboardLayout>
            )}
          </Route>

          {/* Other dashboard routes */}
          <Route path="/ectd-send">
            {() => (
              <DashboardLayout>
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">eCTD One-Click ESG Send</h1>
                  <p className="text-gray-700 dark:text-gray-300">Submit eCTD packages directly to FDA gateway</p>
                </div>
              </DashboardLayout>
            )}
          </Route>
          
          <Route path="/risk-dashboards">
            {() => (
              <DashboardLayout>
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">Real-Time Risk Dashboards</h1>
                  <p className="text-gray-700 dark:text-gray-300">Monitor clinical trial risks and safety signals</p>
                </div>
              </DashboardLayout>
            )}
          </Route>
          
          <Route path="/integrations">
            {() => (
              <DashboardLayout>
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">Benchling & FAERS Connectors</h1>
                  <p className="text-gray-700 dark:text-gray-300">Integrate with third-party data sources</p>
                </div>
              </DashboardLayout>
            )}
          </Route>

          {/* All persona-specific routes */}
          <Route path="/solutions/:role">
            {() => (
              <DashboardLayout>
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">Role-Specific Solutions</h1>
                  <p className="text-gray-700 dark:text-gray-300">Tailored intelligence for your specific needs</p>
                </div>
              </DashboardLayout>
            )}
          </Route>

          {/* All sub-routes */}
          <Route path="/success-rate-analytics">
            {() => (
              <DashboardLayout>
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">Success Rate Analytics</h1>
                  <p className="text-gray-700 dark:text-gray-300">Historical success rates by indication, phase, and company</p>
                </div>
              </DashboardLayout>
            )}
          </Route>
          
          <Route path="/protocol-quality-score">
            {() => (
              <DashboardLayout>
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">Protocol Quality Score</h1>
                  <p className="text-gray-700 dark:text-gray-300">AI assessment of protocol with success prediction</p>
                </div>
              </DashboardLayout>
            )}
          </Route>
          
          <Route path="/evidence-builder">
            {() => (
              <DashboardLayout>
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">Evidence Builder</h1>
                  <p className="text-gray-700 dark:text-gray-300">Generate evidence-backed narratives</p>
                </div>
              </DashboardLayout>
            )}
          </Route>
          
          <Route path="/faers-monitor">
            {() => (
              <DashboardLayout>
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">FAERS Monitor</h1>
                  <p className="text-gray-700 dark:text-gray-300">Track adverse events and safety signals</p>
                </div>
              </DashboardLayout>
            )}
          </Route>

          {/* 404 fallback */}
          <Route path="*">
            {() => <NotFound />}
          </Route>
        </Switch>
        <Toaster />
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Suspense>
    </AuthProvider>
  );
}