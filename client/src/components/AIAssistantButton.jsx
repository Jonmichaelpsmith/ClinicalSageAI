/**
 * AI Assistant Button Component
 * 
 * This component provides a floating AI assistant button that expands
 * into a chat interface when clicked, providing context-aware help.
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, ArrowRight } from 'lucide-react';
import { useIntegration } from './integration/ModuleIntegrationLayer';

const AIAssistantButton = ({ onClose, context = {} }) => {
  const { getScientificGuidance } = useIntegration();
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 'welcome',
      type: 'assistant', 
      content: 'Hello! I\'m your TrialSage AI Assistant. How can I help you with your regulatory documentation today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Expand assistant on mount
  useEffect(() => {
    setTimeout(() => {
      setIsExpanded(true);
    }, 300);
  }, []);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current && isExpanded) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);
  
  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);
  
  // Handle closing the assistant
  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 300);
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  // Handle input submission
  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!inputValue.trim() || isLoading) {
      return;
    }
    
    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Get module-specific context
      let moduleContext = '';
      if (context.activeModule) {
        switch (context.activeModule) {
          case 'ind-wizard':
            moduleContext = 'IND application';
            break;
          case 'trial-vault':
            moduleContext = 'document management';
            break;
          case 'csr-intelligence':
            moduleContext = 'clinical study reports';
            break;
          case 'study-architect':
            moduleContext = 'protocol design';
            break;
          case 'analytics':
            moduleContext = 'regulatory analytics';
            break;
          default:
            moduleContext = '';
        }
      }
      
      // Append context to query if available
      const query = moduleContext 
        ? `${inputValue} (In the context of ${moduleContext})`
        : inputValue;
      
      // Get AI response
      const response = await getScientificGuidance(query);
      
      // Format sources as Markdown links if available
      let formattedResponse = response.response;
      
      if (response.sources && response.sources.length > 0) {
        formattedResponse += '\n\n**Sources:**\n';
        response.sources.forEach(source => {
          formattedResponse += `- [${source.title}](${source.url})\n`;
        });
      }
      
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: formattedResponse,
        timestamp: new Date().toISOString(),
        sources: response.sources || []
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        isError: true,
        content: 'I apologize, but I encountered an error processing your request. Please try again later.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle keydown events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  // Get suggestion for current module
  const getSuggestionForModule = () => {
    switch (context.activeModule) {
      case 'ind-wizard':
        return 'What sections are required in an IND application?';
      case 'trial-vault':
        return 'How can I verify a document using blockchain?';
      case 'csr-intelligence':
        return 'What is the structure of a CSR according to ICH E3?';
      case 'study-architect':
        return 'What endpoints should I include for a Phase II oncology trial?';
      case 'analytics':
        return 'How can I analyze protocol deviations across studies?';
      default:
        return 'How can I navigate between modules?';
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    // Focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 flex flex-col ${
        isExpanded ? 'w-96 h-[30rem] max-h-[80vh]' : 'w-14 h-14'
      }`}
    >
      <div className="relative w-full h-full">
        <div 
          className={`
            absolute inset-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden
            flex flex-col transition-all duration-300
            ${isExpanded ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-primary text-white px-4 py-3">
            <div className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              <h3 className="font-medium">TrialSage AI Assistant</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-primary-dark rounded-full p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    rounded-lg px-4 py-2 max-w-[80%]
                    ${message.type === 'user' 
                      ? 'bg-primary text-white' 
                      : message.isError
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  `}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                      <p className="font-medium">Sources:</p>
                      <ul className="mt-1">
                        {message.sources.map((source, index) => (
                          <li key={index} className="truncate">
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {source.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-[80%]">
                  <div className="flex space-x-2">
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
          {messages.length === 1 && !isLoading && (
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-500 mb-2">Try asking:</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleSuggestionClick(getSuggestionForModule())}
                  className="w-full text-left text-sm bg-gray-100 hover:bg-gray-200 rounded-md px-3 py-2 flex items-center text-gray-700"
                >
                  <ArrowRight className="h-3 w-3 mr-2 text-primary" />
                  {getSuggestionForModule()}
                </button>
                <button
                  onClick={() => handleSuggestionClick('What are the ICH guidelines for my document?')}
                  className="w-full text-left text-sm bg-gray-100 hover:bg-gray-200 rounded-md px-3 py-2 flex items-center text-gray-700"
                >
                  <ArrowRight className="h-3 w-3 mr-2 text-primary" />
                  What are the ICH guidelines for my document?
                </button>
              </div>
            </div>
          )}
          
          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
                  inputValue.trim() && !isLoading
                    ? 'text-primary hover:bg-gray-100'
                    : 'text-gray-400'
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
        
        {/* Floating button (visible when collapsed) */}
        <button
          onClick={() => setIsExpanded(true)}
          className={`
            absolute bottom-0 right-0 w-14 h-14 rounded-full bg-primary text-white shadow-lg
            flex items-center justify-center transition-all duration-300
            ${isExpanded ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}
          `}
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default AIAssistantButton;