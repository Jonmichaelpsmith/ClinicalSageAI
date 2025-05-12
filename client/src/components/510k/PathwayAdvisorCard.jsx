/**
 * Pathway Advisor Card Component
 * 
 * This component displays a recommended regulatory pathway for a 510(k) submission
 * based on the device profile. It allows the user to confirm the pathway and proceed
 * with the submission.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import FDA510kService from '../../services/FDA510kService';

const PathwayAdvisorCard = ({ projectId, onConfirm }) => {
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      fetchPathwayRecommendation();
    }
  }, [projectId]);

  const fetchPathwayRecommendation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await FDA510kService.getPathwayRecommendation(projectId);
      setRecommendation(result);
    } catch (err) {
      console.error('Error fetching pathway recommendation:', err);
      setError('Failed to retrieve pathway recommendation. Please try again.');
      toast({
        title: "Error",
        description: "Could not retrieve pathway recommendation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (recommendation) {
      onConfirm(recommendation.pathway);
      toast({
        title: "Pathway Selected",
        description: `${recommendation.pathway} confirmed as submission pathway`,
      });
    }
  };

  const getPathwayBadgeColor = (pathway) => {
    const pathwayMap = {
      'Traditional 510(k)': 'bg-blue-100 text-blue-800',
      'Special 510(k)': 'bg-green-100 text-green-800',
      'Abbreviated 510(k)': 'bg-purple-100 text-purple-800',
      'De Novo': 'bg-amber-100 text-amber-800',
      'PMA': 'bg-red-100 text-red-800'
    };
    
    return pathwayMap[pathway] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Analyzing Your Device...</CardTitle>
          <CardDescription>
            We're determining the optimal regulatory pathway based on your device profile
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <div className="animate-pulse flex flex-col items-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Analyzing device classification and predicates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pathway Analysis Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            className="mt-4" 
            onClick={fetchPathwayRecommendation}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!recommendation) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Regulatory Pathway Advisor</CardTitle>
          <CardDescription>
            Waiting for device profile to analyze the optimal regulatory pathway
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex justify-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recommended Submission Pathway</CardTitle>
        <CardDescription>
          Based on your device profile and predicate analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-start border rounded-lg p-4 bg-muted/30">
          <div className="flex flex-col items-center sm:items-start mb-4 sm:mb-0">
            <span className="text-sm text-muted-foreground mb-1">Recommended Pathway</span>
            <Badge className={`text-lg px-3 py-1 ${getPathwayBadgeColor(recommendation.pathway)}`}>
              {recommendation.pathway}
            </Badge>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Estimated Timeline: {recommendation.estimatedTimelineInDays} days
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Rationale</h3>
          <p className="text-sm text-muted-foreground">{recommendation.rationale}</p>
        </div>

        {recommendation.alternativePathways && recommendation.alternativePathways.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Alternative Pathways</h3>
            <div className="flex flex-wrap gap-2">
              {recommendation.alternativePathways.map((path, index) => (
                <Badge key={index} variant="outline" className="text-muted-foreground">
                  {path}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {recommendation.requirements && recommendation.requirements.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Key Requirements</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              {recommendation.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {recommendation.confidenceScore && (
          <div className="flex items-center text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
            <span>
              Confidence Score: {Math.round(recommendation.confidenceScore * 100)}%
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleConfirm}
          className="space-x-1"
        >
          <span>Confirm & Proceed</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PathwayAdvisorCard;