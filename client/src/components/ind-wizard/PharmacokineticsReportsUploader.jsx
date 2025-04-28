// /client/src/components/ind-wizard/PharmacokineticsReportsUploader.jsx

import { useState } from 'react';

export default function PharmacokineticsReportsUploader({ setFormStatus }) {
  const [files, setFiles] = useState([]);

  const handleUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 0) {
      setFiles(uploadedFiles);
      setFormStatus(prev => ({ ...prev, pharmacokineticsUploaded: true }));
      alert(`✅ ${uploadedFiles.length} Pharmacokinetics Study Report(s) uploaded successfully.`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Pharmacokinetics Study Reports (Module 4.3)</h2>
      <p className="text-sm text-gray-600">
        Upload studies on absorption, distribution, metabolism, and excretion (ADME) of the investigational product, including bioavailability and metabolism data.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Upload Pharmacokinetics Reports (Multiple Allowed)</label>
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
    </div>
  );
}