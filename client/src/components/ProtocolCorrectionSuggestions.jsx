import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Check, AlertCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Component that displays protocol correction suggestions with inline edit buttons
 * based on CSR alignment mismatches.
 * 
 * @param {Object} props - Component props
 * @param {string} props.sessionId - Current session ID
 * @param {Function} props.onApplyCorrection - Function to call when a suggestion is applied
 */
export default function ProtocolCorrectionSuggestions({ sessionId, onApplyCorrection }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    if (!sessionId) return;
    
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/insights/suggested-corrections/${sessionId}`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch suggestions: ${res.status}`);
        }
        
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSuggestions();
  }, [sessionId]);

  // If loading or no suggestions, don't render anything
  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-2 text-muted-foreground">Finding protocol improvement suggestions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions.length) {
    return null;
  }

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.8) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">High Confidence</Badge>;
    } else if (confidence >= 0.7) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Medium Confidence</Badge>;
    } else {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Suggested</Badge>;
    }
  };

  const handleApply = (suggestion) => {
    // Update local state to mark this suggestion as applied
    setApplied(prev => ({...prev, [suggestion.field]: true}));
    
    // Call parent handler if provided
    if (onApplyCorrection) {
      onApplyCorrection(suggestion);
    }
    
    // Show toast
    toast({
      title: "Suggestion Applied",
      description: `Updated ${suggestion.field} based on CSR evidence.`,
      duration: 3000,
    });
  };

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50/30">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <Lightbulb className="h-5 w-5 text-amber-600 mr-2" />
          <CardTitle className="text-base text-amber-800">
            Protocol Improvement Suggestions
          </CardTitle>
        </div>
        <CardDescription>
          Based on CSR evidence analysis, we recommend these adjustments to improve your protocol.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        {suggestions.map((suggestion, index) => (
          <div 
            key={index} 
            className={`border rounded-md p-3 ${
              applied[suggestion.field] 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium capitalize text-gray-900">
                {suggestion.field.replace(/_/g, ' ')} 
                {applied[suggestion.field] && (
                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200">
                    <Check className="h-3 w-3 mr-1" /> Applied
                  </Badge>
                )}
              </h4>
              {!applied[suggestion.field] && getConfidenceBadge(suggestion.confidence)}
            </div>
            
            <div className="flex items-center text-sm text-gray-700 mb-2">
              <div className="mr-2">Current:</div>
              <div className="font-medium">{suggestion.current}</div>
            </div>
            
            <div className="flex items-center text-sm text-gray-700 mb-3">
              <div className="mr-2">Suggested:</div>
              <div className="font-medium text-green-700">{suggestion.suggested}</div>
            </div>
            
            <div className="text-xs text-gray-600 mb-3 italic">
              {suggestion.justification}
            </div>
            
            {!applied[suggestion.field] && (
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => handleApply(suggestion)}
                >
                  Apply Change <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
      
      <CardFooter className="bg-gray-50 text-xs text-gray-500 rounded-b-lg">
        <div className="flex items-center">
          <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
          All suggestions are derived from analyzed CSR evidence and regulatory precedent.
        </div>
      </CardFooter>
    </Card>
  );
}