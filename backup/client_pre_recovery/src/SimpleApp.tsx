import React, { useState, useEffect } from 'react';
import { Route, Switch, Link, useLocation } from 'wouter';

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
    <div style={{ 
      display: 'inline-block',
      fontSize: '0.75rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      backgroundColor: wsStatus === 'Connected' ? '#22c55e' : '#ef4444',
      color: 'white'
    }}>
      WebSocket: {wsStatus}
    </div>
  );
};

// App navigation
const Navigation = () => {
  const [location] = useLocation();
  
  return (
    <nav style={{ 
      padding: '1rem', 
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/">
          <a style={{ 
            fontWeight: location === '/' ? 'bold' : 'normal',
            textDecoration: 'none',
            color: '#2563eb'
          }}>
            TrialSage Home
          </a>
        </Link>
        <Link href="/ind-wizard">
          <a style={{ 
            fontWeight: location === '/ind-wizard' ? 'bold' : 'normal',
            textDecoration: 'none',
            color: '#2563eb'
          }}>
            IND Wizard
          </a>
        </Link>
        <Link href="/reports">
          <a style={{ 
            fontWeight: location === '/reports' ? 'bold' : 'normal',
            textDecoration: 'none',
            color: '#2563eb'
          }}>
            CSR Reports
          </a>
        </Link>
        <Link href="/diagnostic">
          <a style={{ 
            fontWeight: location === '/diagnostic' ? 'bold' : 'normal',
            textDecoration: 'none',
            color: '#2563eb'
          }}>
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
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>System Diagnostic</h1>
      
      <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <h2>API Connectivity</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Endpoint</th>
              <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(testResults).map(([test, result]) => (
              <tr key={test}>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>{test}</td>
                <td style={{ 
                  padding: '0.5rem', 
                  borderBottom: '1px solid #e5e7eb',
                  color: result.includes('Working') || result.includes('Available') ? 'green' : 'red',
                  fontWeight: 'bold'
                }}>{result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ 
        padding: '1rem', 
        border: '1px solid #e5e7eb', 
        borderRadius: '0.5rem',
        backgroundColor: '#fef9c3'
      }}>
        <h2>Known Issues</h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading IND Wizard data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        <h2>Error Loading IND Wizard</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>IND Wizard</h1>
        <div>
          <span style={{ 
            display: 'inline-block',
            padding: '0.25rem 0.5rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.25rem',
            fontSize: '0.875rem'
          }}>
            Draft ID: {wizardData?.id || 'N/A'}
          </span>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '250px 1fr',
        gap: '1rem',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        overflow: 'hidden'
      }}>
        <div style={{ 
          backgroundColor: '#f9fafb', 
          padding: '1rem',
          borderRight: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginTop: 0 }}>Sections</h3>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0 
          }}>
            <li style={{ 
              padding: '0.5rem', 
              borderRadius: '0.25rem',
              backgroundColor: '#2563eb',
              color: 'white',
              marginBottom: '0.5rem'
            }}>
              Pre-IND Information
            </li>
            <li style={{ 
              padding: '0.5rem', 
              borderRadius: '0.25rem',
              marginBottom: '0.5rem'
            }}>
              Nonclinical Studies
            </li>
            <li style={{ 
              padding: '0.5rem', 
              borderRadius: '0.25rem',
              marginBottom: '0.5rem',
              opacity: 0.5
            }}>
              Clinical Studies
            </li>
            <li style={{ 
              padding: '0.5rem', 
              borderRadius: '0.25rem',
              marginBottom: '0.5rem',
              opacity: 0.5
            }}>
              CMC Information
            </li>
            <li style={{ 
              padding: '0.5rem', 
              borderRadius: '0.25rem',
              marginBottom: '0.5rem',
              opacity: 0.5
            }}>
              Additional Information
            </li>
          </ul>
        </div>
        
        <div style={{ padding: '1rem' }}>
          <h2>Pre-IND Information</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.25rem',
              fontWeight: 'bold'
            }}>
              Drug Name
            </label>
            <input 
              type="text" 
              value={wizardData?.sections?.preIndData?.drugName || ''}
              readOnly
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.25rem',
              fontWeight: 'bold'
            }}>
              Indication
            </label>
            <input 
              type="text" 
              value={wizardData?.sections?.preIndData?.indicationName || ''}
              readOnly
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.25rem',
              fontWeight: 'bold'
            }}>
              Sponsor Information
            </label>
            <input 
              type="text" 
              value={wizardData?.sections?.preIndData?.sponsorInfo || ''}
              readOnly
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.25rem',
              fontWeight: 'bold'
            }}>
              IND Number
            </label>
            <input 
              type="text" 
              value={wizardData?.sections?.preIndData?.indNumber || ''}
              readOnly
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.25rem',
              fontWeight: 'bold'
            }}>
              Target Submission Date
            </label>
            <input 
              type="text" 
              value={wizardData?.sections?.preIndData?.targetSubmissionDate || ''}
              readOnly
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem'
              }}
            />
          </div>
          
          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <button
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                marginLeft: '0.5rem'
              }}
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
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>CSR Reports</h1>
      
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        backgroundColor: '#f9fafb'
      }}>
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
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        padding: '2rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '0.5rem',
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          marginTop: 0,
          marginBottom: '1rem',
          color: '#0369a1'
        }}>
          Welcome to TrialSage
        </h1>
        <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>
          The Clinical Intelligence System That Thinks Like a Biotech Founder
        </p>
        <div style={{ 
          display: 'flex',
          gap: '1rem'
        }}>
          <Link href="/ind-wizard">
            <a style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '0.25rem',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              Open IND Wizard
            </a>
          </Link>
          <Link href="/reports">
            <a style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              color: '#2563eb',
              border: '1px solid #2563eb',
              borderRadius: '0.25rem',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              View CSR Reports
            </a>
          </Link>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem'
      }}>
        <div style={{ 
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem'
        }}>
          <h2 style={{ marginTop: 0 }}>IND & NDA Submission Accelerator</h2>
          <ul>
            <li>2× faster INDs</li>
            <li>Eliminates 90% manual formatting</li>
            <li>One-click eCTD → ESG</li>
          </ul>
        </div>
        
        <div style={{ 
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem'
        }}>
          <h2 style={{ marginTop: 0 }}>Global CSR Intelligent Library</h2>
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
    <div className="app-container" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <Navigation />
      
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/ind-wizard" component={INDWizard} />
        <Route path="/reports" component={CSRReports} />
        <Route path="/diagnostic" component={WebSocketDiagnostic} />
        <Route path="*">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Page Not Found</h1>
            <p>The requested page could not be found.</p>
            <Link href="/">
              <a style={{
                display: 'inline-block',
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '0.25rem',
                textDecoration: 'none'
              }}>
                Go Home
              </a>
            </Link>
          </div>
        </Route>
      </Switch>
    </div>
  );
}