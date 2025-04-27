/**
 * AI Assistant Button Component
 * 
 * This component provides an AI assistant interface that can help users
 * with various tasks across the TrialSage platform.
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Maximize2, 
  Minimize2,
  MessageSquare,
  Bot,
  User,
  Paperclip,
  Mic,
  Download,
  Copy
} from 'lucide-react';
import { useIntegration } from './integration/ModuleIntegrationLayer';

const AIAssistantButton = ({ onClose, context = {} }) => {
  const { aiService } = useIntegration();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your TrialSage AI Assistant. How can I help you today with your regulatory documentation needs?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  // Handle toggle expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Handle send message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: generateAIResponse(userMessage.content, context.activeModule),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  // Generate AI response based on input and context
  const generateAIResponse = (input, activeModule) => {
    // In a real app, this would call the AI API through aiService
    
    // Default response
    let response = "I understand you need help, but I'm not sure what you're asking about. Could you please provide more details?";
    
    // Module-specific responses
    if (activeModule === 'ind-wizard') {
      if (input.toLowerCase().includes('inclusion')) {
        response = "For inclusion criteria in IND applications, FDA guidance recommends clear, measurable criteria that ensure patient safety while maximizing eligible participants. Consider demographic factors, disease characteristics, and prior treatments. Would you like me to help optimize your specific inclusion criteria?";
      } else if (input.toLowerCase().includes('form') || input.toLowerCase().includes('1571')) {
        response = "Form FDA 1571 is the Investigational New Drug Application. All fields must be completed accurately. Common issues include incomplete investigator information and inadequate CMC sections. I can help you review your Form 1571 for completeness if you'd like.";
      } else {
        response = "I'm here to help with your IND application. I can assist with forms, inclusion/exclusion criteria, protocol development, or regulatory strategy. What specific aspect are you working on?";
      }
    } else if (activeModule === 'csr-intelligence') {
      if (input.toLowerCase().includes('template')) {
        response = "TrialSage offers several CSR templates that comply with ICH E3 guidelines. For your therapeutic area, I recommend starting with our standard template and then customizing sections 11-13 for your specific endpoints. Would you like me to create a new CSR from a template?";
      } else if (input.toLowerCase().includes('ich')) {
        response = "ICH E3 provides the structure and content guidelines for Clinical Study Reports. The 2023 update emphasizes patient narratives, enhanced safety analysis, and better integration with CDISC standards. Your current CSR appears to be following these guidelines, but I've noticed Section 12.3 (Safety Analysis) could be enhanced.";
      } else {
        response = "I can help with your Clinical Study Report creation and optimization. I can generate sections, check ICH E3 compliance, or suggest improvements based on regulatory expectations. What aspect of your CSR needs attention?";
      }
    } else if (activeModule === 'trial-vault') {
      if (input.toLowerCase().includes('verification') || input.toLowerCase().includes('blockchain')) {
        response = "Document verification uses blockchain technology to create an immutable record of document authenticity. Your current verification status is 97% (286/300 documents verified). The pending documents are primarily from the recent protocol amendments. Would you like me to initiate verification for these documents?";
      } else if (input.toLowerCase().includes('search')) {
        response = "To find specific documents, use the advanced search with filters like document type, date range, author, or keywords. For regulatory submissions, I recommend searching by submission ID or regulatory agency. Would you like me to perform a search based on specific criteria?";
      } else {
        response = "I can help you manage documents in TrialSage Vault. I can assist with organizing, searching, verifying, or retrieving documents. What document management task would you like help with?";
      }
    } else if (activeModule === 'study-architect') {
      if (input.toLowerCase().includes('optimization')) {
        response = "Based on analysis of your protocol XYZ-123-P1, I've identified potential optimizations:\n\n1. Broadening age range criteria could improve enrollment by ~15%\n2. Adding rescue medication options may reduce discontinuation rates\n3. Streamlining the visit schedule could reduce site burden\n\nWould you like me to implement any of these suggestions?";
      } else if (input.toLowerCase().includes('endpoint')) {
        response = "For your Phase 2 neurology study, I recommend considering these validated endpoints:\n\n1. UPDRS for motor symptoms (primary)\n2. PDQ-39 for quality of life (secondary)\n3. CGI-I for clinician global impression (exploratory)\n\nRecent FDA feedback has favored composite endpoints that capture both motor and non-motor symptoms.";
      } else {
        response = "I can help optimize your clinical trial protocol. I can suggest improvements for inclusion/exclusion criteria, endpoints, visit schedules, or statistical considerations. What specific aspect of your protocol would you like to enhance?";
      }
    } else {
      // Dashboard or general responses
      if (input.toLowerCase().includes('hello') || input.toLowerCase().includes('hi')) {
        response = "Hello! I'm your TrialSage AI Assistant. I can help with IND applications, CSR development, document management, and protocol optimization. How can I assist you today?";
      } else if (input.toLowerCase().includes('help')) {
        response = "I can help with various regulatory documentation needs. Here are some things I can do:\n\n- Draft and optimize protocols\n- Generate CSR sections\n- Find and organize documents\n- Provide regulatory guidance\n- Analyze clinical data\n\nWhich area would you like assistance with?";
      }
    }
    
    return response;
  };
  
  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Format timestamp
  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get container class based on expanded state
  const containerClass = isExpanded
    ? "fixed bottom-4 right-4 w-[600px] h-[80vh] bg-white rounded-lg shadow-xl flex flex-col z-50"
    : "fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-50";
  
  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-primary text-white rounded-t-lg">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          <h3 className="font-medium">TrialSage AI Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleExpanded}
            className="p-1 hover:bg-primary-dark rounded"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-primary-dark rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${
              message.role === 'user' 
                ? 'bg-primary text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                : 'bg-gray-100 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg'
            } p-3`}>
              <div className="flex items-center mb-1">
                {message.role === 'assistant' ? (
                  <Bot className="h-4 w-4 mr-1" />
                ) : (
                  <User className="h-4 w-4 mr-1" />
                )}
                <span className="text-xs font-medium">
                  {message.role === 'assistant' ? 'TrialSage AI' : 'You'}
                </span>
                <span className="text-xs ml-2 opacity-70">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              <div className="text-sm whitespace-pre-line">
                {message.content}
              </div>
              {message.role === 'assistant' && (
                <div className="flex items-center space-x-2 mt-2">
                  <button className="text-xs flex items-center hover:underline">
                    <Copy className="h-3 w-3 mr-1" />
                    <span>Copy</span>
                  </button>
                  <button className="text-xs flex items-center hover:underline">
                    <Download className="h-3 w-3 mr-1" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-end">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Paperclip className="h-5 w-5" />
          </button>
          <div className="flex-1 border rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
            <textarea
              className="w-full py-2 px-3 focus:outline-none resize-none"
              placeholder="Type your message..."
              rows={3}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="flex items-center space-x-1 ml-2">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Mic className="h-5 w-5" />
            </button>
            <button
              className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Powered by TrialSage AI - Regulatory Intelligence Platform
        </div>
      </div>
    </div>
  );
};

export default AIAssistantButton;