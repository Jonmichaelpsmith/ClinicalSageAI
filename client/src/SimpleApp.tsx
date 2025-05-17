import React, { useState, useEffect } from 'react';
import { Route, Switch, Link, useLocation } from 'wouter';
import { cn } from "@/lib/utils";

// WebSocket status component (simplified)
const WebSocketStatus = () => {
  const [wsStatus, setWsStatus] = useState('Not connected');
  
  // Check WebSocket status but don't block app functionality
  useEffect(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => setWsStatus('Connected');
      ws.onerror = () => setWsStatus('Error');
      ws.onclose = (event) => setWsStatus(`Closed (${event.code})`);
      
      return () => ws.close();
    } catch (err) {
      setWsStatus('Initialization Error');
    }
  }, []);
  
  return (
    <div
      className={cn(
        "inline-block text-xs px-2 py-1 rounded-full text-white",
        wsStatus === 'Connected' ? 'bg-green-500' : 'bg-red-500'
      )}
    >
      WebSocket: {wsStatus}
    </div>
  );
};

// App navigation
const Navigation = () => {
  const [location] = useLocation();
  
  return (
    <nav className="p-4 border-b border-gray-300 mb-4 flex items-center justify-between">
      <div className="flex gap-4">
        <Link href="/">
          <a className={cn(
            'text-blue-600 no-underline',
            location === '/' ? 'font-bold' : 'font-normal'
          )}>
            TrialSage Home
          </a>
        </Link>
        <Link href="/ind-wizard">
          <a className={cn(
            'text-blue-600 no-underline',
            location === '/ind-wizard' ? 'font-bold' : 'font-normal'
          )}>
            IND Wizard
          </a>
        </Link>
        <Link href="/reports">
          <a className={cn(
            'text-blue-600 no-underline',
            location === '/reports' ? 'font-bold' : 'font-normal'
          )}>
            CSR Reports
          </a>
        </Link>
        <Link href="/diagnostic">
          <a className={cn(
            'text-blue-600 no-underline',
            location === '/diagnostic' ? 'font-bold' : 'font-normal'
          )}>
            System Diagnostic
          </a>
        </Link>
      </div>
      <WebSocketStatus />
    </nav>
  );
};

// Diagnostic component (simplified version of the original)
const WebSocketDiagnostic = () => {
  const [testResults, setTestResults] = useState<{[key: string]: string}>({});
  
  // Test API connectivity
  useEffect(() => {
    const testApiConnectivity = async () => {
      // API health check
      try {
        const healthResponse = await fetch('/api/health');
        setTestResults(prev => ({
          ...prev, 
          'API Health': healthResponse.ok ? 'Working' : `Failed: ${healthResponse.status}`
        }));
      } catch (err: any) {
        setTestResults(prev => ({
          ...prev, 
          'API Health': `Error: ${err.message}`
        }));
      }
      
      // IND wizard data
      try {
        const indDataResponse = await fetch('/api/ind/wizard/data');
        setTestResults(prev => ({
          ...prev, 
          'IND Wizard Data': indDataResponse.ok ? 'Available' : `Failed: ${indDataResponse.status}`
        }));
      } catch (err: any) {
        setTestResults(prev => ({
          ...prev, 
          'IND Wizard Data': `Error: ${err.message}`
        }));
      }
    };
    
    testApiConnectivity();
  }, []);
  
  return (
    <div className="p-4 max-w-[800px] mx-auto">
      <h1>System Diagnostic</h1>
      
      <div className="p-4 border border-gray-300 rounded mb-4">
        <h2>API Connectivity</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2 border-b border-gray-300">Endpoint</th>
              <th className="text-left p-2 border-b border-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
              {Object.entries(testResults).map(([test, result]) => (
                <tr key={test}>
                  <td className="p-2 border-b border-gray-300">{test}</td>
                  <td
                    className={cn(
                      "p-2 border-b border-gray-300 font-bold",
                      result.includes('Working') || result.includes('Available')
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    {result}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      
      <div className="p-4 border border-gray-300 rounded bg-yellow-100">
        <h2>Known Issues</h2>
        <ul className="pl-6">
          <li>WebSocket connections are failing with code 1006</li>
          <li>FastAPI server at port 8000 is not accessible</li>
        </ul>
        <p>The application can still function in limited capacity without these connections.</p>
      </div>
    </div>
  );
};

// IND Wizard component (simplified)
const INDWizard = () => {
  const [wizardData, setWizardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch IND wizard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/ind/wizard/data');
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setWizardData(data);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching IND wizard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="p-8 text-center">
        <p>Loading IND Wizard data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2>Error Loading IND Wizard</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-4 max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1>IND Wizard</h1>
        <div>
          <span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm">
            Draft ID: {wizardData?.id || 'N/A'}
          </span>
        </div>
      </div>

      <div className="grid [grid-template-columns:250px_1fr] gap-4 border border-gray-300 rounded overflow-hidden">
        <div className="bg-gray-50 p-4 border-r border-gray-300">
          <h3 className="mt-0">Sections</h3>
          <ul className="list-none p-0 m-0">
            <li className="p-2 rounded bg-blue-600 text-white mb-2">
              Pre-IND Information
            </li>
            <li className="p-2 rounded mb-2">
              Nonclinical Studies
            </li>
            <li className="p-2 rounded mb-2 opacity-50">
              Clinical Studies
            </li>
            <li className="p-2 rounded mb-2 opacity-50">
              CMC Information
            </li>
            <li className="p-2 rounded mb-2 opacity-50">
              Additional Information
            </li>
          </ul>
        </div>
        
        <div className="p-4">
          <h2>Pre-IND Information</h2>
          
          <div className="mb-4">
            <label className="block mb-1 font-bold">
              Drug Name
            </label>
            <input
              type="text"
              value={wizardData?.sections?.preIndData?.drugName || ''}
              readOnly
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 font-bold">
              Indication
            </label>
            <input
              type="text"
              value={wizardData?.sections?.preIndData?.indicationName || ''}
              readOnly
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 font-bold">
              Sponsor Information
            </label>
            <input
              type="text"
              value={wizardData?.sections?.preIndData?.sponsorInfo || ''}
              readOnly
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 font-bold">
              IND Number
            </label>
            <input
              type="text"
              value={wizardData?.sections?.preIndData?.indNumber || ''}
              readOnly
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 font-bold">
              Target Submission Date
            </label>
            <input
              type="text"
              value={wizardData?.sections?.preIndData?.targetSubmissionDate || ''}
              readOnly
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="mt-8 text-right">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded ml-2"
            >
              Next: Nonclinical Studies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// CSR Reports component (simplified)
const CSRReports = () => {
  return (
    <div className="p-4 max-w-[1200px] mx-auto">
      <h1>CSR Reports</h1>

      <div className="p-8 text-center border border-gray-300 rounded bg-gray-100">
        <h2>CSR Library</h2>
        <p>This feature requires a working WebSocket connection.</p>
        <p>Please check the system diagnostic for more information.</p>
      </div>
    </div>
  );
};

// Home component (simplified)
const Home = () => {
  return (
    <div className="p-4 max-w-[1200px] mx-auto">
      <div className="p-8 bg-sky-50 rounded mb-8">
        <h1 className="text-2xl mt-0 mb-4 text-sky-700">
          Welcome to TrialSage
        </h1>
        <p className="text-lg mb-6">
          The Clinical Intelligence System That Thinks Like a Biotech Founder
        </p>
        <div className="flex gap-4">
          <Link href="/ind-wizard">
            <a className="inline-block px-6 py-3 bg-blue-600 text-white rounded font-bold no-underline">
              Open IND Wizard
            </a>
          </Link>
          <Link href="/reports">
            <a className="inline-block px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded font-bold no-underline">
              View CSR Reports
            </a>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 border border-gray-300 rounded">
          <h2 className="mt-0">IND & NDA Submission Accelerator</h2>
          <ul>
            <li>2× faster INDs</li>
            <li>Eliminates 90% manual formatting</li>
            <li>One-click eCTD → ESG</li>
          </ul>
        </div>

        <div className="p-6 border border-gray-300 rounded">
          <h2 className="mt-0">Global CSR Intelligent Library</h2>
          <ul>
            <li>Advanced CSR analytics</li>
            <li>Automated report generation</li>
            <li>Cross-study insights</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * Simplified App component that doesn't depend on WebSockets
 * This provides basic navigation and functionality that works
 * even when real-time WebSocket connections are failing
 */
export default function SimpleApp() {
  return (
    <div className="app-container font-sans">
      <Navigation />
      
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/ind-wizard" component={INDWizard} />
        <Route path="/reports" component={CSRReports} />
        <Route path="/diagnostic" component={WebSocketDiagnostic} />
        <Route path="*">
          <div className="p-8 text-center">
            <h1>Page Not Found</h1>
            <p>The requested page could not be found.</p>
            <Link href="/">
              <a className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded no-underline">
                Go Home
              </a>
            </Link>
          </div>
        </Route>
      </Switch>
    </div>
  );
}