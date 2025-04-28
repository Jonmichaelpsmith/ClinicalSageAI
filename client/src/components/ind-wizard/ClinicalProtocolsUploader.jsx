// /client/src/components/ind-wizard/ClinicalProtocolsUploader.jsx

import { useState } from 'react';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';

export default function ClinicalProtocolsUploader({ setFormStatus }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Check file types - only allow PDFs and DOC/DOCX
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const invalidFiles = selectedFiles.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('Please upload only PDF, DOC, or DOCX files.');
      return;
    }
    
    setFiles(selectedFiles);
    setError(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select files to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      // Simulate API upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update form status
      setFormStatus(prev => ({ ...prev, clinicalProtocolsUploaded: true }));
      setUploadSuccess(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Clinical Protocols</h2>
        {uploadSuccess && (
          <span className="flex items-center text-sm text-green-600">
            <FileCheck className="w-4 h-4 mr-1" />
            Files uploaded successfully
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Upload final approved clinical protocols and amendments. Include all versions that have been submitted to ethics committees and regulatory agencies.
      </p>
      
      <div className="mb-4">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF, DOC, or DOCX (max 50MB per file)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              multiple 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
          </label>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {files.map((file, index) => (
              <li key={index} className="flex items-center">
                <FileCheck className="w-4 h-4 mr-2 text-blue-500" />
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md flex items-center text-sm">
          <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
          {error}
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
        className={`
          w-full py-2 px-4 rounded-md text-white font-medium 
          ${uploading || files.length === 0 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700'}
          transition-colors
        `}
      >
        {uploading ? 'Uploading...' : 'Upload Files'}
      </button>
      
      <div className="mt-3 text-xs text-gray-500">
        <p>Expected documents: Phase 1-3 protocols, Protocol amendments, Protocol synopses</p>
      </div>
    </div>
  );
}