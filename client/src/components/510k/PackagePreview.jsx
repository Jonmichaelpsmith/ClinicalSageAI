import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

/**
 * PackagePreview Component
 * 
 * This component displays a preview of the eSTAR package structure with collapsible sections
 * showing the XML structure and included documents.
 */
const PackagePreview = ({ packageId }) => {
  const [activeView, setActiveView] = useState('structure');
  
  // Query to fetch package details
  const { data: packageDetails, isLoading } = useQuery({
    queryKey: ['/api/510k/package', packageId],
    enabled: !!packageId,
  });
  
  // Mock data for demonstration
  const mockPackageStructure = [
    {
      id: 'section-1',
      title: 'Administrative Information',
      subsections: [
        { id: 'section-1-1', title: 'Submission Type Information' },
        { id: 'section-1-2', title: 'Device Trade/Proprietary Name' },
        { id: 'section-1-3', title: 'Device Common or Usual Name' },
        { id: 'section-1-4', title: 'Device Classification' },
      ]
    },
    {
      id: 'section-2',
      title: 'Device Information',
      subsections: [
        { id: 'section-2-1', title: 'Device Description' },
        { id: 'section-2-2', title: 'Device Performance' },
        { id: 'section-2-3', title: 'Engineering Drawings/Schematics' },
      ]
    },
    {
      id: 'section-3',
      title: 'Substantial Equivalence',
      subsections: [
        { id: 'section-3-1', title: 'Predicate Device Comparison' },
        { id: 'section-3-2', title: 'Substantial Equivalence Discussion' },
      ]
    },
    {
      id: 'section-4',
      title: 'Proposed Labeling',
      subsections: [
        { id: 'section-4-1', title: 'Indications for Use' },
        { id: 'section-4-2', title: 'Instructions for Use' },
        { id: 'section-4-3', title: 'Device Labels' },
      ]
    },
    {
      id: 'section-5',
      title: 'Sterilization and Shelf Life',
      subsections: [
        { id: 'section-5-1', title: 'Sterilization Method' },
        { id: 'section-5-2', title: 'Shelf Life and Packaging' },
      ]
    },
    {
      id: 'section-6',
      title: 'Biocompatibility',
      subsections: [
        { id: 'section-6-1', title: 'Biocompatibility Assessment' },
        { id: 'section-6-2', title: 'Test Reports' },
      ]
    },
    {
      id: 'section-7',
      title: 'Software',
      subsections: [
        { id: 'section-7-1', title: 'Software Description' },
        { id: 'section-7-2', title: 'Hazard Analysis' },
        { id: 'section-7-3', title: 'Software Verification and Validation' },
      ]
    },
    {
      id: 'section-8',
      title: 'Performance Testing',
      subsections: [
        { id: 'section-8-1', title: 'Bench Testing' },
        { id: 'section-8-2', title: 'Animal Testing' },
        { id: 'section-8-3', title: 'Clinical Testing' },
      ]
    },
  ];
  
  const mockXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<eSTAR-Submission xmlns="http://www.fda.gov/eSTAR" 
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                xsi:schemaLocation="http://www.fda.gov/eSTAR eSTAR_510k_Schema.xsd" 
                submissionType="Traditional">
  <AdministrativeInformation>
    <SubmissionTypeInformation>
      <SubmissionType>Traditional</SubmissionType>
      <DeviceTradeProprietaryName>MedDevice XYZ-100</DeviceTradeProprietaryName>
      <DeviceCommonName>Monitoring System</DeviceCommonName>
      <DeviceClassification>
        <Regulation>21 CFR 870.2300</Regulation>
        <DeviceClass>II</DeviceClass>
        <ProductCode>Primary>DPS</ProductCode>
      </DeviceClassification>
    </SubmissionTypeInformation>
    <!-- Additional administrative information sections -->
  </AdministrativeInformation>
  
  <DeviceInformation>
    <DeviceDescription>
      <GeneralDeviceDescription>
        <!-- Device description content -->
      </GeneralDeviceDescription>
      <EngineeringDrawings>
        <!-- Reference to engineering drawings document -->
      </EngineeringDrawings>
    </DeviceDescription>
    <!-- Additional device information sections -->
  </DeviceInformation>
  
  <SubstantialEquivalence>
    <PredicateDeviceComparison>
      <!-- Comparison table content -->
    </PredicateDeviceComparison>
    <EquivalenceDiscussion>
      <!-- Discussion of substantial equivalence -->
    </EquivalenceDiscussion>
  </SubstantialEquivalence>
  
  <!-- Additional top-level sections as required by eSTAR -->
</eSTAR-Submission>`;

  // Use either real data or mock data
  const packageStructure = packageDetails?.structure || mockPackageStructure;
  const xmlContent = packageDetails?.xmlContent || mockXmlContent;
  
  return (
    <div className="space-y-4">
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="structure">Package Structure</TabsTrigger>
          <TabsTrigger value="xml">XML Content</TabsTrigger>
          <TabsTrigger value="documents">Included Documents</TabsTrigger>
        </TabsList>
        
        {/* Package Structure View */}
        <TabsContent value="structure" className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-2">
              <Accordion type="multiple" className="w-full">
                {packageStructure.map((section) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="hover:bg-muted/50 px-4">
                      {section.title}
                    </AccordionTrigger>
                    <AccordionContent className="pl-6">
                      <div className="space-y-2 py-2">
                        {section.subsections.map((subsection) => (
                          <div key={subsection.id} className="p-2 hover:bg-muted/30 rounded-md pl-4 border-l-2 border-l-muted">
                            {subsection.title}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </TabsContent>
        
        {/* XML Content View */}
        <TabsContent value="xml" className="py-4">
          <Card className="p-4">
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap bg-muted/30 p-4 rounded-md font-mono">
              {xmlContent}
            </pre>
          </Card>
        </TabsContent>
        
        {/* Included Documents View */}
        <TabsContent value="documents" className="py-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 hover:bg-muted/10">
                <div className="font-medium">Device Description.pdf</div>
                <div className="text-xs text-muted-foreground">Section: Device Information</div>
              </Card>
              <Card className="p-3 hover:bg-muted/10">
                <div className="font-medium">Substantial Equivalence Statement.docx</div>
                <div className="text-xs text-muted-foreground">Section: Substantial Equivalence</div>
              </Card>
              <Card className="p-3 hover:bg-muted/10">
                <div className="font-medium">Performance Testing Results.pdf</div>
                <div className="text-xs text-muted-foreground">Section: Performance Testing</div>
              </Card>
              <Card className="p-3 hover:bg-muted/10">
                <div className="font-medium">Software Documentation.pdf</div>
                <div className="text-xs text-muted-foreground">Section: Software</div>
              </Card>
              <Card className="p-3 hover:bg-muted/10">
                <div className="font-medium">Biocompatibility Reports.pdf</div>
                <div className="text-xs text-muted-foreground">Section: Biocompatibility</div>
              </Card>
              <Card className="p-3 hover:bg-muted/10">
                <div className="font-medium">Sterilization Validation.pdf</div>
                <div className="text-xs text-muted-foreground">Section: Sterilization and Shelf Life</div>
              </Card>
            </div>
            <div className="text-xs text-muted-foreground italic pt-2">
              + 17 more documents included in package
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PackagePreview;