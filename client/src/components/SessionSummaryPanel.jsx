// /client/components/SessionSummaryPanel.jsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, DownloadCloud, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

export default function SessionSummaryPanel({ sessionId }) {
  const [sessionSummary, setSessionSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Fetch session summary data
  useEffect(() => {
    const fetchSessionSummary = async () => {
      if (!sessionId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/session/summary/${sessionId}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching session summary: ${response.statusText}`);
        }
        
        const data = await response.json();
        setSessionSummary(data);
      } catch (err) {
        console.error("Failed to fetch session summary:", err);
        setError("Failed to load session summary data");
        toast({
          title: "Error",
          description: "Failed to load session summary data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionSummary();
    
    // Set up an interval to refresh the data every 60 seconds
    const intervalId = setInterval(fetchSessionSummary, 60000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [sessionId, toast]);

  // Format the date/time for display
  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return "Not yet updated";
    try {
      const date = new Date(timestamp);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (err) {
      return timestamp;
    }
  };

  // Format artifact status check
  const ArtifactStatus = ({ isGenerated, label }) => (
    <div className="flex items-center gap-2">
      {isGenerated ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-gray-300" />
      )}
      <span className={isGenerated ? "font-medium" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );

  // Handle export of summary snapshot
  const handleExportSnapshot = async () => {
    if (!sessionSummary) return;
    
    const jsonString = JSON.stringify(sessionSummary, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-summary-${sessionId}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Snapshot Exported",
      description: "Session summary snapshot has been downloaded"
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 pb-4">
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!sessionSummary) {
    return (
      <Card>
        <CardContent className="pt-6 pb-4">
          <div className="text-muted-foreground">No session data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Session Status Snapshot
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSnapshot}
            className="h-8"
          >
            <DownloadCloud className="h-4 w-4 mr-2" />
            Export Snapshot
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
          <span>Last updated:</span>
          <span className="font-medium text-foreground">{formatLastUpdated(sessionSummary.last_updated)}</span>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium mb-2">Generated Files:</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <ArtifactStatus 
              isGenerated={sessionSummary.generated_files.dropout_forecast}
              label="Dropout Forecast"
            />
            <ArtifactStatus 
              isGenerated={sessionSummary.generated_files.success_prediction}
              label="Success Prediction"
            />
            <ArtifactStatus 
              isGenerated={sessionSummary.generated_files.ind_summary}
              label="IND Summary"
            />
            <ArtifactStatus 
              isGenerated={sessionSummary.generated_files.sap_summary}
              label="SAP Document"
            />
            <ArtifactStatus 
              isGenerated={sessionSummary.generated_files.summary_packet}
              label="Summary Packet"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}