import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import axios from 'axios';

export default function GenerateFullCerButton({ onJobCreated }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/cer/generate', {
        deviceId: 'DEV-12345',
        templateId: 'TEMPLATE-1',
      });
      
      if (res.data && res.data.jobId) {
        if (onJobCreated) onJobCreated(res.data.jobId);
      }
    } catch (err) {
      console.error('Failed to generate CER', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      size="lg" 
      onClick={handleClick} 
      disabled={loading}
      className="gap-2"
    >
      <FileText size={18} />
      {loading ? 'Generating...' : 'Generate Report'}
    </Button>
  );
}