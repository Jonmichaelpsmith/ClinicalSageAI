// /client/src/components/ind-wizard/RegionalInfoUploader.jsx

import { useState } from 'react';

export default function RegionalInfoUploader({ setFormStatus }) {
  const [files, setFiles] = useState([]);

  const handleUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 0) {
      setFiles(uploadedFiles);
      setFormStatus(prev => ({ ...prev, regionalInfoUploaded: true }));
      alert(`✅ ${uploadedFiles.length} Regional Information files uploaded successfully.`);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Upload region-specific information including DMF reference letters for FDA submissions, 
        process validation schemes, and other documentation required for specific regulatory authorities.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Upload Documentation (Multiple Files Allowed)</label>
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
          <h3 className="text-sm font-medium text-blue-800 mb-1">Common Regional Documents</h3>
          <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
            <li>US FDA: Drug Master File (DMF) Reference Letters</li>
            <li>US FDA: Environmental Analysis (EA) or Categorical Exclusion</li>
            <li>EU: Process Validation Scheme (PVS)</li>
            <li>EU: TSE/BSE Certificates</li>
            <li>Japan: Additional Stability Requirements</li>
            <li>Country-specific Product Information</li>
          </ul>
        </div>
      </div>
    </div>
  );
}