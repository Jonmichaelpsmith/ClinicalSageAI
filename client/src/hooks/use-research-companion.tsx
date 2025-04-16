import { useState, useEffect, createContext, useContext } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Types for our context
type ResearchCompanionContextType = {
  isEnabled: boolean;
  isVisible: boolean;
  showCompanion: () => void;
  hideCompanion: () => void;
  toggleCompanion: () => void;
  composeMessage: (message: string) => void;
  currentPageContext: string;
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
};

// Create the context with a default value
const ResearchCompanionContext = createContext<ResearchCompanionContextType>({
  isEnabled: false,
  isVisible: false,
  showCompanion: () => {},
  hideCompanion: () => {},
  toggleCompanion: () => {},
  composeMessage: () => {},
  currentPageContext: "",
  apiKey: null,
  setApiKey: () => {},
  clearApiKey: () => {},
});

// Helper to get page title from path
const getPageTitleFromPath = (path: string): string => {
  const pathMap: Record<string, string> = {
    "/": "Dashboard",
    "/csr-upload": "CSR Upload",
    "/csr-library": "CSR Library",
    "/protocol-editor": "Protocol Editor",
    "/protocol-validator": "Protocol Validator",
    "/design-oracle": "Study Design Oracle",
    "/enhanced-cer-dashboard": "CER Dashboard",
    "/example-reports": "Example Reports",
    "/settings": "Settings",
  };

  // Check for exact matches first
  if (pathMap[path]) return pathMap[path];
  
  // Handle nested paths
  if (path.startsWith("/csr/")) return "CSR Detail";
  if (path.startsWith("/protocol/")) return "Protocol Detail";
  if (path.startsWith("/cer/")) return "CER Detail";
  
  // Default fallback
  return "Research Platform";
};

// Provider component
export const ResearchCompanionProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [currentPageContext, setCurrentPageContext] = useState<string>("");
  const [location] = useLocation();
  const { toast } = useToast();

  // Load API key from localStorage on initial render
  useEffect(() => {
    const storedApiKey = localStorage.getItem("openai_api_key");
    if (storedApiKey) {
      setApiKeyState(storedApiKey);
      setIsEnabled(true);
    }
  }, []);

  // Update page context when location changes
  useEffect(() => {
    setCurrentPageContext(getPageTitleFromPath(location));
  }, [location]);

  // Save API key to localStorage when it changes
  const setApiKey = (key: string) => {
    if (key && key.startsWith("sk-")) {
      localStorage.setItem("openai_api_key", key);
      setApiKeyState(key);
      setIsEnabled(true);
      toast({
        title: "API Key Saved",
        description: "Research Companion is now enabled",
      });
    } else {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenAI API key starting with 'sk-'",
        variant: "destructive",
      });
    }
  };

  // Clear API key from localStorage
  const clearApiKey = () => {
    localStorage.removeItem("openai_api_key");
    setApiKeyState(null);
    setIsEnabled(false);
    setIsVisible(false);
    toast({
      title: "API Key Removed",
      description: "Research Companion has been disabled",
    });
  };

  // Show the companion
  const showCompanion = () => {
    if (isEnabled) {
      setIsVisible(true);
    } else {
      toast({
        title: "API Key Required",
        description: "Please add an OpenAI API key in settings to enable the Research Companion",
        variant: "destructive",
      });
    }
  };

  // Hide the companion
  const hideCompanion = () => {
    setIsVisible(false);
  };

  // Toggle companion visibility
  const toggleCompanion = () => {
    if (isVisible) {
      hideCompanion();
    } else {
      showCompanion();
    }
  };

  // Compose a message to the companion
  const composeMessage = (message: string) => {
    if (!isEnabled) {
      showCompanion();
      return;
    }
    
    // Ensure companion is visible
    setIsVisible(true);
    
    // In a real implementation, this would communicate with the companion component
    // For now, we'll just log the message
    console.log("Sending message to companion:", message);
  };

  return (
    <ResearchCompanionContext.Provider
      value={{
        isEnabled,
        isVisible,
        showCompanion,
        hideCompanion,
        toggleCompanion,
        composeMessage,
        currentPageContext,
        apiKey,
        setApiKey,
        clearApiKey,
      }}
    >
      {children}
    </ResearchCompanionContext.Provider>
  );
};

// Custom hook to use the companion context
export const useResearchCompanion = () => {
  const context = useContext(ResearchCompanionContext);
  
  if (context === undefined) {
    throw new Error("useResearchCompanion must be used within a ResearchCompanionProvider");
  }
  
  return context;
};