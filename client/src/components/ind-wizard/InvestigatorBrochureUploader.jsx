// /client/src/components/ind-wizard/InvestigatorBrochureUploader.jsx

import { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, HelpCircle, Trash2, Download } from 'lucide-react';

export default function InvestigatorBrochureUploader({ setFormStatus }) {
  const [ibFile, setIbFile] = useState(null);
  const [showGuidance, setShowGuidance] = useState(false);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, upload the file to server here
      setIbFile(file);
      setFormStatus(prev => ({ ...prev, ibUploaded: true }));
    }
  };

  // Handle file deletion
  const handleDeleteFile = () => {
    setIbFile(null);
    setFormStatus(prev => ({ ...prev, ibUploaded: false }));
  };

  // Handle generating a template
  const handleGenerateTemplate = () => {
    // In a real app, this would generate and download a template
    alert('An Investigator Brochure template would be generated here.');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            <FileText className="mr-2 h-5 w-5 text-purple-600" />
            Investigator Brochure
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Upload your Investigator Brochure for this IND application
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
          <h3 className="font-medium text-blue-800 mb-2">Investigator Brochure Requirements</h3>
          <p className="mb-2">
            The Investigator Brochure (IB) is a critical document that provides clinical investigators with relevant 
            information about the investigational product. Per 21 CFR 312.23(a)(5), your IB should include:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Description of the drug substance and formulation</li>
            <li>Summary of relevant pharmacological and toxicological studies</li>
            <li>Summary of pharmacokinetics and biological disposition in animals</li> 
            <li>Summary of safety and efficacy information from previous human studies</li>
            <li>Description of possible risks and side effects</li>
          </ul>
          <p className="mt-3 mb-3">
            The IB serves as the key reference document for investigators participating in the clinical trial and must be updated as significant new information becomes available.
          </p>
          <button 
            onClick={handleGenerateTemplate}
            className="text-blue-600 hover:text-blue-800 underline flex items-center"
          >
            <Download className="h-3 w-3 mr-1" />
            Generate IB Template
          </button>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="font-medium">Investigator Brochure</h3>
          <p className="text-xs text-gray-500">Required for all IND submissions</p>
        </div>
        
        <div className="p-4">
          {!ibFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <h4 className="text-gray-700 font-medium">Upload Investigator Brochure</h4>
                <p className="text-gray-500 text-sm mb-4">PDF format (Max 50MB)</p>
                
                <input
                  type="file"
                  id="ibUpload"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="ibUpload" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded cursor-pointer inline-flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </label>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <h4 className="font-medium">{ibFile.name}</h4>
                  <p className="text-sm text-gray-500">
                    {(ibFile.size / (1024 * 1024)).toFixed(2)} MB • Uploaded {new Date().toLocaleDateString()}
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
                Investigator Brochure uploaded successfully
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center mt-4">
        {!ibFile ? (
          <div className="flex items-center text-amber-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">Investigator Brochure is required for IND submission (21 CFR 312.23(a)(5))</span>
          </div>
        ) : (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">Investigator Brochure has been uploaded</span>
          </div>
        )}
      </div>
    </div>
  );
}