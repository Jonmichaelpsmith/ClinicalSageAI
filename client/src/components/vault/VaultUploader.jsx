// /client/src/components/vault/VaultUploader.jsx

import { useState } from 'react';

export default function VaultUploader({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [moduleLinked, setModuleLinked] = useState('');
  const [projectId, setProjectId] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('❌ Please select a file to upload.');
      return;
    }

    setIsUploading(true);

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
        
        // Notify parent component to refresh document list
        if (onUploadComplete) {
          onUploadComplete(data.file);
        }
      } else {
        alert('❌ Upload failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Upload error occurred.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-xl font-semibold">Upload Document to Vault</h2>

      <form onSubmit={handleUpload} className="space-y-4">

        <div>
          <label className="block text-sm font-medium mb-1">Select File</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
            className="block w-full text-sm text-gray-700"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={isUploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">CTD Module</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={moduleLinked}
            onChange={(e) => setModuleLinked(e.target.value)}
            disabled={isUploading}
          >
            <option value="">Select a CTD Module</option>
            <option value="module1">Module 1: Administrative</option>
            <option value="module2">Module 2: Summaries</option>
            <option value="module3">Module 3: Quality (CMC)</option>
            <option value="module4">Module 4: Nonclinical</option>
            <option value="module5">Module 5: Clinical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Project ID</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter Project ID"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={isUploading}
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
            disabled={isUploading}
          />
        </div>

        <button
          type="submit"
          className={`w-full px-4 py-2 rounded transition ${
            isUploading 
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </button>

      </form>
    </div>
  );
}