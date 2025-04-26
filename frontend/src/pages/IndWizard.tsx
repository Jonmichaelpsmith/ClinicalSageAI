import { useParams } from 'react-router-dom';

export default function IndWizard() {
  const { studyId } = useParams();
  
  return (
    <div style={{ padding: 24 }}>
      <h2>IND Wizard</h2>
      <p>Study ID: {studyId}</p>
      <p>IND Wizard placeholder - Coming soon</p>
    </div>
  );
}