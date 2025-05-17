import React from 'react';
import Office365WordEmbed from './Office365WordEmbed';
import { Button } from '@/components/ui/button';
import * as vaultBridge from '../services/msOfficeVaultBridge';

const MsWordPopupEditor = ({ documentId, editUrl, accessToken, onSave, onClose }) => {
  const handleSave = async () => {
    try {
      const blob = await vaultBridge.fetchUpdatedDocx({ documentId, accessToken });
      if (onSave) onSave(blob);
    } catch (err) {
      console.error('Failed to fetch updated DOCX:', err);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex-1">
        <Office365WordEmbed documentId={documentId} documentUrl={editUrl} authToken={accessToken} />
      </div>
      <div className="flex justify-end space-x-2">
        <Button onClick={handleSave}>Save</Button>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default MsWordPopupEditor;
