import React, { useEffect, useState } from "react";
import { getJson } from "../services/api";

export default function HistoryTable({ project }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (project) {
      getJson(`/api/ind/${project.project_id}/history`)
        .then((data) => setRows(data.reverse()))
        .catch((err) => console.error("Error fetching history:", err));
    }
  }, [project]);

  if (!project) return null;
  
  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-1">Submission History</h4>
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