import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  CheckCircle,
  Database,
  Users,
  Server,
  AlertCircle,
  Clock,
  HardDrive,
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

export function AdminDashboard() {
  const { availableTenants } = useTenant();
  
  // Mock system statistics
  const systemStats = {
    activeUsers: 289,
    totalOrganizations: availableTenants.length,
    activeOrganizations: availableTenants.filter(org => org.status === 'active').length,
    avgResponseTime: '42ms',
    uptime: '99.98%',
    totalStorage: '1.2TB',
    usedStorage: '768GB',
    incidents: 0,
  };

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Platform overview and management controls
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* System Status Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-xl font-bold">Operational</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Updated 2m ago
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uptime</span>
                  <span>{systemStats.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. Response</span>
                  <span>{systemStats.avgResponseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Incidents</span>
                  <span>{systemStats.incidents}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-6 w-6 text-blue-500 mr-3" />
                <div className="text-2xl font-bold">{systemStats.activeUsers}</div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                Active users across all organizations
              </div>
            </CardContent>
          </Card>

          {/* Organizations Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Database className="h-6 w-6 text-purple-500 mr-3" />
                <div className="text-2xl font-bold">{systemStats.totalOrganizations}</div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <span className="text-green-500 font-medium">{systemStats.activeOrganizations}</span> active organizations
              </div>
            </CardContent>
          </Card>

          {/* Storage Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <HardDrive className="h-6 w-6 text-amber-500 mr-3" />
                <div className="text-2xl font-bold">{systemStats.usedStorage}</div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                of {systemStats.totalStorage} total capacity
              </div>
              <div className="mt-3 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '64%' }}></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organizations Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Organizations Overview</CardTitle>
            <CardDescription>
              View and manage all tenant organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-2 pl-4">Name</th>
                    <th className="text-left font-medium p-2">Status</th>
                    <th className="text-left font-medium p-2">Tier</th>
                    <th className="text-left font-medium p-2">Users</th>
                    <th className="text-left font-medium p-2">Storage</th>
                    <th className="text-left font-medium p-2">Projects</th>
                  </tr>
                </thead>
                <tbody>
                  {availableTenants.map((org) => (
                    <tr key={org.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 pl-4">{org.name}</td>
                      <td className="p-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            org.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {org.status}
                        </span>
                      </td>
                      <td className="p-2 capitalize">{org.tier}</td>
                      <td className="p-2">{org.userCount || 0}/{org.maxUsers || 'unlimited'}</td>
                      <td className="p-2">{org.storageUsed || 0}GB/{org.maxStorage || 'unlimited'}GB</td>
                      <td className="p-2">{org.projectCount || 0}/{org.maxProjects || 'unlimited'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No active alerts.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>New organization created</li>
                <li>System update completed</li>
                <li>Database backup created</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-purple-500" />
                Usage Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System usage trending upward.</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">API Calls</span>
                  <span className="text-xs font-medium">+12%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;