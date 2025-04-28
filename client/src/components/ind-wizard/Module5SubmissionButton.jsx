// /client/src/components/ind-wizard/Module5SubmissionButton.jsx

import { useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, AlertCircle, Send, Loader2 } from 'lucide-react';

export default function Module5SubmissionButton({ formStatus }) {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  
  // Check if all required fields are completed
  const requiredFields = [
    'clinicalProtocolsUploaded',
    'clinicalStudyReportsUploaded',
    'investigatorBrochureUpdatesUploaded',
    'clinicalSafetyReportsUploaded',
  ];
  
  const isComplete = requiredFields.every((key) => formStatus[key] === true);
  
  // Handle submission
  const handleSubmit = async () => {
    if (!isComplete) {
      setShowValidation(true);
      setTimeout(() => setShowValidation(false), 5000);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call for submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      setSubmissionComplete(true);
      
      // Redirect after short delay
      setTimeout(() => {
        setLocation('/ind-wizard/submission-complete');
      }, 2000);
      
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Final Submission</h3>
      
      {showValidation && !isComplete && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Please complete all required clinical document uploads before final submission.
          </p>
        </div>
      )}
      
      {submissionComplete && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-emerald-700">
            Submission successful! Redirecting to completion summary...
          </p>
        </div>
      )}
      
      <p className="text-sm text-gray-600 mb-4">
        By submitting this module, you confirm that all clinical study documents comply with regulatory requirements and are ready for IND/NDA submission.
      </p>
      
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !isComplete}
        className={`
          w-full py-3 px-4 rounded-md text-white font-medium flex items-center justify-center
          ${isComplete && !isSubmitting 
            ? 'bg-emerald-600 hover:bg-emerald-700' 
            : 'bg-gray-300 cursor-not-allowed'}
        `}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-5 w-5 mr-2" />
            Submit CTD Module 5
          </>
        )}
      </button>
      
      <p className="mt-3 text-xs text-gray-500 text-center">
        All clinical data will be validated against ICH E3 and FDA requirements upon submission
      </p>
    </div>
  );
}