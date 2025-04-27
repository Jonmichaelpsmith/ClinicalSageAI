import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import securityService from '@/services/SecurityService';
import adminService from '@/services/AdminService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Search, UsersIcon, Briefcase, Shield, FileText, Activity, HelpCircle } from 'lucide-react';

/**
 * ClientPortalLanding Component
 * 
 * This is the landing page for the client portal where biotech clients
 * can access their personalized portal. For CRO users with access to 
 * multiple clients, this page allows selecting which client portal to enter.
 */
export default function ClientPortalLanding() {
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoles, setUserRoles] = useState([]);
  const [isCroUser, setIsCroUser] = useState(false);
  const { toast } = useToast();

  // Load client data on component mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Get current user and their roles
        const currentUser = await securityService.getCurrentUser();
        const roles = await securityService.getUserRoles(currentUser.id);
        setUserRoles(roles);
        
        // Determine if the user is a CRO admin/user
        const hasCroRole = roles.some(role => 
          role.name === 'cro_admin' || 
          role.name === 'system_admin' || 
          role.name.includes('cro_')
        );
        setIsCroUser(hasCroRole);
        
        // If CRO user, fetch all accessible clients
        if (hasCroUser) {
          const clientsData = await adminService.getAllClients({ status: 'active' });
          setClients(clientsData);
          setFilteredClients(clientsData);
        } else {
          // For biotech users, they only have access to their client
          const clientId = currentUser.clientId;
          if (clientId) {
            const clientData = await adminService.getClient(clientId);
            setClients([clientData]);
            setFilteredClients([clientData]);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading client portal data:', error);
        toast({
          title: "Error Loading Client Data",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [toast]);
  
  // Filter clients when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(query) || 
        client.description?.toLowerCase().includes(query) ||
        client.industryType?.toLowerCase().includes(query)
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle client selection
  const handleClientSelection = async (clientId) => {
    if (isCroUser) {
      try {
        // For CRO users, switch the client context
        await securityService.switchClientContext(clientId);
        
        // Redirect to the client portal
        window.location.href = `/client-portal/${clientId}`;
      } catch (error) {
        console.error('Error selecting client:', error);
        toast({
          title: "Error Selecting Client",
          description: "Failed to switch client context. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // For biotech users, directly go to their portal
      window.location.href = '/client-portal';
    }
  };
  
  // Get status badge color based on client status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading client portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Client Portal Access</h1>
          <p className="text-muted-foreground max-w-2xl">
            {isCroUser 
              ? "Access portals for the biotech clients you manage. Select a client to view their projects, documents, and regulatory submissions."
              : "Access your secure portal to view projects, documents, and collaborate with your team."
            }
          </p>
        </div>
        
        {isCroUser && (
          <>
            {/* Search section for CRO users */}
            <div className="mb-8">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search clients by name or industry..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            {/* Client grid for CRO users */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <Card key={client.id} className="overflow-hidden">
                    <div className={`h-1 w-full ${
                      client.status === 'active' ? 'bg-green-500' :
                      client.status === 'pending' ? 'bg-yellow-500' :
                      client.status === 'suspended' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Avatar className="h-9 w-9 mr-3">
                            <AvatarImage src={client.logoUrl} alt={client.name} />
                            <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <CardTitle>{client.name}</CardTitle>
                        </div>
                        <Badge variant="outline" className={getStatusBadgeColor(client.status)}>
                          {client.status}
                        </Badge>
                      </div>
                      <CardDescription className="mt-2">
                        {client.description?.substring(0, 100) || 'No description available'}
                        {client.description?.length > 100 && '...'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Industry</p>
                          <p className="font-medium">{client.industryType || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Client Since</p>
                          <p className="font-medium">{new Date(client.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Projects</p>
                          <p className="font-medium">{client.projectCount || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Users</p>
                          <p className="font-medium">{client.userCount || 0}</p>
                        </div>
                      </div>
                      
                      {client.tier && (
                        <div className="mt-4">
                          <Badge variant="secondary" className="w-full justify-center py-1">
                            {client.tier.charAt(0).toUpperCase() + client.tier.slice(1)} Tier
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button 
                        className="w-full" 
                        onClick={() => handleClientSelection(client.id)}
                      >
                        Access Client Portal
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground mb-2">No clients found matching your search criteria</p>
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Show All Clients
                  </Button>
                </div>
              )}
            </div>
            
            {/* Administrative actions for CRO admins */}
            {userRoles.some(role => role.name === 'cro_admin' || role.name === 'system_admin') && (
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-4">Administrative Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-primary" />
                        Client Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">
                        Add, edit, or manage client organizations and their settings.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/admin/clients">
                          Manage Clients
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <UsersIcon className="h-4 w-4 mr-2 text-primary" />
                        User Administration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">
                        Manage users, roles, and permissions across all client organizations.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/admin/users">
                          Manage Users
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-primary" />
                        Security Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">
                        Configure security policies, MFA, SSO, and compliance settings.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/admin/security">
                          Security Settings
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* For biotech users - their client portal card */}
        {!isCroUser && filteredClients.length > 0 && (
          <div className="max-w-xl mx-auto">
            <Card className="border-2 shadow-md overflow-hidden">
              <div className="h-2 w-full bg-primary" />
              <CardHeader>
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={filteredClients[0].logoUrl} alt={filteredClients[0].name} />
                    <AvatarFallback>{filteredClients[0].name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{filteredClients[0].name}</CardTitle>
                    <CardDescription>
                      {filteredClients[0].tier && (
                        <Badge variant="outline" className="mt-1">
                          {filteredClients[0].tier.charAt(0).toUpperCase() + filteredClients[0].tier.slice(1)} Tier
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {filteredClients[0].description || 'Welcome to your TrialSage client portal. Access your projects, documents, and collaborate with your team.'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-md p-3 text-center">
                      <div className="font-bold text-2xl">{filteredClients[0].projectCount || 0}</div>
                      <div className="text-sm text-muted-foreground">Active Projects</div>
                    </div>
                    <div className="border rounded-md p-3 text-center">
                      <div className="font-bold text-2xl">{filteredClients[0].documentCount || 0}</div>
                      <div className="text-sm text-muted-foreground">Documents</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-primary" />
                        <span>Recent Activity</span>
                      </div>
                      <span className="text-muted-foreground">
                        {filteredClients[0].lastActivityDate 
                          ? new Date(filteredClients[0].lastActivityDate).toLocaleDateString()
                          : 'No recent activity'}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-primary" />
                        <span>Pending Reviews</span>
                      </div>
                      <Badge>{filteredClients[0].pendingReviewCount || 0}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button 
                  className="w-full" 
                  onClick={() => handleClientSelection(filteredClients[0].id)}
                >
                  Enter Client Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <div className="mt-8 text-center">
              <div className="inline-flex items-center text-sm text-muted-foreground">
                <HelpCircle className="h-4 w-4 mr-1" />
                Need assistance? Contact your account manager or
                <Button variant="link" size="sm" className="h-auto p-0 pl-1">support team</Button>.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}