import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, BarChart2, Shield, Beaker, Book, FileCheck, Search, Dices, FlaskConical, Microscope } from 'lucide-react';

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
          <Card>
            <CardHeader>
              <CardTitle>Drug Product Composition</CardTitle>
              <CardDescription>Formulation and excipient information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left font-medium p-2">Component</th>
                        <th className="text-left font-medium p-2">Function</th>
                        <th className="text-left font-medium p-2">mg/Tablet</th>
                        <th className="text-left font-medium p-2">% w/w</th>
                        <th className="text-left font-medium p-2">Standard</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-2 font-medium">Parapainol Hydrochloride</td>
                        <td className="p-2">Active Ingredient</td>
                        <td className="p-2">500.00</td>
                        <td className="p-2">83.33%</td>
                        <td className="p-2">In-house</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2">Microcrystalline Cellulose</td>
                        <td className="p-2">Diluent</td>
                        <td className="p-2">60.00</td>
                        <td className="p-2">10.00%</td>
                        <td className="p-2">USP/NF</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2">Corn Starch</td>
                        <td className="p-2">Disintegrant</td>
                        <td className="p-2">24.00</td>
                        <td className="p-2">4.00%</td>
                        <td className="p-2">USP/NF</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2">Hypromellose</td>
                        <td className="p-2">Binder</td>
                        <td className="p-2">9.00</td>
                        <td className="p-2">1.50%</td>
                        <td className="p-2">USP/NF</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2">Magnesium Stearate</td>
                        <td className="p-2">Lubricant</td>
                        <td className="p-2">3.00</td>
                        <td className="p-2">0.50%</td>
                        <td className="p-2">USP/NF</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2">Opadry® White</td>
                        <td className="p-2">Film Coating</td>
                        <td className="p-2">4.00</td>
                        <td className="p-2">0.67%</td>
                        <td className="p-2">Vendor</td>
                      </tr>
                      <tr className="border-t font-medium">
                        <td className="p-2">Total</td>
                        <td className="p-2"></td>
                        <td className="p-2">600.00</td>
                        <td className="p-2">100.00%</td>
                        <td className="p-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Excipient Compatibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Compatibility studies were conducted between the drug substance and excipients using binary mixtures 
                    under accelerated conditions (40°C/75% RH) for 4 weeks. No significant physical or chemical 
                    interactions were observed as confirmed by appearance, assay, and related substances testing.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Pharmaceutical Development</h3>
                    <div className="space-y-2">
                      <div className="border rounded-md p-2">
                        <span className="text-xs font-medium">Formulation Development</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          Various excipients and manufacturing processes were evaluated to develop a stable formulation 
                          with acceptable dissolution and bioavailability. The final formulation was selected based on 
                          physical and chemical stability data.
                        </p>
                      </div>

                      <div className="border rounded-md p-2">
                        <span className="text-xs font-medium">Overages</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          No overages were included in the drug product formulation.
                        </p>
                      </div>

                      <div className="border rounded-md p-2">
                        <span className="text-xs font-medium">Dissolution Profile</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          The dissolution method was developed using USP Apparatus II (paddle) at 50 rpm in pH 6.8 phosphate 
                          buffer. More than 80% of the drug substance is released within 30 minutes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Container Closure System</h3>
                    <div className="space-y-2">
                      <div className="border rounded-md p-2">
                        <span className="text-xs font-medium">Primary Packaging</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          High-density polyethylene (HDPE) bottle with child-resistant polypropylene closure and induction seal.
                        </p>
                      </div>

                      <div className="border rounded-md p-2">
                        <span className="text-xs font-medium">Compatibility</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          Compatibility studies showed no significant interactions between the drug product and packaging 
                          components under accelerated and long-term stability conditions.
                        </p>
                      </div>

                      <div className="border rounded-md p-2">
                        <span className="text-xs font-medium">Light Protection</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          Photostability studies demonstrated that the product is stable under ICH Q1B conditions. The opaque 
                          HDPE bottle provides adequate light protection.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <SpecificationsTable />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manufacturing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ManufacturingProcessPanel />
            <ControlStrategyPanel />
          </div>
          <BatchAnalysisPanel />
        </TabsContent>

        <TabsContent value="stability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stability Program</CardTitle>
              <CardDescription>Long-term, accelerated, and stress testing results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Stability Protocol</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left font-medium p-2">Storage Condition</th>
                          <th className="text-left font-medium p-2">Container</th>
                          <th className="text-left font-medium p-2">Orientation</th>
                          <th className="text-left font-medium p-2">Testing Intervals (months)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-2">25°C/60% RH (long-term)</td>
                          <td className="p-2">HDPE bottle</td>
                          <td className="p-2">Upright</td>
                          <td className="p-2">0, 3, 6, 9, 12, 18, 24, 36</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">30°C/65% RH (intermediate)</td>
                          <td className="p-2">HDPE bottle</td>
                          <td className="p-2">Upright</td>
                          <td className="p-2">0, 3, 6, 9, 12</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">40°C/75% RH (accelerated)</td>
                          <td className="p-2">HDPE bottle</td>
                          <td className="p-2">Upright</td>
                          <td className="p-2">0, 1, 2, 3, 6</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">40°C/75% RH (accelerated)</td>
                          <td className="p-2">HDPE bottle</td>
                          <td className="p-2">Inverted</td>
                          <td className="p-2">0, 3, 6</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <StabilityDataVisualizer fullSize={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reference-standards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reference Standards</CardTitle>
              <CardDescription>Primary and secondary standards for quality control testing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left font-medium p-2">Reference Standard</th>
                        <th className="text-left font-medium p-2">Type</th>
                        <th className="text-left font-medium p-2">Source</th>
                        <th className="text-left font-medium p-2">Lot Number</th>
                        <th className="text-left font-medium p-2">Retest Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-2">Parapainol Hydrochloride RS</td>
                        <td className="p-2">Primary</td>
                        <td className="p-2">USP</td>
                        <td className="p-2">R024K5</td>
                        <td className="p-2">2026-08-31</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2">Parapainol Hydrochloride In-house RS</td>
                        <td className="p-2">Secondary</td>
                        <td className="p-2">Internal</td>
                        <td className="p-2">RSB0123</td>
                        <td className="p-2">2025-12-31</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2">Impurity A RS</td>
                        <td className="p-2">Impurity</td>
                        <td className="p-2">Internal</td>
                        <td className="p-2">IA0056</td>
                        <td className="p-2">2025-10-15</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2">Impurity B RS</td>
                        <td className="p-2">Impurity</td>
                        <td className="p-2">Internal</td>
                        <td className="p-2">IB0034</td>
                        <td className="p-2">2025-11-20</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2">System Suitability Mixture</td>
                        <td className="p-2">System Suitability</td>
                        <td className="p-2">Internal</td>
                        <td className="p-2">SSM0089</td>
                        <td className="p-2">2025-09-30</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Characterization of Standards</h3>
                  <p className="text-sm text-muted-foreground">
                    All reference standards are fully characterized using multiple orthogonal methods including:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>HPLC purity</li>
                    <li>NMR (¹H and ¹³C)</li>
                    <li>Mass spectrometry</li>
                    <li>IR spectroscopy</li>
                    <li>Elemental analysis</li>
                    <li>Thermal analysis (DSC)</li>
                    <li>X-ray powder diffraction (for solids)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Qualification of Secondary Standards</h3>
                  <p className="text-sm text-muted-foreground">
                    Secondary standards are qualified against primary standards with a minimum of three independent 
                    determinations. Acceptance criteria include:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>Assay: 98.0-102.0% against primary standard</li>
                    <li>Purity: ≥ 99.5% by HPLC</li>
                    <li>Identity: Positive by IR, HPLC retention time, and specific optical rotation</li>
                    <li>Water content: ≤ 0.5%</li>
                    <li>Residue on ignition: ≤ 0.1%</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Microscope className="h-6 w-6 mr-2" />
                <CardTitle>Method Validation Simulator</CardTitle>
              </div>
              <CardDescription>
                Simulate and visualize analytical method validation parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MethodValidationSimulator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulation">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <FlaskConical className="h-6 w-6 mr-2" />
                <CardTitle>Formulation Decision Tree</CardTitle>
              </div>
              <CardDescription>
                Generate optimal formulation recommendations based on API properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormulationDecisionTree />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <FileCheck className="h-6 w-6 mr-2" />
                <CardTitle>ICH Compliance Checker</CardTitle>
              </div>
              <CardDescription>
                Analyze your CMC documentation for compliance with ICH guidelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ICHComplianceChecker />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}