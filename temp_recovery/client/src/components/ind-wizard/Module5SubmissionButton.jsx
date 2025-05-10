// /client/src/components/ind-wizard/Module5SubmissionButton.jsx

import { useState } from 'react';

export default function Module5SubmissionButton({ formStatus }) {
  const [submitted, setSubmitted] = useState(false);

  const requiredFields = [
    'clinicalProtocolsUploaded',
    'clinicalStudyReportsUploaded',
    'investigatorBrochureUpdatesUploaded',
    'clinicalSafetyReportsUploaded',
  ];

  const isComplete = requiredFields.every((key) => formStatus[key] === true);

  const handleSubmit = () => {
    if (isComplete) {
      setSubmitted(true);
      alert('✅ IND Submission Package Assembled Successfully! Ready for Regulatory Review.');
    } else {
      alert('❌ Please complete all required Clinical sections before submitting.');
    }
  };

  return (
    <div className="flex justify-end mt-8">
      <button
        onClick={handleSubmit}
        disabled={!isComplete || submitted}
        className={`px-8 py-3 rounded-md text-white font-semibold ${
          isComplete
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {submitted ? 'Submission Complete' : 'Submit IND Package'}
      </button>
    </div>
  );
}