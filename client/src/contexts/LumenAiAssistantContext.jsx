// /client/src/contexts/LumenAiAssistantContext.jsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import { LumenAiAssistant } from '../components/ai/LumenAiAssistant';

// Create context
const LumenAiAssistantContext = createContext();

export function LumenAiAssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);
  const [currentContext, setCurrentContext] = useState({});

  // Open the assistant
  const openAssistant = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Close the assistant
  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Set the current module context
  const setModuleContext = useCallback((module, context = {}) => {
    setCurrentModule(module);
    setCurrentContext(context);
  }, []);

  return (
    <LumenAiAssistantContext.Provider
      value={{
        isOpen,
        currentModule,
        currentContext,
        openAssistant,
        closeAssistant,
        setModuleContext,
      }}
    >
      {children}
      {/* Render the assistant UI outside the normal document flow */}
      <LumenAiAssistant
        isOpen={isOpen}
        onClose={closeAssistant}
        module={currentModule}
        context={currentContext}
      />
    </LumenAiAssistantContext.Provider>
  );
}

// Custom hook to use the assistant context
export function useLumenAiAssistant() {
  const context = useContext(LumenAiAssistantContext);
  if (!context) {
    throw new Error('useLumenAiAssistant must be used within a LumenAiAssistantProvider');
  }
  return context;
}