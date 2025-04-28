// /client/src/components/ind-wizard/InfoTooltipModule2.jsx

import { useState } from 'react';

export default function InfoTooltipModule2() {
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
        <div className="absolute z-50 mt-2 w-72 p-3 bg-white border rounded-lg shadow-lg text-xs text-gray-700">
          <p><strong>Module 2 Overview:</strong></p>
          <p className="mt-1">
            CTD Module 2 provides high-level summaries of the investigational product's quality,
            nonclinical, and clinical data. These summaries offer a bridge between administrative 
            content and detailed technical documentation in Modules 3–5.
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>2.1 Introduction to Summaries</li>
            <li>2.3 Overall Quality Summary (from CMC)</li>
            <li>2.4 Nonclinical Overview</li>
            <li>2.5 Clinical Overview</li>
            <li>2.6 Written and Tabulated Summaries</li>
          </ul>
          <p className="mt-2 text-gray-500">Required for FDA, EMA, PMDA compliance (ICH M4 guidelines).</p>
        </div>
      )}
    </div>
  );
}