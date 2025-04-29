import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Sparkles, History, Save, Download, FileUp, FileDown, Code, Undo, Redo, Check } from 'lucide-react';

export default function DraftEditor({ content, onChange, onGenerateDraft }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(() => countWords(content));
  const [charCount, setCharCount] = useState(() => content.length);
  const textareaRef = useRef(null);
  
  // Count words in text
  function countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
  
  // Handle text changes
  const handleChange = (e) => {
    const newContent = e.target.value;
    onChange(newContent);
    setWordCount(countWords(newContent));
    setCharCount(newContent.length);
  };
  
  // Simulate saving
  const handleSave = () => {
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Draft saved",
        description: "Your document has been saved successfully.",
      });
    }, 800);
  };
  
  // Simulate draft generation
  const handleGenerate = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      setIsGenerating(false);
      
      // Example of generated content
      const generatedContent = `
# 2.7 Clinical Summary

## Introduction
This clinical summary provides a comprehensive analysis of the clinical studies conducted for [Product Name], a novel therapeutic agent for the treatment of [Indication]. The document presents an integrated assessment of efficacy and safety data from [Number] clinical trials involving [Number] patients.

## Overview of Clinical Development Program
The clinical development program consisted of [Number] Phase I studies in healthy volunteers, [Number] Phase II studies in patients with [Indication], and [Number] pivotal Phase III trials. These studies evaluated the safety, efficacy, pharmacokinetics, and dose-response characteristics of [Product Name].

## Efficacy Results
Across the Phase III program, [Product Name] demonstrated statistically significant improvements in the primary endpoint of [Primary Endpoint] compared to placebo (p<0.001). The treatment effect was consistent across demographic subgroups and was maintained throughout the [Duration] treatment period.

Key efficacy findings include:
- [Finding 1]
- [Finding 2]
- [Finding 3]

## Safety Profile
The safety profile of [Product Name] was characterized by a low incidence of serious adverse events (SAEs). The most common adverse events were [AE 1], [AE 2], and [AE 3], which were generally mild to moderate in severity and transient in nature.

Long-term safety data from the extension studies showed no new safety signals emerging with continued treatment for up to [Duration].

## Benefit-Risk Assessment
Based on the efficacy and safety data presented, [Product Name] demonstrates a favorable benefit-risk profile for patients with [Indication], providing a clinically meaningful improvement in [Benefit] with a well-characterized and manageable safety profile.
`;
      
      onChange(generatedContent);
      setWordCount(countWords(generatedContent));
      setCharCount(generatedContent.length);
      
      // Call the callback if provided
      if (onGenerateDraft) {
        onGenerateDraft();
      }
      
      toast({
        title: "Draft generated",
        description: "AI has generated a draft based on ICH requirements for Section 2.7.",
      });
    }, 2000);
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter to generate content
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
    
    // Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };
  
  return (
    <Card className="shadow-md">
      <div className="border-b p-2 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-600 border-t-transparent mr-1" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                <span>Save</span>
              </>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
          >
            <History className="h-4 w-4 mr-1" />
            <span>History</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
          >
            <Download className="h-4 w-4 mr-1" />
            <span>Export</span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Format"
          >
            <Code className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Import File"
          >
            <FileUp className="h-4 w-4" />
          </Button>
          
          <div className="border-l h-6 mx-1"></div>
          
          <Button
            variant="secondary"
            size="sm"
            className="h-8 gap-1.5"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Draft</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      <CardContent className="p-0">
        <Textarea
          ref={textareaRef}
          className="rounded-none border-0 min-h-[400px] focus-visible:ring-0 resize-none p-4 font-mono text-sm"
          placeholder="Start drafting your document here or use the Generate Draft button to create AI-powered content..."
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        
        <div className="border-t p-2 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>
          
          <div className="flex items-center">
            <Check className="h-3.5 w-3.5 text-green-500 mr-1" />
            <span>Autosaved at {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}