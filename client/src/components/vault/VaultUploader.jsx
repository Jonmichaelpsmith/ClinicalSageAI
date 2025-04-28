// /client/src/components/vault/VaultUploader.jsx

import { useState, useEffect } from 'react';

export default function VaultUploader({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [moduleLinked, setModuleLinked] = useState('');
  const [projectId, setProjectId] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [docSection, setDocSection] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  
  // Common project IDs from the system for easier selection
  const [commonProjects, setCommonProjects] = useState([
    'IND-2023-001',
    'IND-2024-023',
    'IND-2025-034',
    'CSR-2024-089',
    'Protocol-507'
  ]);
  
  // Fetch user info from localStorage if available
  useEffect(() => {
    const savedUser = localStorage.getItem('vaultUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        if (userData && userData.name) {
          setUploaderName(userData.name);
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
      }
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    
    if (!file) {
      errors.file = 'Please select a file to upload';
    }
    
    if (!moduleLinked) {
      errors.moduleLinked = 'CTD Module is required';
    }
    
    if (!projectId) {
      errors.projectId = 'Project ID is required';
    }
    
    if (!uploaderName) {
      errors.uploaderName = 'Uploader name is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsUploading(true);

    // Save user info to localStorage for future use
    localStorage.setItem('vaultUser', JSON.stringify({ name: uploaderName }));

    const formData = new FormData();
    formData.append('document', file);
    formData.append('module', moduleLinked);
    formData.append('projectId', projectId);
    formData.append('uploader', uploaderName);
    
    // Add additional metadata for better filtering
    if (docSection) {
      formData.append('section', docSection);
    }
    if (documentType) {
      formData.append('documentType', documentType);
    }

    try {
      const res = await fetch('/api/vault/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Document uploaded to Vault successfully.');
        // Reset form fields
        setFile(null);
        setDocSection('');
        setDocumentType('');
        // Don't reset module, project, and uploader to make batch uploads easier
        
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

  // Get allowed document section options based on selected module
  const getSectionOptions = () => {
    switch (moduleLinked) {
      case 'Module 1':
        return [
          { value: '1.1', label: '1.1 Table of Contents' },
          { value: '1.2', label: '1.2 Cover Letter' },
          { value: '1.3', label: '1.3 Administrative Information' },
          { value: '1.4', label: '1.4 References' }
        ];
      case 'Module 2':
        return [
          { value: '2.1', label: '2.1 CTD Table of Contents' },
          { value: '2.2', label: '2.2 Introduction' },
          { value: '2.3', label: '2.3 Quality Overall Summary' },
          { value: '2.4', label: '2.4 Nonclinical Overview' },
          { value: '2.5', label: '2.5 Clinical Overview' },
          { value: '2.6', label: '2.6 Nonclinical Written & Tabulated Summaries' },
          { value: '2.7', label: '2.7 Clinical Summary' }
        ];
      case 'Module 3':
        return [
          { value: '3.1', label: '3.1 Table of Contents' },
          { value: '3.2', label: '3.2 Body of Data - Quality' },
          { value: '3.3', label: '3.3 Literature References' }
        ];
      case 'Module 4':
        return [
          { value: '4.1', label: '4.1 Table of Contents' },
          { value: '4.2', label: '4.2 Study Reports' },
          { value: '4.3', label: '4.3 Literature References' }
        ];
      case 'Module 5':
        return [
          { value: '5.1', label: '5.1 Table of Contents' },
          { value: '5.2', label: '5.2 Tabular Listing of Clinical Studies' },
          { value: '5.3', label: '5.3 Clinical Study Reports' },
          { value: '5.4', label: '5.4 Literature References' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-xl font-semibold">Upload Document to Vault</h2>
      <p className="text-sm text-gray-500">
        Documents are automatically versioned and organized by CTD module, project, and document type.
      </p>

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Select File <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
            className={`block w-full text-sm text-gray-700 border rounded p-2 ${
              validationErrors.file ? 'border-red-500' : 'border-gray-300'
            }`}
            onChange={(e) => setFile(e.target.files[0])}
            disabled={isUploading}
          />
          {validationErrors.file && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.file}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              CTD Module <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full border rounded px-3 py-2 ${
                validationErrors.moduleLinked ? 'border-red-500' : 'border-gray-300'
              }`}
              value={moduleLinked}
              onChange={(e) => setModuleLinked(e.target.value)}
              disabled={isUploading}
            >
              <option value="">Select a CTD Module</option>
              <option value="Module 1">Module 1: Administrative</option>
              <option value="Module 2">Module 2: CTD Summaries</option>
              <option value="Module 3">Module 3: Quality (CMC)</option>
              <option value="Module 4">Module 4: Nonclinical</option>
              <option value="Module 5">Module 5: Clinical</option>
            </select>
            {validationErrors.moduleLinked && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.moduleLinked}</p>
            )}
          </div>

          {moduleLinked && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Document Section
              </label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={docSection}
                onChange={(e) => setDocSection(e.target.value)}
                disabled={isUploading}
              >
                <option value="">Select Document Section</option>
                {getSectionOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Project ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                className={`w-full border rounded px-3 py-2 ${
                  validationErrors.projectId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                list="projects-list"
                disabled={isUploading}
              />
              <datalist id="projects-list">
                {commonProjects.map((proj) => (
                  <option key={proj} value={proj} />
                ))}
              </datalist>
            </div>
            {validationErrors.projectId && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.projectId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Document Type
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              disabled={isUploading}
            >
              <option value="">Select Document Type</option>
              <option value="Protocol">Study Protocol</option>
              <option value="CSR">Clinical Study Report</option>
              <option value="IB">Investigator's Brochure</option>
              <option value="SAP">Statistical Analysis Plan</option>
              <option value="ICF">Informed Consent Form</option>
              <option value="CRF">Case Report Form</option>
              <option value="Specs">Specifications</option>
              <option value="SOP">Standard Operating Procedure</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Uploader Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full border rounded px-3 py-2 ${
              validationErrors.uploaderName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Your Name"
            value={uploaderName}
            onChange={(e) => setUploaderName(e.target.value)}
            disabled={isUploading}
          />
          {validationErrors.uploaderName && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.uploaderName}</p>
          )}
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