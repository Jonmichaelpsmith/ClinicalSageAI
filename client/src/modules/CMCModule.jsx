import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import MethodValidationSimulator from '../components/cmc/MethodValidationSimulator';
import ICHComplianceChecker from '../components/cmc/ICHComplianceChecker';
import FormulationDecisionTree from '../components/cmc/FormulationDecisionTree';
import StabilityDataAnalyzer from '../components/cmc/StabilityDataAnalyzer';
import RegulatoryDocumentGenerator from '../components/cmc/RegulatoryDocumentGenerator';
import QualityControlDashboard from '../components/cmc/QualityControlDashboard';
import ExcipientCompatibilityAnalyzer from '../components/cmc/ExcipientCompatibilityAnalyzer';
import CollaborativeWorkspace from '../components/cmc/CollaborativeWorkspace';
import BatchProcessOptimizer from '../components/cmc/BatchProcessOptimizer';
import CMCErrorAnalytics from '../components/cmc/CMCErrorAnalytics';

const CMCModule = () => {
  const [activeTab, setActiveTab] = useState("method-validation");

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Chemistry, Manufacturing, and Controls (CMC)</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive tools for pharmaceutical development, manufacturing process optimization, and regulatory compliance
        </p>
      </div>

      <Tabs defaultValue="method-validation" className="w-full" onValueChange={setActiveTab}>
        <div className="mb-8">
          <TabsList className="w-full justify-start overflow-x-auto space-x-1 h-auto p-1">
            <TabsTrigger value="method-validation" className="py-2">Method Validation</TabsTrigger>
            <TabsTrigger value="ich-compliance" className="py-2">ICH Compliance</TabsTrigger>
            <TabsTrigger value="formulation" className="py-2">Formulation</TabsTrigger>
            <TabsTrigger value="stability" className="py-2">Stability</TabsTrigger>
            <TabsTrigger value="regulatory" className="py-2">Regulatory</TabsTrigger>
            <TabsTrigger value="qc-dashboard" className="py-2">QC Dashboard</TabsTrigger>
            <TabsTrigger value="excipient" className="py-2">Excipient</TabsTrigger>
            <TabsTrigger value="batch-optimizer" className="py-2">Batch Optimizer</TabsTrigger>
            <TabsTrigger value="error-analytics" className="py-2">Error Analytics</TabsTrigger>
            <TabsTrigger value="collaboration" className="py-2">Collaboration</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="method-validation" className="mt-0">
          <MethodValidationSimulator />
        </TabsContent>

        <TabsContent value="ich-compliance" className="mt-0">
          <ICHComplianceChecker />
        </TabsContent>

        <TabsContent value="formulation" className="mt-0">
          <FormulationDecisionTree />
        </TabsContent>

        <TabsContent value="stability" className="mt-0">
          <StabilityDataAnalyzer />
        </TabsContent>

        <TabsContent value="regulatory" className="mt-0">
          <RegulatoryDocumentGenerator />
        </TabsContent>

        <TabsContent value="qc-dashboard" className="mt-0">
          <QualityControlDashboard />
        </TabsContent>

        <TabsContent value="excipient" className="mt-0">
          <ExcipientCompatibilityAnalyzer />
        </TabsContent>

        <TabsContent value="batch-optimizer" className="mt-0">
          <BatchProcessOptimizer />
        </TabsContent>

        <TabsContent value="error-analytics" className="mt-0">
          <CMCErrorAnalytics />
        </TabsContent>

        <TabsContent value="collaboration" className="mt-0">
          <CollaborativeWorkspace />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CMCModule;