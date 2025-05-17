import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, Loader2, FileText } from 'lucide-react';
import { openWordDocument, getDocumentContent, saveDocument } from '../services/wordIntegration';

const MsWordPopupEditor = ({ open, onOpenChange, initialContent = '', documentTitle = 'Microsoft Word Document', onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      openWordDocument(initialContent)
        .catch(err => console.error('Error opening Word document:', err))
        .finally(() => setIsLoading(false));
    }
  }, [open, initialContent]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const content = await getDocumentContent();
      await saveDocument('docx');
      if (onSave) {
        onSave(content);
      }
    } catch (err) {
      console.error('Error saving Word document:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-[90%] w-[1200px]">
      <DialogContent className="max-w-[90%] w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {documentTitle}
          </DialogTitle>
        </DialogHeader>

        <div id="word-frame-container" className="border rounded-md h-[600px] w-full">
          {isLoading && (
            <div className="p-4 text-center text-sm text-slate-500">Loading Microsoft Word...</div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handleSave} disabled={isSaving} className="ml-2">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MsWordPopupEditor;
