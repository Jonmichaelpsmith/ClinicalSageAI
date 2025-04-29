// client/src/components/cer/GeneratedReportPanel.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import PDFJS from 'pdfjs-dist';

PDFJS.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

export default function GeneratedReportPanel({ jobId }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cer/jobs/${jobId}/result`);
        const { downloadUrl } = await res.json();
        const pdf = await PDFJS.getDocument(downloadUrl).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = canvasRef.current;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        console.error('PDF load error', err);
        setError('Failed to load report preview.');
      } finally {
        setLoading(false);
      }
    };
    loadPdf();
  }, [jobId]);

  if (loading) return <Progress className="w-full" />;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <Card>
      <CardContent>
        <h3 className="text-lg font-semibold mb-2">Report Preview</h3>
        <canvas ref={canvasRef} className="border" />
        <div className="mt-4">
          <Button onClick={() => window.open(`/api/cer/jobs/${jobId}/result`, '_blank')}>Download Full PDF</Button>
        </div>
      </CardContent>
    </Card>
  );
}