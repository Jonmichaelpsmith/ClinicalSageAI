// /client/src/components/ind-wizard/InvestigatorBrochureUploader.jsx

import { useState } from 'react';

export default function InvestigatorBrochureUploader({ setFormStatus }) {
  const [ibDocument, setIbDocument] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIbDocument(file);
      setFormStatus(prev => ({ ...prev, ibUploaded: true }));
      alert(`✅ Investigator Brochure "${file.name}" uploaded successfully.`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Investigator Brochure (IB) Upload</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Upload Investigator Brochure (PDF or Word)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="block w-full text-sm text-gray-700"
          onChange={handleUpload}
        />
        {ibDocument && (
          <p className="text-xs text-green-600 mt-1">{ibDocument.name} uploaded.</p>
        )}
      </div>
    </div>
  );
}