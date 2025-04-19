// SubmissionBuilder.tsx – live QC badge updates via WebSocket with regional rule hints
import React, { useEffect, useState, useMemo } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { Tree, NodeModel } from '@minoru/react-dnd-treeview';
import { CheckCircle, XCircle, AlertTriangle, Info, FolderOpen, File, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import update from 'immutability-helper';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

// Region-specific folder structure
const REGION_FOLDERS: Record<string, string[]> = {
  FDA: ['m1', 'm2', 'm3', 'm4', 'm5'],
  EMA: ['m1', 'm2', 'm3', 'm4', 'm5'],
  PMDA: ['m1', 'm2', 'm3', 'm4', 'm5', 'jp-annex'],
};

// Required documents per region/module
const REQUIRED_DOCS: Record<string, Record<string, string[]>> = {
  FDA: {
    'm1': ['Cover Letter', 'Form 1571'],
    'm2.5': ['Clinical Overview'],
    'm2.7': ['Clinical Summary']
  },
  EMA: {
    'm1': ['Cover Letter', 'Application Form', 'Environmental Risk Assessment'],
    'm1.3': ['SmPC', 'Package Leaflet'],
    'm1.10': ['Pediatric Investigation Plan']
  },
  PMDA: {
    'm1': ['Cover Letter', 'Application Form'],
    'm1.13': ['Japanese Labeling'],
    'jp-annex': ['JP Specific Attachment']
  }
};

// Region-specific guidance messages
const REGION_GUIDANCE: Record<string, Record<string, string>> = {
  FDA: {
    'm1': 'FDA requires Form 1571 in Module 1',
    'm2.5': 'Clinical Overview should address US-specific requirements',
    'm3': 'CMC section must follow FDA guidance for content and format',
  },
  EMA: {
    'm1': 'EMA requires EU Application Form and translations for member states',
    'm1.3': 'SmPC and package leaflet must follow QRD template',
    'm1.10': 'PIP or waiver documentation is mandatory',
  },
  PMDA: {
    'm1': 'PMDA requires Japanese translations of key documents',
    'm1.13': 'Japanese labeling is required with specific format',
    'jp-annex': 'Japan-specific documents must be placed in jp-annex folder',
  }
};

interface DocumentData {
  id: number;
  title: string;
  module: string;
  qc_json?: { status: string };
  file_type?: string;
  date_uploaded?: string;
}

type Doc = DocumentData;
type Node = NodeModel<Doc>;

async function fetchJson(url: string) {
  const res = await fetch(url);
  return res.json();
}

async function postJson(url: string, data: any) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export default function SubmissionBuilder({ region = 'FDA' }: { region?: string }) {
  const [tree, setTree] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [qcInProgress, setQcInProgress] = useState(false);
  const [missingDocuments, setMissingDocuments] = useState<Record<string, string[]>>({});
  const [activeTab, setActiveTab] = useState(region);

  // --- QC WebSocket live updates ---
  useEffect(() => {
    const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/qc`);
    
    ws.onopen = () => {
      console.log('QC WebSocket connection established');
    };
    
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        console.log('QC update received:', data);
        
        // Update the tree with new QC status
        setTree(prev => prev.map(n => 
          n.id === data.id ? 
          { ...n, data: { ...n.data, qc_json: { status: data.status } } } : n
        ));
        
        // Show toast notification for the update
        const docTitle = tree.find(n => n.id === data.id)?.text || 'Document';
        toast.info(`QC ${data.status === 'passed' ? 'Passed' : 'Failed'}: ${docTitle}`);
      } catch (e) {
        console.error('Error processing QC message:', e);
      }
    };
    
    ws.onerror = (error) => {
      console.warn('QC WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('QC WebSocket connection closed');
    };
    
    return () => {
      console.log('Closing QC WebSocket connection');
      ws.close();
    };
  }, [tree]);

  // Load documents and check for missing required docs
  useEffect(() => {
    (async () => {
      try {
        // Fetch documents from API
        const docs: Doc[] = await fetchJson('/api/documents?status=approved_or_qc_failed');
        console.log(`Loaded ${docs.length} documents`);
        
        // Create tree structure
        const root: Node = { id: 0, parent: 0, text: 'root', droppable: true };
        const folders = REGION_FOLDERS[region].map((m, idx) => ({ 
          id: 10_000 + idx, 
          parent: 0, 
          text: m, 
          droppable: true 
        }));
        
        // Map documents to tree nodes
        const items = docs.map(d => ({
          id: d.id,
          parent: folders.find(f => d.module.startsWith(f.text))?.id || folders[0].id,
          text: d.title,
          droppable: false,
          data: d,
        }));
        
        setTree([root, ...folders, ...items]);
        
        // Check for missing required documents
        const missing: Record<string, string[]> = {};
        
        Object.entries(REQUIRED_DOCS[region] || {}).forEach(([module, requiredDocs]) => {
          const moduleItems = docs.filter(d => d.module.startsWith(module));
          const moduleDocTitles = moduleItems.map(d => d.title);
          
          const missingForModule = requiredDocs.filter(
            docName => !moduleDocTitles.some(title => 
              title.includes(docName) || title === docName
            )
          );
          
          if (missingForModule.length > 0) {
            missing[module] = missingForModule;
          }
        });
        
        setMissingDocuments(missing);
        setLoading(false);
      } catch (error) {
        console.error('Error loading documents:', error);
        toast.error('Failed to load documents. Please try again.');
        setLoading(false);
      }
    })();
  }, [region]);

  // Handle bulk QC approval
  const handleBulkApprove = async () => {
    if (selected.size === 0) {
      toast.warning('No documents selected');
      return;
    }
    
    setQcInProgress(true);
    const selectedIds = Array.from(selected);
    
    try {
      const result = await postJson('/api/documents/bulk_approve', {
        document_ids: selectedIds,
        run_qc: true
      });
      
      toast.success(`${selectedIds.length} documents submitted for QC`);
      // QC updates will come via WebSocket
    } catch (error) {
      console.error('Bulk approve error:', error);
      toast.error('Failed to process bulk approval');
    } finally {
      setQcInProgress(false);
      setSelected(new Set());
    }
  };

  // Handle document selection
  const handleSelect = (id: number) => {
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

  // Handle selecting all documents
  const handleSelectAll = () => {
    const documentIds = tree
      .filter(node => !node.droppable && node.id !== 0)
      .map(node => node.id);
    
    setSelected(new Set(documentIds));
  };

  // Handle deselecting all documents
  const handleDeselectAll = () => {
    setSelected(new Set());
  };

  // Render tree nodes with QC badges
  const renderNode = ({ node, depth }: { node: Node; depth: number }) => {
    if (node.id === 0) return null; // Don't render root
    
    const isFolder = node.droppable;
    const nodeData = node.data as Doc | undefined;
    const moduleKey = isFolder ? node.text.toString() : '';
    const hasRequiredMissing = isFolder && missingDocuments[moduleKey]?.length > 0;
    const regionGuidance = isFolder ? REGION_GUIDANCE[region]?.[moduleKey] : '';
    
    // QC status badge
    const renderQcBadge = () => {
      if (isFolder) return null;
      
      const status = nodeData?.qc_json?.status;
      
      if (status === 'passed') {
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      } else if (status === 'failed') {
        return <XCircle className="h-5 w-5 text-red-500" />;
      } else if (qcInProgress && selected.has(node.id)) {
        return <span className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-500 rounded-full" />;
      }
      
      return <Info className="h-5 w-5 text-gray-500" />;
    };
    
    return (
      <div className={`
        flex items-center py-1 ${depth > 0 ? 'ml-' + (depth * 4) : ''} 
        ${isFolder ? 'font-semibold' : 'font-normal'}
        ${hasRequiredMissing ? 'text-red-600' : ''}
      `}>
        {!isFolder && (
          <Checkbox 
            checked={selected.has(node.id)}
            onCheckedChange={() => handleSelect(node.id)}
            className="mr-2"
          />
        )}
        
        {isFolder ? (
          <FolderOpen className={`h-5 w-5 mr-2 ${hasRequiredMissing ? 'text-red-600' : 'text-blue-500'}`} />
        ) : (
          <File className="h-5 w-5 mr-2 text-gray-500" />
        )}
        
        <span className="flex-grow">{node.text}</span>
        
        {/* Region guidance tooltip for folders */}
        {isFolder && regionGuidance && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className={`h-5 w-5 mx-2 ${hasRequiredMissing ? 'text-red-600' : 'text-blue-500'}`} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{regionGuidance}</p>
                {hasRequiredMissing && (
                  <div className="mt-2">
                    <p className="font-semibold text-red-600">Missing required documents:</p>
                    <ul className="list-disc ml-4">
                      {missingDocuments[moduleKey].map(doc => (
                        <li key={doc}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* QC status badge */}
        {renderQcBadge()}
      </div>
    );
  };

  // Switch region handler
  const handleRegionChange = (newRegion: string) => {
    setActiveTab(newRegion);
    window.location.href = `/submission-builder?region=${newRegion}`;
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Submission Builder</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Document Tree</CardTitle>
                <Tabs value={activeTab} onValueChange={handleRegionChange}>
                  <TabsList>
                    <TabsTrigger value="FDA">FDA</TabsTrigger>
                    <TabsTrigger value="EMA">EMA</TabsTrigger>
                    <TabsTrigger value="PMDA">PMDA</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <CardDescription>
                Drag and drop documents to organize your {region} submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                <div className="border rounded-md p-4">
                  <div className="flex justify-between mb-4">
                    <div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSelectAll}
                        className="mr-2"
                      >
                        Select All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleDeselectAll}
                      >
                        Deselect All
                      </Button>
                    </div>
                    <Button 
                      onClick={handleBulkApprove} 
                      disabled={selected.size === 0 || qcInProgress}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {qcInProgress ? (
                        <>
                          <span className="mr-2">Processing</span>
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        </>
                      ) : (
                        `Bulk Approve + QC (${selected.size})`
                      )}
                    </Button>
                  </div>
                  
                  <DndProvider backend={HTML5Backend}>
                    <Tree
                      tree={tree}
                      rootId={0}
                      render={renderNode}
                      onDrop={(newTree) => setTree(newTree)}
                      dragPreviewRender={(monitorProps) => (
                        <div className="bg-blue-100 p-2 rounded border border-blue-300">
                          {monitorProps.item.text}
                        </div>
                      )}
                      classes={{
                        root: 'min-h-[400px]',
                        container: 'gap-1',
                        dropTarget: 'bg-blue-50',
                      }}
                    />
                  </DndProvider>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{region} Submission Guidance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-500 mb-2">REGION REQUIREMENTS</h3>
                  <div className="space-y-2">
                    {Object.entries(REGION_GUIDANCE[region] || {}).map(([module, guidance]) => (
                      <div key={module} className="flex items-start">
                        <ArrowRight className="h-4 w-4 mr-2 mt-1 text-blue-500" />
                        <div>
                          <p className="font-semibold">{module.toUpperCase()}</p>
                          <p className="text-sm text-gray-600">{guidance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-sm text-gray-500 mb-2">MISSING DOCUMENTS</h3>
                  {Object.keys(missingDocuments).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(missingDocuments).map(([module, docs]) => (
                        <div key={module} className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="font-semibold text-red-700">{module.toUpperCase()}</p>
                          <ul className="ml-4 list-disc text-sm text-red-600">
                            {docs.map(doc => (
                              <li key={doc}>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-green-600">All required documents present!</p>
                  )}
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-sm text-gray-500 mb-2">QC STATUS</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Passed:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {tree.filter(n => n.data?.qc_json?.status === 'passed').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Failed:</span>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {tree.filter(n => n.data?.qc_json?.status === 'failed').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending:</span>
                      <Badge variant="outline" className="bg-gray-50 text-gray-700">
                        {tree.filter(n => !n.data?.qc_json?.status && !n.droppable).length}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Progress 
                      value={
                        tree.filter(n => n.data?.qc_json?.status === 'passed').length / 
                        tree.filter(n => !n.droppable && n.id !== 0).length * 100 || 0
                      } 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}