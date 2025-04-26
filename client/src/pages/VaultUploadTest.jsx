import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

function VaultUploadTest() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState('regulatory');
  const [category, setCategory] = useState('IND');
  const [documents, setDocuments] = useState([]);
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  
  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/vault/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }
      
      const data = await response.json();
      setToken(data.token);
      setAuthenticated(true);
      
      toast({
        title: 'Login Successful',
        description: `Welcome, ${data.user.name || data.user.username}!`,
      });
      
      // Get documents after login
      fetchDocuments(data.token);
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: 'Upload Failed',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('description', description);
    formData.append('documentType', documentType);
    formData.append('category', category);
    
    try {
      const response = await fetch('/api/vault/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('File upload failed');
      }
      
      const data = await response.json();
      toast({
        title: 'Upload Successful',
        description: `Document "${data.title}" uploaded successfully.`,
      });
      
      // Refresh document list
      fetchDocuments(token);
      
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      document.getElementById('file-input').value = '';
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch documents
  const fetchDocuments = async (authToken) => {
    try {
      const response = await fetch('/api/vault/documents', {
        headers: {
          'Authorization': `Bearer ${authToken || token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch documents. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Download document
  const handleDownload = async (id, fileName) => {
    try {
      window.open(`/api/vault/documents/${id}/download?token=${encodeURIComponent(token)}`, '_blank');
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Delete document
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/vault/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      toast({
        title: 'Document Deleted',
        description: 'Document has been deleted successfully.',
      });
      
      // Refresh document list
      fetchDocuments(token);
    } catch (error) {
      toast({
        title: 'Deletion Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">TrialSage Vault™ Test Interface</h1>
      
      {!authenticated ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Login to Vault</CardTitle>
            <CardDescription>Enter your credentials to access the vault</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            Default credentials: admin / admin123
          </CardFooter>
        </Card>
      ) : (
        <Tabs defaultValue="upload" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Document</TabsTrigger>
            <TabsTrigger value="list">Document List</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
                <CardDescription>Upload a new document to the vault</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-input">Document File</Label>
                    <Input 
                      id="file-input" 
                      type="file" 
                      onChange={handleFileChange} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter document title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter document description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="documentType">Document Type</Label>
                      <select
                        id="documentType"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="regulatory">Regulatory</option>
                        <option value="clinical">Clinical</option>
                        <option value="safety">Safety</option>
                        <option value="quality">Quality</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="IND">IND</option>
                        <option value="NDA">NDA</option>
                        <option value="BLA">BLA</option>
                        <option value="ANDA">ANDA</option>
                        <option value="CTD">CTD</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Document List</CardTitle>
                <CardDescription>View and manage your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button onClick={() => fetchDocuments()} size="sm" variant="outline">
                    Refresh List
                  </Button>
                </div>
                
                {documents.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No documents found. Upload some documents to get started.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {documents.map((doc) => (
                      <Card key={doc.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{doc.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                            <div className="flex flex-wrap gap-2 my-2">
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                {doc.document_type}
                              </span>
                              <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                                {doc.category}
                              </span>
                              {doc.tags && doc.tags.map((tag, i) => (
                                <span key={i} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                  {tag}
                                </span>
                              ))}
                              {doc.ai_tags && doc.ai_tags.map((tag, i) => (
                                <span key={i} className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                                  AI: {tag}
                                </span>
                              ))}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(doc.id, doc.file_name)}
                            >
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(doc.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default VaultUploadTest;