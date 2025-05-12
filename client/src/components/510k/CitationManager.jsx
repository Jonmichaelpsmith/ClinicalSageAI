import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Loader2, Search, Plus, FileText, Trash2, Copy } from 'lucide-react';

/**
 * Citation Manager Component
 * 
 * Provides an interface for managing literature citations within the 510(k) document,
 * including inserting citations and viewing selected references.
 * 
 * @param {Object} props - Component props
 * @param {string} props.projectId - The current project ID
 * @param {Function} props.onInsertCitation - Callback when citation is inserted into document
 */
const CitationManager = ({ projectId, onInsertCitation }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch selected citations
  const { 
    data: citations, 
    isLoading: isLoadingCitations,
    isError: citationsError,
    refetch: refetchCitations
  } = useQuery({
    queryKey: ['/api/510k/literature/selected', projectId],
    queryFn: async () => {
      const response = await apiRequest({
        url: '/api/510k/literature/selected',
        method: 'GET',
        params: {
          projectId
        }
      });
      return response.citations;
    },
    enabled: !!projectId
  });
  
  // Remove citation mutation
  const { 
    mutate: removeCitation, 
    isPending: isRemoving 
  } = useMutation({
    mutationFn: async (id) => {
      const response = await apiRequest({
        url: '/api/510k/literature/citations',
        method: 'POST',
        data: {
          ids: [id],
          projectId,
          selected: false
        }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/510k/literature/selected', projectId] });
    }
  });
  
  // Filter citations based on search term
  const filteredCitations = citations 
    ? citations.filter(citation => 
        citation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        citation.journal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (citation.authors && citation.authors.some(author => 
          author.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      )
    : [];
  
  // Handle insert citation button click
  const handleInsertCitation = (citation) => {
    if (onInsertCitation) {
      onInsertCitation(citation);
    }
  };
  
  // Handle remove citation button click
  const handleRemoveCitation = (id) => {
    removeCitation(id);
  };
  
  // Copy citation text to clipboard
  const handleCopyCitation = (text) => {
    navigator.clipboard.writeText(text);
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle>Citation Manager</CardTitle>
        <CardDescription>
          Manage and insert literature citations into your 510(k) document
        </CardDescription>
        <div className="mt-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search citations..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoadingCitations && (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {citationsError && (
          <div className="p-4 text-center text-destructive">
            <p>Error loading citations</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchCitations()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}
        
        {!isLoadingCitations && citations && citations.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No citations added yet</p>
            <p className="text-sm">
              Search and add citations from the Literature Search panel
            </p>
          </div>
        )}
        
        {!isLoadingCitations && citations && citations.length > 0 && (
          <ScrollArea className="h-[400px]">
            <Accordion type="single" collapsible className="w-full">
              {filteredCitations.map((citation) => (
                <AccordionItem key={citation.id} value={citation.id}>
                  <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
                    <div className="flex items-start text-left">
                      <div className="flex-shrink-0 w-6 text-center mr-2">
                        <span className="text-sm font-medium">[{citation.number}]</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{citation.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {citation.journal}, {citation.year}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-4 py-2 space-y-3">
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-1">Citation Text:</p>
                        <p className="border rounded-md p-2 text-xs">
                          {citation.citationText}
                        </p>
                      </div>
                      
                      {citation.summary && (
                        <div className="text-sm">
                          <p className="text-muted-foreground mb-1">Summary:</p>
                          <p className="border rounded-md p-2 text-xs">
                            {citation.summary}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-2 pt-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopyCitation(citation.citationText)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy citation text</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveCitation(citation.id)}
                                disabled={isRemoving}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Remove citation</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <Button
                          size="sm"
                          onClick={() => handleInsertCitation(citation)}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Insert Citation
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className="flex justify-between py-4">
        <p className="text-sm text-muted-foreground">
          {citations ? citations.length : 0} citations available
        </p>
      </CardFooter>
    </Card>
  );
};

export default CitationManager;