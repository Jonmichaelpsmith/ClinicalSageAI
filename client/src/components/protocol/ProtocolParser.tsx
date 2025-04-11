import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploader } from '@/components/ui/file-uploader';
import { Loader2, FileText, Upload, Clipboard } from 'lucide-react';

interface ProtocolParserProps {
  onParseComplete: (parsedData: any) => void;
}

export function ProtocolParser({ onParseComplete }: ProtocolParserProps) {
  const [protocolText, setProtocolText] = useState('');
  const [isProtocolUploaded, setIsProtocolUploaded] = useState(false);
  const { toast } = useToast();

  const parseMutation = useMutation({
    mutationFn: async (data: { text: string }) => {
      const response = await apiRequest('POST', '/api/protocol/parse', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Protocol parsed successfully",
        description: "Key protocol metrics extracted and ready for analysis.",
        variant: "default",
      });
      onParseComplete(data.parsed);
    },
    onError: (error: any) => {
      toast({
        title: "Parsing failed",
        description: error.message || "Failed to parse protocol.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/protocol/upload-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload protocol PDF');
      }
      
      const result = await response.json();
      
      if (result.text) {
        setProtocolText(result.text);
        setIsProtocolUploaded(true);
        
        // Auto-parse after upload
        parseMutation.mutate({ text: result.text });
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload protocol PDF.",
        variant: "destructive",
      });
    }
  };

  const handleParse = () => {
    if (!protocolText.trim()) {
      toast({
        title: "No protocol text",
        description: "Please enter or upload protocol text first.",
        variant: "destructive",
      });
      return;
    }
    
    parseMutation.mutate({ text: protocolText });
  };

  const handlePasteExample = () => {
    // Paste a structured example protocol text
    const exampleText = `Protocol Title: Safety and efficacy of LMN-0801 for weight loss
Phase: Phase 2
Population: Adult patients (18-75 years) with BMI ≥30 kg/m² or ≥27 kg/m² with comorbidity
Sample Size: 90 participants
Duration: 24 weeks
Primary Endpoint: Change from baseline in body weight (%)
Secondary Endpoints: Change in waist circumference, blood pressure, lipid profile
Randomization: 1:1:1 ratio to LMN-0801 low dose, high dose, or placebo
Blinding: Double-blind
Safety Assessments: Adverse events, clinical lab tests, ECG, vital signs
Statistical Analysis: ANCOVA model for primary endpoint`;
    
    setProtocolText(exampleText);
    setIsProtocolUploaded(true);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Protocol Parser
        </CardTitle>
        <CardDescription>
          Upload or paste your protocol text to extract key metrics for optimization and analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <FileUploader
              accept=".pdf,.docx,.txt"
              maxSize={10}
              onFilesAdded={(files) => handleFileUpload(files[0])}
              uploadText="Drag & drop your protocol PDF/DOCX here"
              className="mb-4"
            />
            
            <div className="text-center">
              <span className="text-sm text-muted-foreground">or</span>
            </div>
            
            <Textarea
              value={protocolText}
              onChange={(e) => {
                setProtocolText(e.target.value);
                setIsProtocolUploaded(!!e.target.value.trim());
              }}
              placeholder="Paste your protocol text here..."
              className="mt-4"
              rows={10}
            />
          </div>
          
          <div className="flex flex-col">
            <div className="bg-slate-50 p-4 rounded-lg mb-4">
              <h3 className="text-sm font-semibold mb-2">What we extract:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>Phase & Trial Type</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>Population & Eligibility</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>Sample Size & Power</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>Endpoints & Outcomes</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>Study Design & Duration</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>Statistical Approach</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg text-sm">
              <p className="text-blue-700">
                <strong>Real-time extraction:</strong> Our AI parser extracts key protocol metrics in real-time, allowing immediate optimization and comparison with similar CSRs.
              </p>
            </div>
            
            <div className="mt-auto">
              <Button
                variant="outline"
                onClick={handlePasteExample}
                className="w-full mb-2"
              >
                <Clipboard className="w-4 h-4 mr-2" />
                Paste Example Protocol
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button 
          variant="default" 
          onClick={handleParse}
          disabled={!isProtocolUploaded || parseMutation.isPending}
          className="gap-2"
        >
          {parseMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Analyze Protocol
        </Button>
      </CardFooter>
    </Card>
  );
}