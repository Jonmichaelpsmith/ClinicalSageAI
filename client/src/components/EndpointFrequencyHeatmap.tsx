import { useEffect, useState } from 'react';
import HeatMap from 'react-heatmap-grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface EndpointData {
  indication: string;
  phase: string;
  type: string; // 'Primary' or 'Secondary'
  count: number;
  per100: number;
}

interface EndpointFrequencyHeatmapProps {
  indication?: string;
  phase?: string;
}

export default function EndpointFrequencyHeatmap({ indication, phase }: EndpointFrequencyHeatmapProps) {
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);
  const [phases, setPhases] = useState<string[]>([]);
  const [indications, setIndications] = useState<string[]>([]);
  const [viewType, setViewType] = useState('per100'); // 'per100' or 'raw'
  const [endpointType, setEndpointType] = useState('All'); // 'Primary', 'Secondary', 'All'
  const [rawData, setRawData] = useState<EndpointData[]>([]);

  useEffect(() => {
    const fetchHeatmap = async () => {
      setLoading(true);
      try {
        // Build URL with query parameters if provided
        const url = new URL('/api/endpoint/frequency-heatmap', window.location.origin);
        if (indication) url.searchParams.append('indication', indication);
        if (phase) url.searchParams.append('phase', phase);
        
        const response = await fetch(url.toString());
        const data: EndpointData[] = await response.json();
        
        // Store raw data for filtering later
        setRawData(data);
        
        // Process the data based on current filters
        processData(data);
      } catch (error) {
        console.error("Error fetching heatmap data:", error);
        setLoading(false);
      }
    };
    
    fetchHeatmap();
  }, [indication, phase]);

  // Process data when filter settings change
  useEffect(() => {
    if (rawData.length > 0) {
      processData(rawData);
    }
  }, [viewType, endpointType, rawData]);

  const processData = (data: EndpointData[]) => {
    // Filter by endpoint type if specified
    const filtered = data.filter(row => 
      endpointType === 'All' || row.type === endpointType
    );

    // Extract unique phases and indications
    const uniquePhases = [...new Set(filtered.map(row => row.phase))].sort();
    const uniqueIndications = [...new Set(filtered.map(row => row.indication))].sort();
    
    // Build matrix based on the selected view type
    const matrix = uniqueIndications.map(indication =>
      uniquePhases.map(phase => {
        const rows = filtered.filter(d => d.phase === phase && d.indication === indication);
        if (rows.length === 0) return 0;
        
        // Sum up values based on view type
        if (viewType === 'per100') {
          // Average the per100 values for all matching rows
          return rows.reduce((sum, row) => sum + row.per100, 0) / rows.length;
        } else {
          // Sum the raw counts
          return rows.reduce((sum, row) => sum + row.count, 0);
        }
      })
    );
    
    setPhases(uniquePhases);
    setIndications(uniqueIndications);
    setHeatmapData(matrix);
    setLoading(false);
  };

  // Find the maximum value to normalize the heatmap colors
  const maxValue = heatmapData.length > 0 
    ? Math.max(...heatmapData.flatMap(row => row))
    : viewType === 'per100' ? 100 : 50;

  if (loading) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Endpoint Frequency Heatmap</CardTitle>
        <CardDescription>
          Visualizing endpoint usage across phases and indications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Button 
            onClick={() => setViewType(viewType === 'per100' ? 'raw' : 'per100')}
            variant="outline"
            className={viewType === 'per100' ? "bg-blue-100" : ""}
          >
            {viewType === 'per100' ? '✓ Per 100 Trials' : 'Raw Count'}
          </Button>
          <Button 
            onClick={() => setEndpointType('All')}
            variant="outline"
            className={endpointType === 'All' ? "bg-blue-100" : ""}
          >
            All Endpoints
          </Button>
          <Button 
            onClick={() => setEndpointType('Primary')}
            variant="outline"
            className={endpointType === 'Primary' ? "bg-blue-100" : ""}
          >
            Primary Only
          </Button>
          <Button 
            onClick={() => setEndpointType('Secondary')}
            variant="outline"
            className={endpointType === 'Secondary' ? "bg-blue-100" : ""}
          >
            Secondary Only
          </Button>
        </div>

        {heatmapData.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <HeatMap
              xLabels={phases}
              yLabels={indications}
              data={heatmapData}
              squares
              cellStyle={(background, value) => {
                // Normalize color intensity based on view type
                const normalizedValue = viewType === 'per100' 
                  ? Math.min(value / 100, 1) 
                  : Math.min(value / maxValue, 1);
                
                return {
                  background: `rgba(66, 90, 245, ${normalizedValue})`,
                  fontSize: '12px',
                  color: normalizedValue > 0.5 ? '#fff' : '#000',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                };
              }}
              cellRender={value => (
                <div>
                  {viewType === 'per100' 
                    ? value.toFixed(1) 
                    : value.toFixed(0)}
                </div>
              )}
              xLabelsStyle={() => ({
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: '#666'
              })}
              yLabelsStyle={() => ({
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: '#666',
                paddingRight: '10px'
              })}
            />
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500 italic">
            No data available for the selected filters
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-500">
          <p className="font-semibold">Understanding the visualization:</p>
          <p>• {viewType === 'per100' ? 'Values show endpoint frequency per 100 trials' : 'Values show raw count of endpoints'}</p>
          <p>• Currently showing: {endpointType === 'All' ? 'All endpoint types' : `${endpointType} endpoints only`}</p>
          <p>• Darker blue indicates higher frequency</p>
        </div>
      </CardContent>
    </Card>
  );
}