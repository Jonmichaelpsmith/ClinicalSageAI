import React, { useState } from 'react';
import { useTenant, ClientWorkspace } from '../../contexts/TenantContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../ui/command';
import { Button } from '../ui/button';
import { Check, ChevronsUpDown, Users, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocation } from 'wouter';
import { Skeleton } from '../ui/skeleton';

export function ClientWorkspaceSwitcher() {
  const { 
    currentClientWorkspace, 
    setCurrentClientWorkspace, 
    filteredClientWorkspaces, 
    isLoading 
  } = useTenant();
  
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  // If there are no client workspaces available and we're not loading, we don't show the switcher
  if (filteredClientWorkspaces.length === 0 && !isLoading) return null;

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  const handleSelect = (client: ClientWorkspace) => {
    if (client.id !== currentClientWorkspace?.id) {
      setCurrentClientWorkspace(client);
      // Close the popover after selection
      setOpen(false);
    }
  };

  const handleManageClients = () => {
    setOpen(false);
    navigate('/client-management');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a client workspace"
          className="flex items-center justify-between w-[200px] px-3"
        >
          <div className="flex items-center gap-2 truncate">
            <Users className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">{currentClientWorkspace?.name || "Select Client"}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search client..." />
          <CommandList>
            <CommandEmpty>No client workspace found.</CommandEmpty>
            <CommandGroup heading="Client Workspaces">
              {filteredClientWorkspaces.map((client) => (
                <CommandItem
                  key={client.id}
                  onSelect={() => handleSelect(client)}
                  className="text-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Users className="h-4 w-4 shrink-0 opacity-50" />
                    <span className="truncate">{client.name}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentClientWorkspace?.id === client.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem onSelect={handleManageClients}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Manage Clients</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}