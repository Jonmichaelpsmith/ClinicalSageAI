// SubmissionBuilder.jsx – region‑aware drag‑drop tree with QC badges, bulk approve & region rule hints
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { Tree } from '@minoru/react-dnd-treeview';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import update from 'immutability-helper';
import { useQCWebSocket } from '../hooks/useQCWebSocket';

// Region‑specific folder hierarchy definitions
const REGION_TREE = {
  FDA: { 
    m1: { 
      'm1.1': { 'cover-letter': {} }, 
      'm1.2': { 'form-1571': {}, 'form-3674': {} }, 
      'm1.3': { 'administrative-information': {} },
      'm1.4': { 'references': {} },
      'm1.5': { 'promotional-materials': {} }
    }, 
    m2: { 
      'm2.1': { 'toc': {} },
      'm2.2': { 'introduction': {} },
      'm2.3': { 'quality-summary': {} },
      'm2.4': { 'non-clinical-summary': {} },
      'm2.5': { 'clinical-summary': {} },
      'm2.6': { 'non-clinical-written-summaries': {} },
      'm2.7': { 'clinical-summary': {} }
    }, 
    m3: { 
      'm3.1': { 'toc': {} },
      'm3.2': { 'body-of-data': {} },
      'm3.3': { 'literature-references': {} }
    }, 
    m4: { 
      'm4.1': { 'toc': {} },
      'm4.2': { 'study-reports': {} },
      'm4.3': { 'literature-references': {} }
    }, 
    m5: { 
      'm5.1': { 'toc': {} },
      'm5.2': { 'tabular-listings': {} },
      'm5.3': { 'clinical-study-reports': {} },
      'm5.4': { 'literature-references': {} }
    } 
  },
  EMA: {
    m1: { 
      'm1.0': { 'cover-letter': {} }, 
      'm1.1': { 'leaflets': {} }, 
      'm1.2': { 'application-form': {} }, 
      'm1.3': { 'product-information': {} }, 
      'm1.4': { 'experts': {} }, 
      'm1.5': { 'specific-requirements': {} },
      'asmf': { 'active-substance-master-file': {} }
    },
    m2: { 
      'm2.1': { 'toc': {} },
      'm2.2': { 'introduction': {} },
      'm2.3': { 'quality-summary': {} },
      'm2.4': { 'non-clinical-summary': {} },
      'm2.5': { 'clinical-summary': {} },
      'm2.6': { 'non-clinical-written-summaries': {} },
      'm2.7': { 'clinical-summary': {} }
    },
    m3: { 
      'm3.1': { 'toc': {} },
      'm3.2': { 'body-of-data': {} },
      'm3.3': { 'literature-references': {} }
    },
    m4: { 
      'm4.1': { 'toc': {} },
      'm4.2': { 'study-reports': {} },
      'm4.3': { 'literature-references': {} }
    },
    m5: { 
      'm5.1': { 'toc': {} },
      'm5.2': { 'tabular-listings': {} },
      'm5.3': { 'clinical-study-reports': {} },
      'm5.4': { 'literature-references': {} }
    },
    'application-form': { 'eu-application-form': {} }
  },
  PMDA: {
    m1: { 
      'm1.1': { 'application-form': {} }, 
      'm1.2': { 'approval-certificates': {} }, 
      'm1.3': { 'labeling': {} }, 
      'm1.4': { 'outline-of-data': {} },
      'm1.5': { 'risk-management-plan': {} }
    },
    m2: { 
      'm2.1': { 'toc': {} },
      'm2.2': { 'introduction': {} },
      'm2.3': { 'quality-summary': {} },
      'm2.4': { 'non-clinical-summary': {} },
      'm2.5': { 'clinical-summary': {} },
      'm2.6': { 'non-clinical-written-summaries': {} },
      'm2.7': { 'clinical-summary': {} }
    },
    m3: { 
      'm3.1': { 'toc': {} },
      'm3.2': { 'body-of-data': {} },
      'm3.3': { 'literature-references': {} }
    },
    m4: { 
      'm4.1': { 'toc': {} },
      'm4.2': { 'study-reports': {} },
      'm4.3': { 'literature-references': {} }
    },
    m5: { 
      'm5.1': { 'toc': {} },
      'm5.2': { 'tabular-listings': {} },
      'm5.3': { 'clinical-study-reports': {} },
      'm5.4': { 'literature-references': {} }
    },
    'jp-annex': { 
      'jp-a1': { 'jp-specific-data': {} },
      'jp-a2': { 'jp-validation-data': {} },
      'jp-data': { 'translations': {} }
    }
  }
};

// For backward compatibility
const REGION_FOLDERS = {
  FDA: ['m1', 'm2', 'm3', 'm4', 'm5'],
  EMA: ['m1', 'm2', 'm3', 'm4', 'm5', 'application-form'],
  PMDA: ['m1', 'm2', 'm3', 'm4', 'm5', 'jp-annex'],
};

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

export default function SubmissionBuilder({ initialRegion = 'FDA', region: propRegion }) {
  // Use either the passed region prop or fall back to initialRegion
  const [region, setRegion] = useState(propRegion || initialRegion);
  const [tree, setTree] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);

  // Load documents and setup WebSocket connection
  useEffect(() => {
    loadDocs();
    
    // Create direct WebSocket connection to get real-time QC updates
    const sock = new WebSocket(
      `${location.origin.replace('http', 'ws')}/ws/qc`
    );
    
    sock.onopen = () => {
      console.log(`Direct WebSocket connected for region ${region}`);
      
      // Register with region for filtered updates
      sock.send(JSON.stringify({
        action: 'subscribe',
        region: region
      }));
    };
    
    sock.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        
        // Handle ping messages
        if (msg.type === 'ping') {
          sock.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          return;
        }
        
        console.log('Direct WebSocket message:', msg);
        
        // Only update the tree if we have an ID and status
        if (msg.id || msg.document_id) {
          const docId = msg.id || msg.document_id;
          const status = msg.status || (msg.result === 'passed' ? 'passed' : 'failed');
          
          // Update the tree with the new QC status
          setTree(prev =>
            prev.map(n =>
              n.id === docId
                ? { 
                    ...n, 
                    data: { 
                      ...n.data, 
                      qc_json: { 
                        status: status,
                        timestamp: new Date().toISOString(),
                        region: region 
                      } 
                    } 
                  }
                : n
            )
          );
          
          // Show a toast notification
          if (status === 'passed') {
            toast.success(`QC passed for document ${docId}`);
          } else {
            toast.error(`QC failed for document ${docId}`);
          }
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    };
    
    sock.onerror = (error) => {
      console.error('Direct WebSocket error:', error);
    };
    
    sock.onclose = (event) => {
      console.log(`Direct WebSocket closed, code: ${event.code}, reason: ${event.reason || 'unknown'}`);
    };
    
    // Clean up the socket on component unmount or region change
    return () => {
      sock.close();
    };
  }, [region]);
  
  // Handle messages from QC WebSocket
  const handleQCWebSocketMessage = (data) => {
    console.log(`[QC] Received update for region ${region}:`, data);
    
    // Handle QC status updates
    if (data && data.id && data.status) {
      // Show a toast notification
      if (data.status === 'passed') {
        toast.success(`QC passed for document ${data.id}`);
      } else {
        toast.error(`QC failed for document ${data.id}`);
      }
      
      // Update the tree nodes with new QC status
      setTree(prevTree => 
        prevTree.map(node => 
          node.id === data.id 
            ? { 
                ...node, 
                data: { 
                  ...node.data, 
                  qc_json: { 
                    ...node.data?.qc_json,
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
  };
  
  // Set up the region-aware WebSocket connection with improved status tracking
  const { send, status: wsStatus } = useQCWebSocket(region, handleQCWebSocketMessage);
  
  // Function to get status badge color
  const getStatusBadgeClass = () => {
    switch(wsStatus) {
      case 'connected':
        return 'bg-success';
      case 'connecting':
        return 'bg-warning';
      case 'reconnecting':
        return 'bg-warning';
      case 'disconnected':
      default:
        return 'bg-danger';
    }
  };
  
  // Function to get status badge text
  const getStatusMessage = () => {
    switch(wsStatus) {
      case 'connected':
        return `Connected to ${region} QC`;
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
      default:
        return 'Disconnected';
    }
  };
  
  // When region changes, report it to the user and show appropriate validation profile
  useEffect(() => {
    // Show notification about region change
    const regionProfiles = {
      'FDA': 'FDA_eCTD_3.2.2',
      'EMA': 'EU_eCTD_3.2.2',
      'PMDA': 'JP_eCTD_1.0'
    };
    
    toast.info(`Switched to ${region} region with ${regionProfiles[region]} validation profile`);
    
    // Send region info to the backend QC service
    if (send) {
      send({
        type: 'SET_REGION',
        region: region,
        profile: regionProfiles[region]
      });
    }
  }, [region, send]);
  
  // Build tree helper function to create folder structure + add documents
  const buildTree = useCallback((docs, selectedRegion) => {
    // Start with root node
    const nodes = [{ id: 0, parent: 0, text: 'root', droppable: true }];
    let idCounter = -1; // For creating unique negative IDs for folders
    const folderMap = {}; // Map folder names to their ids
    
    // Helper functions for building the tree
    const makeId = () => idCounter--;
    
    const addFolder = (name, parent) => {
      if (folderMap[name]) return folderMap[name];
      const id = makeId();
      folderMap[name] = id;
      nodes.push({ id, parent, droppable: true, text: name });
      return id;
    };
    
    // Recursively build the folder structure
    const buildFolders = (obj, parent) => {
      Object.keys(obj).forEach(key => {
        const id = addFolder(key, parent);
        buildFolders(obj[key], id);
      });
    };
    
    // Build the folders based on the region
    buildFolders(REGION_TREE[selectedRegion], 0);
    
    // Helper to find the closest matching folder for a document module
    const closestFolder = (module) => {
      if (!module) return 'm1'; // Default to m1 if no module
      
      // Get all folder keys including subfolders
      const allKeys = Object.keys(REGION_TREE[selectedRegion]).concat(
        ...Object.entries(REGION_TREE[selectedRegion])
          .filter(([k, v]) => k === 'm1' && typeof v === 'object')
          .map(([_, v]) => Object.keys(v))
          .flat()
      );
      
      // Try exact match first
      if (allKeys.includes(module)) return module;
      
      // Then try prefix match
      const prefixMatch = allKeys.find(k => module.startsWith(k));
      if (prefixMatch) return prefixMatch;
      
      // Fall back to the module's main folder (like "m1" from "m1.1")
      const mainFolder = module.split('.')[0];
      if (allKeys.includes(mainFolder)) return mainFolder;
      
      // Last resort: m1
      return 'm1';
    };
    
    // Add documents to the tree under appropriate folders
    docs.forEach(doc => {
      const folderName = closestFolder(doc.module);
      const folderId = folderMap[folderName] || folderMap['m1'];
      nodes.push({ 
        id: doc.id, 
        parent: folderId, 
        text: doc.title, 
        droppable: false, 
        data: doc 
      });
    });
    
    return nodes;
  }, []);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const docs = await fetchJson('/api/documents?status=approved_or_qc_failed');
      
      // Use the buildTree helper to create the tree structure
      const nodes = buildTree(docs, region);
      
      // Update tree state
      setTree(nodes);
      setSelected(new Set());
      
      toast.info(`Loaded documents for ${region} region`);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
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
      toast.success('Order saved');
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Failed to save order');
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
      toast.info('Bulk approval/QC started');
      setSelected(new Set());
    } catch (error) {
      console.error('Error bulk approving:', error);
      toast.error('Failed to start bulk approval');
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
    
    // Render document node with QC status badge
    const qcStatus = node.data?.qc_json?.status;
    const qcRegion = node.data?.qc_json?.region;
    const hasRegionSpecificQC = qcRegion === region;
    
    // Define QC badge rendering based on status and region
    let QcBadge = null;
    
    if (qcStatus === 'passed' && hasRegionSpecificQC) {
      QcBadge = <CheckCircle size={14} className="text-success" />;
    } else if (qcStatus === 'failed' && hasRegionSpecificQC) {
      QcBadge = <XCircle size={14} className="text-danger" />;
    } else if (qcStatus === 'passed') {
      // Passed but for another region - show info icon instead
      QcBadge = <CheckCircle size={14} className="text-secondary" />;
    } else if (qcStatus === 'failed') {
      // Failed but for another region
      QcBadge = <XCircle size={14} className="text-secondary" />;
    } else if (qcStatus === 'in_progress') {
      QcBadge = <AlertTriangle size={14} className="text-warning" />;
    } else {
      // No QC status yet
      QcBadge = <Info size={14} className="text-secondary" />;
    }
    
    return (
      <div style={{ marginLeft: depth * 16 }} className="d-flex align-items-center gap-2 py-1">
        <input 
          type="checkbox" 
          checked={selected.has(node.id)} 
          onChange={() => toggleSelect(node.id)} 
          aria-label={`Select ${node.text}`}
        />
        
        <div className="position-relative" style={{ width: 18, height: 18 }}>
          {QcBadge}
          {qcStatus && !hasRegionSpecificQC && (
            <span 
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary" 
              style={{ fontSize: '0.6rem', padding: '2px 4px', transform: 'translate(-50%, -50%)' }}
              title={`QC from ${qcRegion || 'unknown'} region`}
            >
              {qcRegion || '?'}
            </span>
          )}
        </div>
        
        <span className={qcStatus === 'failed' && hasRegionSpecificQC ? 'text-danger' : ''}>{node.text}</span>
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
          
          {/* WebSocket connection status indicator */}
          <div className="d-flex align-items-center me-3">
            <span 
              className={`badge ${getStatusBadgeClass()} d-flex align-items-center gap-1`}
              title={`QC WebSocket status: ${wsStatus}`}
            >
              <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" 
                style={{ display: wsStatus === 'connecting' || wsStatus === 'reconnecting' ? 'inline-block' : 'none' }}
              ></span>
              {getStatusMessage()}
            </span>
          </div>
          
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
        
        {/* Show status details button */}
        <button 
          className={`btn btn-outline-${wsStatus === 'connected' ? 'info' : 'warning'} ms-auto`} 
          type="button" 
          data-bs-toggle="modal" 
          data-bs-target="#qcStatusModal"
          title="Show QC connection details"
        >
          QC Status
        </button>
      </div>
      
      {/* QC Status Modal */}
      <div className="modal fade" id="qcStatusModal" tabIndex="-1" aria-labelledby="qcStatusModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="qcStatusModalLabel">QC System Status</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="card mb-3">
                <div className="card-header">
                  <strong>WebSocket Connection</strong>
                </div>
                <div className="card-body">
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <th>Status:</th>
                        <td>
                          <span className={`badge ${getStatusBadgeClass()}`}>
                            {wsStatus}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th>Region:</th>
                        <td>{region}</td>
                      </tr>
                      <tr>
                        <th>Validation Profile:</th>
                        <td>
                          {region === 'FDA' && 'FDA_eCTD_3.2.2'}
                          {region === 'EMA' && 'EU_eCTD_3.2.2'}
                          {region === 'PMDA' && 'JP_eCTD_1.0'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="card mb-3">
                <div className="card-header">
                  <strong>Active Regions</strong>
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    {Object.keys(REGION_FOLDERS).map(r => (
                      <span key={r} className={`badge me-2 ${r === region ? 'bg-primary' : 'bg-secondary'}`}>
                        {r}
                      </span>
                    ))}
                  </div>
                  <p className="text-muted small mb-0">
                    The currently selected region will be used for new document validation
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return response.json();
}