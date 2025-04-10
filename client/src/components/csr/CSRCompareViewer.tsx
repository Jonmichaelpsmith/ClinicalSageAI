// React Component: CSRCompareViewer.tsx
// Side-by-side comparison of selected CSRs from API data

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface CSRCompareViewerProps {
  selectedIds: string[];
  onClose?: () => void;
}

export default function CSRCompareViewer({ selectedIds = [], onClose }: CSRCompareViewerProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCSRs = async () => {
      setLoading(true);
      try {
        const loaded = await Promise.all(
          selectedIds.map(async (id) => {
            const res = await axios.get(`/api/csrs/${id}`);
            return { id, ...res.data };
          })
        );
        setData(loaded);
      } catch (error) {
        console.error("Error fetching CSR data:", error);
        toast({
          title: "Error loading CSR data",
          description: "There was a problem retrieving the clinical study reports.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedIds.length) fetchCSRs();
  }, [selectedIds, toast]);

  const renderField = (label: string, key: string) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm py-3 border-b">
      <strong className="col-span-1 text-muted-foreground flex items-center">{label}</strong>
      {data.map((d) => (
        <div key={d.id + key} className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
          {Array.isArray(d[key]) 
            ? d[key].join(', ') 
            : (d[key] || '—')}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Loading CSR data for comparison...</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Select clinical study reports to compare.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">📊 Compare Clinical Study Reports</h3>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
      
      <Card>
        <CardContent className="space-y-2 pt-6">
          {renderField('CSR ID', 'csr_id')}
          {renderField('Title', 'title')}
          {renderField('Indication', 'indication')}
          {renderField('Phase', 'phase')}
          {renderField('Study Type', 'study_type')}
          {renderField('Sponsor', 'sponsor')}
          {renderField('Date', 'date')}
          {renderField('Sample Size', 'sample_size')}
          {renderField('Arms', 'arms')}
          {renderField('Primary Endpoints', 'primary_endpoints')}
          {renderField('Secondary Endpoints', 'secondary_endpoints')}
          {renderField('Outcome', 'outcome')}
          {renderField('Adverse Events', 'common_adverse_events')}
        </CardContent>
      </Card>
    </div>
  );
}