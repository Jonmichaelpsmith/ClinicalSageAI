import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Send, RefreshCw, Sparkles, Info, PlusCircle, BookText, FileText } from 'lucide-react';
import { cerApiService } from '../../services/CerAPIService';

/**
 * CER Assistant Panel
 * 
 * AI-powered assistant panel for answering regulatory compliance questions
 * and providing guidance on CER development.
 */
export function CerAssistantPanel({ 
  deviceInfo, 
  sections = [],
  onAddSuggestion,
}) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [model, setModel] = useState('gpt-4o');
  const chatEndRef = useRef(null);
  
  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);
  
  // Function to send query to the AI assistant
  const handleSendQuery = async () => {
    if (!query.trim()) return;
    
    try {
      // Add user query to history
      setHistory(prev => [...prev, { role: 'user', content: query }]);
      setLoading(true);
      setError(null);
      
      // Prepare context based on current device and sections
      const context = {
        deviceName: deviceInfo?.name || '',
        deviceClassification: deviceInfo?.classification || '',
        deviceCategory: deviceInfo?.category || '',
        numSections: sections.length,
        sectionTypes: sections.map(s => s.type).join(', ')
      };
      
      // Call API to get assistant response
      const result = await cerApiService.getAssistantResponse(query, context);
      
      // Add assistant response to history
      setHistory(prev => [...prev, { role: 'assistant', content: result.response }]);
      setModel(result.model || 'gpt-4o');
      
      // Clear input field
      setQuery('');
    } catch (err) {
      console.error('Assistant error:', err);
      setError(err.message || 'Failed to get response from assistant');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to add suggestion to a section
  const handleAddSuggestion = (suggestion) => {
    if (typeof onAddSuggestion === 'function') {
      onAddSuggestion(suggestion);
    }
  };
  
  const handleKeyDown = (e) => {
    // Submit on Enter (but not with Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  };
  
  // Format assistant responses with better styling
  const formatResponse = (text) => {
    // Apply basic markdown-like formatting
    return text
      .split('\n')
      .map((line, index) => {
        // Heading formatting
        if (line.startsWith('# ')) {
          return (
            <h3 className="text-lg font-bold mt-3 mb-1" key={index}>
              {line.replace('# ', '')}
            </h3>
          );
        }
        
        // Secondary heading
        if (line.startsWith('## ')) {
          return (
            <h4 className="text-md font-semibold mt-2 mb-1" key={index}>
              {line.replace('## ', '')}
            </h4>
          );
        }
        
        // List items
        if (line.match(/^\d+\. /)) {
          return (
            <div className="ml-3 my-0.5 flex" key={index}>
              <span className="mr-1">{line.match(/^\d+\. /)[0]}</span>
              <span>{line.replace(/^\d+\. /, '')}</span>
            </div>
          );
        }
        if (line.match(/^- /)) {
          return (
            <div className="ml-3 my-0.5 flex" key={index}>
              <span className="mr-1">•</span>
              <span>{line.replace(/^- /, '')}</span>
            </div>
          );
        }
        
        // Empty lines
        if (line === '') {
          return <div className="h-2" key={index}></div>;
        }
        
        // Detect potential suggestions
        if (line.toLowerCase().includes('suggest') || line.toLowerCase().includes('recommend')) {
          return (
            <div className="flex justify-between items-start my-1" key={index}>
              <p>{line}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 h-5 flex-shrink-0" 
                onClick={() => handleAddSuggestion(line)}
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Add</span>
              </Button>
            </div>
          );
        }
        
        // Regular text
        return <p className="my-1.5" key={index}>{line}</p>;
      });
  };
  
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Regulatory Assistant</CardTitle>
            <CardDescription>
              Ask questions about CER development and compliance
            </CardDescription>
          </div>
          <Badge className="bg-blue-600 hover:bg-blue-700">
            <Sparkles className="h-3 w-3 mr-1" />
            {model || 'AI'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto mb-0 pb-0">
        {history.length === 0 ? (
          <div className="flex flex-col h-full justify-center items-center text-center text-muted-foreground">
            <Sparkles className="h-10 w-10 mb-3 opacity-50" />
            <h3 className="font-medium text-lg mb-1">AI Regulatory Assistant</h3>
            <p className="max-w-md mb-4">
              Ask questions about regulatory compliance, CER development, or how to improve specific sections.  
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-md">
              <Button variant="outline" size="sm" onClick={() => setQuery('How do I ensure my CER meets EU MDR requirements?')}>
                <BookText className="h-3.5 w-3.5 mr-1" />
                EU MDR compliance
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuery('What should be included in a literature review section?')}>
                <FileText className="h-3.5 w-3.5 mr-1" />
                Literature review help
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuery('How to improve the clinical evaluation section?')}>
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                Improve clinical evaluation
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuery('What are FDA requirements for clinical evidence?')}>
                <Info className="h-3.5 w-3.5 mr-1" />
                FDA requirements
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((msg, index) => (
              <div key={index} className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <div className={`rounded-lg px-4 py-2 max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="assistant-message">
                      {formatResponse(msg.content)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-800">
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    <p>Thinking...</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </CardContent>
      
      {error && (
        <div className="px-6 pb-2 pt-2">
          <div className="text-red-500 text-sm">Error: {error}</div>
        </div>
      )}
      
      <CardFooter className="pt-4 pb-6">
        <div className="flex w-full items-center space-x-2">
          <Textarea
            placeholder="Ask about regulatory compliance or CER development..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px]"
            disabled={loading}
          />
          <Button 
            onClick={handleSendQuery} 
            disabled={!query.trim() || loading}
            className="px-3"
          >
            {loading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}