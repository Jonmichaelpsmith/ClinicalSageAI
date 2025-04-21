import React from 'react';
import './index.css';

function App() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800">TrialSage</h1>
        <p className="text-gray-600">Clinical Intelligence Platform</p>
      </header>
      
      <main>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Solution Bundles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bundle 1 */}
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-xl font-medium mb-2">IND & NDA Submission Accelerator</h3>
              <p className="text-gray-600 mb-3">Streamline regulatory submissions</p>
              <ul className="list-disc list-inside text-sm">
                <li>Web-based submission builder</li>
                <li>Automatic eCTD generation</li>
                <li>Multi-region validation</li>
              </ul>
            </div>
            
            {/* Bundle 2 */}
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-xl font-medium mb-2">Global CSR Intelligence Suite</h3>
              <p className="text-gray-600 mb-3">Extract insights from clinical documents</p>
              <ul className="list-disc list-inside text-sm">
                <li>CSR knowledge base</li>
                <li>Protocol comparator</li>
                <li>Study effectiveness analyzer</li>
              </ul>
            </div>
            
            {/* Bundle 3 */}
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-xl font-medium mb-2">Report & Review Toolkit</h3>
              <p className="text-gray-600 mb-3">Create professional reports</p>
              <ul className="list-disc list-inside text-sm">
                <li>CER report generator</li>
                <li>CSR formatter</li>
                <li>Protocol optimizer</li>
              </ul>
            </div>
            
            {/* Bundle 4 */}
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-xl font-medium mb-2">Enterprise Command Center</h3>
              <p className="text-gray-600 mb-3">Control system for regulatory operations</p>
              <ul className="list-disc list-inside text-sm">
                <li>Real-time analytics</li>
                <li>Multi-submission tracking</li>
                <li>Role-based dashboards</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded shadow">
              <h3 className="font-medium mb-2">Accelerate Submissions</h3>
              <p>2× faster INDs with AI-powered document generation</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded shadow">
              <h3 className="font-medium mb-2">Reduce Manual Work</h3>
              <p>Eliminate 90% of manual formatting</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded shadow">
              <h3 className="font-medium mb-2">Cost Savings</h3>
              <p>Save up to $2M per trial</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;