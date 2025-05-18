// /client/src/components/ind-wizard/OverallQualitySummaryForm.jsx

import { useState } from 'react';

export default function OverallQualitySummaryForm({ setFormStatus }) {
  const [formData, setFormData] = useState({
    drugSubstanceDescription: '',
    manufacturingOverview: '',
    controlStrategyDescription: '',
    stabilityDataSummary: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Check if form is complete enough to mark as done
    const updatedData = { ...formData, [name]: value };
    const isComplete = 
      updatedData.drugSubstanceDescription.length > 10 && 
      updatedData.manufacturingOverview.length > 10;
    
    setFormStatus(prev => ({ ...prev, overallQualitySummary: isComplete }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Overall Quality Summary (Module 2.3)</h2>
      <p className="text-sm text-gray-600">
        Provide a summary of the quality aspects of the drug substance and drug product, including
        manufacturing process, control strategy, and stability data.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="drugSubstanceDescription" className="block text-sm font-medium mb-1">
            Drug Substance Description
          </label>
          <textarea
            id="drugSubstanceDescription"
            name="drugSubstanceDescription"
            value={formData.drugSubstanceDescription}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            placeholder="Describe the drug substance including chemical structure, properties, and characterization..."
          />
        </div>

        <div>
          <label htmlFor="manufacturingOverview" className="block text-sm font-medium mb-1">
            Manufacturing Process Overview
          </label>
          <textarea
            id="manufacturingOverview"
            name="manufacturingOverview"
            value={formData.manufacturingOverview}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            placeholder="Provide an overview of the manufacturing process..."
          />
        </div>

        <div>
          <label htmlFor="controlStrategyDescription" className="block text-sm font-medium mb-1">
            Control Strategy Description
          </label>
          <textarea
            id="controlStrategyDescription"
            name="controlStrategyDescription"
            value={formData.controlStrategyDescription}
            onChange={handleChange}
            rows={2}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            placeholder="Describe the control strategy for ensuring product quality..."
          />
        </div>

        <div>
          <label htmlFor="stabilityDataSummary" className="block text-sm font-medium mb-1">
            Stability Data Summary
          </label>
          <textarea
            id="stabilityDataSummary"
            name="stabilityDataSummary"
            value={formData.stabilityDataSummary}
            onChange={handleChange}
            rows={2}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            placeholder="Summarize stability data supporting the proposed storage conditions and shelf life..."
          />
        </div>
      </div>
    </div>
  );
}