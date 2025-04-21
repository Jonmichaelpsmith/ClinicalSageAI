import React, { createContext, useContext, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { toast } from 'react-toastify';

// Create a context for tour state management
const TourContext = createContext(null);

export function TourProvider({ children }) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  
  // Start the tour
  const startTour = () => {
    setIsTourActive(true);
    setTourStep(0);
    toast.info("Tour started! We'll guide you through the key features.");
  };
  
  // Stop the tour
  const stopTour = () => {
    setIsTourActive(false);
    setTourStep(0);
    toast.info("Tour ended. You can restart it anytime using the help button.");
  };
  
  // Go to next step
  const nextStep = () => {
    setTourStep(prev => prev + 1);
  };
  
  // Go to previous step
  const prevStep = () => {
    setTourStep(prev => Math.max(0, prev - 1));
  };
  
  return (
    <TourContext.Provider value={{
      isTourActive,
      tourStep,
      startTour,
      stopTour,
      nextStep,
      prevStep
    }}>
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

// Helper button component to start/stop tour
export function TourHelpButton() {
  const { isTourActive, startTour, stopTour } = useTour();
  
  const handleClick = () => {
    if (isTourActive) {
      stopTour();
    } else {
      startTour();
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-md transition-all duration-200 hover:shadow-lg"
      aria-label={isTourActive ? "Stop tour" : "Start guided tour"}
    >
      <HelpCircle size={20} />
    </button>
  );
}