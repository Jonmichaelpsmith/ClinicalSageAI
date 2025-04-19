import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  BarChart2, 
  FileText, 
  Brain, 
  Beaker, 
  Microscope, 
  Package, 
  ArrowRight, 
  Upload, 
  Search, 
  Users, 
  BookOpen, 
  Settings, 
  TrendingUp, 
  Globe, 
  Shield,
  Database,
  Bell
} from 'lucide-react';

// Import translation function (replace with i18next when properly installed)
const t = text => text;

export default function ClientPortal() {
  const [activeTab, setActiveTab] = useState('all');
  
  // Get subscription features - in real app, this would come from user's subscription data
  const userSubscription = {
    plan: "Enterprise",
    modules: ["csr", "ind", "protocol", "cer", "assistant", "kpi", "academic"],
    usage: {
      csrUploads: 42,
      protocolAnalyses: 7,
      indSubmissions: 3,
      cerReports: 12
    },
    limits: {
      csrUploads: 100,
      protocolAnalyses: 20,
      indSubmissions: 5,
      cerReports: 25
    }
  };
  
  // Define all available features
  const allFeatures = [
    {
      id: 'csr',
      title: t('CSR Intelligence'),
      icon: <Database className="w-8 h-8 text-sky-500" />,
      description: t('Search, analyze, and compare 3,021 clinical study reports across 34 therapeutic areas'),
      link: '/csr-library',
      category: 'core',
      actions: [
        { name: t('Search Library'), icon: <Search size={16} />, link: '/csr-library/search' },
        { name: t('Upload CSR'), icon: <Upload size={16} />, link: '/csr-library/upload' },
        { name: t('Analytics'), icon: <BarChart2 size={16} />, link: '/csr-library/analytics' }
      ]
    },
    {
      id: 'protocol',
      title: t('Protocol Optimizer'),
      icon: <Brain className="w-8 h-8 text-emerald-500" />,
      description: t('Optimize clinical trial protocols with intelligence from 3,000+ successful studies'),
      link: '/protocol-optimization',
      category: 'core',
      actions: [
        { name: t('New Protocol'), icon: <FileText size={16} />, link: '/protocol-optimization/new' },
        { name: t('Analyze Protocol'), icon: <Brain size={16} />, link: '/protocol-optimization/existing' },
        { name: t('Intelligence Panel'), icon: <BarChart2 size={16} />, link: '/protocol-optimization/intelligence' }
      ]
    },
    {
      id: 'cer',
      title: t('CER Generator'),
      icon: <Beaker className="w-8 h-8 text-violet-500" />,
      description: t('Create Clinical Evaluation Reports with AI-powered FAERS trend analysis'),
      link: '/cer-dashboard',
      category: 'core',
      actions: [
        { name: t('New CER'), icon: <FileText size={16} />, link: '/cer-dashboard/create' },
        { name: t('FAERS Monitor'), icon: <Microscope size={16} />, link: '/cer-dashboard/faers' },
        { name: t('Export Options'), icon: <ArrowRight size={16} />, link: '/cer-dashboard/export' }
      ]
    },
    {
      id: 'ind',
      title: t('IND Automation'),
      icon: <Package className="w-8 h-8 text-amber-500" />,
      description: t('Build Module 1-5 with AI-assisted Module 2 and eCTD packaging'),
      link: '/ind-automation',
      category: 'core',
      actions: [
        { name: t('New Submission'), icon: <FileText size={16} />, link: '/ind-automation/new' },
        { name: t('Module Builder'), icon: <FileText size={16} />, link: '/ind-automation/builder' },
        { name: t('ESG Gateway'), icon: <ArrowRight size={16} />, link: '/ind-automation/esg' }
      ]
    },
    {
      id: 'assistant',
      title: t('TrialSage Assistant'),
      icon: <Globe className="w-8 h-8 text-blue-500" />,
      description: t('Conversational AI assistant with specialized medical writing and regulatory affairs expertise'),
      link: '/assistant',
      category: 'advanced',
      actions: [
        { name: t('Ask Question'), icon: <Brain size={16} />, link: '/assistant' }
      ]
    },
    {
      id: 'kpi',
      title: t('KPI Analytics'),
      icon: <TrendingUp className="w-8 h-8 text-rose-500" />,
      description: t('Drag-and-drop SQL widgets, alert routing, weekly PDF reports'),
      link: '/kpi',
      category: 'advanced',
      actions: [
        { name: t('Dashboards'), icon: <BarChart2 size={16} />, link: '/kpi/dashboards' },
        { name: t('Data Sources'), icon: <Database size={16} />, link: '/kpi/sources' },
        { name: t('Alert Config'), icon: <Bell size={16} />, link: '/kpi/alerts' }
      ]
    },
    {
      id: 'academic',
      title: t('Knowledge Library'),
      icon: <BookOpen className="w-8 h-8 text-teal-500" />,
      description: t('Academic knowledge base with AI-enhanced search across literature and trial data'),
      link: '/academic',
      category: 'advanced',
      actions: [
        { name: t('Search'), icon: <Search size={16} />, link: '/academic/search' },
        { name: t('Publications'), icon: <BookOpen size={16} />, link: '/academic/publications' }
      ]
    }
  ];
  
  // Filter features based on user subscription and active tab
  const features = allFeatures.filter(feature => {
    // First filter by user subscription
    if (!userSubscription.modules.includes(feature.id)) return false;
    
    // Then filter by active tab
    if (activeTab === 'all') return true;
    return feature.category === activeTab;
  });
  
  // Calculate usage percentages
  const getUsagePercent = (key) => {
    return Math.round((userSubscription.usage[key] / userSubscription.limits[key]) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-lg border border-emerald-100 dark:border-emerald-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Welcome to TrialSage</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Your advanced clinical intelligence platform</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-slate-800 p-2 px-4 rounded-md border border-gray-200 dark:border-slate-700">
              <span className="text-xs text-gray-500 dark:text-gray-400 block">Your Plan</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{userSubscription.plan}</span>
            </div>
            <Link to="/settings/subscription">
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm transition-colors">
                Manage Subscription
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <Upload className="text-sky-500" size={20} />
            <h3 className="font-medium">CSR Uploads</h3>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-slate-700 rounded-full mb-1">
            <div 
              className="h-2 bg-sky-500 rounded-full" 
              style={{ width: `${getUsagePercent('csrUploads')}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{userSubscription.usage.csrUploads} used</span>
            <span>{userSubscription.limits.csrUploads} total</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="text-emerald-500" size={20} />
            <h3 className="font-medium">Protocol Analyses</h3>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-slate-700 rounded-full mb-1">
            <div 
              className="h-2 bg-emerald-500 rounded-full" 
              style={{ width: `${getUsagePercent('protocolAnalyses')}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{userSubscription.usage.protocolAnalyses} used</span>
            <span>{userSubscription.limits.protocolAnalyses} total</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-amber-500" size={20} />
            <h3 className="font-medium">IND Submissions</h3>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-slate-700 rounded-full mb-1">
            <div 
              className="h-2 bg-amber-500 rounded-full" 
              style={{ width: `${getUsagePercent('indSubmissions')}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{userSubscription.usage.indSubmissions} used</span>
            <span>{userSubscription.limits.indSubmissions} total</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <Beaker className="text-violet-500" size={20} />
            <h3 className="font-medium">CER Reports</h3>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-slate-700 rounded-full mb-1">
            <div 
              className="h-2 bg-violet-500 rounded-full" 
              style={{ width: `${getUsagePercent('cerReports')}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{userSubscription.usage.cerReports} used</span>
            <span>{userSubscription.limits.cerReports} total</span>
          </div>
        </div>
      </div>
      
      {/* Feature Category Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 -mb-px ${activeTab === 'all' ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            All Features
          </button>
          <button
            onClick={() => setActiveTab('core')}
            className={`py-2 px-1 -mb-px ${activeTab === 'core' ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            Core Modules
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`py-2 px-1 -mb-px ${activeTab === 'advanced' ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            Advanced Intelligence
          </button>
        </div>
      </div>
      
      {/* Features List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map(feature => (
          <div key={feature.id} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="rounded-md p-3 bg-gray-50 dark:bg-slate-900">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{feature.description}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {feature.actions.map(action => (
                  <Link key={action.name} to={action.link}>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-slate-700 transition-colors">
                      {action.icon}
                      {action.name}
                    </button>
                  </Link>
                ))}
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700">
              <Link to={feature.link}>
                <button className="w-full py-2 px-4 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md font-medium text-sm flex items-center justify-center gap-1 transition-colors">
                  {t('Launch')} {feature.title}
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {/* Support and Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="text-emerald-600 dark:text-emerald-400" size={20} />
            <h3 className="font-medium">Support</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Get help from our expert team</p>
          <Link to="/support">
            <button className="w-full py-1.5 px-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-md text-sm transition-colors">
              Contact Support
            </button>
          </Link>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="text-emerald-600 dark:text-emerald-400" size={20} />
            <h3 className="font-medium">Documentation</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Browse user guides and tutorials</p>
          <Link to="/docs">
            <button className="w-full py-1.5 px-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-md text-sm transition-colors">
              View Documentation
            </button>
          </Link>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <Settings className="text-emerald-600 dark:text-emerald-400" size={20} />
            <h3 className="font-medium">Settings</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Manage your account and preferences</p>
          <Link to="/settings">
            <button className="w-full py-1.5 px-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-md text-sm transition-colors">
              Account Settings
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}