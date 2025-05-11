import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, BarChart2, Shield, Beaker, Book, FileCheck, Search, Dices, FlaskConical, Microscope, Clipboard, Activity, Flask } from 'lucide-react';

import StabilityDataVisualizer from '@/components/cmc/StabilityDataVisualizer';
import ManufacturingProcessPanel from '@/components/cmc/ManufacturingProcessPanel';
import SpecificationsTable from '@/components/cmc/SpecificationsTable';
import BatchAnalysisPanel from '@/components/cmc/BatchAnalysisPanel';
import ControlStrategyPanel from '@/components/cmc/ControlStrategyPanel';
import QualityRiskAssessment from '@/components/cmc/QualityRiskAssessment';
import MethodValidationSimulator from '@/components/cmc/MethodValidationSimulator';
import FormulationDecisionTree from '@/components/cmc/FormulationDecisionTree';
import ICHComplianceChecker from '@/components/cmc/ICHComplianceChecker';
import StabilityDataAnalyzer from '@/components/cmc/StabilityDataAnalyzer';
import RegulatoryDocumentGenerator from '@/components/cmc/RegulatoryDocumentGenerator';
import QualityControlDashboard from '@/components/cmc/QualityControlDashboard';
import ExcipientCompatibilityAnalyzer from '@/components/cmc/ExcipientCompatibilityAnalyzer';

export default function CMCModule() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const quickFeatures = [
    {
      id: 'validation',
      name: 'Method Validation',
      icon: <Beaker className="h-4 w-4" />,
    },
    {
      id: 'formulation',
      name: 'Formulation Design',
      icon: <FlaskConical className="h-4 w-4" />,
    },
    {
      id: 'compliance',
      name: 'ICH Compliance',
      icon: <FileCheck className="h-4 w-4" />,
    },
    {
      id: 'excipients',
      name: 'Excipient Compatibility',
      icon: <Flask className="h-4 w-4" />,
    },
    {
      id: 'quality',
      name: 'Quality Control',
      icon: <Clipboard className="h-4 w-4" />,
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chemistry, Manufacturing, and Controls</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive CMC information for Parapain 500 mg tablets (IND 125890)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button size="sm">
            <FileCheck className="h-4 w-4 mr-2" />
            Update Module
          </Button>
        </div>
      </header>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="drug-substance">Drug Substance</TabsTrigger>
          <TabsTrigger value="drug-product">Drug Product</TabsTrigger>
          <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
          <TabsTrigger value="stability">Stability</TabsTrigger>
          <TabsTrigger value="reference-standards">Reference Standards</TabsTrigger>
          <TabsTrigger value="validation">Method Validation</TabsTrigger>
          <TabsTrigger value="formulation">Formulation</TabsTrigger>
          <TabsTrigger value="compliance">ICH Compliance</TabsTrigger>
          <TabsTrigger value="quality-control">Quality Control</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Drug Product Overview
                </CardTitle>
                <CardDescription>Key information for Parapain 500 mg tablets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-sm font-medium">Product Name</div>
                    <div className="col-span-2 text-sm">Parapain 500 mg tablets</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-sm font-medium">Active Ingredient</div>
                    <div className="col-span-2 text-sm">Parapainol Hydrochloride</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-sm font-medium">Dosage Form</div>
                    <div className="col-span-2 text-sm">Film-coated tablet</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-sm font-medium">Strength</div>
                    <div className="col-span-2 text-sm">500 mg</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-sm font-medium">Route of Administration</div>
                    <div className="col-span-2 text-sm">Oral</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-sm font-medium">Container Closure System</div>
                    <div className="col-span-2 text-sm">HDPE bottle with child-resistant closure</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-sm font-medium">Storage Conditions</div>
                    <div className="col-span-2 text-sm">Store at 20°C to 25°C (68°F to 77°F); excursions permitted to 15-30°C (59-86°F)</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-sm font-medium">Shelf Life</div>
                    <div className="col-span-2 text-sm">24 months</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <BatchAnalysisPanel />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QualityRiskAssessment />
            <ControlStrategyPanel />
          </div>

          <StabilityDataVisualizer />
        </TabsContent>

        <TabsContent value="drug-substance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drug Substance Specifications</CardTitle>
              <CardDescription>Physical and chemical properties, structure, and characteristics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Chemical Structure</h3>
                  <div className="p-10 bg-muted/30 rounded-md flex items-center justify-center">
                    [Chemical Structure Visualization]
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Physicochemical Properties</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 text-sm font-medium">Molecular Formula</div>
                        <div className="col-span-2 text-sm">C14H18N2O3•HCl</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 text-sm font-medium">Molecular Weight</div>
                        <div className="col-span-2 text-sm">298.77 g/mol</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 text-sm font-medium">Appearance</div>
                        <div className="col-span-2 text-sm">White crystalline powder</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 text-sm font-medium">Solubility</div>
                        <div className="col-span-2 text-sm">Freely soluble in water, soluble in methanol, slightly soluble in ethanol</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 text-sm font-medium">pKa</div>
                        <div className="col-span-2 text-sm">9.5</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 text-sm font-medium">Partition Coefficient</div>
                        <div className="col-span-2 text-sm">Log P: 0.28</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Solid State Properties</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 text-sm font-medium">Polymorphism</div>
                        <div className="col-span-2 text-sm">Form I (most stable form)</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 text-sm font-medium">Melting Point</div>
                        <div className="col-span-2 text-sm">175-178°C</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 text-sm font-medium">Hygroscopicity</div>
                        <div className="col-span-2 text-sm">Slightly hygroscopic</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 text-sm font-medium">Particle Size</div>
                        <div className="col-span-2 text-sm">D90: 75 μm</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 text-sm font-medium">Specific Rotation</div>
                        <div className="col-span-2 text-sm">[α]25D = -15.5° (c = 1.0, water)</div>
                      </div>
                    </div>
                  </div>
                </div>

                <SpecificationsTable />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drug-product" className="space-y-4">
          <ExcipientCompatibilityAnalyzer />
        </TabsContent>

        <TabsContent value="manufacturing" className="space-y-4">
          <ManufacturingProcessPanel />
        </TabsContent>

        <TabsContent value="stability" className="space-y-4">
          <StabilityDataAnalyzer />
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <MethodValidationSimulator />
        </TabsContent>

        <TabsContent value="formulation" className="space-y-4">
          <FormulationDecisionTree />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <ICHComplianceChecker />
        </TabsContent>

        <TabsContent value="quality-control" className="space-y-4">
          <QualityControlDashboard />
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <RegulatoryDocumentGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}