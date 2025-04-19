// SubmissionBuilder.tsx – region rule hints + live QC WebSocket updates
import React, { useEffect, useState, useRef } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { Tree, NodeModel } from '@minoru/react-dnd-treeview';
import update from 'immutability-helper';
import { CheckCircle, XCircle, Info, FileText, History } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DocumentDiffDialog from '../components/DocumentDiffDialog';

interface Doc { id: number; title: string; module: string; qc_json?: { status: string } }
interface Node extends NodeModel<Doc> {}

// Folder + required leaf templates
const REGION_FOLDERS: Record<string, string[]> = {
  FDA: ['m1', 'm2', 'm3', 'm4', 'm5'],
  EMA: ['m1', 'm2', 'm3', 'm4', 'm5'],
  PMDA: ['m1', 'm2', 'm3', 'm4', 'm5', 'jp‑annex']
};

// Region‑specific required docs (code → title placeholder)
const REGION_TEMPLATE: Record<string, { module: string; title: string }[]> = {
  FDA: [
    { module: 'm1.1', title: 'Form FDA 1571' },
    { module: 'm1.3', title: 'Investigator Brochure' },
    { module: 'm1.3.2', title: '1572 Investigator Statement' }
  ],
  EMA: [
    { module: 'm1.2', title: 'Application Form 1' },
    { module: 'm1.3', title: 'Product Information' }
  ],
  PMDA: [
    { module: 'm1.1', title: 'JP Application Form' },
    { module: 'jp‑annex.1', title: 'GMP Annex 1' }
  ]
};

const REGION_RULE_HINT: Record<string, string> = {
  EMA: 'Tip: Include EU Application Form in m1 → 1.2',
  PMDA: 'Tip: Attach Investigators Brochure to jp‑annex folder',
};

export default function SubmissionBuilder({ region = 'FDA' }: { region?: string }) {
  const [tree, setTree] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  
  // Document diff dialog state
  const [isDiffDialogOpen, setIsDiffDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState<string | null>(null);

  // -------- fetch initial docs
  useEffect(() => {
    (async () => {
      const docs: Doc[] = await fetchJson('/api/documents?status=approved_or_qc_failed');
      setTree(buildTree(docs));
      setLoading(false);
    })();
  }, [region]);

  // -------- WebSocket for live QC updates with reconnect logic
  useEffect(() => {
    const wsUrl = `${window.location.origin.replace('http', 'ws')}/ws/qc`;
    let reconnectAttempts = 0;
    let reconnectTimer: NodeJS.Timeout | null = null;
    const maxReconnectDelay = 30000; // Maximum reconnect delay in ms (30 seconds)
    
    // Function to create and setup WebSocket connection
    const connectWebSocket = () => {
      console.log(`Connecting to WebSocket: ${wsUrl}`);
      
      // Clear any existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connection established');
        setWsConnected(true);
        reconnectAttempts = 0; // Reset reconnect counter on successful connection
        
        // Send subscription message if needed
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          client: 'submission-builder'
        }));
      };
      
      wsRef.current.onclose = (event) => {
        // Don't attempt to reconnect if this was a clean close (e.g., component unmounting)
        if (event.wasClean) {
          console.log(`WebSocket closed cleanly, code=${event.code}, reason=${event.reason}`);
          setWsConnected(false);
          return;
        }
        
        console.log('WebSocket connection closed unexpectedly, scheduling reconnect...');
        setWsConnected(false);
        
        // Implement exponential backoff
        reconnectAttempts++;
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttempts), // Exponential backoff: 2, 4, 8, 16... seconds
          maxReconnectDelay // Cap at max delay
        );
        
        console.log(`WebSocket reconnect attempt ${reconnectAttempts} scheduled in ${delay}ms`);
        
        // Schedule reconnect
        reconnectTimer = setTimeout(connectWebSocket, delay);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
        // No need to manually reconnect - onclose will fire after an error
      };
      
      wsRef.current.onmessage = (ev) => {
        try {
          const evt = JSON.parse(ev.data);
          
          if (evt.type === 'heartbeat') {
            // Respond to heartbeat to keep connection alive
            wsRef.current?.send(JSON.stringify({ type: 'heartbeat_ack' }));
            return;
          }
          
          console.log('WebSocket message received:', evt);
          
          if (evt.type === 'qc_status') {
            setTree(prev => prev.map(n => 
              n.id === evt.documentId ? 
              { ...n, data: { ...n.data!, qc_json: { status: evt.status } } } : 
              n
            ));
            
            // Show a toast notification for the QC update
            if (evt.status === 'passed') {
              toast.success(`Document QC passed: ${evt.documentId}`);
            } else if (evt.status === 'failed') {
              toast.error(`Document QC failed: ${evt.documentId}`);
            }
          }
          
          // Handle connection status updates
          if (evt.type === 'connection_status') {
            setWsConnected(evt.status === 'connected');
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
    };
    
    // Initial connection
    connectWebSocket();
    
    // Cleanup function
    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      
      if (wsRef.current) {
        // Set a flag to indicate this is a clean close
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, []);

  const buildTree = (docs: Doc[]): Node[] => {
    const root: Node = { id: 0, parent: 0, text: 'root', droppable: true };
    const folders = REGION_FOLDERS[region].map((mod, i) => ({ id: 10000 + i, parent: 0, text: mod, droppable: true }));
    
    // Include template placeholders for missing required documents
    const existingMods = new Set(docs.map(d => d.module));
    const templateNodes = REGION_TEMPLATE[region]
      .filter(t => !existingMods.has(t.module))
      .map((t, i) => ({
        id: 20000 + i,
        parent: folders.find(f => t.module.startsWith(f.text))?.id || folders[0].id,
        text: t.title + ' (required)',
        droppable: false,
        data: { id: -1, title: t.title, module: t.module, qc_json: { status: 'failed' } }
      }));

    const items = docs.map(d => ({
      id: d.id,
      parent: folders.find(f => d.module.startsWith(f.text))?.id || folders[0].id,
      text: d.title,
      droppable: false,
      data: d,
    }));

    return [root, ...folders, ...templateNodes, ...items];
  };

  const handleDrop = (newTree: Node[]) => setTree(newTree);
  
  const toggleSelect = (id: number) => {
    if (id < 0) {
      // Don't allow selecting placeholder items
      toast.warning('Cannot select placeholder items. Please upload the actual document first.');
      return;
    }
    
    setSelected(prev => new Set(prev.has(id) ? 
      [...prev].filter(x => x !== id) : 
      [...prev, id]
    ));
  };

  const bulkApprove = async () => {
    if (selected.size === 0) {
      toast.warning('Please select at least one document to approve');
      return;
    }
    
    try {
      await fetch('/api/documents/bulk-approve', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) })
      });
      
      toast.info(`Queued QC for ${selected.size} document(s)`);
      setSelected(new Set());
    } catch (error) {
      console.error('Error during bulk approve:', error);
      toast.error('Failed to queue documents for approval');
    }
  };

  const saveOrder = async () => {
    // Filter out placeholder items (id < 0)
    const validNodes = tree.filter(n => !n.droppable && n.parent !== 0 && (n.id as number) > 0);
    
    if (validNodes.length === 0) {
      toast.warning('No valid documents to save order');
      return;
    }
    
    const docsPayload = validNodes.map((n, i) => ({
      id: n.id,
      module: tree.find(f => f.id === n.parent)!.text,
      order: i
    }));
    
    try {
      await fetch('/api/documents/builder-order', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ docs: docsPayload }) 
      });
      
      toast.success('Order saved successfully');
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Failed to save document order');
    }
  };

  // Handle opening the document diff viewer
  const openDiffViewer = (documentId: number, documentTitle: string) => {
    setSelectedDocumentId(documentId);
    setSelectedDocumentTitle(documentTitle);
    setIsDiffDialogOpen(true);
  };

  // Handle closing the document diff viewer
  const closeDiffViewer = () => {
    setIsDiffDialogOpen(false);
    setSelectedDocumentId(null);
    setSelectedDocumentTitle(null);
  };
  
  const renderNode = (node: Node, { depth, isOpen, onToggle }: any) => {
    if (node.droppable) {
      return (
        <div style={{ marginLeft: depth * 16 }} className="py-1 d-flex align-items-center gap-1">
          <button onClick={onToggle} className="btn btn-sm btn-link p-0">{isOpen ? '▾' : '▸'}</button>
          <strong>{node.text}</strong>
        </div>
      );
    }
    
    const qcStatus = node.data?.qc_json?.status;
    const isPlaceholder = (node.id as number) < 0;
    
    return (
      <div style={{ marginLeft: depth * 16 }} className={`py-1 d-flex align-items-center gap-2 ${isPlaceholder ? 'text-muted fst-italic' : ''}`}>
        <input 
          type="checkbox" 
          checked={selected.has(node.id as number)} 
          onChange={() => toggleSelect(node.id as number)} 
          disabled={isPlaceholder}
        />
        
        {qcStatus === 'passed' ? 
          <CheckCircle size={14} className="text-success"/> : 
          <XCircle size={14} className={`text-${isPlaceholder ? 'warning' : 'danger'}`}/>
        }
        
        <span>{node.text}</span>
        
        {!isPlaceholder && (
          <div className="ms-auto">
            <button 
              className="btn btn-sm btn-outline-secondary"
              title="View Version History"
              onClick={() => openDiffViewer(node.id as number, node.text as string)}
            >
              <History size={14} />
            </button>
            
            <a 
              href={`/api/documents/${node.id}/view`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-primary ms-1"
              title="View Document"
            >
              <FileText size={14} />
            </a>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <p className="text-center mt-4">Loading documents...</p>;

  return (
    <div className="container py-4">
      <h2>
        Submission Builder 
        <span className="badge bg-secondary ms-1">{region}</span>
        {wsConnected && <span className="badge bg-success ms-2">QC Connected</span>}
        {!wsConnected && <span className="badge bg-danger ms-2">QC Disconnected</span>}
      </h2>
      
      {REGION_RULE_HINT[region] && (
        <div className="alert alert-info py-1 d-flex gap-2 align-items-center">
          <Info size={16}/> {REGION_RULE_HINT[region]}
        </div>
      )}
      
      <div className="mb-3">
        <div className="alert alert-secondary py-2">
          <strong>Region Requirements:</strong> This view shows required documents for {region} submissions.
          <div className="small mt-1">
            <span className="badge bg-warning me-1">Yellow</span> items are placeholders for required documents.
            Please upload or assign these documents before saving the submission.
          </div>
        </div>
      </div>
      
      <DndProvider backend={HTML5Backend}>
        <Tree rootId={0} tree={tree} onDrop={handleDrop} render={renderNode} />
      </DndProvider>

      <div className="d-flex gap-3 mt-3">
        <button className="btn btn-primary" onClick={saveOrder}>Save Order</button>
        <button 
          className="btn btn-outline-success" 
          disabled={selected.size === 0} 
          onClick={bulkApprove}
        >
          Bulk Approve + QC ({selected.size})
        </button>
      </div>

      {/* Document Diff Dialog */}
      {selectedDocumentId && (
        <DocumentDiffDialog
          documentId={selectedDocumentId}
          isOpen={isDiffDialogOpen}
          onClose={closeDiffViewer}
          documentTitle={selectedDocumentTitle || ''}
        />
      )}
    </div>
  );
}

async function fetchJson(url: string) {
  const r = await fetch(url); 
  if (!r.ok) throw new Error(`Fetch failed: ${r.status} ${r.statusText}`); 
  return r.json();
}