import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

interface ProtocolSuccessPredictorProps {
  protocolData: any;
  onPredictionComplete?: (prediction: any) => void;
}

export function ProtocolSuccessPredictor({ 
  protocolData, 
  onPredictionComplete 
}: ProtocolSuccessPredictorProps) {
  const [prediction, setPrediction] = useState<any>(null);

  const predictionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/trial-prediction', data);
      return response.json();
    },
    onSuccess: (data) => {
      setPrediction(data.prediction);
      if (onPredictionComplete) {
        onPredictionComplete(data.prediction);
      }
    },
  });

  useEffect(() => {
    if (protocolData && Object.keys(protocolData).length > 0) {
      // Extract relevant data for prediction
      const {
        sample_size,
        duration_weeks,
        dropout_rate = 0.15, // Default if not provided
        indication,
        phase,
        endpoint_primary
      } = protocolData;

      // Only run prediction if we have the minimum required data
      if (sample_size && duration_weeks) {
        predictionMutation.mutate({
          sample_size,
          duration_weeks,
          dropout_rate,
          indication,
          phase,
          primary_endpoints: endpoint_primary
        });
      }
    }
  }, [protocolData]);

  const getSuccessLabel = (probability: number) => {
    if (probability >= 0.75) return { label: 'High', color: 'text-green-600' };
    if (probability >= 0.5) return { label: 'Moderate', color: 'text-amber-600' };
    return { label: 'Low', color: 'text-red-600' };
  };

  const getBarColor = (value: number) => {
    if (value >= 0.75) return '#22c55e'; // Green
    if (value >= 0.5) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const formatFactorName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format feature contributions for chart
  const contributionData = prediction?.featureContributions 
    ? Object.entries(prediction.featureContributions)
        .map(([key, value]: [string, any]) => ({
          name: formatFactorName(key),
          value: Math.abs(value as number),
          positive: (value as number) > 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5) // Top 5 factors
    : [];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Success Prediction
        </CardTitle>
        <CardDescription>
          ML-powered success probability based on protocol design and historical outcomes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {predictionMutation.isPending ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Analyzing protocol metrics...</p>
            </div>
          </div>
        ) : predictionMutation.isError ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center text-destructive">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>Error predicting success probability</p>
              <p className="text-sm text-muted-foreground mt-1">Please check the protocol data and try again</p>
            </div>
          </div>
        ) : prediction ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-slate-50 p-6 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Success Probability</h3>
                  <Badge variant="outline" className="px-3 py-1">ML Prediction</Badge>
                </div>
                
                <div className="flex items-center">
                  <div className="relative w-40 h-40">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-4xl font-bold">
                        {(prediction.probability * 100).toFixed(1)}%
                      </div>
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                           a 15.9155 15.9155 0 0 1 0 31.831
                           a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                        strokeDasharray="100, 100"
                      />
                      <path
                        d="M18 2.0845
                           a 15.9155 15.9155 0 0 1 0 31.831
                           a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={getBarColor(prediction.probability)}
                        strokeWidth="3"
                        strokeDasharray={`${prediction.probability * 100}, 100`}
                      />
                    </svg>
                  </div>
                  
                  <div className="ml-6">
                    <div className="text-sm text-muted-foreground mb-2">Success Rating</div>
                    <div className={`text-xl font-semibold ${getSuccessLabel(prediction.probability).color}`}>
                      {getSuccessLabel(prediction.probability).label}
                    </div>
                    
                    <div className="mt-4 text-sm text-muted-foreground">
                      Based on analysis of {prediction.similarTrialsCount || '200+'} similar trials
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2">Key Risk Insights</h3>
                <ul className="space-y-3">
                  {prediction.riskFactors?.map((factor: any, index: number) => (
                    <li key={index} className="flex items-start text-sm">
                      {factor.risk === 'High' ? (
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : factor.risk === 'Medium' ? (
                        <HelpCircle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-medium">{factor.factor}:</span>{' '}
                        <span className="text-muted-foreground">{factor.impact}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-3">Success Factors Impact</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={contributionData}
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 'dataMax']} />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        return [
                          `Impact: ${(value as number).toFixed(2)}`,
                          `Effect: ${props.payload.positive ? 'Positive' : 'Negative'}`
                        ];
                      }}
                    />
                    <Bar dataKey="value" barSize={20}>
                      {contributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.positive ? '#22c55e' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-700 mb-1">About this prediction</h4>
                <p className="text-xs text-blue-700">
                  This prediction is based on machine learning models trained on historical clinical trial data.
                  The model analyzes your protocol design against successful and failed trials with similar
                  characteristics to estimate the likelihood of success. 
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Upload or enter protocol data to generate prediction</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}