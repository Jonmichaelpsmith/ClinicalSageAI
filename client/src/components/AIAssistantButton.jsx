import React, { useState } from 'react';
import { Bot, X, Send, ArrowDown } from 'lucide-react';
import { useModuleIntegration } from './integration/ModuleIntegrationLayer';

const AIAssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your TrialSage AI assistant. How can I help you with your regulatory or clinical document needs today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const integration = useModuleIntegration();

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
    
    // Trigger event for other components to respond to AI assistant state
    integration.triggerEvent('ai-assistant-toggle', { isOpen: !isOpen });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input field
    setQuery('');
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the OpenAI API
      // For now, we'll simulate a response after a short delay
      setTimeout(() => {
        // Get context from the integration layer to provide to the AI
        const contextData = integration.getSharedData();
        
        // Simulate AI response with context awareness
        let responseText = `I'd be happy to help with your question about "${query}".`;
        
        // Add some contextual awareness based on the query
        if (query.toLowerCase().includes('ind')) {
          responseText += ' For IND applications, the TrialSage platform can help you organize all required forms and documents according to FDA guidelines.';
        } else if (query.toLowerCase().includes('trial') || query.toLowerCase().includes('study')) {
          responseText += ' The Study Architect module can help you design and optimize your clinical trial protocol.';
        } else if (query.toLowerCase().includes('csr') || query.toLowerCase().includes('report')) {
          responseText += ' Our CSR Intelligence module can assist with structured extraction and analysis of clinical study reports.';
        }
        
        // Add the AI response to the chat
        setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error processing your request. Please try again later.' 
      }]);
      setIsLoading(false);
    }
  };

  // Scroll to bottom of messages when new ones arrive
  const scrollToBottom = (container) => {
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  return (
    <>
      {/* Floating button in corner */}
      <button 
        onClick={toggleAssistant}
        className={`fixed bottom-4 right-4 z-40 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-colors ${
          isOpen ? 'bg-pink-100 text-pink-600' : 'bg-pink-600 text-white'
        }`}
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </button>
      
      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-96 bg-white rounded-lg shadow-xl z-30 flex flex-col border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-pink-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center">
              <Bot size={20} className="mr-2" />
              <h3 className="font-medium">TrialSage Assistant</h3>
            </div>
            <button onClick={toggleAssistant} className="text-white hover:text-pink-200">
              <X size={18} />
            </button>
          </div>
          
          {/* Messages container */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4"
            ref={scrollToBottom}
          >
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-pink-100 text-gray-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-gray-100">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input form */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-pink-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-3 py-2 bg-pink-600 text-white rounded-r-md hover:bg-pink-700 focus:outline-none focus:ring-1 focus:ring-pink-500"
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? <ArrowDown size={18} className="animate-bounce" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIAssistantButton;