// /client/src/components/ind-wizard/Module4NextButton.jsx

import { useState } from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function Module4NextButton({ formStatus, onNext }) {
  const [showValidation, setShowValidation] = useState(false);
  
  const isComplete = 
    formStatus?.pharmacologyUploaded && 
    formStatus?.pharmacokineticsUploaded && 
    formStatus?.toxicologyUploaded && 
    formStatus?.genotoxicityUploaded;
  
  const handleClick = () => {
    if (isComplete) {
      onNext();
    } else {
      setShowValidation(true);
      setTimeout(() => setShowValidation(false), 5000);
    }
  };
  
  return (
    <div className="mt-6">
      {showValidation && !isComplete && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
          <AlertCircle className="text-yellow-500 mr-2" size={18} />
          <span className="text-sm text-yellow-700">
            Please complete all required Nonclinical Study uploads before proceeding to the next module.
          </span>
        </div>
      )}
      
      <button
        onClick={handleClick}
        className={`
          px-5 py-2.5 rounded-md flex items-center justify-center w-full sm:w-auto
          ${isComplete 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-200 text-gray-500'
          }
        `}
      >
        Proceed to Module 5 - Clinical Study Reports
        <ArrowRight className="ml-2" size={16} />
      </button>
    </div>
  );
}