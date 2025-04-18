import React, { useState } from "react";
import ProjectForm from "../components/ProjectForm";
import ProjectList from "../components/ProjectList";
import Module1Forms from "../components/Module1Forms";
import Module3Benchling from "../components/Module3Benchling";
import Module3Manual from "../components/Module3Manual";
import HistoryTable from "../components/HistoryTable";
import Module2Narratives from "../components/Module2Narratives";
import EctdBuilder from "../components/EctdBuilder";

export default function IndAutomationPage() {
  const [tab, setTab] = useState("Module1");
  const [selected, setSelected] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">IND Automation</h1>

      <div className="grid grid-cols-2 gap-6">
        <ProjectForm onCreated={() => setRefreshKey((k) => k + 1)} />
        <ProjectList
          key={refreshKey}
          onSelect={(proj) => setSelected(proj)}
        />
      </div>

      {selected && (
        <div className="border-t pt-4">
          <div className="space-x-2 mb-4">
            {["Module1", "Module2", "Module3", "eCTD GA", "History"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={t===tab ? "underline font-bold" : ""}
              >
                {t}
              </button>
            ))}
          </div>
          
          <h2 className="text-xl font-semibold">
            {tab} Forms – {selected.project_id}
          </h2>
          
          {tab === "Module1" && (
            <Module1Forms project={selected} />
          )}
          
          {tab === "Module2" && (
            <div className="space-y-2">
              <Module2Narratives project={selected} />
            </div>
          )}
          
          {tab === "Module3" && (
            <div className="space-y-2">
              <Module3Benchling project={selected} />
              <Module3Manual project={selected} />
            </div>
          )}
          
          
{tab === "eCTD GA" && (
  <div className="space-y-2">
    <EctdBuilder project={selected} />
  </div>
)}

{tab === "History" && (
            <div className="space-y-2">
              <HistoryTable project={selected} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}