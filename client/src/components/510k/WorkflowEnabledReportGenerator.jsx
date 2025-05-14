/**
 * WorkflowEnabledReportGenerator Component
 * 
 * This component serves as a container for the 510(k) report generator,
 * integrating it with the unified workflow system to enable document approvals.
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OneClick510kDraft from './OneClick510kDraft';
import UnifiedWorkflowPanel from '../unified-workflow/UnifiedWorkflowPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Users, Clock } from 'lucide-react';

const WorkflowEnabledReportGenerator = () => {
  const [selectedTab, setSelectedTab] = useState('generate');
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Medical Device Regulatory Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Generate FDA-compliant 510(k) documentation with integrated approval workflows
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Generation
            </CardTitle>
            <CardDescription>
              Create FDA-compliant regulatory documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">3 Document Types</span>
              <Badge variant="secondary">510(k) Module</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Review & Approval
            </CardTitle>
            <CardDescription>
              Multi-step approval workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">4 Roles Involved</span>
              <Badge variant="secondary">Cross-Module</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Compliance Assurance
            </CardTitle>
            <CardDescription>
              FDA compliance validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">100% Compliant</span>
              <Badge variant="secondary">Automated</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full space-y-6">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="generate">
            <FileText className="h-4 w-4 mr-2" />
            Generate Documents
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Clock className="h-4 w-4 mr-2" />
            Manage Workflows
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="space-y-6">
          <OneClick510kDraft />
        </TabsContent>
        
        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Approval Workflows</CardTitle>
              <CardDescription>
                Manage and monitor approval processes for all regulatory documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnifiedWorkflowPanel moduleType="510k" showHeader={false} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowEnabledReportGenerator;