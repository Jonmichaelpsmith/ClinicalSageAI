import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function GeneratedReportPanel({ jobId }) {
  const [loading, setLoading] = useState(false);

  // In a real implementation, we would load the PDF with pdfjs-dist
  // and render it on a canvas element
  
  const handleDownload = () => {
    // In a real implementation, this would download the PDF
    window.open(`/api/cer/jobs/${jobId || 'JOB-12345'}/download`, '_blank');
  };

  if (loading) return <Progress className="w-full" />;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Report Preview</h3>
          <Button 
            onClick={handleDownload} 
            className="gap-2"
          >
            <Download size={16} />
            Download PDF
          </Button>
        </div>
        
        <div className="border rounded-md p-8 bg-slate-50 min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h4 className="text-xl font-bold mb-2">Clinical Evaluation Report</h4>
            <p className="mb-4 text-muted-foreground">Device: Enzymex Forte</p>
            <p className="max-w-md mx-auto">
              This preview shows the first page of your generated Clinical Evaluation Report. 
              The full document includes comprehensive analysis according to regulatory requirements.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}