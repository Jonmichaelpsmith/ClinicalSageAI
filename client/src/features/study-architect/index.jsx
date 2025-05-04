// Central export file for the Study Architect feature
// This will be the only file imported by App.jsx

import StudyArchitectPage from './pages/StudyArchitectPage';
import ErrorBoundary from './components/ErrorBoundary';

// Wrap the main component with the ErrorBoundary for improved stability
const StudyArchitectWithErrorHandling = () => {
  return (
    <ErrorBoundary>
      <StudyArchitectPage />
    </ErrorBoundary>
  );
};

// Export the error-handled version as the default
export default StudyArchitectWithErrorHandling;
