import React, { useEffect } from 'react';

const MsWordPopupEditor = ({ url, onClose }) => {
  useEffect(() => {
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  return (
    <div className="ms-word-popup-editor">
      <iframe
        src={url}
        width="100%"
        height="600px"
        frameBorder="0"
        title="Microsoft Word Document"
      ></iframe>
      {onClose && (
        <button className="mt-2" onClick={onClose}>
          Close
        </button>
      )}
    </div>
  );
};

export default MsWordPopupEditor;
