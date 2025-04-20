// SubmissionBuilder.jsx – drag‑drop tree with QC badges, bulk approve & region rule hints
import React, { useEffect, useState, useRef } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { Tree } from '@minoru/react-dnd-treeview';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { useToast } from '../App';
import update from 'immutability-helper';

const REGION_FOLDERS = {
  FDA: ['m1', 'm2', 'm3', 'm4', 'm5'],
  EMA: ['m1', 'm2', 'm3', 'm4', 'm5', 'application-form'],
  PMDA: ['m1', 'm2', 'm3', 'm4', 'm5', 'jp-annex'],
};

const REGION_HINTS = {
  FDA: [
    '✓ Form 1571 must be in m1.1',
    '✓ Form 3674 (clinicaltrials.gov) required in m1.5',
    '✓ Cover letter PDF <10 MB',
  ],
  EMA: [
    '✓ "Application Form" PDF required in application-form folder',
    '✓ Letter of Access in m1.2',
  ],
  PMDA: [
    '✓ JP Annex PDF must be placed in jp-annex folder',
    '✓ Japanese IB translation required in m1.3',
  ],
};

export default function SubmissionBuilder({ initialRegion = 'FDA', region: propRegion }) {
  // Use either the passed region prop or fall back to initialRegion
  const [region, setRegion] = useState(propRegion || initialRegion);
  const [tree, setTree] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);

  // Load documents and set up WebSocket connection
  useEffect(() => {
    loadDocs();
    
    // Socket connection with auto-reconnect and region awareness
    const connectWebSocket = () => {
      const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/qc`);
      
      ws.onopen = () => {
        console.log('QC WebSocket connected');
        // Reset reconnect attempts on successful connection
        reconnectAttempts.current = 0;
        
        // Subscribe to the current region's updates
        ws.send(JSON.stringify({
          action: 'subscribe',
          region: region
        }));
      };
      
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          console.log('WS Message:', data);
          
          // Handle different message types
          if (data.type === 'connection_established') {
            console.log('WebSocket connection confirmed');
          } 
          else if (data.type === 'subscription_ack') {
            console.log(`Subscribed to ${data.region} updates`);
            toast({ 
              message: `Connected to ${data.region} validator updates`,
              type: 'info'
            });
          }
          else if (data.type === 'qc_status' && data.id && data.status) {
            // Update individual document status
            setTree(prev => prev.map(n => {
              if (n.id === data.id) {
                toast({ 
                  message: `QC ${data.status === 'passed' ? 'passed' : 'failed'} for ${n.text}`,
                  type: data.status === 'passed' ? 'success' : 'error'
                });
                return { 
                  ...n, 
                  data: { 
                    ...n.data, 
                    qc_json: { 
                      status: data.status,
                      profile: data.profile || `${region}_eCTD` 
                    } 
                  } 
                };
              }
              return n;
            }));
          }
          else if (data.type === 'bulk_qc_summary') {
            // Handle bulk validation summary
            const { passed, failed, total, profile } = data;
            toast({ 
              message: `Bulk validation complete: ${passed}/${total} passed using ${profile || `${region} profile`}`,
              type: failed > 0 ? 'error' : 'success'
            });
            // Refresh document list to get updated statuses
            loadDocs();
          }
          else if (data.type === 'bulk_qc_error') {
            // Handle bulk validation errors
            toast({ 
              message: `Validation error: ${data.message || 'Unknown error'}`,
              type: 'error'
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = (e) => {
        console.log('QC WebSocket disconnected, attempting reconnect in 2s...');
        
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        // Attempt to reconnect after delay (with exponential backoff)
        const delay = Math.min(2000 * Math.pow(1.5, reconnectAttempts.current), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          wsRef.current = connectWebSocket();
        }, delay);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close(); // This will trigger the onclose handler for reconnection
      };
      
      return ws;
    };
    
    // Track reconnection state
    const reconnectAttempts = useRef(0);
    const reconnectTimeoutRef = useRef(null);
    
    // Initial connection
    wsRef.current = connectWebSocket();
    
    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [region]);

  const toast = useToast();
  
  const loadDocs = async () => {
    setLoading(true);
    try {
      const docs = await fetchJson('/api/documents?status=approved_or_qc_failed');
      const root = { id: 0, parent: 0, text: 'root', droppable: true };
      const folders = REGION_FOLDERS[region].map((m, i) => ({ id: 10000 + i, parent: 0, text: m, droppable: true }));
      const items = docs.map(d => ({ 
        id: d.id, 
        parent: folders.find(f => d.module?.startsWith(f.text))?.id || folders[0].id, 
        text: d.title, 
        droppable: false, 
        data: d 
      }));
      setTree([root, ...folders, ...items]);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({ message: 'Failed to load documents', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const saveOrder = async () => {
    const ordered = tree.filter(n => !n.droppable && n.parent !== 0).map((n, idx) => ({ 
      id: n.id, 
      module: tree.find(f => f.id === n.parent)?.text, 
      order: idx 
    }));
    
    try {
      await fetch('/api/documents/builder-order', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ docs: ordered }) 
      });
      toast({ message: 'Order saved', type: 'success' });
    } catch (error) {
      console.error('Error saving order:', error);
      toast({ message: 'Failed to save order', type: 'error' });
    }
  };

  const toggleSelect = (id) => setSelected(s => { 
    const x = new Set(s); 
    x.has(id) ? x.delete(id) : x.add(id); 
    return x; 
  });

  const bulkApprove = async () => {
    try {
      await fetch('/api/documents/bulk-approve', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ ids: Array.from(selected) }) 
      });
      toast({ message: 'Bulk approval/QC started', type: 'info' });
      setSelected(new Set());
    } catch (error) {
      console.error('Error bulk approving:', error);
      toast({ message: 'Failed to start bulk approval', type: 'error' });
    }
  };

  const handleDrop = (newTree) => setTree(newTree);

  const renderNode = (node, { depth, isOpen, onToggle }) => {
    if (node.droppable) {
      return (
        <div style={{ marginLeft: depth * 16 }} className="d-flex align-items-center gap-1 py-1 fw-bold">
          <button onClick={onToggle} className="btn btn-sm btn-link p-0">{isOpen ? '▾' : '▸'}</button>
          {node.text}
        </div>
      );
    }
    
    return (
      <div style={{ marginLeft: depth * 16 }} className="d-flex align-items-center gap-2 py-1">
        <input type="checkbox" checked={selected.has(node.id)} onChange={() => toggleSelect(node.id)} />
        {node.data?.qc_json?.status === 'passed' ? 
          <CheckCircle size={14} className="text-success" /> : 
          <XCircle size={14} className="text-danger" />
        }
        <span>{node.text}</span>
      </div>
    );
  };

  if (loading) return <div className="text-center mt-4">Loading...</div>;

  return (
    <div className="container py-4">
      {/* Region Selector */}
      <div className="mb-4">
        <div className="d-flex align-items-center">
          <h2 className="mb-0 me-4">Submission Builder</h2>
          <div className="btn-group" role="group" aria-label="Region Selection">
            {Object.keys(REGION_FOLDERS).map(r => (
              <button 
                key={r} 
                type="button" 
                className={`btn ${region === r ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setRegion(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <p className="text-muted mt-2">
          {region === 'FDA' && 'FDA submissions follow US regulatory standards and 21 CFR Part 11 requirements.'}
          {region === 'EMA' && 'EMA submissions adhere to EU regulatory requirements with regional variations.'}
          {region === 'PMDA' && 'PMDA submissions include Japan-specific annexes and follow PMDA guidelines.'}
        </p>
      </div>
      
      {/* Region hints */}
      <div className="alert alert-info d-flex gap-2 align-items-start py-2 mb-4">
        <Info size={16} className="mt-1"/>
        <ul className="mb-0">
          {REGION_HINTS[region].map((h, i) => (<li key={i}>{h}</li>))}
        </ul>
      </div>
      
      <DndProvider backend={HTML5Backend}>
        <Tree 
          rootId={0} 
          tree={tree} 
          onDrop={handleDrop} 
          render={renderNode} 
          classes={{ 
            draggingSource: 'opacity-50',
            dropTarget: 'bg-light' 
          }}
        />
      </DndProvider>
      
      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-primary" onClick={saveOrder}>Save Order</button>
        <button className="btn btn-outline-success" disabled={!selected.size} onClick={bulkApprove}>
          Bulk Approve + QC
        </button>
      </div>
      
    </div>
  );
}

async function fetchJson(u) { 
  const r = await fetch(u); 
  if (!r.ok) throw new Error('fetch failed'); 
  return r.json(); 
}