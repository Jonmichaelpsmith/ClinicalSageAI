// /client/src/components/ind-wizard/SponsorInfoForm.jsx

import { useState } from 'react';

export default function SponsorInfoForm({ setFormStatus }) {
  const [sponsorName, setSponsorName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Very basic validation (can expand later)
    if (sponsorName && contactName && contactEmail && contactPhone && address) {
      setFormStatus(prev => ({ ...prev, sponsorInfo: true }));
      alert('✅ Sponsor Info Saved');
    } else {
      alert('❌ Please complete all Sponsor fields');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Sponsor / Applicant Information</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Sponsor / Company Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mt-1"
            value={sponsorName}
            onChange={(e) => setSponsorName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Primary Contact Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mt-1"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Primary Contact Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 mt-1"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Primary Contact Phone</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mt-1"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Organization Address</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mt-1"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
          Save Sponsor Info
        </button>
      </form>
    </div>
  );
}