import React, { useState, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import BatchAnalysisPanel from '../components/cmc/BatchAnalysisPanel';
import FormulationPredictor from '../components/cmc/FormulationPredictor';
import SpecificationAnalyzer from '../components/cmc/SpecificationAnalyzer';
import StabilityDataAnalyzer from '../components/cmc/StabilityDataAnalyzer';
import ICHComplianceChecker from '../components/cmc/ICHComplianceChecker';
import RegulatoryIntelligence from '../components/cmc/RegulatoryIntelligence';
import QualityRiskAssessment from '../components/cmc/QualityRiskAssessment';
import MethodValidationGenerator from '../components/cmc/MethodValidationGenerator';


export default function CMCModule() {
  const [tab, setTab] = useState('batch');
  const [loading, setLoading] = useState(false);
  const [aiSettings, setAiSettings] = useState({
    preferred_guidance: '',
    region_priority: '',
    terminology_overrides: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/cmc/ai-settings');
        if (res.ok) {
          const data = await res.json();
          setAiSettings({
            preferred_guidance: data.preferred_guidance || '',
            region_priority: (data.region_priority || []).join(', '),
            terminology_overrides: JSON.stringify(data.terminology_overrides || {}, null, 2)
          });
        }
      } catch (err) {
        console.error('Failed to load AI settings', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    // Initialize any CMC-specific data or configurations here
    document.title = "TrialSage | CMC Module";
  }, []);

  const handleChange = (newValue) => {
    setTab(newValue);
  };

  return (
    <Container className="my-4">
      <Card className="p-4 flex flex-col">
        <h1 className="text-2xl font-bold text-primary mb-2">
          Chemistry, Manufacturing, and Controls (CMC)
        </h1>
        <p className="mb-4">
          Streamline your CMC documentation, specifications analysis, and regulatory compliance with our comprehensive tools.
        </p>

        <Tabs value={tab} onValueChange={handleChange} className="w-full">
          <TabsList className="border-b mb-2 overflow-x-auto">
            <TabsTrigger value="batch">Batch Analysis</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="stability">Stability Data</TabsTrigger>
            <TabsTrigger value="formulation">Formulation</TabsTrigger>
            <TabsTrigger value="validation">Method Validation</TabsTrigger>
            <TabsTrigger value="ich">ICH Compliance</TabsTrigger>
            <TabsTrigger value="reg">Regulatory Intelligence</TabsTrigger>
            <TabsTrigger value="risk">Quality Risk Assessment</TabsTrigger>
            <TabsTrigger value="settings">AI Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="batch" className="pt-3">
            <BatchAnalysisPanel />
          </TabsContent>
          <TabsContent value="specs" className="pt-3">
            <SpecificationAnalyzer />
          </TabsContent>
          <TabsContent value="stability" className="pt-3">
            <StabilityDataAnalyzer />
          </TabsContent>
          <TabsContent value="formulation" className="pt-3">
            <FormulationPredictor />
          </TabsContent>
          <TabsContent value="validation" className="pt-3">
            <MethodValidationGenerator />
          </TabsContent>
          <TabsContent value="ich" className="pt-3">
            <ICHComplianceChecker />
          </TabsContent>
          <TabsContent value="reg" className="pt-3">
            <RegulatoryIntelligence />
          </TabsContent>
          <TabsContent value="risk" className="pt-3">
            <QualityRiskAssessment />
          </TabsContent>
          <TabsContent value="settings" className="pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferred_guidance">Preferred Guidance</Label>
                <Input
                  id="preferred_guidance"
                  value={aiSettings.preferred_guidance}
                  onChange={(e) => setAiSettings({ ...aiSettings, preferred_guidance: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="region_priority">Region Priority (comma separated)</Label>
                <Input
                  id="region_priority"
                  value={aiSettings.region_priority}
                  onChange={(e) => setAiSettings({ ...aiSettings, region_priority: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="terminology_overrides">Terminology Overrides (JSON)</Label>
                <Textarea
                  id="terminology_overrides"
                  value={aiSettings.terminology_overrides}
                  onChange={(e) => setAiSettings({ ...aiSettings, terminology_overrides: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="md:col-span-2">
                <Button onClick={async () => {
                  const payload = {
                    preferred_guidance: aiSettings.preferred_guidance || null,
                    region_priority: aiSettings.region_priority.split(',').map(r => r.trim()).filter(Boolean),
                    terminology_overrides: (() => { try { return JSON.parse(aiSettings.terminology_overrides || '{}'); } catch { return {}; } })()
                  };
                  await fetch('/api/cmc/ai-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                }}>
                  Save Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </Container>
  );
}
