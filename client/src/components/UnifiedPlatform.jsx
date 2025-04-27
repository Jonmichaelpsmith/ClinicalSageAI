/**
 * Unified Platform Component
 * 
 * This is the main platform container that provides a unified experience across all TrialSage modules.
 * It integrates the central AI intelligence system, main navigation, and cross-module integration layer
 * to create a seamless workflow environment for users.
 */

import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'wouter';

// Core components
import { MainNavigation } from './MainNavigation';
import { ModuleIntegrationLayer, useModuleIntegration, MODULES } from './integration/ModuleIntegrationLayer';
import { ClientContextBar } from './client-portal/ClientContextBar';

// Module components (these would normally be imported from their respective module directories)
import IndWizardModule from './ind-wizard/IndWizardModule';
import CSRIntelligenceModule from './csr-intelligence/CSRIntelligenceModule';
import TrialVaultModule from './trial-vault/TrialVaultModule';
import StudyArchitectModule from './study-architect/StudyArchitectModule';
import ICHWizModule from './ich-wiz/ICHWizModule';
import ClinicalMetadataModule from './clinical-metadata/ClinicalMetadataModule';
import AnalyticsModule from './analytics/AnalyticsModule';
import AdminModule from './admin/AdminModule';
import ClientPortalModule from './client-portal/ClientPortalModule';
import LandingPage from './LandingPage';

// UI components
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, HelpCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// AI Assistant
import { AIAssistantButton } from './AIAssistantButton';
import { AIAssistantPanel } from './AIAssistantPanel';

/**
 * Main platform layout with integrated AI intelligence
 */
export const UnifiedPlatform = () => {
  // State for platform UI
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [helpPanelOpen, setHelpPanelOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [platformReady, setPlatformReady] = useState(false);
  
  // Integration hooks
  const {
    activeModule,
    clientContext,
    isInitialized,
    services,
    getCrossModuleTasksCount
  } = useModuleIntegration();
  
  // Initialize platform
  useEffect(() => {
    if (isInitialized) {
      // Simulate platform initialization
      const timer = setTimeout(() => {
        setPlatformReady(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);
  
  // Get task count
  useEffect(() => {
    if (isInitialized) {
      // Check for alerts periodically
      const checkAlerts = async () => {
        try {
          // This would typically be an API call to check for alerts
          // For now, we'll simulate with a random number
          const count = Math.floor(Math.random() * 3);
          setAlertCount(count);
        } catch (error) {
          console.error('Error checking alerts:', error);
        }
      };
      
      checkAlerts();
      const interval = setInterval(checkAlerts, 30000); // Check every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isInitialized]);

  // If not initialized, show loading screen
  if (!isInitialized || !platformReady) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
        <div className="w-16 h-16 mb-4">
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Loading TrialSage™</h1>
        <p className="text-muted-foreground">Initializing AI-powered regulatory platform...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Main navigation */}
      <MainNavigation />
      
      {/* Client context bar for CRO users */}
      {clientContext && (
        <ClientContextBar context={clientContext} />
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Module content */}
        <ScrollArea className="flex-1 h-full">
          <div className="container mx-auto py-6 px-4 min-h-full">
            <Switch>
              {/* Module routes */}
              <Route path="/ind-wizard/:rest*" component={IndWizardModule} />
              <Route path="/csr-intelligence/:rest*" component={CSRIntelligenceModule} />
              <Route path="/vault/:rest*" component={TrialVaultModule} />
              <Route path="/study-architect/:rest*" component={StudyArchitectModule} />
              <Route path="/ich-wiz/:rest*" component={ICHWizModule} />
              <Route path="/clinical-metadata/:rest*" component={ClinicalMetadataModule} />
              <Route path="/analytics/:rest*" component={AnalyticsModule} />
              <Route path="/admin/:rest*" component={AdminModule} />
              <Route path="/client-portal/:rest*" component={ClientPortalModule} />
              
              {/* Landing page */}
              <Route path="/" component={LandingPage} />
              
              {/* Fallback for unknown routes */}
              <Route>
                <div className="flex items-center justify-center h-[50vh] flex-col">
                  <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
                  <p className="text-muted-foreground mb-6">The page you are looking for doesn't exist or has been moved.</p>
                  <Button onClick={() => window.history.back()}>Go Back</Button>
                </div>
              </Route>
            </Switch>
          </div>
        </ScrollArea>
      </div>
      
      {/* Footer with AI and help tools */}
      <div className="border-t bg-background py-2 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            TrialSage™ AI-Powered Regulatory Platform
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Alert button */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "relative",
              alertCount > 0 && "text-amber-500 border-amber-500"
            )}
            onClick={() => setAlertsOpen(true)}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Alerts
            {alertCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {alertCount}
              </span>
            )}
          </Button>
          
          {/* Help button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHelpPanelOpen(true)}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Help
          </Button>
          
          {/* AI Assistant button */}
          <AIAssistantButton
            open={aiPanelOpen}
            onClick={() => setAiPanelOpen(true)}
            activeModule={activeModule}
          />
        </div>
      </div>
      
      {/* AI Assistant panel */}
      <AIAssistantPanel
        open={aiPanelOpen}
        setOpen={setAiPanelOpen}
        activeModule={activeModule}
      />
      
      {/* Alerts panel */}
      <Sheet open={alertsOpen} onOpenChange={setAlertsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>System Alerts</SheetTitle>
          </SheetHeader>
          
          <div className="py-6">
            {alertCount > 0 ? (
              <div className="space-y-4">
                {[...Array(alertCount)].map((_, i) => (
                  <AlertCard key={i} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No alerts at this time</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Help panel */}
      <Sheet open={helpPanelOpen} onOpenChange={setHelpPanelOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Help & Support</SheetTitle>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            <div>
              <h3 className="font-medium mb-2">Quick Help</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get instant help for the current module and context.
              </p>
              <Button className="w-full" onClick={() => {
                setHelpPanelOpen(false);
                setAiPanelOpen(true);
              }}>
                Ask AI Assistant
              </Button>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Documentation</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-primary hover:underline">
                    Getting Started Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-primary hover:underline">
                    User Manual
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-primary hover:underline">
                    API Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-primary hover:underline">
                    Regulatory Compliance Guide
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Contact Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our support team is available Monday-Friday, 9am-5pm ET.
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

/**
 * Alert card component for the alerts panel
 */
const AlertCard = ({ index }) => {
  // Sample alert types
  const alertTypes = [
    {
      title: "New regulatory guidance published",
      description: "FDA has published new guidance for clinical trial endpoints.",
      severity: "info"
    },
    {
      title: "Document requires review",
      description: "Protocol amendment is awaiting your review and approval.",
      severity: "warning"
    },
    {
      title: "Submission deadline approaching",
      description: "IND submission deadline is in 5 days.",
      severity: "urgent"
    }
  ];
  
  const alert = alertTypes[index % alertTypes.length];
  
  return (
    <div className={cn(
      "border rounded-lg p-4",
      alert.severity === "urgent" && "border-red-400 bg-red-50 dark:bg-red-950/20",
      alert.severity === "warning" && "border-amber-400 bg-amber-50 dark:bg-amber-950/20",
      alert.severity === "info" && "border-blue-400 bg-blue-50 dark:bg-blue-950/20"
    )}>
      <h4 className="font-medium mb-1">{alert.title}</h4>
      <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
      <div className="flex justify-end">
        <Button size="sm" variant="outline" className="mr-2">Dismiss</Button>
        <Button size="sm">View Details</Button>
      </div>
    </div>
  );
};

/**
 * Unified Platform with Module Integration Provider
 */
export const UnifiedPlatformWithIntegration = () => {
  return (
    <ModuleIntegrationLayer>
      <UnifiedPlatform />
    </ModuleIntegrationLayer>
  );
};

export default UnifiedPlatformWithIntegration;