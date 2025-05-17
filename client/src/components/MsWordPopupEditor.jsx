import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import * as wordIntegration from '../services/wordIntegration';
import * as microsoftAuthService from '../services/microsoftAuthService';
import * as msOfficeVaultBridge from '../services/msOfficeVaultBridge';

/**
 * Popup editor that embeds Microsoft Word Online using Office JS.
 * Handles Microsoft authentication and saves back to the VAULT store.
 */
const MsWordPopupEditor = ({
  open,
  onOpenChange,
  vaultId,
  title = 'Document'
}) => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(microsoftAuthService.isAuthenticated());
  const [documentUrl, setDocumentUrl] = useState(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        await wordIntegration.initializeOfficeJS();
        if (vaultId) {
          const blob = await msOfficeVaultBridge.downloadDocxFromVault(vaultId);
          const url = URL.createObjectURL(blob);
          setDocumentUrl(url);
        }
      } catch (err) {
        console.error('Failed to initialize Word editor:', err);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      if (documentUrl) URL.revokeObjectURL(documentUrl);
    };
  }, [open, vaultId]);

  const handleSignIn = () => {
    microsoftAuthService.login();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const content = await wordIntegration.getDocumentContent();
      const file = new File([content], `${title}.docx`, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      await msOfficeVaultBridge.uploadDocxToVault(file, { title });
      if (onOpenChange) onOpenChange(false);
    } catch (err) {
      console.error('Error saving Word document:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Microsoft Word - {title}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          </div>
        ) : isAuthenticated ? (
          <div className="h-[70vh]" id="word-frame-container">
            {documentUrl && (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documentUrl)}`}
                title="Word Online"
                width="100%"
                height="100%"
                frameBorder="0"
              />
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="mb-4">Sign in with Microsoft to edit this document.</p>
            <Button onClick={handleSignIn}>Sign in with Microsoft</Button>
          </div>
        )}
        <DialogFooter>
          {isAuthenticated && (
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 mr-2">
              Save to VAULT
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MsWordPopupEditor;
