import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Info, Edit3, Check, Sparkles, PanelLeft, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function DraftEditor({ content, onChange, onGenerateDraft }) {
  const [editorContent, setEditorContent] = useState(content || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const textareaRef = useRef(null);

  // Sync with parent content when it changes
  useEffect(() => {
    if (content !== editorContent) {
      setEditorContent(content);
    }
  }, [content]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Detect Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerateDraft();
    }
  };

  const handleTextChange = (e) => {
    setEditorContent(e.target.value);
    onChange && onChange(e.target.value);
  };

  const handleGenerateDraft = async () => {
    try {
      setIsGenerating(true);
      // In a real implementation, this would call the API
      // In this demo, we'll simulate AI generation with a timeout
      setTimeout(() => {
        const generatedContent = `# 2.7 Clinical Summary

## 2.7.1 Summary of Biopharmaceutic Studies and Associated Analytical Methods

The biopharmaceutic development program for ENZYCURE (enzabidol) comprised a comprehensive set of studies designed to characterize the formulation's performance across various conditions.

### Bioavailability
Single-dose bioavailability studies demonstrated that ENZYCURE achieves therapeutic plasma concentrations within 2.1 ± 0.3 hours post-administration. The absolute bioavailability was determined to be 78.4% (90% CI: 74.2%-82.6%), indicating good oral absorption.

### Comparative BA/BE Studies
Bioequivalence was demonstrated between the clinical trial formulation and the commercial formulation, with the 90% confidence intervals for AUC and Cmax ratio falling within the accepted range of 80-125%.

## 2.7.2 Summary of Clinical Pharmacology Studies

### Mechanism of Action
ENZYCURE is a selective alpha-glucosidase inhibitor that acts by competitively blocking the enzyme responsible for carbohydrate digestion in the small intestine. This mechanism results in delayed glucose absorption and reduced postprandial hyperglycemia.

### Drug-Drug Interaction Potential
In vitro studies identified ENZYCURE as a weak inhibitor of CYP3A4 and P-glycoprotein. Clinical studies confirmed that no dosage adjustments are required when co-administered with common medications including metformin, glyburide, and simvastatin.

## 2.7.3 Summary of Clinical Efficacy

The clinical development program for ENZYCURE included 4 Phase 1 studies, 2 Phase 2 studies, and 3 pivotal Phase 3 studies. In total, 3,247 subjects participated across all studies, with 1,892 subjects receiving ENZYCURE at the proposed therapeutic dose.

### Study ENZ-301
This pivotal 26-week, randomized, double-blind, placebo-controlled study enrolled 734 patients with Type 2 diabetes. ENZYCURE demonstrated statistically significant reductions in HbA1c compared to placebo (-0.8% vs -0.1%, p<0.0001).

## 2.7.4 Summary of Clinical Safety

The safety profile of ENZYCURE has been characterized across 9 clinical studies involving 2,418 subjects exposed to the drug. The most common adverse events (≥5% and greater than placebo) were gastrointestinal in nature, including flatulence (12.3%), diarrhea (8.7%), and abdominal discomfort (6.4%).

No deaths were attributed to the study medication.`;
        setEditorContent(generatedContent);
        onChange && onChange(generatedContent);
        setIsGenerating(false);
        toast({
          title: "Draft generated",
          description: "Clinical Summary draft has been generated successfully.",
        });
      }, 2000);
    } catch (error) {
      console.error('Error generating draft:', error);
      setIsGenerating(false);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: "Could not generate the draft. Please try again.",
      });
    }
  };

  return (
    <Card className="shadow-md">
      <CardContent className="p-0">
        <div className="flex items-center justify-between bg-gray-50 p-3 border-b">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-gray-500 gap-1.5"
            >
              <PanelLeft className="h-4 w-4" />
              {showSidebar ? "Hide" : "Show"} Controls
            </Button>
            
            <div className="ml-4 flex items-center text-xs text-gray-500">
              <Info className="h-3.5 w-3.5 mr-1" />
              <span>Use markdown for formatting</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Save</span>
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={handleGenerateDraft}
              disabled={isGenerating}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate</span>
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <Textarea
            ref={textareaRef}
            value={editorContent}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Start drafting your section content here. Use Ctrl+Enter or Cmd+Enter to generate content with AI assistance."
            className="min-h-[600px] font-mono text-sm leading-relaxed resize-y"
          />
          
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <div>
              {isGenerating ? (
                <span className="flex items-center text-blue-600">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Generating content...
                </span>
              ) : (
                <span>Press Ctrl+Enter or Cmd+Enter to generate content</span>
              )}
            </div>
            <div>{editorContent.length} characters</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}