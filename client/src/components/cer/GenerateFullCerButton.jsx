import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FilePlus2 } from 'lucide-react';
import axios from 'axios';

/**
 * Button to generate a full CER document
 * 
 * This component triggers the generation of a Clinical Evaluation Report
 * using the specified product, template, and metadata.
 */
export default function GenerateFullCerButton({ 
  productId, 
  templateId, 
  metadata = {},
  onSuccess = () => {}
}) {
  const [loading, setLoading] = useState(false);
  
  const generateCER = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would make an API call to start the generation
      // const response = await axios.post('/api/cer/generate', {
      //   productId,
      //   templateId,
      //   metadata
      // });
      
      // Mock successful generation with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate a job id being returned
      const jobId = `JOB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Call the success callback with the job ID
      onSuccess(jobId);
    } catch (error) {
      console.error('Failed to generate CER', error);
      alert('There was an error generating the CER. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={generateCER} 
      className="gap-2"
      disabled={loading}
    >
      <FilePlus2 size={16} />
      {loading ? 'Generating...' : 'Generate CER'}
    </Button>
  );
}