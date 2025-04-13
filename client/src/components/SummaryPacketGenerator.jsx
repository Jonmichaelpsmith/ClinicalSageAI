import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { PackageCheck, Download, FileSpreadsheet, Share, ArrowRightCircle, AlertCircle, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { isValidSessionId, getInvalidSessionMessage, getSessionRequestOptions } from "@/utils/sessionUtils";

export default function SummaryPacketGenerator({ sessionId, onPacketGenerated = () => {} }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isPacketReady, setIsPacketReady] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [includeEndpoints, setIncludeEndpoints] = useState(true);
  const [includeSampleSize, setIncludeSampleSize] = useState(true);
  const [includeRegistry, setIncludeRegistry] = useState(true);
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const { toast } = useToast();

  // Handle packet generation
  const handleGeneratePacket = async () => {
    if (!isValidSessionId(sessionId)) {
      toast({
        title: "No Study Session",
        description: getInvalidSessionMessage(),
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for your summary packet",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // First, log this action to wisdom trace API for decision tracking
      try {
        await fetch('/api/wisdom/trace-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            study_id: sessionId,
            input: "Summary packet generation requested",
            reasoning: [
              "Analyzing protocol components for inclusion",
              "Determining relevant clinical evidence",
              "Structuring summary content for readability",
              "Preparing regulatory-aligned summary packet"
            ],
            output: "Generated comprehensive summary packet with key protocol elements"
          })
        });
      } catch (traceError) {
        console.error("Failed to log wisdom trace:", traceError);
      }

      // Start packet generation
      const response = await fetch("/api/summary-packet/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          study_id: sessionId,
          title,
          description,
          options: {
            includeEndpoints,
            includeSampleSize,
            includeRegistry,
            includeStatistics
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary packet");
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 500);

      const data = await response.json();
      
      // Clear interval if it's still running
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      // Update state
      setIsPacketReady(true);

      // Log the generation to insight memory
      try {
        await fetch('/api/insight/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            study_id: sessionId,
            title: "Summary Packet Generated",
            summary: `Generated "${title}" summary packet with ${Object.keys(data.sections || {}).length} sections.`,
            status: "completed"
          })
        });
      } catch (memoryError) {
        console.error("Failed to save memory:", memoryError);
      }

      // Call the callback
      onPacketGenerated(data);

      toast({
        title: "Summary Packet Ready",
        description: "Your protocol summary packet has been generated successfully.",
      });

    } catch (error) {
      console.error("Packet generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "An error occurred during packet generation.",
        variant: "destructive",
      });
      setGenerationProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle download
  const handleDownloadPacket = async () => {
    if (!isValidSessionId(sessionId)) {
      toast({
        title: "No Study Session",
        description: getInvalidSessionMessage(),
        variant: "destructive",
      });
      return;
    }

    try {
      // First, log this action to memory
      try {
        await fetch('/api/insight/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            study_id: sessionId,
            title: "Summary Packet Downloaded",
            summary: "Downloaded summary packet as PDF",
            status: "completed"
          })
        });
      } catch (memoryError) {
        console.error("Failed to log memory:", memoryError);
      }

      // Open the PDF in a new tab
      window.open("/static/summary_packet.pdf", "_blank");

      toast({
        title: "Download Started",
        description: "Your summary packet PDF is downloading.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: error.message || "An error occurred during download.",
        variant: "destructive",
      });
    }
  };

  // Handle sharing
  const handleSharePacket = async () => {
    if (!isValidSessionId(sessionId)) {
      toast({
        title: "No Study Session",
        description: getInvalidSessionMessage(),
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/summary-packet/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          study_id: sessionId,
          packet_id: title.replace(/\s+/g, '-').toLowerCase()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to share summary packet");
      }

      const data = await response.json();
      
      // Copy the share link to clipboard
      navigator.clipboard.writeText(data.shareUrl);

      // Log the share to memory
      try {
        await fetch('/api/insight/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            study_id: sessionId,
            title: "Summary Packet Shared",
            summary: `Created shareable link for "${title}" summary packet.`,
            status: "completed"
          })
        });
      } catch (memoryError) {
        console.error("Failed to log memory:", memoryError);
      }

      toast({
        title: "Share Link Created",
        description: "Link copied to clipboard. You can now share this with colleagues.",
      });

    } catch (error) {
      console.error("Share error:", error);
      toast({
        title: "Share Failed",
        description: error.message || "An error occurred while creating the share link.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PackageCheck className="mr-2 h-5 w-5" />
          Clinical Summary Packet
        </CardTitle>
        <CardDescription>
          Generate a comprehensive summary packet of your protocol
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isPacketReady ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="packet-title">Summary Title</Label>
              <Input 
                id="packet-title" 
                placeholder="e.g., Phase 2 NASH Trial Summary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="packet-description">Brief Description (Optional)</Label>
              <Textarea 
                id="packet-description"
                placeholder="Brief description of this summary packet..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <Label>Packet Contents</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-endpoints" 
                  checked={includeEndpoints}
                  onCheckedChange={setIncludeEndpoints}
                />
                <Label htmlFor="include-endpoints" className="text-sm cursor-pointer">
                  Endpoint Analysis
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-sample-size" 
                  checked={includeSampleSize}
                  onCheckedChange={setIncludeSampleSize}
                />
                <Label htmlFor="include-sample-size" className="text-sm cursor-pointer">
                  Sample Size Justification
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-registry" 
                  checked={includeRegistry}
                  onCheckedChange={setIncludeRegistry}
                />
                <Label htmlFor="include-registry" className="text-sm cursor-pointer">
                  Registry Requirements
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-statistics" 
                  checked={includeStatistics}
                  onCheckedChange={setIncludeStatistics}
                />
                <Label htmlFor="include-statistics" className="text-sm cursor-pointer">
                  Statistical Analysis Plan
                </Label>
              </div>
            </div>
            
            {isGenerating && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Generating packet...</span>
                  <span>{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} />
              </div>
            )}
          </>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Summary Packet Generated</AlertTitle>
            <AlertDescription>
              Your protocol summary packet is ready to download or share
            </AlertDescription>
          </Alert>
        )}
        
        <div className="text-sm text-muted-foreground">
          {isValidSessionId(sessionId) ? (
            <div className="text-green-600 flex items-center">
              <FileText className="mr-1 h-4 w-4" />
              Study session: {formatSessionId(sessionId)}
            </div>
          ) : (
            <div className="text-amber-600">
              Select a study session to generate a packet
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2">
        {!isPacketReady ? (
          <Button 
            onClick={handleGeneratePacket} 
            disabled={isGenerating || !title.trim() || !sessionId}
            className="w-full"
          >
            {isGenerating ? (
              <>Generating Packet...</>
            ) : (
              <>
                <ArrowRightCircle className="mr-2 h-4 w-4" />
                Generate Summary Packet
              </>
            )}
          </Button>
        ) : (
          <>
            <Button variant="default" onClick={handleDownloadPacket} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleSharePacket} className="flex-1">
              <Share className="mr-2 h-4 w-4" />
              Create Share Link
            </Button>
            <Button variant="ghost" onClick={() => setIsPacketReady(false)} className="flex-1">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              New Packet
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}