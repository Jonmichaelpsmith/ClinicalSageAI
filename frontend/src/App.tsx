import { Routes, Route, Navigate } from 'react-router-dom';
import ClientDashboard from './pages/ClientDashboard';
import ProgramDashboard from './pages/ProgramDashboard';
import StudyWorkspace from './pages/StudyWorkspace';
import VaultView from './pages/VaultView';
import IndWizard from './pages/IndWizard';
import Login from './pages/Login';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ClientDashboard />} />
      <Route path="/programs/:programId" element={<ProgramDashboard />} />
      <Route path="/studies/:studyId" element={<StudyWorkspace />} />
      <Route path="/studies/:studyId/vault" element={<VaultView />} />
      <Route path="/studies/:studyId/ind" element={<IndWizard />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}