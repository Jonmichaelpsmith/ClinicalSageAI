// client/src/components/protocol/ProtocolUploadPanel.jsx
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  Clipboard,
  ClipboardCheck,
  Download,
  BarChart4,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  FileOutput
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const RiskLevel = ({ level, children }) => {
  const colors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-green-100 text-green-800 border-green-200",
  };
  
  return (
    <div className={`p-3 rounded-md border ${colors[level]} mb-3`}>
      {children}
    </div>
  );
};

export default function ProtocolUploadPanel() {
  const [file, setFile] = useState(null);
  const [pastingText, setPastingText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadMessage, setUploadMessage] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [clipboard, setClipboard] = useState({ copied: false, text: "" });

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Check file type
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      setUploadMessage(`Selected: ${selectedFile.name}`);
    }
  };

  // Upload and analyze file
  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(10);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 500);
      
      const response = await fetch('/api/analytics/upload-protocol', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      setUploading(false);
      setAnalyzing(true);
      
      const data = await response.json();
      setAnalysisResult(data);
      
      toast({
        title: "Analysis complete",
        description: "Protocol has been analyzed successfully.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your protocol. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setAnalyzing(false);
      setProgress(0);
    }
  };

  // Analyze pasted text
  const handleAnalyzePasted = async () => {
    if (!pastingText.trim()) {
      toast({
        title: "No text provided",
        description: "Please paste protocol text to analyze",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setProgress(30);
    
    try {
      const response = await fetch('/api/analytics/analyze-protocol-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: pastingText }),
      });
      
      setProgress(90);
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const data = await response.json();
      setAnalysisResult(data);
      setProgress(100);
      
      toast({
        title: "Analysis complete",
        description: "Protocol text has been analyzed successfully.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your protocol text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
      setProgress(0);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setClipboard({ copied: true, text });
        setTimeout(() => setClipboard({ copied: false, text: "" }), 3000);
        toast({
          title: "Copied to clipboard",
          description: "Analysis summary copied to clipboard",
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard",
          variant: "destructive",
        });
      }
    );
  };

  // Generate export summary
  const generateSummary = () => {
    if (!analysisResult) return "";
    
    // Include confidence score data if available
    const confidenceSection = analysisResult.confidence_score ? 
    `## Protocol Confidence Assessment
Confidence Score: ${analysisResult.confidence_score}/100
Verdict: ${analysisResult.confidence_verdict || 'Not assessed'}
${analysisResult.confidence_issues?.length > 0 ? '\nIssues Identified:' : ''}
${analysisResult.confidence_issues?.map(issue => `- ${issue}`).join('\n') || 'None identified'}
` : '';
    
    return `# Protocol Analysis Summary
Date: ${new Date().toLocaleDateString()}

## Protocol Details
Title: ${analysisResult.title || 'Not specified'}
Indication: ${analysisResult.indication || 'Not specified'}
Phase: ${analysisResult.phase || 'Not specified'}
Sample Size: ${analysisResult.sample_size || 'Not specified'}
Duration: ${analysisResult.duration_weeks ? `${analysisResult.duration_weeks} weeks` : 'Not specified'}

${confidenceSection}
## Risk Factors (${analysisResult.risk_factors?.length || 0})
${analysisResult.risk_factors?.map(risk => `- ${risk.description} (${risk.severity.toUpperCase()})`).join('\n') || 'None identified'}

## CSR Precedents (${analysisResult.matching_csrs?.length || 0})
${analysisResult.matching_csrs?.map(csr => `- ${csr.title} (${csr.id})`).join('\n') || 'None found'}

## Recommended Improvements
${analysisResult.recommendations || 'No recommendations provided'}`;
  };

  // Download analysis report
  const downloadReport = () => {
    if (!analysisResult) return;
    
    // If PDF link is available, use it directly
    if (analysisResult.pdf_link) {
      window.open(analysisResult.pdf_link, '_blank');
      return;
    }
    
    // Fallback to text report if PDF is not available
    const summary = generateSummary();
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `protocol-analysis-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <FileText className="h-5 w-5 text-primary mr-2" />
          Protocol Analysis
        </CardTitle>
        <CardDescription>
          Upload a protocol document or paste text for AI-powered analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Upload Tabs */}
        {!analysisResult && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="paste">Paste Text</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="mt-4">
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center gap-2">
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or click to upload a protocol document
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF and Word documents up to 10MB
                  </p>
                  <input
                    type="file"
                    id="protocol-file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('protocol-file').click()}
                    className="mt-2"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </div>
                
                {uploadMessage && (
                  <p className="text-sm text-muted-foreground">{uploadMessage}</p>
                )}
                
                <Button
                  onClick={handleFileUpload}
                  disabled={!file || uploading || analyzing}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Analyze Protocol
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="paste" className="mt-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste protocol text here..."
                  value={pastingText}
                  onChange={(e) => setPastingText(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                
                <Button
                  onClick={handleAnalyzePasted}
                  disabled={!pastingText.trim() || analyzing}
                  className="w-full"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Analyze Protocol Text
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {/* Progress indicator */}
        {(uploading || analyzing) && progress > 0 && (
          <div className="mt-4 space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {uploading ? 'Uploading and extracting text...' : 'Analyzing protocol content...'}
            </p>
          </div>
        )}
        
        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Analysis Results</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAnalysisResult(null);
                    setFile(null);
                    setPastingText("");
                    setUploadMessage("");
                  }}
                >
                  Analyze Another
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateSummary())}
                >
                  {clipboard.copied ? (
                    <ClipboardCheck className="h-4 w-4 mr-1" />
                  ) : (
                    <Clipboard className="h-4 w-4 mr-1" />
                  )}
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadReport}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
            
            {/* PDF Download Card - positioned prominently at the top */}
            {analysisResult.pdf_link && (
              <Card className="bg-blue-50 border-blue-200 mb-4">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileOutput className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-blue-800">Complete Protocol Analysis Report</h3>
                        <p className="text-sm text-blue-700">Includes detailed assessment, CSR matches, risk analysis and recommendations</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => window.open(analysisResult.pdf_link, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Protocol Analysis Metrics Card */}
            {analysisResult.confidence_score && (
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
                    Confidence Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col items-center mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-bold">{analysisResult.confidence_score}</h3>
                      <span className="text-sm text-muted-foreground">/100</span>
                      
                      {/* Verdict Icon */}
                      {analysisResult.confidence_verdict && (
                        <Badge 
                          className={`ml-2 ${
                            analysisResult.confidence_verdict.toLowerCase().includes('strong') 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : analysisResult.confidence_verdict.toLowerCase().includes('moderate')
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {analysisResult.confidence_verdict}
                        </Badge>
                      )}
                    </div>
                    <Progress 
                      value={analysisResult.confidence_score} 
                      className="h-2 w-full" 
                      indicatorClassName={
                        analysisResult.confidence_score > 75 
                          ? "bg-green-500" 
                          : analysisResult.confidence_score > 50 
                          ? "bg-amber-500" 
                          : "bg-red-500"
                      }
                    />
                  </div>
                  
                  {analysisResult.confidence_issues && analysisResult.confidence_issues.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-semibold mb-2">Identified Issues:</h4>
                      <ul className="text-sm space-y-1.5">
                        {analysisResult.confidence_issues.map((issue, idx) => (
                          <li key={idx} className="flex items-start">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Protocol Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="font-medium">Title:</dt>
                      <dd>{analysisResult.title || 'Not specified'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Indication:</dt>
                      <dd>
                        <Badge variant="outline">
                          {analysisResult.indication || 'Not specified'}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Phase:</dt>
                      <dd>
                        <Badge variant="outline">
                          {analysisResult.phase || 'Not specified'}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Sample Size:</dt>
                      <dd>{analysisResult.sample_size || 'Not specified'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Duration:</dt>
                      <dd>
                        {analysisResult.duration_weeks 
                          ? `${analysisResult.duration_weeks} weeks` 
                          : 'Not specified'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Arms:</dt>
                      <dd>{analysisResult.arms || 'Not specified'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Primary Endpoint:</dt>
                      <dd className="text-right">{analysisResult.primary_endpoint || 'Not specified'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {analysisResult.risk_factors && analysisResult.risk_factors.length > 0 ? (
                    <div className="space-y-2">
                      {analysisResult.risk_factors.map((risk, idx) => (
                        <RiskLevel key={idx} level={risk.severity.toLowerCase()}>
                          <div className="flex gap-2 items-start">
                            <AlertTriangle className={`h-4 w-4 ${
                              risk.severity.toLowerCase() === 'high' ? 'text-red-600' : 
                              risk.severity.toLowerCase() === 'medium' ? 'text-amber-600' : 
                              'text-green-600'
                            } mt-0.5`} />
                            <div>
                              <p className="text-sm font-medium">{risk.description}</p>
                              {risk.recommendation && (
                                <p className="text-xs mt-1">{risk.recommendation}</p>
                              )}
                            </div>
                          </div>
                        </RiskLevel>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                      <div className="text-center">
                        <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                        <p>No significant risks identified</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Matching CSR Precedents</CardTitle>
                <CardDescription>
                  Similar protocols from successful completed studies
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {analysisResult.matching_csrs && analysisResult.matching_csrs.length > 0 ? (
                  <ul className="space-y-3">
                    {analysisResult.matching_csrs.map((csr, idx) => (
                      <li key={idx} className="border p-3 rounded-md">
                        <div className="flex justify-between">
                          <strong className="text-sm">{csr.title}</strong>
                          <Badge variant="outline">{csr.id}</Badge>
                        </div>
                        <div className="text-xs mt-1 text-muted-foreground">
                          {csr.sponsor} • Phase {csr.phase} • {csr.sample_size} subjects
                        </div>
                        <div className="flex gap-2 mt-2">
                          {csr.similarity && (
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(csr.similarity * 100)}% match
                            </Badge>
                          )}
                          {csr.success && (
                            <Badge variant="success" className="text-xs bg-green-100 text-green-800 hover:bg-green-200">
                              Successful
                            </Badge>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                    <p>No matching CSRs found</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {analysisResult.recommendations ? (
                  <div className="text-sm whitespace-pre-wrap">
                    {analysisResult.recommendations}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                    <p>No specific recommendations provided</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {analysisResult.statistical_insights && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <BarChart4 className="h-4 w-4 mr-2" />
                    Statistical Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm whitespace-pre-wrap">
                    {analysisResult.statistical_insights}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}