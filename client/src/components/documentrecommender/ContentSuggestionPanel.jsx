import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Lightbulb, Copy, ListChecks, AlertTriangle, FilePlus2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * ContentSuggestionPanel Component
 * 
 * Displays content suggestions for a selected document section, including
 * regulatory requirements, key points to include, and sample content.
 */
const ContentSuggestionPanel = ({ suggestions = [], sectionKey, onBack }) => {
  const { toast } = useToast();

  // Copy suggestion content to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "The content suggestion has been copied to your clipboard.",
          duration: 3000,
        });
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      });
  };

  // Get section name from key
  const getSectionName = (key) => {
    // Convert snake_case or camelCase to human-readable text
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^\w/, c => c.toUpperCase())
      .trim();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Recommendations
          </Button>
          <h3 className="font-medium">{getSectionName(sectionKey)}</h3>
        </div>
      </div>
      
      {suggestions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Lightbulb className="h-10 w-10 mx-auto mb-4 opacity-50" />
          <p>No content suggestions available for this section.</p>
          <p className="text-sm">Try selecting a different section or contact support.</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-4 pr-4">
            {suggestions.map((suggestion, index) => (
              <SuggestionCard 
                key={index} 
                suggestion={suggestion} 
                onCopy={() => handleCopy(suggestion.content)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

// Sub-component for displaying individual suggestion cards
const SuggestionCard = ({ suggestion, onCopy }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <Lightbulb className="h-4 w-4 mr-2 text-primary" />
              <h4 className="font-medium text-sm">{suggestion.title}</h4>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={onCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        {suggestion.regulatoryRequirements && suggestion.regulatoryRequirements.length > 0 && (
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              <h5 className="text-xs font-medium">Regulatory Requirements</h5>
            </div>
            <ul className="text-xs space-y-1">
              {suggestion.regulatoryRequirements.map((req, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-1">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {suggestion.keyPoints && suggestion.keyPoints.length > 0 && (
          <div className="p-4 border-b">
            <div className="flex items-center mb-2">
              <ListChecks className="h-4 w-4 mr-2 text-primary" />
              <h5 className="text-xs font-medium">Key Points to Include</h5>
            </div>
            <ul className="text-xs space-y-1">
              {suggestion.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <FilePlus2 className="h-4 w-4 mr-2 text-primary" />
              <h5 className="text-xs font-medium">Suggested Content</h5>
            </div>
            <Badge variant="outline" className="text-xs">
              {suggestion.contentType || 'Text'}
            </Badge>
          </div>
          <div className="text-xs whitespace-pre-wrap bg-muted/30 p-3 rounded-md">
            {suggestion.content}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentSuggestionPanel;