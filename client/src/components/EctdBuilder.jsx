import React, { useState } from "react";
import { postJson } from "../services/api";

export default function EctdBuilder({ project }) {
  const [busy, setBusy] = useState(false);
  
  const build = async () => {
    if (!project) return;
    setBusy(true);
    try {
      const data = await postJson(`/api/ind/${project.project_id}/sequence`);
      const serial = data.serial_number;
      window.open(`/api/ind/${project.project_id}/ectd/${serial}`, "_blank");
    } catch (e) {
      console.error("Error building eCTD package:", e);
      alert(e.userMessage || e.message || "Error building eCTD package");
    } finally {
      setBusy(false);
    }
  };
  
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-2">eCTD Package Builder</h2>
      <p className="text-sm text-gray-600 mb-4">
        Generate a FDA-compliant eCTD package for submission. The package will include all available 
        documents for this project formatted according to eCTD specifications with proper indexing and checksums.
      </p>
      
      <div className="flex flex-col items-start space-y-3">
        <button
          className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded disabled:opacity-50 font-medium"
          onClick={build}
          disabled={busy || !project}
        >
          {busy ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Building eCTD Package...
            </span>
          ) : (
            "Build eCTD Package"
          )}
        </button>
        
        <p className="text-xs text-gray-500">
          This will generate a complete eCTD submission package with all available documents in the correct structure with 
          proper indexing and checksums required for FDA submission. 
        </p>
      </div>
    </div>
  );
}
