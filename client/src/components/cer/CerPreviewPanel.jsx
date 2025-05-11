
import React from 'react';

export default function CerPreviewPanel() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full overflow-auto">
      <h2 className="text-xl font-semibold mb-4 text-blue-700 border-b pb-2">Clinical Evaluation Report Preview</h2>
      <div className="prose max-w-none p-4 bg-gray-50 rounded-md">
        <p className="text-gray-700">Clinical Evaluation Report preview content will appear here.</p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-600">
          <p>Preview updates as you build your CER document.</p>
        </div>
      </div>
    </div>
  );
}
