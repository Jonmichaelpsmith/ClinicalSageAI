import { useEffect, useState, useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Edit, Check, X, CheckCircle2, RefreshCw, ArrowRightLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// We'll create a context in ProtocolPlanningDashboard to share protocol state
const ProtocolPlanningContext = window.ProtocolPlanningContext || 
  { Consumer: ({ children }) => children({}) };

export default function ProtocolCorrectionSuggestions({ sessionId }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedChanges, setAppliedChanges] = useState([]);
  const { toast } = useToast();

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
      // Reset applied changes when session ID changes
      setAppliedChanges([]);
    }
  }, [sessionId]);

  // If no suggestions or not loaded yet, don't render the component
  if (loading || !suggestions.length) return null;

  // Function to handle applying a suggestion to the protocol
  const handleApplySuggestion = (suggestion, protocolSetter, protocol) => {
    try {
      // Only proceed if we have access to protocol state and setter
      if (!protocolSetter || !protocol) {
        throw new Error("Protocol context not available");
      }

      // Simple replacement logic - this will need refinement based on actual protocol structure
      const field = suggestion.field.toLowerCase();
      const currentValue = suggestion.current;
      const suggestedValue = suggestion.suggested;
      
      // Different strategies based on field types
      let newProtocol = protocol;
      
      if (field === "sample_size" || field === "duration" || field === "duration_weeks") {
        // For numeric fields, look for specific patterns
        const pattern = new RegExp(`(${field}|${field.replace('_', ' ')})[:\\s]+(\\d+)`, 'i');
        newProtocol = protocol.replace(pattern, `$1: ${suggestedValue}`);
      } else if (field.includes("endpoint")) {
        // For endpoints, look for the sections
        const endpointPattern = new RegExp(`(primary endpoint|primary_endpoint|primary outcome)[:\\s]+.*${currentValue}.*`, 'i');
        newProtocol = protocol.replace(endpointPattern, `$1: ${suggestedValue}`);
      } else {
        // Generic field replacement approach
        const genericPattern = new RegExp(`(${field}|${field.replace('_', ' ')})[:\\s]+.*\\b${currentValue}\\b.*`, 'i');
        newProtocol = protocol.replace(genericPattern, `$1: ${suggestedValue}`);
      }
      
      // Update the protocol
      protocolSetter(newProtocol);
      
      // Mark this suggestion as applied
      setAppliedChanges([...appliedChanges, suggestion.field]);
      
      // Show success toast
      toast({
        title: "Suggestion Applied",
        description: `Updated ${suggestion.field} with recommended value.`,
        variant: "success",
      });
    } catch (err) {
      console.error("Error applying suggestion:", err);
      toast({
        title: "Failed to Apply Suggestion",
        description: "Couldn't automatically update the protocol. Please make the change manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtocolPlanningContext.Consumer>
      {({ protocol, setProtocol }) => (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-5 w-5 text-amber-600 mt-1" />
              <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-lg font-semibold text-amber-900">Protocol Improvement Suggestions</h2>
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-amber-700"
                            onClick={async () => {
                              try {
                                setLoading(true);
                                const res = await fetch(`/api/insights/suggested-corrections/${sessionId}`);
                                if (!res.ok) {
                                  throw new Error(`Failed to refresh suggestions: ${res.status}`);
                                }
                                const data = await res.json();
                                setSuggestions(data?.suggestions || []);
                                toast({
                                  title: "Suggestions Refreshed",
                                  description: `${data?.suggestions?.length || 0} improvement suggestions found.`,
                                });
                              } catch (err) {
                                console.error("Error refreshing suggestions:", err);
                                toast({
                                  title: "Error Refreshing Suggestions",
                                  description: err.message,
                                  variant: "destructive",
                                });
                              } finally {
                                setLoading(false);
                              }
                            }}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Refresh suggestions</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  AI has identified fields with low CSR alignment that could be improved based on historical evidence.
                </p>

                <ul className="text-sm space-y-4">
                  {suggestions.map((item, idx) => {
                    const isApplied = appliedChanges.includes(item.field);
                    
                    return (
                      <li key={idx} className={`p-3 ${isApplied ? 'bg-green-50 border-green-200' : 'bg-white border-amber-100'} border rounded shadow-sm transition-colors duration-300`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-medium text-amber-900">{item.field}</p>
                              {protocol && setProtocol && (
                                <div className="flex items-center gap-2">
                                  {isApplied ? (
                                    <span className="flex items-center text-green-600 text-xs gap-1">
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      Applied
                                    </span>
                                  ) : (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-7 gap-1 bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200 hover:text-amber-900"
                                            onClick={() => handleApplySuggestion(item, setProtocol, protocol)}
                                          >
                                            <ArrowRightLeft className="h-3.5 w-3.5" />
                                            <span className="text-xs">Apply Change</span>
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Replace current value with suggested improvement</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-2">
                              <div>
                                <p className="text-xs text-muted-foreground">Current Value</p>
                                <p className={`text-sm ${isApplied ? 'bg-red-100 line-through opacity-70' : 'bg-red-50'} p-1 rounded`}>{item.current || "Not specified"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Recommended Value</p>
                                <p className={`text-sm ${isApplied ? 'bg-green-100 font-medium' : 'bg-green-50'} p-1 rounded`}>{item.suggested || "Not available"}</p>
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
                    );
                  })}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </ProtocolPlanningContext.Consumer>
  );
}