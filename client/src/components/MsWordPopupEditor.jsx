import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Office365WordEmbed from './Office365WordEmbed';

/**
 * Popup editor that hosts Microsoft Word Online
 *
 * Props:
 * - open: whether the dialog is open
 * - onOpenChange: callback when dialog open state changes
 * - documentId: vault document id
 * - documentUrl: URL to load in the Word iframe
 * - onOpen: called when the dialog opens
 * - onSave: called when the user clicks Save
 */
const MsWordPopupEditor = ({
  open,
  onOpenChange,
  documentId,
  documentUrl,
  onOpen,
  onSave,
}) => {
  useEffect(() => {
    if (open && onOpen) {
      onOpen();
    }
  }, [open, onOpen]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-[90%] w-[1200px]">
      <DialogContent className="max-w-[90%] w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">Microsoft Word Online</DialogTitle>
          <DialogDescription>Edit your document using Microsoft Word Online.</DialogDescription>
        </DialogHeader>
        <div className="border rounded-md mt-2">
          <Office365WordEmbed documentId={documentId} documentUrl={documentUrl} />
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={onSave} className="bg-green-600 hover:bg-green-700 mr-2">
            Save
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MsWordPopupEditor;
