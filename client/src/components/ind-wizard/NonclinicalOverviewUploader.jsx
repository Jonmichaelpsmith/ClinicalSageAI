// /client/src/components/ind-wizard/NonclinicalOverviewUploader.jsx

import { useState } from 'react';

export default function NonclinicalOverviewUploader({ setFormStatus }) {
  const [file, setFile] = useState(null);

  const handleUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFormStatus(prev => ({ ...prev, nonclinicalOverview: true }));
      alert(`✅ Nonclinical Overview "${selectedFile.name}" uploaded successfully.`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Nonclinical Overview (Module 2.4)</h2>
      <p className="text-sm text-gray-600">
        Upload a document providing a comprehensive assessment of the nonclinical evaluation performed with the drug substance.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Upload Nonclinical Overview Document</label>
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
        <h3 className="text-sm font-medium text-blue-800 mb-2">Nonclinical Overview Guidance</h3>
        <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
          <li>Integrate findings from all pharmacology, PK/ADME, and toxicology studies</li>
          <li>Explain how nonclinical data supports the proposed clinical study design</li>
          <li>Address any concerning findings and their clinical relevance</li>
          <li>Justify the selection of the starting dose and dose escalation scheme</li>
          <li>Discuss safety margins based on exposure data</li>
        </ul>
      </div>
    </div>
  );
}