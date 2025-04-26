import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button
} from '@/components/ui';
import { X } from 'lucide-react';
import DocumentVersionHistory from './DocumentVersionHistory';

/**
 * Document Version Dialog Component
 * Modal dialog for managing document versions
 * 
 * @param {boolean} open - Whether the dialog is open
 * @param {function} onOpenChange - Function to call when open state changes
 * @param {string} documentId - The ID of the document
 * @param {string} documentName - The name of the document
 * @param {object} currentUser - The current user object
 */
export function DocumentVersionDialog({
  open,
  onOpenChange,
  documentId,
  documentName,
  currentUser
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80vw] h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-semibold">Version History</DialogTitle>
            <DialogDescription>
              Manage versions for document: {documentName}
            </DialogDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4"
          >
            <X size={18} />
          </Button>
        </DialogHeader>
        
        <div className="flex-grow overflow-hidden">
          <DocumentVersionHistory 
            documentId={documentId} 
            onClose={() => onOpenChange(false)}
            currentUser={currentUser}
          />
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DocumentVersionDialog;