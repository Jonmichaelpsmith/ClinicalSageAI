import React, { useState, useEffect } from 'react';
import { useTenant, Tenant } from '../../contexts/TenantContext';
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
import { Check, ChevronsUpDown, Building, Plus, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocation } from 'wouter';
import { Skeleton } from '../ui/skeleton';

export function OrganizationSwitcher() {
  const { currentTenant, setCurrentTenant, availableTenants, isLoading } = useTenant();
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  // If there are no tenants available and we're not loading, we don't show the switcher
  if (availableTenants.length === 0 && !isLoading) return null;

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  const handleSelect = (tenant: Tenant) => {
    if (tenant.id !== currentTenant?.id) {
      setCurrentTenant(tenant);
      // Close the popover after selection
      setOpen(false);
    }
  };

  const handleManageTenants = () => {
    setOpen(false);
    navigate('/tenant-management');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a tenant"
          className="flex items-center justify-between w-[200px] px-3"
        >
          <div className="flex items-center gap-2 truncate">
            {currentTenant?.logo ? (
              <img 
                src={currentTenant.logo} 
                alt={currentTenant.name} 
                className="h-4 w-4 rounded-sm object-contain"
              />
            ) : (
              <Building className="h-4 w-4 shrink-0 opacity-50" />
            )}
            <span className="truncate">{currentTenant?.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search organization..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup heading="Organizations">
              {availableTenants.map((tenant) => (
                <CommandItem
                  key={tenant.id}
                  onSelect={() => handleSelect(tenant)}
                  className="text-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    {tenant.logo ? (
                      <img 
                        src={tenant.logo} 
                        alt={tenant.name} 
                        className="h-4 w-4 rounded-sm object-contain"
                      />
                    ) : (
                      <Building className="h-4 w-4 shrink-0 opacity-50" />
                    )}
                    <span className="truncate">{tenant.name}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentTenant?.id === tenant.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem onSelect={handleManageTenants}>
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