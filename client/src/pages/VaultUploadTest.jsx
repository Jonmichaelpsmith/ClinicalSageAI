import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VaultUploadTest = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [token, setToken] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    // Fetch a mock token for testing
    const fetchMockToken = async () => {
      try {
        // First try connecting directly to the separate vault server
        try {
          const res = await axios.get('http://localhost:4000/api/vault/mock-token');
          setToken(res.data.token);
          return;
        } catch (e) {
          console.log('Could not connect to separate vault server, trying fallback...');
        }
        
        // Fallback to main server for demo purposes
        const fallbackRes = await axios.get('/api/vault/mock-token');
        setToken(fallbackRes.data.token);
      } catch (err) {
        setError('Error fetching mock token. Make sure either the Vault server is running or a mock endpoint is available.');
        console.error('Token error:', err);
      }
    };
    
    fetchMockToken();
  }, []);

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
    setError(null);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    if (!token) {
      setError('No authentication token available');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Try direct connection to vault server first
      try {
        const response = await axios.post('http://localhost:4000/api/vault/documents', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        
        setUploadResult(response.data);
        // Fetch updated audit logs after successful upload
        fetchAuditLogs();
        return;
      } catch (directError) {
        console.log('Could not connect directly to vault server, trying fallback...');
      }
      
      // Fallback to main server
      const fallbackResponse = await axios.post('/api/vault/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUploadResult(fallbackResponse.data);
      // Fetch updated audit logs after successful upload
      fetchAuditLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading file');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const fetchAuditLogs = async () => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    setLoadingLogs(true);
    try {
      // Try direct connection to vault server first
      try {
        const response = await axios.get('http://localhost:4000/api/vault/audit', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setAuditLogs(response.data);
        return;
      } catch (directError) {
        console.log('Could not fetch audit logs directly, trying fallback...');
      }
      
      // Fallback to main server
      const fallbackResponse = await axios.get('/api/vault/audit', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAuditLogs(fallbackResponse.data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">TrialSage Vault™ - Upload Test</h1>
      
      {!token && (
        <div className="bg-yellow-100 p-4 rounded-md mb-6">
          <p className="text-yellow-700">
            Waiting for authentication token... Make sure the Vault server is running on port 4000.
          </p>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Document for AI Analysis</h2>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input 
              type="file" 
              onChange={handleFileSelect} 
              className="hidden" 
              id="file-upload" 
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              {selectedFile ? selectedFile.name : 'Click to select file'}
            </label>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !token}
            className={`w-full py-3 rounded-md text-white font-medium ${
              uploading || !selectedFile || !token 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {uploadResult && (
            <div className="p-4 bg-green-50 text-green-800 rounded-md">
              <h3 className="font-semibold mb-2">Upload Successful!</h3>
              <p className="text-sm mb-2">
                <span className="font-medium">Filename:</span> {uploadResult.filename}
              </p>
              <p className="text-sm mb-2">
                <span className="font-medium">Path:</span> {uploadResult.path}
              </p>
              <p className="text-sm mb-2">
                <span className="font-medium">Summary:</span> {uploadResult.summary}
              </p>
              <div className="text-sm">
                <span className="font-medium">Tags:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {uploadResult.tags && Array.isArray(uploadResult.tags) && uploadResult.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Audit Logs</h2>
          <button 
            onClick={fetchAuditLogs} 
            disabled={loadingLogs || !token}
            className={`px-4 py-2 rounded-md text-white text-sm ${
              loadingLogs || !token ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loadingLogs ? 'Loading...' : 'Refresh Logs'}
          </button>
        </div>
        
        {auditLogs.length === 0 ? (
          <p className="text-gray-500 italic">No audit logs found. Upload a document to create logs.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.details && (
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>TrialSage Vault™ - Enterprise Document Management for Regulatory Teams</p>
      </div>
    </div>
  );
};

export default VaultUploadTest;