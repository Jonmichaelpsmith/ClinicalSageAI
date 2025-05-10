import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage 
} from '@/components/ui/breadcrumb';
import { 
  Plus, 
  FileSymlink, 
  Package, 
  Calendar, 
  Search, 
  Filter,
  ArrowUpDown
} from 'lucide-react';

import SubmissionTreeView from '@/components/regulatory/SubmissionTreeView';
import CreateSubmissionDialog from '@/components/regulatory/CreateSubmissionDialog';
import ValidationResultsList from '@/components/regulatory/ValidationResultsList';
import SequenceHeader from '@/components/regulatory/SequenceHeader';
import DocumentUploadDialog from '@/components/regulatory/DocumentUploadDialog';
import { withErrorBoundary } from '@/components/regulatory/ErrorBoundaryWrapper';

/**
 * Regulatory Submissions Hub Page
 * 
 * Main page for the unified Regulatory Submissions Hub that
 * provides IND and eCTD submission management.
 */
const RegulatorySubmissionsPage = () => {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // UI state
  const [selectedTab, setSelectedTab] = useState('active');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Data fetching
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['/api/regulatory-submissions/projects'],
    enabled: selectedTab === 'active' || selectedTab === 'archived'
  });
  
  // Mutations
  const createSubmissionMutation = useMutation({
    mutationFn: (data) => apiRequest('/api/regulatory-submissions/projects', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/regulatory-submissions/projects'] });
      toast({
        title: 'Submission Created',
        description: 'Your new regulatory submission has been created successfully.',
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create submission. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ documentData, file, onProgress }) => {
      // In a real implementation, you would use FormData to upload the file
      // along with the metadata
      const formData = new FormData();
      formData.append('file', file);
      
      // Append all metadata as form fields
      Object.keys(documentData).forEach(key => {
        if (key !== 'file') {
          formData.append(key, documentData[key]);
        }
      });
      
      const moduleId = documentData.moduleId;
      return apiRequest(`/api/regulatory-submissions/modules/${moduleId}/granules`, 'POST', formData);
    },
    onSuccess: (data, variables) => {
      const moduleId = variables.documentData.moduleId;
      queryClient.invalidateQueries({ queryKey: ['/api/regulatory-submissions/modules', moduleId, 'granules'] });
      toast({
        title: 'Document Uploaded',
        description: 'Your document has been uploaded successfully.',
      });
      setIsUploadDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Upload Error',
        description: error.message || 'Failed to upload document. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Handler functions
  const handleCreateSubmission = (data) => {
    createSubmissionMutation.mutate(data);
  };
  
  const handleUploadDocument = (documentData, file, onProgress) => {
    return uploadDocumentMutation.mutateAsync({ documentData, file, onProgress });
  };
  
  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    
    // Auto-expand parent nodes when selecting a child node
    if (node.parentId) {
      setExpandedNodes(prev => ({
        ...prev,
        [node.parentId]: true
      }));
    }
  };
  
  const handleNodeToggle = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Transform raw data into tree structure for the tree view
  const transformDataToTree = (rawProjects) => {
    if (!rawProjects || !Array.isArray(rawProjects)) return [];
    
    return rawProjects
      .filter(project => {
        // Filter based on selected tab
        if (selectedTab === 'active') return project.status === 'active';
        if (selectedTab === 'archived') return project.status === 'archived';
        return true;
      })
      .map(project => {
        // Simulate sequences within each project
        // This would be replaced with actual data in a real implementation
        const sequences = Array(3).fill(0).map((_, i) => ({
          id: `seq-${project.id}-${i}`,
          parentId: project.id,
          name: `Sequence ${i + 1}`,
          type: 'sequence',
          status: i === 0 ? 'draft' : i === 1 ? 'review' : 'submitted',
          children: [
            {
              id: `module-${project.id}-${i}-1`,
              parentId: `seq-${project.id}-${i}`,
              name: 'Module 1: Administrative Information',
              type: 'module',
              status: 'inProgress',
              children: []
            },
            {
              id: `module-${project.id}-${i}-2`,
              parentId: `seq-${project.id}-${i}`,
              name: 'Module 2: Summaries',
              type: 'module',
              status: 'incomplete',
              children: []
            },
            {
              id: `module-${project.id}-${i}-3`,
              parentId: `seq-${project.id}-${i}`,
              name: 'Module 3: Quality',
              type: 'module',
              status: i === 2 ? 'complete' : 'incomplete',
              children: []
            },
            {
              id: `module-${project.id}-${i}-4`,
              parentId: `seq-${project.id}-${i}`,
              name: 'Module 4: Nonclinical Reports',
              type: 'module',
              status: 'incomplete',
              children: []
            },
            {
              id: `module-${project.id}-${i}-5`,
              parentId: `seq-${project.id}-${i}`,
              name: 'Module 5: Clinical Reports',
              type: 'module',
              status: 'incomplete',
              children: []
            }
          ]
        }));
        
        return {
          id: project.id,
          name: project.name,
          type: 'project',
          children: sequences
        };
      });
  };

  // For demo purposes, create mock data if no real data is available
  const mockProjects = [
    {
      id: 'proj-1',
      name: 'IND-123456 for Drug ABC',
      submissionType: 'IND',
      status: 'active',
      createdAt: '2025-01-15T12:00:00Z',
      updatedAt: '2025-03-22T14:30:00Z'
    },
    {
      id: 'proj-2',
      name: 'NDA-789101 for Therapeutic XYZ',
      submissionType: 'NDA',
      status: 'active',
      createdAt: '2025-02-10T09:15:00Z',
      updatedAt: '2025-04-18T11:45:00Z'
    },
    {
      id: 'proj-3',
      name: 'DMF-112233 for Ingredient DEF',
      submissionType: 'DMF',
      status: 'archived',
      createdAt: '2024-11-05T15:30:00Z',
      updatedAt: '2025-01-22T10:00:00Z'
    }
  ];

  // Use mock data for demonstration, replace with actual data in production
  const treeData = transformDataToTree(projects || mockProjects);

  return (
    <div className="container py-6 max-w-screen-xl">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Regulatory Submissions</BreadcrumbPage>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <div className="flex justify-between items-center mt-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Regulatory Submissions Hub
          </h1>
          
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Submission
          </Button>
        </div>
        
        <p className="text-gray-500 mt-1">
          Manage regulatory submissions, including INDs and eCTDs, in a unified workspace.
        </p>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
        
        <TabsContent value="active" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 border rounded-md shadow-sm">
              <div className="p-4 bg-gray-50 border-b font-medium">
                Submission Structure
              </div>
              <div className="h-[calc(100vh-300px)] overflow-auto">
                {isLoadingProjects ? (
                  <div className="p-4 text-center">Loading submissions...</div>
                ) : (
                  <SubmissionTreeView
                    data={treeData}
                    onNodeSelect={handleNodeSelect}
                    selectedNodeId={selectedNode?.id}
                    expandedNodes={expandedNodes}
                    onNodeToggle={handleNodeToggle}
                  />
                )}
              </div>
            </div>
            
            <div className="md:col-span-2">
              {selectedNode ? (
                <div className="space-y-4">
                  {selectedNode.type === 'sequence' && (
                    <SequenceHeader
                      sequence={{
                        sequenceNumber: selectedNode.name.split(' ')[1],
                        description: 'Initial submission',
                        status: selectedNode.status,
                        updatedAt: new Date().toISOString(),
                        submissionDate: selectedNode.status === 'submitted' ? new Date().toISOString() : null
                      }}
                      project={{
                        name: treeData.find(p => p.id === selectedNode.parentId)?.name || 'Unknown Project'
                      }}
                      validationStatus={{
                        errors: 0,
                        warnings: 2
                      }}
                      onSubmit={() => {
                        toast({
                          title: 'Submission Initiated',
                          description: 'Your sequence has been queued for submission.',
                        });
                      }}
                    />
                  )}
                  
                  {selectedNode.type === 'module' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">{selectedNode.name}</h2>
                        <Button onClick={() => setIsUploadDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Document
                        </Button>
                      </div>
                      
                      <Separator />
                      
                      <div className="p-8 text-center border rounded-md bg-gray-50">
                        <p className="text-gray-500">
                          No documents have been added to this module yet.
                        </p>
                        <Button 
                          className="mt-4"
                          onClick={() => setIsUploadDialogOpen(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Document
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {selectedNode.type === 'project' && (
                    <div className="space-y-4">
                      <div className="bg-white border rounded-md p-4">
                        <h2 className="text-xl font-semibold">{selectedNode.name}</h2>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-500">Submission Type</p>
                            <p className="font-medium">
                              {mockProjects.find(p => p.id === selectedNode.id)?.submissionType || 'IND'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-medium">
                              {mockProjects.find(p => p.id === selectedNode.id)?.status || 'Active'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Created</p>
                            <p className="font-medium">
                              {new Date(mockProjects.find(p => p.id === selectedNode.id)?.createdAt || new Date()).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Last Updated</p>
                            <p className="font-medium">
                              {new Date(mockProjects.find(p => p.id === selectedNode.id)?.updatedAt || new Date()).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white border rounded-md p-4">
                        <h3 className="text-lg font-semibold mb-3">Sequences</h3>
                        <div className="space-y-3">
                          {selectedNode.children?.map((sequence) => (
                            <div 
                              key={sequence.id}
                              className="p-3 border rounded-md flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleNodeSelect(sequence)}
                            >
                              <div className="flex items-center">
                                <FileSymlink className="h-5 w-5 mr-3 text-blue-600" />
                                <div>
                                  <p className="font-medium">{sequence.name}</p>
                                  <p className="text-sm text-gray-500">
                                    Last updated {new Date().toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                  ${sequence.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                                    sequence.status === 'review' ? 'bg-blue-100 text-blue-800' : 
                                    'bg-purple-100 text-purple-800'}`}
                                >
                                  {sequence.status.charAt(0).toUpperCase() + sequence.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border rounded-md p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No Submission Selected</h3>
                  <p className="mt-2 text-gray-500">
                    Select a submission, sequence, or module from the tree to view its details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="archived" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 border rounded-md shadow-sm">
              <div className="p-4 bg-gray-50 border-b font-medium">
                Archived Submissions
              </div>
              <div className="h-[calc(100vh-300px)] overflow-auto">
                <SubmissionTreeView
                  data={treeData}
                  onNodeSelect={handleNodeSelect}
                  selectedNodeId={selectedNode?.id}
                  expandedNodes={expandedNodes}
                  onNodeToggle={handleNodeToggle}
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              {selectedNode ? (
                <div className="border rounded-md p-4">
                  <h2 className="text-xl font-semibold">{selectedNode.name}</h2>
                  <p className="mt-2 text-gray-500">
                    This submission has been archived and is read-only.
                  </p>
                </div>
              ) : (
                <div className="border rounded-md p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No Archived Submission Selected</h3>
                  <p className="mt-2 text-gray-500">
                    Select an archived submission from the tree to view its details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="mt-0">
          <div className="border rounded-md p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Submission Templates</h3>
            <p className="mt-2 text-gray-500">
              Create and manage templates for frequently used submission structures.
            </p>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <CreateSubmissionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubmission}
        isLoading={createSubmissionMutation.isPending}
      />
      
      <DocumentUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={handleUploadDocument}
        moduleType={selectedNode?.type === 'module' ? selectedNode.name.split(':')[0].trim() : null}
        isLoading={uploadDocumentMutation.isPending}
      />
    </div>
  );
};

// Export the component with error boundary protection
export default withErrorBoundary(RegulatorySubmissionsPage);