// frontend/pages/versions.tsx
import Layout from "../components/Layout"
import withAuthGuard from "../utils/withAuthGuard"
import React, { useEffect, useState } from "react"
import axiosWithToken from "../utils/axiosWithToken"
import { FileText, Download, Eye, Diff, Loader2, ShieldCheck } from "lucide-react"
import ReactDiffViewer from "react-diff-viewer-continued"
import toast from "react-hot-toast"
import VersionsTour from "../components/VersionsTour"

function VersionsPage() {
  const [versions, setVersions] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [compare, setCompare] = useState<any | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [auditLog, setAuditLog] = useState<Array<{action: string, timestamp: string, document: string}>>([])
  const [showAuditBanner, setShowAuditBanner] = useState<boolean>(false)

  useEffect(() => {
    const loadingToastId = toast.loading("Loading document history...");
    
    const fetchVersions = async () => {
      try {
        const res = await axiosWithToken.get("/api/versions");
        setVersions(res.data);
        
        if (res.data.length > 0) {
          toast.success(`Loaded ${res.data.length} document versions`, { id: loadingToastId });
        } else {
          toast.success("No documents found. Create a new document to get started.", { id: loadingToastId });
        }
      } catch (err) {
        const errorMessage = "Failed to fetch document history.";
        setError(errorMessage);
        toast.error(errorMessage, { id: loadingToastId });
      } finally {
        setLoading(false);
      }
    };
    
    fetchVersions();
    
    // Cleanup function to dismiss toast if component unmounts during loading
    return () => {
      toast.dismiss(loadingToastId);
    };
  }, [])

  // Display audit secure banner when showing the page
  useEffect(() => {
    toast.dismiss();
    toast("🔒 This session is secured and auditable.", {
      icon: <ShieldCheck className="text-blue-600 w-4 h-4" />, 
      position: "top-center", 
      duration: 4000
    });
  }, []);

  return (
    <Layout>
      <VersionsTour />
      <div className="py-12 px-6 max-w-5xl mx-auto">
        <h1 id="version-header" className="text-3xl font-bold text-blue-800 mb-8">Document Version History</h1>
        {loading ? (
        <div className="flex justify-center items-center py-20 text-blue-600">
          <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading documents...
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm text-center">{error}</p>
      ) : (
        <div className="space-y-4">
          {versions.length === 0 ? (
            <p className="text-gray-500">No documents generated yet.</p>
          ) : (
            versions.map((v, index) => (
              <div key={v.version_id} className="border border-gray-200 p-4 rounded-lg shadow-sm bg-blue-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-blue-900">{v.drug_name}</h2>
                    <p className="text-xs text-gray-500">Generated: {new Date(v.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-4 items-center">
                    <button 
                      data-tour="view-version"
                      onClick={() => setSelected(v)} 
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                    {index > 0 && (
                      <button 
                        data-tour="compare-version"
                        onClick={() => setCompare({ current: v, previous: versions[index - 1] })} 
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Diff className="w-4 h-4" /> Compare
                      </button>
                    )}
                    <a 
                      data-tour="download-txt"
                      href={`/${v.txt_path}`} 
                      download 
                      className="text-blue-600 hover:underline flex items-center gap-1"
                      onClick={() => {
                        toast.dismiss();
                        toast.success("TXT file download started");
                        const newLog = [...auditLog, {
                          action: "Downloaded TXT",
                          timestamp: new Date().toISOString(),
                          document: v.drug_name
                        }];
                        setAuditLog(newLog);
                        setShowAuditBanner(true);
                        
                        // Log export for audit purposes (21 CFR Part 11 compliance)
                        try {
                          axiosWithToken.post("/api/audit/log", {
                            action: "EXPORT",
                            document_id: v.version_id,
                            format: "TXT",
                            timestamp: new Date().toISOString()
                          }).catch(err => console.error("Failed to log audit event", err));
                        } catch (error) {
                          console.error("Error logging export action", error);
                        }
                      }}
                    >
                      <FileText className="w-4 h-4" /> TXT
                    </a>
                    <a 
                      data-tour="download-pdf"
                      href={`/${v.pdf_path}`} 
                      download 
                      className="text-blue-600 hover:underline flex items-center gap-1"
                      onClick={() => {
                        toast.dismiss();
                        toast.success("PDF file download started");
                        const newLog = [...auditLog, {
                          action: "Downloaded PDF",
                          timestamp: new Date().toISOString(),
                          document: v.drug_name
                        }];
                        setAuditLog(newLog);
                        setShowAuditBanner(true);
                        
                        // Log export for audit purposes (21 CFR Part 11 compliance)
                        try {
                          axiosWithToken.post("/api/audit/log", {
                            action: "EXPORT",
                            document_id: v.version_id,
                            format: "PDF",
                            timestamp: new Date().toISOString()
                          }).catch(err => console.error("Failed to log audit event", err));
                        } catch (error) {
                          console.error("Error logging export action", error);
                        }
                      }}
                    >
                      <Download className="w-4 h-4" /> PDF
                    </a>
                  </div>
                </div>
                <pre className="mt-4 text-sm text-gray-800 whitespace-pre-wrap max-h-64 overflow-auto bg-white p-3 rounded">
                  {v.draft_text.slice(0, 200)}...
                </pre>
              </div>
            ))
          )}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
          <div className="bg-white w-full max-w-4xl p-6 rounded shadow-lg relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-black" onClick={() => setSelected(null)}>✕</button>
            <h2 className="text-xl font-bold text-blue-800 mb-4">{selected.drug_name} – Full Module 3.2</h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-800 max-h-[75vh] overflow-auto border p-4 rounded">
              {selected.draft_text}
            </pre>
          </div>
        </div>
      )}

      {compare && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start pt-10 z-50">
          <div className="bg-white w-full max-w-6xl p-6 rounded shadow-xl relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-black" onClick={() => setCompare(null)}>✕</button>
            <h2 className="text-xl font-bold text-blue-800 mb-4">Compare: {compare.current.drug_name}</h2>
            <ReactDiffViewer
              oldValue={compare.previous.draft_text}
              newValue={compare.current.draft_text}
              splitView={true}
              showDiffOnly={false}
              styles={{ variables: { light: { diffViewerBackground: "#f9fafb" } } }}
            />
          </div>
        </div>
      )}
      </div>
    </Layout>
  )
}

export default withAuthGuard(VersionsPage)