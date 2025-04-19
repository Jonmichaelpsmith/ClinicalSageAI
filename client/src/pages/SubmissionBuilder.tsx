// SubmissionBuilder.tsx – drag‑drop tree with live QC badges via WebSocket, region aware
import React, { useEffect, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { Tree, NodeModel } from '@minoru/react-dnd-treeview';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SubmissionBuilderWebSocket from '../components/SubmissionBuilderWebSocket';

// Define region-specific folder structures
const REGION_FOLDERS: Record<string, string[]> = {
  FDA: ['m1', 'm2', 'm3', 'm4', 'm5'],
  EMA: ['m1', 'm1.0', 'm1.2', 'm2', 'm3', 'm4', 'm5'],
  PMDA: ['m1', 'm2', 'm3', 'm4', 'm5', 'jp-annex']
};

// Required modules per region
const REGION_REQUIRED: Record<string, string[]> = {
  FDA: ['m1', 'm1.1', 'm1.3'],
  EMA: ['m1', 'm1.0', 'm1.2'],
  PMDA: ['m1', 'jp-annex']
};

// Document type definition
type Doc = { 
  id: number; 
  title: string; 
  module: string; 
  qc_json?: { 
    status: string 
  } 
};

// Node type definition for the tree
type Node = NodeModel<Doc>;

export default function SubmissionBuilder({ region = 'FDA' }: { region?: string }) {
  const [tree, setTree] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [wsStatus, setWsStatus] = useState<string>('disconnected');
  
  // Handle QC updates from WebSocket
  const handleQcUpdate = (data: { id: number, status: string }) => {
    console.log('QC update received:', data);
    
    // Update the tree node with the new QC status
    setTree(prev => prev.map(n => {
      if (n.id === data.id) {
        return { 
          ...n, 
          data: { 
            ...n.data!, 
            qc_json: { status: data.status } 
          } 
        };
      }
      return n;
    }));
    
    // Show a toast notification for the update
    if (data.status === 'passed') {
      toast.success(`Document #${data.id} passed QC`);
    } else if (data.status === 'failed') {
      toast.error(`Document #${data.id} failed QC`);
    }
  };

  // Load documents on mount or region change
  useEffect(() => {
    loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  // Fetch documents from the API
  const loadDocs = async () => {
    setLoading(true);
    try {
      const docs: Doc[] = await fetchJson('/api/documents?status=all');
      
      // Create root node
      const root: Node = { 
        id: 0, 
        parent: 0, 
        text: 'root', 
        droppable: true 
      };
      
      // Create folder nodes based on region
      const folders = REGION_FOLDERS[region].map((m, idx) => ({ 
        id: 10000 + idx, 
        parent: 0, 
        text: m, 
        droppable: true 
      }));
      
      // Create document nodes and assign them to folders
      const items = docs.map(d => ({
        id: d.id,
        parent: folders.find(f => d.module.startsWith(f.text))?.id || folders[0].id,
        text: d.title,
        droppable: false,
        data: d
      }));
      
      setTree([root, ...folders, ...items]);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  // Handle node drop for reordering
  const handleDrop = (newTree: Node[]) => {
    setTree(newTree);
  };
  
  // Toggle document selection
  const toggleSelection = (id: number) => {
    setSelected(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  // Bulk approve selected documents
  const bulkApprove = async () => {
    try {
      const response = await fetch('/api/documents/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) })
      });
      
      if (!response.ok) throw new Error('Bulk approval failed');
      
      const result = await response.json();
      toast.info(`Bulk approval started: ${result.updated} documents`);
      setSelected(new Set());
    } catch (error) {
      console.error('Error during bulk approval:', error);
      toast.error('Bulk approval failed');
    }
  };

  // Save document order
  const saveOrder = async () => {
    try {
      const ordered = tree
        .filter(n => !n.droppable && n.parent !== 0)
        .map((n, i) => ({ 
          id: n.id, 
          module: tree.find(f => f.id === n.parent)!.text, 
          order: i 
        }));
      
      const response = await fetch('/api/documents/builder-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docs: ordered })
      });
      
      if (!response.ok) throw new Error('Save order failed');
      
      toast.success('Order saved successfully');
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Failed to save order');
    }
  };

  // Render tree node
  const renderNode = (node: Node, { depth, isOpen, onToggle }: any) => {
    if (node.droppable) {
      // Render folder node
      const isRequired = REGION_REQUIRED[region].includes(node.text);
      return (
        <div 
          style={{ marginLeft: depth * 16 }} 
          className="d-flex align-items-center gap-1 py-1 fw-bold"
        >
          <button 
            onClick={onToggle} 
            className="btn btn-sm btn-link p-0"
          >
            {isOpen ? '▾' : '▸'}
          </button>
          {node.text}
          {isRequired && (
            <span 
              className="badge bg-warning ms-2" 
              title={`Required for ${region}`}
            >
              Required
            </span>
          )}
        </div>
      );
    } else {
      // Render document node
      const qcStatus = node.data?.qc_json?.status;
      return (
        <div 
          style={{ marginLeft: depth * 16 }} 
          className="d-flex align-items-center gap-2 py-1"
        >
          <input 
            type="checkbox" 
            checked={selected.has(node.id as number)} 
            onChange={() => toggleSelection(node.id as number)} 
          />
          {qcStatus === 'passed' 
            ? <CheckCircle size={14} className="text-success" /> 
            : <XCircle size={14} className="text-danger" />
          }
          <span>{node.text}</span>
        </div>
      );
    }
  };

  // Loading state
  if (loading) {
    return <p className="text-center mt-4">Loading…</p>;
  }

  // Check for missing required modules
  const missingModules = REGION_REQUIRED[region].filter(m => 
    !tree.some(n => n.text === m && n.droppable)
  );

  return (
    <div className="container py-4">
      {/* WebSocket component for real-time QC updates */}
      <SubmissionBuilderWebSocket 
        onStatusChange={setWsStatus} 
        onQcUpdate={handleQcUpdate} 
      />
      
      <h2>
        Submission Builder 
        <span className="badge bg-secondary ms-2">{region}</span>
        {wsStatus === 'connected' && (
          <span className="badge bg-success ms-2">QC Live</span>
        )}
      </h2>
      
      {missingModules.length > 0 && (
        <div className="alert alert-warning">
          <strong>Warning:</strong> Missing required modules for {region}: 
          {missingModules.map(m => (
            <span key={m} className="badge bg-warning ms-1">{m}</span>
          ))}
        </div>
      )}
      
      <DndProvider backend={HTML5Backend}>
        <Tree 
          tree={tree} 
          rootId={0} 
          render={renderNode} 
          onDrop={handleDrop} 
          classes={{
            root: 'tree-root',
            container: 'tree-container',
            dropTarget: 'drop-target',
            draggingSource: 'dragging-source'
          }}
        />
      </DndProvider>
      
      <div className="d-flex gap-3 mt-3">
        <button 
          className="btn btn-primary" 
          onClick={saveOrder}
        >
          Save Order
        </button>
        <button 
          className="btn btn-outline-success" 
          disabled={!selected.size} 
          onClick={bulkApprove}
        >
          Bulk Approve + QC ({selected.size})
        </button>
      </div>
    </div>
  );
}

// Helper function to fetch JSON data
async function fetchJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  return response.json();
}