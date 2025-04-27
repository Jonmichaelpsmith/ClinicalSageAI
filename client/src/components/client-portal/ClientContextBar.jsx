/**
 * Client Context Bar
 * 
 * This component displays the current client context when a CRO user is working on behalf of a specific client.
 * It provides a way to quickly switch between different clients and clearly indicates which client's data is being accessed.
 */

import React, { useState } from 'react';
import { Link } from 'wouter';
import { useModuleIntegration } from '../integration/ModuleIntegrationLayer';

// UI components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, 
  Search, 
  UserPlus, 
  ArrowLeftRight, 
  Users,
  Clock
} from 'lucide-react';

/**
 * Client Context Bar Component
 */
export const ClientContextBar = ({ context }) => {
  const [clientSelectorOpen, setClientSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentClients, setRecentClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Integration hooks
  const { services, switchClient } = useModuleIntegration();
  
  // Handle client switch
  const handleClientSwitch = async (clientId) => {
    try {
      setIsLoading(true);
      await switchClient(clientId);
      setClientSelectorOpen(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error switching client context:', error);
      setIsLoading(false);
    }
  };
  
  // Load clients if we don't have them yet
  const handleOpenClientSelector = async () => {
    if (!allClients.length) {
      try {
        setIsLoading(true);
        const clients = await services.security.getClientOrganizations();
        setAllClients(clients);
        
        // Set recent clients (would normally come from user preferences or history)
        setRecentClients(clients.slice(0, 4));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching client organizations:', error);
        setIsLoading(false);
      }
    }
    
    setClientSelectorOpen(true);
  };
  
  // Filter clients based on search query
  const filteredClients = searchQuery.trim() === '' 
    ? allClients 
    : allClients.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.industry?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  return (
    <div className="border-b bg-muted px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">Client:</span>
          <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-md border">
            <Avatar className="h-6 w-6">
              <AvatarImage src={context.avatarUrl} alt={context.name} />
              <AvatarFallback>{context.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{context.name}</span>
            <Badge variant="outline" className="ml-1 text-xs">
              {context.type || 'Biotech'}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Sheet open={clientSelectorOpen} onOpenChange={setClientSelectorOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleOpenClientSelector} className="flex items-center">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Switch Client
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Switch Client</SheetTitle>
                <SheetDescription>
                  Select a client organization to work with
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-6">
                <div className="relative mb-6">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search clients..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {!searchQuery && recentClients.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm font-medium">Recent Clients</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {recentClients.map(client => (
                        <ClientSelectButton 
                          key={client.id}
                          client={client}
                          active={client.id === context.id}
                          onClick={() => handleClientSwitch(client.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {searchQuery ? 'Search Results' : 'All Clients'}
                    </span>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : filteredClients.length > 0 ? (
                    <ScrollArea className="h-[300px]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filteredClients.map(client => (
                          <ClientSelectButton 
                            key={client.id}
                            client={client}
                            active={client.id === context.id}
                            onClick={() => handleClientSwitch(client.id)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No clients found matching your search
                    </div>
                  )}
                </div>
              </div>
              
              <SheetFooter>
                <Button
                  className="w-full"
                  onClick={() => {
                    setClientSelectorOpen(false);
                    // Navigate to client creation form
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Client
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          
          <Link href="/client-portal">
            <Button variant="ghost" size="sm">
              Client Portal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * Client Select Button Component
 */
const ClientSelectButton = ({ client, active, onClick }) => {
  return (
    <button
      className={`flex items-center gap-2 p-2 rounded-md border w-full text-left ${
        active 
          ? 'bg-primary text-primary-foreground border-primary' 
          : 'hover:bg-accent'
      }`}
      onClick={onClick}
      disabled={active}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={client.avatarUrl} alt={client.name} />
        <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="font-medium truncate">{client.name}</div>
        <div className="text-xs truncate text-muted-foreground">
          {client.industry || 'Biotechnology'}
        </div>
      </div>
      {active && (
        <Badge variant="outline" className="ml-auto">
          Current
        </Badge>
      )}
    </button>
  );
};

export default ClientContextBar;