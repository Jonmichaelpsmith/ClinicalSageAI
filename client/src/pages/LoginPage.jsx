import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const LoginPage = () => {
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
  
  const { loginMutation, registerMutation, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Get returnTo from URL query params
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const returnTo = searchParams.get('returnTo') || '/dashboard';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation(returnTo);
    }
  }, [isAuthenticated, setLocation, returnTo]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [activeTab]: {
        ...formData[activeTab],
        [name]: value
      }
    });
    
    // Clear error when typing
    if (formErrors[activeTab][name]) {
      setFormErrors({
        ...formErrors,
        [activeTab]: {
          ...formErrors[activeTab],
          [name]: ''
        }
      });
    }
  };
  
  const validateLogin = () => {
    const errors = {};
    const { username, password } = formData.login;
    
    if (!username.trim()) errors.username = 'Username is required';
    if (!password) errors.password = 'Password is required';
    
    return errors;
  };
  
  const validateRegister = () => {
    const errors = {};
    const { name, email, username, password, confirmPassword } = formData.register;
    
    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email is invalid';
    
    if (!username.trim()) errors.username = 'Username is required';
    else if (username.length < 3) errors.username = 'Username must be at least 3 characters';
    
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    return errors;
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    const errors = validateLogin();
    if (Object.keys(errors).length > 0) {
      setFormErrors({
        ...formErrors,
        login: errors
      });
      return;
    }
    
    try {
      await loginMutation.mutate(formData.login);
      // Redirect is handled by the useEffect hook
    } catch (error) {
      // Error is handled by the login mutation
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    
    const errors = validateRegister();
    if (Object.keys(errors).length > 0) {
      setFormErrors({
        ...formErrors,
        register: errors
      });
      return;
    }
    
    // Remove confirmPassword from the data sent to the server
    const { confirmPassword, ...registrationData } = formData.register;
    
    try {
      await registerMutation.mutate(registrationData);
      // Redirect is handled by the useEffect hook
    } catch (error) {
      // Error is handled by the register mutation
    }
  };
  
  // Demo mode login button handler
  const handleDemoLogin = (e) => {
    e.preventDefault();
    // loginAsMock is defined in the AuthContext
    // and would only be available in development/demo environments
    if (typeof loginAsMock === 'function') {
      loginAsMock();
    }
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
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
              
              {/* Demo mode button - would be removed in production */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full mt-4 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Demo Mode (No Auth)
              </button>
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
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
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
              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-pink-600 flex items-center justify-center">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Enhanced AI Analysis</h3>
                <p className="mt-1 text-gray-300">Intelligent extraction and analysis of clinical study reports.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-pink-600 flex items-center justify-center">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Regulatory Compliance</h3>
                <p className="mt-1 text-gray-300">Stay compliant with FDA, EMA, PMDA, and NMPA guidelines.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-pink-600 flex items-center justify-center">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Enhanced Security</h3>
                <p className="mt-1 text-gray-300">Blockchain-verified document integrity and audit trails.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;