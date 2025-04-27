import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

/**
 * Standalone Login Page
 * This is a simplified version that doesn't rely on the server for authentication
 */
const StandaloneLoginPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    login: { username: '', password: '' },
    register: { name: '', email: '', username: '', password: '', confirmPassword: '' }
  });
  const [formErrors, setFormErrors] = useState({
    login: {},
    register: {}
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [location, setLocation] = useLocation();
  
  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved user:', e);
      }
    }
  }, []);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation('/client-portal');
    }
  }, [user, setLocation]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    const formType = activeTab; // 'login' or 'register'
    
    setFormData({
      ...formData,
      [formType]: {
        ...formData[formType],
        [name]: value
      }
    });
    
    // Clear error for the field
    if (formErrors[formType][name]) {
      setFormErrors({
        ...formErrors,
        [formType]: {
          ...formErrors[formType],
          [name]: ''
        }
      });
    }
  };
  
  const validateLoginForm = () => {
    const { username, password } = formData.login;
    const errors = {};
    
    if (!username) errors.username = 'Username is required';
    if (!password) errors.password = 'Password is required';
    
    setFormErrors({
      ...formErrors,
      login: errors
    });
    
    return Object.keys(errors).length === 0;
  };
  
  const validateRegisterForm = () => {
    const { name, email, username, password, confirmPassword } = formData.register;
    const errors = {};
    
    if (!name) errors.name = 'Name is required';
    if (!email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email is invalid';
    
    if (!username) errors.username = 'Username is required';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    setFormErrors({
      ...formErrors,
      register: errors
    });
    
    return Object.keys(errors).length === 0;
  };
  
  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    setLoading(true);
    
    // Simulate server request
    setTimeout(() => {
      const mockUser = {
        id: 1,
        username: formData.login.username,
        email: `${formData.login.username}@example.com`,
        firstName: formData.login.username,
        lastName: 'User',
        role: 'client'
      };
      
      // Save to localStorage
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      // Redirect to portal
      setLocation('/client-portal');
      
      setLoading(false);
    }, 1000);
  };
  
  const handleRegister = (e) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) return;
    
    setLoading(true);
    
    // Simulate server request
    setTimeout(() => {
      const mockUser = {
        id: 2,
        username: formData.register.username,
        email: formData.register.email,
        firstName: formData.register.name.split(' ')[0],
        lastName: formData.register.name.split(' ').slice(1).join(' '),
        role: 'client'
      };
      
      // Save to localStorage
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      // Redirect to portal
      setLocation('/client-portal');
      
      setLoading(false);
    }, 1000);
  };
  
  // Dedicated function for Client Portal access with proper credentials
  const handleClientPortalLogin = (e) => {
    e.preventDefault();
    
    setLoading(true);
    
    // Create a mock client user
    const mockClientUser = {
      id: 3,
      username: 'client',
      email: 'client@example.com',
      firstName: 'Client',
      lastName: 'User',
      role: 'client'
    };
    
    // Save to localStorage
    localStorage.setItem('mock_user', JSON.stringify(mockClientUser));
    setUser(mockClientUser);
    
    // Redirect specifically to client portal after short delay
    setTimeout(() => {
      setLocation('/client-portal');
    }, 500);
  };
  
  // Render error message if it exists
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <p className="text-red-500 text-xs mt-1">{error}</p>;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 flex flex-col md:flex-row">
      {/* Form section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">TrialSage™</h1>
            <p className="text-gray-600">AI-powered regulatory writing platform</p>
          </div>
          
          {/* Tab navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`flex-1 py-2 text-center text-sm font-medium ${
                activeTab === 'login'
                  ? 'border-b-2 border-pink-500 text-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 text-center text-sm font-medium ${
                activeTab === 'register'
                  ? 'border-b-2 border-pink-500 text-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </div>
          
          {/* Login form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.login.username}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.login.username ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-1 focus:ring-pink-500`}
                  placeholder="Enter your username"
                />
                <ErrorMessage error={formErrors.login.username} />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.login.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      formErrors.login.password ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-pink-500`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
                <ErrorMessage error={formErrors.login.password} />
                <div className="mt-2 text-right">
                  <a href="#" className="text-sm text-pink-600 hover:text-pink-700">
                    Forgot password?
                  </a>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
              
              {/* Client Portal Access Button - Special launch version */}
              <button
                type="button"
                onClick={handleClientPortalLogin}
                className="w-full mt-6 bg-gradient-to-r from-pink-500 to-pink-700 text-white py-4 px-4 text-lg font-bold rounded-md hover:from-pink-600 hover:to-pink-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 animate-pulse shadow-lg transform transition hover:-translate-y-0.5"
              >
                ➤ ACCESS CLIENT PORTAL
              </button>
              <p className="text-center mt-2 text-xs text-pink-600">Full platform access - Credentials provided automatically</p>
            </form>
          )}
          
          {/* Register form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.register.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.register.name ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-1 focus:ring-pink-500`}
                  placeholder="Enter your full name"
                />
                <ErrorMessage error={formErrors.register.name} />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.register.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.register.email ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-1 focus:ring-pink-500`}
                  placeholder="Enter your email"
                />
                <ErrorMessage error={formErrors.register.email} />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.register.username}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.register.username ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-1 focus:ring-pink-500`}
                  placeholder="Choose a username"
                />
                <ErrorMessage error={formErrors.register.username} />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.register.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      formErrors.register.password ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-pink-500`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
                <ErrorMessage error={formErrors.register.password} />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.register.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.register.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-1 focus:ring-pink-500`}
                  placeholder="Confirm your password"
                />
                <ErrorMessage error={formErrors.register.confirmPassword} />
              </div>
              
              <button
                type="submit"
                className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}
          
          <p className="mt-8 text-center text-sm text-gray-600">
            By using TrialSage™, you agree to our{' '}
            <a href="#" className="text-pink-600 hover:text-pink-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-pink-600 hover:text-pink-700">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
      
      {/* Hero section */}
      <div className="w-full md:w-1/2 bg-black text-white p-6 md:p-12 flex items-center">
        <div className="max-w-lg mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Streamline Your Regulatory Writing Workflow
            </h2>
            <p className="text-gray-300">
              TrialSage™ is an advanced AI-powered platform that simplifies complex clinical research document management across global regulatory frameworks.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 bg-pink-600 rounded-full flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium mb-1">IND Wizard™</h3>
                <p className="text-gray-400">Guided IND preparation with automatic formatting that meets global regulatory requirements.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 bg-pink-600 rounded-full flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium mb-1">CSR Intelligence™</h3>
                <p className="text-gray-400">Extract insights from clinical study reports and generate high-quality documentation.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 bg-pink-600 rounded-full flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium mb-1">AI Regulatory Assistant</h3>
                <p className="text-gray-400">Get expert guidance on regulatory requirements and compliance issues in real-time.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 bg-pink-600 rounded-full flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium mb-1">TrialSage Vault™</h3>
                <p className="text-gray-400">Secure document storage with version control and collaborative workflow support.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandaloneLoginPage;