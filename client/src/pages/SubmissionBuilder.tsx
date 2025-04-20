import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Tree, NodeModel, DropOptions } from '@minoru/react-dnd-treeview';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import { toast } from 'react-toastify';
import { 
  Folder, 
  File, 
  Check, 
  X, 
  FolderPlus, 
  Save, 
  RefreshCw, 
  Search, 
  FileCheck, 
  Filter,
  Info,
  AlertCircle
} from 'lucide-react';
import '../styles/submission-builder.css';

// Import QC WebSocket hook
import useQcSocket, { QcEvent } from '../hooks/useQcSocket';

// Import region rules
import { 
  RegionType, 
  getRegionSpecificModuleTree, 
  moduleFolderHints, 
  getModuleRewriteRules 
} from '../config/regionRules';

// Region-specific required module folders 
const REGION_FOLDERS: Record<string, string[]> = {
  FDA: ['m1.0', 'm1.1', 'm1.3', 'm1.15.2', 'm2', 'm3', 'm4', 'm5'],
  EMA: ['m1.0', 'm1.2', 'm1.3', 'm1.5', 'm2', 'm3', 'm4', 'm5'],
  PMDA: ['m1.0', 'm1.1', 'jp-annex', 'm2', 'm3', 'm4', 'm5']
};

// Define our document type
interface DocumentType {
  id: string;
  name: string;
  module?: string;
  type: 'pdf' | 'docx' | 'xml' | 'json' | 'csv' | 'other';
  status?: 'draft' | 'approved' | 'rejected';
  size?: number;
  lastModified?: string;
  author?: string;
}

// Extended node model with document data
interface CustomNodeModel extends NodeModel {
  text: string;
  data?: {
    document?: DocumentType;
    isFolder?: boolean;
    module?: string;
    description?: string;
  }
}

// Define a component for tree nodes (folders and files)
const CustomNode: React.FC<{
  node: CustomNodeModel;
  depth: number;
  isOpen: boolean;
  onToggle: (id: NodeModel['id']) => void;
  qcStatus: Record<string, QcEvent>;
  selected: string[];
  onSelect: (id: string, selected: boolean) => void;
}> = ({ node, depth, isOpen, onToggle, qcStatus, selected, onSelect }) => {
  const indent = depth * 24;
  const isFolder = node.droppable;
  const document = node.data?.document;
  const docId = document?.id || '';
  const isSelected = selected.includes(docId);
  
  // Get QC status for this document
  const documentStatus = qcStatus[docId];
  
  // Get folder tooltip
  const folderHint = isFolder && moduleFolderHints[node.id as string];
  
  // QC status badge
  const QcBadge = () => {
    if (!document) return null;
    
    if (!documentStatus) {
      return (
        <span className="qc-badge qc-badge-none">
          <X size={14} className="text-red-500" />
        </span>
      );
    }
    
    if (documentStatus.status === 'running') {
      return (
        <span className="qc-badge qc-badge-running">
          <RefreshCw size={14} className="text-blue-500 animate-spin" />
        </span>
      );
    }
    
    if (documentStatus.status === 'passed') {
      return (
        <span className="qc-badge qc-badge-passed">
          <Check size={14} className="text-green-500" />
        </span>
      );
    }
    
    return (
      <span className="qc-badge qc-badge-failed">
        <X size={14} className="text-red-500" />
        {documentStatus.errors && documentStatus.errors.length > 0 && (
          <span className="error-count">{documentStatus.errors.length}</span>
        )}
      </span>
    );
  };
  
  return (
    <div
      className={`tree-node ${isFolder ? 'folder' : 'file'} ${isSelected ? 'selected' : ''}`}
      style={{ paddingLeft: indent }}
    >
      <div className="node-content" title={folderHint}>
        {isFolder ? (
          <div className="folder-info">
            <button
              className="toggle-button"
              onClick={() => onToggle(node.id)}
            >
              {isOpen ? '▼' : '►'}
            </button>
            <Folder className="icon folder-icon" size={18} />
            <span className="text">{node.text}</span>
            {folderHint && (
              <span className="hint-indicator">
                <Info size={14} className="text-blue-400 ml-1" />
              </span>
            )}
          </div>
        ) : (
          <div className="file-container">
            {document && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(docId, e.target.checked)}
                className="mr-2"
              />
            )}
            <File className="icon file-icon" size={18} />
            <span className="text">{node.text}</span>
            {document && <QcBadge />}
          </div>
        )}
      </div>
    </div>
  );
};

// Inspector panel for document details
const InspectorPanel: React.FC<{
  selectedDocument: DocumentType | null;
  qcStatus: Record<string, QcEvent>;
}> = ({ selectedDocument, qcStatus }) => {
  if (!selectedDocument) {
    return (
      <div className="inspector-panel">
        <div className="inspector-header">Document Inspector</div>
        <div className="inspector-content">
          <p className="text-gray-500 text-center p-4">
            Select a document to view details
          </p>
        </div>
      </div>
    );
  }
  
  const status = qcStatus[selectedDocument.id];
  
  return (
    <div className="inspector-panel">
      <div className="inspector-header">Document Inspector</div>
      <div className="inspector-content">
        <div className="document-header">
          <h3>{selectedDocument.name}</h3>
          <div className="document-meta">
            <div>Type: {selectedDocument.type.toUpperCase()}</div>
            <div>Module: {selectedDocument.module || 'Unassigned'}</div>
            <div>Status: {selectedDocument.status || 'Draft'}</div>
          </div>
        </div>
        
        <div className="document-qc">
          <h4>QC Status</h4>
          {!status && (
            <div className="qc-status not-run">
              <X size={16} /> Not Run
            </div>
          )}
          
          {status && status.status === 'running' && (
            <div className="qc-status running">
              <RefreshCw size={16} className="animate-spin" /> Running
            </div>
          )}
          
          {status && status.status === 'passed' && (
            <div className="qc-status passed">
              <Check size={16} /> Passed
            </div>
          )}
          
          {status && status.status === 'failed' && (
            <div className="qc-status failed">
              <AlertCircle size={16} /> Failed
            </div>
          )}
        </div>
        
        {status && status.errors && status.errors.length > 0 && (
          <div className="qc-errors">
            <h4>QC Errors ({status.errors.length})</h4>
            <ul>
              {status.errors.map((error, index) => (
                <li key={index} className="error-item">{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        {status && status.warnings && status.warnings.length > 0 && (
          <div className="qc-warnings">
            <h4>QC Warnings ({status.warnings.length})</h4>
            <ul>
              {status.warnings.map((warning, index) => (
                <li key={index} className="warning-item">{warning}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="document-preview">
          <h4>Preview</h4>
          {selectedDocument.type === 'pdf' ? (
            <div className="pdf-preview">
              <iframe 
                src={`/api/documents/${selectedDocument.id}/preview`} 
                title={selectedDocument.name}
                className="pdf-iframe"
              />
            </div>
          ) : (
            <div className="no-preview">
              <p>No preview available for {selectedDocument.type} files</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main component
const SubmissionBuilder: React.FC = () => {
  // State for selected regulatory region
  const [region, setRegion] = useState<RegionType>('FDA');
  
  // State for the tree
  const [treeData, setTreeData] = useState<CustomNodeModel[]>([]);
  
  // State for search filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for documents
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  
  // State for selected document IDs (checkboxes)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // State for the currently viewed document in the inspector
  const [inspectedDocument, setInspectedDocument] = useState<DocumentType | null>(null);
  
  // Get all document IDs for QC socket subscription
  const allDocumentIds = useMemo(() => documents.map(doc => doc.id), [documents]);
  
  // Use QC socket hook
  const { qcStatus, triggerBulkQc, socketStatus } = useQcSocket(allDocumentIds);
  
  // Initialize with sample data
  useEffect(() => {
    // Get region-specific module tree structure
    const moduleFolders = getRegionSpecificModuleTree(region);
    
    // Sample documents - in a real app, these would come from an API
    const sampleDocuments: DocumentType[] = [
      {
        id: 'doc1',
        name: 'Clinical Study Report 001.pdf',
        module: 'm5.2',
        type: 'pdf',
        status: 'draft',
        size: 1024000,
        lastModified: '2024-04-01T10:30:00Z',
        author: 'John Smith'
      },
      {
        id: 'doc2',
        name: 'Study Protocol 247.pdf',
        module: 'm5.2',
        type: 'pdf',
        status: 'draft',
        size: 512000,
        lastModified: '2024-04-02T14:45:00Z',
        author: 'Jane Doe'
      },
      {
        id: 'doc3',
        name: 'Form FDA 1571.pdf',
        module: 'm1.1',
        type: 'pdf',
        status: 'approved',
        size: 256000,
        lastModified: '2024-04-03T09:15:00Z',
        author: 'Robert Johnson'
      },
      {
        id: 'doc4',
        name: 'Cover Letter.pdf',
        module: 'm1.1',
        type: 'pdf',
        status: 'approved',
        size: 128000,
        lastModified: '2024-04-04T16:20:00Z',
        author: 'Susan Williams'
      },
      {
        id: 'doc5',
        name: 'Investigator Brochure.pdf',
        module: 'm1.3',
        type: 'pdf',
        status: 'draft',
        size: 2048000,
        lastModified: '2024-04-05T11:00:00Z',
        author: 'Michael Brown'
      },
      {
        id: 'doc6',
        name: 'Quality Overall Summary.docx',
        module: 'm2.3',
        type: 'docx',
        status: 'draft',
        size: 350000,
        lastModified: '2024-04-06T13:10:00Z',
        author: 'Patricia Davis'
      },
      {
        id: 'doc7',
        name: 'Clinical Overview.pdf',
        module: 'm2.5',
        type: 'pdf',
        status: 'draft',
        size: 650000,
        lastModified: '2024-04-07T10:30:00Z',
        author: 'James Wilson'
      }
    ];
    
    // Update documents
    setDocuments(sampleDocuments);
    
    // Build tree from folders and documents
    const folderNodes = moduleFolders.map(folder => ({
      id: folder.id,
      parent: folder.parent,
      droppable: folder.droppable,
      text: folder.text,
      data: {
        isFolder: true,
        module: folder.id,
        description: moduleFolderHints[folder.id] || ''
      }
    }));
    
    // Convert documents to nodes and add to the tree
    const documentNodes = sampleDocuments.map(doc => ({
      id: `file-${doc.id}`,
      parent: doc.module || 'root',
      droppable: false,
      text: doc.name,
      data: {
        document: doc,
        isFolder: false,
        module: doc.module
      }
    }));
    
    // Combine folder and document nodes
    setTreeData([...folderNodes, ...documentNodes]);
  }, [region]);
  
  // Handle selecting/deselecting documents (checkboxes)
  const handleSelectDocument = (docId: string, selected: boolean) => {
    if (selected) {
      setSelectedIds(prev => [...prev, docId]);
    } else {
      setSelectedIds(prev => prev.filter(id => id !== docId));
    }
  };
  
  // Handle selecting all visible documents
  const handleSelectAll = () => {
    // Get all visible document IDs
    const visibleDocIds = getFilteredTreeData().filter(node => !node.droppable).map(node => node.data?.document?.id).filter(Boolean) as string[];
    
    // If all visible docs are already selected, deselect all
    const allSelected = visibleDocIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleDocIds);
    }
  };
  
  // Handle node toggling (expand/collapse)
  const handleToggle = (id: NodeModel['id']) => {
    setTreeData(prevTree => {
      return prevTree.map(node => {
        if (node.id === id) {
          return { ...node, isOpen: !node.isOpen };
        }
        return node;
      });
    });
  };
  
  // Handle drag and drop
  const handleDrop = (newTree: NodeModel[], options: DropOptions) => {
    const { dragSourceId, dropTargetId } = options;
    
    // Find the dropped node
    const sourceNode = treeData.find(node => node.id === dragSourceId);
    
    if (!sourceNode || !sourceNode.data?.document) return;
    
    const document = sourceNode.data.document;
    const dropTargetNode = treeData.find(node => node.id === dropTargetId);
    
    if (!dropTargetNode) return;
    
    // Get the target module
    let newModule = dropTargetNode.id as string;
    
    // Check if we need to rewrite the module based on region rules
    const rewriteRules = getModuleRewriteRules(region);
    if (rewriteRules[newModule]) {
      newModule = rewriteRules[newModule];
      toast.info(`Document moved to ${newModule} based on ${region} region rules`);
    }
    
    // Update the document module
    const updatedDocuments = documents.map(doc => {
      if (doc.id === document.id) {
        return { ...doc, module: newModule };
      }
      return doc;
    });
    
    setDocuments(updatedDocuments);
    
    // Update the tree
    setTreeData(prevTree => {
      return prevTree.map(node => {
        // Update the node parent
        if (node.id === dragSourceId) {
          return {
            ...node,
            parent: dropTargetId,
            data: {
              ...node.data,
              module: newModule,
              document: node.data?.document ? {
                ...node.data.document,
                module: newModule
              } : undefined
            }
          };
        }
        return node;
      });
    });
  };
  
  // Filter tree data based on search query
  const getFilteredTreeData = useCallback(() => {
    if (!searchQuery) return treeData;
    
    // Filter document nodes
    const matchingDocumentNodes = treeData.filter(node => 
      !node.droppable && 
      node.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Get all parent folders that need to be included
    const requiredParents = new Set<string | null>();
    
    // Function to recursively add all parent folders
    const addParentsRecursively = (parentId: string | null) => {
      if (parentId === null) return;
      requiredParents.add(parentId);
      
      const parentNode = treeData.find(node => node.id === parentId);
      if (parentNode && parentNode.parent !== null) {
        addParentsRecursively(parentNode.parent);
      }
    };
    
    // Add parents for all matching documents
    matchingDocumentNodes.forEach(node => {
      addParentsRecursively(node.parent);
    });
    
    // Filter tree to only include matching documents and their parent folders
    return treeData.filter(node => 
      (node.droppable && requiredParents.has(node.id)) || // Include required parent folders
      (!node.droppable && node.text.toLowerCase().includes(searchQuery.toLowerCase())) // Include matching documents
    );
  }, [treeData, searchQuery]);
  
  // Bulk approve and QC
  const handleBulkApproveQc = async () => {
    if (selectedIds.length === 0) {
      toast.warn('No documents selected for approval and QC');
      return;
    }
    
    try {
      // Get module updates for selected documents
      const moduleUpdates: Record<string, string> = {};
      documents.forEach(doc => {
        if (selectedIds.includes(doc.id) && doc.module) {
          moduleUpdates[doc.id] = doc.module;
        }
      });
      
      // Call bulk approve API
      const response = await fetch('/api/documents/bulk-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          document_ids: selectedIds,
          module_updates: moduleUpdates,
          run_qc: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Show toast with results
      if (result.success) {
        toast.success(`Approved ${result.approved_count} documents, QC in progress`);
        
        // Trigger QC for all selected documents via WebSocket for faster response
        // (The backend will also do this, but this provides immediate UI feedback)
        triggerBulkQc(selectedIds);
        
        // Update document status
        setDocuments(prevDocs => prevDocs.map(doc => {
          if (selectedIds.includes(doc.id)) {
            return { ...doc, status: 'approved' };
          }
          return doc;
        }));
      } else {
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error in bulk approve:', error);
      toast.error(`Error approving documents: ${error}`);
    }
  };
  
  // Save order to backend
  const handleSaveOrder = async () => {
    try {
      // In a real app, you would send the updated tree structure to the backend
      // For now, we'll just show a success toast
      toast.success('Folder structure and document order saved');
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error(`Error saving order: ${error}`);
    }
  };
  
  // Handle document click to show in inspector
  const handleDocumentClick = (document: DocumentType) => {
    setInspectedDocument(document);
  };
  
  // Render custom node components
  const renderNode = ({ node, depth, isOpen }: { node: CustomNodeModel, depth: number, isOpen: boolean }) => {
    return (
      <CustomNode
        node={node}
        depth={depth}
        isOpen={isOpen}
        onToggle={handleToggle}
        qcStatus={qcStatus}
        selected={selectedIds}
        onSelect={handleSelectDocument}
      />
    );
  };
  
  return (
    <div className="submission-builder">
      <div className="submission-header">
        <h1>Submission Builder</h1>
        <div className="socket-status">
          WebSocket: {' '}
          {socketStatus === 'connected' && (
            <span className="status connected">Connected</span>
          )}
          {socketStatus === 'connecting' && (
            <span className="status connecting">Connecting...</span>
          )}
          {socketStatus === 'disconnected' && (
            <span className="status disconnected">Disconnected</span>
          )}
        </div>
      </div>
      
      <div className="controls">
        <div className="region-selector">
          <label>Region:</label>
          <select 
            value={region} 
            onChange={e => setRegion(e.target.value as RegionType)}
            className="region-select"
          >
            <option value="FDA">FDA (US)</option>
            <option value="EMA">EMA (EU)</option>
            <option value="PMDA">PMDA (Japan)</option>
            <option value="HC">Health Canada</option>
          </select>
        </div>
        
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="clear-search" 
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>
        
        <div className="toolbar">
          <button 
            className="toolbar-button select-all"
            onClick={handleSelectAll}
            title="Select All Visible"
          >
            <input 
              type="checkbox" 
              checked={getFilteredTreeData().filter(node => !node.droppable).length > 0 && 
                getFilteredTreeData().filter(node => !node.droppable).every(node => 
                  node.data?.document && selectedIds.includes(node.data.document.id)
                )
              } 
              readOnly 
            />
            <span>Select All</span>
          </button>
          
          <button 
            className="toolbar-button bulk-approve"
            onClick={handleBulkApproveQc}
            disabled={selectedIds.length === 0}
            title="Approve Selected Documents & Run QC"
          >
            <FileCheck size={16} />
            <span>Bulk Approve + QC</span>
            {selectedIds.length > 0 && (
              <span className="count">({selectedIds.length})</span>
            )}
          </button>
          
          <button 
            className="toolbar-button save-order"
            onClick={handleSaveOrder}
            title="Save Folder Structure and Document Order"
          >
            <Save size={16} />
            <span>Save Order</span>
          </button>
        </div>
      </div>
      
      <div className="builder-container">
        <div className="tree-container">
          <DndProvider backend={HTML5Backend}>
            <Tree
              tree={getFilteredTreeData()}
              rootId="root"
              render={renderNode}
              onDrop={handleDrop}
              classes={{
                root: 'dnd-tree'
              }}
              sort={false}
              insertDroppableFirst={false}
              canDrop={(tree, { dragSource, dropTarget }) => {
                // Only allow dropping into folder nodes
                if (!dropTarget.droppable) return false;
                
                // Don't allow dropping a folder into itself or its children
                if (dragSource.droppable) {
                  const isChild = (parentId: string | null, childId: string | null): boolean => {
                    if (parentId === childId) return true;
                    const children = tree.filter(node => node.parent === parentId);
                    return children.some(child => isChild(child.id, childId));
                  };
                  
                  return !isChild(dragSource.id, dropTarget.id);
                }
                
                return true;
              }}
              initialOpen={true}
            />
          </DndProvider>
        </div>
        
        <InspectorPanel 
          selectedDocument={inspectedDocument} 
          qcStatus={qcStatus}
        />
      </div>
    </div>
  );
};

export default SubmissionBuilder;