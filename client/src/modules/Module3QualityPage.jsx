// /client/src/modules/Module3QualityPage.jsx

import { useState } from 'react';
import DrugSubstanceUploader from '../components/ind-wizard/DrugSubstanceUploader';
import DrugProductUploader from '../components/ind-wizard/DrugProductUploader';
import AppendicesUploader from '../components/ind-wizard/AppendicesUploader';
import RegionalInfoUploader from '../components/ind-wizard/RegionalInfoUploader';
import UploadStatusTrackerModule3 from '../components/ind-wizard/UploadStatusTrackerModule3';
import Module3NextButton from '../components/ind-wizard/Module3NextButton';
import InfoTooltipModule3 from '../components/ind-wizard/InfoTooltipModule3';

export default function Module3QualityPage() {
  // Form status state to track completion of each section
  const [formStatus, setFormStatus] = useState({
    drugSubstance: false,
    drugProduct: false,
    appendices: false,
    regionalInfo: false
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          CTD Module 3: Quality (Chemistry, Manufacturing, and Controls)
          <InfoTooltipModule3 />
        </h1>
        <p className="text-gray-600">
          Module 3 contains comprehensive information on the chemistry, manufacturing, and controls of both the 
          drug substance (active ingredient) and the drug product (final dosage form). This section demonstrates 
          the quality and consistency of the product.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <DrugSubstanceUploader setFormStatus={setFormStatus} />
          <DrugProductUploader setFormStatus={setFormStatus} />
          <AppendicesUploader setFormStatus={setFormStatus} />
          <RegionalInfoUploader setFormStatus={setFormStatus} />
          <Module3NextButton formStatus={formStatus} />
        </div>
        
        <div className="md:col-span-1">
          <div className="sticky top-6">
            <UploadStatusTrackerModule3 formStatus={formStatus} />
            
            <div className="bg-white rounded-lg shadow-md p-4 mt-6">
              <h3 className="font-semibold mb-3">Module 3 Guidance</h3>
              <div className="text-sm text-gray-600 space-y-4">
                <p>
                  The CTD Module 3 contains comprehensive technical information on the drug substance and 
                  drug product, including manufacturing processes, controls, and stability studies.
                </p>
                <div>
                  <strong>Key Module 3 Sections:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>3.2.S Drug Substance (API)</li>
                    <li>3.2.P Drug Product (Formulation)</li>
                    <li>3.2.A Appendices (Facilities, Equipment)</li>
                    <li>3.2.R Regional Information (Country-specific)</li>
                  </ul>
                </div>
                <div className="mt-2">
                  <strong>FDA IND Requirements:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Batch manufacturing records</li>
                    <li>Stability data</li>
                    <li>Release specifications</li>
                    <li>DMF reference letters (if applicable)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}