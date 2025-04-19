import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import api from "../../services/api";

/**
 * TeamsSettingsPanel Component
 * 
 * This component allows customers to configure their Microsoft Teams webhook URL 
 * for receiving compliance and credential alerts.
 * 
 * @param props Component properties
 * @param props.projectId The current project/organization ID
 */
export function TeamsSettingsPanel({ projectId }: { projectId: string }) {
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load existing webhook configuration when project changes
  useEffect(() => {
    if (!projectId) return;
    
    const fetchWebhookConfig = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/ind/${projectId}/teams-webhook`);
        if (response.data && response.data.webhook_url) {
          setWebhookUrl(response.data.webhook_url);
        }
      } catch (error) {
        console.error("Error fetching Teams webhook configuration:", error);
        // It's OK if there's no webhook configured yet - this will be a new setup
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWebhookConfig();
  }, [projectId]);

  const handleSave = async () => {
    if (!projectId) {
      setStatusMessage({
        type: "error",
        message: "No project selected. Please select a project first.",
      });
      return;
    }

    setIsSaving(true);
    setStatusMessage({ type: null, message: "" });

    try {
      await api.post(`/api/ind/${projectId}/teams-webhook`, {
        webhook_url: webhookUrl,
      });
      
      setStatusMessage({
        type: "success",
        message: "Teams webhook URL saved successfully! Alerts will be sent to your Teams channel.",
      });
      
      // Send a test notification
      await api.post(`/api/ind/${projectId}/teams-webhook/test`);
    } catch (error) {
      console.error("Error saving Teams webhook:", error);
      setStatusMessage({
        type: "error",
        message: "Failed to save Teams webhook URL. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (!projectId) return;
    
    setIsSaving(true);
    try {
      await api.delete(`/api/ind/${projectId}/teams-webhook`);
      setWebhookUrl("");
      setStatusMessage({
        type: "info",
        message: "Teams webhook URL has been removed. You will no longer receive Teams alerts.",
      });
    } catch (error) {
      console.error("Error removing Teams webhook:", error);
      setStatusMessage({
        type: "error",
        message: "Failed to remove Teams webhook URL. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Microsoft Teams Alerts</CardTitle>
        <CardDescription>
          Configure Microsoft Teams webhook to receive alerts about credential expirations and security events.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {statusMessage.type && (
              <Alert variant={statusMessage.type === "error" ? "destructive" : "default"}>
                {statusMessage.type === "success" && (
                  <CheckCircle className="h-4 w-4" />
                )}
                {statusMessage.type === "error" && (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {statusMessage.type === "success" && "Success"}
                  {statusMessage.type === "error" && "Error"}
                  {statusMessage.type === "info" && "Information"}
                </AlertTitle>
                <AlertDescription>{statusMessage.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="teams-webhook">Teams Webhook URL</Label>
              <Input
                id="teams-webhook"
                placeholder="https://company.webhook.office.com/webhookb2/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                disabled={isSaving}
              />
              <p className="text-sm text-muted-foreground">
                Enter the webhook URL from your Microsoft Teams channel. You can create one by going to a Teams channel, clicking "..." menu → Connectors → Incoming Webhook.
              </p>
            </div>

            <div className="flex space-x-2 mt-4">
              <Button 
                onClick={handleSave}
                disabled={isSaving || !webhookUrl.trim()}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save & Test"
                )}
              </Button>
              
              {webhookUrl && (
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  disabled={isSaving}
                >
                  Clear Webhook
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-start border-t pt-4">
        <h4 className="text-sm font-semibold mb-2">What you'll receive:</h4>
        <ul className="text-sm space-y-1 list-disc pl-4">
          <li>ESG key expiration alerts (keys older than 12 months)</li>
          <li>SAML certificate expiration alerts (certificates expiring in less than 30 days)</li>
          <li>Critical security events and system notifications</li>
        </ul>
      </CardFooter>
    </Card>
  );
}

export default TeamsSettingsPanel;