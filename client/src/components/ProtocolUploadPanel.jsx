import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { isValidSessionId, logInsight, logWisdomTrace } from "@/utils/sessionUtils";

export default function ProtocolUploadPanel({ sessionId }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    if (isValidSessionId(sessionId)) {
      formData.append("session_id", sessionId);
    } else {
      toast({
        title: "Session Required",
        description: "Please select a valid study session before uploading.",
        variant: "destructive"
      });
      console.error("Protocol upload attempted without valid sessionId");
      return;
    }

    setLoading(true);

    try {
      // Log decision trace for this action
      await logWisdomTrace(
        sessionId,
        "Protocol document upload requested",
        [
          "Validating file format and session context",
          "Initializing protocol analysis pipeline",
          "Preparing for compliance check and structural analysis"
        ],
        "Uploaded protocol document for analysis"
      );

      const res = await fetch("/api/analytics/upload-protocol", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setResult(data);
      
      // Log this successful upload to insights
      await logInsight(
        sessionId,
        "Protocol Document Uploaded",
        `Uploaded protocol document "${file.name}" (${Math.round(file.size/1024)}KB) for analysis.`,
        "active"
      );
      
      toast({
        title: "Upload Successful",
        description: "Protocol document has been uploaded and analyzed."
      });
    } catch (err) {
      toast({
        title: "Upload Failed",
        description: "Please try again or check your session.",
        variant: "destructive"
      });
      console.error("Protocol upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Upload Draft Protocol</h3>
          <Input type="file" accept=".pdf,.docx,.txt" onChange={(e) => setFile(e.target.files[0])} />
          <Button onClick={handleUpload} disabled={!file || loading}>Upload & Analyze</Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="space-y-2">
            <h4 className="text-base font-semibold">AI Summary</h4>
            <pre className="text-sm whitespace-pre-wrap">{result.summary}</pre>

            <h4 className="text-base font-semibold">Predicted Outcome</h4>
            <p className="text-sm text-blue-700">{result.prediction}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}