// /client/src/components/ind-wizard/ClinicalSafetyReportsUploader.jsx

import { useState } from 'react';

export default function ClinicalSafetyReportsUploader({ setFormStatus }) {
  const [files, setFiles] = useState([]);
  const [reportType, setReportType] = useState('dsur');

  const handleUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
      setFormStatus(prev => ({ ...prev, clinicalSafetyReportsUploaded: true }));
      alert(`✅ ${uploadedFiles.length} Clinical Safety Report(s) uploaded successfully.`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Clinical Safety Reports (Module 5.4)</h2>
      <p className="text-sm text-gray-600">
        Upload Development Safety Update Reports (DSURs), safety narratives, or serious adverse event compilations required for regulatory review. These safety assessments are critical for the evaluation of your clinical program.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Report Type</label>
          <select 
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="dsur">Development Safety Update Report (DSUR)</option>
            <option value="safety_narrative">Safety Narratives</option>
            <option value="sae_report">Serious Adverse Event (SAE) Reports</option>
            <option value="other">Other Safety Documentation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload Safety Reports (Multiple Allowed)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            multiple
            className="block w-full text-sm text-gray-700"
            onChange={handleUpload}
          />
        </div>
        
        {files.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-1">Uploaded Reports:</h4>
            <ul className="text-xs text-green-600 mt-2 space-y-1 max-h-40 overflow-y-auto border border-gray-100 rounded p-2">
              {files.map((file, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="w-6 h-6 flex-shrink-0 mr-2">📄</span>
                  <span className="truncate">{file.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-2">
          <p>📌 <strong>Note:</strong> Development Safety Update Reports (DSURs) should cover the reporting period and include appropriate metadata.</p>
          <p>📌 All safety reports must follow ICH E2 guidelines for content and format.</p>
        </div>
      </div>
    </div>
  );
}