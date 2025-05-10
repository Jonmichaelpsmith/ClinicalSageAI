// /client/src/components/ind-wizard/AppendicesUploader.jsx

import { useState } from 'react';

export default function AppendicesUploader({ setFormStatus }) {
  const [files, setFiles] = useState([]);

  const handleUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 0) {
      setFiles(uploadedFiles);
      setFormStatus(prev => ({ ...prev, appendicesUploaded: true }));
      alert(`✅ ${uploadedFiles.length} Appendix document(s) uploaded successfully.`);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Upload supporting appendices such as GMP Certificates, Manufacturing Process Validation Reports, Stability Study Summaries, or Certificates of Analysis (CoAs).
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Upload Appendix Files (Multiple Allowed)</label>
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
            <li>Facilities and Equipment (3.2.A.1)</li>
            <li>Adventitious Agents Safety Evaluation (3.2.A.2)</li>
            <li>Novel Excipients (3.2.A.3)</li>
            <li>GMP Certificates</li>
            <li>Manufacturing Validation Reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
}