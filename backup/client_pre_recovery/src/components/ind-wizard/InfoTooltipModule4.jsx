// /client/src/components/ind-wizard/InfoTooltipModule4.jsx

import { useState } from 'react';

export default function InfoTooltipModule4() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-1 rounded-full w-6 h-6 flex items-center justify-center"
        aria-label="Information about Module 4"
      >
        i
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 p-4 bg-white rounded-lg shadow-xl border border-gray-200">
          <h3 className="font-semibold text-lg mb-2">CTD Module 4: Nonclinical Study Reports</h3>
          
          <p className="text-sm text-gray-600 mb-3">
            Module 4 contains comprehensive nonclinical studies that assess safety and pharmacology 
            before human exposure. These studies are required by regulatory agencies to justify 
            first-in-human and subsequent clinical trials.
          </p>
          
          <div className="mb-3">
            <h4 className="font-medium text-sm mb-1">Required Sections:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Pharmacology studies (primary/secondary targets)</li>
              <li>• Pharmacokinetics/ADME studies (absorption, metabolism)</li>
              <li>• Toxicology studies (acute/chronic toxicity)</li>
              <li>• Genotoxicity studies (mutagenicity assessment)</li>
            </ul>
          </div>
          
          <div className="text-xs text-gray-500 mb-2">
            Per ICH M4S and FDA/EMA guidelines, all nonclinical studies should follow Good Laboratory Practice (GLP) standards.
          </div>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}