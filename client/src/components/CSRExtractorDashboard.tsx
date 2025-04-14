import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CSRExtractorDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [, setLocation] = useLocation();

  const handleUpload = async () => {
    if (!file) return;
    setStatus("Uploading...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/csr/upload-enhanced", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setResult(data);
      setStatus("✅ Parsed and mapped.");
    } catch (err) {
      setStatus("❌ Upload failed.");
    }
  };

  const handleIngest = async () => {
    if (!result?.mapped_output) return;
    try {
      setStatus("Processing for intelligence...");
      const response = await fetch(result.mapped_output);
      const content = await response.json();
      const res = await fetch("/api/intelligence/ingest-csr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (data?.redirect_route) {
        setStatus("✅ CSR integrated. Launching planning interface...");
        setLocation(data.redirect_route);
      } else {
        setStatus("✅ CSR processed, but no redirect received.");
      }
    } catch (err) {
      console.error("CSR intelligence ingestion failed:", err);
      setStatus("❌ Intelligence integration failed.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">📄 CSR Intelligence Extractor</h1>
      <p className="text-muted-foreground text-sm">Upload a CSR to extract, map, and launch it into live study planning.</p>

      <Card>
        <CardContent className="p-4 space-y-4">
          <input 
            type="file" 
            accept=".pdf,.txt" 
            onChange={(e) => e.target.files && setFile(e.target.files[0])} 
            className="w-full"
          />
          <Button onClick={handleUpload}>📤 Upload CSR File</Button>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-2">🧠 Mapped Output</h2>
            <pre className="bg-gray-100 text-sm p-3 rounded overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
            <div className="flex flex-col gap-2 mt-4">
              <Button variant="outline" asChild>
                <a href={result.mapped_output} target="_blank" rel="noopener noreferrer">
                  📥 Download Extracted JSON
                </a>
              </Button>
              <Button 
                onClick={handleIngest}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                🔗 Use This CSR for Study Planning
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}