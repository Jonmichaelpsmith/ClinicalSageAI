// /client/src/components/ind-wizard/DrugSubstanceUploader.jsx

import { useState } from 'react';

export default function DrugSubstanceUploader({ setFormStatus }) {
  const [files, setFiles] = useState([]);

  const handleUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 0) {
      setFiles(uploadedFiles);
      setFormStatus(prev => ({ ...prev, drugSubstanceUploaded: true }));
      alert(`✅ ${uploadedFiles.length} Drug Substance documentation files uploaded successfully.`);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Upload specifications, batch data, manufacturing process descriptions, stability reports, and other documents related to the active pharmaceutical ingredient (API).
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Upload Drug Substance Files (Multiple Allowed)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            multiple
            className="block w-full text-sm text-gray-700"
            onChange={handleUpload}
          />
          {files.length > 0 && (
            <ul className="text-xs text-green-600 mt-2 space-y-1">
              {files.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-blue-50 p-3 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Required Documents</h3>
          <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
            <li>General Information (3.2.S.1)</li>
            <li>Manufacturing Process (3.2.S.2)</li>
            <li>Characterization (3.2.S.3)</li>
            <li>Control of Drug Substance (3.2.S.4)</li>
            <li>Reference Standards (3.2.S.5)</li>
            <li>Container Closure System (3.2.S.6)</li>
            <li>Stability Data (3.2.S.7)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}