import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { listDocs, uploadDoc } from "../hooks/useDocuShare";

pdfjs.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

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
          <Document file={viewUrl} className="w-full">
            <Page pageNumber={1} />
          </Document>
        )}
      </div>
    </div>
  );
}