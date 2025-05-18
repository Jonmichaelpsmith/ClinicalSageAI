import React, { createContext, useContext, useState, useCallback } from 'react';

// Create a context for the Lumen AI Assistant
const LumenAiAssistantContext = createContext({
  isOpen: false,
  messages: [],
  moduleContext: {},
  openAssistant: () => {},
  closeAssistant: () => {},
  addMessage: () => {},
  clearMessages: () => {},
  setModuleContext: () => {},
});

// Custom hook to use Lumen AI Assistant context
export const useLumenAiAssistant = () => useContext(LumenAiAssistantContext);

// Provider component
export const LumenAiAssistantProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [moduleContext, setModuleContextState] = useState({});

  const openAssistant = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  const addMessage = useCallback((message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const setModuleContext = useCallback((context) => {
    setModuleContextState((prevContext) => ({
      ...prevContext,
      ...context,
    }));
  }, []);

  return (
    <LumenAiAssistantContext.Provider
      value={{
        isOpen,
        messages,
        moduleContext,
        openAssistant,
        closeAssistant,
        addMessage,
        clearMessages,
        setModuleContext,
      }}
    >
      {children}
    </LumenAiAssistantContext.Provider>
  );
};

export default LumenAiAssistantContext;