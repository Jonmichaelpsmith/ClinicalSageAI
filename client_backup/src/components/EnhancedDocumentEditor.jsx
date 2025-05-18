import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText } from 'lucide-react';

/**
 * Enhanced Document Editor for eCTD documents
 * This component provides advanced editing capabilities for regulatory documents
 */
const EnhancedDocumentEditor = ({ 
  content, 
  onChange, 
  documentMetadata,
  onSave,
  readOnly = false
}) => {
  const [editorContent, setEditorContent] = useState(content || '');
  const [activeTab, setActiveTab] = useState('edit');
  
  useEffect(() => {
    setEditorContent(content || '');
  }, [content]);
  
  const handleChange = (e) => {
    const newContent = e.target.value;
    setEditorContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave(editorContent);
    }
  };
  
  return (
    <Card className="p-4 mb-4">
      <Tabs defaultValue="edit" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            {documentMetadata && (
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            )}
          </TabsList>
          
          <Button 
            onClick={handleSave}
            disabled={readOnly}
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
        
        <TabsContent value="edit" className="p-0">
          <textarea
            className="w-full h-64 p-4 border rounded-md font-mono text-sm"
            value={editorContent}
            onChange={handleChange}
            placeholder="Enter document content..."
            disabled={readOnly}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="p-4 border rounded-md h-64 overflow-auto">
          <div className="prose max-w-none">
            {editorContent ? (
              <div dangerouslySetInnerHTML={{ __html: editorContent.replace(/\n/g, '<br />') }} />
            ) : (
              <div className="text-gray-400 italic">No content to preview</div>
            )}
          </div>
        </TabsContent>
        
        {documentMetadata && (
          <TabsContent value="metadata" className="p-4 border rounded-md h-64 overflow-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Document Metadata</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(documentMetadata).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">{key}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </Card>
  );
};

export default EnhancedDocumentEditor;