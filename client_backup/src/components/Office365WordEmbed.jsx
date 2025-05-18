import React from 'react';

const Office365WordEmbed = ({ documentId, documentUrl, authToken }) => {
  return (
    <div className="office365-word-embed">
      <iframe
        src={documentUrl || `https://office.com/word/edit/${documentId}`}
        width="100%"
        height="600px"
        frameBorder="0"
        title="Microsoft Word Document"
      ></iframe>
    </div>
  );
};

export default Office365WordEmbed;