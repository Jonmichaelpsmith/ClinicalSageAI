import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Office365WordEmbed from './Office365WordEmbed';
import { getDocumentContent, formatDocumentSections } from '@/services/wordIntegration';
import { getFormattingRecommendations } from '@/services/msCopilotService';

const MsWordPopupEditor = ({ open, onOpenChange, documentId, documentUrl }) => {
  const [formattingLoading, setFormattingLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const runFormattingCheck = async () => {
    try {
      setFormattingLoading(true);
      const content = await getDocumentContent();
      const result = await getFormattingRecommendations(content, 'regulatory');
      setRecommendations(result.recommendations || []);
    } catch (err) {
      console.error('Formatting check failed:', err);
    } finally {
      setFormattingLoading(false);
    }
  };

  const applyAutoFormat = async () => {
    try {
      setFormattingLoading(true);
      await formatDocumentSections();
    } catch (err) {
      console.error('Auto format failed:', err);
    } finally {
      setFormattingLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Microsoft Word</DialogTitle>
          <DialogDescription>Embedded Microsoft Word editor</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <Office365WordEmbed documentId={documentId} documentUrl={documentUrl} />
          {recommendations.length > 0 && (
            <div className="border rounded-md p-3 bg-slate-50">
              <p className="font-medium mb-2">Formatting Recommendations</p>
              <ul className="list-disc pl-4 text-sm space-y-1">
                {recommendations.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={runFormattingCheck} disabled={formattingLoading} className="mr-2">
            {formattingLoading ? 'Checking...' : 'Check Formatting'}
          </Button>
          <Button onClick={applyAutoFormat} disabled={formattingLoading} className="mr-2" variant="outline">
            Auto Format
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MsWordPopupEditor;
