import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Sparkles, History, Save, Download, FileUp, FileDown, Code, Undo, Redo, Check, ChevronDown, PlusCircle, MoreHorizontal } from 'lucide-react';
import HistoryModal from './HistoryModal';
import ExportModal from './ExportModal';
import coauthorService from '@/services/coauthorService';

export default function DraftEditor({ content, onChange, onGenerateDraft }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(() => countWords(content));
  const [charCount, setCharCount] = useState(() => content.length);
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [progress, setProgress] = useState({ section: '', percent: 0 });
  const textareaRef = useRef(null);
  
  // Mock socket initialization
  useEffect(() => {
    console.log("WebSocket would initialize here in the real implementation");
    // This is where we'd connect to the socket and set up listeners
    
    const mockSocket = {
      // Mock emitting to the socket
      emit: (event, data) => {
        console.log(`Mock socket emitted ${event}:`, data);
      },
      // Mock socket progress updates
      progressUpdates: setInterval(() => {
        if (isGenerating) {
          setProgress(prev => {
            const newPercent = Math.min(prev.percent + 5, 100);
            return { 
              section: '2.7', 
              percent: newPercent 
            };
          });
        }
      }, 300)
    };
    
    // Clean up interval on unmount
    return () => {
      clearInterval(mockSocket.progressUpdates);
      console.log("WebSocket would disconnect here in the real implementation");
    };
  }, [isGenerating]);
  
  // Count words in text
  function countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
  
  // Autosave effect
  useEffect(() => {
    const autosaveTimeout = setTimeout(() => {
      if (textareaRef.current) {
        const sectionId = textareaRef.current.dataset.sectionId || '2.7';
        coauthorService.saveDraft({ sectionId, content });
        console.log("Auto-saved content");
      }
    }, 2000);
    
    return () => clearTimeout(autosaveTimeout);
  }, [content]);
  
  // Update counts when content changes
  useEffect(() => {
    setWordCount(countWords(content));
    setCharCount(content.length);
  }, [content]);
  
  // Handle text changes
  const handleChange = (e) => {
    const newContent = e.target.value;
    onChange(newContent);
  };
  
  // Simulate saving
  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Draft saved",
        description: "Your document has been saved successfully.",
      });
    }, 800);
  };
  
  // Generate draft
  const handleGenerate = () => {
    setIsGenerating(true);
    setProgress({ section: '2.7', percent: 0 });
    
    // Mock socket subscription for progress updates
    console.log("Subscribing to section 2.7 progress updates");
    
    // Simulate draft generation with API
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
      
      // Call the callback if provided
      if (onGenerateDraft) {
        onGenerateDraft();
      }
      
      toast({
        title: "Draft generated",
        description: "AI has generated a draft based on ICH requirements for Section 2.7.",
      });
    }, 5000);
  };
  
  // Toggle markdown mode
  const handleToggleMarkdown = () => {
    setIsMarkdownMode(!isMarkdownMode);
    coauthorService.toggleMarkdownView();
    toast({
      title: isMarkdownMode ? "Rich text mode enabled" : "Markdown mode enabled",
      description: isMarkdownMode 
        ? "Editor now displays formatted content" 
        : "Editor now displays markdown syntax",
    });
  };
  
  // Insert placeholder
  const handleInsertPlaceholder = () => {
    coauthorService.insertPlaceholder();
    
    // In a real implementation, this would insert at cursor position
    // For now, just append a placeholder to the end
    const placeholder = "\n\n[INSERT DATA HERE]";
    onChange(content + placeholder);
    
    toast({
      title: "Placeholder inserted",
      description: "Placeholder has been added to the document.",
    });
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
  
  // Open modals
  const openHistoryModal = () => setShowHistory(true);
  const openExportModal = () => setShowExport(true);
  
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
            onClick={openHistoryModal}
          >
            <History className="h-4 w-4 mr-1" />
            <span>History</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={openExportModal}
          >
            <Download className="h-4 w-4 mr-1" />
            <span>Export</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <MoreHorizontal className="h-4 w-4 mr-1" />
                <span>More</span>
                <ChevronDown className="h-3.5 w-3.5 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleToggleMarkdown}>
                <Code className="h-4 w-4 mr-2" />
                <span>{isMarkdownMode ? 'Rich Text Mode' : 'Markdown Mode'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleInsertPlaceholder}>
                <PlusCircle className="h-4 w-4 mr-2" />
                <span>Insert Placeholder</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        {/* Real-time generation progress indicator */}
        {isGenerating && (
          <div className="p-2 bg-blue-50 animate-pulse">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center text-blue-700 text-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>Generating draft for Section 2.7 Clinical Summary...</span>
              </div>
              <span className="text-blue-600 text-sm font-medium">{progress.percent}%</span>
            </div>
            <Progress value={progress.percent} className="h-2" />
          </div>
        )}
        
        <Textarea
          ref={textareaRef}
          data-section-id="2.7"
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
      
      {/* Modals */}
      {showHistory && <HistoryModal sectionId="2.7" onClose={() => setShowHistory(false)} />}
      {showExport && <ExportModal content={content} onClose={() => setShowExport(false)} />}
    </Card>
  );
}