// /client/src/components/ind-wizard/NonclinicalOverviewUploader.jsx

import { useState } from 'react';

export default function NonclinicalOverviewUploader({ setFormStatus }) {
  const [nonclinicalOverview, setNonclinicalOverview] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNonclinicalOverview(file);
      setFormStatus(prev => ({ ...prev, nonclinicalOverview: true }));
      alert(`✅ Nonclinical Overview "${file.name}" uploaded successfully.`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Nonclinical Overview Upload (Module 2.4)</h2>
      <p className="text-sm text-gray-600">
        Upload the Nonclinical Overview document summarizing toxicology, pharmacology, and other nonclinical data for the investigational product.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Upload Nonclinical Overview (PDF or Word)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="block w-full text-sm text-gray-700"
          onChange={handleUpload}
        />
        {nonclinicalOverview && (
          <p className="text-xs text-green-600 mt-1">{nonclinicalOverview.name} uploaded.</p>
        )}
      </div>
    </div>
  );
}