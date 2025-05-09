/**
 * Organization Switcher Component
 * 
 * This component provides an interface for switching between organizations
 * in the multi-tenant TrialSage platform, using the shadcn/ui design system.
 */
import React, { useState, useEffect } from 'react';
import { useTenant, Tenant } from '../../contexts/TenantContext';
import { Organization, organizationService } from '../../services/OrganizationService';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Building, BadgeCheck, Globe, Check, Users, Server, Briefcase, BarChart } from 'lucide-react';

interface OrganizationCard {
  organization: Organization;
  isCurrent: boolean;
  onSelect: (orgId: number) => void;
}

// Organization Card component for each organization in the list
const OrganizationCard: React.FC<OrganizationCard> = ({ organization, isCurrent, onSelect }) => {
  // Get organization type icon
  const getOrgIcon = () => {
    switch (organization.tier?.toLowerCase()) {
      case 'enterprise':
        return <Building size={24} className="text-indigo-500" />;
      case 'professional':
        return <Briefcase size={24} className="text-purple-500" />;
      case 'standard':
        return <Server size={24} className="text-blue-500" />;
      default:
        return <Building size={24} className="text-gray-500" />;
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-all cursor-pointer ${
        isCurrent
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border hover:border-primary/50 hover:shadow-sm'
      }`}
      onClick={() => onSelect(organization.id)}
    >
      <div className="flex items-start space-x-4">
        <div className="rounded-md bg-background p-2 border">
          {getOrgIcon()}
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              {organization.name}
              {organization.status === 'active' && isCurrent && (
                <Badge variant="outline" className="text-xs gap-1 items-center">
                  <Check size={10} />
                  Current
                </Badge>
              )}
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {organization.tier}
            </Badge>
            
            {organization.role && (
              <Badge variant="outline" className="text-xs">
                {organization.role}
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
            {organization.userCount !== undefined && (
              <div className="flex items-center gap-1">
                <Users size={12} />
                <span>{organization.userCount} users</span>
              </div>
            )}
            
            {organization.projectCount !== undefined && (
              <div className="flex items-center gap-1">
                <BarChart size={12} />
                <span>{organization.projectCount} projects</span>
              </div>
            )}
          </div>
        </div>
        
        {isCurrent && (
          <BadgeCheck size={16} className="text-primary" />
        )}
      </div>
    </div>
  );
};

export function OrganizationSwitcher() {
  const { toast } = useToast();
  const { currentTenant, setCurrentTenant, availableTenants, refreshTenants } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    slug: '',
    domain: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load detailed organization data
  useEffect(() => {
    const loadOrganizations = async () => {
      if (isOpen && availableTenants.length > 0) {
        try {
          setIsLoading(true);
          const orgs = await Promise.all(
            availableTenants.map(tenant => 
              organizationService.getOrganizationDetails(tenant.id)
            )
          );
          setOrganizations(orgs);
        } catch (error) {
          console.error('Error loading organizations:', error);
          toast({
            title: 'Error loading organizations',
            description: 'Could not load organization details. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadOrganizations();
  }, [isOpen, availableTenants]);

  // Filter organizations based on search query
  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (org.domain && org.domain.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle organization selection
  const handleSelectOrganization = async (orgId: number) => {
    try {
      const selectedOrg = organizations.find(org => org.id === orgId);
      if (!selectedOrg) return;

      const tenant = organizationService.toTenant(selectedOrg);
      setCurrentTenant(tenant);
      setIsOpen(false);
      
      toast({
        title: 'Organization changed',
        description: `You are now using ${selectedOrg.name}`,
      });
      
      // Reload the page to refresh data for the new organization
      window.location.reload();
    } catch (error) {
      console.error('Error switching organization:', error);
      toast({
        title: 'Failed to switch organization',
        description: 'Could not change the active organization. Please try again.',
        variant: 'destructive',
      });
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
      });
      
      // Close create dialog
      setShowCreateDialog(false);
      
      // Reset form
      setNewOrgData({ name: '', slug: '', domain: '' });
      
      // Refresh tenants list
      await refreshTenants();
      
      // Switch to the new organization
      const tenant = organizationService.toTenant(newOrg);
      setCurrentTenant(tenant);
      
      toast({
        title: 'Organization created',
        description: `${newOrg.name} has been created successfully.`,
      });
      
      // Close organization switcher
      setIsOpen(false);
      
      // Reload the page to refresh data for the new organization
      window.location.reload();
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

  // Generate slug from name
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

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Building size={16} />
        <span className="max-w-32 truncate">
          {currentTenant?.name || 'Select Organization'}
        </span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Switch Organization</DialogTitle>
            <DialogDescription>
              Select an organization to work with or create a new one.
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <ScrollArea className="h-[400px] mt-2">
            <div className="grid gap-4 p-1">
              {isLoading ? (
                <div className="flex items-center justify-center h-24">
                  <p className="text-muted-foreground">Loading organizations...</p>
                </div>
              ) : filteredOrganizations.length > 0 ? (
                filteredOrganizations.map(org => (
                  <OrganizationCard
                    key={org.id}
                    organization={org}
                    isCurrent={currentTenant?.id === org.id}
                    onSelect={handleSelectOrganization}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                  <Building size={24} className="mb-2" />
                  <p>No organizations found</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setIsOpen(false);
                setShowCreateDialog(true);
              }}
            >
              Create New Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for creating a new organization */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to your account.
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
    </>
  );
}