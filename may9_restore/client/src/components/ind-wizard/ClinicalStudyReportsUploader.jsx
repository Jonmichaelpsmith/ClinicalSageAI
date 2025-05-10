// /client/src/components/ind-wizard/ClinicalStudyReportsUploader.jsx

import { useState } from 'react';

export default function ClinicalStudyReportsUploader({ setFormStatus }) {
  const [files, setFiles] = useState([]);

  const handleUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 0) {
      setFiles(uploadedFiles);
      setFormStatus(prev => ({ ...prev, clinicalStudyReportsUploaded: true }));
      alert(`✅ ${uploadedFiles.length} Clinical Study Report(s) uploaded successfully.`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Clinical Study Reports (Module 5.3)</h2>
      <p className="text-sm text-gray-600">
        Upload full Clinical Study Reports (CSRs) following ICH E3 guidelines, including safety analyses, efficacy analyses, and final integrated reports.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Upload Clinical Study Reports (Multiple Allowed)</label>
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