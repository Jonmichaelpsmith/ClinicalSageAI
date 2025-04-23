import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Download, Clock } from "lucide-react";

export default function VersionsPage() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/versions");
        setVersions(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch version history:", err);
        setError("Failed to load document history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVersions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 max-w-5xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Document Version History</h1>
          <div className="ml-auto flex items-center text-gray-500 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>Auto-refreshes when new documents are generated</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : versions.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-500 mb-4">No documents have been generated yet.</p>
            <a href="/module32" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Generate Your First Document
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4 text-sm text-gray-500 px-4">
              <span>Total documents: {versions.length}</span>
              <span className="italic">Showing most recent first</span>
            </div>
            
            {versions.map((v) => (
              <div 
                key={v.version_id} 
                className="border border-gray-200 p-4 rounded-lg shadow-sm bg-blue-50 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-blue-900">{v.drug_name}</h2>
                    <p className="text-xs text-gray-500">
                      Generated: {new Date(v.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <a 
                      href={`/${v.txt_path}`} 
                      download 
                      className="text-blue-600 hover:underline flex items-center gap-1 px-3 py-1 bg-white rounded border border-blue-200 hover:bg-blue-50"
                    >
                      <FileText className="w-4 h-4" /> TXT
                    </a>
                    <a 
                      href={`/${v.pdf_path}`} 
                      download 
                      className="text-blue-600 hover:underline flex items-center gap-1 px-3 py-1 bg-white rounded border border-blue-200 hover:bg-blue-50"
                    >
                      <Download className="w-4 h-4" /> PDF
                    </a>
                  </div>
                </div>
                <div className="mt-4 bg-white p-4 rounded border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Content Preview:</h3>
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap max-h-64 overflow-auto">
                    {v.draft_text.slice(0, 350)}...
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}