// /client/src/modules/Module4NonclinicalPage.jsx

import { useState } from 'react';
import PharmacologyReportsUploader from '../components/ind-wizard/PharmacologyReportsUploader';
import PharmacokineticsReportsUploader from '../components/ind-wizard/PharmacokineticsReportsUploader';
import ToxicologyReportsUploader from '../components/ind-wizard/ToxicologyReportsUploader';
import GenotoxicityReportsUploader from '../components/ind-wizard/GenotoxicityReportsUploader';
import UploadStatusTrackerModule4 from '../components/ind-wizard/UploadStatusTrackerModule4';
import Module4NextButton from '../components/ind-wizard/Module4NextButton';

export default function Module4NonclinicalPage() {
  const [formStatus, setFormStatus] = useState({
    pharmacologyUploaded: false,
    pharmacokineticsUploaded: false,
    toxicologyUploaded: false,
    genotoxicityUploaded: false,
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">CTD Module 4: Nonclinical Study Reports</h1>
      <p className="text-gray-600">
        Upload complete nonclinical study reports including pharmacology, pharmacokinetics, toxicology, and genotoxicity data as required by FDA, EMA, and PMDA.
      </p>

      <UploadStatusTrackerModule4 formStatus={formStatus} />

      <div className="space-y-8">
        <PharmacologyReportsUploader setFormStatus={setFormStatus} />
        <PharmacokineticsReportsUploader setFormStatus={setFormStatus} />
        <ToxicologyReportsUploader setFormStatus={setFormStatus} />
        <GenotoxicityReportsUploader setFormStatus={setFormStatus} />
      </div>

      <Module4NextButton formStatus={formStatus} />
    </div>
  );
}