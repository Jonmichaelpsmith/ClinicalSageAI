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
      <div className="max-w-screen-xl mx-auto">
        <div className="mb-4 border-b pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Clinical Evaluation Report Builder</h1>
            <p className="text-sm text-muted-foreground">
              FDA FAERS integration & AI-powered compliance checking
              {complianceScore && (
                <Badge 
                  className={`ml-2 ${complianceScore >= COMPLIANCE_THRESHOLDS.OVERALL_THRESHOLD ? 'bg-green-100 text-green-800' : 
                                 complianceScore >= COMPLIANCE_THRESHOLDS.FLAG_THRESHOLD ? 'bg-amber-100 text-amber-800' : 
                                 'bg-red-100 text-red-800'}`}
                >
                  {Math.round(complianceScore * 100)}% Compliant
                </Badge>
              )}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 w-full justify-start border-b pb-0 rounded-none">
            <TabsTrigger value="main" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <FileText className="h-4 w-4 mr-2" />
              CER Builder
            </TabsTrigger>
            <TabsTrigger value="faers" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Database className="h-4 w-4 mr-2" />
              FAERS Integration
              {faers && (
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 text-xs">
                  {faers.productName}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" disabled={!faers} className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <BarChart2 className="h-4 w-4 mr-2" />
              Analytics
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
            {/* All CerBuilderPanel functionality directly here */}
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
          </TabsContent>
          
          <TabsContent value="faers">
            <FdaFaersDataPanel onDataFetched={handleFaersDataFetched} />
          </TabsContent>
          
          <TabsContent value="analytics">
            {faers ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-md p-4">
                    <h3 className="text-base font-medium mb-3">Demographics</h3>
                    <FaersDemographicsCharts faersData={faers} />
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-base font-medium mb-3">Comparative Analysis</h3>
                    <FaersComparativeChart faersData={faers} comparators={faers.comparators || []} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md">
                <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
                <h3 className="text-base font-medium">No FAERS Data Available</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  First search for and fetch FAERS data in the FAERS Integration tab
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}