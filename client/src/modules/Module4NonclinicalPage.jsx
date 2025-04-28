// /client/src/modules/Module4NonclinicalPage.jsx

import { useState } from 'react';
import { useLocation } from 'wouter';

// Import components
import PharmacologyReportsUploader from '../components/ind-wizard/PharmacologyReportsUploader';
import PharmacokineticsReportsUploader from '../components/ind-wizard/PharmacokineticsReportsUploader';
import ToxicologyReportsUploader from '../components/ind-wizard/ToxicologyReportsUploader';
import GenotoxicityReportsUploader from '../components/ind-wizard/GenotoxicityReportsUploader';
import InfoTooltipModule4 from '../components/ind-wizard/InfoTooltipModule4';
import UploadStatusTrackerModule4 from '../components/ind-wizard/UploadStatusTrackerModule4';
import Module4NextButton from '../components/ind-wizard/Module4NextButton';

export default function Module4NonclinicalPage() {
  const [, setLocation] = useLocation();
  const [formStatus, setFormStatus] = useState({
    pharmacologyUploaded: false,
    pharmacokineticsUploaded: false,
    toxicologyUploaded: false,
    genotoxicityUploaded: false
  });

  const handleNext = () => {
    // Navigate to Module 5 when implemented
    setLocation('/ind-wizard/module-5');
    // For now, go back to client portal
    // setLocation('/client-portal');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Module 4: Nonclinical Study Reports</h1>
        <InfoTooltipModule4 />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PharmacologyReportsUploader setFormStatus={setFormStatus} />
          <PharmacokineticsReportsUploader setFormStatus={setFormStatus} />
          <ToxicologyReportsUploader setFormStatus={setFormStatus} />
          <GenotoxicityReportsUploader setFormStatus={setFormStatus} />
          
          <Module4NextButton 
            formStatus={formStatus}
            onNext={handleNext}
          />
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <UploadStatusTrackerModule4 formStatus={formStatus} />
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-md font-semibold mb-2 text-blue-800">Module 4 Guidance</h3>
              <p className="text-sm text-blue-700 mb-3">
                All nonclinical studies should follow Good Laboratory Practice (GLP) guidelines and include:
              </p>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Comprehensive study protocols</li>
                <li>Detailed methods sections</li>
                <li>Raw data tables and figures</li>
                <li>Statistical analyses</li>
                <li>Discussion of results</li>
                <li>GLP compliance statements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}