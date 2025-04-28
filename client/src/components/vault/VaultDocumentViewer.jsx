// /client/src/components/vault/VaultDocumentViewer.jsx

import { useEffect, useState } from 'react';

export default function VaultDocumentViewer() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDocs, setExpandedDocs] = useState({});

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch('/api/vault/list');
        const data = await res.json();
        if (data.success) {
          setDocuments(data.documents);
        } else {
          alert('❌ Failed to load Vault documents.');
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        alert('❌ Server error while loading Vault documents.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Group documents by baseFilename, projectId, and moduleLinked
  const groupedDocuments = documents.reduce((acc, doc) => {
    // If doc has no baseFilename yet (legacy documents), use originalName as key
    const baseKey = doc.baseFilename || doc.originalName;
    const projectId = doc.projectId || 'Unassigned';
    const moduleLinked = doc.moduleLinked || 'Unknown';
    
    // Create a composite key for grouping
    const key = `${baseKey}|${projectId}|${moduleLinked}`;
    
    if (!acc[key]) {
      acc[key] = [];
    }
    
    acc[key].push(doc);
    return acc;
  }, {});

  // Sort each group by version number (descending)
  Object.keys(groupedDocuments).forEach(key => {
    groupedDocuments[key].sort((a, b) => {
      // Sort by version if available, otherwise by uploadTime
      if (a.version && b.version) {
        return b.version - a.version;
      }
      return new Date(b.uploadTime) - new Date(a.uploadTime);
    });
  });

  const toggleExpand = (key) => {
    setExpandedDocs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return <p className="text-gray-500">Loading documents...</p>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-semibold">Vault Document Repository</h2>

      {Object.keys(groupedDocuments).length === 0 ? (
        <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {Object.entries(groupedDocuments).map(([key, versions]) => {
            // The latest version is always first due to our sorting
            const latestDoc = versions[0];
            const [baseFilename, projectId, moduleLinked] = key.split('|');
            const hasMultipleVersions = versions.length > 1;
            const isExpanded = expandedDocs[key] || false;
            
            // Extract core name without version suffix for display
            const displayName = latestDoc.baseFilename || baseFilename.replace(/_v\d+(\.\w+)$/, '$1');
            
            return (
              <li key={key} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <p className="text-sm font-medium">{displayName}</p>
                      {latestDoc.version && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                          v{latestDoc.version}
                        </span>
                      )}
                      {hasMultipleVersions && (
                        <button 
                          onClick={() => toggleExpand(key)}
                          className="ml-2 text-xs text-gray-500 hover:text-indigo-600"
                        >
                          {isExpanded ? 'Hide History' : 'Show History'}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      Module: {moduleLinked} • Project: {projectId} • 
                      Uploaded by {latestDoc.uploader || 'Unknown'} • 
                      {new Date(latestDoc.uploadTime).toLocaleString()}
                    </p>
                  </div>
                  <a
                    href={`/uploads/${latestDoc.storedName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Download
                  </a>
                </div>
                
                {/* Version history (only shown when expanded) */}
                {isExpanded && hasMultipleVersions && (
                  <div className="mt-2 pl-4 border-l-2 border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">Version History:</p>
                    <ul className="space-y-1">
                      {versions.slice(1).map((doc, idx) => (
                        <li key={idx} className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-gray-600">
                              v{doc.version || '?'} • {new Date(doc.uploadTime).toLocaleString()} • 
                              {doc.uploader}
                            </span>
                          </div>
                          <a
                            href={`/uploads/${doc.storedName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:underline"
                          >
                            Download
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}