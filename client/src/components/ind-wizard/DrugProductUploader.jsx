// /client/src/components/ind-wizard/DrugProductUploader.jsx

import { useState } from 'react';

export default function DrugProductUploader({ setFormStatus }) {
  const [files, setFiles] = useState([]);

  const handleUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 0) {
      setFiles(uploadedFiles);
      setFormStatus(prev => ({ ...prev, drugProductUploaded: true }));
      alert(`✅ ${uploadedFiles.length} Drug Product documentation files uploaded successfully.`);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Upload documents related to the drug product's final dosage form, including formulation, manufacturing process, packaging, control of critical steps, and stability studies.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Upload Drug Product Files (Multiple Allowed)</label>
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
            <li>Description and Composition (3.2.P.1)</li>
            <li>Pharmaceutical Development (3.2.P.2)</li>
            <li>Manufacturing Process (3.2.P.3)</li>
            <li>Control of Excipients (3.2.P.4)</li>
            <li>Control of Drug Product (3.2.P.5)</li>
            <li>Reference Standards (3.2.P.6)</li>
            <li>Container Closure System (3.2.P.7)</li>
            <li>Stability Data (3.2.P.8)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}