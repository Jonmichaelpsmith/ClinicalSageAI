import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import WidgetBuilder from './WidgetBuilder';

export default function KPIDashboard({ org }) {
  const [widgets, setWidgets] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  
  // Load widgets from API
  const loadWidgets = () => api.get(`/api/org/${org}/widgets`).then(r => setWidgets(r.data));
  useEffect(() => {
    if (org) loadWidgets();
  }, [org]);
  
  // Save a new widget
  const saveWidget = (w) => {
    w.layout = JSON.stringify({ x: 0, y: 0, w: 3, h: 4 });
    api.post(`/api/org/${org}/widgets`, w)
      .then(() => {
        setShowBuilder(false);
        loadWidgets();
      });
  };

  return (
    <div className="p-4">
      <button className="bg-green-700 text-white px-3 py-1 mb-3 rounded" onClick={() => setShowBuilder(true)}>
        + Add Widget
      </button>
      <div className="grid grid-cols-4 gap-4">
        {widgets.map((widget) => (
          <div key={widget.id} className="bg-white shadow rounded p-3 flex flex-col h-40">
            <h4 className="text-sm font-semibold mb-1">{widget.name}</h4>
            <div className="flex-grow overflow-auto">
              <div className="text-xs text-gray-500 mb-1">{widget.type.toUpperCase()} Chart</div>
              <pre className="text-xs bg-gray-50 p-1 rounded">{widget.sql}</pre>
            </div>
          </div>
        ))}
      </div>
      {showBuilder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg">
            <WidgetBuilder onSave={saveWidget} />
          </div>
        </div>
      )}
    </div>
  );
}
