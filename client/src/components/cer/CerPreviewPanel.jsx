import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, FileDown, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { FaersRiskBadge } from './FaersRiskBadge';
import { FaersReportExporter } from './FaersReportExporter';
import { AiSectionGenerator } from './AiSectionGenerator';

/**
 * Clinical Evaluation Report Preview Panel
 * 
 * Component that allows users to preview a CER report structure,
 * manage its sections, and export the content in PDF or DOCX format
 */
export function CerPreviewPanel({ 
  productName, 
  faersData, 
  onExport = () => {} 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});
  const [customSections, setCustomSections] = useState([]);
  
  // Load preview when component mounts or when FAERS data changes
  useEffect(() => {
    if (faersData) {
      loadPreview();
    }
  }, [faersData]);
  
  // Load preview from API
  const loadPreview = async () => {
    if (!faersData) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare data for the preview API
      const previewData = {
        title: `Clinical Evaluation Report: ${productName}`,
        faers: faersData.reports || [],
        comparators: faersData.comparators || [],
        sections: customSections
      };
      
      // Call the preview API
      const response = await fetch('/api/cer/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(previewData)
      });
      
      if (!response.ok) {
        throw new Error(`Preview failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPreview(data);
      
    } catch (err) {
      console.error('Error loading preview:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle section expansion
  const toggleSection = (id) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Handle new AI-generated section
  const handleSectionGenerated = (sectionData) => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: sectionData.sectionType,
      content: sectionData.content,
      aiGenerated: true,
      timestamp: new Date().toISOString()
    };
    
    setCustomSections(prev => [...prev, newSection]);
    
    // Expand the newly added section
    setExpandedSections(prev => ({
      ...prev,
      [newSection.id]: true
    }));
    
    // Refresh preview
    setTimeout(loadPreview, 100);
  };
  
  // Handle export completion
  const handleExportCompleted = (exportResult) => {
    onExport(exportResult);
  };
  
  // Display loading state
  if (loading && !preview) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading preview...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Display error state
  if (error && !preview) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            <p className="mb-4">Error loading preview: {error}</p>
            <Button onClick={loadPreview}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Display empty state
  if (!preview) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>No preview available. Search for FAERS data first.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Clinical Evaluation Report Preview</CardTitle>
            <CardDescription>Preview your CER with integrated FAERS data</CardDescription>
          </div>
          <div className="flex space-x-2">
            <AiSectionGenerator onSectionGenerated={handleSectionGenerated} />
            <FaersReportExporter 
              productName={productName}
              faersData={faersData}
              onExportCompleted={handleExportCompleted}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">
              <Eye className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sections">
              <FileDown className="mr-2 h-4 w-4" />
              Sections
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Document</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Title:</span>
                      <p>{preview.title}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Sections:</span>
                      <p>{customSections.length + 2} sections</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Product:</span>
                      <p>{productName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">FAERS Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Reports:</span>
                      <p>{faersData.totalReports || 0}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Serious Events:</span>
                      <p>{faersData.seriousEvents?.length || 0}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Risk Assessment:</span>
                      <div className="mt-1">
                        <FaersRiskBadge 
                          riskLevel={faersData.severityAssessment?.toLowerCase()} 
                          score={faersData.riskScore} 
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Comparators</CardTitle>
                </CardHeader>
                <CardContent>
                  {faersData.comparators && faersData.comparators.length > 0 ? (
                    <div className="space-y-2">
                      {faersData.comparators.slice(0, 3).map((comp, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm truncate max-w-[150px]">{comp.comparator}</span>
                          <Badge variant="outline">{comp.riskScore.toFixed(2)}</Badge>
                        </div>
                      ))}
                      {faersData.comparators.length > 3 && (
                        <p className="text-xs text-muted-foreground text-right">
                          +{faersData.comparators.length - 3} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No comparators available</p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Report Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-2 bg-muted rounded-md">
                    <div className="font-medium">1. Executive Summary</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Overview of product safety profile and key findings
                    </div>
                  </div>
                  
                  <div className="p-2 bg-muted rounded-md">
                    <div className="font-medium">2. FAERS Safety Analysis</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Analysis of FDA adverse event reporting system data
                    </div>
                  </div>
                  
                  {customSections.map((section, index) => (
                    <div key={section.id} className="p-2 bg-muted rounded-md">
                      <div className="font-medium flex items-center">
                        {index + 3}. {section.title}
                        {section.aiGenerated && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            <Sparkles className="h-3 w-3 mr-1" /> AI Generated
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {section.content.substring(0, 60)}...
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sections" className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">1. Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  This clinical evaluation report evaluates the safety profile of {productName} based on 
                  data from the FDA Adverse Event Reporting System (FAERS). The analysis includes 
                  {faersData.totalReports || 0} adverse event reports, of which {faersData.seriousEvents?.length || 0} were classified as serious.
                </p>
                <p className="mt-2">
                  Based on our comprehensive analysis, {productName} demonstrates a {faersData.severityAssessment?.toLowerCase() || 'moderate'} risk profile 
                  with a calculated risk score of {faersData.riskScore?.toFixed(2) || 'N/A'}.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">2. FAERS Safety Analysis</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('faers-analysis')}
                >
                  {expandedSections['faers-analysis'] ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </CardHeader>
              {expandedSections['faers-analysis'] && (
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Overview</h4>
                      <p>
                        Analysis of the FDA Adverse Event Reporting System (FAERS) data for {productName} revealed 
                        a total of {faersData.totalReports || 0} adverse event reports. These reports were collected from 
                        {faersData.dateRange?.start || 'historical records'} to {faersData.dateRange?.end || 'present date'}.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Serious Adverse Events</h4>
                      <p>
                        Of the total reports, {faersData.seriousEvents?.length || 0} events were classified as serious, 
                        representing {faersData.seriousEvents?.length && faersData.totalReports ? 
                          ((faersData.seriousEvents.length / faersData.totalReports) * 100).toFixed(1) : 0}% of all reports.
                        The most common serious outcomes included hospitalization, disability, and life-threatening conditions.
                      </p>
                    </div>
                    
                    {faersData.topReactions && faersData.topReactions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Most Frequent Reactions</h4>
                        <div className="space-y-1">
                          {faersData.topReactions.slice(0, 5).map((reaction, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{reaction.term}</span>
                              <span className="font-medium">{reaction.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {faersData.comparators && faersData.comparators.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Comparative Risk Assessment</h4>
                        <p>
                          When compared to similar products in the same class, {productName} demonstrated a 
                          {faersData.riskScore < 3 ? 'favorable' : 
                            faersData.riskScore > 7 ? 'concerning' : 'comparable'} 
                          safety profile with a risk score of {faersData.riskScore?.toFixed(2) || 'N/A'}.
                        </p>
                        <div className="mt-2 space-y-1">
                          {faersData.comparators.map((comp, index) => (
                            <div key={index} className="flex justify-between items-center py-1 border-b last:border-0 text-sm">
                              <span>{comp.comparator}</span>
                              <div className="flex items-center space-x-2">
                                <span>Score: {comp.riskScore.toFixed(2)}</span>
                                <Badge 
                                  variant={comp.riskScore > faersData.riskScore ? 'destructive' : 
                                    comp.riskScore < faersData.riskScore ? 'success' : 'outline'}
                                  className="text-xs"
                                >
                                  {comp.riskScore > faersData.riskScore ? 'Higher' : 
                                    comp.riskScore < faersData.riskScore ? 'Lower' : 'Similar'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
            
            {/* AI Generated Sections */}
            {customSections.map((section, index) => (
              <Card key={section.id}>
                <CardHeader className="py-4 flex flex-row items-center justify-between">
                  <div className="flex items-center">
                    <CardTitle className="text-lg">{index + 3}. {section.title}</CardTitle>
                    {section.aiGenerated && (
                      <Badge variant="outline" className="ml-2">
                        <Sparkles className="h-3 w-3 mr-1" /> AI Generated
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection(section.id)}
                  >
                    {expandedSections[section.id] ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </CardHeader>
                {expandedSections[section.id] && (
                  <CardContent>
                    <div className="whitespace-pre-wrap">
                      {section.content}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
