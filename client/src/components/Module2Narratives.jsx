import React, { useState } from "react";
import { postJson } from "../services/api";

export default function Module2Narratives({ project }) {
  const [busy, setBusy] = useState("");
  const sections = ["quality", "nonclinical", "clinical"];
  const nice = {
    quality: "Quality Overall",
    nonclinical: "Nonclinical Overview",
    clinical: "Clinical Overview",
  };
  
  const run = (s) => {
    setBusy(s);
    postJson(`/api/ind/${project.project_id}/module2/${s}`)
      .then(() => {
        window.open(`/api/ind/${project.project_id}/module2/${s}`);
      })
      .catch((e) => alert(e.response?.data?.detail || e.message))
      .finally(() => setBusy(""));
  };
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Generate Module 2 section summaries using AI. The generated documents will be based on project metadata.
      </p>
      <div className="space-x-2">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => run(s)}
            disabled={!project || busy !== ""}
            className="bg-indigo-600 text-white px-3 py-1 rounded"
          >
            {busy === s ? "Generating…" : `Generate ${nice[s]}`}
          </button>
        ))}
      </div>
    </div>
  );
}