// /client/src/components/ind-wizard/InfoTooltip.jsx

import { useState } from 'react';

export default function InfoTooltip({ text }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Info Icon */}
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="text-indigo-600 hover:text-indigo-800 focus:outline-none text-sm ml-2"
      >
        ℹ️
      </button>

      {/* Tooltip Popup */}
      {visible && (
        <div className="absolute z-50 mt-2 w-64 p-3 bg-white border rounded-lg shadow-lg text-xs text-gray-700">
          {text}
        </div>
      )}
    </div>
  );
}