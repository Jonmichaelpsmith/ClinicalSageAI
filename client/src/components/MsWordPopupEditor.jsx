import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Office365WordEmbed from './Office365WordEmbed';
import * as wordIntegration from '@/services/wordIntegration';
import * as msCopilotService from '@/services/msCopilotService';

const MsWordPopupEditor = ({ open, onOpenChange, documentId, documentUrl }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [checking, setChecking] = useState(false);

  const runFormattingCheck = async () => {
    try {
      setChecking(true);
      const content = await wordIntegration.getDocumentContent();
      const result = await msCopilotService.getFormattingRecommendations(content, 'regulatory');
      setRecommendations(result.recommendations || []);
    } catch (err) {
      console.error('Formatting check failed:', err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl">
        <DialogHeader>
          <DialogTitle>Microsoft Word Editor</DialogTitle>
        </DialogHeader>
        <div className="mb-4 h-[600px]">
          <Office365WordEmbed documentId={documentId} documentUrl={documentUrl} />
        </div>
        {recommendations.length > 0 && (
          <div className="mb-4 p-3 border rounded-md bg-gray-50 text-sm">
            <p className="font-medium mb-2">Formatting Recommendations:</p>
            <ul className="list-disc ml-5 space-y-1">
              {recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
        <DialogFooter>
          <Button onClick={runFormattingCheck} disabled={checking} className="mr-2">
            {checking ? 'Checking...' : 'Run Formatting Check'}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MsWordPopupEditor;
