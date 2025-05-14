import React, { useState } from 'react';
import { lazy, Suspense } from 'react';
import DocTypeSwitcher from '@/components/510k/DocTypeSwitcher';
import { DocumentContextProvider } from '@/components/510k/About510kDialog';

// Import the original CERV2Page
const OriginalCERV2Page = lazy(() => import('./CERV2Page'));

/**
 * CERV2PageWrapper
 * 
 * This component wraps the protected CERV2Page.jsx component and adds
 * document type switching functionality without modifying the protected file.
 * 
 * It handles the document type state and passes it to both:
 * 1. The original CERV2Page component
 * 2. The About510kDialog component via DocumentContextProvider
 */
function CERV2PageWrapper() {
  // State for document type switching
  const [documentType, setDocumentType] = useState('cer'); // options: 'cer' or '510k'
  const [title, setTitle] = useState('Clinical Evaluation Report');

  return (
    <div className="relative">
      {/* Add the document type switcher at the top */}
      <div className="mb-4 p-2 bg-white shadow rounded-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <DocumentContextProvider 
          value={{
            documentType,
            setDocumentType,
            title,
            setTitle
          }}
        >
          <DocTypeSwitcher 
            documentType={documentType}
            setDocumentType={setDocumentType}
            title={title}
            setTitle={setTitle}
            className="ml-auto"
          />
        </DocumentContextProvider>
      </div>

      {/* Render the original CERV2Page component */}
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
        <OriginalCERV2Page 
          documentType={documentType} 
          setDocumentType={setDocumentType} 
          title={title}
          setTitle={setTitle}
        />
      </Suspense>
    </div>
  );
}

export default CERV2PageWrapper;