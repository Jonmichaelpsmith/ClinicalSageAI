import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Loader2, Database, ArrowRight, ArrowUp, ArrowDown, Minus, AlertCircle, ExternalLink } from 'lucide-react';

interface CSRBenchmarkPanelProps {
  protocolData: any;
  onBenchmarkComplete?: (benchmarkData: any) => void;
}

export function CSRBenchmarkPanel({ 
  protocolData, 
  onBenchmarkComplete 
}: CSRBenchmarkPanelProps) {
  const benchmarkMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/strategy/from-csrs', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (onBenchmarkComplete) {
        onBenchmarkComplete(data);
      }
    },
  });

  useEffect(() => {
    if (protocolData && Object.keys(protocolData).length > 0) {
      // Extract relevant data for benchmarking
      const {
        indication,
        phase,
        sample_size,
        duration_weeks,
        endpoint_primary
      } = protocolData;

      // Only run benchmark if we have the minimum required data
      if (indication && phase) {
        benchmarkMutation.mutate({
          indication,
          phase,
          sample_size,
          duration_weeks,
          endpoint_primary
        });
      }
    }
  }, [protocolData]);

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Calculate the difference and determine if it's good or bad
  const calculateDiff = (userValue: number, benchmarkValue: number) => {
    const diff = userValue - benchmarkValue;
    const percentDiff = (Math.abs(diff) / benchmarkValue) * 100;
    
    // For sample size, higher can be better (up to a point)
    if (percentDiff < 5) {
      return { icon: <Minus className="w-4 h-4 text-slate-500" />, color: 'text-slate-500', text: 'Aligned' };
    } else if (diff > 0 && percentDiff > 30) {
      // Much higher than benchmark
      return { icon: <ArrowUp className="w-4 h-4 text-amber-500" />, color: 'text-amber-500', text: 'Higher' };
    } else if (diff > 0) {
      // Higher than benchmark but within reasonable range
      return { icon: <ArrowUp className="w-4 h-4 text-green-500" />, color: 'text-green-500', text: 'Better' };
    } else {
      // Lower than benchmark
      return { icon: <ArrowDown className="w-4 h-4 text-red-500" />, color: 'text-red-500', text: 'Lower' };
    }
  };

  // Calculate the difference for duration - shorter can be better
  const calculateDurationDiff = (userValue: number, benchmarkValue: number) => {
    const diff = userValue - benchmarkValue;
    const percentDiff = (Math.abs(diff) / benchmarkValue) * 100;
    
    if (percentDiff < 10) {
      return { icon: <Minus className="w-4 h-4 text-slate-500" />, color: 'text-slate-500', text: 'Aligned' };
    } else if (diff < 0 && percentDiff <= 30) {
      // Shorter but not too short
      return { icon: <ArrowDown className="w-4 h-4 text-green-500" />, color: 'text-green-500', text: 'Efficient' };
    } else if (diff < 0) {
      // Much shorter than benchmark
      return { icon: <ArrowDown className="w-4 h-4 text-amber-500" />, color: 'text-amber-500', text: 'Very Short' };
    } else {
      // Longer than benchmark
      return { icon: <ArrowUp className="w-4 h-4 text-red-500" />, color: 'text-red-500', text: 'Too Long' };
    }
  };

  // Calculate the difference for dropout rate - lower is better
  const calculateDropoutDiff = (userValue: number, benchmarkValue: number) => {
    const diff = userValue - benchmarkValue;
    const percentDiff = (Math.abs(diff) / benchmarkValue) * 100;
    
    if (percentDiff < 10) {
      return { icon: <Minus className="w-4 h-4 text-slate-500" />, color: 'text-slate-500', text: 'Aligned' };
    } else if (diff < 0) {
      // Lower dropout rate
      return { icon: <ArrowDown className="w-4 h-4 text-green-500" />, color: 'text-green-500', text: 'Better' };
    } else {
      // Higher dropout rate
      return { icon: <ArrowUp className="w-4 h-4 text-red-500" />, color: 'text-red-500', text: 'Higher Risk' };
    }
  };

  // Prepare data for the comparison chart
  const prepareComparisonData = () => {
    if (!benchmarkMutation.data || !protocolData) return [];
    
    const { avgSampleSize, avgDuration, avgDropoutRate } = benchmarkMutation.data;
    const { sample_size, duration_weeks, dropout_rate } = protocolData;
    
    return [
      {
        name: 'Sample Size',
        your: sample_size,
        benchmark: avgSampleSize,
        ratio: sample_size / avgSampleSize
      },
      {
        name: 'Duration (weeks)',
        your: duration_weeks,
        benchmark: avgDuration,
        ratio: duration_weeks / avgDuration
      },
      {
        name: 'Dropout Rate (%)',
        your: dropout_rate * 100,
        benchmark: avgDropoutRate * 100,
        ratio: dropout_rate / avgDropoutRate
      }
    ];
  };

  const getSimilarityBadge = (score: number) => {
    if (score >= 85) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">High Match</Badge>;
    } else if (score >= 70) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Good Match</Badge>;
    } else if (score >= 50) {
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Partial Match</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Low Match</Badge>;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          CSR Benchmark Comparison
        </CardTitle>
        <CardDescription>
          Comparing your protocol against similar clinical study reports with known outcomes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {benchmarkMutation.isPending ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Finding similar trials in our database...</p>
            </div>
          </div>
        ) : benchmarkMutation.isError ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center text-destructive">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>Error finding benchmark data</p>
              <p className="text-sm text-muted-foreground mt-1">Please check your protocol information and try again</p>
            </div>
          </div>
        ) : benchmarkMutation.data ? (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Precedent Analysis</h3>
                <div className="flex items-end mb-2">
                  <div className="text-2xl font-bold">
                    {benchmarkMutation.data.similarTrials?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground ml-2 mb-1">similar trials</div>
                </div>
                <div className="mb-2 flex items-center">
                  <span className="text-sm mr-2">Similarity Score:</span>
                  {getSimilarityBadge(benchmarkMutation.data.similarityScore || 0)}
                </div>
                <Progress value={benchmarkMutation.data.similarityScore || 0} className="h-2" />
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Historical Success Rate</h3>
                <div className="flex items-end mb-2">
                  <div className="text-2xl font-bold">
                    {formatPercent(benchmarkMutation.data.successRate || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground ml-2 mb-1">success rate</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Based on trials with similar characteristics
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Endpoint Precedent</h3>
                <div className="flex items-center mb-2">
                  <div className="text-2xl font-bold mr-2">
                    {benchmarkMutation.data.endpointPrecedent ? 'Yes' : 'No'}
                  </div>
                  {benchmarkMutation.data.endpointPrecedent ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Found in Similar Trials</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Novel Endpoint</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {benchmarkMutation.data.endpointPrecedent ? 
                    `Found in ${benchmarkMutation.data.endpointCount || 'multiple'} similar trials` : 
                    'Consider establishing endpoint validity'}
                </div>
              </div>
            </div>

            {/* Key Metrics Comparison */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Key Metrics Comparison</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Your Protocol</TableHead>
                    <TableHead>Benchmark Average</TableHead>
                    <TableHead>Comparison</TableHead>
                    <TableHead>Recommendation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Sample Size</TableCell>
                    <TableCell>{protocolData.sample_size}</TableCell>
                    <TableCell>{Math.round(benchmarkMutation.data.avgSampleSize || 0)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {calculateDiff(
                          protocolData.sample_size, 
                          benchmarkMutation.data.avgSampleSize || 1
                        ).icon}
                        <span className={`ml-1 ${calculateDiff(
                          protocolData.sample_size, 
                          benchmarkMutation.data.avgSampleSize || 1
                        ).color}`}>
                          {calculateDiff(
                            protocolData.sample_size, 
                            benchmarkMutation.data.avgSampleSize || 1
                          ).text}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {protocolData.sample_size < (benchmarkMutation.data.avgSampleSize * 0.8) ? (
                        <span className="text-sm text-red-600">Consider increasing sample size</span>
                      ) : protocolData.sample_size > (benchmarkMutation.data.avgSampleSize * 1.3) ? (
                        <span className="text-sm text-amber-600">Consider optimizing sample size</span>
                      ) : (
                        <span className="text-sm text-green-600">Well aligned with benchmarks</span>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="font-medium">Duration (weeks)</TableCell>
                    <TableCell>{protocolData.duration_weeks}</TableCell>
                    <TableCell>{Math.round(benchmarkMutation.data.avgDuration || 0)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {calculateDurationDiff(
                          protocolData.duration_weeks, 
                          benchmarkMutation.data.avgDuration || 1
                        ).icon}
                        <span className={`ml-1 ${calculateDurationDiff(
                          protocolData.duration_weeks, 
                          benchmarkMutation.data.avgDuration || 1
                        ).color}`}>
                          {calculateDurationDiff(
                            protocolData.duration_weeks, 
                            benchmarkMutation.data.avgDuration || 1
                          ).text}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {protocolData.duration_weeks > (benchmarkMutation.data.avgDuration * 1.3) ? (
                        <span className="text-sm text-red-600">Consider shortening trial duration</span>
                      ) : protocolData.duration_weeks < (benchmarkMutation.data.avgDuration * 0.7) ? (
                        <span className="text-sm text-amber-600">May be insufficient to capture outcomes</span>
                      ) : (
                        <span className="text-sm text-green-600">Well aligned with benchmarks</span>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="font-medium">Dropout Rate</TableCell>
                    <TableCell>{formatPercent(protocolData.dropout_rate || 0)}</TableCell>
                    <TableCell>{formatPercent(benchmarkMutation.data.avgDropoutRate || 0)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {calculateDropoutDiff(
                          protocolData.dropout_rate || 0, 
                          benchmarkMutation.data.avgDropoutRate || 0.15
                        ).icon}
                        <span className={`ml-1 ${calculateDropoutDiff(
                          protocolData.dropout_rate || 0, 
                          benchmarkMutation.data.avgDropoutRate || 0.15
                        ).color}`}>
                          {calculateDropoutDiff(
                            protocolData.dropout_rate || 0, 
                            benchmarkMutation.data.avgDropoutRate || 0.15
                          ).text}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(protocolData.dropout_rate || 0) > (benchmarkMutation.data.avgDropoutRate * 1.2) ? (
                        <span className="text-sm text-red-600">Consider strategies to reduce dropout</span>
                      ) : (
                        <span className="text-sm text-green-600">Well aligned with benchmarks</span>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Similar Trials Table */}
            {benchmarkMutation.data.similarTrials && benchmarkMutation.data.similarTrials.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Similar Precedent Trials</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trial ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Sponsor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {benchmarkMutation.data.similarTrials.map((trial: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{trial.id}</TableCell>
                        <TableCell>{trial.title}</TableCell>
                        <TableCell>{trial.sponsor}</TableCell>
                        <TableCell>{trial.date}</TableCell>
                        <TableCell>
                          {trial.outcome === 'Success' ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Success</Badge>
                          ) : trial.outcome === 'Failure' ? (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Failure</Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200">Unknown</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="link" size="sm" className="h-8 gap-1">
                            View Insight
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {benchmarkMutation.data.similarityScore < 50 && (
              <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Low Similarity Score</AlertTitle>
                <AlertDescription>
                  Your protocol has limited precedent in our database. Consider reviewing the design elements
                  or consult with domain experts for this specific indication and phase.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Upload or enter protocol data to generate benchmark comparison</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}