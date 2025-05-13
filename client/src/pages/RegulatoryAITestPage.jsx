import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Loader2, FileText, Database, RefreshCw, Search, Zap } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

/**
 * Regulatory AI Test Page
 * 
 * This page provides a simple interface to test the regulatory AI assistant
 * with different queries and contexts.
 */
const RegulatoryAITestPage = () => {
  // Query state
  const [query, setQuery] = useState('');
  const [context, setContext] = useState('general');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Knowledge base state
  const [knowledgeBaseStatus, setKnowledgeBaseStatus] = useState(null);
  const [documentFolders, setDocumentFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [processingFolder, setProcessingFolder] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);

  // Sample queries for different contexts
  const sampleQueries = {
    general: [
      'What is a Clinical Evaluation Report?',
      'How do I determine if my device is substantially equivalent?',
      'What are the requirements for a 510(k) submission?'
    ],
    FDA: [
      'What is the difference between a 510(k) and PMA?',
      'What are the special controls for Class II devices?',
      'How do I request a pre-submission meeting with the FDA?'
    ],
    EMA: [
      'What are the key requirements of EU MDR?',
      'How do I prepare a Clinical Evaluation Report for EU submission?',
      'What is the EUDAMED database?'
    ],
    ICH: [
      'What are the ICH E6 GCP requirements?',
      'Explain ICH E8 on general considerations for clinical trials',
      'How does ICH E9 guide statistical principles for clinical trials?'
    ]
  };

  // Context options for the dropdown
  const contextOptions = [
    { value: 'general', label: 'General' },
    { value: 'FDA', label: 'FDA (US)' },
    { value: 'EMA', label: 'EMA (EU)' },
    { value: 'PMDA', label: 'PMDA (Japan)' },
    { value: 'NMPA', label: 'NMPA (China)' },
    { value: 'Health Canada', label: 'Health Canada' },
    { value: 'TGA', label: 'TGA (Australia)' },
    { value: 'ICH', label: 'ICH Guidelines' },
    { value: 'CER', label: 'Clinical Evaluation Reports' },
    { value: 'global', label: 'Cross-Jurisdictional' }
  ];

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${window.location.origin}/api/regulatory-ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, context }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setResponse(data.response || 'No response received');
      
      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        query,
        context,
        response: data.response || 'No response received'
      }, ...prev].slice(0, 10)); // Keep only the 10 most recent
    } catch (err) {
      console.error('Error querying regulatory AI:', err);
      setError(err.message);
      setResponse('');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleQuery = (sampleQuery) => {
    setQuery(sampleQuery);
  };
  
  // Knowledge base functions
  useEffect(() => {
    fetchKnowledgeBaseStatus();
    fetchDocumentFolders();
  }, []);
  
  const fetchKnowledgeBaseStatus = async () => {
    try {
      const response = await fetch(`${window.location.origin}/api/regulatory-knowledge/status`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setKnowledgeBaseStatus(data);
    } catch (err) {
      console.error('Error fetching knowledge base status:', err);
    }
  };
  
  const fetchDocumentFolders = async () => {
    try {
      const response = await fetch(`${window.location.origin}/api/regulatory-knowledge/document-folders`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setDocumentFolders(data.folders || []);
    } catch (err) {
      console.error('Error fetching document folders:', err);
    }
  };
  
  const initializeKnowledgeBase = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${window.location.origin}/api/regulatory-knowledge/initialize`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      fetchKnowledgeBaseStatus(); // Refresh status
      alert('Knowledge base initialized successfully');
    } catch (err) {
      console.error('Error initializing knowledge base:', err);
      alert(`Error initializing knowledge base: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const processDocuments = async (folderPath) => {
    if (processingFolder) return;
    
    try {
      setProcessingFolder(true);
      setProcessingResult(null);
      setSelectedFolder(folderPath);
      
      const response = await fetch(`${window.location.origin}/api/regulatory-knowledge/process-documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderPath }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      setProcessingResult(result);
      fetchKnowledgeBaseStatus(); // Refresh status
    } catch (err) {
      console.error('Error processing documents:', err);
      setProcessingResult({ error: err.message });
    } finally {
      setProcessingFolder(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Regulatory AI Assistant</h1>
      <p className="text-gray-600 mb-8">
        Test the Regulatory AI Assistant with different queries and contexts to explore its knowledge of global regulatory frameworks.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="query" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="query">Ask a Question</TabsTrigger>
              <TabsTrigger value="history">Query History</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            </TabsList>
            
            <TabsContent value="query">
              <Card>
                <CardHeader>
                  <CardTitle>Ask a Regulatory Question</CardTitle>
                  <CardDescription>
                    Enter your regulatory question and select a context to get specialized knowledge.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleQuerySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium mb-1">Query</label>
                        <Input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Type your regulatory question here..."
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Context</label>
                        <Select
                          value={context}
                          onValueChange={setContext}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select context" />
                          </SelectTrigger>
                          <SelectContent>
                            {contextOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Button type="submit" disabled={loading || !query.trim()} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : 'Get Regulatory Insight'}
                    </Button>
                  </form>
                  
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
                      {error}
                    </div>
                  )}
                  
                  {response && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Response:</h3>
                      <div className="p-4 bg-gray-50 border rounded-md whitespace-pre-wrap">
                        {response}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Query History</CardTitle>
                  <CardDescription>
                    View your recent regulatory AI interactions.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-gray-500 italic">No query history yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {history.map(item => (
                        <Card key={item.id} className="bg-gray-50">
                          <CardHeader className="py-3">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-md font-medium">{item.query}</CardTitle>
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {contextOptions.find(opt => opt.value === item.context)?.label || item.context}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="text-sm whitespace-pre-wrap">{item.response}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Sample Queries</CardTitle>
              <CardDescription>
                Try some of these example queries to test the regulatory AI.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="general">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="FDA">FDA</TabsTrigger>
                  <TabsTrigger value="EMA">EMA</TabsTrigger>
                  <TabsTrigger value="ICH">ICH</TabsTrigger>
                </TabsList>
                
                {Object.keys(sampleQueries).map(key => (
                  <TabsContent key={key} value={key} className="space-y-2">
                    {sampleQueries[key].map((sample, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start h-auto py-2 px-3 text-left"
                        onClick={() => handleSampleQuery(sample)}
                      >
                        {sample}
                      </Button>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex flex-col items-start space-y-4 pt-0">
              <div>
                <h3 className="text-sm font-medium mb-2">Documentation</h3>
                <p className="text-sm text-gray-600">
                  The AI assistant can provide information on:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                  <li>FDA, EMA, PMDA, NMPA, Health Canada, TGA</li>
                  <li>ICH guidelines (especially E1-E20)</li>
                  <li>Clinical evaluation reports</li>
                  <li>510(k) submissions</li>
                  <li>EU MDR requirements</li>
                  <li>Global regulatory strategies</li>
                </ul>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegulatoryAITestPage;