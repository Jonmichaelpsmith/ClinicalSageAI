import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HeatMapGrid } from 'react-grid-heatmap';
import { Loader2 } from 'lucide-react';

interface EndpointData {
  phase: string;
  indication: string;
  endpoint: string;
  count: number;
}

interface HeatmapData {
  phases: string[];
  indications: string[];
  data: number[][];
  endpointNames: string[][];
}

interface EndpointFrequencyHeatmapProps {
  indication?: string;
  phase?: string;
}

export default function EndpointFrequencyHeatmap({ indication, phase }: EndpointFrequencyHeatmapProps) {
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<HeatmapData>({
    phases: [],
    indications: [],
    data: [],
    endpointNames: []
  });

  useEffect(() => {
    const fetchHeatmapData = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would include query params for indication and phase
        const url = new URL('/api/endpoint/frequency-heatmap', window.location.origin);
        if (indication) url.searchParams.append('indication', indication);
        if (phase) url.searchParams.append('phase', phase);
        
        const response = await fetch(url.toString());
        const data: EndpointData[] = await response.json();
        
        // Process the data for the heatmap
        const uniquePhases = [...new Set(data.map(row => row.phase))].sort();
        const uniqueIndications = [...new Set(data.map(row => row.indication))].sort();
        
        // Build frequency matrix
        const matrix: number[][] = [];
        const endpointMatrix: string[][] = [];
        
        uniqueIndications.forEach((ind, i) => {
          matrix[i] = [];
          endpointMatrix[i] = [];
          
          uniquePhases.forEach((ph, j) => {
            // Find all entries for this phase and indication
            const entries = data.filter(d => d.phase === ph && d.indication === ind);
            const totalCount = entries.reduce((sum, entry) => sum + entry.count, 0);
            matrix[i][j] = totalCount;
            
            // Get the most common endpoint name for this combination
            if (entries.length > 0) {
              const mostCommonEndpoint = entries.reduce((prev, current) => 
                prev.count > current.count ? prev : current
              );
              endpointMatrix[i][j] = mostCommonEndpoint.endpoint;
            } else {
              endpointMatrix[i][j] = 'N/A';
            }
          });
        });
        
        setHeatmapData({
          phases: uniquePhases,
          indications: uniqueIndications,
          data: matrix,
          endpointNames: endpointMatrix
        });
        
      } catch (error) {
        console.error("Error fetching heatmap data:", error);
        // Fallback to sample data if API fails
        const sampleData = generateSampleHeatmapData();
        setHeatmapData(sampleData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHeatmapData();
  }, [indication, phase]);

  // Function to generate sample heatmap data as fallback
  const generateSampleHeatmapData = (): HeatmapData => {
    // Default phases and indications
    const phases = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'];
    const indications = [
      'Oncology', 
      'Cardiovascular', 
      'Neurology', 
      'Immunology', 
      'Infectious Disease',
      'Metabolic Disorders'
    ];

    // Common endpoints by indication
    const endpointsByIndication: Record<string, string[]> = {
      'Oncology': ['Overall Survival', 'Progression-Free Survival', 'Objective Response Rate'],
      'Cardiovascular': ['MACE', 'Blood Pressure Change', 'Exercise Capacity'],
      'Neurology': ['EDSS Score', 'Relapse Rate', 'Cognitive Function'],
      'Immunology': ['ACR20/50/70', 'DAS28', 'Joint Pain Score'],
      'Infectious Disease': ['Viral Load', 'Pathogen Clearance', 'Symptom Resolution'],
      'Metabolic Disorders': ['HbA1c Change', 'Fasting Glucose', 'Body Weight']
    };

    // Generate frequency data and endpoint names
    const data: number[][] = [];
    const endpointNames: string[][] = [];

    indications.forEach((ind, i) => {
      data[i] = [];
      endpointNames[i] = [];
      
      phases.forEach((ph, j) => {
        // Create sample distribution with higher counts in Phase 2 & 3
        let count = 10; // base count
        
        // Phase-based adjustments
        if (ph === 'Phase 1') count += 5;
        else if (ph === 'Phase 2') count += 25;
        else if (ph === 'Phase 3') count += 30;
        else if (ph === 'Phase 4') count += 15;
        
        // Indication-based adjustments
        if (ind === 'Oncology' || ind === 'Cardiovascular') count += 10;
        
        // Filters based on user selection
        if (indication && ind === indication) count += 15;
        if (phase && ph === phase) count += 15;
        
        data[i][j] = count;
        
        // Assign endpoint name
        const possibleEndpoints = endpointsByIndication[ind] || ['Generic Endpoint'];
        const endpointIndex = Math.floor((i + j) % possibleEndpoints.length);
        endpointNames[i][j] = possibleEndpoints[endpointIndex];
      });
    });

    return {
      phases,
      indications,
      data,
      endpointNames
    };
  };

  // Find the maximum value to normalize the heatmap
  const maxValue = heatmapData.data.length > 0 
    ? Math.max(...heatmapData.data.flatMap(row => row))
    : 100;

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
          Visualizing endpoint usage frequency across phases and indications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <HeatMapGrid
            data={heatmapData.data}
            xLabels={heatmapData.phases}
            yLabels={heatmapData.indications}
            cellStyle={(x, y, value) => {
              // Normalize the value relative to the maximum
              const ratio = maxValue > 0 ? value / maxValue : 0;
              return {
                background: `rgba(66, 145, 245, ${ratio})`,
                fontSize: '12px',
                color: ratio > 0.5 ? '#fff' : '#000'
              };
            }}
            cellRender={(x, y, value) => (
              <div 
                className="w-full h-full flex items-center justify-center p-2" 
                title={`${heatmapData.endpointNames[y][x]}: ${value} trials`}
              >
                {value}
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
            square
          />
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p>Hover over cells to see the most common endpoint and trial count for that phase and indication.</p>
          <p>Darker blue indicates higher frequency of endpoint usage in clinical trials.</p>
        </div>
      </CardContent>
    </Card>
  );
}