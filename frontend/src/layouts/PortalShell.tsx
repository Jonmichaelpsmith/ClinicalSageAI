import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import SideNav from '../components/SideNav';
import { PortalContext } from '../context/PortalContext';

export default function PortalShell() {
  const ctx = useContext(PortalContext);
  
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <SideNav />
      
      <div style={{ 
        flex: 1, 
        padding: 24, 
        overflowY: 'auto',
        backgroundColor: '#ffffff' 
      }}>
        {/* Header with breadcrumb navigation */}
        <div style={{ 
          marginBottom: 24, 
          borderBottom: '1px solid #eee',
          paddingBottom: 12
        }}>
          <h2 style={{ margin: 0 }}>
            {ctx.orgId && <span>
              {ctx.programId 
                ? (ctx.studyId 
                  ? 'Study Dashboard' 
                  : 'Program Overview')
                : 'Organization Dashboard'
              }
            </span>}
            {!ctx.orgId && <span>Dashboard</span>}
          </h2>
        </div>
        
        {/* Main content area */}
        <Outlet />
      </div>
    </div>
  );
}