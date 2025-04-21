import React, { createContext, useState, useContext, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Create context
const TourContext = createContext(null);

export const TourProvider = ({ children }) => {
  const [tourCompleted, setTourCompleted] = useState(false);
  const [startTour, setStartTour] = useState(null);

  // Check if tour was previously completed
  useEffect(() => {
    const completed = localStorage.getItem('tourCompleted') === 'true';
    setTourCompleted(completed);
  }, []);

  // Register a tour starter function
  const registerTourStarter = (startFunction) => {
    setStartTour(() => startFunction);
  };

  // Start the tour
  const handleStartTour = () => {
    if (startTour) {
      startTour();
    }
  };

  // Reset the tour (for testing or when features change)
  const resetTour = () => {
    localStorage.removeItem('tourCompleted');
    setTourCompleted(false);
    handleStartTour();
  };

  return (
    <TourContext.Provider value={{ 
      tourCompleted, 
      setTourCompleted, 
      registerTourStarter,
      startTour: handleStartTour,
      resetTour
    }}>
      {children}
    </TourContext.Provider>
  );
};

// Hook for using the tour context
export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

// Help button that can trigger the tour
export const TourHelpButton = ({ className }) => {
  const { startTour, resetTour } = useTour();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={className}
        >
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={startTour}>
          Take Product Tour
        </DropdownMenuItem>
        <DropdownMenuItem onClick={resetTour}>
          Reset Tour (Debug)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TourContext;