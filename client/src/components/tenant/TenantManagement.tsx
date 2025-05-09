/**
 * Tenant Management Dashboard
 * 
 * This component provides administrative controls for managing tenants/organizations
 * in the multi-tenant TrialSage platform.
 */
import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { Organization, organizationService } from '../../services/OrganizationService';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ExtendedBadge } from '@/components/ui/badge-variants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCcw,
  UserPlus,
  Key,
  ShieldAlert,
  Users,
  Briefcase,
  HardDrive,
  Search,
  Plus,
  AlertCircle,
  Filter,
} from 'lucide-react';

export function TenantManagement() {
  const { toast } = useToast();
  const { refreshTenants } = useTenant();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    slug: '',
    domain: '',
    tier: 'standard',
  });
  const [editOrgData, setEditOrgData] = useState({
    name: '',
    slug: '',
    domain: '',
    tier: '',
    status: '',
    maxUsers: 0,
    maxProjects: 0,
    maxStorage: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load organizations on component mount
  useEffect(() => {
    loadOrganizations();
  }, []);

  // Apply filters when organizations, search query, or filters change
  useEffect(() => {
    const filtered = organizations.filter(org => {
      // Apply search filter
      const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (org.domain && org.domain.toLowerCase().includes(searchQuery.toLowerCase())) ||
        org.slug.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply status filter
      const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
      
      // Apply tier filter
      const matchesTier = tierFilter === 'all' || org.tier === tierFilter;
      
      return matchesSearch && matchesStatus && matchesTier;
    });
    
    setFilteredOrganizations(filtered);
  }, [organizations, searchQuery, statusFilter, tierFilter]);

  // Load all organizations
  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const orgs = await organizationService.getUserOrganizations();
      
      // Get full details for each organization
      const detailedOrgs = await Promise.all(
        orgs.map(org => organizationService.getOrganizationDetails(org.id))
      );
      
      setOrganizations(detailedOrgs);
      setFilteredOrganizations(detailedOrgs);
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast({
        title: 'Error loading organizations',
        description: 'Could not load organization data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle organization creation
  const handleCreateOrganization = async () => {
    if (!newOrgData.name || !newOrgData.slug) return;
    
    try {
      setIsSubmitting(true);
      
      const newOrg = await organizationService.createOrganization({
        name: newOrgData.name,
        slug: newOrgData.slug,
        domain: newOrgData.domain || undefined,
        tier: newOrgData.tier,
      });
      
      // Close create dialog
      setShowCreateDialog(false);
      
      // Reset form
      setNewOrgData({
        name: '',
        slug: '',
        domain: '',
        tier: 'standard',
      });
      
      // Refresh organization list
      await loadOrganizations();
      
      // Refresh tenants in context
      await refreshTenants();
      
      toast({
        title: 'Organization created',
        description: `${newOrg.name} has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: 'Failed to create organization',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle organization update
  const handleUpdateOrganization = async () => {
    if (!currentOrg || !editOrgData.name || !editOrgData.slug) return;
    
    try {
      setIsSubmitting(true);
      
      const updatedOrg = await organizationService.updateOrganization(
        currentOrg.id,
        {
          name: editOrgData.name,
          slug: editOrgData.slug,
          domain: editOrgData.domain || undefined,
          tier: editOrgData.tier,
          status: editOrgData.status,
          maxUsers: editOrgData.maxUsers,
          maxProjects: editOrgData.maxProjects,
          maxStorage: editOrgData.maxStorage,
        }
      );
      
      // Close edit dialog
      setShowEditDialog(false);
      
      // Reset current org
      setCurrentOrg(null);
      
      // Refresh organization list
      await loadOrganizations();
      
      // Refresh tenants in context
      await refreshTenants();
      
      toast({
        title: 'Organization updated',
        description: `${updatedOrg.name} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: 'Failed to update organization',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit dialog for an organization
  const handleEditOrganization = (org: Organization) => {
    setCurrentOrg(org);
    setEditOrgData({
      name: org.name,
      slug: org.slug,
      domain: org.domain || '',
      tier: org.tier,
      status: org.status,
      maxUsers: org.maxUsers || 5,
      maxProjects: org.maxProjects || 10,
      maxStorage: org.maxStorage || 5,
    });
    setShowEditDialog(true);
  };

  // Generate slug from name for new organizations
  const handleNameChange = (name: string) => {
    setNewOrgData({
      ...newOrgData,
      name,
      slug: name.toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, ''),
    });
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <ExtendedBadge variant="success" className="capitalize">Active</ExtendedBadge>;
      case 'inactive':
        return <ExtendedBadge variant="secondary" className="capitalize">Inactive</ExtendedBadge>;
      case 'suspended':
        return <ExtendedBadge variant="destructive" className="capitalize">Suspended</ExtendedBadge>;
      default:
        return <ExtendedBadge variant="outline" className="capitalize">{status}</ExtendedBadge>;
    }
  };

  // Get tier badge style
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return <Badge variant="default" className="bg-indigo-500 hover:bg-indigo-600 capitalize">Enterprise</Badge>;
      case 'professional':
        return <Badge variant="default" className="bg-purple-500 hover:bg-purple-600 capitalize">Professional</Badge>;
      case 'standard':
        return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 capitalize">Standard</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{tier}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization Management</h2>
          <p className="text-muted-foreground">Manage all organizations in the multi-tenant platform.</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Organization
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
          <TabsList>
            <TabsTrigger value="all">All Organizations</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                className="w-full md:w-64 pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-4">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={tierFilter}
                onValueChange={setTierFilter}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <RefreshCcw className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">Loading organizations...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredOrganizations.length > 0 ? (
                    filteredOrganizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="rounded-md bg-muted p-2">
                              <Building className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-medium">{org.name}</div>
                              <div className="text-xs text-muted-foreground">{org.slug}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(org.status)}</TableCell>
                        <TableCell>{getTierBadge(org.tier)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{org.userCount || 0}</span>
                            <span className="text-xs text-muted-foreground">/ {org.maxUsers || 5}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{org.projectCount || 0}</span>
                            <span className="text-xs text-muted-foreground">/ {org.maxProjects || 10}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{org.maxStorage || 5}</span>
                            <span className="text-xs text-muted-foreground">GB</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditOrganization(org)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Manage Users
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Key className="mr-2 h-4 w-4" />
                                API Keys
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className={org.status === 'active' ? 'text-destructive' : 'text-green-600'}
                              >
                                {org.status === 'active' ? (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">No organizations found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{filteredOrganizations.length}</strong> of <strong>{organizations.length}</strong> organizations
              </div>
              <Button variant="outline" size="sm" onClick={loadOrganizations}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {/* Active organizations table - similar to above but filtered to active only */}
              {/* This is handled by the statusFilter now */}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inactive" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {/* Inactive organizations table - similar to above but filtered to inactive only */}
              {/* This is handled by the statusFilter now */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Create Organization Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to the platform.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="org-name" className="text-right">
                Name
              </Label>
              <Input
                id="org-name"
                value={newOrgData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="col-span-3"
                placeholder="Acme Corporation"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="org-slug" className="text-right">
                Slug
              </Label>
              <Input
                id="org-slug"
                value={newOrgData.slug}
                onChange={(e) => setNewOrgData({
                  ...newOrgData,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                })}
                className="col-span-3"
                placeholder="acme-corporation"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="org-domain" className="text-right">
                Domain
              </Label>
              <Input
                id="org-domain"
                value={newOrgData.domain}
                onChange={(e) => setNewOrgData({
                  ...newOrgData,
                  domain: e.target.value
                })}
                className="col-span-3"
                placeholder="acmecorp.com (optional)"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="org-tier" className="text-right">
                Tier
              </Label>
              <Select
                value={newOrgData.tier}
                onValueChange={(value) => setNewOrgData({
                  ...newOrgData,
                  tier: value
                })}
              >
                <SelectTrigger id="org-tier" className="col-span-3">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrganization}
              disabled={!newOrgData.name || !newOrgData.slug || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Organization'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Organization Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update organization details and settings.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="limits" className="flex-1">Limits & Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="py-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={editOrgData.name}
                    onChange={(e) => setEditOrgData({
                      ...editOrgData,
                      name: e.target.value
                    })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-slug" className="text-right">
                    Slug
                  </Label>
                  <Input
                    id="edit-slug"
                    value={editOrgData.slug}
                    onChange={(e) => setEditOrgData({
                      ...editOrgData,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                    })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-domain" className="text-right">
                    Domain
                  </Label>
                  <Input
                    id="edit-domain"
                    value={editOrgData.domain}
                    onChange={(e) => setEditOrgData({
                      ...editOrgData,
                      domain: e.target.value
                    })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-tier" className="text-right">
                    Tier
                  </Label>
                  <Select
                    value={editOrgData.tier}
                    onValueChange={(value) => setEditOrgData({
                      ...editOrgData,
                      tier: value
                    })}
                  >
                    <SelectTrigger id="edit-tier" className="col-span-3">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={editOrgData.status}
                    onValueChange={(value) => setEditOrgData({
                      ...editOrgData,
                      status: value
                    })}
                  >
                    <SelectTrigger id="edit-status" className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="limits" className="py-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-maxUsers" className="text-right flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Max Users
                  </Label>
                  <Input
                    id="edit-maxUsers"
                    type="number"
                    min={1}
                    value={editOrgData.maxUsers}
                    onChange={(e) => setEditOrgData({
                      ...editOrgData,
                      maxUsers: parseInt(e.target.value) || 0
                    })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-maxProjects" className="text-right flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Max Projects
                  </Label>
                  <Input
                    id="edit-maxProjects"
                    type="number"
                    min={1}
                    value={editOrgData.maxProjects}
                    onChange={(e) => setEditOrgData({
                      ...editOrgData,
                      maxProjects: parseInt(e.target.value) || 0
                    })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-maxStorage" className="text-right flex items-center">
                    <HardDrive className="h-4 w-4 mr-2" />
                    Storage (GB)
                  </Label>
                  <Input
                    id="edit-maxStorage"
                    type="number"
                    min={1}
                    value={editOrgData.maxStorage}
                    onChange={(e) => setEditOrgData({
                      ...editOrgData,
                      maxStorage: parseInt(e.target.value) || 0
                    })}
                    className="col-span-3"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateOrganization}
              disabled={!editOrgData.name || !editOrgData.slug || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}