import React, { useState, useRef, useEffect } from 'react';
import { Send, Clipboard, Check, AlertCircle, FileText, CheckCircle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const priorityColors = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500"
};

/**
 * ICH Wiz Sidebar Component
 * 
 * This component provides an interface to interact with the ICH Wiz agent,
 * an AI-powered ICH guidelines specialist that can answer questions about
 * ICH compliance and suggest tasks.
 */
function ICHWizSidebar({ source = "general", context = {} }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('answer');
  const [copiedCitation, setCopiedCitation] = useState(null);
  const [copiedTask, setCopiedTask] = useState(null);
  const inputRef = useRef(null);
  const { toast } = useToast();
  
  const submitQuery = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/ich-wiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          source,
          context,
          max_results: 5
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      setCurrentAnswer(result);
      setHistory(prev => [result, ...prev].slice(0, 10));
      setActiveTab('answer');
      setQuery('');
    } catch (error) {
      console.error('Error submitting query:', error);
      toast({
        title: "Error",
        description: `Failed to get response from ICH Wiz: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      submitQuery();
    }
  };
  
  const copyToClipboard = (text, type, id) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'citation') {
        setCopiedCitation(id);
        setTimeout(() => setCopiedCitation(null), 2000);
      } else {
        setCopiedTask(id);
        setTimeout(() => setCopiedTask(null), 2000);
      }
      
      toast({
        title: "Copied to clipboard",
        description: "The text has been copied to your clipboard.",
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Copy failed",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      });
    });
  };
  
  // Reset component when source changes
  useEffect(() => {
    setCurrentAnswer(null);
    setQuery('');
    setActiveTab('answer');
  }, [source]);
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-orange-50 to-white border-l">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-orange-600">ICH Wiz</span>
          <Badge variant="outline" className="bg-orange-50">
            ICH Guidelines Specialist
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Ask me about ICH guidelines and regulatory compliance
        </p>
      </div>
      
      {/* Query input */}
      <div className="p-4 border-b bg-white">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about ICH guidelines..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={submitQuery} 
            disabled={isLoading || !query.trim()}
            size="icon"
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Response area */}
      {currentAnswer ? (
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-4 border-b bg-white">
              <TabsList className="w-full justify-start h-12">
                <TabsTrigger value="answer" className="data-[state=active]:bg-orange-50">
                  Answer
                </TabsTrigger>
                <TabsTrigger value="citations" className="data-[state=active]:bg-orange-50">
                  Citations ({currentAnswer.citations.length})
                </TabsTrigger>
                <TabsTrigger value="tasks" className="data-[state=active]:bg-orange-50">
                  Tasks ({currentAnswer.tasks.length})
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="answer" className="flex-1 p-0 m-0 overflow-auto">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Query:</span> {currentAnswer.query}
                  </div>
                  <div className="whitespace-pre-wrap">{currentAnswer.answer}</div>
                  <div className="text-xs text-gray-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" /> 
                    Processed in {currentAnswer.processing_time.toFixed(2)}s
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="citations" className="flex-1 p-0 m-0 overflow-auto">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {currentAnswer.citations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No citations available for this query
                    </div>
                  ) : (
                    currentAnswer.citations.map((citation, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="bg-blue-50 mb-2">
                              {citation.source}
                            </Badge>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => copyToClipboard(citation.text, 'citation', index)}
                                  >
                                    {copiedCitation === index ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Clipboard className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy citation text</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="text-sm whitespace-pre-wrap">
                            {citation.text}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Relevance: {Math.round(citation.relevance * 100)}%
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="tasks" className="flex-1 p-0 m-0 overflow-auto">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {currentAnswer.tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No suggested tasks for this query
                    </div>
                  ) : (
                    currentAnswer.tasks.map((task, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <Badge className={`${priorityColors[task.priority]} text-white mb-2`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                            </Badge>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => copyToClipboard(task.task, 'task', index)}
                                  >
                                    {copiedTask === index ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Clipboard className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy task</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="font-medium">{task.task}</div>
                          <div className="mt-2 text-sm text-gray-500">
                            {task.rationale}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">Ask ICH Wiz About Guidelines</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            Get expert answers and actionable tasks related to ICH guidelines and regulatory compliance.
          </p>
          <div className="mt-8 space-y-2 w-full max-w-xs">
            <Button 
              variant="outline" 
              className="w-full justify-start text-left"
              onClick={() => setQuery("What are the main requirements for ICH E6(R2) GCP compliance?")}
            >
              GCP compliance requirements
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left"
              onClick={() => setQuery("Explain ICH Q9 Quality Risk Management principles")}
            >
              Quality Risk Management
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left"
              onClick={() => setQuery("What are the key considerations for eCTD submissions?")}
            >
              eCTD submission guidance
            </Button>
          </div>
        </div>
      )}
      
      {/* History indicator */}
      {history.length > 1 && (
        <div className="p-3 border-t bg-white text-center">
          <Button
            variant="ghost"
            className="text-xs text-gray-500 hover:text-gray-700"
            onClick={() => {
              const newHistory = [...history];
              // Remove current answer from history
              newHistory.shift();
              // Set the next item as current
              setCurrentAnswer(newHistory[0]);
              // Update history
              setHistory(newHistory);
            }}
          >
            Show previous query
          </Button>
        </div>
      )}
    </div>
  );
}

export default ICHWizSidebar;