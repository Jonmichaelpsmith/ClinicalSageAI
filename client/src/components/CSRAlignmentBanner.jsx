import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/**
 * Component that displays a banner with CSR alignment results when a protocol
 * has been successfully aligned with a CSR.
 * 
 * @param {Object} props - Component props
 * @param {string} props.sessionId - Current session ID
 * @param {string} props.csrId - CSR ID that was used for alignment (if any)
 * @param {Function} props.onViewReport - Optional callback when "View Full Report" is clicked
 */
const CSRAlignmentBanner = ({ sessionId, csrId, onViewReport = () => {} }) => {
  const [alignmentData, setAlignmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Only fetch if we have both a session ID and CSR ID
    if (!sessionId || !csrId) return;
    
    const fetchAlignmentData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/sessions/${sessionId}/alignment`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch alignment data: ${response.status}`);
        }
        
        const data = await response.json();
        setAlignmentData(data);
      } catch (error) {
        console.error("Error fetching alignment data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlignmentData();
  }, [sessionId, csrId]);

  // Don't show anything if we don't have alignment data yet
  if (!alignmentData || loading) return null;

  // Calculate color based on score
  const getScoreColor = (score) => {
    const percentage = Math.round(score * 100);
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-amber-500";
    return "text-red-500";
  };
  
  // Get variant for match/mismatch badges
  const getMatchVariant = (match) => {
    return match ? "success" : "destructive";
  };

  // Get overall score
  const alignmentScore = alignmentData.alignment_score;
  const scorePercentage = Math.round(alignmentScore * 100);
  const scoreColor = getScoreColor(alignmentScore);
  
  return (
    <Alert className="mb-6 border-l-4 border-l-blue-500">
      <AlertTitle className="flex items-center gap-2 text-base">
        <CheckCircle className="h-5 w-5 text-green-600" />
        Protocol Successfully Aligned with CSR
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <span>
            CSR ID: <strong>{csrId}</strong>
          </span>
          <span className="hidden md:inline">•</span>
          <span>
            Alignment Score: <strong className={scoreColor}>{scorePercentage}%</strong>
          </span>
        </div>
        
        {/* Match badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {alignmentData.matches && alignmentData.matches.map((match, index) => (
            <Badge 
              key={index} 
              variant={getMatchVariant(match.match)}
              className="capitalize"
            >
              {match.field.replace('_', ' ')}
              {match.match 
                ? <CheckCircle className="ml-1 h-3 w-3" /> 
                : <AlertCircle className="ml-1 h-3 w-3" />}
            </Badge>
          ))}
        </div>
        
        {/* View full report button */}
        <div className="mt-3">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center text-xs" 
            onClick={onViewReport}
          >
            View Full Alignment Report
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default CSRAlignmentBanner;