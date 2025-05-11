import React from 'react';

export default function CerPreviewPanel({ document }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
      <h2 className="text-xl font-semibold mb-4">Document Preview</h2>
      {document ? (
        <div className="prose max-w-none">
          <h3>{document.title}</h3>
          <p>{document.content}</p>
        </div>
      ) : (
        <div className="text-gray-500 italic">
          Select a document to preview
        </div>
      )}
    </div>
  );
}