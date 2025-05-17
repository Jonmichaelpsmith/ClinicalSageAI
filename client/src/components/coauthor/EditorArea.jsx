import React from 'react';

export default function EditorArea({ main, sidebar }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">{main}</div>
      {sidebar}
    </div>
  );
}
