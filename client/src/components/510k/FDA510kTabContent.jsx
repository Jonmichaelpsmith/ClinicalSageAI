import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  FileUp, 
  FilePlus2, 
  Layers, 
  BarChart, 
  CheckSquare,
  ClipboardCheck,
  BookOpen
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

import OneClick510kDraft from './OneClick510kDraft';
import WorkflowEnabledReportGenerator from './WorkflowEnabledReportGenerator';

const DEFAULT_DEVICE_DATA = {
  id: 'dev-sample-1',
  deviceName: 'HeartRhythm Monitor X1',
  deviceClass: 'Class II',
  manufacturer: 'MedTech Innovations, Inc.',
  regulatoryStatus: 'Pending',
  description: 'Advanced cardiac monitoring device with wireless connectivity',
  intendedUse: 'Continuous monitoring of heart rhythm and detection of arrhythmias',
  technicalSpecifications: {
    dimensions: '5.8 cm x 3.2 cm x 1.1 cm',
    weight: '45g',
    batteryLife: '168 hours (7 days)',
    connectivity: 'Bluetooth Low Energy 5.0',
    waterResistance: 'IP67'
  }
};

const DEFAULT_PREDICATE_DATA = {
  id: 'pred-sample-1',
  deviceName: 'CardioTrack Pro',
  k510Number: 'K123456',
  manufacturer: 'Cardiac Systems, LLC',
  clearanceDate: '2023-06-15',
  deviceClass: 'Class II',
  productCode: 'DPS',
  regulationNumber: '870.2920'
};

const FDA510kTabContent = ({
  organizationId,
  userId,
  activeTab = 'drafting',
  onTabChange,
  className = ''
}) => {
  const [activeSection, setActiveSection] = useState(activeTab);
  const [deviceData, setDeviceData] = useState(DEFAULT_DEVICE_DATA);
  const [predicateData, setPredicateData] = useState(DEFAULT_PREDICATE_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [hasDraftedDocument, setHasDraftedDocument] = useState(false);
  const [draftDocumentId, setDraftDocumentId] = useState(null);
  
  // Notify parent component when tab changes
  useEffect(() => {
    if (onTabChange && activeSection !== activeTab) {
      onTabChange(activeSection);
    }
  }, [activeSection, activeTab, onTabChange]);
  
  // Fetch device and predicate data if available
  useEffect(() => {
    const fetchDeviceData = async () => {
      if (!organizationId) return;
      
      setIsLoading(true);
      try {
        // API call to fetch device data
        const response = await fetch(`/api/module-integration/device-data?organizationId=${organizationId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.device) setDeviceData(data.device);
          if (data.predicate) setPredicateData(data.predicate);
        }
      } catch (error) {
        console.error('Error fetching device data:', error);
        // Fallback to default data is already set in state initialization
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDeviceData();
  }, [organizationId]);
  
  // Handle events from child components
  const handleDraftCreated = (draftId) => {
    setHasDraftedDocument(true);
    setDraftDocumentId(draftId);
    
    toast({
      title: 'Draft document created',
      description: 'Your 510(k) draft has been created successfully.',
    });
  };
  
  const handleReportGenerated = (reportId) => {
    console.log('Report generated:', reportId);
    
    toast({
      title: 'FDA 510(k) report generated',
      description: 'Your FDA-compliant 510(k) submission report has been generated successfully.',
    });
  };

  return (
    <div className={className}>
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="drafting">
            <FilePlus2 className="h-4 w-4 mr-2" /> 
            Drafting
          </TabsTrigger>
          <TabsTrigger value="submission">
            <FileUp className="h-4 w-4 mr-2" /> 
            Submission
          </TabsTrigger>
          <TabsTrigger value="testing">
            <CheckSquare className="h-4 w-4 mr-2" /> 
            Testing
          </TabsTrigger>
          <TabsTrigger value="documentation">
            <BookOpen className="h-4 w-4 mr-2" /> 
            Documentation
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="drafting">
            <OneClick510kDraft 
              organizationId={organizationId}
              userId={userId}
              deviceData={deviceData}
              predicateData={predicateData}
              onDraftCreated={handleDraftCreated}
            />
          </TabsContent>
          
          <TabsContent value="submission">
            <WorkflowEnabledReportGenerator
              organizationId={organizationId}
              userId={userId}
              deviceData={deviceData}
              predicateData={predicateData}
              reportType="510k"
              onReportGenerated={handleReportGenerated}
            />
          </TabsContent>
          
          <TabsContent value="testing">
            <Card>
              <CardHeader>
                <CardTitle>510(k) Testing Resources</CardTitle>
                <CardDescription>
                  Performance testing guidelines and resources for 510(k) submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Testing resources are being configured for your specific device type. Please check back soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documentation">
            <Card>
              <CardHeader>
                <CardTitle>510(k) Documentation</CardTitle>
                <CardDescription>
                  Reference materials and guidelines for 510(k) submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-lg mb-2">FDA Guidelines</h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Format for Traditional and Abbreviated 510(k)s</li>
                        <li>Refuse to Accept Policy for 510(k)s</li>
                        <li>The 510(k) Program: Evaluating Substantial Equivalence</li>
                        <li>Special 510(k) Program</li>
                        <li>510(k) Third Party Review Program</li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">Content Requirements</h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Device Description and Specification Documentation</li>
                        <li>Substantial Equivalence Comparison</li>
                        <li>Performance Testing Documentation</li>
                        <li>Sterilization and Shelf Life</li>
                        <li>Biocompatibility Documentation</li>
                        <li>Software Documentation</li>
                        <li>Electromagnetic Compatibility</li>
                        <li>Animal and Clinical Testing</li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">Best Practices</h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Predicate Device Selection Guidance</li>
                        <li>Structuring a Clear Substantial Equivalence Argument</li>
                        <li>Addressing Differences in Technological Characteristics</li>
                        <li>Preparing for FDA Questions and Additional Information Requests</li>
                        <li>Common Rejection Reasons and How to Avoid Them</li>
                      </ul>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default FDA510kTabContent;