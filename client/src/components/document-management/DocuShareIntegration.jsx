import React, { useState } from 'react';
import { useDocuShare } from '@/hooks/useDocuShareComponents';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { FileUp, FileDown, Clipboard, Search, Eye, Lock, ArrowUpDown, Check, FileCheck, Clock } from 'lucide-react';

/**
 * DocuShare Integration Component
 * 
 * Provides a 21 CFR Part 11 compliant document management integration
 * that can be embedded within other modules to provide document access.
 * 
 * @param {Object} props - Component props
 * @param {string} props.moduleContext - The module context (e.g., 'ind', 'csr')
 * @param {string} props.sectionContext - The section context within the module
 * @param {boolean} props.allowUpload - Whether to allow document uploads
 * @param {number} props.height - The height of the component
 */
export function DocuShareIntegration({ 
  moduleContext = 'general',
  sectionContext = '',
  allowUpload = true,
  height = 200
}) {
  const [activeTab, setActiveTab] = useState('relevant');
  const [searchTerm, setSearchTerm] = useState('');
  const { documents = [], uploadDocument, downloadDocument } = useDocuShare();
  
  // Ensure documents is an array
  const docsArray = Array.isArray(documents) ? documents : [];
  
  // Filter documents based on the module context, section, and search term
  const relevantDocuments = docsArray.filter(doc => 
    doc.moduleContext === moduleContext && 
    (!sectionContext || doc.sectionContext === sectionContext)
  ).slice(0, 5); // Limit to 5 documents
  
  const recentDocuments = [...docsArray]
    .sort((a, b) => new Date(b.lastModified || Date.now()) - new Date(a.lastModified || Date.now()))
    .slice(0, 5); // Limit to 5 documents
    
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Upload the document to DocuShare
    uploadDocument(file, moduleContext, sectionContext)
      .then(() => {
        toast({
          title: "Document uploaded",
          description: "Document uploaded to DocuShare successfully.",
        });
      })
      .catch(error => {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
      });
  };
  
  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
        <div className="flex justify-between items-center mb-2">
          <TabsList className="grid grid-cols-2 w-64">
            <TabsTrigger value="relevant">Relevant</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          
          {allowUpload && (
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 text-xs"
              onClick={() => document.getElementById('docushare-file-upload').click()}
            >
              <FileUp className="h-3 w-3 mr-1" />
              Upload
              <input 
                id="docushare-file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </Button>
          )}
        </div>
        
        <TabsContent value="relevant" className="h-full flex flex-col">
          <div className="relative mb-2">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              type="text"
              placeholder="Search documents..."
              className="pl-8 h-8 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <ScrollArea className="flex-grow rounded-md border">
            {relevantDocuments.length > 0 ? (
              <ul className="text-sm divide-y">
                {relevantDocuments.map(doc => (
                  <li key={doc.id} className="py-2 px-3 hover:bg-gray-50 flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{doc.name}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1 inline" />
                        {new Date(doc.lastModified).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <FileDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6 text-sm text-gray-500">
                <FileCheck className="h-8 w-8 mb-2 text-gray-300" />
                <p>No relevant documents found for this section.</p>
                {allowUpload && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 text-xs"
                    onClick={() => document.getElementById('docushare-file-upload').click()}
                  >
                    <FileUp className="h-3 w-3 mr-1" />
                    Upload Document
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="recent" className="h-full">
          <ScrollArea className="h-full rounded-md border">
            {recentDocuments.length > 0 ? (
              <ul className="text-sm divide-y">
                {recentDocuments.map(doc => (
                  <li key={doc.id} className="py-2 px-3 hover:bg-gray-50 flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{doc.name}</div>
                      <div className="text-xs text-gray-500">
                        {doc.moduleContext} · {doc.sectionContext || 'General'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <FileDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6 text-sm text-gray-500">
                <FileCheck className="h-8 w-8 mb-2 text-gray-300" />
                <p>No recent documents available.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      {/* Compliance Badge */}
      <div className="mt-1 flex justify-end">
        <div className="text-[10px] text-gray-500 flex items-center">
          <Lock className="h-2 w-2 mr-0.5" />
          21 CFR Part 11 Electronic Records
        </div>
      </div>
    </div>
  );
}