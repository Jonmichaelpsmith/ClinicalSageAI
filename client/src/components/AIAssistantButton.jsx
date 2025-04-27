/**
 * AI Assistant Button Component
 * 
 * This component provides the AI assistant interface that can be toggled
 * in the platform. It provides context-aware AI assistance.
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Maximize2, Minimize2, Copy, Check } from 'lucide-react';
import { useIntegration } from './integration/ModuleIntegrationLayer';

const AIAssistantButton = ({ onClose, context }) => {
  const { regulatoryCore } = useIntegration();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'assistant',
      content: 'Hello! I\'m your TrialSage AI Assistant. How can I help you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Get module-specific context
  const getContextMessage = () => {
    const moduleId = context?.activeModule;
    
    switch (moduleId) {
      case 'ind-wizard':
        return 'I see you\'re working in the IND Wizard™ module. I can help with IND applications, FDA forms, and regulatory requirements.';
      case 'trial-vault':
        return 'I see you\'re working in the Trial Vault™ module. I can help with document management, blockchain verification, and secure sharing.';
      case 'csr-intelligence':
        return 'I see you\'re working in the CSR Intelligence™ module. I can help with clinical study reports, ICH E3 compliance, and scientific writing.';
      case 'study-architect':
        return 'I see you\'re working in the Study Architect™ module. I can help with protocol design, study planning, and statistical considerations.';
      case 'analytics':
        return 'I see you\'re working in the Analytics module. I can help with data visualization, trend analysis, and reporting.';
      default:
        return null;
    }
  };
  
  // Add context message if one exists and hasn't been added yet
  useEffect(() => {
    const contextMessage = getContextMessage();
    
    if (contextMessage && messages.length === 1) {
      setMessages(prev => [
        ...prev,
        {
          id: 'context',
          type: 'assistant',
          content: contextMessage,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [context, messages.length]);
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // In a real implementation, this would use the AI service
      // Here we simulate a response using the regulatory core
      let response;
      
      if (regulatoryCore) {
        response = await regulatoryCore.getScientificGuidance(input);
      } else {
        // Fallback response if regulatory core is not available
        await new Promise(resolve => setTimeout(resolve, 1500));
        response = {
          response: `I understand you're asking about "${input}". This would be answered by our AI response system in the production environment. Is there something specific about regulatory documents or clinical trials that I can help explain?`
        };
      }
      
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'error',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle input key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Copy message to clipboard
  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  return (
    <div 
      className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border overflow-hidden flex flex-col z-50 transition-all ${
        expanded ? 'w-96 h-[32rem]' : 'w-80 h-96'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-primary text-white flex items-center justify-between">
        <div className="flex items-center">
          <Sparkles size={18} className="mr-2" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        
        <div className="flex items-center space-x-1">
          <button 
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          
          <button 
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] relative group ${
                message.type === 'user' 
                  ? 'bg-primary text-white rounded-t-lg rounded-bl-lg' 
                  : message.type === 'error'
                    ? 'bg-red-100 text-red-800 rounded-t-lg rounded-br-lg'
                    : 'bg-gray-100 text-gray-800 rounded-t-lg rounded-br-lg'
              } px-4 py-3`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              
              <div className="mt-1 flex justify-between items-center">
                <span className="text-xs opacity-70">
                  {formatTimestamp(message.timestamp)}
                </span>
                
                {message.type !== 'user' && (
                  <button
                    className="opacity-0 group-hover:opacity-70 transition-opacity p-1 hover:bg-black hover:bg-opacity-10 rounded"
                    onClick={() => copyToClipboard(message.content)}
                    title="Copy to clipboard"
                  >
                    {copySuccess ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-3">
              <div className="flex space-x-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex items-end space-x-2">
          <textarea
            ref={inputRef}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            placeholder="Type your message..."
            rows="2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          
          <button
            className={`p-2 rounded-full bg-primary text-white ${
              !input.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'
            }`}
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Send size={18} />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 flex justify-center">
          <Sparkles size={12} className="mr-1" />
          <span>Powered by TrialSage AI</span>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantButton;