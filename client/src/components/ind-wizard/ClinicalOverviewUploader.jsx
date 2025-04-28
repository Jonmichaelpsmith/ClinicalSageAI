// /client/src/components/ind-wizard/ClinicalOverviewUploader.jsx

import { useState } from 'react';

export default function ClinicalOverviewUploader({ setFormStatus }) {
  const [clinicalOverview, setClinicalOverview] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setClinicalOverview(file);
      setFormStatus(prev => ({ ...prev, clinicalOverview: true }));
      alert(`✅ Clinical Overview "${file.name}" uploaded successfully.`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Clinical Overview Upload (Module 2.5)</h2>
      <p className="text-sm text-gray-600">
        Upload the Clinical Overview document summarizing the clinical background, development rationale, and risk/benefit assessment for the investigational product.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Upload Clinical Overview (PDF or Word)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="block w-full text-sm text-gray-700"
          onChange={handleUpload}
        />
        {clinicalOverview && (
          <p className="text-xs text-green-600 mt-1">{clinicalOverview.name} uploaded.</p>
        )}
      </div>
    </div>
  );
}