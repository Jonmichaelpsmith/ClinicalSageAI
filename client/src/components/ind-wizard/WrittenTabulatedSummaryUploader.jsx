// /client/src/components/ind-wizard/WrittenTabulatedSummaryUploader.jsx

import { useState } from 'react';

export default function WrittenTabulatedSummaryUploader({ setFormStatus }) {
  const [files, setFiles] = useState([]);

  const handleUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 0) {
      setFiles(uploadedFiles);
      setFormStatus(prev => ({ ...prev, writtenTabulatedSummaries: true }));
      alert(`✅ ${uploadedFiles.length} Written/Tabulated Summaries uploaded successfully.`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Written and Tabulated Summaries (Module 2.6)</h2>
      <p className="text-sm text-gray-600">
        Upload any nonclinical and clinical written and tabulated summaries required for submission under CTD Module 2.6.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Upload Summaries (Multiple Files Allowed)</label>
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