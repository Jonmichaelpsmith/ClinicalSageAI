import React, { useState } from 'react';

export default function WidgetBuilder({ onSave }) {
  const [data, setData] = useState({ name: '', sql: 'SELECT COUNT(*) FROM metrics', type: 'bar' });
  return (
    <div className="p-4 w-96">
      <h3 className="font-semibold mb-2">Add KPI Widget</h3>
      <input className="border p-1 w-full mb-2" placeholder="Widget name" value={data.name}
             onChange={e => setData({ ...data, name: e.target.value })} />
      <select className="border p-1 w-full mb-2" value={data.type}
              onChange={e => setData({ ...data, type: e.target.value })}>
        <option value="bar">Bar</option>
        <option value="line">Line</option>
        <option value="pie">Pie</option>
      </select>
      <textarea className="border p-1 w-full mb-2 h-40 font-mono text-sm" value={data.sql}
                onChange={e => setData({ ...data, sql: e.target.value })} />
      <button className="bg-blue-600 text-white px-3 py-1 mt-3 rounded" onClick={() => onSave(data)}>
        Save
      </button>
    </div>
  );
}
