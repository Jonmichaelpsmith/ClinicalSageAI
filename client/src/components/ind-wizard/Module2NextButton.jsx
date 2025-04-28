// /client/src/components/ind-wizard/Module2NextButton.jsx

import { useLocation } from 'wouter';

export default function Module2NextButton({ formStatus }) {
  const [, setLocation] = useLocation();

  // Define required fields for Module 2
  const requiredFields = [
    'introSummary',
    'overallQualitySummary', 
    'nonclinicalOverview'
  ];

  // Clinical overview and written summaries are optional for some INDs
  const isComplete = requiredFields.every((key) => formStatus[key] === true);

  const handleNext = () => {
    if (isComplete) {
      setLocation('/module-3'); // Will route to Module 3 once built
    } else {
      alert('❌ Please complete all required fields before continuing.');
    }
  };

  return (
    <div className="flex justify-between mt-6">
      <button
        onClick={() => setLocation('/module-1')} 
        className="px-6 py-2 rounded-md text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
      >
        ← Back to Module 1
      </button>

      <button
        onClick={handleNext}
        disabled={!isComplete}
        className={`px-6 py-2 rounded-md text-white font-semibold ${
          isComplete
            ? 'bg-indigo-600 hover:bg-indigo-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Next to Module 3 →
      </button>
    </div>
  );
}