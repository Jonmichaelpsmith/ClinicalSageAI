import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function TrialSuccessPredictor() {
  const [sampleSize, setSampleSize] = useState(250);
  const [duration, setDuration] = useState(24);
  const [dropout, setDropout] = useState(0.15);
  const [probability, setProbability] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [featureContributions, setFeatureContributions] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const predict = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/ai/predict-success', {
        sample_size: sampleSize,
        duration_weeks: duration,
        dropout_rate: dropout
      });

      const data = await response.json();
      if (data.success) {
        setProbability(data.probability);
        setFeatureContributions(data.featureContributions);
        toast({
          title: "Prediction Complete",
          description: `Predicted Success Rate: ${(data.probability * 100).toFixed(1)}%`,
        });
      } else {
        toast({
          title: "Prediction Failed",
          description: data.message || "An error occurred during prediction",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error predicting trial success:", error);
      toast({
        title: "Prediction Error",
        description: "Failed to connect to the prediction service",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToPdf = async () => {
    if (probability === null) {
      toast({
        title: "Export Failed",
        description: "Run a prediction first before exporting",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/export/success-summary', {
        success_rate: probability,
        inputs: {
          sample_size: sampleSize,
          duration_weeks: duration,
          dropout_rate: dropout
        },
        protocol_id: `TRIAL-${Date.now()}`
      });

      const data = await response.json();
      setPdfUrl(data.download_url);
      toast({
        title: "Export Complete",
        description: "Success prediction report generated successfully",
      });
    } catch (error) {
      console.error("Error exporting prediction:", error);
      toast({
        title: "Export Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const attachToDossier = async () => {
    if (!pdfUrl) {
      toast({
        title: "Attachment Failed",
        description: "Export to PDF first before attaching to a dossier",
        variant: "destructive",
      });
      return;
    }

    // Implementation for attaching to dossier would go here
    toast({
      title: "Feature Coming Soon",
      description: "Dossier attachment will be available in the next update",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="space-y-4 p-6">
        <h3 className="text-xl font-bold text-primary">Trial Success Prediction</h3>
        <p className="text-sm text-muted-foreground">
          Use ML-powered prediction to estimate clinical trial success probability based on key parameters.
        </p>
        
        <div className="space-y-1">
          <label className="text-sm font-medium">Sample Size</label>
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              min={10}
              max={10000}
              value={sampleSize} 
              onChange={e => setSampleSize(parseInt(e.target.value) || 0)} 
              className="w-full"
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium">Duration (weeks)</label>
          <div className="flex items-center gap-2">
            <Input 
              type="number"
              min={1}
              max={260}
              value={duration} 
              onChange={e => setDuration(parseInt(e.target.value) || 0)} 
              className="w-full"
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium">Dropout Rate (0.0 - 1.0)</label>
          <div className="flex items-center gap-2">
            <Slider
              value={[dropout]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(value) => setDropout(value[0])}
              className="w-full"
            />
            <span className="w-12 text-right">{dropout.toFixed(2)}</span>
          </div>
        </div>
        
        <Button 
          onClick={predict} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Calculating..." : "Predict Trial Success"}
        </Button>
        
        {probability !== null && (
          <div className="mt-6 space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-semibold mb-2">Results</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Success Probability:</span>
                  <span className={`font-bold ${probability > 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                    {(probability * 100).toFixed(1)}%
                  </span>
                </div>
                {featureContributions && (
                  <div className="space-y-1 pt-2">
                    <p className="text-sm font-medium">Feature Contributions:</p>
                    <div className="flex justify-between text-sm">
                      <span>Sample Size:</span>
                      <span>{(featureContributions.sampleSize * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Duration:</span>
                      <span>{(featureContributions.durationWeeks * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Dropout Rate:</span>
                      <span>{(featureContributions.dropoutRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={exportToPdf} 
                variant="outline" 
                disabled={loading}
                className="flex-1"
              >
                Export to PDF
              </Button>
              <Button 
                onClick={attachToDossier} 
                variant="outline"
                disabled={!pdfUrl || loading}
                className="flex-1"
              >
                Add to Dossier
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}