import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function InsightsModal({ onClose }) {
  const [models, setModels] = useState([]);
  useEffect(() => {
    fetch("/api/insight-models?limit=14")
      .then((r) => r.json())
      .then(setModels)
      .catch(() => setModels([]));
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 max-w-lg w-full rounded-lg shadow-xl p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-500"><X size={20} /></button>
        <h2 className="text-xl font-semibold mb-4">AI Insight Models</h2>
        <ul className="grid grid-cols-1 gap-3 text-sm">
          {models.map((m, i) => (
            <li key={i} className="p-3 bg-gray-50 dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600">
              <strong>{m.name}</strong>
              <p className="text-xs opacity-70">{m.description}</p>
            </li>
          ))}
          {models.length === 0 && <p className="italic text-gray-500">Loading models…</p>}
        </ul>
      </div>
    </div>
  );
}