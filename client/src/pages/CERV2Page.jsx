import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CerBuilderPanel from '@/components/cer/CerBuilderPanel';
import FdaFaersDataPanel from '@/components/cer/FdaFaersDataPanel';
import FaersDemographicsCharts from '@/components/cer/FaersDemographicsCharts';
import FaersComparativeChart from '@/components/cer/FaersComparativeChart';
import { Database, FileText, BarChart2, AlertCircle, CheckCircle } from 'lucide-react';

// Global compliance threshold constants
const COMPLIANCE_THRESHOLDS = {
  OVERALL_THRESHOLD: 0.8, // 80% overall compliance required to pass
  FLAG_THRESHOLD: 0.7,    // 70% section threshold for flagging issues
};

export default function CERV2Page() {
  const { toast } = useToast();
  const [title, setTitle] = useState('Clinical Evaluation Report');
  const [faers, setFaers] = useState(null);
  const [comparators, setComparators] = useState([]);
  const [sections, setSections] = useState([]);
  const [complianceScore, setComplianceScore] = useState(null);
  const [activeTab, setActiveTab] = useState('main');
  
  // Handle FAERS data fetch completion
  const handleFaersDataFetched = (data) => {
    setFaers(data);
    
    // If we have analysis data, create a section for it
    if (data && data.analysis && data.analysis.reportSummary) {
      const faersSection = {
        id: `section-faers-${Date.now()}`,
        type: 'safety',
        title: 'FDA FAERS Adverse Event Analysis',
        content: data.analysis.reportSummary,
        dateAdded: new Date().toISOString(),
        source: 'FAERS',
      };
      
      // Add section if it doesn't already exist
      if (!sections.some(s => s.source === 'FAERS')) {
        setSections([...sections, faersSection]);
        
        toast({
          title: 'FAERS Section Added',
          description: 'FDA FAERS analysis has been added to your CER.',
        });
      }
    }
  };
  
  // Update compliance score from the builder panel
  const handleComplianceScoreChange = (score) => {
    setComplianceScore(score);
  };
  
  return (
    <div className="p-4 space-y-6">
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader>
          <CardTitle className="text-2xl">Clinical Evaluation Report Builder V2</CardTitle>
          <CardDescription>
            Enterprise-grade CER building with FDA FAERS integration, AI-powered compliance checking, and export capabilities
            {complianceScore && (
              <Badge 
                className={`ml-2 ${complianceScore >= COMPLIANCE_THRESHOLDS.OVERALL_THRESHOLD ? 'bg-green-100 text-green-800' : 
                               complianceScore >= COMPLIANCE_THRESHOLDS.FLAG_THRESHOLD ? 'bg-amber-100 text-amber-800' : 
                               'bg-red-100 text-red-800'}`}
              >
                {Math.round(complianceScore * 100)}% Compliant
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="main">
                <FileText className="h-4 w-4 mr-2" />
                CER Builder
              </TabsTrigger>
              <TabsTrigger value="faers">
                <Database className="h-4 w-4 mr-2" />
                FDA FAERS Integration
                {faers && (
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 text-xs">
                    {faers.productName}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics" disabled={!faers}>
                <BarChart2 className="h-4 w-4 mr-2" />
                FAERS Analytics
                {faers && faers.severityAssessment && (
                  <Badge 
                    variant="outline" 
                    className={`ml-2 ${faers.severityAssessment === 'High' ? 'bg-red-50 text-red-700' : 
                                    faers.severityAssessment === 'Medium' ? 'bg-amber-50 text-amber-700' : 
                                    'bg-green-50 text-green-700'} text-xs`}
                  >
                    {faers.severityAssessment}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="main">
              {/* We're integrating CerBuilderPanel functionality directly here */}
              <div className="space-y-6">
                {/* Use CerBuilderPanel but override its styling */}
                <div className="cerbuilder-integrated">
                  <CerBuilderPanel
                    title={title}
                    faers={faers}
                    comparators={comparators}
                    sections={sections}
                    onTitleChange={setTitle}
                    onSectionsChange={setSections}
                    onFaersChange={setFaers}
                    onComparatorsChange={setComparators}
                    complianceThresholds={COMPLIANCE_THRESHOLDS}
                    onComplianceScoreChange={handleComplianceScoreChange}
                    hideHeader={true} /* Hide the header to prevent duplication */
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="faers">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="h-5 w-5 mr-2 text-blue-600" />
                      FDA FAERS Integration
                    </CardTitle>
                    <CardDescription>
                      Search the FDA Adverse Event Reporting System (FAERS) for safety data to incorporate into your CER
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FdaFaersDataPanel onDataFetched={handleFaersDataFetched} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics">
              {faers ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Demographics</CardTitle>
                        <CardDescription>
                          Age and gender distribution of adverse events
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FaersDemographicsCharts faersData={faers} />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Comparative Analysis</CardTitle>
                        <CardDescription>
                          Comparison with similar products in the same class
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FaersComparativeChart faersData={faers} comparators={faers.comparators || []} />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No FAERS Data Available</h3>
                    <p className="text-gray-500 mt-2">
                      First search for and fetch FAERS data in the FDA FAERS Integration tab
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}