import { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
// Import regular components instead of specialized visualization components
// due to package installation issues
import { Text, Stack, TextField, PrimaryButton, Label } from '@fluentui/react';

// Type definitions
interface Message {
  type: 'user' | 'text' | 'rows' | 'vega' | 'error';
  content?: string;
  data?: any[];
  spec?: any;
}

export default function AnalyticsChat() {
  const { token } = useContext(AuthContext)!;
  const [prompt, setPrompt] = useState('');
  const [msgs, setMsgs] = useState<any[]>([]);
  const [showSave, setShowSave] = useState(false);
  const [dashboardTitle, setDashboardTitle] = useState('');
  const evSrcRef = useRef<EventSource|null>(null);

  const send = () => {
    if (!prompt.trim()) return;
    
    // Add user message to the chat
    setMsgs(m => [...m, { type: 'user', content: prompt }]);
    
    const ev = new EventSource(`${import.meta.env.VITE_API_URL}/api/analytics/chat`, { 
      withCredentials: false 
    });
    
    evSrcRef.current = ev;
    
    // Initialize EventSource and set up event listeners
    ev.onopen = () => {
      // Send the prompt through a separate fetch
      fetch(`${import.meta.env.VITE_API_URL}/api/analytics/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      }).catch(err => console.error("Error sending prompt:", err));
    };
    
    ev.addEventListener('rows', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setMsgs(m => [...m, { type: 'rows', data }]);
      // Show save option when we get data
      setShowSave(true);
    });
    
    ev.addEventListener('vega', (e: MessageEvent) => {
      const spec = JSON.parse(e.data); 
      if (spec) {
        setMsgs(m => [...m, { type: 'vega', spec }]);
      }
    });
    
    ev.addEventListener('text', (e: MessageEvent) => {
      setMsgs(m => [...m, { type: 'text', content: JSON.parse(e.data) }]);
    });
    
    ev.addEventListener('error', (e: MessageEvent) => {
      const errorData = JSON.parse(e.data);
      setMsgs(m => [...m, { type: 'error', content: `Error: ${errorData.message}` }]);
      ev.close();
    });
    
    ev.addEventListener('done', () => ev.close());
    
    // Clear the input field
    setPrompt('');
  };

  const saveDashboard = async () => {
    if (!dashboardTitle.trim()) {
      alert('Please enter a title for your dashboard');
      return;
    }
    
    const vegaMsg = msgs.find(m => m.type === 'vega');
    if (!vegaMsg) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: dashboardTitle,
          vega_spec: vegaMsg.spec
        })
      });
      
      if (response.ok) {
        alert('Dashboard saved successfully!');
        setDashboardTitle('');
        setShowSave(false);
      } else {
        alert('Failed to save dashboard');
      }
    } catch (error) {
      console.error('Error saving dashboard:', error);
      alert('Error saving dashboard');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {msgs.map((m: Message, i) => {
          if (m.type === 'user') {
            return (
              <div key={i} style={{ marginBottom: 16, textAlign: 'right' }}>
                <div style={{ 
                  display: 'inline-block', 
                  background: '#1E88E5', 
                  color: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '18px 18px 0 18px',
                  maxWidth: '80%'
                }}>
                  {m.content}
                </div>
              </div>
            );
          }
          
          if (m.type === 'vega') {
            // Fallback for visualization - display data in a simple table
            const rowsData = msgs.find((r: Message) => r.type === 'rows')?.data || [];
            return (
              <div key={i} style={{ marginBottom: 16, background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Text variant="large" block>Data Visualization</Text>
                <Text block style={{ margin: '8px 0' }}>
                  Note: Chart visualization would appear here. 
                  Using tabular data display as fallback.
                </Text>
                
                {rowsData.length > 0 && (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                      <thead>
                        <tr>
                          {Object.keys(rowsData[0]).map((key) => (
                            <th key={key} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rowsData.map((row, idx) => (
                          <tr key={idx}>
                            {Object.values(row).map((val: any, valIdx) => (
                              <td key={valIdx} style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          }
          
          if (m.type === 'rows') {
            return null; // We display rows as part of the chart
          }
          
          if (m.type === 'error') {
            return (
              <div key={i} style={{ marginBottom: 16, color: 'red', background: '#FFEBEE', padding: 12, borderRadius: 8 }}>
                {m.content}
              </div>
            );
          }
          
          // Text messages (assistant response)
          return (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ 
                display: 'inline-block', 
                background: '#F1F3F4', 
                padding: '8px 12px', 
                borderRadius: '18px 18px 18px 0',
                maxWidth: '80%'
              }}>
                {m.content}
              </div>
            </div>
          );
        })}
      </div>
      
      {showSave && (
        <div style={{ padding: 16, borderTop: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
          <TextField 
            value={dashboardTitle} 
            onChange={(e, newValue) => setDashboardTitle(newValue || '')} 
            placeholder="Dashboard title" 
            styles={{ root: { width: '50%' } }} 
          />
          <PrimaryButton 
            onClick={saveDashboard} 
            styles={{ root: { marginLeft: 8 } }}
            text="Save Dashboard"
          />
        </div>
      )}
      
      <div style={{ padding: 16, borderTop: '1px solid #eee', display: 'flex' }}>
        <TextField 
          value={prompt} 
          onChange={(e, newValue) => setPrompt(newValue || '')}
          placeholder="Ask analytics..." 
          styles={{ root: { width: '80%' } }}
          onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && send()}
        />
        <PrimaryButton 
          onClick={send} 
          styles={{ root: { marginLeft: 8 } }}
          text="Send"
        />
      </div>
    </div>
  );
}