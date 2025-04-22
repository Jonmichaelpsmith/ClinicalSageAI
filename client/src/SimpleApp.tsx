import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'wouter';

// WebSocket diagnostic component
const WebSocketDiagnostic = () => {
  const [wsStatus, setWsStatus] = useState('Not connected');
  const [wsErrors, setWsErrors] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<{[key: string]: string}>({});

  // Test basic WebSocket connection
  useEffect(() => {
    // Test connection to standard WebSocket endpoint with proper protocol
    try {
      // Use secure protocol (wss) for HTTPS, regular (ws) for HTTP
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      setTestResults(prev => ({...prev, wsUrl: `Using ${wsUrl}`}));
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setWsStatus('Connected successfully!');
        setTestResults(prev => ({...prev, basicWs: 'Working'}));
      };
      
      ws.onerror = (error) => {
        setWsStatus('Connection failed');
        setWsErrors(prev => [...prev, 'WebSocket connection failed - likely missing WebSocket server implementation']);
        setTestResults(prev => ({...prev, basicWs: 'Failed'}));
      };
      
      ws.onclose = (event) => {
        setWsStatus(`Connection closed (Code: ${event.code})`);
        if (event.code !== 1000) {
          setWsErrors(prev => [...prev, `WebSocket closed with code ${event.code}: ${event.reason || 'No reason provided'}`]);
          
          // More detailed diagnostic for code 1006
          if (event.code === 1006) {
            setWsErrors(prev => [...prev, 
              "WebSocket Code 1006 (Abnormal Closure) detected. This typically means either:" +
              "\n1. The server closed the connection without sending a close frame" +
              "\n2. The connection was closed abnormally (e.g., network error)" +
              "\n3. There might be an issue with the WebSocket server implementation"
            ]);
          }
        }
      };
      
      return () => {
        ws.close();
      };
    } catch (err) {
      setWsErrors(prev => [...prev, `WebSocket initialization error: ${err.message}`]);
      setTestResults(prev => ({...prev, basicWs: 'Exception: ' + err.message}));
    }
  }, []);

  // Test standard HTTP connectivity
  useEffect(() => {
    const testHttpConnectivity = async () => {
      try {
        // Test both the health endpoint and a simple static resource
        const healthResponse = await fetch('/api/health');
        const healthStatus = healthResponse.ok ? 'Working' : `Failed: ${healthResponse.status}`;
        setTestResults(prev => ({...prev, 'FastAPI Health': healthStatus}));
        
        // Also test a standard Express route
        const staticResponse = await fetch('/');
        const staticStatus = staticResponse.ok ? 'Working' : `Failed: ${staticResponse.status}`;
        setTestResults(prev => ({...prev, 'Express Static': staticStatus}));
        
        // FastAPI connection to 8000
        try {
          const apiResponse = await fetch('http://localhost:8000/health', { mode: 'no-cors' });
          setTestResults(prev => ({...prev, 'FastAPI Direct': 'Request sent (no CORS result)'}));
        } catch (apiError: any) {
          setTestResults(prev => ({...prev, 'FastAPI Direct': `Failed: ${apiError.message}`}));
          setWsErrors(prev => [...prev, `FastAPI Connection Error: ${apiError.message}`]);
        }
        
      } catch (err: any) {
        setTestResults(prev => ({...prev, 'API Health': `Exception: ${err.message}`}));
        setWsErrors(prev => [...prev, `API Error: ${err.message}`]);
      }
    };
    
    testHttpConnectivity();
  }, []);

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ color: '#2563eb' }}>TrialSage - WebSocket Diagnostic Tool</h1>
      
      <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <h2>WebSocket Status</h2>
        <p>Current status: <span style={{ 
          fontWeight: 'bold', 
          color: wsStatus === 'Connected successfully!' ? 'green' : 'red' 
        }}>{wsStatus}</span></p>
        
        {wsErrors.length > 0 && (
          <div>
            <h3>Errors:</h3>
            <ul>
              {wsErrors.map((error, i) => <li key={i}>{error}</li>)}
            </ul>
          </div>
        )}
      </div>
      
      <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <h2>Connectivity Tests</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Test</th>
              <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Result</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(testResults).map(([test, result]) => (
              <tr key={test}>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>{test}</td>
                <td style={{ 
                  padding: '0.5rem', 
                  borderBottom: '1px solid #e5e7eb',
                  color: result.includes('Working') ? 'green' : 'red',
                  fontWeight: 'bold'
                }}>{result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
        <h2>Identified Issues & Recommended Fixes</h2>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>1. Missing WebSocket Server</h3>
          <p>The WebSocket connection is failing because there's no WebSocket server implementation at <code>/ws</code>.</p>
          <div style={{ background: '#f9fafb', padding: '0.75rem', borderRadius: '0.25rem', marginTop: '0.5rem' }}>
            <strong>Fix:</strong> Implement WebSocket server support in server/routes.ts:
            <pre style={{ background: '#f5f5f5', padding: '0.75rem', borderRadius: '0.25rem', overflowX: 'auto', marginTop: '0.5rem' }}>
              {`import { WebSocketServer } from 'ws';

// In your route registration function:
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('message', (message) => {
    console.log('Received: %s', message);
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

return httpServer; // Make sure to return the httpServer`}
            </pre>
          </div>
        </div>
        
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>2. FastAPI Connectivity</h3>
          <p>FastAPI server at port 8000 is not running or not accessible.</p>
          <div style={{ background: '#f9fafb', padding: '0.75rem', borderRadius: '0.25rem', marginTop: '0.5rem' }}>
            <strong>Fix:</strong> Either:
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Start the FastAPI server if it's expected to be running</li>
              <li>Update server/index.ts to handle fallbacks when FastAPI is unavailable</li>
              <li>Consider removing FastAPI dependency if it's not critical</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginTop: '1rem' }}>
        <h2>Next Steps</h2>
        <p>After implementing these fixes:</p>
        <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Restart the application server</li>
          <li>Re-run the diagnostic tool to verify WebSocket connectivity</li>
          <li>Once WebSocket is working, restore the original main.tsx and App.tsx to test the full application</li>
        </ol>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f9ff', borderRadius: '0.5rem' }}>
        <p><strong>Note:</strong> The WebSocket connection issues are preventing the TrialSage application from functioning properly.</p>
        <p>The application's blank screen problem is likely caused by a dependency on WebSocket connections that are failing.</p>
      </div>
    </div>
  );
};

/**
 * Simple diagnostic App component
 * This is a stripped-down version to help diagnose rendering issues
 */
export default function SimpleApp() {
  return (
    <div className="app-container">
      <Switch>
        <Route path="*">
          <WebSocketDiagnostic />
        </Route>
      </Switch>
    </div>
  );
}