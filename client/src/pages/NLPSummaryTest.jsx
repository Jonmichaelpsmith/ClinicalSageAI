import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';
import FDA510kService from '../services/FDA510kService';

/**
 * NLP Summary Test Component
 * 
 * This standalone page allows testing of the NLP summarization feature
 * for the 510(k) module without navigating through the client portal.
 */
const NLPSummaryTest = () => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Handle text summarization
  const handleGenerateSummary = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter some text to summarize.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate the summary using the FDA510kService
      const generatedSummary = await FDA510kService.summarizeText(inputText);
      
      setSummary(generatedSummary);
      
      toast({
        title: "Summary Generated",
        description: "NLP summary has been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Summary Error",
        description: error.message || "Could not generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">510(k) NLP Summary Test</h1>
      
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
            <CardDescription>
              Enter text from a predicate device description or literature abstract to generate an NLP summary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter text to summarize..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px]"
            />
            
            <Button 
              onClick={handleGenerateSummary} 
              className="mt-4"
              disabled={isGenerating}
            >
              <FileText className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Summary'}
            </Button>
          </CardContent>
        </Card>
        
        {summary && (
          <Card>
            <CardHeader>
              <CardTitle>Generated NLP Summary</CardTitle>
              <CardDescription>
                The AI-generated summary of the provided text.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-100 p-4 rounded-md text-green-800">
                {summary}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NLPSummaryTest;