import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/ui/file-uploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, PenTool, Search, Loader2 } from 'lucide-react';

interface ProtocolParserProps {
  onParseComplete: (parsedData: any) => void;
}

export function ProtocolParser({ onParseComplete }: ProtocolParserProps) {
  const [protocolText, setProtocolText] = useState('');
  const [selectedTab, setSelectedTab] = useState('upload');
  const { toast } = useToast();

  // Parse protocol text
  const parseTextMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest('POST', '/api/protocol/parse-text', { text });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Protocol Parsed",
          description: "Successfully analyzed protocol text",
        });
        onParseComplete(data.protocol);
      } else {
        toast({
          title: "Parse Failed",
          description: data.message || "Failed to parse protocol",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Parse Failed",
        description: error.message || "An error occurred while analyzing protocol text",
        variant: "destructive",
      });
    },
  });

  // Upload and parse protocol file
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/protocol/analyze-file', formData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Protocol Analyzed",
          description: "Successfully analyzed protocol file",
        });
        onParseComplete(data.protocol);
      } else {
        toast({
          title: "Analysis Failed",
          description: data.message || "Failed to analyze protocol",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "An error occurred while analyzing protocol file",
        variant: "destructive",
      });
    },
  });

  // Full protocol analysis
  const analyzeMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest('POST', '/api/protocol/full-analyze', { text });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Deep Analysis Complete",
          description: "Successfully analyzed protocol with AI",
        });
        onParseComplete(data.protocol);
      } else {
        toast({
          title: "Analysis Failed",
          description: data.message || "Failed to analyze protocol",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error("Error analyzing protocol text:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "An error occurred during AI analysis",
        variant: "destructive",
      });
    },
  });

  // Handle file upload
  const handleFilesAdded = (files: File[]) => {
    if (files.length === 0) return;

    const formData = new FormData();
    formData.append('file', files[0]);
    uploadMutation.mutate(formData);
  };

  // Handle text parsing
  const handleParseText = () => {
    if (!protocolText.trim()) {
      toast({
        title: "No Text",
        description: "Please enter protocol text to analyze",
        variant: "destructive",
      });
      return;
    }
    
    parseTextMutation.mutate(protocolText);
  };

  // Handle deep analysis
  const handleDeepAnalysis = () => {
    if (!protocolText.trim()) {
      toast({
        title: "No Text",
        description: "Please enter protocol text to analyze",
        variant: "destructive",
      });
      return;
    }
    
    analyzeMutation.mutate(protocolText);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Protocol Parser
        </CardTitle>
        <CardDescription>
          Upload a protocol file or paste protocol text to analyze
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="upload" 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex gap-2 items-center">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="text" className="flex gap-2 items-center">
              <PenTool className="h-4 w-4" />
              Enter Text
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <FileUploader
              accept=".pdf,.docx,.doc,.txt"
              maxSize={20}
              onFilesAdded={handleFilesAdded}
              uploadText="Drag & drop protocol files here"
              className="h-32"
            />
            <div className="text-xs text-muted-foreground mt-2">
              Supported formats: PDF, Word, or Text files up to 20MB
            </div>
          </TabsContent>
          
          <TabsContent value="text" className="space-y-4">
            <Textarea
              placeholder="Paste protocol text here..."
              value={protocolText}
              onChange={(e) => setProtocolText(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleParseText}
                disabled={parseTextMutation.isPending || !protocolText.trim()}
                className="flex gap-2 items-center"
              >
                {parseTextMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Basic Parse
              </Button>
              
              <Button
                onClick={handleDeepAnalysis}
                disabled={analyzeMutation.isPending || !protocolText.trim()}
                className="flex gap-2 items-center"
              >
                {analyzeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Deep AI Analysis
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {(uploadMutation.isPending || parseTextMutation.isPending || analyzeMutation.isPending) && (
        <CardFooter className="border-t pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {uploadMutation.isPending 
              ? "Analyzing protocol file..." 
              : parseTextMutation.isPending 
                ? "Parsing protocol text..." 
                : "Performing deep AI analysis..."}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}