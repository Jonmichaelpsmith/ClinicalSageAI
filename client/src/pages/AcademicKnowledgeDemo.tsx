import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUp, Search, Database, BookOpen, Clock, Tag, AlertTriangle, Beaker } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Resource {
  id: number;
  title: string;
  authors: string;
  publicationDate: string;
  source: string;
  resourceType: string;
  summary: string;
  topics: string;
  keywords: string;
  filePath: string;
  fileSize: number;
  uploadDate: string;
  lastAccessed: string | null;
  accessCount: number;
  similarity?: number;
}

interface Stats {
  totalResources: number;
  resourceTypes: { type: string; count: number }[];
  topTopics: { topic: string; count: number }[];
  avgFileSize: number;
  recentUploads: Resource[];
}

export default function AcademicKnowledgeDemo() {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadMetadata, setUploadMetadata] = useState({
    title: '',
    authors: '',
    source: 'manual_upload',
    resourceType: 'pdf',
    topics: '',
    keywords: '',
  });
  const [searchResults, setSearchResults] = useState<Resource[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Fetch stats on initial load
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiRequest('GET', '/api/academic-knowledge/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // toast call replaced
  // Original: toast({
        title: 'Error',
        description: 'Failed to fetch knowledge base statistics.',
        variant: 'destructive',
      })
  console.log('Toast would show:', {
        title: 'Error',
        description: 'Failed to fetch knowledge base statistics.',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadFile(file);
      
      // Auto-fill title based on filename if empty
      if (!uploadMetadata.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        setUploadMetadata({
          ...uploadMetadata,
          title: fileName,
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      // toast call replaced
  // Original: toast({
        title: 'No file selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      })
  console.log('Toast would show:', {
        title: 'No file selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadMetadata.title);
      formData.append('authors', JSON.stringify(uploadMetadata.authors.split(',').map(author => author.trim())));
      formData.append('source', uploadMetadata.source);
      formData.append('resourceType', uploadMetadata.resourceType);
      formData.append('topics', JSON.stringify(uploadMetadata.topics.split(',').map(topic => topic.trim())));
      formData.append('keywords', JSON.stringify(uploadMetadata.keywords.split(',').map(keyword => keyword.trim())));
      
      const response = await fetch('/api/academic-knowledge/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        // toast call replaced
  // Original: toast({
          title: 'Upload successful',
          description: `Resource ${data.resourceId} added to knowledge base.`,
        })
  console.log('Toast would show:', {
          title: 'Upload successful',
          description: `Resource ${data.resourceId} added to knowledge base.`,
        });
        
        // Reset form
        setUploadFile(null);
        setUploadMetadata({
          title: '',
          authors: '',
          source: 'manual_upload',
          resourceType: 'pdf',
          topics: '',
          keywords: '',
        });
        
        // Refresh stats
        fetchStats();
        
        // Switch to search tab
        setActiveTab('search');
      } else {
        // toast call replaced
  // Original: toast({
          title: 'Upload failed',
          description: data.message || 'An error occurred during upload.',
          variant: 'destructive',
        })
  console.log('Toast would show:', {
          title: 'Upload failed',
          description: data.message || 'An error occurred during upload.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error uploading resource:', error);
      // toast call replaced
  // Original: toast({
        title: 'Upload error',
        description: 'Failed to upload to academic knowledge base.',
        variant: 'destructive',
      })
  console.log('Toast would show:', {
        title: 'Upload error',
        description: 'Failed to upload to academic knowledge base.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // toast call replaced
  // Original: toast({
        title: 'Empty search',
        description: 'Please enter a search query.',
        variant: 'destructive',
      })
  console.log('Toast would show:', {
        title: 'Empty search',
        description: 'Please enter a search query.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      const response = await apiRequest('POST', '/api/academic-knowledge/search', {
        query: searchQuery,
        limit: 10
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results);
        
        if (data.results.length === 0) {
          // toast call replaced
  // Original: toast({
            title: 'No results found',
            description: 'Try a different search query or upload new resources.',
          })
  console.log('Toast would show:', {
            title: 'No results found',
            description: 'Try a different search query or upload new resources.',
          });
        }
      } else {
        // toast call replaced
  // Original: toast({
          title: 'Search failed',
          description: data.message || 'An error occurred during search.',
          variant: 'destructive',
        })
  console.log('Toast would show:', {
          title: 'Search failed',
          description: data.message || 'An error occurred during search.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error searching resources:', error);
      // toast call replaced
  // Original: toast({
        title: 'Search error',
        description: 'Failed to search academic knowledge base.',
        variant: 'destructive',
      })
  console.log('Toast would show:', {
        title: 'Search error',
        description: 'Failed to search academic knowledge base.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Academic Knowledge Base
          </CardTitle>
          <CardDescription>
            Permanently retain academic knowledge from uploaded resources to enhance
            protocol services and study design solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="upload">
                <FileUp className="mr-2 h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="search">
                <Search className="mr-2 h-4 w-4" />
                Search
              </TabsTrigger>
              <TabsTrigger value="stats">
                <Database className="mr-2 h-4 w-4" />
                Statistics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload">
              <div className="grid gap-6">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.txt,.xml,.json,.doc,.docx"
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">
                      {uploadFile ? uploadFile.name : 'Select a file to upload'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {uploadFile 
                        ? `${formatFileSize(uploadFile.size)} - ${uploadFile.type}` 
                        : 'PDF, TXT, XML, JSON, DOC, DOCX up to 50MB'}
                    </p>
                    <Button variant="outline" type="button">
                      Browse Files
                    </Button>
                  </label>
                </div>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Title</label>
                      <Input
                        value={uploadMetadata.title}
                        onChange={(e) => setUploadMetadata({...uploadMetadata, title: e.target.value})}
                        placeholder="Document title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Authors (comma-separated)</label>
                      <Input
                        value={uploadMetadata.authors}
                        onChange={(e) => setUploadMetadata({...uploadMetadata, authors: e.target.value})}
                        placeholder="Author 1, Author 2"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Source</label>
                      <Input
                        value={uploadMetadata.source}
                        onChange={(e) => setUploadMetadata({...uploadMetadata, source: e.target.value})}
                        placeholder="e.g., pubmed, manual_upload"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Resource Type</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={uploadMetadata.resourceType}
                        onChange={(e) => setUploadMetadata({...uploadMetadata, resourceType: e.target.value})}
                      >
                        <option value="pdf">PDF</option>
                        <option value="text">Text</option>
                        <option value="xml">XML</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Topics (comma-separated)</label>
                    <Input
                      value={uploadMetadata.topics}
                      onChange={(e) => setUploadMetadata({...uploadMetadata, topics: e.target.value})}
                      placeholder="e.g., diabetes, oncology, clinical trials"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Keywords (comma-separated)</label>
                    <Input
                      value={uploadMetadata.keywords}
                      onChange={(e) => setUploadMetadata({...uploadMetadata, keywords: e.target.value})}
                      placeholder="e.g., endpoint, statistical method, inclusion criteria"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleUpload} disabled={isUploading || !uploadFile}>
                    {isUploading ? 'Uploading...' : 'Upload to Knowledge Base'}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="search">
              <div className="grid gap-6">
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search the academic knowledge base..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Search Results</h3>
                    {searchResults.map((resource) => (
                      <Card key={resource.id} className={`border-l-4 ${resource.similarity && resource.similarity > 0.8 ? 'border-l-primary' : 'border-l-muted'}`}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                            <Badge>{resource.resourceType}</Badge>
                          </div>
                          <CardDescription className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {resource.publicationDate}
                            {resource.similarity && (
                              <Badge variant={resource.similarity > 0.8 ? 'default' : (resource.similarity > 0.6 ? 'destructive' : 'secondary')}>
                                {Math.round(resource.similarity * 100)}% match
                              </Badge>
                            )}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-muted-foreground mb-2">
                            {resource.summary || 'No summary available'}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {JSON.parse(resource.topics || '[]').map((topic: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-semibold">Authors:</span> {JSON.parse(resource.authors || '[]').join(', ')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-semibold">Source:</span> {resource.source}
                          </div>
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground">
                          ID: {resource.id} • Size: {formatFileSize(resource.fileSize)} • Accessed: {resource.accessCount} times
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
                
                {searchResults.length === 0 && searchQuery && !isSearching && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No results found</AlertTitle>
                    <AlertDescription>
                      Try a different search query or upload new resources to the knowledge base.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="stats">
              {stats ? (
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Database className="mr-2 h-4 w-4 text-primary" />
                          Total Resources
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{stats.totalResources}</p>
                        <p className="text-sm text-muted-foreground">
                          Average size: {formatFileSize(stats.avgFileSize)}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <BookOpen className="mr-2 h-4 w-4 text-primary" />
                          Resource Types
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {stats.resourceTypes.map((type, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <span className="text-sm">{type.type}</span>
                              <Badge variant="secondary">{type.count}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Tag className="mr-2 h-4 w-4 text-primary" />
                          Top Topics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {stats.topTopics.map((topic, i) => (
                            <Badge key={i} variant="outline">
                              {topic.topic} ({topic.count})
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Uploads</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats.recentUploads && stats.recentUploads.length > 0 ? (
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-4">
                            {stats.recentUploads.map((resource) => (
                              <div key={resource.id} className="border-b pb-3">
                                <div className="flex items-start justify-between mb-1">
                                  <div>
                                    <h4 className="font-medium">{resource.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(resource.uploadDate).toLocaleDateString()} • {formatFileSize(resource.fileSize)}
                                    </p>
                                  </div>
                                  <Badge>{resource.resourceType}</Badge>
                                </div>
                                <p className="text-sm line-clamp-2">
                                  {resource.summary || 'No summary available'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No resources have been uploaded yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}