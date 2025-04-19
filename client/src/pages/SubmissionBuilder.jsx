// SubmissionBuilder.jsx – full drag‑drop builder with live QC websocket
import React, { useEffect, useState, useRef } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { Tree, NodeModel } from '@minoru/react-dnd-treeview';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import update from 'immutability-helper';

const REGION_FOLDERS = {
  FDA: ['m1', 'm2', 'm3', 'm4', 'm5'],
  EMA: ['m1', 'm2', 'm3', 'm4', 'm5'],
  PMDA: ['m1', 'm2', 'm3', 'm4', 'm5', 'jp‑annex'],
};

export default function SubmissionBuilder({ region = 'FDA' }) {
  const [tree, setTree] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const wsRef = useRef(null);

  useEffect(() => {
    loadDocs();
    
    // Socket connection with auto-reconnect
    const connectWebSocket = () => {
      const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/qc`);
      
      ws.onopen = () => {
        console.log('QC WebSocket connected');
        // Reset reconnect attempts on successful connection
        reconnectAttempts.current = 0;
      };
      
      ws.onmessage = (e) => {
        try {
          const { id, status } = JSON.parse(e.data);
          // Update the corresponding document's QC status in the tree
          setTree(prev => prev.map(n => n.id === id ? { ...n, data: { ...n.data, qc_json: { status } } } : n));
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

  const loadDocs = async () => {
    const docs = await fetchJson('/api/documents?status=approved_or_qc_failed');
    const root = { id: 0, parent: 0, text: 'root', droppable: true };
    const folders = REGION_FOLDERS[region].map((m, i) => ({ id: 10000 + i, parent: 0, text: m, droppable: true }));
    const items = docs.map(d => ({ id: d.id, parent: folders.find(f => d.module.startsWith(f.text))?.id || folders[0].id, text: d.title, droppable: false, data: d }));
    setTree([root, ...folders, ...items]);
  };

  const saveOrder = async () => {
    const ordered = tree.filter(n => !n.droppable && n.parent !== 0).map((n, idx) => ({ id: n.id, module: tree.find(f => f.id === n.parent)?.text, order: idx }));
    await fetch('/api/documents/builder-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ docs: ordered }) });
    toast.success('Order saved');
  };

  const toggleSelect = (id) => setSelected(s => { const x = new Set(s); x.has(id) ? x.delete(id) : x.add(id); return x; });

  const bulkApprove = async () => {
    await fetch('/api/documents/bulk-approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: Array.from(selected) }) });
    toast.info('Bulk approval/QC started');
    setSelected(new Set());
  };

  const onDrop = (newTree) => setTree(newTree);

  const renderNode = (node, { depth, isOpen, onToggle }) => node.droppable ? (
    <div style={{ marginLeft: depth * 16 }} className="fw-bold py-1">{node.text}</div>
  ) : (
    <div style={{ marginLeft: depth * 16 }} className="d-flex align-items-center gap-2 py-1">
      <input type="checkbox" checked={selected.has(node.id)} onChange={() => toggleSelect(node.id)} />
      {node.data?.qc_json?.status === 'passed' ? <CheckCircle size={14} className="text-success" /> : <XCircle size={14} className="text-danger" />}
      <span>{node.text}</span>
    </div>
  );

  return (
    <div className="container py-4">
      <h2>Submission Builder <span className="badge bg-secondary ms-2">{region}</span></h2>
      <DndProvider backend={HTML5Backend}>
        <Tree rootId={0} tree={tree} onDrop={onDrop} render={renderNode} />
      </DndProvider>
      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-primary" onClick={saveOrder}>Save Order</button>
        <button className="btn btn-outline-success" disabled={!selected.size} onClick={bulkApprove}>Bulk Approve + QC</button>
      </div>
    </div>
  );
}

async function fetchJson(u) { 
  const r = await fetch(u); 
  if (!r.ok) throw new Error('fetch'); 
  return r.json(); 
}