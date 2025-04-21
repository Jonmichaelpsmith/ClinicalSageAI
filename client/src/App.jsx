import React from 'react';
import { Route, Switch } from 'wouter';
import './index.css';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white">
      <header className="pt-8 px-6 md:px-12">
        <h1 className="text-3xl md:text-5xl font-bold">TrialSage</h1>
        <p className="mt-2 text-xl text-blue-200">
          Clinical Intelligence Platform
        </p>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Solution Bundles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bundle 1 */}
            <div className="bg-blue-800 bg-opacity-30 rounded-lg p-6 border border-blue-700 hover:border-blue-500 transition-all">
              <h3 className="text-xl font-semibold mb-2">IND & NDA Submission Accelerator</h3>
              <p className="text-blue-200 mb-4">Streamline regulatory submissions with AI-powered document preparation</p>
              <ul className="space-y-2 text-sm">
                <li>• Web-based submission builder</li>
                <li>• Automatic eCTD generation</li>
                <li>• Multi-region validation</li>
                <li>• ESG integration</li>
              </ul>
            </div>
            
            {/* Bundle 2 */}
            <div className="bg-blue-800 bg-opacity-30 rounded-lg p-6 border border-blue-700 hover:border-blue-500 transition-all">
              <h3 className="text-xl font-semibold mb-2">Global CSR Intelligence Suite</h3>
              <p className="text-blue-200 mb-4">Leverage AI to extract insights from global clinical documents</p>
              <ul className="space-y-2 text-sm">
                <li>• CSR knowledge base</li>
                <li>• Protocol comparator</li>
                <li>• Study effectiveness analyzer</li>
                <li>• Global reg intelligence</li>
              </ul>
            </div>
            
            {/* Bundle 3 */}
            <div className="bg-blue-800 bg-opacity-30 rounded-lg p-6 border border-blue-700 hover:border-blue-500 transition-all">
              <h3 className="text-xl font-semibold mb-2">Report & Review Toolkit</h3>
              <p className="text-blue-200 mb-4">Create professional reports with automated analysis</p>
              <ul className="space-y-2 text-sm">
                <li>• CER report generator</li>
                <li>• CSR formatter</li>
                <li>• Protocol optimizer</li>
                <li>• Document compliance checker</li>
              </ul>
            </div>
            
            {/* Bundle 4 */}
            <div className="bg-blue-800 bg-opacity-30 rounded-lg p-6 border border-blue-700 hover:border-blue-500 transition-all">
              <h3 className="text-xl font-semibold mb-2">Enterprise Command Center</h3>
              <p className="text-blue-200 mb-4">Comprehensive control system for regulatory operations</p>
              <ul className="space-y-2 text-sm">
                <li>• Real-time analytics</li>
                <li>• Multi-submission tracking</li>
                <li>• Role-based dashboards</li>
                <li>• Regulatory calendar</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-3xl font-bold mb-6">Key Benefits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Accelerate Submissions</h3>
              <p>2× faster INDs with AI-powered document generation and automated formatting</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Reduce Manual Work</h3>
              <p>Eliminate 90% of manual formatting with intelligent templates and validation</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Cost Savings</h3>
              <p>Save up to $2M per trial with optimized processes and reduced errors</p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-blue-950 py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">TrialSage</h3>
            <p className="text-blue-300">The Clinical Intelligence System</p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-blue-300 hover:text-white">About</a>
            <a href="#" className="text-blue-300 hover:text-white">Solutions</a>
            <a href="#" className="text-blue-300 hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route component={HomePage} />
    </Switch>
  );
}