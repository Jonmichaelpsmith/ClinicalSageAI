import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TenantManagement from './TenantManagement';
import ClientManagement from './ClientManagement';
import SettingsPage from './SettingsPage';
import AdminPanel from '@/components/admin/AdminPanel';

export default function AdminDashboard() {
  const [tab, setTab] = useState('organizations');
  const [location] = useLocation();

  useEffect(() => {
    const query = location.split('?')[1];
    if (query) {
      const params = new URLSearchParams(query);
      const initial = params.get('tab');
      if (initial) setTab(initial);
    }
  }, [location]);

  return (
    <div className="container mx-auto py-8">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="clients">Client Workspaces</TabsTrigger>
          <TabsTrigger value="settings">Platform Settings</TabsTrigger>
          <TabsTrigger value="tools">Advanced Tools</TabsTrigger>
        </TabsList>
        <TabsContent value="organizations">
          <TenantManagement />
        </TabsContent>
        <TabsContent value="clients">
          <ClientManagement />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsPage />
        </TabsContent>
        <TabsContent value="tools">
          <AdminPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}