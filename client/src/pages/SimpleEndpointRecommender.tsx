import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EndpointRecommendation {
  endpoint: string;
  summary: string;
  matchCount: number;
  successRate?: number;
  reference?: string;
}

export default function SimpleEndpointRecommender() {
  const [indication, setIndication] = useState('');
  const [phase, setPhase] = useState('');
  const [keywords, setKeywords] = useState('');
  const [recommendations, setRecommendations] = useState<EndpointRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    if (!indication || !phase) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/endpoint/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indication, phase, keywords }),
      });

      const data = await res.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching endpoint recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-purple-700">🎯 Endpoint Recommendation</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          placeholder="Indication (e.g. Breast Cancer)"
          value={indication}
          onChange={(e) => setIndication(e.target.value)}
        />
        <Input
          placeholder="Phase (e.g. Phase 2)"
          value={phase}
          onChange={(e) => setPhase(e.target.value)}
        />
        <Input
          placeholder="Keywords (optional)"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />
      </div>

      <Button
        onClick={fetchRecommendations}
        disabled={loading || !indication || !phase}
        className="bg-purple-600 text-white hover:bg-purple-700"
      >
        {loading ? 'Loading...' : 'Get Recommendations'}
      </Button>

      {recommendations.length > 0 && (
        <div className="space-y-4 mt-6">
          {recommendations.map((rec, idx) => (
            <Card key={idx}>
              <CardContent className="p-4 space-y-2">
                <h4 className="text-lg font-semibold text-blue-800">📌 {rec.endpoint}</h4>
                <p className="text-sm text-gray-700">{rec.summary}</p>
                <p className="text-xs text-gray-500 italic">
                  Used in {rec.matchCount} past trial(s)
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}