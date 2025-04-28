// /client/src/components/ind-wizard/ClinicalSafetyReportsUploader.jsx

import { useState } from 'react';

export default function ClinicalSafetyReportsUploader({ setFormStatus }) {
  const [files, setFiles] = useState([]);

  const handleUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 0) {
      setFiles(uploadedFiles);
      setFormStatus(prev => ({ ...prev, clinicalSafetyReportsUploaded: true }));
      alert(`✅ ${uploadedFiles.length} Clinical Safety Report(s) uploaded successfully.`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Clinical Safety Reports (Module 5.6)</h2>
      <p className="text-sm text-gray-600">
        Upload Development Safety Update Reports (DSURs), adverse event narratives, and periodic safety reports required by regulatory agencies for your clinical program.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Upload Safety Reports (Multiple Allowed)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
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
    </div>
  );
}