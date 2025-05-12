/**
 * Citation Manager Component
 * 
 * This component manages literature citations for 510(k) submissions,
 * allowing users to view, organize, and remove citations in their documents.
 */

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Bookmark,
  FileText,
  RefreshCw,
  X,
  ExternalLink,
  AlertCircle,
  BookOpen,
  Check,
  Download,
  FileOutput
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CitationManager = ({ documentId, documentType = '510k', onRefresh, compact = false }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Fetch citations for the document
  const {
    data: citations = [],
    isLoading: isLoadingCitations,
    isError: isCitationsError,
    error: citationsError,
    refetch: refetchCitations
  } = useQuery({
    queryKey: [`/api/510k/literature/citations/${documentId}`],
    queryFn: async () => {
      if (!documentId) return [];
      const response = await apiRequest(`/api/510k/literature/citations/${documentId}?type=${documentType}`);
      return response.citations || [];
    },
    enabled: !!documentId,
    refetchOnWindowFocus: false
  });
  
  // Mutation for removing a citation
  const removeCitationMutation = useMutation({
    mutationFn: async (citationId) => {
      const response = await apiRequest(`/api/510k/literature/citations/${citationId}`, 'DELETE');
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Citation removed',
        description: 'The citation has been removed from your document',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/510k/literature/citations/${documentId}`] });
      if (onRefresh) {
        onRefresh();
      }
    },
    onError: (error) => {
      toast({
        title: 'Failed to remove citation',
        description: error.message || 'An error occurred while removing the citation',
        variant: 'destructive',
      });
    }
  });
  
  // Handle removing a citation
  const handleRemoveCitation = (citationId) => {
    if (window.confirm('Are you sure you want to remove this citation?')) {
      removeCitationMutation.mutate(citationId);
    }
  };
  
  // Handle opening the preview dialog
  const handlePreviewCitation = (citation) => {
    setSelectedCitation(citation);
    setIsPreviewOpen(true);
  };
  
  // Group citations by section
  const citationsBySection = citations.reduce((acc, citation) => {
    const sectionKey = citation.section_id || 'other';
    if (!acc[sectionKey]) {
      acc[sectionKey] = [];
    }
    acc[sectionKey].push(citation);
    return acc;
  }, {});
  
  // Export citations as a formatted reference list
  const exportReferences = () => {
    // Create a formatted text of all references
    const formattedReferences = citations.map((citation, index) => {
      const authors = citation.literature_authors?.join(', ') || 'Unknown';
      const year = citation.literature_publication_date 
        ? new Date(citation.literature_publication_date).getFullYear() 
        : '';
      const title = citation.literature_title || 'Untitled';
      const journal = citation.literature_journal || '';
      
      return `[${index + 1}] ${authors}${year ? ` (${year})` : ''}. ${title}${journal ? `. ${journal}` : ''}.`;
    }).join('\n\n');
    
    // Create a blob and download link
    const blob = new Blob([formattedReferences], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `references-${documentId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'References exported',
      description: 'Your references have been exported as a text file',
    });
  };
  
  // Render compact view
  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Bookmark className="h-5 w-5 mr-2" />
            Document Citations {citations.length > 0 && `(${citations.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCitations ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isCitationsError ? (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-sm text-muted-foreground">
                {citationsError?.message || 'Failed to load citations'}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetchCitations()} className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : citations.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No citations added yet. Use the Literature Search to find and cite references.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-60">
              <div className="space-y-2">
                {citations.slice(0, 5).map((citation) => (
                  <div key={citation.id} className="flex justify-between items-start p-2 border rounded-md">
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{citation.literature_title}</p>
                      <p className="text-xs text-muted-foreground">
                        {citation.section_name || citation.section_id}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveCitation(citation.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {citations.length > 5 && (
                  <p className="text-sm text-center text-muted-foreground py-2">
                    + {citations.length - 5} more citations
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
        {citations.length > 0 && (
          <CardFooter>
            <Button variant="outline" size="sm" onClick={exportReferences} className="ml-auto">
              <FileOutput className="h-4 w-4 mr-2" />
              Export References
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }
  
  // Render full view
  return (
    <Card className="citation-manager">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bookmark className="h-5 w-5 mr-2" />
          Document Citations
        </CardTitle>
        <CardDescription>
          Manage literature citations for your 510(k) submission document.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingCitations ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isCitationsError ? (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Citations</h3>
            <p className="text-muted-foreground mb-4">
              {citationsError?.message || 'An error occurred while loading citations'}
            </p>
            <Button onClick={() => refetchCitations()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : citations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Citations Found</h3>
            <p className="text-muted-foreground mb-4">
              You haven't added any literature citations to this document yet. 
              Use the Literature Search feature to find and cite relevant references.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="citation-tabs">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Citations ({citations.length})</TabsTrigger>
              <TabsTrigger value="by-section">By Section</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="citation-list-all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {citations.map((citation) => (
                    <TableRow key={citation.id}>
                      <TableCell className="font-medium">
                        {citation.literature_title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{citation.source_name || 'Unknown'}</Badge>
                      </TableCell>
                      <TableCell>{citation.section_name || citation.section_id}</TableCell>
                      <TableCell>
                        {citation.created_at ? 
                          formatDistanceToNow(new Date(citation.created_at), { addSuffix: true }) : 
                          'Unknown'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewCitation(citation)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveCitation(citation.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="by-section" className="citation-list-sections">
              {Object.keys(citationsBySection).length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">No citations organized by section</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(citationsBySection).map(([sectionId, sectionCitations]) => (
                    <div key={sectionId} className="section-citations">
                      <h3 className="text-lg font-semibold mb-2">
                        {sectionCitations[0]?.section_name || sectionId}
                        <Badge className="ml-2" variant="outline">{sectionCitations.length}</Badge>
                      </h3>
                      <Separator className="mb-3" />
                      <div className="space-y-2">
                        {sectionCitations.map((citation) => (
                          <Card key={citation.id} className="citation-card">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{citation.literature_title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {citation.literature_authors?.join(', ') || 'Unknown authors'} • 
                                    {citation.literature_publication_date ? 
                                      ` ${new Date(citation.literature_publication_date).getFullYear()}` : 
                                      ' Unknown year'}
                                    {citation.literature_journal ? ` • ${citation.literature_journal}` : ''}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePreviewCitation(citation)}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRemoveCitation(citation.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      {citations.length > 0 && (
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={exportReferences}>
            <FileOutput className="h-4 w-4 mr-2" />
            Export References
          </Button>
        </CardFooter>
      )}
      
      {/* Citation Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Citation Details</DialogTitle>
            <DialogDescription>
              View detailed information about this citation.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCitation && (
            <div className="citation-details space-y-4">
              <div className="title">
                <h3 className="font-bold text-lg">{selectedCitation.literature_title}</h3>
              </div>
              
              <div className="metadata grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Authors</p>
                  <p className="text-sm">
                    {selectedCitation.literature_authors?.join(', ') || 'Unknown'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Publication</p>
                  <p className="text-sm">
                    {selectedCitation.literature_journal || 'Unknown'} • 
                    {selectedCitation.literature_publication_date ? 
                      ` ${new Date(selectedCitation.literature_publication_date).toLocaleDateString()}` : 
                      ' Unknown date'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Source</p>
                  <Badge variant="outline">{selectedCitation.source_name || 'Unknown'}</Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Document Section</p>
                  <p className="text-sm">{selectedCitation.section_name || selectedCitation.section_id}</p>
                </div>
              </div>
              
              {selectedCitation.literature_abstract && (
                <div className="abstract">
                  <p className="text-sm font-medium mb-1">Abstract</p>
                  <ScrollArea className="h-32 rounded-md border p-4">
                    <p className="text-sm">{selectedCitation.literature_abstract}</p>
                  </ScrollArea>
                </div>
              )}
              
              {selectedCitation.citation_text && (
                <div className="citation-text">
                  <p className="text-sm font-medium mb-1">Citation Text</p>
                  <div className="text-sm rounded-md border p-4">
                    {selectedCitation.citation_text}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            {selectedCitation?.literature_url && (
              <Button variant="outline" asChild>
                <a 
                  href={selectedCitation.literature_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Source
                </a>
              </Button>
            )}
            <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CitationManager;