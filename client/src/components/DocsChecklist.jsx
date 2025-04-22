import { useEffect, useState } from "react";
import { listDocs } from "../hooks/useDocuShare";

export default function DocsChecklist({ required = [] }) {
  const [status, setStatus] = useState({});
  
  useEffect(() => {
    listDocs().then(docs => {
      const names = docs.map(d => d.displayName.toLowerCase());
      const s = Object.fromEntries(required.map(r => [r, names.some(n => n.includes(r.toLowerCase()))]));
      setStatus(s);
    });
  }, [required]);
  
  return (
    <ul className="space-y-1">
      {required.map(r => (
        <li key={r} className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${status[r] ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          <span>{r}</span>
        </li>
      ))}
    </ul>
  );
}