import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Building, 
  ChevronDown,
  CheckCircle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTenant } from '../../contexts/TenantContext';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

/**
 * OrganizationSwitcher Component
 * 
 * Provides a dropdown for switching between organizations.
 */
const OrganizationSwitcher = () => {
  const [location, setLocation] = useLocation();
  const { organizationId, setOrganizationId } = useTenant();
  const { activeModule, refreshAllModules } = useIntegration();
  
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  
  // Load sample organizations
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoading(true);
        
        // In a real application, this would be an API call
        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Sample data - in a real app, this would come from an API
        const sampleOrgs = [
          { id: 'org-001', name: 'BioTech Solutions', logo: '/logos/biotech.png', type: 'CRO', memberCount: 124 },
          { id: 'org-002', name: 'PharmaGen', logo: '/logos/pharmagen.png', type: 'Sponsor', memberCount: 35 },
          { id: 'org-003', name: 'MediTrial Labs', logo: '/logos/meditrial.png', type: 'CRO', memberCount: 67 }
        ];
        
        setOrganizations(sampleOrgs);
        
        // Select the saved organization if it exists in the list
        if (organizationId) {
          const savedOrg = sampleOrgs.find(org => org.id === organizationId);
          if (savedOrg) {
            setCurrentOrganization(savedOrg);
          }
        }
      } catch (error) {
        console.error('Error loading organizations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrganizations();
  }, [organizationId]);
  
  // Handle organization change
  const handleOrganizationChange = (org) => {
    setCurrentOrganization(org);
    setOrganizationId(org.id);
    
    // Refresh all modules to update with new organization context
    refreshAllModules();
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {currentOrganization ? (
            <>
              <Avatar className="h-6 w-6">
                <AvatarImage src={currentOrganization.logo} alt={currentOrganization.name} />
                <AvatarFallback>{currentOrganization.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block">{currentOrganization.name}</span>
            </>
          ) : (
            <>
              <Building size={16} />
              <span className="hidden md:inline-block">Select Organization</span>
            </>
          )}
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem 
            key={org.id} 
            onClick={() => handleOrganizationChange(org)}
            className={currentOrganization?.id === org.id ? 'bg-gray-100' : ''}
          >
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={org.logo} alt={org.name} />
              <AvatarFallback>{org.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span>{org.name}</span>
              <div className="flex items-center">
                <span className="text-xs text-gray-500">{org.type}</span>
                <span className="text-xs text-gray-500 ml-2">{org.memberCount} Members</span>
              </div>
            </div>
            {currentOrganization?.id === org.id && (
              <CheckCircle className="ml-auto h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Plus size={16} className="mr-2" />
          <span>Add Organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrganizationSwitcher;