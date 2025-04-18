import React, { useEffect, useState } from "react";
import { getJson, postJson } from "../services/api";

export default function HistoryTable({ project }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = () => {
    if (project) {
      getJson(`/api/ind/${project.project_id}/history`)
        .then((data) => setRows(data.reverse()))
        .catch((err) => console.error("Error fetching history:", err));
    }
  };

  useEffect(() => {
    loadHistory();
  }, [project]);

  const incrementSequence = async () => {
    if (!project) return;
    
    setLoading(true);
    try {
      await postJson(`/api/ind/${project.project_id}/sequence`);
      loadHistory(); // Reload history after increment
    } catch (err) {
      console.error("Error incrementing sequence:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold">Submission History</h4>
        <button
          className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
          onClick={incrementSequence}
          disabled={loading}
        >
          {loading ? "Processing..." : "Increment Sequence"}
        </button>
      </div>
      
      {rows.length === 0 && <p className="text-sm text-gray-500">No sequences yet.</p>}
      {rows.length > 0 && (
        <table className="text-sm w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-1 border">Serial #</th>
              <th className="p-1 border">Timestamp (UTC)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="border p-1 text-center">{r.serial}</td>
                <td className="border p-1">{new Date(r.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}