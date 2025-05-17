import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';

import CSRDashboard from '@/components/csr-analyzer/CSRDashboard';
import CSRUploader from '@/components/csr-analyzer/CSRUploader';
import CSRSearchInterface from '@/components/csr-analyzer/CSRSearchInterface';

const CsrAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CSR Intelligence™</h1>
          <p className="text-muted-foreground">Generate and analyze Clinical Study Reports with AI assistance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveTab('upload')}>Upload CSR</Button>
          <Button onClick={() => setActiveTab('search')}>Search Reports</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <CSRDashboard />
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <CSRUploader />
        </TabsContent>

        <TabsContent value="search" className="mt-4">
          <CSRSearchInterface />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Need help?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Upload CSR documents for automated analysis or search existing reports for insights.
        </CardContent>
      </Card>
    </div>
  );
};

export default CsrAnalyzer;

