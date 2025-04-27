import { useContext, useEffect, useState } from 'react';
import { PortalContext } from '../context/PortalContext';
import { AuthContext } from '../context/AuthContext';
import { Link } from '@fluentui/react';

interface Organization {
  id: string;
  name: string;
}

interface Program {
  id: string;
  name: string;
}

interface Study {
  id: string;
  name: string;
}

export default function SideNav() {
  const { token } = useContext(AuthContext)!;
  const ctx = useContext(PortalContext);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);

  // Load organizations for CRO user or current user's org
  useEffect(() => { 
    (async () => {
      try {
        const r = await fetch(
          `${import.meta.env.VITE_API_URL}/api/organizations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (r.ok) {
          const data = await r.json();
          setOrgs(data);
        }
      } catch (error) {
        console.error('Error loading organizations:', error);
      }
    })(); 
  }, [token]);

  // Load programs for selected organization
  useEffect(() => { 
    if (!ctx.orgId) return;
    
    (async () => {
      try {
        const r = await fetch(
          `${import.meta.env.VITE_API_URL}/api/programs?orgId=${ctx.orgId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (r.ok) {
          const data = await r.json();
          setPrograms(data);
        }
      } catch (error) {
        console.error('Error loading programs:', error);
      }
    })(); 
  }, [ctx.orgId, token]);

  // Load studies for selected program
  useEffect(() => { 
    if (!ctx.programId) return;
    
    (async () => {
      try {
        const r = await fetch(
          `${import.meta.env.VITE_API_URL}/api/programs/${ctx.programId}/studies`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (r.ok) {
          const data = await r.json();
          setStudies(data);
        }
      } catch (error) {
        console.error('Error loading studies:', error);
      }
    })(); 
  }, [ctx.programId, token]);

  return (
    <div style={{
      width: 260,
      borderRight: '1px solid #ddd',
      height: '100vh',
      overflowY: 'auto',
      padding: 16,
      backgroundColor: '#f8f8f8'
    }}>
      <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #ddd', paddingBottom: 8 }}>
        TrialSage™
      </h3>
      
      <h4 style={{ margin: '16px 0 8px 0' }}>Organizations</h4>
      {orgs.map(o => (
        <div 
          key={o.id} 
          style={{ 
            padding: '4px 0',
            fontWeight: ctx.orgId === o.id ? 'bold' : 'normal'
          }}
        >
          <Link 
            onClick={() => ctx.set({
              orgId: o.id,
              programId: undefined,
              studyId: undefined
            })}
          >
            {o.name}
          </Link>
        </div>
      ))}
      
      {ctx.orgId && (
        <>
          <h4 style={{ margin: '16px 0 8px 0' }}>Programs</h4>
          {programs.map(p => (
            <div 
              key={p.id} 
              style={{ 
                paddingLeft: 12,
                padding: '4px 0 4px 12px',
                fontWeight: ctx.programId === p.id ? 'bold' : 'normal'
              }}
            >
              <Link 
                onClick={() => ctx.set({
                  programId: p.id,
                  studyId: undefined
                })}
              >
                {p.name}
              </Link>
            </div>
          ))}
        </>
      )}
      
      {ctx.programId && (
        <>
          <h4 style={{ margin: '16px 0 8px 0' }}>Studies</h4>
          {studies.map(s => (
            <div 
              key={s.id} 
              style={{ 
                paddingLeft: 24,
                padding: '4px 0 4px 24px',
                fontWeight: ctx.studyId === s.id ? 'bold' : 'normal'
              }}
            >
              <Link 
                onClick={() => ctx.set({
                  studyId: s.id
                })}
              >
                {s.name}
              </Link>
            </div>
          ))}
        </>
      )}
    </div>
  );
}