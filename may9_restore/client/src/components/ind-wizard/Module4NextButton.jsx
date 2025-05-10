// /client/src/components/ind-wizard/Module4NextButton.jsx

import { useLocation } from 'wouter';

export default function Module4NextButton({ formStatus }) {
  const [, setLocation] = useLocation();

  const requiredFields = [
    'pharmacologyUploaded',
    'pharmacokineticsUploaded',
    'toxicologyUploaded',
    'genotoxicityUploaded',
  ];

  const isComplete = requiredFields.every((key) => formStatus[key] === true);

  const handleNext = () => {
    if (isComplete) {
      setLocation('/ind-wizard/module-5'); // Route for CTD Module 5 (Clinical Study Reports)
    } else {
      alert('❌ Please complete all required Nonclinical sections before continuing.');
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