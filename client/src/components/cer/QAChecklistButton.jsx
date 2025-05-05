import React from 'react';
import { Button } from '@/components/ui/button';
import { Clipboard, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQAChecklistPDF } from '../../utils/generateQAChecklistPDF';

/**
 * QA Checklist Download Button Component
 * 
 * Provides an interface for stakeholders to download the QA checklist for offline review
 */
export default function QAChecklistButton({ variant = 'default', size = 'default' }) {
  const { toast } = useToast();
  
  const handleDownload = () => {
    try {
      generateQAChecklistPDF();
      
      toast({
        title: 'QA Checklist Downloaded',
        description: 'The QA checklist has been downloaded as a PDF file.',
      });
    } catch (error) {
      console.error('Error generating QA checklist PDF:', error);
      
      toast({
        title: 'Download Failed',
        description: 'Failed to generate the QA checklist PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      className="flex items-center gap-2"
    >
      <Clipboard className="h-4 w-4" />
      <span className="hidden sm:inline">QA Checklist</span>
      <Download className="h-3 w-3 ml-1" />
    </Button>
  );
}
