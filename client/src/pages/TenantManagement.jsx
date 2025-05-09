import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import UnifiedTopNavV3 from '../components/navigation/UnifiedTopNavV3';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { 
  Building, 
  Users, 
  Settings, 
  Shield, 
  Key, 
  Database, 
  FileText, 
  Globe,
  Trash,
  Edit,
  UserPlus,
  PlusCircle,
  RefreshCw 
} from 'lucide-react';
import { apiRequest } from '../lib/queryClient';
import { Skeleton } from '../components/ui/skeleton';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

// Form schemas for validation
const organizationFormSchema = z.object({
  name: z.string().min(3, { message: 'Organization name must be at least 3 characters' }),
  slug: z.string().min(2, { message: 'Slug must be at least 2 characters' })
    .regex(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' }),
  domain: z.string().optional(),
  tier: z.enum(['standard', 'professional', 'enterprise']),
  maxUsers: z.coerce.number().positive().optional(),
  maxProjects: z.coerce.number().positive().optional(),
  maxStorage: z.coerce.number().positive().optional(),
});

const userFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  role: z.enum(['admin', 'manager', 'member', 'viewer']),
  title: z.string().optional(),
  department: z.string().optional(),
  sendInvite: z.boolean().default(true),
});

const roleUpdateSchema = z.object({
  role: z.enum(['admin', 'manager', 'member', 'viewer']),
});

export default function TenantManagement() {
  const [activeTab, setActiveTab] = useState('general');
  const { currentTenant, setCurrentTenant, availableTenants } = useTenant();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Organization form setup
  const organizationForm = useForm({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: currentTenant?.name || '',
      slug: currentTenant?.slug || '',
      domain: currentTenant?.domain || '',
      tier: currentTenant?.tier || 'standard',
      maxUsers: currentTenant?.maxUsers || 5,
      maxProjects: currentTenant?.maxProjects || 10,
      maxStorage: currentTenant?.maxStorage || 5,
    },
  });

  // Update form when current tenant changes
  useEffect(() => {
    if (currentTenant) {
      organizationForm.reset({
        name: currentTenant.name,
        slug: currentTenant.slug,
        domain: currentTenant.domain || '',
        tier: currentTenant.tier || 'standard',
        maxUsers: currentTenant.maxUsers || 5,
        maxProjects: currentTenant.maxProjects || 10,
        maxStorage: currentTenant.maxStorage || 5,
      });
    }
  }, [currentTenant]);

  // Add user form setup
  const addUserForm = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      name: '',
      role: 'member',
      title: '',
      department: '',
      sendInvite: true,
    },
  });

  // User role update form
  const roleUpdateForm = useForm({
    resolver: zodResolver(roleUpdateSchema),
    defaultValues: {
      role: 'member',
    },
  });

  // Set role form value when selecting a user
  useEffect(() => {
    if (selectedUser) {
      roleUpdateForm.setValue('role', selectedUser.role);
    }
  }, [selectedUser]);

  // Fetch organization data
  const { data: organizationData, isLoading: isLoadingOrg } = useQuery({
    queryKey: ['/api/tenants', currentTenant?.id],
    enabled: !!currentTenant?.id,
  });

  // Fetch organization users
  const { data: organizationUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/tenant-users', currentTenant?.id],
    enabled: !!currentTenant?.id,
  });

  // Fetch organization usage statistics
  const { data: usageStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/tenant-stats', currentTenant?.id],
    enabled: !!currentTenant?.id,
  });

  // Mutations for data changes
  const updateOrganizationMutation = useMutation({
    mutationFn: (data) => apiRequest(`/api/tenants/${currentTenant.id}`, {
      method: 'PATCH',
      data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
      toast({
        title: 'Organization updated',
        description: 'The organization settings have been updated successfully.',
      });
      setIsEditMode(false);
      
      // Find the updated tenant and update the context
      const updatedTenant = {
        ...currentTenant,
        ...organizationForm.getValues(),
      };
      setCurrentTenant(updatedTenant);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message || 'There was an error updating the organization.',
      });
    },
  });

  const addUserMutation = useMutation({
    mutationFn: (data) => apiRequest('/api/tenant-users', {
      method: 'POST',
      data: {
        ...data,
        organizationId: currentTenant.id,
      },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant-users', currentTenant?.id] });
      toast({
        title: 'User added',
        description: 'The user has been added to the organization.',
      });
      setIsAddUserDialogOpen(false);
      addUserForm.reset();
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to add user',
        description: error.message || 'There was an error adding the user.',
      });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: (data) => apiRequest(`/api/tenant-users/${currentTenant.id}/${selectedUser.userId}`, {
      method: 'PATCH',
      data: {
        role: data.role,
      },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant-users', currentTenant?.id] });
      toast({
        title: 'Role updated',
        description: `${selectedUser.name}'s role has been updated to ${roleUpdateForm.getValues().role}.`,
      });
      setIsRoleDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update role',
        description: error.message || 'There was an error updating the user role.',
      });
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: (userId) => apiRequest(`/api/tenant-users/${currentTenant.id}/${userId}`, {
      method: 'DELETE',
    }),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant-users', currentTenant?.id] });
      toast({
        title: 'User removed',
        description: 'The user has been removed from the organization.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to remove user',
        description: error.message || 'There was an error removing the user.',
      });
    },
  });

  const generateApiKeyMutation = useMutation({
    mutationFn: () => apiRequest(`/api/tenants/${currentTenant.id}/api-key`, {
      method: 'POST',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants', currentTenant?.id] });
      toast({
        title: 'API Key generated',
        description: 'A new API key has been generated for the organization.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to generate API key',
        description: error.message || 'There was an error generating the API key.',
      });
    },
  });

  // Form submission handlers
  const onOrganizationSubmit = (data) => {
    updateOrganizationMutation.mutate(data);
  };

  const onAddUserSubmit = (data) => {
    addUserMutation.mutate(data);
  };

  const onUpdateRoleSubmit = (data) => {
    updateUserRoleMutation.mutate(data);
  };

  // Helper to handle user removal
  const handleRemoveUser = (userId, userName) => {
    if (window.confirm(`Are you sure you want to remove ${userName} from the organization?`)) {
      removeUserMutation.mutate(userId);
    }
  };

  // Helper to open role update dialog
  const openRoleDialog = (user) => {
    setSelectedUser(user);
    setIsRoleDialogOpen(true);
  };

  const generateApiKey = () => {
    if (window.confirm('Are you sure you want to generate a new API key? This will invalidate any existing keys.')) {
      generateApiKeyMutation.mutate();
    }
  };

  // Check if user is editing their own role (not allowed)
  const isCurrentUser = (userId) => {
    // In a real app, you would compare with the authenticated user ID
    return false; // For simplicity, always return false in this example
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedTopNavV3 
        activeTab="Organization" 
        onTabChange={setActiveTab}
        breadcrumbs={['Organization Management']}
      />
      
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organization Management</h1>
            <p className="text-gray-500">Manage your organization settings, users, and permissions</p>
          </div>
          
          {currentTenant && (
            <div className="mt-4 md:mt-0">
              <Badge variant="outline" className="text-sm bg-white shadow-sm">
                {currentTenant.tier.charAt(0).toUpperCase() + currentTenant.tier.slice(1)} Plan
              </Badge>
            </div>
          )}
        </div>

        {currentTenant ? (
          <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="general" className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="api" className="flex items-center gap-1">
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">API Keys</span>
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Usage</span>
              </TabsTrigger>
              <TabsTrigger value="domain" className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Domain</span>
              </TabsTrigger>
              <TabsTrigger value="branding" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Branding</span>
              </TabsTrigger>
            </TabsList>

            {/* General Settings Tab */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Organization Details</CardTitle>
                      <CardDescription>
                        Manage your organization's basic information
                      </CardDescription>
                    </div>
                    <Button 
                      variant={isEditMode ? "outline" : "secondary"}
                      onClick={() => setIsEditMode(!isEditMode)}
                    >
                      {isEditMode ? "Cancel" : "Edit Details"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Form {...organizationForm}>
                    <form 
                      id="organizationForm" 
                      onSubmit={organizationForm.handleSubmit(onOrganizationSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={organizationForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Name</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly={!isEditMode} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={organizationForm.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Slug</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly={!isEditMode} />
                            </FormControl>
                            <FormDescription>
                              Used in URLs and must be unique across the platform.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={organizationForm.control}
                        name="domain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Domain</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="example.com" 
                                readOnly={!isEditMode} 
                              />
                            </FormControl>
                            <FormDescription>
                              Optional. Used for vanity URLs and custom domain login.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={organizationForm.control}
                        name="tier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subscription Tier</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={!isEditMode}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a tier" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="enterprise">Enterprise</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Determines available features and limits.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {isEditMode && (
                        <div className="pt-2">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <FormField
                              control={organizationForm.control}
                              name="maxUsers"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Max Users</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      min={1} 
                                      readOnly={!isEditMode} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={organizationForm.control}
                              name="maxProjects"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Max Projects</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      min={1} 
                                      readOnly={!isEditMode} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={organizationForm.control}
                              name="maxStorage"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Max Storage (GB)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      min={1} 
                                      readOnly={!isEditMode} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormDescription className="mt-2">
                            These limits will override the default tier limits.
                          </FormDescription>
                        </div>
                      )}
                    </form>
                  </Form>
                </CardContent>
                {isEditMode && (
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditMode(false);
                        organizationForm.reset({
                          name: currentTenant.name,
                          slug: currentTenant.slug,
                          domain: currentTenant.domain || '',
                          tier: currentTenant.tier || 'standard',
                          maxUsers: currentTenant.maxUsers || 5,
                          maxProjects: currentTenant.maxProjects || 10,
                          maxStorage: currentTenant.maxStorage || 5,
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      form="organizationForm"
                      disabled={updateOrganizationMutation.isPending}
                    >
                      {updateOrganizationMutation.isPending && (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Organization Users</CardTitle>
                      <CardDescription>
                        Manage users and their roles within the organization
                      </CardDescription>
                    </div>
                    <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add User to Organization</DialogTitle>
                          <DialogDescription>
                            Invite a new user to join your organization. They will receive an email invitation.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...addUserForm}>
                          <form 
                            id="addUserForm" 
                            onSubmit={addUserForm.handleSubmit(onAddUserSubmit)}
                            className="space-y-4 py-4"
                          >
                            <FormField
                              control={addUserForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="user@example.com" />
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
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={addUserForm.control}
                              name="role"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Role</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
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
                                    Sets the user's permissions within the organization.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={addUserForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Job Title (Optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
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
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </form>
                        </Form>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            form="addUserForm"
                            disabled={addUserMutation.isPending}
                          >
                            {addUserMutation.isPending && (
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Add User
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {organizationUsers?.length > 0 ? (
                            organizationUsers.map((user) => (
                              <TableRow key={user.userId}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  <Badge variant={
                                    user.role === 'admin' ? 'destructive' : 
                                    user.role === 'manager' ? 'yellow' : 
                                    user.role === 'member' ? 'outline' : 
                                    'secondary'
                                  }>
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                                    {user.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Settings className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => openRoleDialog(user)}
                                        disabled={isCurrentUser(user.userId)}
                                      >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Change Role
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleRemoveUser(user.userId, user.name)}
                                        disabled={isCurrentUser(user.userId)}
                                        className="text-red-600"
                                      >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Remove User
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                                No users found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                        {organizationUsers?.length > 0 && (
                          <TableFooter>
                            <TableRow>
                              <TableCell colSpan={5} className="text-right">
                                {organizationUsers.length} user{organizationUsers.length !== 1 ? 's' : ''}
                              </TableCell>
                            </TableRow>
                          </TableFooter>
                        )}
                      </Table>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
              
              {/* Role Update Dialog */}
              <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update User Role</DialogTitle>
                    <DialogDescription>
                      {selectedUser && `Change the role for ${selectedUser.name}`}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...roleUpdateForm}>
                    <form 
                      id="roleUpdateForm" 
                      onSubmit={roleUpdateForm.handleSubmit(onUpdateRoleSubmit)}
                      className="space-y-4 py-4"
                    >
                      <FormField
                        control={roleUpdateForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
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
                              <div className="mt-2">
                                <p><strong>Administrator</strong>: Full access to all features and settings</p>
                                <p><strong>Manager</strong>: Can manage projects and users, but not organization settings</p>
                                <p><strong>Member</strong>: Can contribute to projects they're assigned to</p>
                                <p><strong>Viewer</strong>: Read-only access to assigned projects</p>
                              </div>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      form="roleUpdateForm"
                      disabled={updateUserRoleMutation.isPending}
                    >
                      {updateUserRoleMutation.isPending && (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update Role
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>API Keys</CardTitle>
                      <CardDescription>
                        Manage API keys for service integrations
                      </CardDescription>
                    </div>
                    <Button onClick={generateApiKey}>
                      <Key className="mr-2 h-4 w-4" />
                      Generate New API Key
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingOrg ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {organizationData?.apiKey ? (
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">Current API Key</p>
                              <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                                {organizationData.apiKey}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={generateApiKey}>
                              Regenerate
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            This key provides full access to the API on behalf of your organization.
                            Treat it like a password and do not share it publicly.
                          </p>
                        </div>
                      ) : (
                        <div className="text-center p-6 border border-dashed rounded-md">
                          <Key className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <h3 className="text-sm font-medium">No API Key Generated</h3>
                          <p className="text-xs text-gray-500 mb-4">
                            Generate an API key to integrate with external services
                          </p>
                          <Button variant="outline" size="sm" onClick={generateApiKey}>
                            Generate API Key
                          </Button>
                        </div>
                      )}
                      
                      <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md">
                        <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                        <p className="text-xs text-yellow-700 mt-1">
                          API keys provide full access to your organization's data. Always store them securely
                          and use appropriate authentication methods in your integrations.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs would be implemented here */}
            <TabsContent value="statistics">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>
                    Monitor your organization's resource usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col">
                            <div className="text-2xl font-bold">
                              {usageStats?.userCount || 0}
                              <span className="text-gray-400 text-sm ml-1">/ {currentTenant?.maxUsers || 5}</span>
                            </div>
                            <p className="text-sm text-gray-500">Active users</p>
                          </div>
                          <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full" 
                              style={{
                                width: `${Math.min(
                                  ((usageStats?.userCount || 0) / (currentTenant?.maxUsers || 5)) * 100, 
                                  100
                                )}%`
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col">
                            <div className="text-2xl font-bold">
                              {usageStats?.projectCount || 0}
                              <span className="text-gray-400 text-sm ml-1">/ {currentTenant?.maxProjects || 10}</span>
                            </div>
                            <p className="text-sm text-gray-500">Active projects</p>
                          </div>
                          <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full" 
                              style={{
                                width: `${Math.min(
                                  ((usageStats?.projectCount || 0) / (currentTenant?.maxProjects || 10)) * 100, 
                                  100
                                )}%`
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Storage</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col">
                            <div className="text-2xl font-bold">
                              {((usageStats?.storageUsed || 0) / 1024).toFixed(2)}
                              <span className="text-gray-400 text-sm ml-1">/ {currentTenant?.maxStorage || 5} GB</span>
                            </div>
                            <p className="text-sm text-gray-500">Used storage</p>
                          </div>
                          <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full" 
                              style={{
                                width: `${Math.min(
                                  ((usageStats?.storageUsed || 0) / ((currentTenant?.maxStorage || 5) * 1024)) * 100, 
                                  100
                                )}%`
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="domain">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Domain</CardTitle>
                  <CardDescription>
                    Configure a custom domain for your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border p-4 rounded-md">
                      <h3 className="text-sm font-medium">Current Domain Settings</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {currentTenant?.domain ? (
                          <>Your custom domain <span className="font-medium">{currentTenant.domain}</span> is configured.</>
                        ) : (
                          <>No custom domain configured.</>
                        )}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-sm font-medium">Setting Up Your Custom Domain</h3>
                      <ol className="mt-2 space-y-2 text-sm text-gray-600">
                        <li>1. Add your domain in the General tab</li>
                        <li>2. Create a CNAME record with your DNS provider pointing to <code className="bg-gray-100 px-1 py-0.5 rounded">app.trialsage.com</code></li>
                        <li>3. Wait for DNS propagation (may take up to 24 hours)</li>
                        <li>4. Our system will automatically provision an SSL certificate</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="branding">
              <Card>
                <CardHeader>
                  <CardTitle>Branding Settings</CardTitle>
                  <CardDescription>
                    Customize your organization's appearance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Organization Logo</h3>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                          {currentTenant?.logo ? (
                            <img 
                              src={currentTenant.logo} 
                              alt="Organization logo" 
                              className="max-w-full max-h-full p-1" 
                            />
                          ) : (
                            <Building className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <Button variant="outline" size="sm" className="mb-1">
                            Upload Logo
                          </Button>
                          <p className="text-xs text-gray-500">
                            Recommended size: 256x256px (PNG or SVG)
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h3 className="text-sm font-medium mb-2">Theme Colors</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-700">Primary Color</label>
                          <div className="mt-1 flex">
                            <div className="w-8 h-8 rounded-l border border-r-0 border-gray-200 bg-indigo-600" />
                            <Input 
                              defaultValue="#4F46E5" 
                              className="rounded-l-none" 
                              disabled
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700">Secondary Color</label>
                          <div className="mt-1 flex">
                            <div className="w-8 h-8 rounded-l border border-r-0 border-gray-200 bg-gray-800" />
                            <Input 
                              defaultValue="#1F2937" 
                              className="rounded-l-none" 
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Theme customization is available on Enterprise plan
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-16">
            <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700">No Organization Selected</h2>
            <p className="text-gray-500 mb-6">
              Please select an organization to manage from the switcher in the top navigation
            </p>
            {isLoadingOrg && (
              <div className="flex justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}