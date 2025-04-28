// /client/src/pages/VaultTestPage.jsx

import { useState } from 'react';

export default function VaultTestPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a file first');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('projectId', 'test-project');
      formData.append('module', 'Test Module');
      formData.append('uploader', 'Test User');
      
      const response = await fetch('/api/vault/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      setUploadResult(result);
      
      // Reload document list after successful upload
      if (result.success) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadResult({ success: false, message: 'Error uploading file' });
    } finally {
      setUploading(false);
    }
  };

  // Fetch all documents
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vault/list');
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents);
      } else {
        console.error('Failed to fetch documents', data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">TrialSage Vault Versioning Test</h1>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload the same file multiple times to test versioning. The system will automatically detect and increment versions.
          </p>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Document</label>
              <input 
                type="file" 
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded p-2 text-sm"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={uploading || !file}
              className={`px-4 py-2 rounded text-white ${
                uploading || !file ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
          
          {uploadResult && (
            <div className={`mt-4 p-3 rounded text-sm ${
              uploadResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {uploadResult.success 
                ? `Successfully uploaded: ${uploadResult.file.originalName} (Version ${uploadResult.file.version})`
                : `Error: ${uploadResult.message}`
              }
            </div>
          )}
        </div>
        
        {/* Document List Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Document List</h2>
            <button 
              onClick={fetchDocuments}
              disabled={loading}
              className={`px-3 py-1 rounded text-white text-sm ${
                loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Loading...' : 'Refresh List'}
            </button>
          </div>
          
          {documents.length === 0 ? (
            <p className="text-gray-500 text-sm">
              {loading ? 'Loading documents...' : 'No documents found. Upload a document first.'}
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {documents.map((doc, idx) => (
                <li key={idx} className="py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium">{doc.baseFilename || doc.originalName}</p>
                        {doc.version && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                            v{doc.version}
                          </span>
                        )}
                        {doc.isLatestVersion && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Project: {doc.projectId} • Module: {doc.moduleLinked} • 
                        Uploaded: {new Date(doc.uploadTime).toLocaleString()} •
                        By: {doc.uploader}
                      </p>
                    </div>
                    <a
                      href={`/api/vault/download/${doc.storedName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Download
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}