// /client/src/components/ind-wizard/InfoTooltipModule3.jsx

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export default function InfoTooltipModule3() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-blue-600 hover:text-blue-800 focus:outline-none ml-2"
        aria-label="Information about Module 3 Quality"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 mt-2 right-0">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-900">Module 3: Quality (CMC Documentation)</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close tooltip"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p>
              This module contains detailed Chemistry, Manufacturing, and Controls (CMC) information for the drug substance (API) and drug product (final formulation).
            </p>
            
            <p>
              It includes specifications, manufacturing processes, stability data, GMP Certificates, and country-specific regional information (e.g., US DMF Letters).
            </p>
            
            <p>
              Critical for ensuring product quality, safety, and regulatory acceptance under ICH CTD guidelines.
            </p>
            
            <h4 className="font-medium text-gray-800 mt-2">Key Components:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Drug Substance (3.2.S)</strong>: Information on the API, including manufacturing process, characterization, and controls.</li>
              <li><strong>Drug Product (3.2.P)</strong>: Details on the final formulation, including manufacturing, packaging, and specifications.</li>
              <li><strong>Appendices (3.2.A)</strong>: Supporting documentation such as GMP Certificates and validation reports.</li>
              <li><strong>Regional Information (3.2.R)</strong>: Country-specific documents like US FDA DMF reference letters.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}