// SubmissionBuilder.tsx – region‑aware validation & live hints
import React, { useEffect, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { Tree, NodeModel } from '@minoru/react-dnd-treeview';
import update from 'immutability-helper';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@minoru/react-dnd-treeview/dist/react-dnd-treeview.css';
import 'react-toastify/dist/ReactToastify.css';

const backend = HTML5Backend;

const REGIONS: Record<string, { folders: string[]; rules: Record<string,string[]> }> = {
  FDA: { folders: ['m1','m2','m3','m4','m5'], rules: {} },
  EMA: { folders: ['m1','m2','m3','m4','m5'], rules: { m1: ['cover','appform'] } },
  PMDA: { folders: ['m1','m2','m3','m4','m5','jp‑annex'], rules: { 'jp‑annex': ['quality','nonclinical'] } },
};

// Region-specific hints to display to users
const REGION_HINTS = {
  FDA: [
    '✓ Form 1571 must be in m1.2/form-1571 folder',
    '✓ Form 3674 (clinicaltrials.gov) required in m1.2/form-3674 folder',
    '✓ Cover letter must be in m1.1/cover-letter and PDF < 10 MB',
    '✓ Clinical study reports should be placed in m5.3/clinical-study-reports',
    '✓ Follows FDA eCTD 3.2.2 validation rules',
  ],
  EMA: [
    '✓ EU Application Form PDF required in application-form/eu-application-form folder',
    '✓ Letter of Authorization must be in m1.2/application-form',
    '✓ Active Substance Master File should be in m1/asmf folder',
    '✓ Product Information Annexes I-III must be in m1.3/product-information',
    '✓ Follows EU eCTD 3.2.2 technical validation criteria',
  ],
  PMDA: [
    '✓ JP Annex PDF must be placed in jp-annex folder',
    '✓ Japanese translations required in jp-annex/jp-data/translations',
    '✓ Application form must be in m1.1/application-form',
    '✓ Risk Management Plan required in m1.5/risk-management-plan',
    '✓ Follows JP eCTD 1.0 technical validation requirements',
  ],
};

type Doc = { id: number; title: string; module: string; qc_json?: { status: string } };
interface Node extends NodeModel<Doc> { }

export default function SubmissionBuilder({ region = 'FDA' }: { region?: string }) {
  const [tree, setTree] = useState<Node[]>([]);
  const [invalid, setInvalid] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      const docs: Doc[] = await fetchJson('/api/documents?status=approved_or_qc_failed');
      const folders = REGIONS[region].folders.map((f, idx) => ({ id: 10_000+idx, parent:0, text:f, droppable:true }));
      const nodes: Node[] = [ {id:0,parent:0,text:'root',droppable:true}, ...folders];
      docs.forEach(d => {
        const folderId = folders.find(f => d.module.startsWith(f.text))?.id || folders[0].id;
        nodes.push({ id:d.id, parent:folderId, text:d.title, droppable:false, data:d });
      });
      setTree(nodes);
      validate(nodes);
    })();
  }, [region]);

  const validate = (nodes: Node[]) => {
    const bad = new Set<number>();
    const rules = REGIONS[region].rules;
    nodes.filter(n => !n.droppable && n.parent!==0).forEach(n => {
      const parentName = nodes.find(p=>p.id===n.parent)!.text;
      if (rules[parentName]) {
        const allowed = rules[parentName];
        if (!allowed.some(a => n.data!.module.includes(a))) bad.add(Number(n.id));
      }
    });
    setInvalid(bad);
  };

  const onDrop = (nt: Node[]) => { setTree(nt); validate(nt); };

  const render = (node: Node, { depth, isOpen, onToggle }: any) => {
    if (node.droppable) return (
      <div style={{marginLeft: depth*16}} className="fw-bold py-1">
        <button className="btn btn-sm btn-link p-0" onClick={onToggle}>{isOpen?'▾':'▸'}</button>{node.text}
      </div>);
    const qcStatus = node.data?.qc_json?.status;
    const invalidFlag = invalid.has(Number(node.id));
    return (
      <div style={{marginLeft: depth*16}} className={`d-flex align-items-center gap-2 py-1 ${invalidFlag?'text-danger':''}`}> 
        {qcStatus==='passed' ? <CheckCircle size={14} className="text-success"/> : <XCircle size={14} className="text-danger"/>}
        {invalidFlag && <AlertTriangle size={14} className="text-warning" aria-label="Invalid slot for region"/>}
        <span>{node.text}</span>
      </div>);
  };

  const save = async () => {
    if (invalid.size) { toast.error('Fix invalid placements first'); return; }
    const docs = tree.filter(n=>!n.droppable&&n.parent!==0).map((n,i)=>({
      id:n.id,
      module: tree.find(f=>f.id===n.parent)!.text,
      order:i
    }));
    await fetch('/api/documents/builder-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({docs})});
    toast.success('Order saved');
  };

  return (
    <div className="container py-4">
      <h2>Builder <span className="badge bg-secondary ms-1">{region}</span></h2>
      {invalid.size>0 && <div className="alert alert-warning py-1">{invalid.size} doc(s) in invalid slots for {region}</div>}
      
      {/* Region-specific hints */}
      <div className="alert alert-info py-2 mb-3">
        <div className="fw-bold mb-1">Region Hints: {region}</div>
        <ul className="mb-0 small">
          {REGION_HINTS[region as keyof typeof REGION_HINTS]?.map((hint, i) => (
            <li key={i}>{hint}</li>
          ))}
        </ul>
      </div>
      
      <DndProvider backend={HTML5Backend}><Tree tree={tree} rootId={0} render={render} onDrop={onDrop}/></DndProvider>
      <button className="btn btn-primary mt-2" onClick={save}>Save</button>
    </div>
  );
}

async function fetchJson(u:string){const r=await fetch(u);if(!r.ok)throw new Error('fetch');return r.json();}