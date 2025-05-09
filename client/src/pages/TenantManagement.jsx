import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../hooks/use-toast';
import { useTenant } from '../contexts/TenantContext';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Users, UserPlus, Settings, MoreHorizontal, Building, Key, RefreshCw,
  Database, Monitor, FileText, CheckCircle2, AlertTriangle, Ban, 
  BarChart3, HardDrive, Plus
} from 'lucide-react';
import { apiRequest } from '../lib/queryClient';

// Form schemas
const tenantFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  slug: z.string().min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens" }),
  domain: z.string().optional(),
  industryType: z.enum(["biotech", "cro", "pharma", "meddevice"]),
  complianceLevel: z.enum(["base", "standard", "enhanced"]).optional(),
  maxUsers: z.coerce.number().int().positive().optional(),
  maxProjects: z.coerce.number().int().positive().optional(),
  maxStorage: z.coerce.number().int().positive().optional()
});

const userFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  role: z.enum(["admin", "manager", "member", "viewer"]),
  title: z.string().optional(),
  department: z.string().optional(),
  sendInvite: z.boolean().default(true)
});

export default function TenantManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTenant, availableTenants, setCurrentTenant } = useTenant();
  const [selectedTenant, setSelectedTenant] = useState(currentTenant);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditTenantOpen, setIsEditTenantOpen] = useState(false);
  const [userFilter, setUserFilter] = useState('');

  // Create form for adding a new tenant
  const addTenantForm = useForm({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      domain: '',
      industryType: 'pharma',
      complianceLevel: 'standard',
      maxUsers: 5,
      maxProjects: 10,
      maxStorage: 5
    }
  });

  // Create form for editing a tenant
  const editTenantForm = useForm({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: selectedTenant?.name || '',
      slug: selectedTenant?.slug || '',
      domain: selectedTenant?.domain || '',
      industryType: selectedTenant?.industryType || 'pharma',
      complianceLevel: selectedTenant?.complianceLevel || 'standard',
      maxUsers: selectedTenant?.maxUsers || 5,
      maxProjects: selectedTenant?.maxProjects || 10,
      maxStorage: selectedTenant?.maxStorage || 5
    }
  });

  // Create form for adding a new user
  const addUserForm = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      name: '',
      role: 'member',
      title: '',
      department: '',
      sendInvite: true
    }
  });

  // Update edit form when selected tenant changes
  useEffect(() => {
    if (selectedTenant) {
      editTenantForm.reset({
        name: selectedTenant.name,
        slug: selectedTenant.slug,
        domain: selectedTenant.domain || '',
        industryType: selectedTenant.industryType || 'pharma',
        complianceLevel: selectedTenant.complianceLevel || 'standard',
        maxUsers: selectedTenant.maxUsers,
        maxProjects: selectedTenant.maxProjects,
        maxStorage: selectedTenant.maxStorage
      });
    }
  }, [selectedTenant, editTenantForm]);

  // If we have a current tenant, use that as the initial selected tenant
  useEffect(() => {
    if (currentTenant && !selectedTenant) {
      setSelectedTenant(currentTenant);
    }
  }, [currentTenant, selectedTenant]);

  // Fetch tenants
  const { 
    data: tenantsData = availableTenants || [],
    isLoading: isLoadingTenants
  } = useQuery({
    queryKey: ['/api/tenants'],
    // In a real app, we'd use a queryFn configured with API calls
    // Using window.fetch overridden by TenantContext to include tenant headers
  });
  
  // Ensure tenants is always an array
  const tenants = Array.isArray(tenantsData) ? tenantsData : [];

  // Fetch users for the selected tenant
  const {
    data: users = [],
    isLoading: isLoadingUsers
  } = useQuery({
    queryKey: ['/api/tenant-users', selectedTenant?.id],
    enabled: !!selectedTenant?.id,
    // In a real app, we'd use a queryFn configured with API calls
  });

  // Fetch stats for the selected tenant
  const {
    data: stats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['/api/tenant-stats', selectedTenant?.id],
    enabled: !!selectedTenant?.id,
    // In a real app, we'd use a queryFn configured with API calls
  });

  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: (data) => apiRequest('/api/tenants', { method: 'POST', data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
      toast({
        title: "Organization created",
        description: `Successfully created organization: ${data.name}`,
      });
      setIsAddTenantOpen(false);
      addTenantForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating organization",
        description: error.message || "Failed to create organization",
        variant: "destructive",
      });
    }
  });

  // Update tenant mutation
  const updateTenantMutation = useMutation({
    mutationFn: (data) => apiRequest(`/api/tenants/${selectedTenant.id}`, { method: 'PATCH', data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenant-stats', selectedTenant?.id] });
      toast({
        title: "Organization updated",
        description: `Successfully updated organization: ${data.name}`,
      });
      setIsEditTenantOpen(false);
      
      // If the current tenant was updated, update it in the context
      if (currentTenant?.id === data.id) {
        setCurrentTenant(data);
      }
    },
    onError: (error) => {
      toast({
        title: "Error updating organization",
        description: error.message || "Failed to update organization",
        variant: "destructive",
      });
    }
  });

  // Generate new API key mutation
  const generateApiKeyMutation = useMutation({
    mutationFn: () => apiRequest(`/api/tenants/${selectedTenant.id}/api-key`, { method: 'POST' }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
      toast({
        title: "API key generated",
        description: `Your new API key: ${data.apiKey}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error generating API key",
        description: error.message || "Failed to generate API key",
        variant: "destructive",
      });
    }
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: (data) => apiRequest('/api/tenant-users', { method: 'POST', data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant-users', selectedTenant?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenant-stats', selectedTenant?.id] });
      toast({
        title: "User added",
        description: `Successfully added user: ${data.name}`,
      });
      setIsAddUserOpen(false);
      addUserForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error adding user",
        description: error.message || "Failed to add user",
        variant: "destructive",
      });
    }
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: ({ organizationId, userId, role }) => 
      apiRequest(`/api/tenant-users/${organizationId}/${userId}`, { 
        method: 'PATCH', 
        data: { role } 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant-users', selectedTenant?.id] });
      toast({
        title: "User role updated",
        description: "Successfully updated user role",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating user role",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    }
  });

  // Remove user mutation
  const removeUserMutation = useMutation({
    mutationFn: ({ organizationId, userId }) => 
      apiRequest(`/api/tenant-users/${organizationId}/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant-users', selectedTenant?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenant-stats', selectedTenant?.id] });
      toast({
        title: "User removed",
        description: "Successfully removed user from organization",
      });
    },
    onError: (error) => {
      toast({
        title: "Error removing user",
        description: error.message || "Failed to remove user",
        variant: "destructive",
      });
    }
  });

  // Filter users based on search input
  const filteredUsers = userFilter
    ? users.filter(user => 
        user.name.toLowerCase().includes(userFilter.toLowerCase()) ||
        user.email.toLowerCase().includes(userFilter.toLowerCase()) ||
        (user.title && user.title.toLowerCase().includes(userFilter.toLowerCase())) ||
        (user.department && user.department.toLowerCase().includes(userFilter.toLowerCase()))
      )
    : users;

  // Form submission handlers
  const onAddTenantSubmit = (data) => {
    createTenantMutation.mutate(data);
  };

  const onEditTenantSubmit = (data) => {
    updateTenantMutation.mutate(data);
  };

  const onAddUserSubmit = (data) => {
    addUserMutation.mutate(data);
  };

  const handleGenerateApiKey = () => {
    generateApiKeyMutation.mutate();
  };

  const handleUpdateUserRole = (userId, role) => {
    updateUserRoleMutation.mutate({ 
      organizationId: selectedTenant.id, 
      userId, 
      role 
    });
  };

  const handleRemoveUser = (userId) => {
    if (window.confirm('Are you sure you want to remove this user from the organization?')) {
      removeUserMutation.mutate({ 
        organizationId: selectedTenant.id, 
        userId 
      });
    }
  };

  // Render loading state
  if (isLoadingTenants && tenants.length === 0) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Organization Management</h1>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Organization Management</h1>
        <Dialog open={isAddTenantOpen} onOpenChange={setIsAddTenantOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Create a new tenant organization for your users.
              </DialogDescription>
            </DialogHeader>
            <Form {...addTenantForm}>
              <form onSubmit={addTenantForm.handleSubmit(onAddTenantSubmit)} className="space-y-4">
                <FormField
                  control={addTenantForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Medical Devices" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addTenantForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="acme-medical" {...field} />
                      </FormControl>
                      <FormDescription>
                        Used in URLs and API references
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addTenantForm.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="acme-medical.example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Custom domain for tenant access
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addTenantForm.control}
                  name="industryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue>
                              {field.value === 'biotech' && 'Biotech'}
                              {field.value === 'cro' && 'CRO'}
                              {field.value === 'pharma' && 'Pharmaceutical'}
                              {field.value === 'meddevice' && 'Medical Device'}
                              {!field.value && 'Select industry type'}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="biotech">Biotech</SelectItem>
                          <SelectItem value="cro">CRO</SelectItem>
                          <SelectItem value="pharma">Pharmaceutical</SelectItem>
                          <SelectItem value="meddevice">Medical Device</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Industry-specific features and compliance
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addTenantForm.control}
                  name="complianceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compliance Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue>
                              {field.value === 'base' && 'Base'}
                              {field.value === 'standard' && 'Standard'}
                              {field.value === 'enhanced' && 'Enhanced'}
                              {!field.value && 'Select compliance level'}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="base">Base</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="enhanced">Enhanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Level of compliance controls and documentation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={addTenantForm.control}
                    name="maxUsers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Users</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addTenantForm.control}
                    name="maxProjects"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Projects</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addTenantForm.control}
                    name="maxStorage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Storage (GB)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createTenantMutation.isPending}>
                    {createTenantMutation.isPending ? "Creating..." : "Create Organization"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Organization selector */}
      <div className="flex items-center space-x-4">
        <Select 
          value={selectedTenant?.id?.toString()} 
          onValueChange={(value) => {
            const tenant = tenants.find(t => t.id.toString() === value);
            setSelectedTenant(tenant);
          }}
        >
          <SelectTrigger className="w-[260px]">
            <SelectValue>
              {selectedTenant ? (
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2 opacity-70" />
                  {selectedTenant.name}
                </div>
              ) : 'Select an organization'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tenants.map((tenant) => (
              <SelectItem key={tenant.id} value={tenant.id.toString()}>
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2 opacity-70" />
                  {tenant.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedTenant && (
          <Dialog open={isEditTenantOpen} onOpenChange={setIsEditTenantOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Organization</DialogTitle>
                <DialogDescription>
                  Update organization settings and quotas.
                </DialogDescription>
              </DialogHeader>
              <Form {...editTenantForm}>
                <form onSubmit={editTenantForm.handleSubmit(onEditTenantSubmit)} className="space-y-4">
                  <FormField
                    control={editTenantForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editTenantForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Slug</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Used in URLs and API references
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editTenantForm.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domain (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Custom domain for tenant access
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editTenantForm.control}
                    name="industryType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue>
                                {field.value === 'biotech' && 'Biotech'}
                                {field.value === 'cro' && 'CRO'}
                                {field.value === 'pharma' && 'Pharmaceutical'}
                                {field.value === 'meddevice' && 'Medical Device'}
                                {!field.value && 'Select industry type'}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="biotech">Biotech</SelectItem>
                            <SelectItem value="cro">CRO</SelectItem>
                            <SelectItem value="pharma">Pharmaceutical</SelectItem>
                            <SelectItem value="meddevice">Medical Device</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Industry-specific features and compliance
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editTenantForm.control}
                    name="complianceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compliance Level</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue>
                                {field.value === 'base' && 'Base'}
                                {field.value === 'standard' && 'Standard'}
                                {field.value === 'enhanced' && 'Enhanced'}
                                {!field.value && 'Select compliance level'}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="base">Base</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="enhanced">Enhanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Level of compliance controls and documentation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={editTenantForm.control}
                      name="maxUsers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Users</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editTenantForm.control}
                      name="maxProjects"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Projects</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editTenantForm.control}
                      name="maxStorage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Storage (GB)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={updateTenantMutation.isPending}>
                      {updateTenantMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
        
        {selectedTenant && (
          <Button variant="outline" onClick={handleGenerateApiKey} disabled={generateApiKeyMutation.isPending}>
            <Key className="w-4 h-4 mr-2" />
            {generateApiKeyMutation.isPending ? "Generating..." : "Generate API Key"}
          </Button>
        )}
      </div>

      {selectedTenant && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    User Accounts
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="h-6 w-12 bg-muted rounded animate-pulse"></div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats?.userCount || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.quotaInfo?.users?.percentage || 0}% of allocation used
                      </p>
                      <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${stats?.quotaInfo?.users?.percentage || 0}%` }}
                        ></div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Projects
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="h-6 w-12 bg-muted rounded animate-pulse"></div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats?.projectCount || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.quotaInfo?.projects?.percentage || 0}% of allocation used
                      </p>
                      <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${stats?.quotaInfo?.projects?.percentage || 0}%` }}
                        ></div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Storage Used
                  </CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="h-6 w-12 bg-muted rounded animate-pulse"></div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats?.quotaInfo?.storage?.used || 0} GB</div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.quotaInfo?.storage?.percentage || 0}% of allocation used
                      </p>
                      <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${stats?.quotaInfo?.storage?.percentage || 0}%` }}
                        ></div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Recent projects in this organization</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : stats?.recentProjects?.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Documents</TableHead>
                          <TableHead>Last Activity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.recentProjects.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell className="font-medium">{project.name}</TableCell>
                            <TableCell>{project.docsCount}</TableCell>
                            <TableCell>{new Date(project.lastActivity).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No projects found
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                  <CardDescription>Industry and compliance information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Industry Type</span>
                    <Badge variant="outline" className="capitalize">{selectedTenant.industryType || 'N/A'}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Compliance Level</span>
                    <Badge variant="secondary" className="capitalize">{selectedTenant.complianceLevel || 'standard'}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Established Date</span>
                    <span className="text-sm">{new Date(selectedTenant.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" className="w-full">
                      Manage Organization
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <CardTitle>Organization Users</CardTitle>
                  <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                          Add a new user to the organization.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...addUserForm}>
                        <form onSubmit={addUserForm.handleSubmit(onAddUserSubmit)} className="space-y-4">
                          <FormField
                            control={addUserForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="user@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addUserForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={addUserForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Job Title (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Project Manager" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={addUserForm.control}
                              name="department"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Department (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Research" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={addUserForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  This controls the user's permission level
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addUserForm.control}
                            name="sendInvite"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="h-4 w-4 text-primary border-gray-300 rounded"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Send invitation email</FormLabel>
                                  <FormDescription>
                                    Send an email inviting the user to join the organization
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit" disabled={addUserMutation.isPending}>
                              {addUserMutation.isPending ? "Adding..." : "Add User"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription>
                  Manage users in this organization and their access levels.
                </CardDescription>
                <div className="relative">
                  <Input
                    placeholder="Search users..."
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="pl-8"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-12">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.userId}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.title || '-'}</TableCell>
                            <TableCell>{user.department || '-'}</TableCell>
                            <TableCell>
                              <Select 
                                value={user.role} 
                                onValueChange={(value) => handleUpdateUserRole(user.userId, value)}
                                disabled={updateUserRoleMutation.isPending}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Administrator</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {user.status === 'active' ? (
                                <div className="flex items-center">
                                  <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                                  <span>Active</span>
                                </div>
                              ) : user.status === 'pending' ? (
                                <div className="flex items-center">
                                  <AlertTriangle className="w-4 h-4 mr-1 text-amber-500" />
                                  <span>Pending</span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <Ban className="w-4 h-4 mr-1 text-slate-500" />
                                  <span>Inactive</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    disabled={removeUserMutation.isPending}
                                    onClick={() => handleRemoveUser(user.userId)}
                                    className="text-red-600"
                                  >
                                    Remove from Organization
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No users found
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {filteredUsers.length} users {userFilter ? '(filtered)' : ''}
                </div>
                {stats && (
                  <div className="text-sm text-muted-foreground">
                    Using {stats.userCount} of {stats.quotaInfo?.users?.total} available seats
                  </div>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                  All projects in this organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : stats?.recentProjects?.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(project.lastActivity).toLocaleDateString()}</TableCell>
                          <TableCell>{project.docsCount}</TableCell>
                          <TableCell className="text-right">
                            <Badge>Active</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                    <h3 className="mt-4 text-lg font-medium">No projects yet</h3>
                    <p className="mt-2 mb-4 text-sm text-muted-foreground">
                      Create a new project to start working on your clinical evaluations.
                    </p>
                    <Button variant="outline">Create Project</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Settings</CardTitle>
                  <CardDescription>
                    Manage organization-wide settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Organization ID</h3>
                    <div className="flex items-center space-x-2">
                      <code className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-sm">
                        {selectedTenant.id}
                      </code>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Organization Slug</h3>
                    <div className="flex items-center space-x-2">
                      <code className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-sm">
                        {selectedTenant.slug}
                      </code>
                    </div>
                  </div>
                  {selectedTenant.domain && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Custom Domain</h3>
                      <div className="flex items-center space-x-2">
                        <code className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-sm">
                          {selectedTenant.domain}
                        </code>
                      </div>
                    </div>
                  )}
                  <div className="pt-4">
                    <Button variant="outline" onClick={() => setIsEditTenantOpen(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Organization Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>API Integration</CardTitle>
                  <CardDescription>
                    Manage API keys and integration settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">API Key</h3>
                    <div className="flex items-center space-x-2">
                      <code className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-sm w-full truncate">
                        {selectedTenant.apiKey || 'No API key generated'}
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This key provides full access to the organization's data.
                    </p>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" onClick={handleGenerateApiKey} disabled={generateApiKeyMutation.isPending}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {generateApiKeyMutation.isPending ? "Generating..." : "Regenerate API Key"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>
                    These actions are destructive and cannot be undone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border border-red-200 rounded-md p-4">
                    <h3 className="text-lg font-medium text-red-600">Delete Organization</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      This will permanently delete the organization and all its data, including projects, documents, and user assignments.
                      This action cannot be undone.
                    </p>
                    <Button variant="destructive">
                      Delete Organization
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}