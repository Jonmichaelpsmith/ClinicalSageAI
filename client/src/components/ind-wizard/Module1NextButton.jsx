// /client/src/components/ind-wizard/Module1NextButton.jsx

import React from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';

export default function Module1NextButton({ formStatus }) {
  // Check if all required fields are complete
  const isComplete = formStatus.sponsorInfo && 
                    formStatus.form1571Uploaded && 
                    formStatus.form1572Uploaded &&
                    formStatus.coverLetterUploaded &&
                    formStatus.ibUploaded &&
                    (!formStatus.usAgentRequired || formStatus.usAgentInfo);

  const handleNext = () => {
    if (isComplete) {
      // In a real app, this would navigate to Module 2 or save data to backend
      alert('✅ Proceeding to Module 2: Chemistry, Manufacturing, and Controls');
    } else {
      alert('❌ Please complete all required fields before proceeding');
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-col items-end">
        {!isComplete && (
          <div className="mb-2 text-amber-600 flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>Complete all required fields to proceed</span>
          </div>
        )}
        
        <button
          onClick={handleNext}
          disabled={!isComplete}
          className={`flex items-center px-6 py-2 rounded-lg transition ${
            isComplete
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
        >
          Next: Module 2 (CMC)
          <ChevronRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
}