import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function ProtocolCorrectionSuggestions({ sessionId }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/insights/suggested-corrections/${sessionId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch suggestions: ${res.status}`);
        }
        const data = await res.json();
        setSuggestions(data?.suggestions || []);
      } catch (err) {
        console.error("Error fetching correction suggestions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (sessionId) {
      fetchSuggestions();
    }
  }, [sessionId]);

  // If no suggestions or not loaded yet, don't render the component
  if (loading || !suggestions.length) return null;

  return (
    <Card className="mb-4 border-amber-200 bg-amber-50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-5 w-5 text-amber-600 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-amber-900">Protocol Improvement Suggestions</h2>
            <p className="text-sm text-muted-foreground mb-4">
              AI has identified fields with low CSR alignment that could be improved based on historical evidence.
            </p>

            <ul className="text-sm space-y-4">
              {suggestions.map((item, idx) => (
                <li key={idx} className="p-3 bg-white border border-amber-100 rounded shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-amber-900 mb-1">{item.field}</p>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Value</p>
                          <p className="text-sm bg-red-50 p-1 rounded">{item.current || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Recommended Value</p>
                          <p className="text-sm bg-green-50 p-1 rounded">{item.suggested || "Not available"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Justification</p>
                        <p className="text-xs text-amber-700 py-1">
                          {item.justification}
                        </p>
                        <div className="mt-1 flex items-center">
                          <div className="h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full" 
                              style={{width: `${Math.round(item.confidence * 100)}%`}}
                            ></div>
                          </div>
                          <span className="text-xs ml-2">
                            {Math.round(item.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}