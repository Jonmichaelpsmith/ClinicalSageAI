// client/src/contexts/LumenAiAssistantContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import LumenAiAssistant from '../components/ai/LumenAiAssistant';

// Create context
const LumenAiAssistantContext = createContext();

// Provider component
export const LumenAiAssistantProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [moduleName, setModuleName] = useState('Regulatory Affairs');
  
  // Determine the module name based on the current URL
  useEffect(() => {
    const path = window.location.pathname;
    
    if (path.includes('cerv2')) {
      setModuleName('Medical Device and Diagnostics');
    } else if (path.includes('ind-wizard')) {
      setModuleName('IND Submissions');
    } else if (path.includes('vault')) {
      setModuleName('Document Management');
    } else if (path.includes('510k')) {
      setModuleName('510(k) Submissions');
    }
  }, []);
  
  // Open the assistant
  const openAssistant = (module) => {
    if (module) {
      setModuleName(module);
    }
    setIsOpen(true);
    setMinimized(false);
  };
  
  // Close the assistant
  const closeAssistant = () => {
    setIsOpen(false);
  };
  
  // Minimize/maximize the assistant
  const toggleMinimize = () => {
    setMinimized(!minimized);
  };
  
  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
  };
  
  return (
    <LumenAiAssistantContext.Provider
      value={{
        isOpen,
        minimized,
        fullScreen,
        moduleName,
        openAssistant,
        closeAssistant,
        toggleMinimize,
        toggleFullScreen,
        setModuleName
      }}
    >
      {children}
      
      <LumenAiAssistant
        isOpen={isOpen}
        onClose={closeAssistant}
        minimized={minimized}
        onMinimize={toggleMinimize}
        fullScreen={fullScreen}
        setFullScreen={setFullScreen}
        moduleName={moduleName}
      />
    </LumenAiAssistantContext.Provider>
  );
};

// Custom hook to use the AI assistant context
export const useLumenAiAssistant = () => {
  const context = useContext(LumenAiAssistantContext);
  if (!context) {
    throw new Error('useLumenAiAssistant must be used within a LumenAiAssistantProvider');
  }
  return context;
};

export default LumenAiAssistantContext;