import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  ChevronDown,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  UserPlus,
  Users,
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

export function OrganizationsPage() {
  const { availableTenants } = useTenant();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter organizations based on search query
  const filteredOrganizations = availableTenants.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (org.domain && org.domain.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground mt-2">
              Manage all tenant organizations in the system
            </p>
          </div>
          <Button className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Organization
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                Status
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem>
                Inactive
              </DropdownMenuItem>
              <DropdownMenuItem>
                Suspended
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                Tier
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                All Tiers
              </DropdownMenuItem>
              <DropdownMenuItem>
                Enterprise
              </DropdownMenuItem>
              <DropdownMenuItem>
                Professional
              </DropdownMenuItem>
              <DropdownMenuItem>
                Standard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card>
          <CardHeader className="px-6 pb-4">
            <CardTitle>Organization Directory</CardTitle>
            <CardDescription>
              {filteredOrganizations.length} organizations found
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{org.name}</span>
                        <span className="text-xs text-muted-foreground">{org.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          org.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {org.status}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize">{org.tier}</TableCell>
                    <TableCell>{org.domain || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {org.userCount || 0}/{org.maxUsers || '∞'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {org.projectCount || 0}/{org.maxProjects || '∞'}
                    </TableCell>
                    <TableCell>
                      {org.storageUsed || 0}GB/{org.maxStorage || '∞'}GB
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Manage users
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Trash className="h-4 w-4 mr-2 text-red-500" />
                            <span className="text-red-500">Delete organization</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OrganizationsPage;