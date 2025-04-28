// /client/src/components/vault/VaultDocumentViewer.jsx

import { useEffect, useState } from 'react';

export default function VaultDocumentViewer() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState({
    uniqueModules: [],
    uniqueUploaders: [],
    uniqueProjects: [],
    ctdModuleMapping: {}
  });
  
  // State for UI messages 
  const [error, setError] = useState(null);
  
  // Filtering state
  const [filters, setFilters] = useState({
    module: 'all',
    uploader: 'all',
    projectId: 'all',
    search: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [filters]); // Re-fetch when filters change

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.module !== 'all') queryParams.append('module', filters.module);
      if (filters.uploader !== 'all') queryParams.append('uploader', filters.uploader);
      if (filters.projectId !== 'all') queryParams.append('projectId', filters.projectId);
      if (filters.search) queryParams.append('search', filters.search);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      console.log(`📁 Fetching vault documents from: /api/vault/list`);
      
      // Default fallback data in case of any error
      const fallbackData = {
        success: true,
        documents: [],
        metadata: {
          uniqueModules: [],
          uniqueUploaders: [],
          uniqueProjects: [],
          totalCount: 0,
          ctdModuleMapping: {}
        }
      };
      
      try {
        // Use simple GET to directly access endpoint - avoids middleware issues
        const res = await fetch('/api/vault/list', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!res.ok) {
          console.warn(`Server returned ${res.status}: ${res.statusText}`);
          // Try to auto-fix by triggering a reset
          await fetch('/api/vault/reset', { method: 'POST' });
          
          // Use fallback data instead of throwing
          return setDocuments(organizeVersions([]));
        }
        
        try {
          const textData = await res.text();
          const data = JSON.parse(textData);
          console.log('📁 Vault documents fetched:', data);
          
          if (data && data.success === true) {
            const organized = organizeVersions(data.documents || []);
            setDocuments(organized);
            setMetadata(data.metadata || fallbackData.metadata);
          } else {
            setError('Failed to load Vault documents - Invalid data format');
            setDocuments(organizeVersions([]));
            setMetadata(fallbackData.metadata);
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          setError('Failed to parse server response. Please try Emergency Reset.');
          setDocuments(organizeVersions([]));
          setMetadata(fallbackData.metadata);
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        setError(`Server error: ${fetchError.message || 'Unknown error'}`);
        setDocuments(organizeVersions([]));
        setMetadata(fallbackData.metadata);
      }
    } catch (error) {
      console.error('Error fetching Vault documents:', error);
      setError(`Server error: ${error.message || 'Unknown error'}`);
      
      // Initialize with empty data to avoid UI errors
      setDocuments([]);
      setMetadata({
        uniqueModules: [],
        uniqueUploaders: [],
        uniqueProjects: [],
        totalCount: 0,
        ctdModuleMapping: {}
      });
    } finally {
      setLoading(false);
    }
  };

  // Organize files by base name (group versions together)
  const organizeVersions = (docs) => {
    const groups = {};

    docs.forEach(doc => {
      const baseName = doc.originalName.replace(/\s+/g, '_').replace(/\.[^/.]+$/, ''); // Remove extension
      const cleanBase = baseName.replace(/_v\d+$/, ''); // Remove version suffix if exists

      if (!groups[cleanBase]) {
        groups[cleanBase] = [];
      }
      groups[cleanBase].push(doc);
    });

    return Object.entries(groups);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search input
  const handleSearch = (e) => {
    e.preventDefault();
    // The search will be triggered by the useEffect due to filters changing
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      module: 'all',
      uploader: 'all',
      projectId: 'all',
      search: ''
    });
  };

  if (loading && documents.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md space-y-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold">Vault Document Repository</h2>
        <p className="text-gray-500">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Vault Document Repository</h2>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      
      {/* Filter controls */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filter Documents</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Module</label>
              <select 
                name="module" 
                value={filters.module} 
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm text-sm"
              >
                <option value="all">All Modules</option>
                {(metadata?.uniqueModules || []).map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Uploader</label>
              <select 
                name="uploader" 
                value={filters.uploader} 
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm text-sm"
              >
                <option value="all">All Uploaders</option>
                {(metadata?.uniqueUploaders || []).map(uploader => (
                  <option key={uploader} value={uploader}>{uploader}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Project</label>
              <select 
                name="projectId" 
                value={filters.projectId} 
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm text-sm"
              >
                <option value="all">All Projects</option>
                {(metadata?.uniqueProjects || []).map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="mt-3 flex space-x-2">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search documents..."
              className="flex-1 rounded-md border-gray-300 shadow-sm text-sm"
            />
            <button 
              type="submit"
              className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              Search
            </button>
            <button 
              type="button"
              onClick={resetFilters}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
            >
              Reset
            </button>
          </form>

          <div className="mt-3 text-xs text-gray-500">
            Showing {documents.length} document groups from a total of {metadata?.totalCount || 0} documents
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm mb-4">
          <p className="font-medium">❌ Error</p>
          <p>{error}</p>
          <div className="flex space-x-2 mt-2">
            <button 
              onClick={fetchDocuments} 
              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
            >
              Try Again
            </button>
            <button 
              onClick={() => {
                // Emergency Reset - POST request directly to reset endpoint
                const resetVault = async () => {
                  try {
                    // First try POST
                    const response = await fetch('/api/vault/reset', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      }
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      alert('Vault reset successful! Refreshing documents...');
                      fetchDocuments();
                    } else {
                      // If POST fails, try GET as fallback
                      const getResponse = await fetch('/api/vault/reset');
                      if (getResponse.ok) {
                        alert('Vault reset successful (via GET)! Refreshing documents...');
                        fetchDocuments();
                      } else {
                        // Manual fallback - use direct list endpoint which now auto-fixes
                        const listResponse = await fetch('/api/vault/list');
                        if (listResponse.ok) {
                          alert('Vault reset attempted via list endpoint! Refreshing documents...');
                          fetchDocuments();
                        } else {
                          alert('All vault reset methods failed. Please contact admin.');
                        }
                      }
                    }
                  } catch (err) {
                    console.error('Error resetting vault:', err);
                    alert('Error resetting vault: ' + err.message);
                  }
                };
                
                // Execute the reset
                resetVault();
              }} 
              className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md text-sm font-medium"
            >
              Emergency Reset
            </button>
          </div>
        </div>
      )}
  
      {!error && documents.length === 0 ? (
        <p className="text-gray-500 text-sm">No documents match your filter criteria.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {documents.map(([baseName, versions]) => {
            // Get metadata from the first version (newest) with defensive coding
            const doc = versions[0] || {};
            const moduleInfo = doc.ctdModule ? 
              `${doc.ctdModule} - ${doc.ctdDescription || 'No description'}` : 
              (doc.moduleLinked || 'Unknown module');
          
            return (
              <li key={baseName} className="py-3">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <p className="text-sm font-semibold">{baseName.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">
                      Module: {moduleInfo} • Project: {doc.projectId || 'Unassigned'}
                      {doc.documentType && ` • Type: ${doc.documentType}`}
                    </p>
                  </div>
                </div>
                
                <ul className="pl-4 mt-2 space-y-1 text-xs text-gray-700">
                  {versions.sort((a, b) => (a.storedName > b.storedName ? -1 : 1)).map((doc, idx) => (
                    <li key={idx} className="flex justify-between items-center py-1 hover:bg-gray-50 px-2 rounded">
                      <span>
                        Version: {doc.storedName.match(/_v(\d+)/)?.[1] || '1'} • 
                        Uploaded: {new Date(doc.uploadTime).toLocaleString()} • 
                        By: {doc.uploader || 'Unknown'}
                      </span>
                      <a
                        href={`/api/vault/download/${doc.storedName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}