import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'wouter';

const INDWizardPage = () => {
  const { user, logout } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch templates and sections
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch templates
        const templatesResponse = await fetch('/api/ind/wizard/templates');
        if (!templatesResponse.ok) {
          throw new Error('Failed to fetch templates');
        }
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);
        
        // Fetch sections
        const sectionsResponse = await fetch('/api/ind/wizard/sections');
        if (!sectionsResponse.ok) {
          throw new Error('Failed to fetch sections');
        }
        const sectionsData = await sectionsResponse.json();
        setSections(sectionsData);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">IND Wizard™</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm text-gray-700 hover:text-pink-600">
              Dashboard
            </Link>
            <span className="text-sm text-gray-700">
              {user?.username}
            </span>
            <button
              onClick={logout}
              className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Investigational New Drug Application (IND) Wizard</h2>
          <p className="text-gray-600">
            Guide through the IND submission process with intelligent templates and regulatory compliance checks.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <>
            {/* Template Selection */}
            {!selectedTemplate ? (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
                <h3 className="text-lg font-medium mb-4">Select an IND Application Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map(template => (
                    <div 
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <h4 className="font-medium text-lg mb-2">{template.name}</h4>
                      <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                      <button className="text-pink-600 hover:text-pink-800 text-sm font-medium">
                        Select Template →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium">Template: {selectedTemplate.name}</h3>
                  <button 
                    onClick={() => setSelectedTemplate(null)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Change Template
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium mb-2">IND Application Sections</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Complete each section to prepare your IND application. Required sections are marked with an asterisk (*).
                    </p>
                    <div className="flex justify-end">
                      <button 
                        className="text-pink-600 hover:text-pink-800 text-sm font-medium flex items-center"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Custom Section
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {sections.map(section => (
                      <div key={section.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">
                              {section.name}
                              {section.required && <span className="text-pink-600 ml-1">*</span>}
                            </h4>
                            <div className="text-xs text-gray-500 mt-1">Status: Draft</div>
                          </div>
                          <button className="bg-pink-600 text-white px-3 py-1 rounded text-sm hover:bg-pink-700 transition-colors">
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Draft
                  </button>
                  
                  <div>
                    <button className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors mr-2">
                      Preview
                    </button>
                    <button className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors">
                      Generate Application
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bottom Section - IND Guidance */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-medium mb-4">IND Submission Guidance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-pink-600 mb-2">FDA Requirements</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Form FDA 1571 (IND Application)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Form FDA 1572 (Statement of Investigator)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Investigator's Brochure</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Clinical Protocol</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>CMC Information</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-pink-600 mb-2">Submission Process</h4>
                  <ol className="text-sm text-gray-600 space-y-2 list-decimal ml-4">
                    <li>Complete all required sections</li>
                    <li>Review and validate content</li>
                    <li>Generate comprehensive IND package</li>
                    <li>Submit electronically through FDA Gateway</li>
                    <li>Track submission status</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-medium text-pink-600 mb-2">Timeline</h4>
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">
                      <span className="font-medium">FDA Response:</span> 30 days from submission
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Clinical Hold:</span> May occur if safety concerns
                    </p>
                    <p>
                      <span className="font-medium">Amendments:</span> Submit as needed throughout development
                    </p>
                    <button className="text-pink-600 hover:text-pink-800 text-sm font-medium mt-4 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      View Detailed Guidance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default INDWizardPage;