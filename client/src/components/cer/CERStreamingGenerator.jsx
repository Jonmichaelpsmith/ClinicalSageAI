import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronDown,
  Sparkles, 
  FileText, 
  Database,
  AlertTriangle,
  Loader2,
  Search,
  X,
  ExternalLink,
  Clock
} from 'lucide-react';
import { useCERGenerator } from '@/hooks/useCERGenerator';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';

/**
 * Clinical Evaluation Report Streaming Generator component
 * 
 * This component provides an interface for generating CERs using OpenAI
 * with streaming narrative and typewriter effect. It also includes an
 * evidence trace drawer to show sources for generated content.
 */
export function CERStreamingGenerator({
  deviceId,
  deviceName,
  templateId,
  reportId,
  onComplete,
  className,
  ...props
}) {
  const [expandedSections, setExpandedSections] = useState({});
  const [showEvidenceFor, setShowEvidenceFor] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  // Ref to auto-scroll to current section
  const sectionRefs = useRef({});

  // Use the CER generator hook
  const {
    isGenerating,
    sectionContent,
    currentSection,
    error,
    progress,
    evidenceTraces,
    startGeneration,
    fetchEvidenceTraces
  } = useCERGenerator();

  // Sections based on template (would be fetched from API in production)
  const sections = [
    { id: 'executive_summary', title: 'Executive Summary' },
    { id: 'device_description', title: 'Device Description' },
    { id: 'state_of_the_art', title: 'State of the Art' },
    { id: 'risk_assessment', title: 'Risk Assessment' },
    { id: 'clinical_evaluation', title: 'Clinical Evaluation' },
    { id: 'post_market_surveillance', title: 'Post-Market Surveillance' },
    { id: 'conclusion', title: 'Conclusion' }
  ];

  // Start generation on mount if deviceId is provided
  useEffect(() => {
    if (deviceId && !isGenerating && Object.keys(sectionContent).length === 0) {
      handleStartGeneration();
    }
  }, [deviceId]);

  // Scroll to current section when it changes
  useEffect(() => {
    if (currentSection && sectionRefs.current[currentSection]) {
      sectionRefs.current[currentSection].scrollIntoView({ behavior: 'smooth', block: 'start' });
      setExpandedSections(prev => ({ ...prev, [currentSection]: true }));
    }
  }, [currentSection]);

  // Handle starting the generation process
  const handleStartGeneration = () => {
    startGeneration({
      deviceId,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });
  };

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Handle opening evidence drawer for a section
  const handleShowEvidence = async (sectionId) => {
    setShowEvidenceFor(sectionId);
    
    // Fetch evidence if not already loaded
    if (!evidenceTraces[sectionId]) {
      await fetchEvidenceTraces(reportId, sectionId);
    }
  };

  // Render function for section content
  const renderSectionContent = (sectionId) => {
    const content = sectionContent[sectionId] || '';
    
    if (!content && isGenerating && currentSection === sectionId) {
      return (
        <div className="flex items-center text-gray-500 animate-pulse">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating content...
        </div>
      );
    }
    
    if (!content) {
      return (
        <div className="text-gray-500 italic">
          {isGenerating ? 'Waiting to generate this section...' : 'No content generated yet.'}
        </div>
      );
    }
    
    // Parse content for paragraphs and format them
    const paragraphs = content.split('\n').filter(p => p.trim());
    
    return (
      <div className="prose max-w-none">
        {paragraphs.map((paragraph, idx) => {
          // Check if this is a heading (starts with #)
          if (paragraph.startsWith('#')) {
            const level = paragraph.match(/^#+/)[0].length;
            const text = paragraph.replace(/^#+\s*/, '');
            const HeadingTag = `h${Math.min(level + 2, 6)}`;
            
            return (
              <HeadingTag 
                key={`${sectionId}-h-${idx}`} 
                className="font-semibold mt-4 mb-2"
              >
                {text}
              </HeadingTag>
            );
          }
          
          // If it's a list item
          if (paragraph.match(/^\s*[\-\*]\s/)) {
            return (
              <ul key={`${sectionId}-ul-${idx}`} className="list-disc pl-6 my-2">
                <li>{paragraph.replace(/^\s*[\-\*]\s/, '')}</li>
              </ul>
            );
          }
          
          // Regular paragraph
          return (
            <p 
              key={`${sectionId}-p-${idx}`} 
              className={`my-2 ${currentSection === sectionId && idx === paragraphs.length - 1 ? 'typing-cursor' : ''}`}
            >
              {paragraph}
            </p>
          );
        })}
      </div>
    );
  };

  // Generate CTA to handle whether to show start button or progress
  const renderCTA = () => {
    if (isGenerating) {
      return (
        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Generating report {progress}%</span>
            <span>Section {sections.findIndex(s => s.id === currentSection) + 1} of {sections.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      );
    }
    
    if (Object.keys(sectionContent).length > 0) {
      return (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onComplete && onComplete(sectionContent)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Save Report
          </Button>
          <Button onClick={handleStartGeneration}>
            <Sparkles className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
        </div>
      );
    }
    
    return (
      <Button 
        onClick={handleStartGeneration} 
        disabled={!deviceId}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Generate Report
      </Button>
    );
  };

  return (
    <Card className={className} {...props}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Clinical Evaluation Report Generator</CardTitle>
            <CardDescription>
              AI-powered report generation with evidence retrieval for {deviceName || 'selected device'}
            </CardDescription>
          </div>
          {renderCTA()}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {sections.map((section) => (
            <div 
              key={section.id}
              ref={el => sectionRefs.current[section.id] = el}
              className={`border rounded-lg overflow-hidden transition-all ${
                currentSection === section.id ? 'border-primary shadow-sm' : ''
              }`}
            >
              <div 
                className={`flex justify-between items-center p-3 cursor-pointer ${
                  currentSection === section.id ? 'bg-primary/10' : 'bg-muted/40'
                }`}
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center">
                  {expandedSections[section.id] ? (
                    <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                  )}
                  <h3 className="font-medium">{section.title}</h3>
                  
                  {/* Status badges */}
                  {sectionContent[section.id] && (
                    <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                      Generated
                    </Badge>
                  )}
                  {currentSection === section.id && isGenerating && (
                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Writing
                    </Badge>
                  )}
                </div>
                
                {sectionContent[section.id] && (
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowEvidence(section.id);
                        }}
                      >
                        <Database className="h-4 w-4 mr-1" />
                        Evidence
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Evidence Sources for {section.title}</DrawerTitle>
                        <DrawerDescription>
                          The following sources were used to generate this section
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4">
                        <Tabs defaultValue="faers">
                          <TabsList className="mb-2">
                            <TabsTrigger value="faers">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              FAERS
                            </TabsTrigger>
                            <TabsTrigger value="literature">
                              <FileText className="h-3 w-3 mr-1" />
                              Literature
                            </TabsTrigger>
                            <TabsTrigger value="regulatory">
                              <Clock className="h-3 w-3 mr-1" />
                              Regulatory
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="faers">
                            {evidenceTraces[section.id] ? (
                              <div className="space-y-3">
                                {(evidenceTraces[section.id].sources || [])
                                  .filter(s => s.source_type === 'FAERS')
                                  .map((source, idx) => (
                                    <Card key={`${section.id}-faers-${idx}`}>
                                      <CardHeader className="p-3">
                                        <CardTitle className="text-sm">
                                          {source.metadata.event_type || 'Adverse Event Report'} 
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                          {source.metadata.report_date || 'No date'} • ID: {source.source_id}
                                        </CardDescription>
                                      </CardHeader>
                                      <CardContent className="px-3 py-2 text-sm border-t">
                                        {source.content}
                                      </CardContent>
                                    </Card>
                                  ))}
                              </div>
                            ) : (
                              <div className="py-8 text-center text-gray-500">
                                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
                                <p>Loading evidence sources...</p>
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="literature">
                            {evidenceTraces[section.id] ? (
                              <div className="space-y-3">
                                {(evidenceTraces[section.id].sources || [])
                                  .filter(s => s.source_type === 'PubMed')
                                  .map((source, idx) => (
                                    <Card key={`${section.id}-pubmed-${idx}`}>
                                      <CardHeader className="p-3">
                                        <CardTitle className="text-sm">
                                          {source.metadata.title || 'Journal Article'}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                          {source.metadata.authors?.join(', ') || 'Unknown authors'} • {source.metadata.journal} ({source.metadata.year})
                                        </CardDescription>
                                      </CardHeader>
                                      <CardContent className="px-3 py-2 text-sm border-t">
                                        {source.content}
                                      </CardContent>
                                      <CardFooter className="px-3 py-2 border-t">
                                        <a 
                                          href={`https://pubmed.ncbi.nlm.nih.gov/${source.source_id}`} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-xs flex items-center text-blue-600 hover:underline"
                                        >
                                          <ExternalLink className="h-3 w-3 mr-1" />
                                          View on PubMed
                                        </a>
                                      </CardFooter>
                                    </Card>
                                  ))}
                              </div>
                            ) : (
                              <div className="py-8 text-center text-gray-500">
                                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
                                <p>Loading evidence sources...</p>
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="regulatory">
                            {evidenceTraces[section.id] ? (
                              <div className="space-y-3">
                                {(evidenceTraces[section.id].sources || [])
                                  .filter(s => s.source_type !== 'FAERS' && s.source_type !== 'PubMed')
                                  .map((source, idx) => (
                                    <Card key={`${section.id}-other-${idx}`}>
                                      <CardHeader className="p-3">
                                        <CardTitle className="text-sm">
                                          {source.source_type || 'Regulatory Document'}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                          ID: {source.source_id}
                                        </CardDescription>
                                      </CardHeader>
                                      <CardContent className="px-3 py-2 text-sm border-t">
                                        {source.content}
                                      </CardContent>
                                    </Card>
                                  ))}
                              </div>
                            ) : (
                              <div className="py-8 text-center text-gray-500">
                                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
                                <p>Loading evidence sources...</p>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="outline">Close</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                )}
              </div>
              
              <AnimatePresence>
                {expandedSections[section.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4">
                      {renderSectionContent(section.id)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 text-xs text-gray-500">
        <div className="flex items-center">
          <Sparkles className="h-3 w-3 mr-1 text-primary" />
          Powered by OpenAI GPT-4o with pgvector retrieval
        </div>
      </CardFooter>
    </Card>
  );
}

export default CERStreamingGenerator;