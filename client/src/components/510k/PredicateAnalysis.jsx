import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Save, Clipboard, CalendarClock, FileCheck2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Editor } from '@/components/ui/editor';
import PredicateSearch from './PredicateSearch';
import EquivalenceTable from './EquivalenceTable';
import { useTenant } from '@/contexts/TenantContext';

/**
 * PredicateAnalysis Component
 * 
 * This component provides a complete workflow for finding predicate devices,
 * analyzing substantial equivalence, and drafting the SE section for the 510(k).
 */
const PredicateAnalysis = ({ 
  deviceProfile, 
  onDraftFinalize, 
  onNavigateBack,
  onSaveDraft,
  initialDraft = null 
}) => {
  const [activeTab, setActiveTab] = useState('search');
  const [selectedPredicate, setSelectedPredicate] = useState(null);
  const [draftText, setDraftText] = useState('');
  const [editorValue, setEditorValue] = useState('');
  const { toast } = useToast();
  const { currentOrganization } = useTenant();

  // Initialize editor with initial draft if available
  useEffect(() => {
    if (initialDraft) {
      setDraftText(initialDraft);
      setEditorValue(initialDraft);
      setActiveTab('editor');
    }
  }, [initialDraft]);

  // Handle predicate device selection
  const handlePredicateSelect = (predicate) => {
    setSelectedPredicate(predicate);
    setActiveTab('analysis');
    
    toast({
      title: "Predicate Device Selected",
      description: `${predicate.deviceName} (${predicate.kNumber}) has been selected as your predicate device.`,
      duration: 3000,
    });
  };

  // Handle substantial equivalence draft generation
  const handleDraftGenerate = (generatedText) => {
    setDraftText(generatedText);
    setEditorValue(generatedText);
    setActiveTab('editor');
    
    toast({
      title: "Draft Generated",
      description: "Substantial Equivalence section has been drafted. You can now edit and finalize it.",
      duration: 3000,
    });
  };

  // Handle editor content change
  const handleEditorChange = (value) => {
    setEditorValue(value);
  };

  // Save draft to parent component
  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(editorValue, selectedPredicate);
      
      toast({
        title: "Draft Saved",
        description: "Your Substantial Equivalence draft has been saved.",
        duration: 3000,
      });
    }
  };

  // Finalize draft and add to 510(k) report
  const handleFinalize = () => {
    if (onDraftFinalize) {
      onDraftFinalize({
        content: editorValue,
        predicateDevice: selectedPredicate,
        sectionKey: 'substantialEquivalence',
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Section Added to Report",
        description: "The Substantial Equivalence section has been added to your 510(k) report.",
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex flex-col w-full h-full space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {onNavigateBack && (
            <Button variant="ghost" size="sm" onClick={onNavigateBack} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <h2 className="text-xl font-semibold">Predicate Device Analysis</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {activeTab === 'editor' && (
            <>
              <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-1" />
                Save Draft
              </Button>
              <Button size="sm" onClick={handleFinalize}>
                <FileCheck2 className="h-4 w-4 mr-1" />
                Add to Report
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="search" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Find Predicate
          </TabsTrigger>
          <TabsTrigger 
            value="analysis" 
            className="flex items-center"
            disabled={!selectedPredicate}
          >
            <Clipboard className="h-4 w-4 mr-2" />
            Equivalence Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="editor" 
            className="flex items-center"
            disabled={!draftText}
          >
            <CalendarClock className="h-4 w-4 mr-2" />
            Draft SE Section
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 relative">
          <TabsContent value="search" className="absolute inset-0 overflow-auto">
            <PredicateSearch 
              onPredicateSelect={handlePredicateSelect}
              deviceProfile={deviceProfile}
            />
          </TabsContent>
          
          <TabsContent value="analysis" className="absolute inset-0 overflow-auto">
            {selectedPredicate ? (
              <EquivalenceTable 
                deviceProfile={deviceProfile}
                predicateDevice={selectedPredicate}
                onDraftGenerate={handleDraftGenerate}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Equivalence Analysis</CardTitle>
                  <CardDescription>
                    Please select a predicate device first
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setActiveTab('search')}>
                    Find Predicate Device
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="editor" className="absolute inset-0 overflow-hidden flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Substantial Equivalence Draft
                </CardTitle>
                <CardDescription>
                  Edit the draft below to finalize your substantial equivalence statement
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 pb-0">
                <div className="border rounded-md h-full mx-6">
                  <Editor 
                    value={editorValue}
                    onChange={handleEditorChange}
                    placeholder="Substantial equivalence content will appear here..."
                  />
                </div>
              </CardContent>
              
              <CardFooter className="pt-4 flex justify-end space-x-2">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Draft
                </Button>
                <Button onClick={handleFinalize}>
                  <FileCheck2 className="h-4 w-4 mr-1" />
                  Add to Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default PredicateAnalysis;