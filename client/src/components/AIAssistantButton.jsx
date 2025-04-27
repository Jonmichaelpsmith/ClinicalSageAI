/**
 * AI Assistant Button
 * 
 * This component provides a floating button to access the AI assistant.
 */

import React, { useState } from 'react';
import { MessageSquare, ArrowUp, X, Sparkles, Volume2, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RegulatoryIntelligenceCore } from '../services/RegulatoryIntelligenceCore';

const AIAssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  
  // Toggle assistant panel
  const toggleAssistant = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle message input change
  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };
  
  // Handle message submit
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message to the conversation
    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      // Get AI response using RegulatoryIntelligenceCore
      const regulatoryCore = RegulatoryIntelligenceCore.getInstance();
      
      // Simulate AI response with a delay
      setTimeout(() => {
        const aiMessage = {
          id: Date.now() + 1,
          text: generateAIResponse(message),
          sender: 'ai',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message to conversation
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };
  
  // Generate AI response (in a real implementation, this would use the AI service)
  const generateAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('ind') || lowerMessage.includes('submission')) {
      return "I can help with your IND submission. The IND Wizard module provides tools for preparing your Investigational New Drug application. Would you like me to guide you through the process or provide specific information about FDA requirements?";
    } else if (lowerMessage.includes('document') || lowerMessage.includes('vault')) {
      return "The Trial Vault module provides secure document management with blockchain verification. You can store, organize, and share all your clinical and regulatory documents. Would you like me to help you upload a document or find specific files?";
    } else if (lowerMessage.includes('csr') || lowerMessage.includes('report')) {
      return "Our CSR Intelligence module uses AI to assist with Clinical Study Report generation. It provides templates, content generation, and quality checks following ICH E3 guidelines. Would you like help starting a new CSR or reviewing an existing one?";
    } else if (lowerMessage.includes('study') || lowerMessage.includes('protocol')) {
      return "Study Architect can help with protocol development and study planning. Our AI provides guidance on study design, endpoints, and statistical considerations. Would you like to create a new protocol or get advice on study design optimization?";
    } else if (lowerMessage.includes('regulatory') || lowerMessage.includes('guidance')) {
      return "I'm connected to our regulatory intelligence system which tracks updates from FDA, EMA, PMDA, and other authorities. The latest guidance update is from the FDA regarding clinical trial endpoints for drug development. Would you like more details on specific regulatory requirements?";
    } else {
      return "I'm your AI assistant for the TrialSage platform. I can help with IND submissions, document management, CSR preparation, study design, and regulatory guidance. How can I assist you with your regulatory and clinical documentation needs today?";
    }
  };
  
  // Toggle voice mode
  const toggleVoiceMode = () => {
    setIsVoiceModeActive(!isVoiceModeActive);
  };
  
  return (
    <>
      {/* Floating button */}
      <button
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-black text-white shadow-lg hover:shadow-xl focus:outline-none"
        onClick={toggleAssistant}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>
      
      {/* Assistant panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black opacity-50"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 right-0 z-40 w-full sm:w-96 h-[70vh] bg-white shadow-xl border-t sm:border-l flex flex-col rounded-t-lg sm:rounded-t-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                  <Sparkles className="text-primary mr-2" size={20} />
                  <h2 className="font-semibold">AI Regulatory Assistant</h2>
                </div>
                <button
                  className="p-1 text-gray-500 hover:text-gray-700"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close AI assistant"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Welcome message */}
                {messages.length === 0 && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                        <Sparkles size={16} />
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">
                        Hello! I'm your AI Regulatory Assistant powered by the TrialSage Regulatory Intelligence Core. How can I help you with regulatory documentation and guidance today?
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Conversation messages */}
                {messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                          <Sparkles size={16} />
                        </div>
                      </div>
                    )}
                    
                    <div 
                      className={`rounded-lg p-3 max-w-[80%] ${
                        msg.sender === 'user' 
                          ? 'bg-primary text-white' 
                          : msg.isError 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    
                    {msg.sender === 'user' && (
                      <div className="flex-shrink-0 ml-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                          <MessageSquare size={16} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                        <Sparkles size={16} />
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  {/* Voice mode toggle */}
                  <button
                    type="button"
                    className={`p-2 rounded-full ${
                      isVoiceModeActive 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={toggleVoiceMode}
                    aria-label={isVoiceModeActive ? "Disable voice mode" : "Enable voice mode"}
                  >
                    {isVoiceModeActive ? <Mic size={20} /> : <Volume2 size={20} />}
                  </button>
                  
                  {/* Text input */}
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                    placeholder={isVoiceModeActive ? "Listening..." : "Type your message..."}
                    value={message}
                    onChange={handleInputChange}
                    disabled={isVoiceModeActive}
                  />
                  
                  {/* Submit button */}
                  <button
                    type="submit"
                    className="p-2 bg-primary text-white rounded-full hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!message.trim() && !isVoiceModeActive}
                  >
                    <ArrowUp size={20} />
                  </button>
                </div>
                
                {/* Voice mode indicator */}
                {isVoiceModeActive && (
                  <div className="mt-2 text-xs text-center text-gray-500">
                    Voice mode active. Click the microphone icon again to stop.
                  </div>
                )}
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistantButton;