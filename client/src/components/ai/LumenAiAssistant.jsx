// client/src/components/ai/LumenAiAssistant.jsx

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  X, 
  MinusCircle, 
  Maximize2, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

// Temporarily using basic text rendering until we can install react-markdown
// TODO: Replace with proper markdown rendering when react-markdown is installed

const MAX_MESSAGE_COUNT = 50;
const TYPING_SPEED = 15; // ms per character

export default function LumenAiAssistant({ 
  isOpen, 
  onClose, 
  minimized, 
  onMinimize, 
  onMaximize,
  fullScreen,
  setFullScreen, 
  moduleName = "Regulatory Affairs" 
}) {
  const [messages, setMessages] = useState([
    { 
      id: 'intro', 
      role: 'assistant', 
      content: `Hello! I'm your Lumen ${moduleName} AI Assistant. I can help with regulatory questions, device classification, compliance requirements, and more. How can I assist you today?`,
      timestamp: new Date() 
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && !minimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, minimized, displayedContent]);
  
  // Typing effect for new assistant messages
  useEffect(() => {
    if (isTyping && currentMessageIndex < messages.length) {
      const message = messages[currentMessageIndex];
      if (message.role === 'assistant') {
        let i = 0;
        const content = message.content;
        const interval = setInterval(() => {
          i += 1;
          if (i <= content.length) {
            setDisplayedContent(content.substring(0, i));
          } else {
            clearInterval(interval);
            setIsTyping(false);
            setCurrentMessageIndex(currentMessageIndex + 1);
          }
        }, TYPING_SPEED);
        
        return () => clearInterval(interval);
      } else {
        setCurrentMessageIndex(currentMessageIndex + 1);
      }
    }
  }, [isTyping, currentMessageIndex, messages]);
  
  // For message queue processing
  useEffect(() => {
    if (!isTyping && currentMessageIndex < messages.length) {
      const message = messages[currentMessageIndex];
      if (message.role === 'assistant') {
        setDisplayedContent('');
        setIsTyping(true);
      } else {
        setCurrentMessageIndex(currentMessageIndex + 1);
      }
    }
  }, [isTyping, currentMessageIndex, messages]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !minimized && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen, minimized]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Get current context to send with request
      const deviceInfo = window.__APP_CONTEXT__?.deviceProfile || {};
      const documentType = window.__APP_CONTEXT__?.documentType || 'cer';
      const activeTab = window.__APP_CONTEXT__?.activeTab || '';
      
      // Call AI API
      const response = await fetch('/api/regulatory-ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          context: {
            moduleName,
            deviceInfo,
            documentType,
            activeTab,
            // Include recent messages for context
            history: messages.slice(-5).map(m => ({
              role: m.role,
              content: m.content
            }))
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      // Add assistant response
      const assistantMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.response || "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => {
        // Keep message history under limit
        const updatedMessages = [...prev, assistantMessage];
        if (updatedMessages.length > MAX_MESSAGE_COUNT) {
          return updatedMessages.slice(updatedMessages.length - MAX_MESSAGE_COUNT);
        }
        return updatedMessages;
      });
      
    } catch (error) {
      console.error('Error in AI chat:', error);
      
      // Add error message
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting to my knowledge base. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const clearConversation = () => {
    setMessages([
      { 
        id: 'intro-new', 
        role: 'assistant', 
        content: `I've started a new conversation. How can I help with your ${moduleName} questions?`,
        timestamp: new Date() 
      }
    ]);
    setCurrentMessageIndex(0);
    setIsTyping(false);
    setDisplayedContent('');
  };
  
  const copyToClipboard = (messageId, content) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };
  
  const downloadConversation = () => {
    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? 'You' : 'Lumen AI'} (${new Date(msg.timestamp).toLocaleString()}): ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `Lumen-${moduleName.replace(/\s+/g, '-')}-Conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  // Render nothing if closed
  if (!isOpen) return null;
  
  // Render minimized state
  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onMinimize}
          className="bg-indigo-600 hover:bg-indigo-700 rounded-full p-3 shadow-lg flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          <span>Lumen AI</span>
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  return (
    <div 
      ref={chatContainerRef}
      className={`
        fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300
        ${fullScreen ? 'inset-2 md:inset-4 lg:inset-8' : 'bottom-4 right-4 w-[90vw] md:w-[450px] lg:w-[500px] h-[75vh] max-h-[750px] min-h-[300px]'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <span className="font-semibold text-sm">Lumen {moduleName} AI Assistant</span>
          <Badge variant="outline" className="text-xs font-normal bg-indigo-50 text-indigo-700 border-indigo-200">
            GA
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={clearConversation}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">New conversation</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={downloadConversation}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Download conversation</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onMinimize}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Minimize</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setFullScreen(!fullScreen)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{fullScreen ? 'Reduce' : 'Expand'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Close</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Message Container */}
      <ScrollArea className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100% - 132px)' }}>
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isLatestAssistantMessage = 
              message.role === 'assistant' && 
              index === currentMessageIndex - 1;
              
            return (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`
                    max-w-[90%] rounded-lg p-3 shadow-sm
                    ${message.role === 'user' 
                      ? 'bg-indigo-600 text-white ml-4'
                      : message.isError 
                        ? 'bg-red-50 border border-red-100 text-gray-700 mr-4'
                        : 'bg-gray-100 text-gray-700 mr-4'
                    }
                  `}
                >
                  <div className="flex justify-between items-start gap-2">
                    {message.role === 'assistant' && (
                      <Badge variant="outline" size="sm" className="mb-1 text-xs font-normal bg-white text-indigo-700 border-indigo-200">
                        Lumen AI
                      </Badge>
                    )}
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-auto">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    {message.role === 'assistant' && isLatestAssistantMessage && isTyping ? (
                      <div className="whitespace-pre-wrap">{displayedContent}</div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                  
                  {message.role === 'assistant' && (
                    <div className="flex justify-end mt-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(message.id, message.content)}
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 text-gray-700 shadow-sm mr-4 max-w-[90%]">
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input Area */}
      <div className="border-t p-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask the Lumen AI assistant any regulatory questions..."
            className="resize-none border rounded-md flex-1"
            rows={2}
            maxRows={5}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !input.trim()}
            className={`
              h-9 w-9
              ${(!input.trim() || isLoading) 
                ? 'bg-gray-200 text-gray-500' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
            `}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}