// client/src/components/SessionSummaryPanel.jsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RefreshCw, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SessionSummaryPanel({ sessionId, autoRefresh = true }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchSummary = async () => {
    if (!sessionId) return;
    
    try {
      setRefreshing(true);
      const response = await fetch(`/api/session/summary/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch session summary: ${response.status}`);
      }
      
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching session summary:", error);
      toast({
        title: "Error",
        description: "Failed to load session snapshot data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    
    // Set up auto-refresh every 30 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchSummary, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionId, autoRefresh]);

  const handleManualRefresh = () => {
    fetchSummary();
    toast({
      title: "Refreshed",
      description: "Session snapshot updated"
    });
  };

  // Get a readable date from ISO string
  const formatDate = (isoString) => {
    if (!isoString) return "Never";
    
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  // Format to readable file names
  const prettifyKey = (key) => {
    const map = {
      dropout_forecast: "Dropout Forecast",
      success_prediction: "Success Prediction",
      ind_summary: "IND Module 2.5",
      sap_summary: "SAP Document",
      summary_packet: "Summary Packet PDF",
      regulatory_bundle: "Regulatory Bundle ZIP"
    };
    
    return map[key] || key;
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Session Snapshot
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleManualRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex justify-center py-4">
            <RefreshCw className="animate-spin h-5 w-5 text-muted-foreground" />
          </div>
        ) : summary ? (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Last Updated: {formatDate(summary.last_updated)}
            </div>
            <ul className="space-y-2">
              {summary.generated_files && Object.entries(summary.generated_files).map(([key, generated]) => (
                <li key={key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    {generated ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-300 mr-2" />
                    )}
                    {prettifyKey(key)}
                  </span>
                  <Badge variant={generated ? "default" : "outline"} className="text-xs">
                    {generated ? "Generated" : "Pending"}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-2 text-sm text-muted-foreground">
            No session data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}