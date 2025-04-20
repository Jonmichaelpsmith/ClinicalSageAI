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

  // Load documents and setup simple WebSocket
  useEffect(() => {
    loadDocs();
  }, [region]);
  
  // Separate WebSocket setup to avoid conflicts with region changes
  useEffect(() => {
    const setupWebSocket = () => {
      try {
        // Simple websocket connection
        const proto = location.protocol === 'https:' ? 'wss' : 'ws';
        const ws = new WebSocket(`${proto}://${location.host}/ws/qc`);
        
        // Handle connection open
        ws.addEventListener('open', () => {
          console.log('QC WebSocket connected');
          toast({ message: `Connected to ${region} QC updates`, type: 'info' });
        });
        
        // Handle messages
        ws.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WS message received:', data);
            
            // Handle QC status updates
            if (data.id && data.status) {
              toast({ 
                message: `QC ${data.status} for document ${data.id}`,
                type: data.status === 'passed' ? 'success' : 'error'
              });
              
              // Update the tree
              setTree(prevTree => 
                prevTree.map(node => 
                  node.id === data.id 
                    ? { 
                        ...node, 
                        data: { 
                          ...node.data, 
                          qc_json: { status: data.status } 
                        } 
                      } 
                    : node
                )
              );
            }
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        });
        
        // Handle errors
        ws.addEventListener('error', (error) => {
          console.error('WebSocket error:', error);
        });
        
        // Handle closure
        ws.addEventListener('close', () => {
          console.log('WebSocket connection closed');
          
          // Auto-reconnect after delay
          setTimeout(() => setupWebSocket(), 3000);
        });
        
        // Store reference
        wsRef.current = ws;
      } catch (err) {
        console.error('Error setting up WebSocket:', err);
      }
    };
    
    // Initial setup
    setupWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

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