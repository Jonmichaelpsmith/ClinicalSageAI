import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Create context
const LumenAssistantContext = createContext(null);

export const LumenAssistantProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const toggleAssistant = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!userInput.trim() || isLoading) return;

    // Add user message to the chat
    const userMessage = { sender: 'user', text: userInput.trim() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input
    setUserInput('');
    
    // Set loading state
    setIsLoading(true);

    try {
      // In a real implementation, this would call an API
      // For now, we'll just simulate a response after a delay
      setTimeout(() => {
        // Sample contextual responses based on message content
        let responseText = '';
        
        const lowerCaseInput = userMessage.text.toLowerCase();
        
        if (lowerCaseInput.includes('gxp') || lowerCaseInput.includes('compliance')) {
          responseText = "GxP compliance requires documentation to be attributable, legible, contemporaneous, original, and accurate (ALCOA). Our system maintains audit trails and electronic signatures compliant with 21 CFR Part 11.";
        } 
        else if (lowerCaseInput.includes('ind') || lowerCaseInput.includes('fda')) {
          responseText = "The IND submission process includes Form 1571, protocols, investigator information, and CMC data. Our IND Wizard can help you prepare all required sections and ensure regulatory compliance.";
        }
        else if (lowerCaseInput.includes('csr') || lowerCaseInput.includes('clinical study report')) {
          responseText = "Clinical Study Reports should follow the ICH E3 structure. Our CSR Intelligence module can help you analyze previous successful CSRs and extract insights for your current drafting process.";
        }
        else if (lowerCaseInput.includes('search') || lowerCaseInput.includes('find')) {
          responseText = "You can use our Semantic Search feature to find documents across the system. Try using natural language queries like 'find all safety reports from Q2 2024' or 'show me overdue regulatory submissions'.";
        }
        else if (lowerCaseInput.includes('help') || lowerCaseInput.includes('commands')) {
          responseText = "I can help with document creation, regulatory guidance, compliance questions, and workflow assistance. For example, try asking 'What sections are required in an IND?' or 'Show me all pending submissions'.";
        }
        else {
          responseText = "I'm here to help with your regulatory and compliance needs. You can ask me about document requirements, submission processes, compliance standards, or using any feature in TrialSage.";
        }
        
        setMessages(prevMessages => [
          ...prevMessages, 
          { sender: 'assistant', text: responseText }
        ]);
        
        setIsLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [userInput, isLoading, toast]);

  const contextValue = {
    isOpen,
    toggleAssistant,
    messages,
    isLoading,
    userInput,
    setUserInput,
    sendMessage,
    isExpanded,
    toggleExpanded
  };

  return (
    <LumenAssistantContext.Provider value={contextValue}>
      {children}
    </LumenAssistantContext.Provider>
  );
};

export const useLumenAssistant = () => {
  const context = useContext(LumenAssistantContext);
  if (!context) {
    throw new Error('useLumenAssistant must be used within a LumenAssistantProvider');
  }
  return context;
};