import React, { useState } from 'react';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ICHComplianceChecker from '../components/cmc/ICHComplianceChecker';
import RegulatoryIntelligence from '../components/cmc/RegulatoryIntelligence';
import QualityRiskAssessment from '../components/cmc/QualityRiskAssessment';
import withAuthGuard from '../utils/withAuthGuard';


function SimpleCMCModule() {
  const [tab, setTab] = useState('ich');

  return (
    <Container className="my-4">
      <Card className="p-4 flex flex-col">
        <h1 className="text-2xl font-bold text-primary mb-2">CMC Compliance Assistant</h1>
        <p className="mb-4">
          Review and ensure compliance with ICH guidelines and regulatory requirements for Chemistry, Manufacturing, and Controls.
        </p>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="border-b mb-2">
            <TabsTrigger value="ich">ICH Compliance</TabsTrigger>
            <TabsTrigger value="reg">Regulatory Intelligence</TabsTrigger>
            <TabsTrigger value="risk">Quality Risk Assessment</TabsTrigger>
          </TabsList>
          <TabsContent value="ich" className="pt-3">
            <ICHComplianceChecker />
          </TabsContent>
          <TabsContent value="reg" className="pt-3">
            <RegulatoryIntelligence />
          </TabsContent>
          <TabsContent value="risk" className="pt-3">
            <QualityRiskAssessment />
          </TabsContent>
        </Tabs>
      </Card>
    </Container>
  );
}

export default withAuthGuard(SimpleCMCModule);