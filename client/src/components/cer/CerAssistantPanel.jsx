import React, { useState, useEffect } from 'react';
import { cerApiService } from '@/services/CerAPIService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, RefreshCw, MessageSquare, PlusCircle, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function CerAssistantPanel({ sections, title, faers }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [section, setSection] = useState(null);
  const { toast } = useToast();
  const messagesEndRef = React.useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load stored chat history if any
  useEffect(() => {
    const storedMessages = localStorage.getItem('cerChatHistory');
    if (storedMessages) {
      try {
        setMessages(JSON.parse(storedMessages));
      } catch (e) {
        console.error('Failed to parse stored messages', e);
      }
    }
  }, []);

  // Save chat history when it changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('cerChatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  // Send question to AI Assistant
  const sendQuestion = async () => {
    if (!query.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Call AI Assistant API
      const response = await cerApiService.askCerAssistant({
        question: query,
        context: {
          sections,
          title,
          faers,
          selectedSection: section
        }
      });
      
      // Add AI response
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.answer,
        references: response.references || [],
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Assistant error:', error);
      toast({
        title: 'Failed to get response',
        description: error.message || 'An error occurred while processing your question',
        variant: 'destructive'
      });
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I\'m sorry, I encountered an error processing your question. Please try again.',
        error: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  // Format the timestamp
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Filter sections to those with content for selection in the chat
  const availableSections = sections.filter(s => s.content?.length > 0);
  
  // Select a specific section for context
  const handleSectionSelect = (sectionId) => {
    const selected = sections.find(s => s.id === sectionId);
    setSection(selected);
    
    toast({
      title: 'Section selected',
      description: `Now discussing: ${selected.title}`,
    });
  };

  // Clear the chat history
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('cerChatHistory');
    setSection(null);
    
    toast({
      title: 'Chat cleared',
      description: 'All messages have been cleared.',
    });
  };

  return (
    <div className="bg-white p-4 border border-[#E1DFDD] rounded h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-[#E1DFDD] pb-3 mb-3">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-[#0F6CBD] mr-2" />
          <h3 className="text-base font-semibold text-[#323130]">AI Assistant</h3>
        </div>
        <div className="flex space-x-2">
          {section && (
            <Badge variant="outline" className="text-xs bg-[#E5F2FF] text-[#0F6CBD] border-[#0F6CBD] px-2 py-0.5">
              <PlusCircle className="h-3 w-3 mr-1" />
              <span>Section: {section.title}</span>
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearChat}
            className="h-7 text-xs text-[#616161] hover:text-[#D83B01] hover:bg-[#FFF4CE]"
          >
            Clear chat
          </Button>
        </div>
      </div>

      {/* Sections selector */}
      {availableSections.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          <div className="w-full">
            <p className="text-xs text-[#616161] mb-2">
              <Lightbulb className="h-3 w-3 inline mr-1 text-[#0F6CBD]" />
              Select a section to ask specific questions about it:
            </p>
          </div>
          {availableSections.map((s) => (
            <Button
              key={s.id}
              variant="outline"
              size="sm"
              onClick={() => handleSectionSelect(s.id)}
              className={`text-xs h-7 px-2 ${section?.id === s.id ? 'bg-[#EFF6FC] border-[#0F6CBD] text-[#0F6CBD]' : 'border-[#E1DFDD] text-[#616161]'}`}
            >
              {s.title}
            </Button>
          ))}
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto mb-4 pr-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-[#EFF6FC] p-3 rounded-full mb-3">
              <MessageSquare className="h-8 w-8 text-[#0F6CBD]" />
            </div>
            <h4 className="text-sm font-medium text-[#323130] mb-1">AI Assistant</h4>
            <p className="text-xs text-[#616161] max-w-xs">
              Ask questions about your Clinical Evaluation Report, regulatory compliance, or FAERS data interpretation.
            </p>
            <div className="mt-6 space-y-2 w-full max-w-md">
              <Button
                variant="outline"
                className="w-full justify-start text-left text-xs h-auto py-2 border-[#E1DFDD] hover:bg-[#EFF6FC] hover:text-[#0F6CBD]"
                onClick={() => setQuery("How is my compliance score calculated?")}
              >
                <span>How is my compliance score calculated?</span>
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start text-left text-xs h-auto py-2 border-[#E1DFDD] hover:bg-[#EFF6FC] hover:text-[#0F6CBD]"
                onClick={() => setQuery("What improvements would make my report more compliant?")}
              >
                <span>What improvements would make my report more compliant?</span>
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start text-left text-xs h-auto py-2 border-[#E1DFDD] hover:bg-[#EFF6FC] hover:text-[#0F6CBD]"
                onClick={() => setQuery("Explain the FAERS safety data for my product")}
              >
                <span>Explain the FAERS safety data for my product</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 p-3 rounded-lg ${message.role === 'user' 
                    ? 'bg-[#EFF6FC] text-[#323130]' 
                    : message.error 
                      ? 'bg-[#FDE7E9] text-[#D83B01] border border-[#D83B01]' 
                      : 'bg-white border border-[#E1DFDD]'}`}
                >
                  <div className="text-sm">{message.content}</div>
                  {message.references && message.references.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#E1DFDD] text-xs text-[#616161]">
                      <div className="font-medium mb-1">References:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {message.references.map((ref, index) => (
                          <li key={index}>{ref}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="text-right mt-1">
                    <span className="text-xs text-[#616161]">{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="border-t border-[#E1DFDD] pt-3">
        <div className="flex">
          <Textarea
            placeholder="Ask a question about your CER..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 resize-none border-[#E1DFDD] focus:border-[#0F6CBD] focus:ring-1 focus:ring-[#0F6CBD]"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendQuestion();
              }
            }}
          />
          <Button
            className="ml-2 self-end bg-[#0F6CBD] hover:bg-[#115EA3] text-white"
            onClick={sendQuestion}
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}