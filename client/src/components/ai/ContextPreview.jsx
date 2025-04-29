import React from "react";

/**
 * Displays a list of context snippets with a "Use" button.
 * Props:
 *  - snippets: Array<{ id: string, text: string }>
 *  - onSnippetClick: (id: string) => void
 */
export default function ContextPreview({ snippets, onSnippetClick }) {
  if (!snippets.length) {
    return <p className="text-sm text-gray-500">No context snippets available.</p>;
  }

  return (
    <div className="space-y-3">
      {snippets.map(({ id, text }, idx) => (
        <div
          key={id || idx}
          className="p-3 border rounded-lg group hover:bg-gray-50 relative"
        >
          <pre className="whitespace-pre-wrap break-words text-sm text-gray-800">
            {text}
          </pre>
          <button
            onClick={() => onSnippetClick && onSnippetClick(id || idx)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-indigo-600 text-white px-2 py-1 text-xs rounded"
            aria-label={`Use context snippet ${idx + 1}`}
          >
            Use here
          </button>
        </div>
      ))}
    </div>
  );
}