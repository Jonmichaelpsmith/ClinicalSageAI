// /client/src/components/vault/VaultUploader.jsx

import { useState } from 'react';

export default function VaultUploader() {
  const [file, setFile] = useState(null);
  const [moduleLinked, setModuleLinked] = useState('');
  const [projectId, setProjectId] = useState('');
  const [uploaderName, setUploaderName] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('❌ Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('module', moduleLinked);
    formData.append('projectId', projectId);
    formData.append('uploader', uploaderName);

    try {
      const res = await fetch('/api/vault/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Document uploaded to Vault successfully.');
        // Reset fields
        setFile(null);
        setModuleLinked('');
        setProjectId('');
        setUploaderName('');
      } else {
        alert('❌ Upload failed.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Upload error occurred.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold">Upload Document to Vault</h2>

      <form onSubmit={handleUpload} className="space-y-4">

        <div>
          <label className="block text-sm font-medium mb-1">Select File</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            className="block w-full text-sm text-gray-700"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Associated CTD Module</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., Module 1, Module 3"
            value={moduleLinked}
            onChange={(e) => setModuleLinked(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Project ID</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter Project ID"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Uploader Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Your Name"
            value={uploaderName}
            onChange={(e) => setUploaderName(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Upload Document
        </button>

      </form>
    </div>
  );
}