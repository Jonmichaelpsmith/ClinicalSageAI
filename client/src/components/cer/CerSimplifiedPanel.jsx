import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, AlignLeft, FileDown, BookOpen } from 'lucide-react';

export default function CerSimplifiedPanel({
  title,
  faers,
  sections = [],
  complianceThresholds = {
    OVERALL_THRESHOLD: 0.8,
    FLAG_THRESHOLD: 0.7
  },
  onSectionsChange,
  onComplianceScoreChange
}) {
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('generator');
  const [sectionContext, setSectionContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Section type options
  const sectionTypes = [
    { id: 'benefit-risk', label: 'Benefit-Risk Analysis' },
    { id: 'safety', label: 'Safety Analysis' },
    { id: 'clinical-background', label: 'Clinical Background' },
    { id: 'device-description', label: 'Device Description' },
    { id: 'state-of-art', label: 'State of the Art Review' },
    { id: 'equivalence', label: 'Equivalence Assessment' },
    { id: 'literature-analysis', label: 'Literature Analysis' },
    { id: 'pms-data', label: 'Post-Market Surveillance Data' },
    { id: 'conclusion', label: 'Conclusion' },
  ];
  
  // Placeholder for generate function
  const generateSection = async () => {
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      if (onSectionsChange) {
        const newSection = {
          id: `section-${Date.now()}`,
          title: 'New CER Section',
          content: sectionContext,
          dateAdded: new Date().toISOString()
        };
        
        onSectionsChange([...sections, newSection]);
        
        toast({
          title: 'Section added',
          description: 'Your section has been added to the report.'
        });
        
        setSectionContext('');
      }
      
      setIsGenerating(false);
    }, 1000);
  };
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="generator">
            <AlignLeft className="mr-2 h-4 w-4" />
            Section Generator
          </TabsTrigger>
          <TabsTrigger value="preview">
            <FileText className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="export">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="generator">
          <Card>
            <CardHeader>
              <CardTitle>Generate CER Section</CardTitle>
              <CardDescription>
                Create sections for your Clinical Evaluation Report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="section-context">Section Content</Label>
                  <Textarea
                    id="section-context"
                    placeholder="Enter content for this section..."
                    value={sectionContext}
                    onChange={(e) => setSectionContext(e.target.value)}
                    rows={6}
                  />
                </div>
                
                <Button 
                  onClick={generateSection}
                  disabled={isGenerating || !sectionContext.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Add Section'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {sections.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Current Sections ({sections.length})</h3>
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div key={section.id || index} className="border rounded-md p-3">
                    <div className="font-medium">{section.title || `Section ${index + 1}`}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {section.content.substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>CER Preview</CardTitle>
              <CardDescription>
                Preview your Clinical Evaluation Report
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sections.length > 0 ? (
                <div className="space-y-6">
                  <div className="text-xl font-bold border-b pb-2">
                    Clinical Evaluation Report: {title}
                  </div>
                  
                  {sections.map((section, index) => (
                    <div key={section.id || index} className="border-b pb-4 mb-4 last:border-0">
                      <h3 className="text-lg font-medium mb-2">{section.title || `Section ${index + 1}`}</h3>
                      <div className="whitespace-pre-wrap text-sm">
                        {section.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No sections added yet. Use the Section Generator to add content to your report.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>
                Export your Clinical Evaluation Report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4 bg-muted/20">
                  <h3 className="font-medium mb-2">Export Format</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      PDF Format
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      DOCX Format
                    </Button>
                  </div>
                </div>
                
                <Button disabled={sections.length === 0} className="w-full">
                  Export Report
                </Button>
                
                {sections.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center">
                    Add at least one section before exporting
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
