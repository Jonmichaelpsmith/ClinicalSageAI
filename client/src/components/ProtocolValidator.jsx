// /client/src/components/ProtocolValidator.jsx
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function ProtocolValidator() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applyingFixes, setApplyingFixes] = useState(false);

  const handleValidate = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/validate-protocol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text })
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error validating protocol:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAIFixes = async () => {
    if (!result || !text.trim()) return;
    
    setApplyingFixes(true);
    try {
      // This would connect to an AI endpoint to auto-fix the protocol
      // For now we'll simulate by adding the recommendations to the text
      let fixedText = text;
      
      // Insert each recommendation as a fix
      result.recommendations.forEach(recommendation => {
        fixedText += `\n\n/* AI FIX: ${recommendation} */\n`;
      });
      
      setText(fixedText);
      
      // Re-validate after applying fixes
      setTimeout(() => {
        handleValidate();
      }, 500);
    } catch (error) {
      console.error("Error applying AI fixes:", error);
    } finally {
      setApplyingFixes(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    if (score >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Protocol Compliance Validator</h3>
            {result && (
              <div className="text-center">
                <div className="text-xl font-bold">{result.score}/100</div>
                <Progress 
                  value={result.score} 
                  className={`w-[100px] h-2 ${getScoreColor(result.score)}`} 
                />
              </div>
            )}
          </div>
          
          <Textarea
            placeholder="Paste your draft protocol text here..."
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="font-mono text-sm"
          />
          
          <div className="flex gap-3">
            <Button 
              onClick={handleValidate} 
              disabled={!text.trim() || loading}
            >
              {loading ? "Validating..." : "Validate Protocol"}
            </Button>
            
            {result && result.issues.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleApplyAIFixes}
                disabled={applyingFixes}
              >
                {applyingFixes ? "Applying Fixes..." : "Apply AI Corrections"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div>
              <h4 className="text-base font-semibold mb-2 flex items-center">
                Detected Issues
                {result.issues.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {result.issues.length}
                  </Badge>
                )}
              </h4>
              
              {result.issues.length === 0 ? (
                <Alert className="bg-green-50 border-green-500">
                  <AlertTitle>No compliance issues found!</AlertTitle>
                  <AlertDescription>
                    Your protocol appears to comply with regulatory guidelines.
                  </AlertDescription>
                </Alert>
              ) : (
                <ul className="list-disc ml-5 space-y-1 text-sm text-red-600">
                  {result.issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>

            {result.recommendations && result.recommendations.length > 0 && (
              <div>
                <h4 className="text-base font-semibold mb-2 flex items-center">
                  AI Recommendations
                  <Badge className="ml-2 bg-blue-500">
                    {result.recommendations.length}
                  </Badge>
                </h4>
                <ul className="list-disc ml-5 space-y-1 text-sm text-blue-600">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}