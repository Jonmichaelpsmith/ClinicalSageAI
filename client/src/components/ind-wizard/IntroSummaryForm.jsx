// /client/src/components/ind-wizard/IntroSummaryForm.jsx

import { useState } from 'react';

export default function IntroSummaryForm({ setFormStatus }) {
  const [formData, setFormData] = useState({
    introText: '',
    purposeStatement: '',
    scopeDescription: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Check if form is complete enough to mark as done
    const updatedData = { ...formData, [name]: value };
    const isComplete = 
      updatedData.introText.length > 10 && 
      updatedData.purposeStatement.length > 10;
    
    setFormStatus(prev => ({ ...prev, introSummary: isComplete }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Introduction to Summaries (Module 2.1)</h2>
      <p className="text-sm text-gray-600">
        Provide an introductory text describing the purpose, scope, and structure of the Common Technical Document summaries.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="introText" className="block text-sm font-medium mb-1">
            Introduction Text
          </label>
          <textarea
            id="introText"
            name="introText"
            value={formData.introText}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            placeholder="Enter general introduction text for Module 2..."
          />
        </div>

        <div>
          <label htmlFor="purposeStatement" className="block text-sm font-medium mb-1">
            Purpose Statement
          </label>
          <textarea
            id="purposeStatement"
            name="purposeStatement"
            value={formData.purposeStatement}
            onChange={handleChange}
            rows={2}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            placeholder="Enter the purpose of the CTD summaries..."
          />
        </div>

        <div>
          <label htmlFor="scopeDescription" className="block text-sm font-medium mb-1">
            Scope Description (Optional)
          </label>
          <textarea
            id="scopeDescription"
            name="scopeDescription"
            value={formData.scopeDescription}
            onChange={handleChange}
            rows={2}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            placeholder="Describe the scope of information included in the summaries..."
          />
        </div>
      </div>
    </div>
  );
}