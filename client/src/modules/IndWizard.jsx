// /client/src/modules/IndWizard.jsx

import { useState } from 'react';
import DocsChecklist from '../components/DocsChecklist';
import { toast } from '../lightweight-wrappers';

const REQUIRED = ["Protocol.pdf", "IB.pdf", "DSUR.pdf", "CMC.pdf"];

function IndWizard() {
  const [seq, setSeq] = useState('0000');

  const build = async () => {
    toast.promise(
      fetch('/api/ind/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence: seq }),
      }).then(r => r.json()),
      {
        loading: 'Assembling IND...',
        success: (r) => `✅ IND ready! ObjectId ${r.zipObjectId}`,
        error: (e) => `❌ Failed: ${e.message}`,
      }
    );
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">IND Wizard™</h2>

      <DocsChecklist required={REQUIRED} />

      <div className="space-y-2">
        <label className="block font-semibold text-sm">Sequence Number:</label>
        <input
          value={seq}
          onChange={(e) => setSeq(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter Sequence (e.g., 0000)"
        />
      </div>

      <button
        onClick={build}
        className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
      >
        Build IND Submission →
      </button>
    </div>
  );
}

export default IndWizard;