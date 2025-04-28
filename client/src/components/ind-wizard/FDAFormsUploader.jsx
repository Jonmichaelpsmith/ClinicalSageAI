// /client/src/components/ind-wizard/FDAFormsUploader.jsx

import { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, HelpCircle, Trash2, Download } from 'lucide-react';

export default function FDAFormsUploader({ setFormStatus }) {
  const [form1571File, setForm1571File] = useState(null);
  const [form1572File, setForm1572File] = useState(null);
  const [showGuidance, setShowGuidance] = useState(false);

  // Handle file upload for Form 1571
  const handleForm1571Upload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, upload the file to server here
      setForm1571File(file);
      setFormStatus(prev => ({ ...prev, form1571Uploaded: true }));
    }
  };

  // Handle file upload for Form 1572
  const handleForm1572Upload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, upload the file to server here
      setForm1572File(file);
      setFormStatus(prev => ({ ...prev, form1572Uploaded: true }));
    }
  };

  // Handle file deletion for Form 1571
  const handleDeleteForm1571 = () => {
    setForm1571File(null);
    setFormStatus(prev => ({ ...prev, form1571Uploaded: false }));
  };

  // Handle file deletion for Form 1572
  const handleDeleteForm1572 = () => {
    setForm1572File(null);
    setFormStatus(prev => ({ ...prev, form1572Uploaded: false }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-600" />
            FDA Forms
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Upload completed FDA Form 1571 and Form 1572 documents
          </p>
        </div>
        
        <button 
          onClick={() => setShowGuidance(!showGuidance)}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          Form Guidance
        </button>
      </div>
      
      {showGuidance && (
        <div className="bg-blue-50 p-4 rounded-lg text-sm border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">FDA Form Requirements</h3>
          <p className="mb-2">
            <span className="font-semibold">Form FDA 1571:</span> Investigational New Drug Application (IND) form completed by the sponsor. 
            This form includes information about the sponsor, investigational product, and clinical protocol.
          </p>
          <p>
            <span className="font-semibold">Form FDA 1572:</span> Statement of Investigator form completed by each principal investigator. 
            This form commits the investigator to comply with FDA regulations.
          </p>
          <p className="mt-2">
            <a 
              href="https://www.fda.gov/media/72427/download" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline flex items-center"
            >
              <Download className="h-3 w-3 mr-1" />
              Download Form FDA 1571
            </a>
          </p>
          <p>
            <a 
              href="https://www.fda.gov/media/74921/download" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline flex items-center"
            >
              <Download className="h-3 w-3 mr-1" />
              Download Form FDA 1572
            </a>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form 1571 Upload Section */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-medium">Form FDA 1571</h3>
            <p className="text-xs text-gray-500">Investigational New Drug Application</p>
          </div>
          
          <div className="p-4">
            {!form1571File ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <h4 className="text-gray-700 font-medium">Upload Form FDA 1571</h4>
                  <p className="text-gray-500 text-sm mb-4">PDF format (Max 10MB)</p>
                  
                  <input
                    type="file"
                    id="form1571Upload"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleForm1571Upload}
                  />
                  <label 
                    htmlFor="form1571Upload" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer inline-flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </label>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-medium">{form1571File.name}</h4>
                    <p className="text-sm text-gray-500">
                      {(form1571File.size / (1024 * 1024)).toFixed(2)} MB • Uploaded {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <button className="text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1 rounded text-sm">
                    View
                  </button>
                  <button 
                    onClick={handleDeleteForm1571}
                    className="text-red-600 hover:text-red-800 border border-red-200 px-3 py-1 rounded text-sm flex items-center"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove
                  </button>
                </div>
                
                <div className="mt-3 flex items-center text-green-600 bg-green-50 px-3 py-2 rounded text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Form 1571 uploaded successfully
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Form 1572 Upload Section */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-medium">Form FDA 1572</h3>
            <p className="text-xs text-gray-500">Statement of Investigator</p>
          </div>
          
          <div className="p-4">
            {!form1572File ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <h4 className="text-gray-700 font-medium">Upload Form FDA 1572</h4>
                  <p className="text-gray-500 text-sm mb-4">PDF format (Max 10MB)</p>
                  
                  <input
                    type="file"
                    id="form1572Upload"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleForm1572Upload}
                  />
                  <label 
                    htmlFor="form1572Upload" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer inline-flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </label>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-medium">{form1572File.name}</h4>
                    <p className="text-sm text-gray-500">
                      {(form1572File.size / (1024 * 1024)).toFixed(2)} MB • Uploaded {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <button className="text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1 rounded text-sm">
                    View
                  </button>
                  <button 
                    onClick={handleDeleteForm1572}
                    className="text-red-600 hover:text-red-800 border border-red-200 px-3 py-1 rounded text-sm flex items-center"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove
                  </button>
                </div>
                
                <div className="mt-3 flex items-center text-green-600 bg-green-50 px-3 py-2 rounded text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Form 1572 uploaded successfully
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center mt-4">
        {!form1571File || !form1572File ? (
          <div className="flex items-center text-amber-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">Please upload both required FDA forms</span>
          </div>
        ) : (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">All required FDA forms have been uploaded</span>
          </div>
        )}
      </div>
    </div>
  );
}