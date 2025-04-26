import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DetailsList, IColumn, Stack } from '@fluentui/react';
import { useNavigate } from 'react-router-dom';

export default function ClientDashboard() {
  const { token } = useContext(AuthContext)!;
  const [programs, setPrograms] = useState<any[]>([]);
  const nav = useNavigate();
  
  useEffect(() => {
    (async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/programs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPrograms(data);
    })();
  }, []);
  
  const cols: IColumn[] = [
    { key: 'name', name: 'Program', fieldName: 'name', minWidth: 200 }
  ];
  
  return (
    <Stack tokens={{ childrenGap: 16 }} styles={{ root: { padding: 24 } }}>
      <h2>Programs</h2>
      <DetailsList
        items={programs}
        columns={cols}
        onItemInvoked={(item: any) => nav(`/programs/${item.id}`)}
      />
    </Stack>
  );
}