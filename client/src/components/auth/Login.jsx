import React, { useState } from 'react';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Verify credentials
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      // Set authentication in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({
        username: credentials.username,
        role: 'admin',
        name: 'Admin User',
        organization: 'TrialSage'
      }));
      
      // Redirect directly to the standalone HTML page
      window.location.href = '/client-portal.html.bak';
    } else {
      alert('Invalid credentials. Use admin/admin123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-pink-600">TrialSage Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="admin123"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 transition duration-200"
          >
            Sign In
          </button>
          <div className="text-center mt-4 flex justify-between">
            <a href="/" className="text-sm text-pink-600 hover:underline">
              Return to Home
            </a>
            <button 
              type="button"
              onClick={() => {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify({
                  username: 'admin',
                  role: 'admin',
                  name: 'Admin User',
                  organization: 'TrialSage'
                }));
                window.location.href = '/client-portal.html.bak';
              }} 
              className="text-sm font-bold bg-pink-100 text-pink-800 px-2 py-1 rounded hover:bg-pink-200"
            >
              DIRECT PORTAL ACCESS
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Demo Credentials</h2>
          <p className="text-xs text-gray-600">Username: <span className="font-mono bg-gray-100 px-1">admin</span></p>
          <p className="text-xs text-gray-600">Password: <span className="font-mono bg-gray-100 px-1">admin123</span></p>
          
          <div className="mt-4 flex justify-center">
            <button 
              type="button"
              onClick={() => {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify({
                  username: 'admin',
                  role: 'admin',
                  name: 'Admin User',
                  organization: 'TrialSage'
                }));
                window.location.href = '/client-portal.html.bak';
              }}
              className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-bold rounded transition-colors"
            >
              ➤ ACCESS CLIENT PORTAL NOW ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;