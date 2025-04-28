// /client/src/components/ind-wizard/InfoTooltipModule4.jsx

import { Info } from 'lucide-react';
import { useState } from 'react';

export default function InfoTooltipModule4() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-6 h-6 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 focus:outline-none"
      >
        <Info size={14} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-80 p-4 mt-2 text-sm bg-white border border-gray-200 rounded-md shadow-lg left-0 top-full">
          <h3 className="font-semibold text-gray-900 mb-1">CTD Module 4: Nonclinical Study Reports</h3>
          <p className="text-gray-700 mb-3">
            Module 4 contains the nonclinical study reports that demonstrate the safety and pharmacological profile of your investigational product. These studies are critical for justifying human clinical trials.
          </p>
          
          <h4 className="font-medium text-gray-900 mb-1">Key Sections:</h4>
          <ul className="text-gray-700 list-disc list-inside mb-3 space-y-1">
            <li>4.2.1: Pharmacology (primary/secondary effects)</li>
            <li>4.2.2: Pharmacokinetics (ADME studies)</li>
            <li>4.2.3: Toxicology (acute/chronic toxicity)</li>
            <li>4.2.3.7.1: Genotoxicity studies</li>
          </ul>
          
          <h4 className="font-medium text-gray-900 mb-1">Regulatory Requirements:</h4>
          <ul className="text-gray-700 list-disc list-inside space-y-1">
            <li>Conducted according to GLP standards</li>
            <li>Demonstrates target engagement and activity</li>
            <li>Identifies safety concerns prior to human exposure</li>
            <li>Supports proposed clinical dosing</li>
          </ul>
          
          <div className="mt-3 text-xs text-gray-500">
            Upload study reports in PDF, Word, or Excel format
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}