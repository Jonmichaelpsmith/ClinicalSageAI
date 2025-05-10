// /client/src/components/ind-wizard/InfoTooltipModule5.jsx

import { useState, useRef } from 'react';
import { HelpCircle } from 'lucide-react';

export default function InfoTooltipModule5() {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  const handleClickOutside = (e) => {
    if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
      setIsVisible(false);
    }
  };

  // Add event listener when tooltip is visible
  if (isVisible) {
    document.addEventListener('mousedown', handleClickOutside);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
  }

  return (
    <div className="relative inline-block">
      <HelpCircle 
        className="h-5 w-5 text-blue-500 cursor-pointer ml-2" 
        onClick={handleToggle}
      />
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          className="absolute z-10 top-6 right-0 w-80 p-4 bg-white rounded-md shadow-lg border border-gray-200"
        >
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Module 5: Clinical Study Reports</h4>
          <p className="text-xs text-gray-600 mb-2">
            CTD Module 5 contains all clinical study reports, protocols, and patient safety data required for 
            regulatory submission to health authorities (FDA, EMA, PMDA, etc.).
          </p>
          <h5 className="text-xs font-medium text-gray-700 mb-1">Key Components:</h5>
          <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
            <li>Study protocols and amendments</li>
            <li>Clinical study reports (CSRs) following ICH E3 format</li>
            <li>Investigator brochure updates</li>
            <li>Safety reporting (DSURs, SAEs)</li>
          </ul>
          <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
            Reference: ICH M4E(R2) Common Technical Document
          </div>
        </div>
      )}
    </div>
  );
}