// /client/src/components/ind-wizard/USAgentForm.jsx

import { useState } from 'react';

export default function USAgentForm({ setFormStatus }) {
  const [agentName, setAgentName] = useState('');
  const [agentCompany, setAgentCompany] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [agentAddress, setAgentAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (agentName && agentEmail && agentPhone && agentAddress) {
      setFormStatus(prev => ({ ...prev, usAgentInfo: true }));
      alert('✅ US Agent Info Saved');
    } else {
      alert('❌ Please complete all US Agent fields');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4 border-t-4 border-amber-400 mt-8">
      <div className="flex items-center">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/1/1a/US-FDA-Logo.svg" 
          alt="FDA Logo" 
          className="w-12 h-12 mr-4" 
        />
        <div>
          <h2 className="text-xl font-semibold">US Agent Information</h2>
          <p className="text-gray-600 text-sm">
            Required for foreign sponsors submitting INDs to FDA
          </p>
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded text-amber-800 text-sm">
        <p>
          <strong>FDA Requirement:</strong> Foreign sponsors must appoint a US Agent who resides 
          or maintains a place of business in the United States to act as a communications link with the FDA.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">US Agent Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mt-1"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Company/Organization</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mt-1"
            value={agentCompany}
            onChange={(e) => setAgentCompany(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 mt-1"
              value={agentEmail}
              onChange={(e) => setAgentEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mt-1"
              value={agentPhone}
              onChange={(e) => setAgentPhone(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">US Address</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mt-1"
            value={agentAddress}
            onChange={(e) => setAgentAddress(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">
            Must be a physical address in the United States, not a P.O. Box
          </p>
        </div>

        <button type="submit" className="w-full bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition">
          Save US Agent Information
        </button>
      </form>
    </div>
  );
}