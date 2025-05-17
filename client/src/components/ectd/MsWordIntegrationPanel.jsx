import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  FileCheck, 
  Save, 
  RotateCw, 
  History, 
  FileEdit, 
  Users, 
  ArrowLeftRight, 
  AlertCircle, 
  Download
} from 'lucide-react';

/**
 * Microsoft Word Integration Panel
 * Provides an interface for editing documents using Microsoft Word Online
 * with VAULT synchronization and version control.
 */
const MsWordIntegrationPanel = ({ documentId, onClose }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('document');
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [comments, setComments] = useState([]);
  const [versionHistory, setVersionHistory] = useState([]);

  // Simulate loading document
  useEffect(() => {
    const timer = setTimeout(() => {
      setDocument({
        id: documentId,
        title: `Document #${documentId}`,
        status: 'In Progress',
        lastModified: new Date().toLocaleDateString(),
        author: 'John Smith',
        reviewers: ['Alice Johnson', 'Bob Miller'],
        wordUrl: 'https://office.live.com/start/Word.aspx'
      });
      
      setComments([
        { id: 1, author: 'Alice Johnson', date: '05/16/2025', text: 'Please review section 3.2.P.7 for compliance with ICH guidelines.', resolved: false },
        { id: 2, author: 'Bob Miller', date: '05/15/2025', text: 'Updated per regulatory feedback on stability data format.', resolved: true },
        { id: 3, author: 'John Smith', date: '05/14/2025', text: 'Added cross-reference to section 2.3.A.', resolved: false },
      ]);
      
      setVersionHistory([
        { version: '1.3', date: '05/16/2025', author: 'John Smith', comment: 'Incorporated feedback from regulatory team' },
        { version: '1.2', date: '05/15/2025', author: 'Alice Johnson', comment: 'Updated section 3.2.P.2' },
        { version: '1.1', date: '05/14/2025', author: 'Bob Miller', comment: 'Initial draft complete' },
        { version: '1.0', date: '05/13/2025', author: 'John Smith', comment: 'Document created from template' },
      ]);
      
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [documentId]);

  // Handle save document
  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate save progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setSyncProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsSaving(false);
        setSyncProgress(0);
        
        toast({
          title: "Document Saved",
          description: "All changes have been synchronized with VAULT.",
        });
      }
    }, 300);
  };

  // Handle restore version
  const handleRestoreVersion = (version) => {
    toast({
      title: "Version Restored",
      description: `Document has been restored to version ${version}.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RotateCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p>Loading document from VAULT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Document Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b">
        <div>
          <h2 className="text-xl font-semibold">{document.title}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-muted-foreground">
              Last modified: {document.lastModified}
            </span>
            <Badge variant="outline">{document.status}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {isSaving ? (
            <div className="flex items-center gap-2">
              <Progress value={syncProgress} className="w-20 h-2" />
              <span className="text-xs text-muted-foreground">{syncProgress}%</span>
            </div>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toast({
                  title: "Document Downloaded",
                  description: "Document has been downloaded for offline editing.",
                })}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                size="sm"
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-2" />
                Save to VAULT
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Document Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="document">
            <FileEdit className="h-4 w-4 mr-2" /> Document
          </TabsTrigger>
          <TabsTrigger value="comments">
            <Users className="h-4 w-4 mr-2" /> Comments ({comments.filter(c => !c.resolved).length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" /> Version History
          </TabsTrigger>
        </TabsList>
        
        {/* Document Editing */}
        <TabsContent value="document" className="flex-1">
          <div className="border rounded-md h-full overflow-hidden">
            <iframe 
              src="https://learn.microsoft.com/en-us/office/client-developer/word/word-javascript-reference" 
              className="w-full h-full" 
              title="Microsoft Word Online" 
            />
          </div>
        </TabsContent>
        
        {/* Comments */}
        <TabsContent value="comments" className="h-full">
          <div className="border rounded-md p-4 space-y-4 h-full overflow-auto">
            {comments.map(comment => (
              <div 
                key={comment.id} 
                className={`p-3 rounded-md border ${comment.resolved ? 'bg-muted/30' : 'bg-muted/10'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">{comment.author}</div>
                  <div className="text-xs text-muted-foreground">{comment.date}</div>
                </div>
                <p className={comment.resolved ? 'text-muted-foreground' : ''}>
                  {comment.text}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <Badge variant={comment.resolved ? 'outline' : 'secondary'}>
                    {comment.resolved ? 'Resolved' : 'Open'}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const updatedComments = comments.map(c => 
                        c.id === comment.id ? {...c, resolved: !c.resolved} : c
                      );
                      setComments(updatedComments);
                    }}
                  >
                    {comment.resolved ? 'Reopen' : 'Resolve'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        {/* Version History */}
        <TabsContent value="history" className="h-full">
          <div className="border rounded-md p-4 h-full overflow-auto">
            <div className="space-y-4">
              {versionHistory.map((version, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                  <div className="bg-muted rounded-full p-2">
                    <History className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Version {version.version}</h4>
                      <span className="text-sm text-muted-foreground">{version.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {version.author} - {version.comment}
                    </p>
                    {index > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => handleRestoreVersion(version.version)}
                      >
                        <ArrowLeftRight className="h-3.5 w-3.5 mr-1" />
                        Restore this version
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Footer */}
      <div className="mt-4 border-t pt-4 flex items-center justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <FileCheck className="h-4 w-4 mr-2" />
          <span>VAULT synchronized • </span>
          <AlertCircle className="h-4 w-4 mx-2" />
          <span>All changes automatically tracked</span>
        </div>
        <Button onClick={onClose}>
          Complete Editing
        </Button>
      </div>
    </div>
  );
};

export default MsWordIntegrationPanel;