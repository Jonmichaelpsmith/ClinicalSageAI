// /client/src/components/ind-wizard/IntroSummaryForm.jsx

import { useState } from 'react';

export default function IntroSummaryForm({ setFormStatus }) {
  const [introText, setIntroText] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (introText.trim() !== '') {
      setFormStatus(prev => ({ ...prev, introSummary: true }));
      alert('✅ Introduction to Summaries saved.');
    } else {
      alert('❌ Please provide an introduction summary.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Introduction to Summaries (Module 2.1)</h2>
      <p className="text-sm text-gray-600">
        Provide a brief overview introducing the content of the Common Technical Document (CTD).
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[120px]"
          placeholder="Write or paste the introduction summary here..."
          value={introText}
          onChange={(e) => setIntroText(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Save Introduction
        </button>
      </form>
    </div>
  );
}