// client/src/pages/ClientManagement.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { 
  Building2, 
  Plus, 
  Pencil, 
  Trash2, 
  MoreHorizontal, 
  RefreshCw, 
  Settings,
  Users,
  Layers,
  Shield,
  Cog,
  FileCode,
} from 'lucide-react';
import ClientSecuritySettings from '../components/client/ClientSecuritySettings';
import ClientWorkspaceSettings from '../components/client/ClientWorkspaceSettings';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const ClientManagement = () => {
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    slug: '',
    quotaProjects: 10,
    quotaStorageGB: 5
  });

  // Get organization ID from context (would come from your TenantContext)
  const organizationId = '1'; // Placeholder - this would come from TenantContext

  // Fetch clients for the current organization
  const { 
    data: clientsData, 
    isLoading: isLoadingClients,
    isError: isClientsError,
    error: clientsError
  } = useQuery({
    queryKey: ['/api/organizations', organizationId, 'clients'],
    queryFn: () => apiRequest(`/api/organizations/${organizationId}/clients`)
  });

  // Fetch selected client details
  const {
    data: clientDetailData,
    isLoading: isLoadingClientDetail,
  } = useQuery({
    queryKey: ['/api/clients', selectedClient],
    queryFn: () => apiRequest(`/api/clients/${selectedClient}`),
    enabled: !!selectedClient
  });

  // Create a new client
  const createClientMutation = useMutation({
    mutationFn: (clientData) => apiRequest(`/api/organizations/${organizationId}/clients`, {
      method: 'POST',
      data: clientData
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/organizations', organizationId, 'clients']);
      setIsNewClientDialogOpen(false);
      toast({
        title: "Success",
        description: "Client workspace created successfully",
      });
      setNewClientData({
        name: '',
        slug: '',
        quotaProjects: 10,
        quotaStorageGB: 5
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create client workspace",
        variant: "destructive",
      });
    }
  });

  // Update a client
  const updateClientMutation = useMutation({
    mutationFn: (clientData) => apiRequest(`/api/clients/${selectedClient}`, {
      method: 'PATCH',
      data: clientData
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/organizations', organizationId, 'clients']);
      queryClient.invalidateQueries(['/api/clients', selectedClient]);
      setIsEditClientDialogOpen(false);
      toast({
        title: "Success",
        description: "Client workspace updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update client workspace",
        variant: "destructive",
      });
    }
  });

  // Delete a client
  const deleteClientMutation = useMutation({
    mutationFn: () => apiRequest(`/api/clients/${selectedClient}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/organizations', organizationId, 'clients']);
      setSelectedClient(null);
      setIsDeleteConfirmationOpen(false);
      toast({
        title: "Success",
        description: "Client workspace deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete client workspace",
        variant: "destructive",
      });
    }
  });

  const handleCreateClient = () => {
    createClientMutation.mutate({
      ...newClientData,
      organizationId
    });
  };

  const handleUpdateClient = () => {
    updateClientMutation.mutate(newClientData);
  };

  const handleDeleteClient = () => {
    deleteClientMutation.mutate();
  };

  const handleClientClick = (clientId) => {
    setSelectedClient(clientId);
    // Reset form data if we have client details
    if (clientDetailData?.client) {
      setNewClientData({
        name: clientDetailData.client.name,
        slug: clientDetailData.client.slug,
        quotaProjects: clientDetailData.client.quotaProjects,
        quotaStorageGB: clientDetailData.client.quotaStorageGB
      });
    }
  };

  // Loading state
  if (isLoadingClients) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Client Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage client workspaces in your organization
            </p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client Workspaces</CardTitle>
                <CardDescription>Select a client to manage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-9">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isClientsError) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-red-300">
          <CardHeader>
            <CardTitle className="text-lg text-red-500">Error Loading Client Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{clientsError?.message || "Failed to load client workspaces. Please try again later."}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => queryClient.invalidateQueries(['/api/organizations', organizationId, 'clients'])}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For development - show sample clients if none exist
  const clients = clientsData?.clients || [];
  const clientDetail = clientDetailData?.client;

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage client workspaces in your organization
          </p>
        </div>
        <Button onClick={() => setIsNewClientDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Client Workspace
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Client List Sidebar */}
        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client Workspaces</CardTitle>
              <CardDescription>Select a client to manage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {clients.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No client workspaces yet
                </div>
              ) : (
                clients.map(client => (
                  <Button
                    key={client.id}
                    variant={selectedClient === client.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleClientClick(client.id)}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    {client.name}
                  </Button>
                ))
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Client Detail Panel */}
        <div className="md:col-span-9">
          {selectedClient ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl">
                    {isLoadingClientDetail ? <Skeleton className="h-7 w-48" /> : clientDetail?.name}
                  </CardTitle>
                  <CardDescription>
                    {isLoadingClientDetail ? <Skeleton className="h-5 w-32 mt-1" /> : `Slug: ${clientDetail?.slug}`}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditClientDialogOpen(true)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Client
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => setIsDeleteConfirmationOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Client
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="pt-4">
                {isLoadingClientDetail ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-48 w-full" />
                  </div>
                ) : (
                  <Tabs defaultValue="overview">
                    <TabsList className="mb-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="workspace-settings">Workspace Settings</TabsTrigger>
                      <TabsTrigger value="security-settings">Security Settings</TabsTrigger>
                      <TabsTrigger value="quotas">Quotas</TabsTrigger>
                      <TabsTrigger value="users">Users</TabsTrigger>
                      <TabsTrigger value="projects">Projects</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Client Details</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <dl className="grid grid-cols-2 gap-1 text-sm">
                              <dt className="font-medium">Name:</dt>
                              <dd>{clientDetail?.name}</dd>
                              <dt className="font-medium">Slug:</dt>
                              <dd>{clientDetail?.slug}</dd>
                              <dt className="font-medium">Created:</dt>
                              <dd>{new Date(clientDetail?.createdAt || Date.now()).toLocaleDateString()}</dd>
                              <dt className="font-medium">Status:</dt>
                              <dd>
                                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                  Active
                                </Badge>
                              </dd>
                            </dl>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Usage Statistics</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <dl className="grid grid-cols-2 gap-1 text-sm">
                              <dt className="font-medium">Active Projects:</dt>
                              <dd>{clientDetail?.activeProjects || 0}</dd>
                              <dt className="font-medium">Total Documents:</dt>
                              <dd>{clientDetail?.documentCount || 0}</dd>
                              <dt className="font-medium">Storage Used:</dt>
                              <dd>{clientDetail?.storageUsedGB || 0} GB</dd>
                              <dt className="font-medium">Last Activity:</dt>
                              <dd>{clientDetail?.lastActivity ? new Date(clientDetail.lastActivity).toLocaleDateString() : 'Never'}</dd>
                            </dl>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-20 flex flex-col items-center justify-center"
                              onClick={() => document.querySelector('[data-value="workspace-settings"]').click()}
                            >
                              <Cog className="h-5 w-5 mb-1" />
                              <span>Workspace Settings</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-20 flex flex-col items-center justify-center"
                              onClick={() => document.querySelector('[data-value="users"]').click()}
                            >
                              <Users className="h-5 w-5 mb-1" />
                              <span>Manage Users</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-20 flex flex-col items-center justify-center"
                              onClick={() => document.querySelector('[data-value="projects"]').click()}
                            >
                              <Layers className="h-5 w-5 mb-1" />
                              <span>View Projects</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-20 flex flex-col items-center justify-center"
                              onClick={() => document.querySelector('[data-value="security-settings"]').click()}
                            >
                              <Shield className="h-5 w-5 mb-1" />
                              <span>Security Settings</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Workspace Settings Tab */}
                    <TabsContent value="workspace-settings" className="space-y-4">
                      <ClientWorkspaceSettings />
                    </TabsContent>
                    
                    {/* Security Settings Tab */}
                    <TabsContent value="security-settings" className="space-y-4">
                      <ClientSecuritySettings />
                    </TabsContent>
                    
                    <TabsContent value="quotas" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Resource Quotas</CardTitle>
                          <CardDescription>Manage resource limitations for this client workspace</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">Projects</h4>
                                <p className="text-sm text-muted-foreground">Maximum number of active projects</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold">
                                  {clientDetail?.activeProjects || 0} / {clientDetail?.quotaProjects || 10}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {Math.round(((clientDetail?.activeProjects || 0) / (clientDetail?.quotaProjects || 10)) * 100)}% used
                                </div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${Math.min(((clientDetail?.activeProjects || 0) / (clientDetail?.quotaProjects || 10)) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 pt-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">Storage</h4>
                                <p className="text-sm text-muted-foreground">Maximum storage capacity in GB</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold">
                                  {clientDetail?.storageUsedGB || 0} / {clientDetail?.quotaStorageGB || 5} GB
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {Math.round(((clientDetail?.storageUsedGB || 0) / (clientDetail?.quotaStorageGB || 5)) * 100)}% used
                                </div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${Math.min(((clientDetail?.storageUsedGB || 0) / (clientDetail?.quotaStorageGB || 5)) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full">
                            Edit Quotas
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="users" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Client Users</CardTitle>
                          <CardDescription>Manage users for this client workspace</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-6 text-sm text-muted-foreground">
                            User management will be implemented in the next phase
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button disabled variant="outline" className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Add User
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="projects" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Client Projects</CardTitle>
                          <CardDescription>View and manage all projects for this client</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-6 text-sm text-muted-foreground">
                            Project list will be populated in the next phase
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Select a Client Workspace</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a client workspace from the list on the left to view and manage its details
                </p>
                <Button onClick={() => setIsNewClientDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Client Workspace
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Create Client Dialog */}
      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Client Workspace</DialogTitle>
            <DialogDescription>
              Add a new client workspace to your organization. Client workspaces help you organize your projects.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Client Name</label>
              <Input
                id="name"
                value={newClientData.name}
                onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                placeholder="Acme Biotech"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">URL Slug</label>
              <Input
                id="slug"
                value={newClientData.slug}
                onChange={(e) => setNewClientData({...newClientData, slug: e.target.value})}
                placeholder="acme-biotech"
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs and API endpoints. Only lowercase letters, numbers, and hyphens.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="quotaProjects" className="text-sm font-medium">Project Quota</label>
                <Input
                  id="quotaProjects"
                  type="number"
                  value={newClientData.quotaProjects}
                  onChange={(e) => setNewClientData({...newClientData, quotaProjects: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="quotaStorageGB" className="text-sm font-medium">Storage Quota (GB)</label>
                <Input
                  id="quotaStorageGB"
                  type="number"
                  value={newClientData.quotaStorageGB}
                  onChange={(e) => setNewClientData({...newClientData, quotaStorageGB: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewClientDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateClient}
              disabled={!newClientData.name || !newClientData.slug || createClientMutation.isPending}
            >
              {createClientMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Create Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Client Dialog */}
      <Dialog open={isEditClientDialogOpen} onOpenChange={setIsEditClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client Workspace</DialogTitle>
            <DialogDescription>
              Update the details for this client workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Client Name</label>
              <Input
                id="name"
                value={newClientData.name}
                onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">URL Slug</label>
              <Input
                id="slug"
                value={newClientData.slug}
                onChange={(e) => setNewClientData({...newClientData, slug: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs and API endpoints. Only lowercase letters, numbers, and hyphens.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="quotaProjects" className="text-sm font-medium">Project Quota</label>
                <Input
                  id="quotaProjects"
                  type="number"
                  value={newClientData.quotaProjects}
                  onChange={(e) => setNewClientData({...newClientData, quotaProjects: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="quotaStorageGB" className="text-sm font-medium">Storage Quota (GB)</label>
                <Input
                  id="quotaStorageGB"
                  type="number"
                  value={newClientData.quotaStorageGB}
                  onChange={(e) => setNewClientData({...newClientData, quotaStorageGB: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditClientDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateClient}
              disabled={!newClientData.name || !newClientData.slug || updateClientMutation.isPending}
            >
              {updateClientMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Update Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client Workspace</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this client workspace? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{clientDetail?.name}</p>
            <p className="text-sm text-muted-foreground">
              All projects, documents, and data associated with this client will be permanently deleted.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmationOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteClient}
              disabled={deleteClientMutation.isPending}
            >
              {deleteClientMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Delete Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientManagement;