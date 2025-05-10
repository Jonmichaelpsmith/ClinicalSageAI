// /client/src/components/ind-wizard/Module2NextButton.jsx

import { useLocation } from 'wouter';

export default function Module2NextButton({ formStatus }) {
  const [, setLocation] = useLocation();

  const requiredFields = [
    'introSummary',
    'overallQualitySummary',
    'nonclinicalOverview',
    'clinicalOverview',
    'writtenTabulatedSummaries',
  ];

  const isComplete = requiredFields.every((key) => formStatus[key] === true);

  const handleNext = () => {
    if (isComplete) {
      setLocation('/module-3'); // Route for CTD Module 3 will be built next
    } else {
      alert('❌ Please complete all required Module 2 sections before continuing.');
    }
  };

  return (
    <div className="flex justify-end mt-6">
      <button
        onClick={handleNext}
        disabled={!isComplete}
        className={`px-6 py-2 rounded-md text-white font-semibold ${
          isComplete
            ? 'bg-indigo-600 hover:bg-indigo-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Next →
      </button>
    </div>
  );
}