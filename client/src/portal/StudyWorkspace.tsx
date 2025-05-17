import { useParams, useNavigate } from 'react-router-dom';

export default function StudyWorkspace() {
  const { studyId } = useParams();
  const nav = useNavigate();
  
  return (
    <div style={{ padding: 24 }}>
      <h2>Study {studyId}</h2>
      <button onClick={() => nav(`/studies/${studyId}/vault`)}>Open Vault</button>
      <button onClick={() => nav(`/studies/${studyId}/ind`)}>IND Wizard</button>
    </div>
  );
}