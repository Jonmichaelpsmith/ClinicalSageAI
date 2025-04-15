import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertCircle } from "lucide-react";

interface AnalysisResult {
  prediction: number;
  best_sample_size: number;
  best_duration: number;
  mean_prob: number;
  std_prob: number;
  insights: {
    total_trials: number;
    therapeutic_area: string;
    phase: string;
  };
  recommendations?: string[];
}

const SPRADirectPage: React.FC = () => {
  const [sampleSize, setSampleSize] = useState<number>(100);
  const [duration, setDuration] = useState<number>(52);
  const [therapeuticArea, setTherapeuticArea] = useState<string>("Oncology");
  const [phase, setPhase] = useState<string>("Phase 2");
  const [randomization, setRandomization] = useState<string>("Double-blind");
  const [primaryEndpoint, setPrimaryEndpoint] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // For debugging
    console.log('Submitting protocol data:', {
      sample_size: sampleSize,
      duration: duration,
      therapeutic_area: therapeuticArea,
      phase: phase,
      randomization: randomization,
      primary_endpoint: primaryEndpoint,
    });
    
    try {
      // Log the request URL for debugging
      console.log('Sending request to: /api/spra/direct-analyze');
      
      const response = await fetch('/api/spra/direct-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          sample_size: sampleSize,
          duration: duration,
          therapeutic_area: therapeuticArea,
          phase: phase,
          randomization: randomization,
          primary_endpoint: primaryEndpoint,
        }),
      });
      
      // Log response status for debugging
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMsg = `API request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg += `: ${errorData.error || JSON.stringify(errorData)}`;
        } catch (e) {
          // If we can't parse JSON, use text content
          try {
            const textContent = await response.text();
            errorMsg += ` (${textContent.substring(0, 100)}${textContent.length > 100 ? '...' : ''})`;
          } catch (_) {
            // If we can't get text either, just continue with the basic error
          }
        }
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      console.log('Received SPRA analysis result:', data);
      setResult(data);
    } catch (err: any) {
      console.error('Error analyzing protocol:', err);
      setError(err.message || 'Failed to analyze protocol');
      setResult(null);
      
      // Try a fallback approach
      try {
        console.log('Trying alternative approach with XMLHttpRequest');
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/spra/direct-analyze', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
          if (xhr.status === 200) {
            console.log('XHR successful!');
            const data = JSON.parse(xhr.responseText);
            setResult(data);
            setError(null);
          } else {
            console.error('XHR failed with status:', xhr.status);
          }
          setIsLoading(false);
        };
        xhr.onerror = function() {
          console.error('XHR error:', xhr.statusText);
          setIsLoading(false);
        };
        xhr.send(JSON.stringify({
          sample_size: sampleSize,
          duration: duration,
          therapeutic_area: therapeuticArea,
          phase: phase,
          randomization: randomization,
          primary_endpoint: primaryEndpoint,
        }));
      } catch (fallbackErr) {
        console.error('Fallback approach also failed:', fallbackErr);
        setIsLoading(false);
      }
    } finally {
      // Only set loading to false if we're not using the fallback approach
      if (!error) {
        setIsLoading(false);
      }
    }
  };
  
  const formatPercentage = (value: number): string => {
    return (value * 100).toFixed(1) + '%';
  };
  
  const getSuccessProbabilityColor = (probability: number): string => {
    if (probability >= 0.75) return 'text-green-600';
    if (probability >= 0.5) return 'text-amber-600';
    return 'text-red-600';
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Strategic Protocol Recommendations Advisor</h1>
      <p className="text-muted-foreground mb-8">
        Analyze and optimize your clinical trial protocol design using machine learning insights
        from over 3,000 clinical study reports.
      </p>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Protocol Parameters</CardTitle>
            <CardDescription>
              Enter your protocol parameters to receive optimization recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sample-size">Sample Size</Label>
                <Input
                  id="sample-size"
                  type="number"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(parseInt(e.target.value))}
                  min={10}
                  max={10000}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Study Duration (weeks)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  min={4}
                  max={520}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="therapeutic-area">Therapeutic Area</Label>
                <Select
                  value={therapeuticArea}
                  onValueChange={setTherapeuticArea}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select therapeutic area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Therapeutic Areas</SelectLabel>
                      <SelectItem value="Oncology">Oncology</SelectItem>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="Immunology">Immunology</SelectItem>
                      <SelectItem value="Infectious Disease">Infectious Disease</SelectItem>
                      <SelectItem value="Respiratory">Respiratory</SelectItem>
                      <SelectItem value="Gastroenterology">Gastroenterology</SelectItem>
                      <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phase">Study Phase</Label>
                <Select
                  value={phase}
                  onValueChange={setPhase}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select study phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Study Phases</SelectLabel>
                      <SelectItem value="Phase 1">Phase 1</SelectItem>
                      <SelectItem value="Phase 1/2">Phase 1/2</SelectItem>
                      <SelectItem value="Phase 2">Phase 2</SelectItem>
                      <SelectItem value="Phase 2/3">Phase 2/3</SelectItem>
                      <SelectItem value="Phase 3">Phase 3</SelectItem>
                      <SelectItem value="Phase 4">Phase 4</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="randomization">Randomization</Label>
                <Select
                  value={randomization}
                  onValueChange={setRandomization}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select randomization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Randomization Types</SelectLabel>
                      <SelectItem value="Double-blind">Double-blind</SelectItem>
                      <SelectItem value="Single-blind">Single-blind</SelectItem>
                      <SelectItem value="Open-label">Open-label</SelectItem>
                      <SelectItem value="Non-randomized">Non-randomized</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primary-endpoint">
                  Primary Endpoint (optional)
                </Label>
                <Input
                  id="primary-endpoint"
                  value={primaryEndpoint}
                  onChange={(e) => setPrimaryEndpoint(e.target.value)}
                  placeholder="e.g., Overall Survival, RECIST response"
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Protocol'}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Success Probability Analysis</CardTitle>
                  <CardDescription>
                    Based on {result.insights.total_trials} similar trials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Current Protocol Success Probability</span>
                      <span className={getSuccessProbabilityColor(result.prediction)}>
                        {formatPercentage(result.prediction)}
                      </span>
                    </div>
                    <Progress value={result.prediction * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Optimized Protocol Success Probability</span>
                      <span className={getSuccessProbabilityColor(result.mean_prob)}>
                        {formatPercentage(result.mean_prob)}
                      </span>
                    </div>
                    <Progress value={result.mean_prob * 100} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="border rounded p-3">
                      <p className="text-sm text-muted-foreground">Current Sample Size</p>
                      <p className="text-2xl font-semibold">{sampleSize}</p>
                    </div>
                    <div className="border rounded p-3 bg-green-50">
                      <p className="text-sm text-muted-foreground">Recommended Sample Size</p>
                      <p className="text-2xl font-semibold">{result.best_sample_size}</p>
                    </div>
                    <div className="border rounded p-3">
                      <p className="text-sm text-muted-foreground">Current Duration</p>
                      <p className="text-2xl font-semibold">{duration} weeks</p>
                    </div>
                    <div className="border rounded p-3 bg-green-50">
                      <p className="text-sm text-muted-foreground">Recommended Duration</p>
                      <p className="text-2xl font-semibold">{result.best_duration} weeks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>
                    Strategic improvements to consider for your protocol
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations ? (
                      result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-2">
                          <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>Consider {result.prediction < 0.7 ? "increasing" : "optimizing"} the sample size to {result.best_sample_size} participants</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>{result.prediction < 0.6 ? "Increase" : "Optimize"} the study duration to {result.best_duration} weeks</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>Therapeutic area ({therapeuticArea}) insights show {result.insights.total_trials} similar trials</span>
                        </li>
                      </>
                    )}
                  </ul>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    These recommendations are generated using machine learning models trained on historical clinical trial data and should be reviewed by qualified researchers.
                  </p>
                </CardFooter>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SPRADirectPage;