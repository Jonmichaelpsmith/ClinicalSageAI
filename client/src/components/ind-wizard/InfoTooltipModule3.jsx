// /client/src/components/ind-wizard/InfoTooltipModule3.jsx

import { useState } from 'react';

export default function InfoTooltipModule3() {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="text-indigo-600 hover:text-indigo-800 focus:outline-none text-sm ml-2"
      >
        ℹ️
      </button>

      {visible && (
        <div className="absolute z-50 mt-2 w-80 p-3 bg-white border rounded-lg shadow-lg text-xs text-gray-700">
          <p><strong>Module 3 (Quality) Overview:</strong></p>
          <p className="mt-1">
            Module 3 contains comprehensive Chemistry, Manufacturing, and Controls (CMC) information for both 
            the drug substance (API) and drug product (final dosage form).
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li><strong>3.2.S</strong> - Drug Substance: Specifications, synthesis, stability</li>
            <li><strong>3.2.P</strong> - Drug Product: Formulation, manufacturing process, packaging</li>
            <li><strong>3.2.A</strong> - Appendices: Facility information, validation data</li>
            <li><strong>3.2.R</strong> - Regional Information: DMF references, country-specific requirements</li>
          </ul>
          <p className="mt-2 text-gray-500">Required for FDA, EMA, PMDA compliance (ICH Q1-Q12 guidelines).</p>
        </div>
      )}
    </div>
  );
}