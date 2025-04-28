// /client/src/components/ind-wizard/UploadStatusTrackerModule5.jsx

import { CheckCircle, XCircle } from 'lucide-react';

export default function UploadStatusTrackerModule5({ formStatus }) {
  // Calculate completion percentage
  const totalItems = Object.keys(formStatus).length;
  const completedItems = Object.values(formStatus).filter(status => status === true).length;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  // Define upload requirements
  const uploadRequirements = [
    {
      name: 'Clinical Protocols',
      description: 'Phase 1-3 protocols with amendments',
      completed: formStatus.clinicalProtocolsUploaded,
      key: 'clinicalProtocolsUploaded'
    },
    {
      name: 'Clinical Study Reports',
      description: 'Complete CSRs with appendices',
      completed: formStatus.clinicalStudyReportsUploaded,
      key: 'clinicalStudyReportsUploaded'
    },
    {
      name: 'Investigator Brochure Updates',
      description: 'Latest versions with tracked changes',
      completed: formStatus.investigatorBrochureUpdatesUploaded,
      key: 'investigatorBrochureUpdatesUploaded'
    },
    {
      name: 'Clinical Safety Reports',
      description: 'DSURs and safety narratives',
      completed: formStatus.clinicalSafetyReportsUploaded,
      key: 'clinicalSafetyReportsUploaded'
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">Module 5 Completion</h3>
        <div className="relative pt-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block text-indigo-600">
                {completionPercentage}% Complete
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-indigo-600">
                {completedItems}/{totalItems} Items
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-gray-200">
            <div 
              style={{ width: `${completionPercentage}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                completionPercentage === 100 
                  ? 'bg-emerald-500' 
                  : completionPercentage > 0 
                  ? 'bg-indigo-500' 
                  : 'bg-gray-400'
              }`}>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700 text-sm">Upload Status:</h4>
        {uploadRequirements.map((req) => (
          <div key={req.key} className="flex items-start">
            {req.completed ? (
              <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-300 mt-0.5 flex-shrink-0" />
            )}
            <div className="ml-3">
              <h5 className={`text-sm font-medium ${req.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                {req.name}
              </h5>
              <p className="text-xs text-gray-500">{req.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {completionPercentage === 100 && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
          <p className="text-sm text-emerald-700 font-medium">
            All required documents uploaded successfully! You can now proceed with the final submission.
          </p>
        </div>
      )}
    </div>
  );
}