import React, { useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';

// Define the Organization type inline
interface Organization {
  id: string;
  name: string;
  logo?: string;
}
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
import { Check, ChevronsUpDown, Building, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocation } from 'wouter';
import { Skeleton } from '../ui/skeleton';

export function OrganizationSwitcher() {
  const tenantContext = useTenant();
  
  // If tenant context is undefined, return early
  if (!tenantContext) return null;
  
  const { 
    currentOrganization, 
    setCurrentOrganization, 
    organizations = [], // Provide default empty array
    isLoading = false   // Provide default value
  } = tenantContext;
  
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  // If no organizations available and we're not loading, don't show the switcher
  if (organizations.length === 0 && !isLoading) return null;

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  const handleSelect = (org: Organization) => {
    if (org.id !== currentOrganization?.id) {
      setCurrentOrganization(org);
      // Close the popover after selection
      setOpen(false);
    }
  };

  const handleManageOrganizations = () => {
    setOpen(false);
    
    // Navigation path for organization management
    // This path should match the route defined in App.jsx
    navigate('/tenant-management');
    
    // Log navigation for debugging purposes
    console.log('Navigating to tenant management page');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select an organization"
          className="flex items-center justify-between w-[200px] px-3"
        >
          <div className="flex items-center gap-2 truncate">
            {currentOrganization?.logo ? (
              <img 
                src={currentOrganization.logo} 
                alt={currentOrganization.name} 
                className="h-4 w-4 rounded-sm object-contain"
              />
            ) : (
              <Building className="h-4 w-4 shrink-0 opacity-50" />
            )}
            <span className="truncate">{currentOrganization?.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[220px] p-0 z-50 shadow-lg" 
        align="start" 
        sideOffset={5}
        side="bottom"
        avoidCollisions={true}
        collisionPadding={10}
      >
        <Command className="rounded-lg border border-gray-200">
          <CommandInput placeholder="Search organization..." />
          <CommandList className="max-h-[300px] overflow-auto">
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup heading="Organizations">
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  onSelect={() => handleSelect(org)}
                  className="text-sm py-2 px-3"
                >
                  <div className="flex items-center gap-2 truncate">
                    {org.logo ? (
                      <img 
                        src={org.logo} 
                        alt={org.name} 
                        className="h-4 w-4 rounded-sm object-contain"
                      />
                    ) : (
                      <Building className="h-4 w-4 shrink-0 opacity-50" />
                    )}
                    <span className="truncate">{org.name}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentOrganization?.id === org.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem onSelect={handleManageOrganizations} className="py-2 px-3">
                <Settings className="mr-2 h-4 w-4" />
                <span>Manage Organizations</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}