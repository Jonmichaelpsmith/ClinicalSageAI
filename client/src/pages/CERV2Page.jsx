import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Upload, BookOpen, FileDigit, Archive, Settings, ClipboardCheck, Brain, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import all our restored components
import InputDataPanel from '@/components/cer/InputDataPanel';
import LitReviewPanel from '@/components/cer/LitReviewPanel';
import GeneratedReportPanel from '@/components/cer/GeneratedReportPanel';
import DocumentVaultPanel from '@/components/cer/DocumentVaultPanel';
import TemplateSettingsPanel from '@/components/cer/TemplateSettingsPanel';
import ApprovalsPanel from '@/components/cer/ApprovalsPanel';
import GenerateFullCerButton from '@/components/cer/GenerateFullCerButton';
import CerProgressDashboard from '@/components/cer/CerProgressDashboard'; // Add our new AI enhanced progress dashboard
import { CerBuilderPanel } from '@/components/cer/CerBuilderPanel'; // Import our new CER builder panel

/**
 * CER Generator V2 Page
 * 
 * Enhanced interface for managing Clinical Evaluation Reports with 
 * comprehensive tabs for different aspects of the CER workflow.
 */
const CERV2Page = () => {
  const [activeTab, setActiveTab] = useState('ai-dashboard');
  const [selectedJobId, setSelectedJobId] = useState('JOB-20250429-001');
  
  // Product data - in production this would come from API or context
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
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Clinical Evaluation Report Generator
        </h1>
        <p className="text-muted-foreground">
          Generate, manage, and review Clinical Evaluation Reports for regulatory submissions.
        </p>
      </div>
      
      {/* Active Product Card */}
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
                  setSelectedJobId(jobId);
                  setActiveTab('report');
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8 mb-8">
          <TabsTrigger value="ai-dashboard" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Dashboard
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <PenLine className="h-4 w-4" />
            CER Builder
          </TabsTrigger>
          <TabsTrigger value="input" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Input Data
          </TabsTrigger>
          <TabsTrigger value="litreview" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Literature Review
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-2">
            <FileDigit className="h-4 w-4" />
            Generated Report
          </TabsTrigger>
          <TabsTrigger value="vault" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Document Vault
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Template Settings
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Approvals
          </TabsTrigger>
        </TabsList>
        
        {/* AI Dashboard Tab */}
        <TabsContent value="ai-dashboard" className="mt-0">
          <CerProgressDashboard />
        </TabsContent>
        
        {/* CER Builder Tab */}
        <TabsContent value="builder" className="mt-0">
          <CerBuilderPanel 
            productName={productData.name}
            faersData={{
              product_name: productData.name,
              manufacturer: productData.metadata.Sponsor,
              total_reports: 432,
              serious_events: 78,
              reporting_period: "January 2024 - April 2025"
            }}
          />
        </TabsContent>

        {/* Input Data Tab */}
        <TabsContent value="input" className="mt-0">
          <InputDataPanel />
        </TabsContent>
        
        {/* Literature Review Tab */}
        <TabsContent value="litreview" className="mt-0">
          <LitReviewPanel />
        </TabsContent>
        
        {/* Generated Report Tab */}
        <TabsContent value="report" className="mt-0">
          <GeneratedReportPanel jobId={selectedJobId} />
        </TabsContent>
        
        {/* Document Vault Tab */}
        <TabsContent value="vault" className="mt-0">
          <DocumentVaultPanel jobId={selectedJobId} />
        </TabsContent>
        
        {/* Template Settings Tab */}
        <TabsContent value="settings" className="mt-0">
          <TemplateSettingsPanel />
        </TabsContent>
        
        {/* Approvals Tab */}
        <TabsContent value="approvals" className="mt-0">
          <ApprovalsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CERV2Page;