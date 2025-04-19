// SubmissionBuilder.tsx – region‑aware tree with EU / JP sub‑folders
// Adds automatic Module 1 sub‑structure when region is EMA (EU) or PMDA (JP)
import React, { useEffect, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { Tree, NodeModel } from '@minoru/react-dnd-treeview';
import update from 'immutability-helper';
import { CheckCircle, XCircle } from 'lucide-react';
import SubmissionBuilderWebSocket from '../components/SubmissionBuilderWebSocket';

export type Doc = { id: number; title: string; module: string; qc_json?: { status: string } };
export type Node = NodeModel<Doc>;

const MODULE_MAP: Record<string, string[]> = {
  FDA: ['m1', 'm2', 'm3', 'm4', 'm5'],
  EMA: ['m1', 'm1\u00a0admin', 'm1\u00a0cover', 'm2', 'm3', 'm4', 'm5'],
  PMDA: ['m1', 'm1-annex', 'm2', 'm3', 'm4', 'm5', 'jp-annex'],
};

export default function SubmissionBuilder({ region = 'FDA' }: { region?: 'FDA'|'EMA'|'PMDA' }) {
  const [tree, setTree] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [qcInProgress, setQcInProgress] = useState(false);

  useEffect(() => {
    buildTree();
  }, [region]);

  const buildTree = async () => {
    setLoading(true);
    const docs: Doc[] = await fetchJson('/api/documents?status=approved_or_qc_failed');
    const root: Node = { id: 0, parent: 0, text: 'root', droppable: true };
    // Create hierarchical folders based on MODULE_MAP
    let idCounter = 10_000;
    const folderNodes: Node[] = MODULE_MAP[region].map(label => {
      const depth = label.includes(' ') || label.includes('-') ? 2 : 1; // crude depth based on naming
      const parentId = depth === 1 ? 0 : 10_000 + MODULE_MAP[region].findIndex(l => l === label.split(/\s|-/)[0]);
      return { id: ++idCounter, parent: parentId, text: label, droppable: true };
    });
    const itemNodes: Node[] = docs.map(d => {
      const parentFolder = folderNodes.find(f => d.module.startsWith(f.text.split(' ')[0]));
      return {
        id: d.id,
        parent: parentFolder ? parentFolder.id : 0,
        text: d.title,
        droppable: false,
        data: d,
      } as Node;
    });
    setTree([root, ...folderNodes, ...itemNodes]);
    setLoading(false);
  };

  const updateNodeQC = (updateMsg: { documentId: number; status: string; type?: string }) => {
    // Make sure it's a QC status message
    if (updateMsg.type && updateMsg.type !== 'qc_status') return;
    
    // Find the node in the tree
    const docId = updateMsg.documentId;
    const status = updateMsg.status === 'passed' ? 'passed' : 'failed';
    
    const nodeIndex = tree.findIndex(node => node.id === docId);
    if (nodeIndex === -1) {
      console.warn(`Document #${docId} not found in tree for QC update`);
      return;
    }

    // Create a new node with updated QC status
    const updatedNode = {
      ...tree[nodeIndex],
      data: {
        ...tree[nodeIndex].data!,
        qc_json: { status }
      }
    };

    // Update the tree with the new node
    setTree(prevTree => {
      // Using immutability-helper update function
      const newTree = update(prevTree, {
        [nodeIndex]: { $set: updatedNode }
      });
      return newTree;
    });

    console.log(`Document #${docId} QC status updated: ${status}`);
    
    // Show notification to user
    alert(`Document #${docId} QC ${status}`);
  };

  const renderNode = (node: Node, { depth, isOpen, onToggle }: any) => {
    const style = { marginLeft: depth * 16 };
    if (node.droppable) {
      return (
        <div style={style} className="d-flex align-items-center">
          <button onClick={onToggle} className="btn btn-sm btn-link p-0">{isOpen ? '▾' : '▸'}</button>
          <strong>{node.text}</strong>
        </div>
      );
    }
    const qc = node.data?.qc_json?.status === 'passed';
    return (
      <div style={style} className="d-flex align-items-center gap-2 py-1">
        {qc ? <CheckCircle size={14} className="text-success"/> : <XCircle size={14} className="text-danger"/>}
        <span>{node.text}</span>
      </div>
    );
  };

  const onDrop = (newTree: Node[]) => setTree(newTree);

  const saveOrder = async () => {
    const orderedDocs = tree.filter(n => !n.droppable && n.parent !== 0).map((n, idx) => {
      const folder = tree.find(f => f.id === n.parent)!;
      return { id: n.id, module: folder.text.split('\u00a0')[0], order: idx };
    });
    await fetch('/api/documents/builder-order', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docs: orderedDocs })
    });
    console.log('Order saved successfully');
    alert('Order saved successfully');
  };

  const bulkApprove = async () => {
    // Get all document nodes
    const docNodes = tree.filter(n => !n.droppable && n.parent !== 0);
    const docIds = docNodes.map(n => n.id);
    
    if (docIds.length === 0) {
      console.warn('No documents to approve');
      alert('No documents to approve');
      return;
    }

    setQcInProgress(true);
    
    try {
      console.log(`Starting bulk approval for ${docIds.length} documents...`);
      
      // Call the bulk approve endpoint
      const response = await fetch('/api/documents/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: docIds })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Show summary alert
      console.log('Bulk approval initiated:', result);
      alert(`Bulk approval initiated for ${docIds.length} documents. Status updates will appear in real-time.`);
      
      // Individual status updates will come through the WebSocket
      // No need to set qcInProgress to false as the updates are asynchronous
      
    } catch (error: any) {
      console.error('Bulk approve error:', error);
      alert(`Bulk approval failed: ${error.message}`);
      setQcInProgress(false);
    }
  };

  if (loading) return <p className="text-center mt-4">Loading…</p>;

  return (
    <div className="container py-4">
      <h3 className="d-flex align-items-center justify-content-between">
        <div>
          Submission Builder <span className="badge bg-secondary ms-2">{region}</span>
        </div>
        <div className="badge bg-success">QC Updates Connected</div>
      </h3>
      <div className="alert alert-info mb-3">
        <strong>Region-aware</strong>: The folder structure adapts to the selected regulatory region. 
        Drag documents to appropriate modules.
      </div>
      <DndProvider backend={HTML5Backend}>
        <Tree
          tree={tree}
          rootId={0}
          render={renderNode}
          onDrop={onDrop}
        />
      </DndProvider>
      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-primary" onClick={saveOrder} disabled={qcInProgress}>
          Save Order
        </button>
        <button className="btn btn-success" onClick={bulkApprove} disabled={qcInProgress}>
          {qcInProgress ? 'Processing...' : 'Bulk Approve + QC'}
        </button>
      </div>
      
      {/* WebSocket for real-time QC updates */}
      <SubmissionBuilderWebSocket 
        onQcUpdate={updateNodeQC}
        region={region}
      />
    </div>
  );
}

async function fetchJson(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('fetch failed');
  return r.json();
}