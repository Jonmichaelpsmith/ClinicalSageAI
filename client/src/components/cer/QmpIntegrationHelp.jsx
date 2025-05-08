import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gauge, CheckSquare, FileText, AlertTriangle, ClipboardList, Scale } from 'lucide-react';
import CerTooltipWrapper from './CerTooltipWrapper';

/**
 * Help component explaining QMP integration with ICH E6(R3) for the CER module
 */
const QmpIntegrationHelp = ({ onClose }) => {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="bg-[#FDF2F8] border-b border-[#E3008C]">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-[#E3008C]" />
          <CardTitle>Quality Management Plan (QMP) Integration</CardTitle>
        </div>
        <CardDescription>
          Understanding ICH E6(R3) integration in the Clinical Evaluation Report process
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                <Gauge className="h-5 w-5 text-[#E3008C]" />
                ICH E6(R3) QMS Integration
              </h3>
              <p className="text-gray-700 mb-3">
                The Quality Management Plan (QMP) integration enables ICH E6(R3)'s risk-based quality 
                management principles throughout the Clinical Evaluation Report workflow. This integration leverages the 
                latest revision of ICH Good Clinical Practice Guidelines to create a risk-based approach to clinical 
                evaluation quality.
              </p>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                <h4 className="font-medium text-[#0F6CBD] mb-2">Key Features:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckSquare className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <span className="font-medium">Critical-to-Quality (CtQ) Factor Monitoring</span>
                      <p className="text-sm text-gray-600">Identifies and tracks critical quality factors across all phases of CER development</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <span className="font-medium">Risk-Based Quality Validation</span>
                      <p className="text-sm text-gray-600">Focuses validation on highest-risk areas based on QMP risk assessment</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <span className="font-medium">ICH E6(R3) Risk-Based Framework</span>
                      <p className="text-sm text-gray-600">Implements the latest ICH quality paradigm across clinical evaluation</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="benefits" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-[#E3008C]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[#E3008C]" />
                    Reduced Risk of Compliance Failures
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  Proactively identifies and mitigates quality risks before they result in regulatory non-compliance, 
                  reducing the likelihood of findings during Notified Body assessment.
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-[#E3008C]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-[#E3008C]" />
                    Enhanced CER Quality
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  Improves overall CER quality by focusing validation on Critical-to-Quality factors that directly 
                  impact clinical evidence strength and reliability.
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-[#E3008C]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#E3008C]" />
                    Regulatory Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  Demonstrates to regulators that your clinical evaluation process implements the latest ICH E6(R3) 
                  risk-based quality management principles.
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-[#E3008C]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Scale className="h-4 w-4 text-[#E3008C]" />
                    Resource Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  Allocates validation resources to high-risk areas, focusing effort where it matters most and 
                  reducing overall QA/RA workload through risk-based prioritization.
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="implementation" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">How QMP is Integrated in the CER Process</h3>
              <p className="text-gray-700 mb-4">
                The Quality Management Plan integration operates across the entire CER workflow, with focus points at each stage:
              </p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-md">
                  <div className="bg-[#E3008C] text-white rounded-full h-6 w-6 flex items-center justify-center font-medium shrink-0">1</div>
                  <div>
                    <h4 className="font-medium">Data Collection & Analysis</h4>
                    <p className="text-sm text-gray-600">QMP integration identifies critical data sources and applies appropriate controls to ensure data quality and traceability</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-md">
                  <div className="bg-[#E3008C] text-white rounded-full h-6 w-6 flex items-center justify-center font-medium shrink-0">2</div>
                  <div>
                    <h4 className="font-medium">Validation Process</h4>
                    <p className="text-sm text-gray-600">Risk-based validation focusing on Critical-to-Quality factors and ICH E6(R3) quality principles</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-md">
                  <div className="bg-[#E3008C] text-white rounded-full h-6 w-6 flex items-center justify-center font-medium shrink-0">3</div>
                  <div>
                    <h4 className="font-medium">AI-Based Content Generation</h4>
                    <p className="text-sm text-gray-600">Quality risk assessment integrated with AI-driven content generation to prevent hallucinations and ensure data integrity</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-md">
                  <div className="bg-[#E3008C] text-white rounded-full h-6 w-6 flex items-center justify-center font-medium shrink-0">4</div>
                  <div>
                    <h4 className="font-medium">CER Finalization & Approval</h4>
                    <p className="text-sm text-gray-600">QMP validation checks ensure regulatory compliance and provide documentation of quality management throughout CER creation</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#FDF2F8] p-4 rounded-md border border-[#E3008C] mt-4">
                <h4 className="font-medium text-[#E3008C] mb-2">Regulatory Compliance Notes:</h4>
                <p className="text-sm">
                  ICH E6(R3) introduces a technology-enabled, risk-based approach to quality management for clinical research. 
                  By integrating these principles into your CER process, you demonstrate to Notified Bodies and other regulators 
                  that your clinical evidence follows contemporary quality standards. This is particularly relevant for EU MDR compliance, 
                  where quality management throughout the clinical evaluation process is increasingly scrutinized.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4">
        <Button variant="outline" onClick={onClose} className="mr-2">Close</Button>
        <CerTooltipWrapper
          tooltipContent="Enable QMP integration to implement ICH E6(R3) quality principles in your CER workflow"
          whyThisMatters="Quality management integration directly impacts regulatory compliance and is increasingly required by Notified Bodies."
        >
          <Button variant="default" className="bg-[#E3008C] hover:bg-[#c0076f]" onClick={onClose}>
            Enable QMP Integration
          </Button>
        </CerTooltipWrapper>
      </CardFooter>
    </Card>
  );
};

export default QmpIntegrationHelp;