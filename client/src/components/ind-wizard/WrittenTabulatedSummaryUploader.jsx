// /client/src/components/ind-wizard/WrittenTabulatedSummaryUploader.jsx

import { useState } from 'react';

export default function WrittenTabulatedSummaryUploader({ setFormStatus }) {
  const [files, setFiles] = useState([]);

  const handleUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      setFormStatus(prev => ({ ...prev, writtenTabulatedSummaries: true }));
      alert(`✅ ${selectedFiles.length} Written and Tabulated Summary document(s) uploaded successfully.`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Written and Tabulated Summaries Upload (Module 2.6/2.7)</h2>
      <p className="text-sm text-gray-600">
        Upload detailed summaries of nonclinical and clinical data, presented in textual and tabular formats according to ICH guidance.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Upload Written and Tabulated Summaries (Multiple Files)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          multiple
          className="block w-full text-sm text-gray-700"
          onChange={handleUpload}
        />
        
        {files.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-green-600 mb-1">{files.length} file(s) uploaded:</p>
            <ul className="text-xs text-green-600 list-disc pl-5">
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}