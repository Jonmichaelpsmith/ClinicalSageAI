import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

// Define tour steps by route
const TOUR_STEPS = {
  // Home page tour steps
  '/': [
    {
      target: 'body',
      content: 'Welcome to TrialSage! Let\'s take a quick tour to show you how our platform can streamline your regulatory process.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.solution-bundle-header',
      content: 'Our platform is organized into four integrated solution bundles, each designed for specific regulatory and clinical needs.',
      placement: 'bottom',
    },
    {
      target: '.ind-nda-section',
      content: 'The IND & NDA Submission Accelerator helps you prepare submission-ready materials 2× faster with automated validation and compliance checks.',
      placement: 'bottom',
    },
    {
      target: '.csr-intelligence-section',
      content: 'Our Global CSR Intelligence Suite provides deep insights from thousands of clinical study reports across multiple regulatory regions.',
      placement: 'bottom',
    },
    {
      target: '.report-review-section',
      content: 'The Report & Review Toolkit accelerates document creation with AI-powered authoring and integrated compliance verification.',
      placement: 'bottom',
    },
    {
      target: '.enterprise-section',
      content: 'The Enterprise Command Center gives leadership teams visibility across all operations with powerful management tools.',
      placement: 'bottom',
    },
  ],
  
  // Submission builder tour steps
  '/builder': [
    {
      target: 'body',
      content: 'Welcome to the TrialSage Submission Builder! This powerful tool will help you create regulatory submissions with ease.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.folder-structure',
      content: 'Here you can see the complete eCTD folder structure. All files are automatically organized according to regulatory standards.',
      placement: 'right',
    },
    {
      target: '.drag-drop-area',
      content: 'Simply drag and drop your documents here. The system will automatically validate and place them in the correct regulatory sections.',
      placement: 'bottom',
    },
    {
      target: '.validation-panel',
      content: 'Real-time validation shows you any issues that need to be addressed before submission.',
      placement: 'left',
    },
    {
      target: '.regional-export',
      content: 'When you\'re ready, you can export your submission for any regulatory region with one click.',
      placement: 'top',
    },
  ],
  
  // CSR Intelligence tour
  '/csr-intelligence': [
    {
      target: 'body',
      content: 'Welcome to CSR Intelligence! This module gives you powerful insights from thousands of clinical study reports.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.search-panel',
      content: 'Search across our database of 3,000+ CSRs to find precedent for your study design, endpoints, or results interpretation.',
      placement: 'bottom',
    },
    {
      target: '.analytics-dashboard',
      content: 'Our analytics dashboard provides trends and patterns across similar trials to guide your decision-making.',
      placement: 'bottom', 
    },
    {
      target: '.comparison-tool',
      content: 'Compare your protocol against successful precedent to identify opportunities for improvement.',
      placement: 'left',
    },
  ],
  
  // IND Full Solution tour
  '/ind-full-solution': [
    {
      target: 'body',
      content: 'The IND Full Solution integrates all the tools you need to prepare a complete Investigational New Drug application.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.protocol-builder',
      content: 'Build your protocol using our AI-guided templates based on successful regulatory precedent.',
      placement: 'bottom',
    },
    {
      target: '.investigator-brochure',
      content: 'Create your Investigator Brochure with integrated references and formatted tables.',
      placement: 'right',
    },
    {
      target: '.form-1571',
      content: 'Complete FDA Form 1571 and other required forms with smart auto-fill capabilities.',
      placement: 'bottom',
    },
    {
      target: '.submission-package',
      content: 'Preview and finalize your complete IND submission package here.',
      placement: 'left',
    },
  ],
};

// Default styles for the tour
const TOUR_STYLES = {
  options: {
    arrowColor: '#ffffff',
    backgroundColor: '#ffffff',
    overlayColor: 'rgba(0, 0, 0, 0.7)',
    primaryColor: '#3b82f6',
    textColor: '#333',
    width: 400,
    zIndex: 1000,
  },
  tooltipContainer: {
    textAlign: 'left',
    padding: '20px',
  },
  tooltipTitle: {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '10px',
  },
  buttonNext: {
    backgroundColor: '#3b82f6',
    borderRadius: '6px',
    color: '#fff',
    fontWeight: 600,
    padding: '8px 16px',
  },
  buttonBack: {
    marginRight: '10px',
    color: '#6b7280',
  },
  buttonSkip: {
    color: '#6b7280',
  },
};

// Main component
const InteractiveTour = ({ tourCompleted, setTourCompleted }) => {
  const [location] = useLocation();
  const [runTour, setRunTour] = useState(false);
  const [steps, setSteps] = useState([]);
  const { toast } = useToast();

  // Update steps when location changes
  useEffect(() => {
    // Default to home page steps if current path doesn't have specific steps
    const routeSteps = TOUR_STEPS[location] || TOUR_STEPS['/'];
    setSteps(routeSteps);
    
    // If tour was previously completed, don't run it automatically
    if (!tourCompleted && !localStorage.getItem('tourCompleted')) {
      // Small delay to ensure the page has loaded
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [location, tourCompleted]);
  
  // Handle tour callbacks
  const handleJoyrideCallback = (data) => {
    const { status, type, index } = data;
    
    // Tour is finished or skipped
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      // Mark tour as completed in local storage and state
      localStorage.setItem('tourCompleted', 'true');
      if (setTourCompleted) {
        setTourCompleted(true);
      }
      
      // Show completion message
      toast({
        title: "Tour completed",
        description: "You can restart the tour anytime from the help menu.",
      });
    }
    
    // Tour is starting
    if (type === 'tour:start' && index === 0) {
      // Add any custom behavior for tour start
    }
  };
  
  // Function to manually start the tour
  const startTour = () => {
    setRunTour(true);
  };
  
  return (
    <>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={steps}
        run={runTour}
        styles={TOUR_STYLES}
        disableOverlayClose
        disableScrolling={false}
      />
    </>
  );
};

export { InteractiveTour, TOUR_STEPS };
export default InteractiveTour;