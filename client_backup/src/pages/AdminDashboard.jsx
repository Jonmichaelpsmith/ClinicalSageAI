import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TenantManagement from './TenantManagement';
import ClientManagement from './ClientManagement';
import Settings from './Settings';
import AdminPanel from '../components/admin/AdminPanel';

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('tenants');
  
  // Get the tab from URL if present
  React.useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="tenants">Organizations</TabsTrigger>
          <TabsTrigger value="clients">Client Workspaces</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tenants">
          <TenantManagement />
        </TabsContent>
        
        <TabsContent value="clients">
          <ClientManagement />
        </TabsContent>
        
        <TabsContent value="settings">
          <Settings />
        </TabsContent>
        
        <TabsContent value="tools">
          <AdminPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}