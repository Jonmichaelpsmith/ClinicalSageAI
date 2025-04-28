// /client/src/components/ind-wizard/ClinicalOverviewUploader.jsx

import { useState } from 'react';

export default function ClinicalOverviewUploader({ setFormStatus }) {
  const [file, setFile] = useState(null);

  const handleUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFormStatus(prev => ({ ...prev, clinicalOverview: true }));
      alert(`✅ Clinical Overview "${selectedFile.name}" uploaded successfully.`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Clinical Overview (Module 2.5)</h2>
      <p className="text-sm text-gray-600">
        Upload a document providing a critical assessment of the clinical data relevant to the proposed investigation.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Upload Clinical Overview Document</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="block w-full text-sm text-gray-700"
          onChange={handleUpload}
        />
        {file && (
          <p className="text-xs text-green-600 mt-1">{file.name} uploaded.</p>
        )}
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Clinical Overview Guidance</h3>
        <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
          <li>Include benefits and risks assessment</li>
          <li>Discuss integrated analysis of efficacy and safety</li>
          <li>Provide product development rationale</li>
          <li>Support dose selection and administration schedule</li>
          <li>Address any safety concerns from nonclinical studies</li>
        </ul>
      </div>
    </div>
  );
}