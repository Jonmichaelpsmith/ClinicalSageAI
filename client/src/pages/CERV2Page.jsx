import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CerHistoryPanel from '@/components/cer/CerHistoryPanel';
import GenerateFullCerButton from '@/components/cer/GenerateFullCerButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, RotateCcw, Sliders, ClipboardCheck } from 'lucide-react';

/**
 * CER Generator V2 Page
 * 
 * This page provides an enhanced interface for managing Clinical Evaluation Reports
 * with multiple tabs for different aspects of CER management.
 */
const CERV2Page = () => {
  const [activeTab, setActiveTab] = useState('history');
  
  // Mock product data - in a real application this would come from API or context
  const productData = {
    id: 'PROD-12345',
    name: 'Enzymex Forte',
    templateId: 'ICH-E3-FULL',
    metadata: {
      Sponsor: 'PharmaPlus Therapeutics',
      Region: 'Global',
      Phase: 'Phase III'
    }
  };
  
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Clinical Evaluation Report Generator
        </h1>
        <p className="text-muted-foreground">
          Generate, manage, and review Clinical Evaluation Reports for regulatory submissions.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 mb-8">
        <Card className="shadow-md">
          <CardHeader className="p-6">
            <CardTitle>Active Product: {productData.name}</CardTitle>
            <CardDescription>ID: {productData.id}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="flex justify-end">
              <GenerateFullCerButton
                productId={productData.id}
                templateId={productData.templateId}
                metadata={productData.metadata}
                onSuccess={(jobId) => {
                  setActiveTab('history');
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Report History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            Template Settings
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Approvals
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="mt-0">
          <CerHistoryPanel />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-0">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="h-5 w-5" />
                Template Settings
              </CardTitle>
              <CardDescription>
                Configure your CER templates and generation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Template settings to be implemented
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approvals" className="mt-0">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                My Approval Requests
              </CardTitle>
              <CardDescription>
                Review reports pending your approval
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Dedicated approvals dashboard to be implemented
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CERV2Page;