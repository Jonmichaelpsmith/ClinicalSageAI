// /client/src/components/ind-wizard/UploadStatusTracker.jsx

import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function UploadStatusTracker({ formStatus }) {
  const getStatusIcon = (status) => {
    if (status === true) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-amber-500" />;
    }
  };

  // Calculate overall completion percentage
  const completedItems = Object.values(formStatus).filter(Boolean).length;
  const totalItems = Object.keys(formStatus).length;
  const percentComplete = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Module 1 Completion Status</h3>
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center border-4 border-gray-200">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
              {percentComplete}%
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          {getStatusIcon(formStatus.sponsorInfo)}
          <span className="ml-2">Sponsor Information</span>
        </div>
        
        <div className="flex items-center">
          {getStatusIcon(formStatus.form1571Uploaded)}
          <span className="ml-2">Form FDA 1571</span>
        </div>
        
        <div className="flex items-center">
          {getStatusIcon(formStatus.form1572Uploaded)}
          <span className="ml-2">Form FDA 1572</span>
        </div>
        
        <div className="flex items-center">
          {getStatusIcon(formStatus.coverLetterUploaded)}
          <span className="ml-2">Cover Letter</span>
        </div>
        
        <div className="flex items-center">
          {getStatusIcon(formStatus.ibUploaded)}
          <span className="ml-2">Investigator Brochure</span>
        </div>
        
        {formStatus.usAgentRequired && (
          <div className="flex items-center">
            {getStatusIcon(formStatus.usAgentInfo)}
            <span className="ml-2">US Agent Information</span>
          </div>
        )}
      </div>

      {percentComplete < 100 ? (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-3 flex items-start">
          <Clock className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Please complete all required fields before proceeding to Module 2 (Chemistry, Manufacturing, and Controls).
          </p>
        </div>
      ) : (
        <div className="mt-4 bg-green-50 border border-green-200 rounded p-3 flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-green-800">
            All required Module 1 items are complete. You may proceed to Module 2.
          </p>
        </div>
      )}
    </div>
  );
}