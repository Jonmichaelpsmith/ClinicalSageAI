// /client/src/components/ind-wizard/OverallQualitySummaryForm.jsx

import { useState } from 'react';

export default function OverallQualitySummaryForm({ setFormStatus }) {
  const [qualitySummary, setQualitySummary] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (qualitySummary.trim() !== '') {
      setFormStatus(prev => ({ ...prev, overallQualitySummary: true }));
      alert('✅ Overall Quality Summary saved.');
    } else {
      alert('❌ Please provide an Overall Quality Summary.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Overall Quality Summary (Module 2.3)</h2>
      <p className="text-sm text-gray-600">
        Provide a high-level summary of the quality information related to the drug substance and drug product, based on CMC documentation.
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[120px]"
          placeholder="Write or paste the overall quality summary here..."
          value={qualitySummary}
          onChange={(e) => setQualitySummary(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Save Overall Quality Summary
        </button>
      </form>
    </div>
  );
}