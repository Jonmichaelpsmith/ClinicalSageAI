// /client/src/components/ind-wizard/InfoTooltipModule3.jsx

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export default function InfoTooltipModule3() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-blue-600 hover:text-blue-800 focus:outline-none"
        aria-label="Information about Module 3 Quality"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 mt-2 right-0">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-900">Module 3 - Quality (CMC)</h3>
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
              <strong>CTD Module 3</strong> contains Chemistry, Manufacturing, and Controls (CMC) information, which demonstrates the quality and consistency of your drug product.
            </p>
            
            <h4 className="font-medium text-gray-800 mt-2">Key Components:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Drug Substance</strong>: Information on the active pharmaceutical ingredient (API), including manufacturing process, characterization, and controls.</li>
              <li><strong>Drug Product</strong>: Details on the finished dosage form, including formulation, manufacturing, packaging, and specifications.</li>
              <li><strong>Appendices</strong>: Supporting documentation such as facility information, equipment validation, and adventitious agents safety.</li>
              <li><strong>Regional Information</strong>: Country-specific requirements like US FDA DMF reference letters.</li>
            </ul>
            
            <p className="mt-2">
              <strong>Regulatory Importance:</strong> Module 3 is crucial for demonstrating product quality, safety, and manufacturing consistency to regulatory authorities.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}