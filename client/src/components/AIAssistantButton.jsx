/**
 * AI Assistant Button Component
 * 
 * This component provides an AI assistance interface that integrates
 * with the platform's regulatory intelligence services.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  X, 
  Mic, 
  Image,
  Paperclip,
  Zap,
  RotateCw
} from 'lucide-react';
import { useIntegration } from './integration/ModuleIntegrationLayer';

const AIAssistantButton = ({ onClose, context }) => {
  const { regulatoryCore } = useIntegration();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm the TrialSage™ AI Assistant. How can I help you with your regulatory and clinical documentation needs today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Suggestions based on the current context
  const getContextSuggestions = () => {
    switch (context?.activeModule) {
      case 'ind-wizard':
        return [
          "What sections should be included in my IND application?",
          "How do I prepare for a pre-IND meeting?",
          "What FDA guidance applies to my IND submission?"
        ];
      case 'trial-vault':
        return [
          "How does the blockchain verification work?",
          "How can I securely share documents with external stakeholders?",
          "What's the recommended document structure for regulatory submissions?"
        ];
      case 'csr-intelligence':
        return [
          "What are ICH E3 guidelines for CSR preparation?",
          "How can I improve my CSR's compliance score?",
          "What statistical analyses should be included in my CSR?"
        ];
      default:
        return [
          "What documents do I need for my regulatory submission?",
          "Help me understand ICH guidelines",
          "What are the best practices for clinical documentation?"
        ];
    }
  };
  
  const suggestions = getContextSuggestions();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Get a formatted timestamp
  const getFormattedTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };
  
  // Send a message and process the response
  const sendMessage = async (content) => {
    // Add user message
    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    try {
      // Get response from regulatory intelligence core
      const response = await regulatoryCore.getScientificGuidance(content);
      
      // Add assistant message
      const assistantMessage = {
        role: 'assistant',
        content: response.response,
        sources: response.sources || [],
        timestamp: new Date()
      };
      
      // Add a small delay for a more natural conversation flow
      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        error: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mb-2 flex flex-col border overflow-hidden" style={{ height: '520px' }}>
        {/* Header */}
        <div className="p-4 border-b bg-primary text-white flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="mr-2" size={20} />
            <h3 className="font-semibold">TrialSage™ AI Assistant</h3>
          </div>
          <button 
            className="text-white hover:text-gray-200"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-primary-light text-gray-800' 
                    : message.error
                      ? 'bg-red-50 text-red-800 border border-red-100'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                    <div className="font-medium mb-1">Sources:</div>
                    <ul className="space-y-1">
                      {message.sources.map((source, idx) => (
                        <li key={idx}>
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {source.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="text-xs mt-1 text-gray-500 text-right">
                  {getFormattedTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Suggestions */}
        {messages.length < 3 && suggestions.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="px-3 py-1.5 text-xs bg-white border rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary pr-8"
                placeholder="Type your question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
              />
              
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  <Paperclip size={16} />
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className={`p-2 rounded-md ${
                loading || !inputValue.trim()
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
              disabled={loading || !inputValue.trim()}
            >
              {loading ? <RotateCw size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
          
          <div className="mt-2 flex justify-between items-center">
            <div className="flex space-x-2">
              <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                <Mic size={14} className="mr-1" />
                <span>Voice</span>
              </button>
              
              <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                <Image size={14} className="mr-1" />
                <span>Image</span>
              </button>
            </div>
            
            <button className="text-xs text-primary hover:text-primary-dark flex items-center">
              <Zap size={14} className="mr-1" />
              <span>Quick Actions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantButton;