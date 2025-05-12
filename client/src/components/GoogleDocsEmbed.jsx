import React from 'react';

const GoogleDocsEmbed = ({ documentId, documentName }) => {
  return (
    <div className="google-docs-embed">
      <iframe
        src={`https://docs.google.com/document/d/${documentId}/edit?usp=sharing&embedded=true`}
        width="100%"
        height="600px"
        frameBorder="0"
        title={documentName || "Google Document"}
      ></iframe>
    </div>
  );
};

export default GoogleDocsEmbed;