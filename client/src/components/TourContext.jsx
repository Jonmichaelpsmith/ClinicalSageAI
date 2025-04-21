// TourContext.jsx - Context provider for the interactive feature tour
import React, { createContext, useState, useContext, useCallback } from 'react';
import { HelpCircle } from 'lucide-react';

// Create the Tour Context
const TourContext = createContext();

// Tour Provider component to manage tour state
export function TourProvider({ children }) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  
  // Start or restart the tour
  const startTour = useCallback(() => {
    setIsTourActive(true);
    setTourStep(0);
  }, []);
  
  // End the tour
  const endTour = useCallback(() => {
    setIsTourActive(false);
    setTourStep(0);
  }, []);
  
  // Go to a specific step
  const goToStep = useCallback((step) => {
    setTourStep(step);
  }, []);
  
  // Go to next step
  const nextStep = useCallback(() => {
    setTourStep(prev => prev + 1);
  }, []);
  
  // Go to previous step
  const prevStep = useCallback(() => {
    setTourStep(prev => Math.max(0, prev - 1));
  }, []);
  
  // The context value that will be provided
  const tourContextValue = {
    isTourActive,
    tourStep,
    startTour,
    endTour,
    goToStep,
    nextStep,
    prevStep
  };
  
  return (
    <TourContext.Provider value={tourContextValue}>
      {children}
    </TourContext.Provider>
  );
}

// Custom hook to use the tour context
export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}

// Help button component to start the tour
export function TourHelpButton() {
  const { startTour } = useTour();
  
  return (
    <button 
      onClick={startTour}
      className="help-button bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-md transition-all duration-200 hover:shadow-lg"
      aria-label="Start interactive tour"
    >
      <HelpCircle size={20} />
    </button>
  );
}

export default TourContext;