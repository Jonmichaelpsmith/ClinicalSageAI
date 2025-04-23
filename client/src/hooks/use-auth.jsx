import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("user");
        
        if (token && storedUser) {
          // Set up axios interceptor for authentication
          setupAuthInterceptor(token);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        // Clear potentially corrupted data
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Set up axios interceptor to include the auth token in requests
  const setupAuthInterceptor = (token) => {
    axios.interceptors.request.use(
      (config) => {
        // Don't add token to auth endpoints
        if (!config.url.includes("/auth/token") && !config.url.includes("/auth/register")) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  };

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // For login, use URLSearchParams to mimic form data (OAuth2 requirement)
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);
      
      const response = await axios.post("/api/auth/token", params);
      const { access_token, user_id, username: userName, role } = response.data;
      
      // Save token and user info
      localStorage.setItem("authToken", access_token);
      
      const userData = { userId: user_id, username: userName, role };
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Set up axios interceptor
      setupAuthInterceptor(access_token);
      
      // Update state
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post("/api/auth/register", userData);
      const { access_token, user_id, username, role } = response.data;
      
      // Save token and user info
      localStorage.setItem("authToken", access_token);
      
      const userInfo = { userId: user_id, username, role };
      localStorage.setItem("user", JSON.stringify(userInfo));
      
      // Set up axios interceptor
      setupAuthInterceptor(access_token);
      
      // Update state
      setUser(userInfo);
      return userInfo;
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    
    // Reset state
    setUser(null);
    setError(null);
    
    // Remove axios interceptor (in a real app, you'd need to eject the interceptor)
    // For simplicity, we'll allow the page to refresh on logout
    window.location.href = "/auth";
  };

  // Verify token validity (could be expanded for token refresh)
  const checkTokenValidity = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return false;
    
    try {
      // Make a request to a protected endpoint
      await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (err) {
      if (err.response?.status === 401) {
        // Token is invalid, log out
        logout();
      }
      return false;
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkTokenValidity,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default useAuth;