// SubmissionBuilder.tsx – drag-drop tree with QC badges, bulk approve, live QC WebSocket & AI guidance
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider, useDrop } from 'react-dnd';
import { Tree, NodeModel } from '@minoru/react-dnd-treeview';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import update from 'immutability-helper';

import GuidanceTooltip from '../components/GuidanceTooltip';

const REGION_FOLDERS: Record<string, string[]> = {
  FDA: ['m1', 'm2', 'm3', 'm4', 'm5'],
  EMA: ['m1', 'm2', 'm3', 'm4', 'm5'],
  PMDA: ['m1', 'm2', 'm3', 'm4', 'm5', 'jp-annex'],
};

type Doc = { 
  id: number; 
  title: string; 
  module: string; 
  doc_type: string;
  qc_json?: { status: string } 
};

type Node = NodeModel<Doc>;
type Guidance = {
  rule: string;
  severity: string;
  message: string;
  suggestion: string;
};

type GuidanceResponse = {
  document_id: number;
  module_id: string;
  status: string;
  guidance: Guidance[];
};

export default function SubmissionBuilder({ region = 'FDA' }: { region?: string }) {
  const [tree, setTree] = useState<Node[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [draggedNodeId, setDraggedNodeId] = useState<number | null>(null);
  const [guidanceTooltip, setGuidanceTooltip] = useState({
    isOpen: false,
    position: { top: 0, left: 0 },
    documentId: 0,
    documentTitle: '',
    moduleId: '',
    guidance: [] as Guidance[]
  });
  
  // Create WebSocket connection using ref
  const ws = useRef<WebSocket>();
  
  useEffect(() => {
    ws.current = new WebSocket(`${location.protocol==='https:'?'wss':'ws'}://${location.host}/ws/qc`);
    ws.current.onmessage = (e) => {
      try {
        const { id, status } = JSON.parse(e.data);
        
        // Update the tree with the new QC status
        setTree(t => t.map(n => n.id===id ? { ...n, data: { ...n.data!, qc_json: { status }}} : n));
        
        // Show toast notification for QC status changes
        if (status === 'passed') {
          const docNode = tree.find(n => n.id === id);
          if (docNode) {
            toast.success(`"${docNode.text}" passed QC`);
          }
        } else if (status === 'failed') {
          const docNode = tree.find(n => n.id === id);
          if (docNode) {
            toast.error(`"${docNode.text}" failed QC`);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    ws.current.onopen = () => {
      console.log('QC WebSocket connected');
    };
    
    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.current.onclose = () => {
      console.log('QC WebSocket disconnected');
    };
    
    return () => ws.current?.close();
  }, [tree]);

  // Fetch documents and build tree
  useEffect(() => {
    fetchDocs();
  }, [region]);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const docs: Doc[] = await fetchJson('/api/documents?status=approved_or_qc_failed');
      
      // Build the tree structure
      const root: Node = { id: 0, parent: 0, text: 'root', droppable: true };
      
      // Create folder nodes based on region
      const folders = REGION_FOLDERS[region].map((moduleId, idx) => ({ 
        id: 10000 + idx, 
        parent: 0, 
        text: moduleId, 
        droppable: true 
      }));
      
      // Map documents to tree nodes
      const items = docs.map(doc => ({
        id: doc.id,
        parent: folders.find(f => doc.module.startsWith(f.text))?.id || folders[0].id,
        text: doc.title,
        droppable: false,
        data: doc,
      }));
      
      setTree([root, ...folders, ...items]);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  // Handle document drop
  const handleDrop = async (newTree: Node[], options: any) => {
    const { dragSourceId, dropTargetId } = options;
    
    // Update the tree structure
    setTree(newTree);
    
    // If a document was dropped onto a folder, check placement with AI
    if (dragSourceId && dropTargetId) {
      const draggedNode = tree.find(node => node.id === dragSourceId);
      const dropTarget = tree.find(node => node.id === dropTargetId);
      
      if (draggedNode && dropTarget && !draggedNode.droppable && dropTarget.droppable) {
        // Document dropped into a folder - check with AI
        checkPlacementWithAI(draggedNode, dropTarget);
      }
    }
  };

  // Check placement with AI
  const checkPlacementWithAI = async (docNode: Node, folderNode: Node) => {
    try {
      if (!docNode.data) return;
      
      // Get all existing modules in the submission
      const existingModules = tree
        .filter(node => !node.droppable && node.id !== docNode.id)
        .map(node => {
          const parentFolder = tree.find(f => f.id === node.parent);
          return parentFolder ? parentFolder.text : '';
        })
        .filter(Boolean);
      
      // Get mouse position for tooltip
      const mousePosition = { 
        top: window.event ? (window.event as MouseEvent).clientY : 100,
        left: window.event ? (window.event as MouseEvent).clientX : 100
      };
      
      // Make API request to check placement
      const response = await fetch('/api/guidance/document-drop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: docNode.id,
          module_id: folderNode.text,
          document_type: docNode.data.doc_type || 'unknown',
          document_title: docNode.text,
          existing_modules: existingModules,
          region
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get placement guidance');
      }
      
      const guidance: GuidanceResponse = await response.json();
      
      // Show guidance tooltip
      setGuidanceTooltip({
        isOpen: true,
        position: mousePosition,
        documentId: docNode.id,
        documentTitle: docNode.text,
        moduleId: folderNode.text,
        guidance: guidance.guidance
      });
      
      // Auto-close the tooltip after 10 seconds
      setTimeout(() => {
        setGuidanceTooltip(prev => ({
          ...prev,
          isOpen: false
        }));
      }, 10000);
      
    } catch (error) {
      console.error('Error checking placement:', error);
    }
  };

  // Toggle document selection for bulk operations
  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Bulk approve selected documents
  const bulkApprove = async () => {
    if (selected.size === 0) return;
    
    try {
      const response = await fetch('/api/documents/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) })
      });
      
      if (!response.ok) {
        throw new Error('Bulk approval failed');
      }
      
      toast.info('Bulk approval and QC started');
      setSelected(new Set());
    } catch (error) {
      console.error('Error in bulk approve:', error);
      toast.error('Bulk approval failed');
    }
  };

  // Save the current document order
  const saveOrder = async () => {
    try {
      const orderedDocs = tree
        .filter(node => !node.droppable && node.parent !== 0)
        .map((node, index) => {
          const parentFolder = tree.find(folder => folder.id === node.parent);
          return {
            id: node.id,
            module: parentFolder ? parentFolder.text : '',
            order: index
          };
        });
      
      const response = await fetch('/api/documents/builder-order', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ docs: orderedDocs })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save order');
      }
      
      toast.success('Document order saved');
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Failed to save document order');
    }
  };

  // Render a tree node (folder or document)
  const renderNode = (node: Node, { depth, isOpen, onToggle }: any) => {
    // Render folder node
    if (node.droppable) {
      return (
        <div 
          style={{ marginLeft: depth * 16 }} 
          className="flex items-center gap-1 py-2 px-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
        >
          <button 
            onClick={onToggle} 
            className="w-5 h-5 flex items-center justify-center rounded-sm hover:bg-gray-200 dark:hover:bg-slate-600"
          >
            <ChevronDown 
              size={14} 
              className={`transition-transform ${isOpen ? '' : '-rotate-90'}`} 
            />
          </button>
          <strong className="uppercase text-sm text-gray-700 dark:text-gray-300">{node.text}</strong>
        </div>
      );
    }
    
    // Render document node
    const qcStatus = node.data?.qc_json?.status;
    
    return (
      <div 
        style={{ marginLeft: depth * 16 }} 
        className={`flex items-center gap-2 py-2 px-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded ${
          selected.has(node.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        }`}
      >
        <input 
          type="checkbox" 
          checked={selected.has(node.id)} 
          onChange={() => toggleSelect(node.id)} 
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        
        {/* QC Status Badge */}
        {qcStatus === 'passed' ? (
          <CheckCircle size={16} className="text-emerald-500" />
        ) : qcStatus === 'failed' ? (
          <XCircle size={16} className="text-red-500" />
        ) : (
          <AlertTriangle size={16} className="text-amber-500" />
        )}
        
        <span className="text-sm">{node.text}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Submission Builder 
          <span className="ml-2 px-2 py-1 text-sm bg-gray-200 dark:bg-slate-700 rounded-md">
            {region}
          </span>
        </h1>
        
        <div className="flex gap-2">
          <button 
            onClick={saveOrder}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Order
          </button>
          
          <button 
            onClick={bulkApprove}
            disabled={selected.size === 0}
            className={`px-4 py-2 rounded-md transition-colors ${
              selected.size === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            Bulk Approve + QC {selected.size > 0 && `(${selected.size})`}
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
        <DndProvider backend={HTML5Backend}>
          <Tree 
            tree={tree} 
            rootId={0} 
            render={renderNode} 
            onDrop={handleDrop}
            sort={false}
            insertDroppableFirst={false}
            canDrop={(tree, { dragSource, dropTarget }) => {
              // Only allow dropping documents into folders
              if (!dragSource || !dropTarget) return false;
              return !dragSource.droppable && dropTarget.droppable;
            }}
            dropTargetOffset={5}
          />
        </DndProvider>
      </div>
      
      {/* Guidance Tooltip */}
      <GuidanceTooltip 
        isOpen={guidanceTooltip.isOpen}
        onClose={() => setGuidanceTooltip(prev => ({ ...prev, isOpen: false }))}
        guidance={guidanceTooltip.guidance}
        position={guidanceTooltip.position}
        documentTitle={guidanceTooltip.documentTitle}
        moduleId={guidanceTooltip.moduleId}
      />
    </div>
  );
}

// Helper function to fetch JSON data
async function fetchJson(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('fetch failed');
  return r.json();
}