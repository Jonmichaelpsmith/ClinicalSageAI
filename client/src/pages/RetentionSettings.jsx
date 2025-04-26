import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RetentionSettings() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({ docType:'CSR', archiveAfterMonths:36, deleteAfterMonths:120 });
  useEffect(()=>{ load(); },[]);
  const load = async()=>{ const { data } = await axios.get('/api/retention'); setRules(data); };
  const save = async()=>{ await axios.post('/api/retention', form); load(); };
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Retention Policies</h1>
      <div className="grid grid-cols-3 gap-2 max-w-xl items-center">
        <Input placeholder="Document Type" value={form.docType} onChange={e=>setForm({...form,docType:e.target.value})} />
        <Input placeholder="Archive after (months)" type="number" value={form.archiveAfterMonths} onChange={e=>setForm({...form,archiveAfterMonths:+e.target.value})} />
        <Input placeholder="Delete after (months)" type="number" value={form.deleteAfterMonths} onChange={e=>setForm({...form,deleteAfterMonths:+e.target.value})} />
      </div>
      <Button onClick={save}>Save / Update Rule</Button>
      <h2 className="text-xl font-semibold mt-6">Current Rules</h2>
      <ul className="list-disc ml-5 text-sm">
        {rules.map(r=> (
          <li key={r.doc_type}>{r.doc_type}: archive {r.archive_after} mo, delete {r.delete_after} mo</li>
        ))}
      </ul>
    </div>
  );
}