import React, { useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Send } from 'lucide-react';
import { useLumenAssistant } from './LumenAssistantProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const LumenAssistant = () => {
  const { 
    isOpen, 
    toggleAssistant, 
    messages, 
    isLoading, 
    userInput, 
    setUserInput, 
    sendMessage,
    isExpanded,
    toggleExpanded
  } = useLumenAssistant();
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Focus the input field when the assistant opens
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed ${isExpanded ? 'inset-4 md:inset-10' : 'bottom-4 right-4 w-[380px] h-[500px]'} bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col z-50 transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-xl font-semibold">L</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Lumen</h3>
            <p className="text-xs text-indigo-100">Digital Compliance Coach</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleExpanded}
            className="text-white/80 hover:text-white p-1 rounded transition-colors"
            aria-label={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            onClick={toggleAssistant}
            className="text-white/80 hover:text-white p-1 rounded transition-colors"
            aria-label="Close assistant"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 dark:text-slate-400">
                I'm Lumen, your Digital Compliance Coach. How can I help you with your regulatory documents today?
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-slate-100 dark:bg-slate-800">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '250ms' }}></div>
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '500ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex space-x-2">
          <Textarea
            ref={inputRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about compliance, documents, or procedures..."
            className="resize-none"
            rows={2}
          />
          <Button 
            onClick={sendMessage}
            disabled={isLoading || !userInput.trim()}
            className="self-end"
            aria-label="Send message"
          >
            <Send size={18} />
          </Button>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          <p>Lumen is fine-tuned with GxP compliance data and company SOPs.</p>
        </div>
      </div>
    </div>
  );
};

export default LumenAssistant;