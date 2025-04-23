import axios from 'axios';

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: '/api', // Assuming all our API routes start with /api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors by redirecting to login
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized access detected. Redirecting to login...');
      // Clear token from localStorage
      localStorage.removeItem('token');
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default api;

// Common API functions
export const fetchVersions = async () => {
  try {
    const response = await api.get('/versions');
    return response.data;
  } catch (error) {
    console.error('Error fetching versions:', error);
    throw error;
  }
};

export const generateModule32 = async (formData) => {
  try {
    const response = await api.post('/generate/module32', formData);
    return response.data;
  } catch (error) {
    console.error('Error generating Module 3.2:', error);
    throw error;
  }
};

export const exportToPdf = async (versionId) => {
  try {
    const response = await api.get(`/export/pdf/${versionId}`, {
      responseType: 'blob', // Important for binary data like PDFs
    });
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // Create a temporary link and click it to download the file
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `module32_${versionId}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};