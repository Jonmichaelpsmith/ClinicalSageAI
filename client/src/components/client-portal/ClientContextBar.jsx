import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Building, 
  Users, 
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
import { Badge } from '@/components/ui/badge';
import { useTenant } from '../../contexts/TenantContext';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

/**
 * ClientContextBar Component
 * 
 * Provides organization and client workspace switching functionality.
 */
const ClientContextBar = () => {
  const [location, setLocation] = useLocation();
  const { 
    organizationId, 
    setOrganizationId, 
    clientWorkspaceId, 
    setClientWorkspaceId 
  } = useTenant();
  const { activeModule, setActiveModule } = useIntegration();
  
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [clients, setClients] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [currentClient, setCurrentClient] = useState(null);
  
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
            await loadClients(savedOrg.id);
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
  
  // Load clients for the selected organization
  const loadClients = async (orgId) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Sample client data
      const sampleClients = [
        { 
          id: 'client-1', 
          name: 'Nexus Pharmaceuticals', 
          organizationId: 'org-001',
          logo: '/logos/nexus.png',
          type: 'Pharmaceutical',
          activeProjects: 7,
          tier: 'Enterprise'
        },
        { 
          id: 'client-2', 
          name: 'Genetek Research', 
          organizationId: 'org-001',
          logo: '/logos/genetek.png',
          type: 'Biotech',
          activeProjects: 4,
          tier: 'Premium'  
        },
        { 
          id: 'client-3', 
          name: 'Vitality Therapeutics', 
          organizationId: 'org-001',
          logo: '/logos/vitality.png',
          type: 'Pharmaceutical',
          activeProjects: 2,
          tier: 'Standard'
        },
        { 
          id: 'client-4', 
          name: 'CellTech Innovations', 
          organizationId: 'org-002',
          logo: '/logos/celltech.png',
          type: 'Biotech Research',
          activeProjects: 9,
          tier: 'Enterprise'
        }
      ];
      
      // Filter clients by the selected organization
      const filteredClients = sampleClients.filter(
        client => client.organizationId === orgId
      );
      
      setClients(filteredClients);
      
      // If there's a saved client that belongs to this organization, select it
      if (clientWorkspaceId) {
        const savedClient = filteredClients.find(client => client.id === clientWorkspaceId);
        if (savedClient) {
          setCurrentClient(savedClient);
        } else {
          // If the saved client doesn't belong to this organization, clear the selection
          setCurrentClient(null);
          setClientWorkspaceId(null);
        }
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle organization change
  const handleOrganizationChange = async (org) => {
    setCurrentOrganization(org);
    setOrganizationId(org.id);
    setCurrentClient(null);
    setClientWorkspaceId(null);
    await loadClients(org.id);
  };
  
  // Handle client change
  const handleClientChange = (client) => {
    setCurrentClient(client);
    setClientWorkspaceId(client.id);
  };
  
  return (
    <div className="flex items-center space-x-3">
      {/* Organization Switcher */}
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
                <span className="text-xs text-gray-500">{org.type}</span>
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
      
      {/* Client Workspace Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {currentClient ? (
              <>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={currentClient.logo} alt={currentClient.name} />
                  <AvatarFallback>{currentClient.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block">{currentClient.name}</span>
              </>
            ) : (
              <>
                <Users size={16} />
                <span className="hidden md:inline-block">Select Client</span>
              </>
            )}
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Client Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {currentOrganization ? (
            clients.length > 0 ? (
              clients.map((client) => (
                <DropdownMenuItem 
                  key={client.id} 
                  onClick={() => handleClientChange(client)}
                  className={currentClient?.id === client.id ? 'bg-gray-100' : ''}
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={client.logo} alt={client.name} />
                    <AvatarFallback>{client.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span>{client.name}</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500">{client.type}</span>
                      <Badge className="ml-2 text-[10px]" variant="outline">{client.tier}</Badge>
                    </div>
                  </div>
                  {currentClient?.id === client.id && (
                    <CheckCircle className="ml-auto h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>
                <span className="text-gray-500">No clients available</span>
              </DropdownMenuItem>
            )
          ) : (
            <DropdownMenuItem disabled>
              <span className="text-gray-500">Select an organization first</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={!currentOrganization}>
            <Plus size={16} className="mr-2" />
            <span>Add Client</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ClientContextBar;