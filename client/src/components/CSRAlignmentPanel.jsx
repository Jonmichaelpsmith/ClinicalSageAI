import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

/**
 * Component to display CSR alignment scores and analysis
 */
export default function CSRAlignmentPanel({ sessionId }) {
  const [alignmentData, setAlignmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch alignment data when the component mounts
  useEffect(() => {
    const fetchAlignmentData = async () => {
      if (!sessionId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Placeholder for actual API call - will be implemented when endpoints are ready
        // const response = await fetch(`/api/alignment/protocol/${sessionId}`);
        // if (!response.ok) throw new Error('Failed to fetch alignment data');
        // const data = await response.json();
        // setAlignmentData(data);
        
        // Mock data for development
        setAlignmentData({
          overall_score: 76,
          primary_endpoint_alignment: 85,
          sample_size_alignment: 72,
          inclusion_criteria_alignment: 68,
          exclusion_criteria_alignment: 79,
          risk_flags: [
            { 
              element: "Exclusion Criteria", 
              issue: "Missing common exclusion for [element]", 
              severity: "medium"
            }
          ]
        });
      } catch (err) {
        console.error("Error fetching alignment data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlignmentData();
  }, [sessionId]);

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
            <span>Unable to load CSR alignment data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alignmentData) return null;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          CSR Precedent Alignment
        </CardTitle>
        <CardDescription>
          Analysis of protocol alignment with CSR precedent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Alignment</span>
            <div className="flex items-center gap-2">
              <Badge variant={getScoreBadgeVariant(alignmentData.overall_score)}>
                {alignmentData.overall_score}%
              </Badge>
            </div>
          </div>
          
          <div className="h-2 w-full bg-slate-100 rounded-full">
            <div 
              className={`h-2 rounded-full ${getScoreBarColor(alignmentData.overall_score)}`}
              style={{ width: `${alignmentData.overall_score}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <AlignmentScoreItem 
            label="Primary Endpoint" 
            score={alignmentData.primary_endpoint_alignment} 
          />
          <AlignmentScoreItem 
            label="Sample Size" 
            score={alignmentData.sample_size_alignment} 
          />
          <AlignmentScoreItem 
            label="Inclusion Criteria" 
            score={alignmentData.inclusion_criteria_alignment} 
          />
          <AlignmentScoreItem 
            label="Exclusion Criteria" 
            score={alignmentData.exclusion_criteria_alignment} 
          />
        </div>
        
        {alignmentData.risk_flags && alignmentData.risk_flags.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Risk Flags</h4>
            <div className="space-y-2">
              {alignmentData.risk_flags.map((flag, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded-md flex items-start gap-2 
                  ${getSeverityBgColor(flag.severity)}`}
                >
                  {getSeverityIcon(flag.severity)}
                  <div>
                    <div className="font-medium text-sm">{flag.element}</div>
                    <div className="text-xs">{flag.issue}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper component for individual alignment scores
function AlignmentScoreItem({ label, score }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-24 h-1.5 bg-slate-100 rounded-full">
          <div 
            className={`h-1.5 rounded-full ${getScoreBarColor(score)}`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <Badge variant={getScoreBadgeVariant(score)}>
          {score}%
        </Badge>
      </div>
    </div>
  );
}

// Helper functions for styling based on scores
function getScoreBadgeVariant(score) {
  if (score >= 80) return "success";
  if (score >= 60) return "outline";
  return "destructive";
}

function getScoreBarColor(score) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function getSeverityBgColor(severity) {
  switch (severity) {
    case "high": return "bg-red-50 text-red-800";
    case "medium": return "bg-amber-50 text-amber-800";
    case "low": return "bg-blue-50 text-blue-800";
    default: return "bg-slate-50";
  }
}

function getSeverityIcon(severity) {
  switch (severity) {
    case "high": return <XCircle className="h-4 w-4 text-red-500 mt-0.5" />;
    case "medium": return <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />;
    case "low": return <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />;
    default: return <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5" />;
  }
}