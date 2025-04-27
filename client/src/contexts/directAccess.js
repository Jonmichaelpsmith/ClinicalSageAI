/**
 * Direct Client Access System
 * This module bypasses the standard authentication flow to provide immediate access
 * to the TrialSage platform for demonstration and testing purposes.
 */

// Mock user with admin privileges
export const adminUser = {
  id: 1,
  username: 'admin',
  email: 'admin@trialsage.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  createdAt: new Date().toISOString()
};

// Generate a fake JWT token
export function generateMockToken() {
  // This is a fake token structure that mimics a real JWT
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id: adminUser.id,
    username: adminUser.username,
    role: adminUser.role,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days expiration
  }));
  const signature = btoa('mocksignature');
  
  return `${header}.${payload}.${signature}`;
}

// Enable direct access
export function enableDirectAccess() {
  const token = generateMockToken();
  localStorage.setItem('token', token);
  console.log('Direct access enabled with admin privileges');
  return { user: adminUser, token };
}