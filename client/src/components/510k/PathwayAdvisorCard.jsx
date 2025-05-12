import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import FDA510kService from '../../services/FDA510kService';

/**
 * Regulatory Pathway Advisor Card Component
 * 
 * This component presents AI-powered regulatory pathway recommendations for a 510(k) submission
 * based on the provided device profile. It displays the recommended pathway (Traditional, Abbreviated,
 * or Special 510(k)), along with rationale, timelines, and requirements.
 * 
 * @param {Object} props Component properties
 * @param {string} props.projectId The ID of the current 510(k) project
 * @param {Function} props.onConfirm Callback when a pathway is confirmed, receives pathway as parameter
 */
const PathwayAdvisorCard = ({ projectId, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPathway, setSelectedPathway] = useState(null);
  const { toast } = useToast();
  const { tenantId } = useTenant();

  useEffect(() => {
    if (projectId) {
      fetchRecommendation();
    }
  }, [projectId]);

  const fetchRecommendation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await FDA510kService.getPathwayRecommendation(projectId);
      setRecommendation(response);
      setSelectedPathway(response.recommendedPathway);
    } catch (err) {
      console.error('Error fetching pathway recommendation:', err);
      setError('Unable to generate pathway recommendation. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPathway = () => {
    if (selectedPathway && onConfirm) {
      onConfirm(selectedPathway);
      toast({
        title: "Pathway confirmed",
        description: `${selectedPathway} selected as your submission pathway.`,
      });
    }
  };

  const getConfidenceBadge = (score) => {
    if (score >= 0.8) {
      return <Badge className="bg-green-600">High Confidence</Badge>;
    } else if (score >= 0.5) {
      return <Badge className="bg-yellow-600">Medium Confidence</Badge>;
    } else {
      return <Badge className="bg-red-600">Low Confidence</Badge>;
    }
  };

  const getTimelineEstimate = (days) => {
    if (days <= 60) {
      return <Badge className="bg-green-600">{days} days (Fast)</Badge>;
    } else if (days <= 120) {
      return <Badge className="bg-yellow-600">{days} days (Standard)</Badge>;
    } else {
      return <Badge className="bg-red-600">{days} days (Extended)</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Regulatory Pathway Advisor</CardTitle>
          <CardDescription>Analyzing your device profile to determine the optimal regulatory pathway</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">Analyzing device attributes and regulatory requirements...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Regulatory Pathway Advisor</CardTitle>
          <CardDescription>There was an issue determining your regulatory pathway</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button onClick={fetchRecommendation}>Retry Analysis</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendation) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Regulatory Pathway Advisor</CardTitle>
          <CardDescription>Complete your device profile to receive pathway recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>No Device Profile Found</AlertTitle>
            <AlertDescription>
              Please complete your device profile with comprehensive technical and intended use information to receive accurate regulatory pathway recommendations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Regulatory Pathway Recommendation</span>
          {getConfidenceBadge(recommendation.confidenceScore)}
        </CardTitle>
        <CardDescription>
          Based on your device profile and FDA guidelines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-lg bg-primary/5">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            Recommended: {recommendation.recommendedPathway}
          </h3>
          <p className="text-muted-foreground">{recommendation.rationale}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 border rounded-md">
              <h4 className="font-medium mb-1">Estimated Timeline</h4>
              <div>{getTimelineEstimate(recommendation.estimatedTimelineInDays)}</div>
            </div>
            <div className="p-3 border rounded-md">
              <h4 className="font-medium mb-1">Submission Complexity</h4>
              <div>
                <Badge className={
                  recommendation.recommendedPathway.includes("Special") 
                    ? "bg-green-600" 
                    : recommendation.recommendedPathway.includes("Abbreviated") 
                    ? "bg-yellow-600" 
                    : "bg-orange-600"
                }>
                  {recommendation.recommendedPathway.includes("Special") 
                    ? "Simpler" 
                    : recommendation.recommendedPathway.includes("Abbreviated") 
                    ? "Moderate" 
                    : "Complex"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {recommendation.alternativePathways && recommendation.alternativePathways.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-md font-semibold mb-2">Alternative Pathways</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recommendation.alternativePathways.map((path, index) => (
                  <Button 
                    key={index} 
                    variant={selectedPathway === path ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setSelectedPathway(path)}
                  >
                    {path}
                    {selectedPathway === path && <CheckCircle className="h-4 w-4 ml-2" />}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />
        
        <div>
          <h3 className="text-md font-semibold mb-2">Key Requirements</h3>
          <ul className="ml-5 list-disc space-y-1">
            {recommendation.requirements.map((req, index) => (
              <li key={index} className="text-muted-foreground">{req}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={fetchRecommendation}>
          Refresh Analysis
        </Button>
        <Button 
          className="flex items-center" 
          onClick={handleConfirmPathway}
          disabled={!selectedPathway}
        >
          Confirm {selectedPathway} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PathwayAdvisorCard;