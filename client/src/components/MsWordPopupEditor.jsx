import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Office365WordEmbed from './Office365WordEmbed';

const MsWordPopupEditor = ({ documentUrl, documentId, onOpen, onSave }) => {
  useEffect(() => {
    if (onOpen) {
      onOpen();
    }
  }, [onOpen]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <Office365WordEmbed documentUrl={documentUrl} documentId={documentId} />
      </div>
      {onSave && (
        <div className="flex justify-end mt-3">
          <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default MsWordPopupEditor;
