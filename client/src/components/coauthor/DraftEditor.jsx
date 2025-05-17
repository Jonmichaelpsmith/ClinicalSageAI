import React, { useState, useEffect, useRef } from 'react';
import coauthorService from '@/services/coauthorService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  CheckCircle2, 
  Sparkles, 
  Bot, 
  AlertTriangle,
  MessageSquare,
  BookOpenCheck,
  Lightbulb
} from 'lucide-react';

export default function DraftEditor({ content = '', onChange }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const textareaRef = useRef(null);

  // Simulate AI generation progress for demo
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsGenerating(false);
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  // Simulate suggestions based on content
  useEffect(() => {
    if (content?.length > 20) {
      // In a real implementation, this would call an API
      setSuggestions([
        {
          type: 'regulation',
          text: 'Consider adding specific reference to ICH E6(R2) guidelines for clinical study design.',
        },
        {
          type: 'clarity',
          text: 'The introduction could be more specific about the study objectives.',
        },
        {
          type: 'completeness',
          text: 'This section should include a brief summary of the safety findings.',
        }
      ]);
    } else {
      setSuggestions([]);
    }
  }, [content]);

  // Autosave drafts
  useEffect(() => {
    if (!textareaRef.current) return;
    const timeout = setTimeout(() => {
      coauthorService
        .saveDraft({ sectionId: textareaRef.current.dataset.sectionId || 'current', content })
        .catch((err) => console.error('Auto-save failed', err));
    }, 2000);
    return () => clearTimeout(timeout);
  }, [content]);

  const handleGenerateContent = () => {
    setIsGenerating(true);
    setProgress(0);
    const sectionId = textareaRef.current?.dataset.sectionId || 'current';
    coauthorService
      .generateDraft(sectionId)
      .then((draft) => {
        onChange(draft);
      })
      .catch((err) => {
        console.error('Generate failed', err);
      })
      .finally(() => setIsGenerating(false));
  };

  const handleInsertSuggestion = (suggestion) => {
    // In a real implementation, this would intelligently insert at cursor position
    // For simplicity in the demo, we'll just append
    onChange(content + "\n\n" + suggestion.text);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={isGenerating}
            onClick={handleGenerateContent}
          >
            <Sparkles className="h-4 w-4 mr-2" /> 
            Generate Content
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            disabled={isGenerating || !content}
          >
            <BookOpenCheck className="h-4 w-4 mr-2" /> 
            Check Compliance
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-xs">{progress}% complete</span>
            </>
          ) : content ? (
            <>
              <span className="text-xs text-muted-foreground">
                {content.length} characters
              </span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </>
          ) : null}
        </div>
      </div>
      
      {isGenerating && (
        <Progress value={progress} className="h-1" />
      )}
      
      <Textarea
        ref={textareaRef}
        placeholder="Start writing or generate content using AI..."
        className="min-h-[300px] resize-y font-mono"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        disabled={isGenerating}
        data-section-id="current-section"
      />
      
      {suggestions.length > 0 && (
        <div className="border rounded-md p-4 bg-slate-50">
          <div className="flex items-center mb-3">
            <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
            <h3 className="font-medium text-sm">AI Suggestions</h3>
          </div>
          
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Badge variant="outline" className="mt-0.5">
                  {suggestion.type === 'regulation' ? 'Regulation' : 
                   suggestion.type === 'clarity' ? 'Clarity' : 'Completeness'}
                </Badge>
                <div className="flex-1 text-sm">
                  {suggestion.text}
                </div>
                <Button
                  size="sm" 
                  variant="ghost"
                  className="h-6 text-xs"
                  onClick={() => handleInsertSuggestion(suggestion)}
                >
                  Insert
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button size="sm" variant="outline" className="flex items-center">
          <Bot className="h-4 w-4 mr-2" />
          Ask AI for help
        </Button>
      </div>
    </div>
  );
}