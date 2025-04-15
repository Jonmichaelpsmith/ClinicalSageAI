import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, FileText, ChevronUp, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

/**
 * Component to display protocol correction suggestions based on CSR insights
 */
export default function ProtocolCorrectionSuggestions({ sessionId, protocol, onCorrectionApply }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  // Toggle the expanded state of a suggestion section
  const toggleSection = (id) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Fetch correction suggestions when the component mounts
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!sessionId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Placeholder for actual API call - will be implemented when endpoints are ready
        // const response = await fetch(`/api/insights/protocol-corrections/${sessionId}`);
        // if (!response.ok) throw new Error('Failed to fetch correction suggestions');
        // const data = await response.json();
        // setSuggestions(data);
        
        // Simulated data for development
        setTimeout(() => {
          setSuggestions([
            {
              id: "sug1",
              category: "Statistical Design",
              title: "Sample Size Adjustment",
              description: "Based on CSR precedent for similar indications, consider increasing the sample size from current estimate to accommodate for expected dropout rate.",
              rationale: "Analysis of 5 similar CSRs shows an average dropout rate of 15% vs. your estimated 8%. The higher sample size ensures sufficient statistical power even with increased dropouts.",
              importance: "high",
              section: "Sample Size Calculation",
              action: "Consider increasing sample size by 15-20% or adding interim analysis provisions."
            },
            {
              id: "sug2",
              category: "Endpoint Selection",
              title: "Primary Endpoint Clarification",
              description: "Refine the primary endpoint definition to more specifically address measurement timeline and methodologies.",
              rationale: "Recent regulatory approvals in this therapeutic area favor clearly defined measurement protocols. Three CSRs with successful outcomes included detailed assessment methodologies.",
              importance: "medium",
              section: "Efficacy Assessments",
              action: "Add specific measurement frequency, observer training requirements, and validated instruments."
            },
            {
              id: "sug3",
              category: "Inclusion Criteria",
              title: "Inclusion Criteria Expansion",
              description: "Consider broadening the age range to improve recruitment rates and real-world applicability.",
              rationale: "Similar trials with broader age criteria (18-75 vs. your 21-65) showed comparable safety profiles with improved recruitment rates. FDA feedback on recent submissions has favored more inclusive demographic representation.",
              importance: "low",
              section: "Eligibility Criteria",
              action: "Expand age range to 18-75 years with appropriate safety monitoring provisions."
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching protocol correction suggestions:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [sessionId]);

  // Handler for applying a suggestion
  const handleApplySuggestion = (suggestion) => {
    if (onCorrectionApply && typeof onCorrectionApply === 'function') {
      onCorrectionApply(suggestion);
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <span>Unable to load correction suggestions</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Protocol Enhancement Insights</CardTitle>
          <CardDescription>
            No protocol enhancement suggestions available for this session.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground text-sm">
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-10 w-10 text-muted-foreground/50" />
            <p>Initialize CSR alignment to generate enhancement suggestions</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Protocol Enhancement Insights</CardTitle>
        <CardDescription>
          CSR-derived recommendations for protocol optimization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Collapsible 
              key={suggestion.id} 
              open={expandedSections[suggestion.id]} 
              onOpenChange={() => toggleSection(suggestion.id)}
              className="border rounded-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <Badge variant={getImportanceBadge(suggestion.importance)}>
                    {getSeverityLabel(suggestion.importance)}
                  </Badge>
                  <span className="font-medium">{suggestion.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {suggestion.category}
                  </span>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                      {expandedSections[suggestion.id] ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
              
              <CollapsibleContent>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-1">Description</div>
                    <div className="text-sm">{suggestion.description}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">Rationale</div>
                    <div className="text-sm">{suggestion.rationale}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">Recommended Action</div>
                    <div className="text-sm">{suggestion.action}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">Section</div>
                    <div className="text-sm">{suggestion.section}</div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="w-full sm:w-auto"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Apply This Recommendation
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions for displaying badges and labels based on importance
function getImportanceBadge(importance) {
  switch(importance) {
    case 'high': return 'destructive';
    case 'medium': return 'warning';
    case 'low': return 'outline';
    default: return 'secondary';
  }
}

function getSeverityLabel(importance) {
  switch(importance) {
    case 'high': return 'High Priority';
    case 'medium': return 'Medium Priority';
    case 'low': return 'Consider';
    default: return 'Informational';
  }
}