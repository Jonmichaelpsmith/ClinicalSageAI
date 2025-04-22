import React, { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDocuShare } from '@/hooks/useDocuShare';
import { FileText, Upload, Search, Plus, Settings, ChevronDown, Eye, ArrowUpRight, Shield } from 'lucide-react';

/**
 * DocuShare Integration Component
 * 
 * This component provides a reusable interface to the DocuShare document management system
 * that can be integrated into any module of the application.
 * 
 * It allows for:
 * - Quick access to recent documents
 * - Document upload
 * - Document search
 * - Navigation to full document management system
 */
export function DocuShareIntegration({ 
  contextId = '', // Optional context ID to filter documents (e.g., "IND-12345")
  contextType = '', // Optional context type (e.g., "ind", "csr", "protocol")
  mode = 'sidebar', // 'sidebar', 'panel', 'compact'
  onSelectDocument = null, // Callback when document is selected
  recentCount = 5, // Number of recent documents to show
  height = 400, // Height of the component in 'sidebar' or 'panel' mode
}) {
  const { 
    isAuthenticated,
    isLoading,
    documents,
    error,
    loadDocuments
  } = useDocuShare();
  
  const [showRelevant, setShowRelevant] = useState(true);
  
  // Load documents on mount
  React.useEffect(() => {
    if (isAuthenticated) {
      // In a real implementation, we would pass context filters
      loadDocuments('regulatory', {
        contextId,
        contextType,
        limit: recentCount,
        sort: 'date'
      });
    }
  }, [isAuthenticated, contextId, contextType, recentCount, loadDocuments]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Get document status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'In-Review':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  // Get document icon based on type
  const getDocumentIcon = (type) => {
    return <FileText className="h-4 w-4 flex-shrink-0" />;
  };
  
  // Render different modes
  if (mode === 'compact') {
    return (
      <Card className="w-full border-teal-200 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="h-4 w-4 text-teal-500 mr-1" />
              DocuShare Integration
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Search className="h-4 w-4 mr-2" />
                  Search Documents
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/document-management">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Open DocuShare
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription className="text-xs">
            21 CFR Part 11 compliant document management
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          {isLoading ? (
            <p className="text-xs text-muted-foreground py-2 text-center">
              Loading documents...
            </p>
          ) : documents && documents.length > 0 ? (
            <ul className="space-y-1">
              {documents.slice(0, 3).map((doc) => (
                <li key={doc.id} className="text-xs flex items-center justify-between">
                  <div className="flex items-center overflow-hidden">
                    {getDocumentIcon(doc.documentType)}
                    <span className="ml-1 truncate">{doc.name}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${getStatusClass(doc.controlStatus)}`}>
                    {doc.controlStatus}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground py-2 text-center">
              No recent documents
            </p>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <Button size="sm" variant="ghost" className="text-xs w-full justify-center text-teal-600 hover:text-teal-800 hover:bg-teal-50" asChild>
            <Link to="/document-management">
              <Eye className="h-3 w-3 mr-1" />
              View All Documents
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Sidebar/Panel layouts
  return (
    <Card className={`w-full border-teal-200 shadow-sm ${mode === 'panel' ? 'h-full' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md flex items-center">
            <Shield className="h-5 w-5 text-teal-600 mr-2" />
            DocuShare Repository
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/document-management">
              Open Full System
            </Link>
          </Button>
        </div>
        <CardDescription>
          21 CFR Part 11 compliant document management system
        </CardDescription>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <Link to="/document-management">
              <Search className="h-3 w-3 mr-1" />
              Search
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <Link to="/document-management">
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <Link to="/document-management">
              <Plus className="h-3 w-3 mr-1" />
              New
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="text-xs ml-auto" asChild>
            <Link to="/document-management">
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-6 py-2 bg-muted/50 flex items-center justify-between border-y">
          <div className="flex gap-2">
            <Button 
              variant={showRelevant ? "subtle" : "ghost"} 
              size="sm"
              onClick={() => setShowRelevant(true)}
              className="text-xs h-7"
            >
              Relevant Documents
            </Button>
            <Button 
              variant={!showRelevant ? "subtle" : "ghost"} 
              size="sm"
              onClick={() => setShowRelevant(false)}
              className="text-xs h-7"
            >
              Recent Activity
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100%-3.5rem)]" style={{ maxHeight: height ? `${height - 150}px` : '250px' }}>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-5 w-5 border-2 border-teal-500 border-t-transparent rounded-full mr-2" />
              <p className="text-sm text-muted-foreground">Loading documents...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-sm text-destructive mb-2">Failed to load documents</p>
              <Button variant="outline" size="sm" onClick={() => loadDocuments('regulatory')}>
                Retry
              </Button>
            </div>
          ) : documents && documents.length > 0 ? (
            <ul className="divide-y">
              {documents.map((doc) => (
                <li 
                  key={doc.id} 
                  className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onSelectDocument && onSelectDocument(doc)}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-teal-100 p-2 rounded">
                      {getDocumentIcon(doc.documentType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.documentType}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(doc.lastModified || doc.uploadDate)}
                        </span>
                        <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusClass(doc.controlStatus)}`}>
                          {doc.controlStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">No documents found</p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/document-management">
                  Browse All Documents
                </Link>
              </Button>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t bg-muted/20 p-3">
        <p className="text-xs text-muted-foreground">DocuShare Server ID: <span className="font-mono">TrialSAGE-DS7</span></p>
        <Button variant="link" size="sm" className="text-xs ml-auto p-0" asChild>
          <Link to="/document-management">View All</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}