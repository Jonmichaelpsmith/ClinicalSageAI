// /client/src/pages/VaultPage.jsx

import { useState } from 'react';
import VaultUploader from '../components/vault/VaultUploader';

export default function VaultPage() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUploadComplete = (fileInfo) => {
    setUploadedFiles(prev => [fileInfo, ...prev]);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">TrialSage Vault</h1>
          <p className="text-gray-600">
            Secure document management for regulatory submissions with version control and intelligent tagging
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <VaultUploader 
              projectId="enzyme-forte-ind"
              onUploadComplete={handleUploadComplete}
            />
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
              
              {uploadedFiles.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  <p>No files have been uploaded yet.</p>
                  <p className="text-sm">Use the uploader to add documents to the vault.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">{file.originalName}</p>
                        <div className="flex text-sm text-gray-500 gap-2">
                          <span>Module: {file.moduleLinked}</span>
                          <span>•</span>
                          <span>Uploaded: {new Date(file.uploadTime).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-blue-500 hover:underline text-sm">View</button>
                        <button className="text-blue-500 hover:underline text-sm">Download</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}