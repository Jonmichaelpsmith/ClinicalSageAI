// /client/src/components/SummaryPacketGenerator.jsx
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isValidSessionId } from "@/utils/sessionUtils";

export default function SummaryPacketGenerator({ sessionId }) {
  const [inputs, setInputs] = useState({
    protocol: "",
    ind25: "",
    ind27: "",
    sap: "",
    risks: "",
    success_probability: "",
    sample_size: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleChange = (field, value) => {
    setInputs({ ...inputs, [field]: value });
  };

  const handleGenerate = async () => {
    if (!isValidSessionId(sessionId)) {
      toast({
        title: "Invalid Session",
        description: "Session ID is missing or invalid. Please start or select a study session.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch("/api/export/summary-packet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocol: inputs.protocol,
          ind25: inputs.ind25,
          ind27: inputs.ind27,
          sap: inputs.sap,
          risks: inputs.risks.split("\n").filter(r => r.trim()),
          success_probability: parseFloat(inputs.success_probability) || 0,
          sample_size: parseInt(inputs.sample_size) || 0,
          session_id: sessionId
        })
      });
      
      if (!res.ok) {
        throw new Error("Failed to generate summary packet");
      }
      
      const data = await res.json();
      
      if (data.pdf_url) {
        window.open(data.pdf_url, "_blank");
        setSubmitted(true);
        toast({
          title: "Summary Packet Generated",
          description: "Your packet has been generated and opened in a new tab."
        });
      } else {
        throw new Error("No PDF URL received");
      }
    } catch (error) {
      console.error("Summary packet generation error:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your summary packet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-8">
      <Card>
        <CardContent className="space-y-3 p-4">
          <h3 className="text-lg font-semibold">📦 Generate Clinical Summary Packet</h3>
          <p className="text-sm text-muted-foreground">
            Create a comprehensive summary document for regulatory submission or team review
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Protocol Content</label>
              <Textarea
                rows={4}
                placeholder="Paste protocol content"
                value={inputs.protocol}
                onChange={(e) => handleChange("protocol", e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">IND Module 2.5</label>
              <Textarea
                rows={3}
                placeholder="Paste IND Module 2.5 text"
                value={inputs.ind25}
                onChange={(e) => handleChange("ind25", e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">IND Module 2.7</label>
              <Textarea
                rows={3}
                placeholder="Paste IND Module 2.7 text"
                value={inputs.ind27}
                onChange={(e) => handleChange("ind27", e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Statistical Analysis Plan (SAP)</label>
              <Textarea
                rows={3}
                placeholder="Paste SAP draft"
                value={inputs.sap}
                onChange={(e) => handleChange("sap", e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Risk Flags</label>
              <Textarea
                rows={2}
                placeholder="Paste risk flags (one per line)"
                value={inputs.risks}
                onChange={(e) => handleChange("risks", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Success Probability (%)</label>
                <Input
                  type="number"
                  placeholder="e.g., 72.5"
                  value={inputs.success_probability}
                  onChange={(e) => handleChange("success_probability", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sample Size</label>
                <Input
                  type="number"
                  placeholder="e.g., 240"
                  value={inputs.sample_size}
                  onChange={(e) => handleChange("sample_size", e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Generating..." : "📄 Generate Summary Packet"}
            </Button>
            
            {submitted && (
              <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                ✅ Packet generated and opened in new tab. If it didn't open automatically, check your browser's popup settings.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}