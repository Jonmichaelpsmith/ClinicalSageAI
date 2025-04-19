// SubmissionBuilder.jsx – eCTD builder with drag‑drop, validation & sequence tracker
// Requires dependencies: react-dnd, react-dnd-html5-backend, recharts, @tanstack/react-query

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CheckCircle, AlertTriangle, File, Loader, Package } from "lucide-react";

const MODULES = [
  { id: "m1", label: "Module 1 – Regional", slots: ["Cover Letter", "1571", "1572", "3674"] },
  { id: "m2", label: "Module 2 – Summaries", slots: ["2.3 QOS", "2.4 Nonclinical Overview", "2.5 Clinical Overview"] },
  { id: "m3", label: "Module 3 – CMC", slots: ["3.2.S Drug Substance", "3.2.P Drug Product"] },
  { id: "m4", label: "Module 4 – Nonclinical", slots: ["Pharm/Tox Reports"] },
  { id: "m5", label: "Module 5 – Clinical", slots: ["Clinical Study Reports"] },
];

/* DnD item type */
const ItemTypes = { DOC: "doc" };

function DraggableDoc({ doc }) {
  const [, drag] = useDrag({ type: ItemTypes.DOC, item: { doc } });
  return (
    <div ref={drag} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 cursor-grab">
      <File size={16} /> {doc.title}
    </div>
  );
}

function Slot({ slot, current, onDrop }) {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.DOC,
    drop: (item) => onDrop(slot, item.doc),
    collect: monitor => ({ isOver: monitor.isOver() }),
  });
  return (
    <div ref={drop} className={`border rounded-lg p-3 h-20 flex items-center justify-center text-xs text-center ${
      isOver ? 'bg-emerald-50 dark:bg-slate-700/50' : 'bg-gray-50 dark:bg-slate-800'}`}
    >
      {current ? <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1"><File size={14}/> {current.title}</span> : slot}
    </div>
  );
}

export default function SubmissionBuilder() {
  // Mock document data until API is available
  const docs = [
    { id: 1, title: "Cover Letter Draft" },
    { id: 2, title: "Protocol" },
    { id: 3, title: "Form 1571" },
    { id: 4, title: "Form 1572" },
    { id: 5, title: "Form 3674" },
    { id: 6, title: "Clinical Overview" },
    { id: 7, title: "CSR 001" },
    { id: 8, title: "CSR 002" },
    { id: 9, title: "Quality Summary" },
  ];

  /* Local state for assignments */
  const [mapping, setMapping] = useState({}); // key: slot -> doc
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);

  const onDrop = (slot, doc) => setMapping({ ...mapping, [slot]: doc });

  /* Validation */
  const validate = () => {
    setIsValidating(true);
    // Simulate validation process
    setTimeout(() => {
      const errors = [];
      // Check for required documents
      if (!mapping["Cover Letter"]) {
        errors.push("Cover Letter is required");
      }
      if (!mapping["1571"]) {
        errors.push("Form 1571 is required");
      }
      // Check for other issues
      if (Object.keys(mapping).length < 3) {
        errors.push("Submission requires at least 3 documents");
      }
      
      setValidationResults({ errors });
      setIsValidating(false);
    }, 800);
  };

  /* Compile sequence */
  const compile = () => {
    setIsCompiling(true);
    // Simulate compilation process
    setTimeout(() => {
      alert("Compilation started – track in Submissions list");
      setIsCompiling(false);
    }, 1000);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-4 gap-4 h-full p-4">
        {/* Docs list */}
        <aside className="col-span-1 border-r pr-2 space-y-2 overflow-y-auto">
          <h3 className="font-semibold text-sm mb-2">Documents</h3>
          {docs.map(d => <DraggableDoc key={d.id} doc={d} />)}
        </aside>

        {/* Module builder */}
        <div className="col-span-2 overflow-y-auto space-y-6">
          {MODULES.map(mod => (
            <div key={mod.id} className="border rounded-lg p-4 bg-white dark:bg-slate-800">
              <h4 className="font-semibold mb-3 text-emerald-700 dark:text-emerald-300">{mod.label}</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {mod.slots.map(slot => (
                  <Slot key={slot} slot={slot} current={mapping[slot]} onDrop={onDrop} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Validation & compile panel */}
        <aside className="col-span-1 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-1"><CheckCircle size={16}/> Validation</h3>
            {validationResults ? (
              validationResults.errors.length ? (
                <ul className="space-y-2 text-xs">
                  {validationResults.errors.map((e,i)=>(<li key={i} className="flex gap-1 items-start"><AlertTriangle size={12} className="text-red-500"/> {e}</li>))}
                </ul>
              ) : (
                <p className="text-emerald-600 text-sm">All checks passed ✨</p>
              )
            ) : (
              <p className="text-xs opacity-60">Run validation to see results.</p>
            )}
          </div>

          <button
            onClick={validate}
            className="bg-emerald-600 text-white px-4 py-2 rounded mb-3 hover:bg-emerald-700 text-sm flex items-center gap-2 justify-center disabled:opacity-60"
            disabled={isValidating}
          >
            {isValidating ? <Loader className="animate-spin" size={16}/> : <CheckCircle size={16}/>}
            Validate
          </button>

          <button
            onClick={compile}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm flex items-center gap-2 justify-center disabled:opacity-60"
            disabled={isCompiling || (validationResults && validationResults.errors.length > 0)}
          >
            {isCompiling ? <Loader className="animate-spin" size={16}/> : <Package size={16}/>} 
            Compile Sequence
          </button>
        </aside>
      </div>
    </DndProvider>
  );
}