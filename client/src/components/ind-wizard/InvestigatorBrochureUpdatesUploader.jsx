// /client/src/components/ind-wizard/InvestigatorBrochureUpdatesUploader.jsx

import { useState } from 'react';

export default function InvestigatorBrochureUpdatesUploader({ setFormStatus }) {
  const [files, setFiles] = useState([]);

  const handleUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 0) {
      setFiles(uploadedFiles);
      setFormStatus(prev => ({ ...prev, investigatorBrochureUpdatesUploaded: true }));
      alert(`✅ ${uploadedFiles.length} Investigator Brochure(s) uploaded successfully.`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Investigator Brochure Updates (Module 5.5)</h2>
      <p className="text-sm text-gray-600">
        Upload all versions of investigator brochures (IBs) used during clinical development, including any updates or amendments that were distributed to clinical investigators.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Upload Investigator Brochures (Multiple Allowed)</label>
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