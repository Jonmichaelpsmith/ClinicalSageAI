import { Routes, Route, Navigate } from 'react-router-dom';
import ClientDashboard from './pages/ClientDashboard';
import ProgramDashboard from './pages/ProgramDashboard';
import StudyWorkspace from './pages/StudyWorkspace';
import VaultView from './pages/VaultView';
import IndWizard from './pages/IndWizard';
import AdminOrgUsers from './pages/AdminOrgUsers';
import AnalyticsChat from './pages/AnalyticsChat';
import Login from './pages/Login';
import PortalShell from './layouts/PortalShell';
import { PortalProvider } from './context/PortalContext';

export default function App() {
  return (
    <PortalProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Portal Shell wraps all main application routes */}
        <Route element={<PortalShell />}>
          <Route path="/dashboard" element={<ClientDashboard />} />
          <Route path="/programs/:programId" element={<ProgramDashboard />} />
          <Route path="/studies/:studyId" element={<StudyWorkspace />} />
          <Route path="/studies/:studyId/vault" element={<VaultView />} />
          <Route path="/studies/:studyId/ind" element={<IndWizard />} />
          
          {/* Admin routes */}
          <Route path="/admin/org-users" element={<AdminOrgUsers />} />
          
          {/* Analytics route */}
          <Route path="/analytics" element={<AnalyticsChat />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </PortalProvider>
  );
}