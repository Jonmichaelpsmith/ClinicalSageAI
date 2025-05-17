import React, { createContext, useContext, useState, useCallback } from 'react';
import * as collaborationService from '../services/collaborationService';

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
  createCollaborationTask: async () => {},
  updateCollaborationTask: async () => {},
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

  const createCollaborationTask = useCallback(async (taskData) => {
    try {
      const response = await collaborationService.createTask(taskData);
      return response;
    } catch (error) {
      console.error('Error creating collaboration task:', error);
      throw error;
    }
  }, []);

  const updateCollaborationTask = useCallback(async (taskId, updates) => {
    try {
      const response = await collaborationService.updateTask(taskId, updates);
      return response;
    } catch (error) {
      console.error('Error updating collaboration task:', error);
      throw error;
    }
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
        createCollaborationTask,
        updateCollaborationTask,
      }}
    >
      {children}
    </LumenAiAssistantContext.Provider>
  );
};

export default LumenAiAssistantContext;