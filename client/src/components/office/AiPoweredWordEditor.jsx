import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Edit3, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import MicrosoftWordEmbed from './MicrosoftWordEmbed';
import { getOfficeEmbedUrl } from '@/services/msOfficeVaultBridge';

/**
 * AI-Powered Document Editor with Microsoft Word Integration
 * 
 * This component provides a unified interface for document editing with
 * integrated Microsoft Word embedding and AI assistance for document authoring.
 * 
 * @param {Object} props Component properties
 * @param {string} props.documentId Document ID in the vault
 * @param {string} props.fileUrl Microsoft Graph file URL (optional)
 * @param {function} props.onSave Callback on save
 * @param {function} props.onClose Callback on close
 */
const AiPoweredWordEditor = ({
  documentId,
  fileUrl,
  documentTitle = "Document",
  onSave,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState('edit');
  const [wordEmbedUrl, setWordEmbedUrl] = useState(null);
  const [error, setError] = useState(null);
  
  const wordContainerRef = useRef(null);
  
  // Initialize Microsoft Word embedding
  useEffect(() => {
    const initializeWordEmbed = async () => {
      try {
        setIsLoading(true);
        
        if (fileUrl) {
          // If we have a direct fileUrl, create the embed URL
          const embedUrl = getOfficeEmbedUrl(fileUrl);
          setWordEmbedUrl(embedUrl);
        } else if (documentId) {
          // Otherwise, we need to get it from the vault via our backend
          // This will be implemented in the document bridge service
          // For now, we'll simulate this
          setTimeout(() => {
            const sampleEmbedUrl = 'https://office.com/launch/word?auth=2&EID=d02acd18-8e55-4543-9796-5584bf778a2b';
            setWordEmbedUrl(sampleEmbedUrl);
          }, 1500);
        } else {
          setError('Document ID or file URL is required');
        }
      } catch (err) {
        console.error('Error initializing Word embedding:', err);
        setError(err.message || 'Failed to initialize Microsoft Word');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeWordEmbed();
  }, [documentId, fileUrl]);
  
  // Simulate getting AI suggestions
  useEffect(() => {
    const suggestions = [
      {
        id: 1,
        type: 'formatting',
        section: 'Section 2.1.4.2',
        message: 'Table formatting for efficacy data does not meet ICH guidelines. Suggested template available.',
        position: { start: 1200, end: 1500 },
        severity: 'warning'
      },
      {
        id: 2,
        type: 'compliance',
        section: 'Abstract',
        message: 'Abstract is missing required safety summary information per regulatory guidelines.',
        position: { start: 100, end: 200 },
        severity: 'error'
      },
      {
        id: 3,
        type: 'formatting',
        section: 'Overall',
        message: 'Document uses inconsistent heading styles. Apply consistent heading formatting?',
        position: null,
        severity: 'info'
      }
    ];
    
    setTimeout(() => {
      setAiSuggestions(suggestions);
    }, 2000);
  }, []);
  
  const handleSuggestionApply = (suggestionId) => {
    // In a real implementation, this would apply the suggestion to the document
    // through the Microsoft Word API
    console.log('Applying suggestion:', suggestionId);
    
    // For now, we'll just update the suggestion status
    setAiSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, applied: true } : s)
    );
  };
  
  const handleSave = () => {
    // This would trigger a save in Word and synchronize back to the vault
    console.log('Saving document');
    if (onSave) onSave();
  };
  
  if (error) {
    return (
      <Card className="p-6 bg-white border-red-200 shadow-md">
        <div className="flex items-center space-x-2 text-red-600 mb-4">
          <AlertCircle className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Error</h3>
        </div>
        <p className="text-gray-700 mb-4">{error}</p>
        <Button onClick={onClose || (() => window.location.reload())}>
          Go Back
        </Button>
      </Card>
    );
  }
  
  return (
    <div className="flex flex-col h-full bg-white shadow-lg rounded-lg border">
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">{documentTitle}</h2>
          <p className="text-sm text-gray-500">AI-Powered Document Editor with Microsoft Word</p>
        </div>
        
        <div className="flex space-x-2">
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
          {onClose && (
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="bg-transparent border-b-0">
            <TabsTrigger value="edit" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Document
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
              <FileText className="h-4 w-4 mr-2" />
              AI Assistant
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="edit" className="flex-1 relative m-0 p-0 data-[state=active]:flex-1 border-none">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading Microsoft Word...</p>
            </div>
          ) : (
            <div ref={wordContainerRef} className="w-full h-full">
              {wordEmbedUrl && (
                <MicrosoftWordEmbed
                  documentId={documentId}
                  fileUrl={wordEmbedUrl}
                  onSave={handleSave}
                />
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="ai" className="flex-1 p-4 m-0 data-[state=active]:flex-1 overflow-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">AI Document Assistant</h3>
              <p className="text-sm text-gray-600 mb-4">
                These suggestions are based on document analysis and regulatory requirements.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Format Assistance</h4>
              {aiSuggestions
                .filter(s => s.type === 'formatting')
                .map(suggestion => (
                  <div 
                    key={suggestion.id}
                    className={`p-4 rounded-md border ${
                      suggestion.applied ? 'bg-green-50 border-green-200' : 
                      suggestion.severity === 'error' ? 'bg-red-50 border-red-200' :
                      suggestion.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div className="font-medium">{suggestion.section}</div>
                      {suggestion.applied && (
                        <span className="text-green-600 flex items-center text-sm">
                          <CheckCircle className="h-3 w-3 mr-1" /> Applied
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1">{suggestion.message}</p>
                    <div className="flex mt-3">
                      <Button 
                        size="sm" 
                        variant={suggestion.applied ? "outline" : "default"}
                        disabled={suggestion.applied}
                        onClick={() => handleSuggestionApply(suggestion.id)}
                      >
                        {suggestion.applied ? 'Applied' : 'Apply Fix'}
                      </Button>
                      <Button size="sm" variant="link" className="ml-2">
                        Preview
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Compliance</h4>
              {aiSuggestions
                .filter(s => s.type === 'compliance')
                .map(suggestion => (
                  <div 
                    key={suggestion.id}
                    className={`p-4 rounded-md border ${
                      suggestion.applied ? 'bg-green-50 border-green-200' : 
                      suggestion.severity === 'error' ? 'bg-red-50 border-red-200' :
                      suggestion.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div className="font-medium">{suggestion.section}</div>
                      {suggestion.applied && (
                        <span className="text-green-600 flex items-center text-sm">
                          <CheckCircle className="h-3 w-3 mr-1" /> Applied
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1">{suggestion.message}</p>
                    <div className="flex mt-3">
                      <Button 
                        size="sm" 
                        variant={suggestion.applied ? "outline" : "default"}
                        disabled={suggestion.applied}
                        onClick={() => handleSuggestionApply(suggestion.id)}
                      >
                        {suggestion.applied ? 'Applied' : 'Apply Fix'}
                      </Button>
                      <Button size="sm" variant="link" className="ml-2">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Ask the AI Assistant</h4>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Ask a question about your document..."
                  className="w-full p-2 pr-10 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button 
                  size="sm"
                  className="absolute right-1 top-1"
                >
                  Ask
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiPoweredWordEditor;