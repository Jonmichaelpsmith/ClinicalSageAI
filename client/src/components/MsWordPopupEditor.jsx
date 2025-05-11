/**
 * Microsoft Word Popup Editor Component
 * 
 * This component provides a Microsoft Word Online integration experience
 * within a popup dialog, allowing users to edit documents using the
 * familiar Word interface while maintaining integration with the
 * TrialSage VAULT document management system.
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare, X, Save, RotateCw, ExternalLink, AlertCircle } from 'lucide-react';

const MsWordPopupEditor = ({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  initialContent,
  onSave
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [wordSessionId, setWordSessionId] = useState(null);

  // Initialize the Word editing session when the dialog opens
  useEffect(() => {
    if (isOpen) {
      initializeWordSession();
    }

    return () => {
      // Cleanup any Word session resources if needed
    };
  }, [isOpen, documentId]);

  // Initialize a Word editing session with the document
  const initializeWordSession = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call the MS Graph API
      // or Office Online Server to create an editing session
      setTimeout(() => {
        setWordSessionId(`word-session-${documentId}-${Date.now()}`);
        setIsLoading(false);
        // Simulate that we now have the document loaded in Word
        setTimeout(() => {
          setHasUnsavedChanges(true);
        }, 5000);
      }, 1500);
    } catch (error) {
      console.error("Error initializing Word session:", error);
      toast({
        title: "Word Session Error",
        description: "Failed to initialize Microsoft Word editing session. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Save changes back to the document management system
  const saveChanges = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, this would save changes back to the document management system
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasUnsavedChanges(false);
      toast({
        title: "Document Saved",
        description: "Your changes have been saved to the document vault.",
        variant: "default",
      });

      if (onSave) {
        onSave("The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects). No serious adverse events were observed.");
      }
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Save Error",
        description: "Failed to save document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle dialog close with confirmation if there are unsaved changes
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} size="lg">
      <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] h-[80vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="bg-blue-50 border-b p-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg"
                alt="Microsoft Word"
                className="h-6 w-6 mr-2"
              />
              <span>Document</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-600">
                Editing document using Microsoft Word Online. Changes are automatically saved.
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2 text-sm text-slate-600">Loading Microsoft Word Online...</p>
              </div>
            </div>
          ) : (
            <div className="h-full w-full flex flex-col">
              {/* Word Online Interface - this would be an iframe or embedding of MS Word in a real implementation */}
              <div className="bg-white p-2 border-b flex items-center">
                <div className="flex space-x-4 text-sm text-slate-600">
                  <span>File</span>
                  <span>Home</span>
                  <span>Insert</span>
                  <span>Design</span>
                  <span>Layout</span>
                  <span>References</span>
                  <span>Review</span>
                  <span>View</span>
                  <span>Help</span>
                </div>
              </div>
              
              <div className="bg-gray-100 p-1 border-b">
                <div className="flex flex-wrap gap-2">
                  <button className="p-1 text-xs bg-white border rounded hover:bg-gray-50">
                    <b>B</b>
                  </button>
                  <button className="p-1 text-xs bg-white border rounded hover:bg-gray-50">
                    <i>I</i>
                  </button>
                  <button className="p-1 text-xs bg-white border rounded hover:bg-gray-50">
                    <u>U</u>
                  </button>
                  <div className="h-4 border-r border-gray-300 mx-1"></div>
                  <button className="p-1 text-xs bg-white border rounded hover:bg-gray-50">
                    Aa
                  </button>
                  <button className="p-1 text-xs bg-white border rounded hover:bg-gray-50">
                    Styles
                  </button>
                  <div className="h-4 border-r border-gray-300 mx-1"></div>
                  <button className="p-1 text-xs bg-white border rounded hover:bg-gray-50">
                    Paragraph
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-8 bg-gray-200 overflow-auto">
                <div className="mx-auto bg-white shadow-sm p-10 min-h-[85%] max-w-[800px]">
                  <h1 className="text-xl font-bold mb-4">{documentTitle || "Document"}</h1>
                  <h2 className="text-lg font-bold mb-3">2.5.5 Safety Profile</h2>
                  <p className="mb-4">
                    The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. 
                    Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).
                  </p>
                  <p>
                    No serious adverse events were considered related to the study medication, and the discontinuation rate due to 
                    adverse events was low (3.2%), comparable to placebo (2.8%).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-3 border-t bg-slate-50 flex-shrink-0">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="h-9"
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              <Button
                size="sm"
                className="h-9"
                onClick={saveChanges}
                disabled={isSaving || !hasUnsavedChanges}
              >
                {isSaving ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save & Update
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MsWordPopupEditor;