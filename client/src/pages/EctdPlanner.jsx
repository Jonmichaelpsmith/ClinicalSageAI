import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function EctdPlanner({ submissionId }) {
  const [outline, setOutline] = useState(null);
  const [missing, setMissing] = useState([]);
  const [hint, setHint] = useState('');

  useEffect(() => { load(); }, [submissionId]);
  async function load() {
    const { data } = await axios.get(`/api/ectd/${submissionId}/outline`);
    setOutline(data.outline);
    setMissing(data.missing);
    setHint(data.aiHint);
  }

  if (!outline) return <div className="p-8">Loading eCTD planner…</div>;
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">eCTD Planner – Submission {submissionId}</h1>
      {outline.map(sec => (
        <Card key={sec.section} className="border shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-2">{sec.section} – {sec.name}</h2>
            {sec.docs.length ? (
              <ul className="list-disc ml-5 text-sm text-gray-700">
                {sec.docs.map(d => <li key={d.id}>{d.filename}</li>)}
              </ul>
            ) : (
              <p className="text-red-600 text-sm">No documents linked yet.</p>
            )}
            <Button size="xs" className="mt-2" onClick={() => alert('Open uploader pre‑tagged for ' + sec.section)}>Upload to {sec.section}</Button>
          </CardContent>
        </Card>
      ))}
      {hint && <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm">AI Suggestion: {hint}</div>}
      {missing.length === 0 && <div className="p-4 bg-green-50 text-green-700 text-sm rounded">All sections have at least one document. Ready for QC!</div>}
    </div>
  );
}