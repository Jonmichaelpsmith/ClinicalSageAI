// /client/src/components/ind-wizard/CoverLetterUploader.jsx

import { useState } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Trash2, 
  Download, 
  Pencil,
  ChevronRight,
  ChevronDown 
} from 'lucide-react';

export default function CoverLetterUploader({ setFormStatus }) {
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, upload the file to server here
      setCoverLetterFile(file);
      setFormStatus(prev => ({ ...prev, coverLetterUploaded: true }));
    }
  };

  // Handle file deletion
  const handleDeleteFile = () => {
    setCoverLetterFile(null);
    setFormStatus(prev => ({ ...prev, coverLetterUploaded: false }));
  };

  // Handle generating a template
  const handleGenerateTemplate = (templateType) => {
    // In a real app, this would generate and download a template
    alert(`A ${templateType} cover letter template would be generated here.`);
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
            Upload your cover letter for this IND application
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
          <p className="mb-2">
            Although not explicitly required by regulations, a well-written cover letter is standard practice and helps FDA reviewers understand the context of your IND submission. Your cover letter should:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Clearly state that this is an Initial IND submission</li>
            <li>Provide a brief overview of the investigational drug</li>
            <li>Reference the proposed indication</li>
            <li>Mention the proposed phase of investigation</li>
            <li>List all parts of the submission (table of contents)</li>
            <li>Include contact information for the sponsor's authorized representative</li>
          </ul>
          <p className="mt-3 mb-3">
            The cover letter serves as a roadmap to your IND application and helps ensure that it is routed to the appropriate FDA division for review.
          </p>
          
          <div className="mt-4">
            <button 
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center text-blue-600 font-medium"
            >
              {showTemplates ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
              Cover Letter Templates
            </button>
            
            {showTemplates && (
              <div className="mt-2 pl-5 space-y-2">
                <button 
                  onClick={() => handleGenerateTemplate('Phase 1')}
                  className="text-blue-600 hover:text-blue-800 underline flex items-center"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Phase 1 IND Cover Letter Template
                </button>
                <button 
                  onClick={() => handleGenerateTemplate('Phase 2')}
                  className="text-blue-600 hover:text-blue-800 underline flex items-center"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Phase 2 IND Cover Letter Template
                </button>
                <button 
                  onClick={() => handleGenerateTemplate('Phase 3')}
                  className="text-blue-600 hover:text-blue-800 underline flex items-center"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Phase 3 IND Cover Letter Template
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="font-medium">Cover Letter</h3>
          <p className="text-xs text-gray-500">Recommended for all IND submissions</p>
        </div>
        
        <div className="p-4">
          {!coverLetterFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <h4 className="text-gray-700 font-medium">Upload Cover Letter</h4>
                <p className="text-gray-500 text-sm mb-4">PDF or Word format (Max 10MB)</p>
                
                <div className="flex space-x-4">
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
                    Upload File
                  </label>
                  
                  <button 
                    onClick={() => handleGenerateTemplate('Standard')}
                    className="border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded inline-flex items-center"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Create New
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h4 className="font-medium">{coverLetterFile.name}</h4>
                  <p className="text-sm text-gray-500">
                    {(coverLetterFile.size / (1024 * 1024)).toFixed(2)} MB • Uploaded {new Date().toLocaleDateString()}
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
        {!coverLetterFile ? (
          <div className="flex items-center text-amber-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">A cover letter is recommended for a well-organized IND submission</span>
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