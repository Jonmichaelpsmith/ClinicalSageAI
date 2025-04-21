// InteractiveTour.jsx - Interactive feature tour using react-joyride
import React, { useEffect, useState } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useTour } from './TourContext';

// Tour step definitions
const tourSteps = [
  {
    target: '.solution-bundle-header',
    content: 'Welcome to TrialSage! This guided tour will introduce you to our solution bundles designed to streamline your regulatory and clinical workflows.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.ind-nda-section',
    content: 'The IND & NDA Submission Accelerator helps regulatory teams file 60% faster with zero formatting errors across FDA, EMA, PMDA, and other authorities.',
    placement: 'bottom',
  },
  {
    target: '.csr-intelligence-section',
    content: 'Our Global CSR Intelligence Library provides a centralized repository of clinical study reports with AI-powered insights.',
    placement: 'bottom',
  },
  {
    target: '.report-review-section',
    content: 'The Report & Review Toolkit improves collaboration between clinical, regulatory, and safety teams with streamlined workflows.',
    placement: 'bottom',
  },
  {
    target: '.enterprise-section',
    content: 'The Enterprise Command Center gives leadership a real-time view of your regulatory operations with comprehensive dashboards.',
    placement: 'bottom',
  },
  {
    target: '.help-button',
    content: 'You can restart this tour anytime by clicking the help button in the top-right corner.',
    placement: 'left',
  },
];

const InteractiveTour = ({ tourCompleted, setTourCompleted }) => {
  const { isTourActive, tourStep, endTour, goToStep } = useTour();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState(tourSteps);

  // Sync the tour state with the context
  useEffect(() => {
    setRun(isTourActive);
  }, [isTourActive]);

  const handleJoyrideCallback = (data) => {
    const { status, index } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    // Update the current step in the context
    if (index !== tourStep) {
      goToStep(index);
    }

    // Mark tour as completed if finished or skipped
    if (finishedStatuses.includes(status)) {
      setRun(false);
      endTour();
      setTourCompleted(true);
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          primaryColor: '#2563eb',
          textColor: '#333',
          zIndex: 1000,
        },
        tooltipContainer: {
          boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
          borderRadius: '0.5rem',
        },
        buttonBack: {
          marginRight: 10,
          backgroundColor: '#f3f4f6',
          color: '#1f2937',
        },
        buttonNext: {
          backgroundColor: '#2563eb',
        },
        buttonSkip: {
          color: '#6b7280',
        },
      }}
    />
  );
};

export default InteractiveTour;