// /client/src/components/ind-wizard/CoverLetterUploader.jsx

import { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, HelpCircle, Trash2, Download } from 'lucide-react';

export default function CoverLetterUploader({ setFormStatus }) {
  const [letterFile, setLetterFile] = useState(null);
  const [showGuidance, setShowGuidance] = useState(false);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, upload the file to server here
      setLetterFile(file);
      setFormStatus(prev => ({ ...prev, coverLetterUploaded: true }));
    }
  };

  // Handle file deletion
  const handleDeleteFile = () => {
    setLetterFile(null);
    setFormStatus(prev => ({ ...prev, coverLetterUploaded: false }));
  };

  // Handle generating a template
  const handleGenerateTemplate = () => {
    // In a real app, this would generate and download a template
    alert('A cover letter template would be generated here.');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            <FileText className="mr-2 h-5 w-5 text-green-600" />
            Cover Letter
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Upload your IND application cover letter
          </p>
        </div>
        
        <button 
          onClick={() => setShowGuidance(!showGuidance)}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          Guidance
        </button>
      </div>
      
      {showGuidance && (
        <div className="bg-blue-50 p-4 rounded-lg text-sm border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">Cover Letter Requirements</h3>
          <p className="mb-3">
            The cover letter should provide key information about your IND submission:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Application type (e.g., initial IND submission)</li>
            <li>Product name and description</li>
            <li>Proposed indication(s)</li>
            <li>Reference to any previous communications with FDA</li>
            <li>List of all items included in the submission</li>
            <li>Contact information for questions about the submission</li>
          </ul>
          <p className="mt-3 mb-3">
            The cover letter should be on company letterhead, dated, and signed by the sponsor's authorized representative.
          </p>
          <button 
            onClick={handleGenerateTemplate}
            className="text-blue-600 hover:text-blue-800 underline flex items-center"
          >
            <Download className="h-3 w-3 mr-1" />
            Generate Cover Letter Template
          </button>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="font-medium">IND Cover Letter</h3>
          <p className="text-xs text-gray-500">Required for all IND submissions</p>
        </div>
        
        <div className="p-4">
          {!letterFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <h4 className="text-gray-700 font-medium">Upload Cover Letter</h4>
                <p className="text-gray-500 text-sm mb-4">PDF format (Max 5MB)</p>
                
                <input
                  type="file"
                  id="coverLetterUpload"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="coverLetterUpload" 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer inline-flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Cover Letter
                </label>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h4 className="font-medium">{letterFile.name}</h4>
                  <p className="text-sm text-gray-500">
                    {(letterFile.size / (1024 * 1024)).toFixed(2)} MB • Uploaded {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <button className="text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1 rounded text-sm">
                  View
                </button>
                <button 
                  onClick={handleDeleteFile}
                  className="text-red-600 hover:text-red-800 border border-red-200 px-3 py-1 rounded text-sm flex items-center"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </button>
              </div>
              
              <div className="mt-3 flex items-center text-green-600 bg-green-50 px-3 py-2 rounded text-sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Cover letter uploaded successfully
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center mt-4">
        {!letterFile ? (
          <div className="flex items-center text-amber-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">Cover letter is required for IND submission</span>
          </div>
        ) : (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">Cover letter has been uploaded</span>
          </div>
        )}
      </div>
    </div>
  );
}