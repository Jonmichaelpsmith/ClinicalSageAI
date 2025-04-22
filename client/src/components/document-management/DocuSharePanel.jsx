import React, { useState, useEffect } from 'react';
import { useDocuShare } from '@/hooks/useDocuShare';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, FileText, FolderOpen, Upload, Download, File, Filter } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * DocuSharePanel - A reusable component that can be embedded in any module
 * for 21 CFR Part 11 compliant document management
 * 
 * @param {Object} props
 * @param {string} props.moduleId - The ID of the module using this panel (e.g., "ind", "csr", "cer")
 * @param {string} props.documentType - The type of documents to filter (e.g., "protocol", "report")
 * @param {boolean} props.compact - Whether to show the panel in compact mode
 * @param {Function} props.onDocumentSelect - Callback when document is selected
 */
export default function DocuSharePanel({ 
  moduleId = "general", 
  documentType = "all",
  compact = false,
  onDocumentSelect
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const { 
    documents, 
    folders, 
    recentDocuments,
    isLoading, 
    fetchDocuments, 
    uploadDocument, 
    downloadDocument 
  } = useDocuShare(moduleId);
  
  useEffect(() => {
    fetchDocuments(documentType);
  }, [documentType, moduleId, fetchDocuments]);
  
  const filteredDocuments = documents?.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.documentId.includes(searchQuery)
  ) || [];
  
  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    if (onDocumentSelect) {
      onDocumentSelect(document);
    }
  };
  
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadDocument(file, moduleId, documentType);
    }
  };
  
  const getDocumentTypeColor = (type) => {
    const colors = {
      'protocol': 'bg-blue-100 text-blue-800',
      'report': 'bg-green-100 text-green-800',
      'form': 'bg-purple-100 text-purple-800',
      'submission': 'bg-amber-100 text-amber-800',
      'correspondence': 'bg-sky-100 text-sky-800',
      'approval': 'bg-emerald-100 text-emerald-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };
  
  if (compact) {
    return (
      <Card className="w-full shadow-sm border border-gray-200">
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
              <FileText className="h-4 w-4 mr-1 text-teal-600" />
              DocuShare Documents
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <label htmlFor="uploadDoc" className="cursor-pointer">
                    <Upload className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                    <input 
                      id="uploadDoc" 
                      type="file" 
                      className="hidden" 
                      onChange={handleUpload}
                    />
                  </label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload Document</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            </div>
          ) : (
            <ScrollArea className="h-32">
              <ul className="space-y-1">
                {recentDocuments?.slice(0, 5).map((doc) => (
                  <li 
                    key={doc.id}
                    className="py-1 px-2 text-xs flex items-center hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handleDocumentSelect(doc)}
                  >
                    <File className="h-3 w-3 mr-1 flex-shrink-0 text-gray-500" />
                    <span className="truncate">{doc.title}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full shadow-md border border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-teal-600" />
              DocuShare Integration
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              21 CFR Part 11 compliant document management
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => fetchDocuments('all')}>
                  All Documents
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fetchDocuments('protocol')}>
                  Protocols
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fetchDocuments('report')}>
                  Reports
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fetchDocuments('submission')}>
                  Submissions
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="default" size="sm" className="h-8 bg-teal-600 hover:bg-teal-700">
                    <Upload className="h-4 w-4 mr-1" />
                    <label htmlFor="uploadDocFull" className="cursor-pointer">
                      Upload
                      <input 
                        id="uploadDocFull" 
                        type="file" 
                        className="hidden" 
                        onChange={handleUpload}
                      />
                    </label>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload Document to DocuShare</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="mt-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search documents..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-2">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="folders">Folders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="m-0">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <ScrollArea className="h-64">
                <ul className="space-y-2">
                  {recentDocuments?.map((doc) => (
                    <li 
                      key={doc.id}
                      className={`p-2 flex items-center justify-between hover:bg-gray-50 rounded-md cursor-pointer ${selectedDocument?.id === doc.id ? 'bg-gray-100' : ''}`}
                      onClick={() => handleDocumentSelect(doc)}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium text-sm">{doc.title}</div>
                          <div className="text-xs text-gray-500">
                            Last modified: {new Date(doc.modifiedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge className={getDocumentTypeColor(doc.type)}>
                          {doc.type}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadDocument(doc.id);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="m-0">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <ScrollArea className="h-64">
                <ul className="space-y-2">
                  {filteredDocuments.map((doc) => (
                    <li 
                      key={doc.id}
                      className={`p-2 flex items-center justify-between hover:bg-gray-50 rounded-md cursor-pointer ${selectedDocument?.id === doc.id ? 'bg-gray-100' : ''}`}
                      onClick={() => handleDocumentSelect(doc)}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium text-sm">{doc.title}</div>
                          <div className="text-xs text-gray-500">
                            ID: {doc.documentId} • Version: {doc.version}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge className={getDocumentTypeColor(doc.type)}>
                          {doc.type}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadDocument(doc.id);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="folders" className="m-0">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <ScrollArea className="h-64">
                <ul className="space-y-2">
                  {folders?.map((folder) => (
                    <li 
                      key={folder.id}
                      className="p-2 flex items-center hover:bg-gray-50 rounded-md cursor-pointer"
                    >
                      <FolderOpen className="h-5 w-5 text-amber-500 mr-3" />
                      <div>
                        <div className="font-medium text-sm">{folder.name}</div>
                        <div className="text-xs text-gray-500">
                          {folder.documentCount} documents
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-gray-500 justify-between items-center">
        <div>Connected to DocuShare server: TrialSAGE-DS7</div>
        <Badge variant="outline" className="text-green-600 border-green-200">
          21 CFR Part 11 Compliant
        </Badge>
      </CardFooter>
    </Card>
  );
}