// /client/src/pages/VaultPage.jsx

import { useState } from 'react';
import VaultUploader from '../components/vault/VaultUploader';
import VaultDocumentViewer from '../components/vault/VaultDocumentViewer';

export default function VaultPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger document list refresh after upload
  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">TrialSage Vault™</h1>
        <p className="text-gray-600 mt-2">Secure Document Repository for Regulatory Submissions</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <VaultUploader onUploadComplete={handleUploadComplete} />
        </div>
        
        <div className="lg:col-span-2">
          <VaultDocumentViewer key={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}