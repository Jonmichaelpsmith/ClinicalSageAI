// /client/src/components/ind-wizard/FDAFormsUploader.jsx

import { useState } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Trash2, 
  Download,
  Info
} from 'lucide-react';

export default function FDAFormsUploader({ setFormStatus }) {
  // State for tracking uploaded forms
  const [uploadedForms, setUploadedForms] = useState({
    form1571: null,
    form1572: null,
    form3674: null
  });
  
  const [showGuidance, setShowGuidance] = useState(false);

  // Handle form upload
  const handleFormUpload = (formName, e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, upload the file to server here
      setUploadedForms(prev => ({
        ...prev,
        [formName]: file
      }));
      
      // Update parent component's form status
      const updatedForms = {
        ...uploadedForms,
        [formName]: file
      };
      
      // Check if all required forms are uploaded
      if (updatedForms.form1571 && updatedForms.form3674) {
        setFormStatus(prev => ({ 
          ...prev, 
          fdaFormsUploaded: true,
          form1571Uploaded: true,
          form1572Uploaded: true
        }));
      }
    }
  };

  // Handle form deletion
  const handleDeleteForm = (formName) => {
    setUploadedForms(prev => ({
      ...prev,
      [formName]: null
    }));
    
    // Update parent component's form status
    setFormStatus(prev => ({
      ...prev, 
      fdaFormsUploaded: false,
      form1571Uploaded: formName !== 'form1571' && prev.form1571Uploaded,
      form1572Uploaded: formName !== 'form1572' && prev.form1572Uploaded
    }));
  };

  // Handle generating form templates
  const handleDownloadFormTemplate = (formName) => {
    // In a real app, this would download the official form
    const formURLs = {
      form1571: 'https://www.fda.gov/media/78118/download',
      form1572: 'https://www.fda.gov/media/78129/download',
      form3674: 'https://www.fda.gov/media/69842/download'
    };
    
    window.open(formURLs[formName], '_blank');
  };

  // Check if all required forms are uploaded
  const areRequiredFormsComplete = () => {
    return uploadedForms.form1571 && uploadedForms.form3674;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            <FileText className="mr-2 h-5 w-5 text-orange-600" />
            FDA Forms
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Required FDA forms for IND submission
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
          <h3 className="font-medium text-blue-800 mb-2">FDA Forms Requirements</h3>
          <p className="mb-2">
            For an IND submission, the following FDA forms are required:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Form FDA 1571 (Required)</strong> - The main IND application form that must be completed by the sponsor.
              It includes sections for investigational product details, phases of investigation, and contact information.
            </li>
            <li>
              <strong>Form FDA 1572 (For Clinical Investigators)</strong> - Statement of Investigator form that must be completed by
              each clinical investigator participating in the study. This will be submitted later for each investigator.
            </li>
            <li>
              <strong>Form FDA 3674 (Required)</strong> - Certification of Compliance with ClinicalTrials.gov requirements
              for applicable clinical trials.
            </li>
          </ul>
          <p className="mt-3">
            These forms must be filled out completely and accurately as per 21 CFR 312.23. Missing or incomplete forms
            may result in a clinical hold or refusal to file.
          </p>
        </div>
      )}

      {/* Form 1571 */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
          <div>
            <h3 className="font-medium">Form FDA 1571</h3>
            <p className="text-xs text-gray-500">Investigational New Drug Application (Required)</p>
          </div>
          <div className="flex items-center">
            <Info className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-xs text-blue-600">21 CFR 312.23(a)(1)</span>
          </div>
        </div>
        
        <div className="p-4">
          {!uploadedForms.form1571 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <h4 className="text-gray-700 font-medium">Upload Form FDA 1571</h4>
                <p className="text-gray-500 text-sm mb-4">PDF format (Max 10MB)</p>
                
                <div className="flex space-x-3">
                  <input
                    type="file"
                    id="form1571Upload"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFormUpload('form1571', e)}
                  />
                  <label 
                    htmlFor="form1571Upload" 
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded cursor-pointer inline-flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Form
                  </label>
                  
                  <button 
                    onClick={() => handleDownloadFormTemplate('form1571')}
                    className="border border-orange-600 text-orange-600 hover:bg-orange-50 px-4 py-2 rounded inline-flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <h4 className="font-medium">{uploadedForms.form1571.name}</h4>
                  <p className="text-sm text-gray-500">
                    {(uploadedForms.form1571.size / (1024 * 1024)).toFixed(2)} MB • Uploaded {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <button className="text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1 rounded text-sm">
                  View
                </button>
                <button 
                  onClick={() => handleDeleteForm('form1571')}
                  className="text-red-600 hover:text-red-800 border border-red-200 px-3 py-1 rounded text-sm flex items-center"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </button>
              </div>
              
              <div className="mt-3 flex items-center text-green-600 bg-green-50 px-3 py-2 rounded text-sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Form FDA 1571 uploaded successfully
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Form 3674 */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
          <div>
            <h3 className="font-medium">Form FDA 3674</h3>
            <p className="text-xs text-gray-500">Certification of Compliance (Required)</p>
          </div>
          <div className="flex items-center">
            <Info className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-xs text-blue-600">42 CFR 11.60</span>
          </div>
        </div>
        
        <div className="p-4">
          {!uploadedForms.form3674 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <h4 className="text-gray-700 font-medium">Upload Form FDA 3674</h4>
                <p className="text-gray-500 text-sm mb-4">PDF format (Max 10MB)</p>
                
                <div className="flex space-x-3">
                  <input
                    type="file"
                    id="form3674Upload"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFormUpload('form3674', e)}
                  />
                  <label 
                    htmlFor="form3674Upload" 
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded cursor-pointer inline-flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Form
                  </label>
                  
                  <button 
                    onClick={() => handleDownloadFormTemplate('form3674')}
                    className="border border-orange-600 text-orange-600 hover:bg-orange-50 px-4 py-2 rounded inline-flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <h4 className="font-medium">{uploadedForms.form3674.name}</h4>
                  <p className="text-sm text-gray-500">
                    {(uploadedForms.form3674.size / (1024 * 1024)).toFixed(2)} MB • Uploaded {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <button className="text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1 rounded text-sm">
                  View
                </button>
                <button 
                  onClick={() => handleDeleteForm('form3674')}
                  className="text-red-600 hover:text-red-800 border border-red-200 px-3 py-1 rounded text-sm flex items-center"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </button>
              </div>
              
              <div className="mt-3 flex items-center text-green-600 bg-green-50 px-3 py-2 rounded text-sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Form FDA 3674 uploaded successfully
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        {!areRequiredFormsComplete() ? (
          <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded">
            <AlertCircle className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">Required FDA forms incomplete</p>
              <p className="text-sm">Form FDA 1571 and Form FDA 3674 are required for IND submission per 21 CFR 312.23.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center text-green-600 bg-green-50 p-3 rounded">
            <CheckCircle className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">Required FDA forms completed</p>
              <p className="text-sm">All required FDA forms have been uploaded successfully.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}