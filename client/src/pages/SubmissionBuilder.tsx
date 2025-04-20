// SubmissionBuilder.tsx – region‑aware validation & live hints
import React, { useEffect, useState, useRef } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { Tree, NodeModel } from '@minoru/react-dnd-treeview';
import update from 'immutability-helper';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@minoru/react-dnd-treeview/dist/react-dnd-treeview.css';

const backend = HTML5Backend;

// Region-specific folder structures and validation rules
const REGIONS: Record<string, { folders: string[]; rules: Record<string,string[]> }> = {
  FDA: { 
    folders: ['m1','m2','m3','m4','m5'], 
    rules: { 
      m1: ['cover', 'form-1571', 'form-3674'] 
    } 
  },
  EMA: { 
    folders: ['m1','m2','m3','m4','m5'], 
    rules: { 
      m1: ['cover', 'appform', 'authorization'] 
    } 
  },
  PMDA: { 
    folders: ['m1','m2','m3','m4','m5','jp‑annex'], 
    rules: { 
      'm1': ['application-form', 'risk-management-plan'],
      'jp‑annex': ['quality', 'nonclinical', 'translations'] 
    } 
  },
};

// Region-specific required documents (used for checking completeness)
const REGION_REQUIREMENTS: Record<string, Record<string, string[]>> = {
  FDA: {
    m1: ['form-1571', 'form-3674', 'cover-letter'],
  },
  EMA: {
    m1: ['eu-application-form', 'letter-of-authorization', 'product-information'],
  },
  PMDA: {
    m1: ['application-form', 'risk-management-plan'],
    'jp‑annex': ['jp-data-translations'],
  },
};

// Region-specific hints to display to users
const REGION_HINTS = {
  FDA: [
    '✓ Form 1571 must be in m1.2/form-1571 folder',
    '✓ Form 3674 (clinicaltrials.gov) required in m1.2/form-3674 folder',
    '✓ Cover letter must be in m1.1/cover-letter and PDF < 10 MB',
    '✓ Clinical study reports should be placed in m5.3/clinical-study-reports',
    '✓ Follows FDA eCTD 3.2.2 validation rules',
  ],
  EMA: [
    '✓ EU Application Form PDF required in application-form/eu-application-form folder',
    '✓ Letter of Authorization must be in m1.2/application-form',
    '✓ Active Substance Master File should be in m1/asmf folder',
    '✓ Product Information Annexes I-III must be in m1.3/product-information',
    '✓ Follows EU eCTD 3.2.2 technical validation criteria',
  ],
  PMDA: [
    '✓ JP Annex PDF must be placed in jp-annex folder',
    '✓ Japanese translations required in jp-annex/jp-data/translations',
    '✓ Application form must be in m1.1/application-form',
    '✓ Risk Management Plan required in m1.5/risk-management-plan',
    '✓ Follows JP eCTD 1.0 technical validation requirements',
  ],
};

type Doc = { id: number; title: string; module: string; qc_json?: { status: string } };
interface Node extends NodeModel<Doc> { }

export default function SubmissionBuilder({ region = 'FDA' }: { region?: string }) {
  const [tree, setTree] = useState<Node[]>([]);
  const [invalid, setInvalid] = useState<Set<number>>(new Set());
  const [missingDocs, setMissingDocs] = useState<Record<string, string[]>>({});
  const [wsStatus, setWsStatus] = useState<string>('disconnected');
  const ws = useRef<WebSocket | null>(null);

  // Connect to WebSocket for real-time QC updates
  useEffect(() => {
    const connectWebSocket = () => {
      // Determine WebSocket URL based on current protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/qc`;
      
      try {
        ws.current = new WebSocket(wsUrl);
        
        ws.current.onopen = () => {
          console.log('WebSocket connected');
          setWsStatus('connected');
          toast.success('QC WebSocket connected');
        };
        
        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle QC update
            if (data.type === 'qc') {
              updateDocumentQcStatus(data.document_id, data.status);
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        };
        
        ws.current.onclose = () => {
          console.log('WebSocket disconnected');
          setWsStatus('disconnected');
        };
        
        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setWsStatus('error');
        };
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        setWsStatus('error');
      }
    };
    
    connectWebSocket();
    
    // Cleanup WebSocket on component unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Update QC status for a document in the tree
  const updateDocumentQcStatus = (docId: number, status: string) => {
    setTree(currentTree => {
      return currentTree.map(node => {
        if (node.id === docId && node.data) {
          return {
            ...node,
            data: {
              ...node.data,
              qc_json: { ...node.data.qc_json, status }
            }
          };
        }
        return node;
      });
    });
    
    // Show toast notification for the update
    toast.info(`Document #${docId} QC status updated: ${status}`);
  };

  // Initialize tree data on component mount or region change
  useEffect(() => {
    (async () => {
      const docs: Doc[] = await fetchJson('/api/documents?status=approved_or_qc_failed');
      const folders = REGIONS[region].folders.map((f, idx) => ({ id: 10_000+idx, parent:0, text:f, droppable:true }));
      const nodes: Node[] = [ {id:0, parent:0, text:'root', droppable:true}, ...folders];
      
      docs.forEach(d => {
        const folderId = folders.find(f => d.module.startsWith(f.text))?.id || folders[0].id;
        nodes.push({ id:d.id, parent:folderId, text:d.title, droppable:false, data:d });
      });
      
      setTree(nodes);
      validate(nodes);
      checkMissingDocs(nodes, region);
    })();
  }, [region]);

  // Validate the tree based on region-specific rules
  const validate = (nodes: Node[]) => {
    const bad = new Set<number>();
    const rules = REGIONS[region].rules;
    
    nodes.filter(n => !n.droppable && n.parent !== 0).forEach(n => {
      const parentNode = nodes.find(p => p.id === n.parent);
      if (!parentNode) return;
      
      const parentName = parentNode.text;
      if (rules[parentName]) {
        const allowed = rules[parentName];
        if (!allowed.some(a => n.data?.module.includes(a))) {
          bad.add(n.id);
        }
      }
    });
    
    setInvalid(bad);
  };

  // Check for missing required documents based on region requirements
  const checkMissingDocs = (nodes: Node[], currentRegion: string) => {
    const requirements = REGION_REQUIREMENTS[currentRegion];
    const missing: Record<string, string[]> = {};
    
    Object.entries(requirements).forEach(([folder, requiredDocs]) => {
      const folderNode = nodes.find(n => n.droppable && n.text === folder);
      if (!folderNode) return;
      
      const folderDocs = nodes.filter(n => n.parent === folderNode.id && !n.droppable);
      const missingInFolder = requiredDocs.filter(req => 
        !folderDocs.some(doc => doc.data?.module.includes(req))
      );
      
      if (missingInFolder.length > 0) {
        missing[folder] = missingInFolder;
      }
    });
    
    setMissingDocs(missing);
  };

  // Handle node drop during drag and drop
  const onDrop = (nt: Node[]) => { 
    setTree(nt); 
    validate(nt);
    checkMissingDocs(nt, region);
  };

  // Node render function for the tree
  const render = (node: Node, { depth, isOpen, onToggle }: any) => {
    // Render folder node
    if (node.droppable) {
      const folderMissing = missingDocs[node.text] || [];
      
      return (
        <div style={{marginLeft: depth*16}} className="fw-bold py-1">
          <button className="btn btn-sm btn-link p-0" onClick={onToggle}>
            {isOpen ? '▾' : '▸'}
          </button>
          {node.text}
          
          {folderMissing.length > 0 && (
            <span className="badge bg-danger ms-2" title={`Missing: ${folderMissing.join(', ')}`}>
              ⚠ Missing {folderMissing.length}
            </span>
          )}
        </div>
      );
    }
    
    // Render document node
    const qcStatus = node.data?.qc_json?.status;
    const invalidFlag = invalid.has(node.id);
    
    return (
      <div style={{marginLeft: depth*16}} className={`d-flex align-items-center gap-2 py-1 ${invalidFlag ? 'text-danger' : ''}`}> 
        {qcStatus === 'passed' ? 
          <CheckCircle size={14} className="text-success"/> : 
          <XCircle size={14} className="text-danger"/>
        }
        {invalidFlag && 
          <AlertTriangle size={14} className="text-warning" title="Invalid slot for region"/>
        }
        <span>{node.text}</span>
      </div>
    );
  };

  // Save the current tree structure
  const save = async () => {
    if (invalid.size) { 
      toast.error('Fix invalid placements first'); 
      return; 
    }
    
    const docs = tree
      .filter(n => !n.droppable && n.parent !== 0)
      .map((n, i) => ({
        id: n.id,
        module: tree.find(f => f.id === n.parent)!.text,
        order: i
      }));
    
    await fetch('/api/documents/builder-order', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({docs})
    });
    
    toast.success('Order saved');
  };

  // Get badge class for WebSocket status indicator
  const getStatusBadgeClass = () => {
    switch (wsStatus) {
      case 'connected': return 'bg-success';
      case 'connecting': 
      case 'reconnecting': return 'bg-warning';
      case 'error':
      case 'disconnected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  // Get status message for WebSocket indicator
  const getStatusMessage = () => {
    switch (wsStatus) {
      case 'connected': return 'QC: Connected';
      case 'connecting': return 'QC: Connecting...';
      case 'reconnecting': return 'QC: Reconnecting...';
      case 'error': return 'QC: Error';
      case 'disconnected': return 'QC: Disconnected';
      default: return 'QC: Unknown';
    }
  };

  // Loading state
  if (tree.length === 0) return <div className="text-center mt-4">Loading...</div>;

  return (
    <div className="container py-4">
      {/* ToastContainer for notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Header with WebSocket status */}
      <div className="mb-4">
        <div className="d-flex align-items-center">
          <h2 className="mb-0 me-4">
            Submission Builder <span className="badge bg-secondary ms-1">{region}</span>
          </h2>
          
          {/* WebSocket connection status indicator */}
          <div className="d-flex align-items-center me-3">
            <span 
              className={`badge ${getStatusBadgeClass()} d-flex align-items-center gap-1`}
              title={`QC WebSocket status: ${wsStatus}`}
            >
              <span 
                className="spinner-grow spinner-grow-sm" 
                role="status" 
                aria-hidden="true" 
                style={{ 
                  display: wsStatus === 'connecting' || wsStatus === 'reconnecting' ? 'inline-block' : 'none' 
                }}
              ></span>
              {getStatusMessage()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Validation warnings */}
      {invalid.size > 0 && (
        <div className="alert alert-warning py-1">
          {invalid.size} document(s) in invalid slots for {region}
        </div>
      )}
      
      {/* Missing documents warnings */}
      {Object.keys(missingDocs).length > 0 && (
        <div className="alert alert-danger py-1">
          Missing required documents for {region}:
          <ul className="mb-0 mt-1">
            {Object.entries(missingDocs).map(([folder, docs]) => (
              <li key={folder}>
                <strong>{folder}:</strong> {docs.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Region-specific hints */}
      <div className="alert alert-info py-2 mb-3">
        <div className="fw-bold mb-1">Region Hints: {region}</div>
        <ul className="mb-0 small">
          {REGION_HINTS[region as keyof typeof REGION_HINTS]?.map((hint, idx) => (
            <li key={idx}>{hint}</li>
          ))}
        </ul>
      </div>
      
      {/* Tree component */}
      <DndProvider backend={HTML5Backend}>
        <Tree 
          tree={tree} 
          rootId={0} 
          render={render} 
          onDrop={onDrop}
          classes={{
            root: 'border rounded p-3',
            draggingSource: 'opacity-50',
            dropTarget: 'bg-primary-subtle'
          }}
        />
      </DndProvider>
      
      {/* Save button */}
      <button 
        className="btn btn-primary mt-3"
        onClick={save}
        disabled={invalid.size > 0}
      >
        Save Structure
      </button>
    </div>
  );
}

// Helper function to fetch JSON data
async function fetchJson(u: string) {
  const r = await fetch(u);
  if (!r.ok) throw new Error(`Fetch error: ${r.status}`);
  return r.json();
}