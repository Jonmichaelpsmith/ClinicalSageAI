// /client/components/FixedProtocolViewer.jsx (with live PDF export button)
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function FixedProtocolViewer({ originalText }) {
  const [fixed, setFixed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);

  const handleFix = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/validate-protocol/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: originalText })
      });
      const data = await res.json();
      setFixed(data.fixed_text);
      setPdfReady(false); // Reset PDF status when generating new fix
    } catch (error) {
      console.error("Error fixing protocol:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await fetch("/api/export/fixed-protocol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: fixed, fileName: "fixed_protocol", format: "pdf" })
      });
      setPdfReady(true);
    } catch (error) {
      console.error("Error exporting protocol:", error);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="text-lg font-semibold">🛠️ AI-Repaired Protocol</h3>
          <Button onClick={handleFix} disabled={loading}>
            {loading ? "Generating..." : "✨ Generate AI-Fixed Version"}
          </Button>
          {fixed && (
            <>
              <Button onClick={() => setShowOriginal(!showOriginal)} variant="outline">
                {showOriginal ? "🔁 Show Fixed Only" : "📑 Show Original for Comparison"}
              </Button>
              <Textarea
                className="mt-4 text-sm"
                rows={20}
                value={showOriginal ? originalText : fixed}
                readOnly
              />
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handleExport} 
                  variant="outline"
                  disabled={exportLoading}
                >
                  {exportLoading ? "Exporting..." : "📄 Export Fixed Version (PDF)"}
                </Button>
                {pdfReady && (
                  <a
                    href="/static/latest_fixed_protocol.pdf"
                    className="text-sm text-blue-600 underline hover:text-blue-800 flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📥 Download Fixed Protocol
                  </a>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}