// /client/src/components/ind-wizard/USAgentForm.jsx

import { useState } from 'react';

export default function USAgentForm({ setFormStatus }) {
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [agentAddress, setAgentAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (agentName && agentEmail && agentPhone && agentAddress) {
      setFormStatus(prev => ({ ...prev, usAgentInfo: true }));
      alert('✅ US Agent Info Saved');
    } else {
      alert('❌ Please complete all US Agent fields');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">U.S. Authorized Agent Information (If Applicable)</h2>
      <p className="text-sm text-gray-600">
        If the sponsor is not located in the United States, appoint a U.S. agent.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Agent Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mt-1"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Agent Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 mt-1"
            value={agentEmail}
            onChange={(e) => setAgentEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Agent Phone</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mt-1"
            value={agentPhone}
            onChange={(e) => setAgentPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Agent Address</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mt-1"
            value={agentAddress}
            onChange={(e) => setAgentAddress(e.target.value)}
          />
        </div>

        <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
          Save U.S. Agent Info
        </button>
      </form>
    </div>
  );
}