// /client/src/components/ind-wizard/Module1NextButton.jsx

import { useLocation } from 'wouter';

export default function Module1NextButton({ formStatus }) {
  const [, setLocation] = useLocation();

  const requiredFields = [
    'sponsorInfo',
    'form1571Uploaded',
    'form1572Uploaded',
    'coverLetterUploaded',
    'ibUploaded',
  ];

  const isComplete = requiredFields.every((key) => formStatus[key] === true);

  const handleNext = () => {
    if (isComplete) {
      setLocation('/module-2'); // We can later wire this properly when Module 2 is built
    } else {
      alert('❌ Please complete all required fields before continuing.');
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