import { useEffect, useState } from "react";
import { listDocs, uploadDoc } from "../hooks/useDocuShare";

export default function DocuShareVault() {
  const [docs, setDocs] = useState([]);
  const [viewUrl, setViewUrl] = useState(null);

  useEffect(() => {
    listDocs().then(setDocs);
  }, []);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDoc(file);
    setDocs(await listDocs());
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <div className="space-y-2">
        <input type="file" accept="application/pdf" onChange={onFile} />
        {docs.map((d) => (
          <button
            key={d.objectId}
            className="block w-full text-left p-2 rounded hover:bg-slate-100"
            onClick={() => setViewUrl(d.contentUrl)}
          >
            {d.displayName}
          </button>
        ))}
      </div>
      <div className="col-span-2 border rounded-lg shadow-inner max-h-[80vh] overflow-auto">
        {viewUrl && (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="bg-blue-50 rounded-lg p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Document Preview</h3>
              <p className="text-sm text-gray-600 mb-4">
                PDF preview is available in the production version.
              </p>
              <div className="flex justify-center space-x-3">
                <a 
                  href={viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Open PDF
                </a>
                <button 
                  onClick={() => window.open(viewUrl, '_blank')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}