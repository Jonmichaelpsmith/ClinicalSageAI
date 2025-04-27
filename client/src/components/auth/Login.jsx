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
    // In a real app, this would verify credentials against a backend
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      // Redirect to dashboard directly using window.location for reliability
      window.location.href = '/dashboard';
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
          <div className="text-center mt-4">
            <a href="/" className="text-sm text-pink-600 hover:underline">
              Return to Home
            </a>
          </div>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Demo Credentials</h2>
          <p className="text-xs text-gray-600">Username: <span className="font-mono bg-gray-100 px-1">admin</span></p>
          <p className="text-xs text-gray-600">Password: <span className="font-mono bg-gray-100 px-1">admin123</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;