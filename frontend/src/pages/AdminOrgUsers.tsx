import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PortalContext } from '../context/PortalContext';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableCell, 
  Input, 
  Select, 
  Button,
  Spinner
} from '@fluentui/react-components';

interface User {
  id: string;
  email: string;
  role: string;
}

export default function AdminOrgUsers() {
  const { token } = useContext(AuthContext)!;
  const { orgId } = useContext(PortalContext);
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('2'); // Editor default
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load users when org changes
  useEffect(() => { 
    if (!orgId) return;
    
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/orgs/${orgId}/users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        } else {
          setError('Failed to load users');
        }
      } catch (error) {
        console.error('Error loading users:', error);
        setError('Error loading users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [orgId, token]);

  // Invite a new user
  const handleInvite = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!orgId) {
      setError('Please select an organization first');
      return;
    }
    
    setInviting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/orgs/${orgId}/invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            email,
            roleId: Number(role)
          })
        }
      );
      
      if (res.ok) {
        setSuccess(`Invitation sent to ${email}`);
        setEmail('');
        setRole('2');
        
        // Refresh user list
        const usersRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/orgs/${orgId}/users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data);
        }
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      setError('Error sending invitation');
    } finally {
      setInviting(false);
    }
  };

  // Get role display label
  const getRoleLabel = (roleId: string) => {
    switch (roleId) {
      case '1': return 'Admin';
      case '2': return 'Editor';
      case '3': return 'Viewer';
      default: return 'Unknown';
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Organization Users</h2>
      
      {!orgId && (
        <div style={{ marginBottom: 24 }}>
          <p>Please select an organization from the sidebar to manage users.</p>
        </div>
      )}
      
      {orgId && (
        <>
          {/* User list */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Spinner label="Loading users..." />
            </div>
          ) : (
            <div style={{ marginBottom: 32 }}>
              {users.length === 0 ? (
                <p>No users found in this organization.</p>
              ) : (
                <Table aria-label="Users table">
                  <TableHeader>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id}>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.role}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
          
          {/* Invite form */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Invite User</h3>
            
            {error && (
              <div style={{ 
                padding: '8px 12px', 
                marginBottom: 16, 
                backgroundColor: '#FFF1F0', 
                color: '#CF1124',
                borderRadius: 4
              }}>
                {error}
              </div>
            )}
            
            {success && (
              <div style={{ 
                padding: '8px 12px', 
                marginBottom: 16, 
                backgroundColor: '#F0FFF4', 
                color: '#22543D',
                borderRadius: 4
              }}>
                {success}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Input 
                placeholder="Email address" 
                value={email} 
                onChange={(_, v) => setEmail(v.value)} 
                style={{ width: 300 }}
              />
              
              <Select
                value={role}
                onChange={(_, v) => setRole(v.value)}
              >
                <option value="1">Admin</option>
                <option value="2">Editor</option>
                <option value="3">Viewer</option>
              </Select>
              
              <Button 
                appearance="primary" 
                onClick={handleInvite} 
                disabled={inviting || !email}
              >
                {inviting ? 'Sending...' : 'Invite User'}
              </Button>
            </div>
            
            <div style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
              <p>
                <strong>Roles:</strong><br />
                <strong>Admin</strong> - Can manage users and all content<br />
                <strong>Editor</strong> - Can create and edit content<br />
                <strong>Viewer</strong> - Can only view content
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}