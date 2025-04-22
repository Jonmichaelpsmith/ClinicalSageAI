import { useState, useEffect, useRef } from 'react';
import { useDocuShare } from '@/hooks/useDocuShare';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  FileText, 
  Download, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  History,
  PenTool,
  Lock,
  Eye,
  Layers,
  FileSignature
} from 'lucide-react';

/**
 * Document Viewer Component
 * 
 * This component provides a 21 CFR Part 11 compliant document viewer with:
 * - PDF/Document rendering
 * - Version history and audit trails
 * - Electronic signature capabilities
 * - Metadata display
 */
export function DocumentViewer({ documentId, onClose }) {
  const {
    isLoading,
    currentDocument,
    documentContent,
    auditTrail,
    signatures,
    error,
    loadDocument,
    loadDocumentContent,
    signDocument
  } = useDocuShare();
  
  const [activeTab, setActiveTab] = useState('preview');
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [signatureReason, setSignatureReason] = useState('');
  const [signatureDetails, setSignatureDetails] = useState({
    name: '',
    title: '',
    reason: ''
  });
  
  const pdfViewerRef = useRef(null);
  
  // Load document on mount
  useEffect(() => {
    if (documentId) {
      loadDocument(documentId);
    }
  }, [documentId, loadDocument]);
  
  // Load document content when tab changes to preview
  useEffect(() => {
    if (documentId && activeTab === 'preview' && !documentContent) {
      loadDocumentContent(documentId);
    }
  }, [documentId, activeTab, documentContent, loadDocumentContent]);
  
  // Handle document signature
  const handleSignDocument = async () => {
    if (!signatureDetails.name || !signatureDetails.reason) {
      return;
    }
    
    await signDocument(documentId, {
      signedBy: signatureDetails.name,
      title: signatureDetails.title,
      reason: signatureDetails.reason,
      timestamp: new Date().toISOString()
    });
    
    setShowSignDialog(false);
    setSignatureDetails({
      name: '',
      title: '',
      reason: ''
    });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Create object URL for document content
  const getDocumentUrl = () => {
    if (!documentContent) return null;
    return URL.createObjectURL(documentContent);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-lg text-center text-muted-foreground">
            Loading document...
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Card className="w-full h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <AlertCircle className="h-8 w-8 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Failed to load document</h3>
          <p className="text-center text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => loadDocument(documentId)}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Render if no document is selected
  if (!currentDocument) {
    return (
      <Card className="w-full h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <FileText className="h-8 w-8 text-muted-foreground mb-4" />
          <p className="text-lg text-center text-muted-foreground">
            Select a document to view
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{currentDocument.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <FileText className="h-4 w-4 mr-1" />
              {currentDocument.documentType} 
              <span className="mx-2">•</span>
              <Clock className="h-4 w-4 mr-1" />
              Last modified: {formatDate(currentDocument.lastModified || currentDocument.uploadDate)}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {signatures.length > 0 && (
              <Badge variant="outline" className="flex items-center gap-1 bg-green-50">
                <FileSignature className="h-3 w-3" />
                Signed
              </Badge>
            )}
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${
                currentDocument.controlStatus === 'Approved' ? 'bg-green-50' :
                currentDocument.controlStatus === 'In-Review' ? 'bg-blue-50' :
                currentDocument.controlStatus === 'Draft' ? 'bg-gray-50' :
                'bg-yellow-50'
              }`}
            >
              {currentDocument.controlStatus}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start px-6">
          <TabsTrigger value="preview" className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center">
            <Layers className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center">
            <History className="h-4 w-4 mr-2" />
            Audit Trail
          </TabsTrigger>
          <TabsTrigger value="signatures" className="flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            Signatures
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="mt-0 p-6 pt-0">
          <div className="flex justify-end mb-2">
            {documentContent && (
              <a 
                href={getDocumentUrl()} 
                download={currentDocument.name}
                className="inline-flex"
              >
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </a>
            )}
          </div>
          
          {documentContent ? (
            <div 
              ref={pdfViewerRef}
              className="border rounded-md overflow-hidden h-[calc(100vh-270px)]"
            >
              <iframe 
                src={getDocumentUrl()} 
                className="w-full h-full"
                title={currentDocument.name}
              />
            </div>
          ) : (
            <div className="border rounded-md flex items-center justify-center h-[calc(100vh-270px)]">
              <RefreshCw className="h-6 w-6 animate-spin text-primary mb-4" />
              <p className="ml-2">Loading document preview...</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="details" className="mt-0 p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Document Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Document Name</span>
                    <span className="text-sm col-span-2">{currentDocument.name}</span>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Document Type</span>
                    <span className="text-sm col-span-2">{currentDocument.documentType}</span>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">File Size</span>
                    <span className="text-sm col-span-2">
                      {(currentDocument.fileSize / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Creation Date</span>
                    <span className="text-sm col-span-2">
                      {formatDate(currentDocument.uploadDate)}
                    </span>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Last Modified</span>
                    <span className="text-sm col-span-2">
                      {formatDate(currentDocument.lastModified || currentDocument.uploadDate)}
                    </span>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Version</span>
                    <span className="text-sm col-span-2">
                      {currentDocument.version || '1.0'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Regulatory Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Control Status</span>
                    <span className="text-sm col-span-2">
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1 ${
                          currentDocument.controlStatus === 'Approved' ? 'bg-green-50' :
                          currentDocument.controlStatus === 'In-Review' ? 'bg-blue-50' :
                          currentDocument.controlStatus === 'Draft' ? 'bg-gray-50' :
                          'bg-yellow-50'
                        }`}
                      >
                        {currentDocument.controlStatus}
                      </Badge>
                    </span>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Confidentiality</span>
                    <span className="text-sm col-span-2">
                      {currentDocument.confidentiality || 'Confidential'}
                    </span>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Regulatory Phase</span>
                    <span className="text-sm col-span-2">
                      {currentDocument.regulatoryPhase || 'N/A'}
                    </span>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Document ID</span>
                    <span className="text-sm col-span-2 font-mono">
                      {currentDocument.id}
                    </span>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Signatures</span>
                    <span className="text-sm col-span-2">
                      {signatures.length || 0} signature(s)
                    </span>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Part 11 Compliant</span>
                    <span className="text-sm col-span-2 flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                      Yes
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="audit" className="mt-0 p-6 pt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Document Audit Trail</CardTitle>
              <CardDescription>
                Complete audit history for 21 CFR Part 11 compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-350px)]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditTrail && auditTrail.length > 0 ? (
                      auditTrail.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{entry.action}</TableCell>
                          <TableCell>{formatDate(entry.timestamp)}</TableCell>
                          <TableCell>{entry.user}</TableCell>
                          <TableCell>{entry.details}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No audit trail entries found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="signatures" className="mt-0 p-6 pt-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Electronic Signatures</h3>
            
            <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
              <DialogTrigger asChild>
                <Button>
                  <PenTool className="h-4 w-4 mr-2" />
                  Sign Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Apply Electronic Signature</DialogTitle>
                  <DialogDescription>
                    This will apply a 21 CFR Part 11 compliant electronic signature.
                    Your signature is legally binding.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="signature-name" className="text-sm font-medium">Full Name</label>
                    <input
                      id="signature-name"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Your full name"
                      value={signatureDetails.name}
                      onChange={(e) => setSignatureDetails({...signatureDetails, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="signature-title" className="text-sm font-medium">Title/Position</label>
                    <input
                      id="signature-title"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Your title or position"
                      value={signatureDetails.title}
                      onChange={(e) => setSignatureDetails({...signatureDetails, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="signature-reason" className="text-sm font-medium">Reason for Signing</label>
                    <select
                      id="signature-reason"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={signatureDetails.reason}
                      onChange={(e) => setSignatureDetails({...signatureDetails, reason: e.target.value})}
                    >
                      <option value="">Select a reason</option>
                      <option value="I am the author of this document">I am the author of this document</option>
                      <option value="I have reviewed this document">I have reviewed this document</option>
                      <option value="I approve this document">I approve this document</option>
                      <option value="I am acknowledging receipt of this document">I am acknowledging receipt</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  {signatureDetails.reason === 'Other' && (
                    <div className="grid gap-2">
                      <label htmlFor="signature-reason-other" className="text-sm font-medium">Specify Reason</label>
                      <input
                        id="signature-reason-other"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Specify reason for signature"
                        value={signatureReason}
                        onChange={(e) => setSignatureReason(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <div className="border rounded-md p-3 bg-muted/50">
                    <p className="text-sm font-medium mb-2">Electronic Signature Attestation</p>
                    <p className="text-xs text-muted-foreground">
                      By clicking "Sign Document" below, I understand that my electronic signature 
                      is legally binding, equivalent to my handwritten signature, and complies with 
                      21 CFR Part 11 requirements. I certify that I am the person identified above.
                    </p>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSignDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSignDocument}
                    disabled={!signatureDetails.name || !signatureDetails.reason}
                  >
                    Sign Document
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signatures && signatures.length > 0 ? (
                    signatures.map((signature, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{signature.signedBy}</TableCell>
                        <TableCell>{signature.title}</TableCell>
                        <TableCell>{formatDate(signature.timestamp)}</TableCell>
                        <TableCell>{signature.reason}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-50 text-green-800 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Valid
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No signatures have been applied to this document.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">21 CFR Part 11 Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Electronic Signatures</p>
                      <p className="text-xs text-muted-foreground">
                        All signatures are compliant with 21 CFR Part 11 requirements and include
                        time stamps, user identification, and signature meaning.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Audit Trails</p>
                      <p className="text-xs text-muted-foreground">
                        Complete audit trails are maintained for all activities, including creation, 
                        modification, and approval of documents.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">System Validation</p>
                      <p className="text-xs text-muted-foreground">
                        DocuShare has been validated according to regulatory requirements to
                        ensure accurate, reliable, and consistent performance.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Access Controls</p>
                      <p className="text-xs text-muted-foreground">
                        System ensures that only authorized individuals can access, modify,
                        and sign documents through role-based permissions.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="justify-between pt-0">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        
        <div className="flex gap-2">
          {activeTab === 'preview' && documentContent && (
            <a 
              href={getDocumentUrl()} 
              download={currentDocument.name}
              className="inline-flex"
            >
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </a>
          )}
          
          {activeTab !== 'signatures' && (
            <Button onClick={() => setActiveTab('signatures')}>
              <FileSignature className="h-4 w-4 mr-2" />
              Sign Document
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}