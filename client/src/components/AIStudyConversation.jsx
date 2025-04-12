import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Search, Bot, User, ArrowDown, Copy, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from "lucide-react";

const MessageBubble = ({ message, isAI }) => {
  const { toast } = useToast();
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      title: "Copied to clipboard",
      description: "Message content copied"
    });
  };
  
  return (
    <div className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isAI ? 'bg-primary/10' : 'bg-secondary/50'}`}>
        {isAI ? <Bot className="h-4 w-4 text-primary" /> : <User className="h-4 w-4" />}
      </div>
      <div className="relative max-w-[80%]">
        <div className={`p-3 rounded-lg ${isAI ? 'bg-primary/5 text-slate-800' : 'bg-secondary/20 text-slate-900'}`}>
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        </div>
        {isAI && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute -bottom-6 right-0 h-6 w-6 p-0"
            onClick={copyToClipboard}
          >
            <Copy className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

const AIStudyConversation = ({ selectedStudy, queryGoal }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  // Set initial message based on the selected study
  useEffect(() => {
    if (selectedStudy) {
      const initialMessages = [
        {
          role: 'system',
          content: `You're now analyzing a clinical study report (CSR) with the following details:
Title: ${selectedStudy.title}
Sponsor: ${selectedStudy.sponsor}
Indication: ${selectedStudy.indication}
Phase: ${selectedStudy.phase}
${selectedStudy.sampleSize ? `Sample Size: ${selectedStudy.sampleSize}` : ''}

Primary Objective: ${selectedStudy.primaryObjective}
${selectedStudy.secondaryObjectives ? `Secondary Objectives: ${selectedStudy.secondaryObjectives}` : ''}
${selectedStudy.endpoints && selectedStudy.endpoints.length > 0 ? `Endpoints: ${selectedStudy.endpoints.join(', ')}` : ''}

I'll be analyzing this study in comparison to the following study goal:
"${queryGoal}"

How can I help you analyze this study?`
        },
        {
          role: 'assistant',
          content: `I'm analyzing the selected study: "${selectedStudy.title}".

This is a ${selectedStudy.phase} trial for ${selectedStudy.indication} conducted by ${selectedStudy.sponsor}.

The primary objective is: "${selectedStudy.primaryObjective}"

What specific aspects would you like to know about this study in relation to your research goals? You can ask about:
• How this study compares to your goals
• Study design elements that match your needs
• Endpoint selection and justification
• Sample size considerations
• Potential challenges or limitations
• Statistical approaches used`
        }
      ];
      
      setConversation(initialMessages);
    }
  }, [selectedStudy, queryGoal]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: query
    };
    
    setConversation(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/csr/query-study', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studyId: selectedStudy.id,
          userGoal: queryGoal,
          conversation: [...conversation, userMessage]
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }
      
      const data = await response.json();
      
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }]);
    } catch (error) {
      console.error('Error querying AI:', error);
      toast({
        title: "Query failed",
        description: error.message || "Failed to get a response",
        variant: "destructive"
      });
      
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestedQueries = () => {
    const suggestions = [
      "How does this study's sample size compare to similar trials?",
      "What are the key differences between this study's design and my goals?",
      "What statistical methods were used for the primary endpoint?",
      "How were adverse events handled in this study?",
      "What inclusion/exclusion criteria were used?",
      "Explain the rationale behind the endpoint selection"
    ];
    
    return suggestions;
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
  };

  if (!selectedStudy) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>AI Study Analysis</CardTitle>
          <CardDescription>
            Select a study from the results to analyze with AI
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <Search className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500">
              Select a study from the results list to start analyzing
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>AI Study Analysis</CardTitle>
            <CardDescription className="mt-1">
              Ask questions about this study in relation to your goals
            </CardDescription>
          </div>
          <Badge variant="outline">
            {selectedStudy.id}
          </Badge>
        </div>
        <div className="mt-2">
          <h3 className="text-sm font-medium">{selectedStudy.title}</h3>
          <div className="flex gap-2 mt-1 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {selectedStudy.phase}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {selectedStudy.sponsor}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {selectedStudy.indication}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="flex-1 overflow-hidden pt-4 px-4 pb-0">
        <ScrollArea className="h-[450px] pr-4">
          {conversation
            .filter(msg => msg.role !== 'system')
            .map((message, index) => (
              <MessageBubble
                key={index}
                message={message}
                isAI={message.role === 'assistant'}
              />
            ))}
          <div ref={messagesEndRef} />
          
          {loading && (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="flex-col space-y-4 pt-2">
        <div className="w-full overflow-x-auto pb-2">
          <div className="flex gap-2">
            {generateSuggestedQueries().map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-xs h-7"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            placeholder="Ask about this study..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !query.trim()}>
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AIStudyConversation;