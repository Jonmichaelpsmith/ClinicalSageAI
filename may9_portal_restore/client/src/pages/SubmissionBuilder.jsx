// SubmissionBuilder.jsx – simplified version without drag-drop tree
import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
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

  // Handle messages from QC WebSocket
  const handleQCMessage = useCallback((data) => {
    console.log(`[QC] Received update for region ${region}:`, data);
    
    // Handle QC status updates
    if (data && data.id && data.status) {
      // Show a toast notification
      if (data.status === 'passed') {
        console.log(`QC passed for document ${data.id}`);
      } else {
        console.error(`QC failed for document ${data.id}`);
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
  }, [region]);
  
  // Set up the region-aware WebSocket connection
  const { send, status: wsStatus } = useQCWebSocket(region, handleQCMessage);
  
  // When region changes, report it to the user and show appropriate validation profile
  useEffect(() => {
    // Show notification about region change
    const regionProfiles = {
      'FDA': 'FDA_eCTD_3.2.2',
      'EMA': 'EU_eCTD_3.2.2',
      'PMDA': 'JP_eCTD_1.0'
    };
    
    console.log(`Switched to ${region} region with ${regionProfiles[region]} validation profile`);
    
    // Send region info to the backend QC service
    if (send) {
      send({
        type: 'SET_REGION',
        region: region,
        profile: regionProfiles[region]
      });
    }
  }, [region, send]);

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
    
    buildFolders(REGION_TREE[selectedRegion], 0);
    
    // Add documents to the tree
    docs.forEach(doc => {
      // Place document in closest matching folder
      const moduleParts = doc.module.split('.');
      let currentFolder = 0;
      
      // Try to match deepest folder possible
      for (let i = 0; i < moduleParts.length; i++) {
        const folderName = moduleParts.slice(0, i + 1).join('.');
        if (folderMap[folderName]) {
          currentFolder = folderMap[folderName];
        }
      }
      
      // If no match found, use first segment (m1, m2, etc)
      if (currentFolder === 0 && moduleParts.length > 0) {
        currentFolder = folderMap[moduleParts[0]] || 0;
      }
      
      nodes.push({
        id: doc.id,
        parent: currentFolder,
        text: doc.title,
        droppable: false,
        data: doc
      });
    });
    
    return nodes;
  }, []);

  // Load documents and build tree
  useEffect(() => {
    async function loadDocs() {
      setLoading(true);
      try {
        const response = await fetch('/api/documents?status=all');
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const docs = await response.json();
        
        // Build region-specific tree with retrieved documents
        const newTree = buildTree(docs, region);
        setTree(newTree);
      } catch (error) {
        console.error('Error loading documents:', error);
        console.error('Failed to load submission documents');
      } finally {
        setLoading(false);
      }
    }
    
    loadDocs();
  }, [region, buildTree]);

  // Handle tree drop (reorganization)
  const handleDrop = (newTree) => {
    setTree(newTree);
  };

  // Save updated tree order
  const saveOrder = async () => {
    // Create ordered document list
    const docs = tree
      .filter(node => !node.droppable && node.id > 0)
      .map((node, idx) => ({
        id: node.id,
        parent: node.parent,
        order: idx
      }));
    
    try {
      const response = await fetch('/api/documents/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documents: docs, region })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      console.log('Document order saved successfully');
    } catch (error) {
      console.error('Error saving order:', error);
      console.error('Failed to save document order');
    }
  };

  // Handle bulk approve action
  const bulkApprove = async () => {
    if (selected.size === 0) {
      console.log('No documents selected for bulk approval');
      return;
    }
    
    const selectedIds = Array.from(selected);
    
    try {
      // Send bulk approve request
      console.log(`Initiating QC checks for ${selectedIds.length} documents...`);
      
      // Use WebSocket for faster QC checks
      if (send) {
        send({
          action: 'trigger_bulk_qc',
          document_ids: selectedIds,
          region: region
        });
      } else {
        // Fall back to HTTP if WebSocket not available
        const response = await fetch('/api/documents/bulk-qc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            document_ids: selectedIds,
            region: region
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const result = await response.json();
        
        // Show summary toast
        console.log(`Completed QC for ${result.total} documents: ${result.passed} passed, ${result.failed} failed`);
      }
    } catch (error) {
      console.error('Error performing bulk QC:', error);
      console.error('Failed to perform bulk QC checks');
    }
  };

  // Handle node select/deselect
  const toggleSelect = (id) => {
    setSelected(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  // Render tree node
  const renderNode = ({ node, depth }) => {
    const isSelected = selected.has(node.id);
    
    // Render folder nodes
    if (node.droppable) {
      if (node.id === 0) return null; // Don't render root
      
      return (
        <div style={{ marginLeft: depth * 16 }} className="py-2">
          <strong>{node.text}</strong>
        </div>
      );
    }
    
    // Render document nodes with QC badge
    const qcStatus = node.data?.qc_json?.status;
    
    return (
      <div 
        style={{ marginLeft: depth * 16 }} 
        className={`py-1 px-2 d-flex align-items-center rounded ${isSelected ? 'bg-light' : ''}`}
        onClick={() => toggleSelect(node.id)}
      >
        <div className="form-check me-2">
          <input 
            type="checkbox" 
            className="form-check-input" 
            checked={isSelected}
            onChange={() => {}}
            id={`check-${node.id}`}
          />
        </div>
        
        {qcStatus === 'passed' ? (
          <CheckCircle size={16} className="text-success me-2" />
        ) : qcStatus === 'failed' ? (
          <XCircle size={16} className="text-danger me-2" />
        ) : (
          <AlertTriangle size={16} className="text-warning me-2" />
        )}
        
        <span>{node.text}</span>
      </div>
    );
  };

  if (loading) return <div className="text-center mt-4">Loading...</div>;

  return (
    <div className="container py-4">
      {/* Notification handling now done with console.log */}
      
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
      
      {/* Tree structure - using simplified version without DnD */}
      <div className="tree-structure bg-light p-3 rounded mb-3">
        <div className="alert alert-warning">
          <AlertTriangle size={16} className="me-2" />
          Drag and drop functionality temporarily disabled
        </div>
        
        <div className="folders-container">
          {tree
            .filter(node => node.droppable && node.id !== 0)
            .map(folder => (
              <div key={folder.id} className="folder mb-3">
                <div className="folder-header py-1 px-2 bg-light border-bottom">
                  <strong>{folder.text}</strong>
                </div>
                <div className="folder-content">
                  {tree
                    .filter(node => !node.droppable && node.parent === folder.id)
                    .map(doc => {
                      const qcStatus = doc.data?.qc_json?.status;
                      const isSelected = selected.has(doc.id);
                      
                      return (
                        <div
                          key={doc.id}
                          onClick={() => toggleSelect(doc.id)}
                          className={`doc-item py-1 px-2 d-flex align-items-center ${isSelected ? 'bg-light' : ''}`}
                        >
                          <div className="form-check me-2">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={isSelected}
                              onChange={() => {}}
                              id={`check-${doc.id}`}
                            />
                          </div>
                          
                          {qcStatus === 'passed' ? (
                            <CheckCircle size={16} className="text-success me-2" />
                          ) : qcStatus === 'failed' ? (
                            <XCircle size={16} className="text-danger me-2" />
                          ) : (
                            <AlertTriangle size={16} className="text-warning me-2" />
                          )}
                          
                          <span>{doc.text}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      </div>
      
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