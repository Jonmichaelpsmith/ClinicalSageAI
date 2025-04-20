// SubmissionBuilder.tsx – region‑aware drag‑drop tree with QC badges and bulk operations

import React, { useEffect, useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Tree, NodeModel } from '@minoru/react-dnd-treeview';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useQCWebSocket } from '../hooks/useQCWebSocket';

// Region‑specific folder hierarchy definitions
const REGION_TREE: Record<string, any> = {
  FDA: { m1: {}, m2: {}, m3: {}, m4: {}, m5: {} },
  EMA: {
    m1: { 'm1.0': {}, 'm1.1': {}, 'm1.2': {}, 'm1.3': {}, 'm1.4': {}, 'm1.5': {} },
    m2: {}, m3: {}, m4: {}, m5: {}
  },
  PMDA: {
    m1: { 'm1.1': {}, 'm1.2': {}, 'm1.3': {}, 'm1.4': {}, 'm1.5': {} },
    'jp-annex': {}, m2: {}, m3: {}, m4: {}, m5: {}
  }
};

// Region-specific rule hints
const REGION_HINTS: Record<string, string[]> = {
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

type Doc = { id: number; title: string; module: string; qc_json?: { status: string; timestamp?: string; region?: string } };
type Node = NodeModel<Doc>;

export default function SubmissionBuilder({ initialRegion = 'FDA' }: { initialRegion?: string }) {
  const [region, setRegion] = useState(initialRegion);
  const [tree, setTree] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Initial load of documents
  useEffect(() => { 
    buildTree();
  }, [region]);

  // Handle WebSocket messages from QC service
  const handleQCMessage = useCallback((data: any) => {
    console.log(`[QC] Received update for region ${region}:`, data);
    
    // Handle QC status updates
    if (data && data.id && data.status) {
      // Show a toast notification
      toast(
        data.status === 'passed' 
          ? `QC passed for document ${data.id}` 
          : `QC failed for document ${data.id}`, 
        {
          type: data.status === 'passed' ? 'success' : 'error',
          position: "top-right",
          autoClose: 3000
        }
      );
      
      // Update the tree with new QC status
      setTree(prevTree => 
        prevTree.map(node => 
          node.id === data.id 
            ? { 
                ...node, 
                data: { 
                  ...node.data, 
                  qc_json: { 
                    status: data.status,
                    timestamp: new Date().toISOString(),
                    region: region
                  } 
                } 
              } 
            : node
        )
      );
    }
  }, [region]);

  // Set up the region-aware WebSocket connection
  const { send } = useQCWebSocket(region, handleQCMessage);

  async function buildTree() {
    setLoading(true);
    try {
      const docs: Doc[] = await fetchJson('/api/documents?status=approved_or_qc_failed');
      let idCounter = 0;
      const makeId = () => --idCounter;

      const nodes: Node[] = [{ id: 0, parent: 0, droppable: true, text: 'root' }];
      const folderMap: Record<string, number> = {};
      
      const addFolder = (name: string, parent: number) => {
        if (folderMap[name]) return folderMap[name];
        const id = makeId();
        folderMap[name] = id;
        nodes.push({ id, parent, droppable: true, text: name });
        return id;
      };
      
      const buildFolders = (obj: any, parent: number) => {
        Object.keys(obj).forEach(key => {
          const id = addFolder(key, parent);
          buildFolders(obj[key], id);
        });
      };
      
      buildFolders(REGION_TREE[region], 0);

      docs.forEach(d => {
        const folderId = folderMap[closestFolder(d.module)] || folderMap['m1'];
        nodes.push({ id: d.id, parent: folderId, droppable: false, text: d.title, data: d });
      });
      
      setTree(nodes);
      setSelected(new Set());
      toast.info(`Loaded documents for ${region} region`);
    } catch (error) {
      console.error('Error building tree:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }

  const closestFolder = (mod: string) => {
    // exact or startsWith match
    const allKeys = Object.keys(REGION_TREE[region]).concat(
      ...Object.keys(REGION_TREE[region].m1 || {})
    );
    return allKeys.find(k => mod === k || mod?.startsWith(k)) || mod?.split('.')[0] || 'm1';
  };

  const handleDrop = (nt: Node[]) => setTree(nt);

  const saveOrder = async () => {
    try {
      const ordered = tree.filter(n => !n.droppable && n.parent !== 0).map((n, idx) => ({
        id: n.id,
        module: folderName(n.parent),
        order: idx
      }));
      
      await fetch('/api/documents/builder-order', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ docs: ordered })
      });
      
      toast.success('Order saved');
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Failed to save order');
    }
  };

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const bulkApprove = async () => {
    try {
      await fetch('/api/documents/bulk-approve', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ ids: Array.from(selected) }) 
      });
      
      toast.info('Bulk approval/QC started');
      setSelected(new Set());
    } catch (error) {
      console.error('Error bulk approving:', error);
      toast.error('Failed to start bulk approval');
    }
  };

  const folderName = (id: number) => tree.find(n => n.id === id)?.text || 'm1';

  const renderNode = (node: Node, { depth }: any) => {
    if (node.droppable) return (
      <div style={{ marginLeft: depth * 12 }} className="py-1"><strong>{node.text}</strong></div>
    );
    
    const qc = node.data?.qc_json?.status;
    const isSelected = selected.has(node.id as number);
    
    return (
      <div style={{ marginLeft: depth * 12 }} className="d-flex align-items-center gap-2 py-1">
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={() => toggleSelect(node.id as number)} 
        />
        {qc === 'passed' ? 
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
            {Object.keys(REGION_TREE).map(r => (
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
        <AlertCircle size={16} className="mt-1"/>
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
        <button 
          className="btn btn-outline-success" 
          disabled={!selected.size} 
          onClick={bulkApprove}
        >
          Bulk Approve + QC {selected.size > 0 && `(${selected.size})`}
        </button>
      </div>
    </div>
  );
}

async function fetchJson(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('fetch failed');
  return r.json();
}