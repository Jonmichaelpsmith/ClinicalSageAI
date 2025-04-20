// App.tsx – root router with QC toast listener
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SubmissionBuilder from './pages/SubmissionBuilder';
import IndSequenceDetail from './pages/IndSequenceDetail';
import IndSequenceManager from './pages/IndSequenceManager';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomeLanding from './pages/HomeLanding';

export default function App() {
  useEffect(() => {
    const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/qc`);
    ws.onmessage = (evt) => {
      try {
        const { id, status } = JSON.parse(evt.data);
        if (status === 'passed') {
          toast.success(`QC passed for doc ${id}`);
        } else if (status === 'failed') {
          toast.error(`QC failed for doc ${id}`);
        }
      } catch (_) {/* ignore */}
    };
    return () => ws.close();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeLanding />} />
        <Route path="/builder" element={<SubmissionBuilder />} />
        <Route path="/portal/ind/:sequenceId" element={<IndSequenceDetail />} />
        <Route path="/ind/planner" element={<IndSequenceManager />} />
        <Route path="*" element={<IndSequenceManager />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={5000} />
    </Router>
  );
}