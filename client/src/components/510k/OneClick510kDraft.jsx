import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Info, FileText, AlertCircle, Download, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

const OneClick510kDraft = ({ deviceProfile, predicateDevices = [] }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [includeFormatting, setIncludeFormatting] = useState(true);
  const [includeAppendices, setIncludeAppendices] = useState(true);
  const [includeReferences, setIncludeReferences] = useState(true);
  const [includeComparisons, setIncludeComparisons] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  const validProfile = deviceProfile && deviceProfile.deviceName && deviceProfile.intendedUse;
  const hasPredicate = predicateDevices && predicateDevices.length > 0;

  const handleGenerateDraft = async () => {
    if (!validProfile) {
      toast({
        title: "Missing Device Profile",
        description: "Please complete your device profile before generating a draft.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const options = {
        includeFormatting,
        includeAppendices,
        includeReferences,
        includeComparisons,
        outputFormat: selectedFormat
      };

      const response = await axios.post('/api/510k/generate-draft', {
        deviceProfile,
        predicateDevices,
        options
      });

      if (response.data && response.data.success) {
        setGeneratedDraft(response.data);
        toast({
          title: "Draft Generated Successfully",
          description: "Your 510(k) draft document has been generated.",
          variant: "success"
        });
      } else {
        throw new Error(response.data?.message || 'Failed to generate draft');
      }
    } catch (error) {
      console.error('Error generating 510(k) draft:', error);
      toast({
        title: "Draft Generation Failed",
        description: error.message || "There was an error generating your draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedDraft) return;
    
    // Create a download link
    const fileExtension = selectedFormat === 'pdf' ? 'pdf' : 'docx';
    const blob = new Blob([generatedDraft.documentData], {
      type: selectedFormat === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `510k_draft_${deviceProfile.deviceName.replace(/\s+/g, '_')}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    toast({
      title: "Document Downloaded",
      description: `Your 510(k) draft has been downloaded in ${fileExtension.toUpperCase()} format.`,
      variant: "success"
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          One-Click 510(k) Draft Generator
        </CardTitle>
        <CardDescription>
          Automatically generate a complete 510(k) submission draft document based on your device profile
          and predicate device comparisons.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="options">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="info">Information</TabsTrigger>
          </TabsList>
          
          <TabsContent value="options">
            <div className="space-y-4">
              {(!validProfile || !hasPredicate) && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-800">Attention Required</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      {!validProfile && "Please complete your device profile information. "}
                      {!hasPredicate && "You need at least one predicate device for comparison. "}
                      These are required to generate a comprehensive 510(k) draft.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Document Format</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      id="format-pdf" 
                      name="format" 
                      value="pdf"
                      checked={selectedFormat === 'pdf'}
                      onChange={() => setSelectedFormat('pdf')}
                      className="h-4 w-4 text-primary"
                    />
                    <Label htmlFor="format-pdf">PDF Format</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      id="format-docx" 
                      name="format" 
                      value="docx"
                      checked={selectedFormat === 'docx'}
                      onChange={() => setSelectedFormat('docx')}
                      className="h-4 w-4 text-primary"
                    />
                    <Label htmlFor="format-docx">Word Document</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium mb-2">Document Options</h3>
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="include-formatting" 
                    checked={includeFormatting} 
                    onCheckedChange={setIncludeFormatting}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="include-formatting" className="text-sm font-medium">
                      FDA-compliant formatting
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Apply standard FDA-compliant formatting to the document
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="include-appendices" 
                    checked={includeAppendices} 
                    onCheckedChange={setIncludeAppendices}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="include-appendices" className="text-sm font-medium">
                      Include appendices
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Add standard appendices with placeholders for additional information
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="include-references" 
                    checked={includeReferences} 
                    onCheckedChange={setIncludeReferences}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="include-references" className="text-sm font-medium">
                      Include literature references
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Add literature citations and references section from discovered literature
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="include-comparisons" 
                    checked={includeComparisons} 
                    onCheckedChange={setIncludeComparisons}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="include-comparisons" className="text-sm font-medium">
                      Include detailed comparisons
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Add detailed comparison tables between your device and predicates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="info">
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">What's included in the 510(k) draft?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    The generated draft includes all sections required for a complete 510(k) submission,
                    including device description, indications for use, substantial equivalence comparison,
                    performance data summary, and more.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Edit after generation</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    After generating the draft, you can download it and make any necessary edits
                    in your preferred word processor. The document includes placeholders for
                    information that requires manual input.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">FDA compliance</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    The generated draft follows FDA guidance for 510(k) submissions. However,
                    it's important to review the document thoroughly and ensure all information
                    is accurate and complete before submission.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground flex items-center">
          <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
          FDA-compliant formatting
        </div>
        <div className="flex gap-2">
          {generatedDraft && (
            <Button 
              variant="outline" 
              onClick={handleDownload}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
          )}
          <Button 
            onClick={handleGenerateDraft} 
            disabled={isLoading || !validProfile || !hasPredicate}
            className="flex items-center gap-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-1" /> Generate Draft
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OneClick510kDraft;