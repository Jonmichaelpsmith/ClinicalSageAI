// /client/src/components/ind-wizard/CoverLetterUploader.jsx

import { useState } from 'react';

export default function CoverLetterUploader({ setFormStatus }) {
  const [coverLetter, setCoverLetter] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverLetter(file);
      setFormStatus(prev => ({ ...prev, coverLetterUploaded: true }));
      alert(`✅ Cover Letter "${file.name}" uploaded successfully.`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Cover Letter Upload</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Upload Regulatory Cover Letter (PDF or Word)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="block w-full text-sm text-gray-700"
          onChange={handleUpload}
        />
        {coverLetter && (
          <p className="text-xs text-green-600 mt-1">{coverLetter.name} uploaded.</p>
        )}
      </div>
    </div>
  );
}