import { useState } from 'react';
import { DocumentBrowser } from '@/components/document-management/DocumentBrowser';
import { DocumentViewer } from '@/components/document-management/DocumentViewer';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronLeft, FileText, Info, Shield } from 'lucide-react';

/**
 * Document Management Page
 * 
 * This page provides a comprehensive document management interface with:
 * - Document browsing and search
 * - Document viewing with Part 11 compliance
 * - Integrated DocuShare capabilities
 */
export default function DocumentManagement() {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewMode, setViewMode] = useState('browse'); // 'browse' or 'view'
  
  const handleSelectDocument = (document) => {
    setSelectedDocument(document);
    setViewMode('view');
  };
  
  const handleBackToBrowser = () => {
    setViewMode('browse');
  };
  
  return (
    <div className="container py-6 max-w-7xl">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {viewMode === 'browse' ? 'Regulatory Document Management' : 'Document Viewer'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {viewMode === 'browse' 
                ? 'Browse, search, and manage regulatory documents with 21 CFR Part 11 compliance'
                : selectedDocument?.name}
            </p>
          </div>
          
          {viewMode === 'view' && (
            <Button variant="outline" onClick={handleBackToBrowser}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
          )}
        </div>
        
        {viewMode === 'browse' && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">DocuShare Integration Active</AlertTitle>
            <AlertDescription className="text-blue-700">
              This system is connected to DocuShare Server ID: <span className="font-mono font-medium">TrialSAGE-DS7</span>. 
              All documents are managed in accordance with 21 CFR Part 11 requirements for electronic records and signatures.
            </AlertDescription>
          </Alert>
        )}
        
        {viewMode === 'browse' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow">
              <div className="p-6">
                <DocumentBrowser
                  onSelectDocument={handleSelectDocument}
                  defaultView="list"
                />
              </div>
            </div>
            
            <div className="rounded-lg border bg-muted p-6">
              <div className="flex items-start gap-4">
                <Shield className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="text-lg font-medium">21 CFR Part 11 Compliance</h3>
                  <p className="text-muted-foreground mt-1">
                    The integrated DocuShare system provides complete compliance with FDA 21 CFR Part 11 requirements:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>Validated electronic signature system with non-repudiation</li>
                    <li>Complete audit trails for all document activities</li>
                    <li>Secure user authentication and access controls</li>
                    <li>System validation documentation available on request</li>
                    <li>Electronic record retention and archiving</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {viewMode === 'view' && selectedDocument && (
          <DocumentViewer 
            documentId={selectedDocument.id}
            onClose={handleBackToBrowser}
          />
        )}
      </div>
    </div>
  );
}