// SubmissionBuilder.tsx – drag-drop tree with QC badges, region rule hints, bulk approve, live QC updates
import React, { useEffect, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { Tree, NodeModel } from '@minoru/react-dnd-treeview';
import { CheckCircle, XCircle, AlertTriangle, Info, Loader } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import update from 'immutability-helper';
import 'react-toastify/dist/ReactToastify.css';
import SubmissionBuilderWebSocket from '../components/SubmissionBuilderWebSocket';
import { REGION_RULES as CONFIGURED_REGION_RULES, RegionRule } from '../config/regionRules';
import { useQcSocket } from '../hooks/useQcSocket';

// Legacy region-specific folder structure - will be replaced with regionRules
const REGION_FOLDERS: Record<string, string[]> = {
  FDA: ['m1', 'm2', 'm3', 'm4', 'm5'],
  EMA: ['m1', 'm1 admin', 'm2', 'm3', 'm4', 'm5'],
  PMDA: ['m1', 'm2', 'm3', 'm4', 'm5', 'jp-annex'],
};

// Required module list per region for rule-hinting
const REQUIRED_MODULES: Record<string, string[]> = {
  FDA: ['m1', 'm1.1', 'm1.3'],
  EMA: ['m1', 'm1.0', 'm1.2'],
  PMDA: ['m1', 'jp-annex'],
};

// Required modules per region (validation fails if empty)
const REGION_REQUIRED: Record<string, string[]> = {
  FDA: ['m1', 'm2', 'm3'],
  EMA: ['m1', 'm1 admin', 'm2', 'm3'],
  PMDA: ['m1', 'm2', 'm3', 'jp-annex'],
};

// Extended region-specific rule hints
const REGION_RULES: Record<string, Record<string, string>> = {
  FDA: {
    'm1': 'Must include US regional administrative information',
    'm2': 'Must include CTD summaries following FDA guidance',
    'm2.7': 'Clinical summary must follow FDA-specific format',
  },
  EMA: {
    'm1': 'Must include EU Application Form (eAF)',
    'm1 admin': 'EU administrative documents are required',
    'm2': 'Must include CTD summaries following EMA guidance',
    'm3': 'Must include QOS (Quality Overall Summary) for EU',
  },
  PMDA: {
    'm1': 'Must include Japanese application forms',
    'm2': 'Must include CTD summaries following PMDA guidance',
    'm3': 'Must include Japan-specific CMC information',
    'jp-annex': 'Required Japanese regional annexes must be included',
  },
};

export type Doc = { 
  id: number; 
  title: string; 
  module: string; 
  qc_json?: { 
    status: string;
    details?: string;
    errors?: string[];
    warnings?: string[];
    profile?: string;
    timestamp?: string;
  } 
};
export type Node = NodeModel<Doc>;

export default function SubmissionBuilder({ region = 'FDA' }: { region?: 'FDA'|'EMA'|'PMDA' }) {
  const [tree, setTree] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [qcInProgress, setQcInProgress] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(true);
  const [qcSummary, setQcSummary] = useState<{
    total: number;
    processed: number;
    passed: number;
    failed: number;
    progress: number;
    complete: boolean;
  } | null>(null);

  // Fetch documents when component mounts or region changes
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        // Fetch all documents regardless of status
        const docs: Doc[] = await fetchJson('/api/documents?status=all');
        
        // Create root and folder structure
        const root: Node = { id: 0, parent: 0, text: 'root', droppable: true };
        
        // We no longer need this line since we're using CONFIGURED_REGION_RULES directly
        
        // Create both legacy folders and detailed region-specific M1 folders
        const legacyFolders = REGION_FOLDERS[region]
          .filter(m => !m.startsWith('m1')) // Exclude m1 folders as we'll use region-specific ones
          .map((m, idx) => ({ 
            id: 10_000 + idx, 
            parent: 0, 
            text: m, 
            droppable: true 
          }));
          
        // Add detailed M1 folders from regionRules configuration
        const m1Folders = CONFIGURED_REGION_RULES[region as keyof typeof CONFIGURED_REGION_RULES]?.m1Folders.map((path: string, idx: number) => ({
          id: 9000 + idx,
          parent: 0,
          text: path,
          droppable: true
        })) || [];
        
        const allFolders = [...m1Folders, ...legacyFolders];
        
        // Organize documents into folders with more intelligent folder assignment
        const items = docs.map(d => {
          // Map the document to the appropriate folder
          // Priority: exact match > prefix match > m1 folder > first folder
          const exactMatchFolder = allFolders.find(f => d.module === f.text);
          const prefixMatchFolder = allFolders.find(f => d.module.startsWith(f.text + '/'));
          const moduleRootFolder = allFolders.find(f => d.module.startsWith(f.text.split('/')[0]));
          
          // Use the best matching folder
          const targetFolder = exactMatchFolder || prefixMatchFolder || moduleRootFolder || allFolders[0];
          
          return {
            id: d.id,
            parent: targetFolder.id,
            text: d.title,
            droppable: false,
            data: d,
          };
        });
        
        setTree([root, ...allFolders, ...items]);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [region]);

  // Handle QC updates coming from the WebSocket
  const handleQcUpdate = (update: any) => {
    // Handle document-specific QC status updates
    if (update.type === 'qc_status' && update.documentId) {
      const docId = update.documentId;
      
      // Find the document in the tree
      const nodeIndex = tree.findIndex(n => n.id === docId);
      if (nodeIndex === -1) return;
      
      // Create updated tree with new QC status
      const updatedTree = update.status === 'processing' ? 
        // For processing status, just update the status
        update(tree, {
          [nodeIndex]: { 
            data: { 
              qc_json: { 
                $set: { 
                  status: update.status,
                  details: update.details || 'Processing...',
                  profile: update.profile,
                  timestamp: update.timestamp
                }
              }
            }
          }
        }) :
        // For final status (passed/failed), update with full details
        update(tree, {
          [nodeIndex]: { 
            data: { 
              qc_json: { 
                $set: { 
                  status: update.status,
                  details: update.details,
                  errors: update.errors || [],
                  warnings: update.warnings || [],
                  profile: update.profile,
                  timestamp: update.timestamp
                }
              }
            }
          }
        });
      
      setTree(updatedTree);
      
      // Show toast notification for final statuses
      if (update.status === 'passed') {
        toast.success(`Document #${docId} passed validation`);
      } else if (update.status === 'failed') {
        const errorDetail = update.details || 'Validation failed';
        toast.error(`Document #${docId} ${tree[nodeIndex].text}: ${errorDetail}`);
      }
    }
    
    // Handle bulk QC summary updates
    if (update.type === 'bulk_qc_summary') {
      setQcSummary({
        total: update.total,
        processed: update.processed,
        passed: update.passed,
        failed: update.failed,
        progress: update.progress || 0,
        complete: !!update.complete
      });
      
      // When processing is complete, release the QC in progress lock
      if (update.complete) {
        setQcInProgress(false);
        
        // Show completion message
        if (update.failed === 0) {
          toast.success(`All ${update.total} documents passed ${update.region} validation`, { autoClose: 5000 });
        } else {
          toast.warning(`${update.passed} of ${update.total} documents passed ${update.region} validation. ${update.failed} failed.`, { autoClose: 5000 });
        }
      }
    }
    
    // Handle bulk QC errors
    if (update.type === 'bulk_qc_error') {
      toast.error(`Bulk QC error: ${update.error}`);
      setQcInProgress(false);
    }
  };
  
  // Use QC WebSocket for real-time updates
  useQcSocket((msg) => {
    setTree((prev) =>
      prev.map((n) =>
        n.id === msg.id ? { ...n, data: { ...n.data, qc_json: { status: msg.status } } } : n
      )
    );
  });

  // Check if a folder is a required module for the current region
  const isRequiredModule = (folderName: string): boolean => {
    const baseModuleName = folderName.split(/\s|-/)[0]; // Handle "m1 admin" or "m1-annex" format
    return REGION_REQUIRED[region].includes(baseModuleName) || REGION_REQUIRED[region].includes(folderName);
  };
  
  // Count documents in a folder
  const countDocsInFolder = (folderId: number | string): number => {
    // Convert folderId to number for comparison
    const id = typeof folderId === 'string' ? parseInt(folderId, 10) : folderId;
    return tree.filter(n => !n.droppable && Number(n.parent) === id).length;
  };
  
  // Generate region-specific hints based on current state
  useEffect(() => {
    // Skip if tree isn't loaded yet
    if (loading || tree.length === 0) return;
    
    const newHints: string[] = [];
    const regionConfig = CONFIGURED_REGION_RULES[region as keyof typeof CONFIGURED_REGION_RULES];
    
    if (!regionConfig) return;
    
    // Check for missing required forms
    for (const requiredForm of regionConfig.requiredForms) {
      // Look for documents that match the required form
      const formExists = tree.some(node => 
        !node.droppable && // is a document
        node.text.includes(requiredForm.title) // title contains form name
      );
      
      if (!formExists) {
        // Form is missing, add a hint
        newHints.push(`${region} requires ${requiredForm.title} in ${requiredForm.module}`);
      }
    }
    
    // Check for empty required folders
    for (const folder of tree.filter(n => n.droppable && n.id !== 0)) {
      const folderName = folder.text;
      
      // Skip root folder
      if (folderName === 'root') continue;
      
      // Check if this is a required module
      if (isRequiredModule(folderName)) {
        const docCount = countDocsInFolder(folder.id);
        
        if (docCount === 0) {
          // Get the hint for this module from the regionRules if available
          const moduleHint = REGION_RULES[region]?.[folderName.split('/')[0]];
          
          if (moduleHint) {
            newHints.push(`${folderName}: ${moduleHint}`);
          } else {
            newHints.push(`${folderName} is required for ${region} submissions but is empty`);
          }
        }
      }
    }
    
    setHints(newHints);
  }, [tree, region, loading]);
  
  const renderNode = (node: Node, { depth, isOpen, onToggle }: any) => {
    const style = { marginLeft: depth * 16 };
    
    // Folder rendering
    if (node.droppable) {
      const isRequired = isRequiredModule(node.text);
      const docCount = countDocsInFolder(node.id);
      const isEmpty = docCount === 0;
      
      // Create region-specific folder styling
      const folderClasses = `
        d-flex align-items-center py-1 px-2 rounded
        ${isRequired && isEmpty ? 'border border-danger' : ''}
      `;
      
      let folderHint = '';
      if (node.text === 'jp-annex' && region === 'PMDA') {
        folderHint = ' - Japan-specific regional documentation';
      } else if (node.text.startsWith('m1') && node.text.includes('admin') && region === 'EMA') {
        folderHint = ' - EU administrative documents';
      }
      
      return (
        <div style={style} className={folderClasses}>
          <button onClick={onToggle} className="btn btn-sm btn-link p-0 me-1">
            {isOpen ? '▾' : '▸'}
          </button>
          <strong>{node.text}</strong>
          {folderHint && <span className="text-muted small ms-1">{folderHint}</span>}
          {docCount > 0 && <span className="badge bg-secondary ms-2">{docCount}</span>}
          {isRequired && isEmpty && (
            <span className="badge bg-danger ms-2" title={`Required for ${region} submissions`}>
              Required for {region}
            </span>
          )}
        </div>
      );
    }
    
    // Document rendering with enhanced QC status
    const qcStatus = node.data?.qc_json?.status || 'pending';
    const hasErrors = node.data?.qc_json?.errors && node.data.qc_json.errors.length > 0;
    const hasWarnings = node.data?.qc_json?.warnings && node.data.qc_json.warnings.length > 0;
    
    // Generate tooltip text with validation details if available
    let tooltip = '';
    if (qcStatus === 'processing') {
      tooltip = 'Validation in progress...';
    } else if (qcStatus === 'passed') {
      tooltip = `Passed ${node.data?.qc_json?.profile || 'validation'}`;
      if (hasWarnings) {
        tooltip += ` with ${node.data?.qc_json?.warnings?.length} warnings`;
      }
    } else if (qcStatus === 'failed') {
      tooltip = hasErrors 
        ? `Failed: ${node.data?.qc_json?.errors?.[0]}`
        : 'Validation failed';
    }
    
    // Status icon based on QC status
    const StatusIcon = () => {
      if (qcStatus === 'processing') return <Loader size={14} className="text-primary animate-spin" />;
      if (qcStatus === 'passed') return <CheckCircle size={14} className="text-success" />;
      if (qcStatus === 'pending') return <AlertTriangle size={14} className="text-secondary" />;
      return <XCircle size={14} className="text-danger" />;
    };
    
    // Component for warning icon with accessible tooltip
    const WarningIcon = () => {
      return (
        <span className="ms-auto" title="Has warnings">
          <Info size={12} className="text-warning" />
        </span>
      );
    };
    
    return (
      <div 
        style={style} 
        className="d-flex align-items-center gap-2 py-1 px-2 hover:bg-light rounded"
        title={tooltip}
      >
        <StatusIcon />
        <span className="text-truncate">{node.text}</span>
        {hasWarnings && <WarningIcon />}
      </div>
    );
  };

  const onDrop = (newTree: Node[]) => setTree(newTree);

  const saveOrder = async () => {
    try {
      const orderedDocs = tree.filter(n => !n.droppable && n.parent !== 0).map((n, idx) => {
        const folder = tree.find(f => f.id === n.parent)!;
        return { id: n.id, module: folder.text.split(/\s|-/)[0], order: idx };
      });
      
      await fetch('/api/documents/builder-order', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docs: orderedDocs })
      });
      
      console.log('Order saved successfully');
      toast.success('Document order saved successfully');
      
      // Check for missing required modules
      const requiredModules = REGION_REQUIRED[region];
      const missingModules = requiredModules.filter(module => {
        // Find module folder
        const folderNode = tree.find(n => n.droppable && n.text.startsWith(module));
        if (!folderNode) return true;
        
        // Check if it has documents
        return countDocsInFolder(folderNode.id) === 0;
      });
      
      // Notify about missing required modules for the selected region
      if (missingModules.length > 0) {
        toast.warning(
          `Missing required modules for ${region}: ${missingModules.join(', ')}`,
          { autoClose: 5000 }
        );
      }
    } catch (error: any) {
      console.error('Error saving order:', error);
      toast.error(`Failed to save order: ${error.message}`);
    }
  };

  const bulkApprove = async () => {
    // Get all document nodes
    const docNodes = tree.filter(n => !n.droppable && n.parent !== 0);
    // Ensure all document IDs are numbers
    const docIds = docNodes.map(n => typeof n.id === 'string' ? parseInt(n.id, 10) : n.id);
    
    if (docIds.length === 0) {
      console.warn('No documents to approve');
      toast.error('No documents to approve');
      return;
    }

    setQcInProgress(true);
    
    try {
      // Import validation service methods
      const { validateMultipleDocuments, REGION_PROFILES } = await import('../services/validationService');
      
      console.log(`Starting validation for ${docIds.length} documents with ${region} validation profile (${REGION_PROFILES[region]})...`);
      
      toast.info(
        `Starting validation of ${docIds.length} documents using ${region} rules...`,
        { autoClose: 2000 }
      );
      
      // Use the validation service to handle the bulk validation
      const result = await validateMultipleDocuments(docIds as number[], region);
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Validation failed');
      }
      
      // Show summary toast
      console.log('Validation initiated:', result);
      
      // Individual status updates will come through the WebSocket
      // No need to set qcInProgress to false as the updates are asynchronous
      
    } catch (error: any) {
      console.error('Bulk validation error:', error);
      toast.error(`Validation failed: ${error.message}`);
      setQcInProgress(false);
    }
  };
  
  // Get region-specific validation information
  const getRegionInfo = () => {
    switch (region) {
      case 'FDA':
        return {
          title: 'FDA eCTD 3.2.2',
          description: 'U.S. Food and Drug Administration requirements',
          modules: ['m1', 'm2', 'm3']
        };
      case 'EMA':
        return {
          title: 'EU eCTD 3.2.2',
          description: 'European Medicines Agency requirements',
          modules: ['m1', 'm1 admin', 'm2', 'm3']
        };
      case 'PMDA':
        return {
          title: 'JP eCTD 4.0',
          description: 'Pharmaceuticals and Medical Devices Agency requirements',
          modules: ['m1', 'm2', 'm3', 'jp-annex']
        };
      default:
        return {
          title: 'FDA eCTD 3.2.2',
          description: 'U.S. Food and Drug Administration requirements',
          modules: ['m1', 'm2', 'm3']
        };
    }
  };

  if (loading) return <p className="text-center mt-4">Loading…</p>;

  // Get region-specific information for display
  const regionInfo = getRegionInfo();
  
  // Determine if there are any missing required modules for warnings
  const requiredModules = REGION_REQUIRED[region];
  const missingModules = requiredModules.filter(module => {
    // Find module folder
    const folderNode = tree.find(n => n.droppable && n.text.startsWith(module));
    if (!folderNode) return true;
    
    // Check if it has documents
    return countDocsInFolder(Number(folderNode.id)) === 0;
  });
  
  return (
    <div className="container py-4">
      <h3 className="d-flex align-items-center justify-content-between">
        <div>
          Submission Builder <span className="badge bg-secondary ms-2">{region}</span>
        </div>
        {/* Show WebSocket connection status */}
        <div className="badge bg-success">QC Updates Connected</div>
      </h3>
      
      {/* WebSocket component for real-time updates */}
      <SubmissionBuilderWebSocket 
        onQcUpdate={handleQcUpdate}
        region={region}
      />
      
      {/* Region-specific hints alert */}
      {hints.length > 0 && showHints && (
        <div className="alert alert-warning alert-dismissible fade show mb-3" role="alert">
          <h5 className="alert-heading">Region-Specific Requirements for {region}</h5>
          <ul className="mb-0">
            {hints.map((hint, index) => (
              <li key={index}>{hint}</li>
            ))}
          </ul>
          <button 
            type="button" 
            className="btn-close" 
            aria-label="Close"
            onClick={() => setShowHints(false)}
          ></button>
        </div>
      )}
      
      {/* Region-specific information panel */}
      <div className="card mb-3">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="m-0">{regionInfo.title} Validation Profile</h5>
          <span className="badge bg-primary">{region}</span>
        </div>
        <div className="card-body">
          <p className="card-text">{regionInfo.description}</p>
          
          <div className="row">
            <div className="col-md-6">
              <h6>Required Modules:</h6>
              <ul className="list-group mb-3">
                {requiredModules.map(module => (
                  <li key={module} className={`list-group-item d-flex justify-content-between align-items-center ${
                    missingModules.includes(module) ? 'list-group-item-danger' : 'list-group-item-success'
                  }`}>
                    {module}
                    {missingModules.includes(module) ? (
                      <span className="badge bg-danger">Missing</span>
                    ) : (
                      <span className="badge bg-success">Present</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="col-md-6">
              {missingModules.length > 0 && (
                <div className="alert alert-warning">
                  <strong>Warning:</strong> Missing required modules for {region} submission:
                  <ul className="mb-0 mt-1">
                    {missingModules.map(module => (
                      <li key={module}>{module}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {!missingModules.length && (
                <div className="alert alert-success">
                  <strong>All required modules are present.</strong> Drag documents to the appropriate modules.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="card mb-3">
        <div className="card-header bg-light">Document Structure</div>
        <div className="card-body">
          <DndProvider backend={HTML5Backend}>
            <Tree
              tree={tree}
              rootId={0}
              render={renderNode}
              onDrop={onDrop}
            />
          </DndProvider>
        </div>
      </div>
      
      {/* Calculate missing required modules */}
      {(() => {
        const missing = REQUIRED_MODULES[region].filter(
          req => !tree.some(n => n.droppable && n.text === req && tree.some(child => child.parent === n.id))
        );
        
        return missing.length > 0 ? (
          <div className="alert alert-warning mt-3">
            Missing required module folders/files: {missing.join(', ')}
          </div>
        ) : null;
      })()}
      
      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-primary" onClick={saveOrder} disabled={qcInProgress}>
          <CheckCircle size={18} className="me-1" />
          Save Order
        </button>
        <button 
          className="btn btn-success" 
          onClick={bulkApprove} 
          disabled={qcInProgress}
        >
          {qcInProgress ? (
            <>
              <Loader size={18} className="me-1 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <AlertTriangle size={18} className="me-1" />
              Validate All
            </>
          )}
        </button>
      </div>
      
      {/* QC Progress Summary */}
      {qcSummary && (
        <div className="mt-3">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="m-0 d-flex align-items-center">
                Validation Progress
                {qcSummary.complete ? (
                  <span className="badge bg-success ms-2">Complete</span>
                ) : (
                  <span className="badge bg-primary ms-2">Running</span>
                )}
              </h5>
            </div>
            <div className="card-body">
              <div className="progress mb-3" style={{ height: '20px' }}>
                <div 
                  className="progress-bar bg-success" 
                  role="progressbar"
                  style={{ width: `${qcSummary.progress}%` }}
                  aria-valuenow={qcSummary.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  {qcSummary.progress}%
                </div>
              </div>
              
              <div className="row text-center">
                <div className="col-3">
                  <h6>Total</h6>
                  <div className="h4">{qcSummary.total}</div>
                </div>
                <div className="col-3">
                  <h6>Processed</h6>
                  <div className="h4">{qcSummary.processed}</div>
                </div>
                <div className="col-3">
                  <h6>Passed</h6>
                  <div className="h4 text-success">{qcSummary.passed}</div>
                </div>
                <div className="col-3">
                  <h6>Failed</h6>
                  <div className="h4 text-danger">{qcSummary.failed}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer position="bottom-right" />
    </div>
  );
}

async function fetchJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Network error: ${response.status}`);
  return response.json();
}