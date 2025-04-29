import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import GenerateFullCerButton from './GenerateFullCerButton';
import InputDataPanel from './InputDataPanel';
import LitReviewPanel from './LitReviewPanel';
import GeneratedReportPanel from './GeneratedReportPanel';
import DocumentVaultPanel from './DocumentVaultPanel';
import CerHistoryPanel from './CerHistoryPanel';
import TemplateSettingsPanel from './TemplateSettingsPanel';
import ApprovalsPanel from './ApprovalsPanel';

export default function CerModule() {
  const [tab, setTab] = useState('input');
  const [activeJob, setActiveJob] = useState(null);

  const handleJobSelect = jobId => setActiveJob(jobId);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardContent className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Clinical Evaluation Report Generator</h1>
            <p>Generate, manage, and review Clinical Evaluation Reports.</p>
          </div>
          <GenerateFullCerButton onJobCreated={handleJobSelect} />
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="input">Input Data</TabsTrigger>
          <TabsTrigger value="litreview">Literature Review</TabsTrigger>
          <TabsTrigger value="report">Generated Report</TabsTrigger>
          <TabsTrigger value="vault">Document Vault</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
          <TabsTrigger value="templates">Template Settings</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="input"><InputDataPanel jobId={activeJob} /></TabsContent>
        <TabsContent value="litreview"><LitReviewPanel jobId={activeJob} /></TabsContent>
        <TabsContent value="report"><GeneratedReportPanel jobId={activeJob} /></TabsContent>
        <TabsContent value="vault"><DocumentVaultPanel jobId={activeJob} /></TabsContent>
        <TabsContent value="history"><CerHistoryPanel /></TabsContent>
        <TabsContent value="templates"><TemplateSettingsPanel /></TabsContent>
        <TabsContent value="approvals"><ApprovalsPanel /></TabsContent>
      </Tabs>
    </div>
  );
}