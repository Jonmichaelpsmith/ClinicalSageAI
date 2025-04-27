import React, { useState, useEffect, createContext, useContext } from 'react';
import { useLocation, Route, Switch } from 'wouter';
import MainNavigation from './MainNavigation';
import { LumenAssistantProvider } from './assistant/LumenAssistantProvider';
import { LumenAssistant } from './assistant/LumenAssistant';
import { Toaster } from '@/components/ui/toaster';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Create context for sharing data between modules
const UnifiedDataContext = createContext({
  currentProject: null,
  setCurrentProject: () => {},
  indData: {},
  setIndData: () => {},
  cmcData: {},
  setCmcData: () => {},
  protocolData: {},
  setProtocolData: () => {},
  csrData: {},
  setCsrData: () => {},
  regulatory: {},
  setRegulatory: () => {},
  documents: [],
  setDocuments: () => {},
  refreshData: () => {},
  isLoading: false
});

export const useUnifiedData = () => useContext(UnifiedDataContext);

/**
 * UnifiedPlatform Component
 * 
 * This is the main application container that provides a seamless experience
 * across all TrialSage modules. It handles cross-module data sharing, unified navigation,
 * and consistent UI patterns across the entire platform.
 */
export default function UnifiedPlatform({ children }) {
  const [location, setLocation] = useLocation();
  
  // Global application state
  const [isLoading, setIsLoading] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [showModuleSwitchDialog, setShowModuleSwitchDialog] = useState(false);
  const [targetModule, setTargetModule] = useState(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Unified data state to share across modules
  const [currentProject, setCurrentProject] = useState(null);
  const [indData, setIndData] = useState({});
  const [cmcData, setCmcData] = useState({});
  const [protocolData, setProtocolData] = useState({});
  const [csrData, setCsrData] = useState({});
  const [regulatory, setRegulatory] = useState({});
  const [documents, setDocuments] = useState([]);
  
  // Platform-wide initialization
  useEffect(() => {
    // Determine active module based on current route
    const getModuleFromPath = (path) => {
      if (path.startsWith('/ind-wizard')) return 'ind-wizard';
      if (path.startsWith('/cmc')) return 'cmc';
      if (path.startsWith('/study-architect')) return 'study-architect';
      if (path.startsWith('/vault')) return 'vault';
      if (path.startsWith('/csr-intelligence')) return 'csr-intelligence';
      if (path.startsWith('/ich-wiz')) return 'ich-wiz';
      if (path.startsWith('/analytics')) return 'analytics';
      return 'dashboard';
    };
    
    setActiveModule(getModuleFromPath(location));
    
    // Set up event listeners for handling navigation and unsaved changes
    const handleBeforeUnload = (e) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location, unsavedChanges]);
  
  // Function to ensure data synchronization between modules
  const refreshData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch or synchronize data across modules
      // This would be replaced with actual API calls in a real implementation
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Data would be fetched from server in a real app
      if (!currentProject) {
        // If no current project, we'd load default/available projects
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error refreshing unified data:', error);
      setGlobalError('Failed to synchronize data across modules. Please refresh the page.');
      setIsLoading(false);
    }
  };
  
  // Initialize data on first load
  useEffect(() => {
    refreshData();
  }, []);
  
  // Handle cross-module navigation with unsaved changes
  const handleModuleSwitch = (moduleRoute) => {
    if (unsavedChanges) {
      setTargetModule(moduleRoute);
      setShowModuleSwitchDialog(true);
    } else {
      setLocation(moduleRoute);
    }
  };

  const confirmModuleSwitch = () => {
    setUnsavedChanges(false);
    setShowModuleSwitchDialog(false);
    if (targetModule) {
      setLocation(targetModule);
      setTargetModule(null);
    }
  };
  
  const cancelModuleSwitch = () => {
    setShowModuleSwitchDialog(false);
    setTargetModule(null);
  };
  
  // Consolidated context value with all shared data and functions
  const contextValue = {
    currentProject,
    setCurrentProject,
    indData,
    setIndData,
    cmcData,
    setCmcData,
    protocolData,
    setProtocolData,
    csrData, 
    setCsrData,
    regulatory,
    setRegulatory,
    documents,
    setDocuments,
    refreshData,
    isLoading,
    activeModule,
    handleModuleSwitch,
    setUnsavedChanges
  };

  // Error boundary handling
  if (globalError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="flex items-center text-destructive mb-4">
          <AlertTriangle className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-bold">System Error</h2>
        </div>
        <p className="mb-6 text-center max-w-md">{globalError}</p>
        <Button onClick={() => window.location.reload()}>
          Reload Application
        </Button>
      </div>
    );
  }

  // Initial loading screen
  if (isLoading && !currentProject) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-bold mt-4 text-center">Initializing TrialSage™ Platform</h2>
        </div>
        <div className="w-full max-w-xs">
          <Progress value={45} className="h-2 mb-2" />
          <p className="text-sm text-muted-foreground text-center">Loading application components...</p>
        </div>
      </div>
    );
  }

  return (
    <UnifiedDataContext.Provider value={contextValue}>
      <div className="flex h-screen overflow-hidden">
        <MainNavigation />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Unified application header with shared controls */}
          <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 sticky top-0 z-30">
            <div className="flex-1 flex justify-between items-center">
              <div>
                {activeModule && (
                  <h1 className="text-lg font-medium">
                    {activeModule === 'ind-wizard' && 'IND Wizard™'}
                    {activeModule === 'cmc' && 'CMC Intelligence™'}
                    {activeModule === 'study-architect' && 'Study Architect™'}
                    {activeModule === 'vault' && 'TrialSage Vault™'}
                    {activeModule === 'csr-intelligence' && 'CSR Intelligence™'}
                    {activeModule === 'ich-wiz' && 'ICH Wiz™'}
                    {activeModule === 'analytics' && 'Analytics Module'}
                    {activeModule === 'dashboard' && 'TrialSage™ Dashboard'}
                  </h1>
                )}
              </div>
              
              {currentProject && (
                <div className="text-sm flex items-center">
                  <span className="text-muted-foreground mr-2">Project:</span>
                  <span className="font-medium">{currentProject.name}</span>
                  {currentProject.status && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      currentProject.status === 'active' ? 'bg-green-100 text-green-800' :
                      currentProject.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {currentProject.status.toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </header>
          
          {/* Main content area with shared context */}
          <main className="flex-1 overflow-auto bg-gray-50">
            <LumenAssistantProvider>
              {children}
              <LumenAssistant />
            </LumenAssistantProvider>
          </main>
        </div>
      </div>
      
      <Dialog open={showModuleSwitchDialog} onOpenChange={setShowModuleSwitchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes that will be lost if you navigate away. Do you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelModuleSwitch}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmModuleSwitch}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </UnifiedDataContext.Provider>
  );
}