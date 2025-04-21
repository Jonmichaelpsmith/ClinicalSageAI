import React, { useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useTour } from './TourContext';
import { toast } from 'react-toastify';

// Define tour steps
const TOUR_STEPS = [
  {
    target: '[data-tour="solution-header"]',
    content: 'Welcome to TrialSage! This section shows our solution bundles tailored to your regulatory and clinical needs.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="bundle-ind-submissions"]',
    content: 'The IND & NDA Submission Accelerator helps regulatory teams prepare and submit compliant regulatory applications.',
    placement: 'top',
  },
  {
    target: '[data-tour="bundle-csr-intelligence"]',
    content: 'The Global CSR Intelligence Suite provides insights from clinical study reports across multiple regions.',
    placement: 'right',
  },
  {
    target: '[data-tour="bundle-report-toolkit"]',
    content: 'The Report & Review Toolkit helps you generate and manage clinical evaluation reports.',
    placement: 'left',
  },
  {
    target: '[data-tour="bundle-enterprise"]',
    content: 'The Enterprise Command Center gives real-time updates across all your organization\'s regulatory activities.',
    placement: 'top',
  }
];

export default function InteractiveTour({ tourCompleted, setTourCompleted }) {
  const { isTourActive, tourStep, stopTour, nextStep } = useTour();

  // Handle tour events
  const handleJoyrideCallback = (data) => {
    const { status, index, type } = data;

    // Tour is finished or skipped
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      stopTour();
      setTourCompleted(true);
      toast.success("Tour completed! You can restart it anytime with the help button.");
    }
    
    // Update current step
    if (type === 'step:after' && index < TOUR_STEPS.length - 1) {
      nextStep();
    }
  };

  // Don't show tour if already completed
  if (tourCompleted) {
    return null;
  }

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={isTourActive}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={TOUR_STEPS}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#3b82f6',
          textColor: '#333',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonBack: {
          marginRight: 10,
        }
      }}
    />
  );
}