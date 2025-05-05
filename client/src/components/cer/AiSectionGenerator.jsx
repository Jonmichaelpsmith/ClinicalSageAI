import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';

/**
 * AI Section Generator for CER documents
 * 
 * This component provides an interface to generate clinical evaluation report
 * sections using AI assistance from GPT-4o.
 */
export function AiSectionGenerator({ onSectionGenerated = () => {} }) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [sectionType, setSectionType] = useState('safety-summary');
  const [context, setContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Map of section types to human-readable labels
  const sectionTypes = {
    'safety-summary': 'Safety Summary',
    'device-description': 'Device Description',
    'clinical-evaluation': 'Clinical Evaluation',
    'risk-analysis': 'Risk Analysis',
    'state-of-the-art': 'State of the Art',
    'literature-review': 'Literature Review Summary',
    'post-market-surveillance': 'Post-Market Surveillance',
    'adverse-event-assessment': 'Adverse Event Assessment',
    'conclusion': 'Conclusion',
    'executive-summary': 'Executive Summary'
  };
  
  // Generate section using AI
  const generateSection = async () => {
    if (!sectionType) {
      setError('Please select a section type');
      return;
    }
    
    try {
      setGenerating(true);
      setError(null);
      
      const response = await fetch('/api/cer/generate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          section: sectionTypes[sectionType],
          context
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate section');
      }
      
      const data = await response.json();
      setGeneratedContent(data.content);
      
    } catch (err) {
      console.error('Error generating section:', err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };
  
  // Copy generated content to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Handle section selection
  const handleSectionSelection = (value) => {
    setSectionType(value);
    // Pre-populate with appropriate prompt based on section type
    const prompts = {
      'safety-summary': 'Please include FAERS data for this product and any similar competitive products.',
      'device-description': 'This is a medical device for...',
      'risk-analysis': 'The primary risks identified include...',
      'literature-review': 'The search was conducted using PubMed and the Cochrane Library with the following keywords:'
    };
    
    if (context === '' && prompts[value]) {
      setContext(prompts[value]);
    }
  };
  
  // Use the generated content
  const useGeneratedContent = () => {
    onSectionGenerated({
      sectionType: sectionTypes[sectionType],
      content: generatedContent
    });
    setOpen(false);
    setGeneratedContent('');
  };
  
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="flex items-center"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Generate CER Section
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>AI-Assisted CER Section Generator</DialogTitle>
            <DialogDescription>
              Generate regulatory-compliant clinical evaluation report sections using GPT-4o.
            </DialogDescription>
          </DialogHeader>
          
          {!generatedContent ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="section-type" className="text-right">
                  Section Type
                </Label>
                <div className="col-span-3">
                  <Select value={sectionType} onValueChange={handleSectionSelection}>
                    <SelectTrigger id="section-type">
                      <SelectValue placeholder="Select section type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sectionTypes).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="context" className="text-right">
                  Context & Information
                </Label>
                <div className="col-span-3">
                  <Textarea
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Provide relevant information, data, and context for this section..."
                    className="min-h-[150px]"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Include product details, relevant data, and specific requirements to improve output quality.
                  </p>
                </div>
              </div>
              
              {error && (
                <div className="col-span-4 px-4 py-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="py-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{sectionTypes[sectionType]}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-8"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-3 w-3" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-3 w-3" /> Copy
                    </>
                  )}
                </Button>
              </div>
              
              <div className="bg-muted rounded-md p-4 max-h-[300px] overflow-y-auto whitespace-pre-wrap text-sm">
                {generatedContent}
              </div>
            </div>
          )}
          
          <DialogFooter>
            {!generatedContent ? (
              <>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={generateSection} disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setGeneratedContent('')}>
                  Back
                </Button>
                <Button onClick={useGeneratedContent}>
                  Use This Content
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
