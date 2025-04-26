import { useParams, useNavigate } from 'react-router-dom';

export default function ProgramDashboard() {
  const { programId } = useParams();
  // TODO: fetch program + studies
  const nav = useNavigate();
  
  return (
    <div style={{ padding: 24 }}>
      <h2>Program {programId}</h2>
      {/* TODO: list studies with DetailsList, nav(`/studies/${id}`) */}
      <button onClick={() => nav(-1)}>Back</button>
    </div>
  );
}