import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Copy, Save } from 'lucide-react';

export default function Settings() {
  const [apiKey, setApiKey] = useState('sk_test_12345abcdefghijklmnopqrstuvwxyz');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    enableAuditLog: true,
    enableAutoBackup: true,
    darkMode: false,
    notificationsEnabled: true
  });

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      console.log('Toast would show:', {
        title: "Copied to clipboard",
        description: "API key copied to clipboard"
      });
    }
  };
  
  const displayApiKey = isRevealed && apiKey ? apiKey : apiKey ? "•".repeat(Math.min(apiKey.length, 30)) : "";

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Success message
    console.log('Toast would show:', {
      title: "Settings Saved",
      description: "Your settings have been updated successfully"
    });
    
    setIsSaving(false);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Manage general application settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="audit-log">Enable Audit Log</Label>
                    <p className="text-sm text-muted-foreground">Record all user actions for compliance</p>
                  </div>
                  <Switch 
                    id="audit-log" 
                    checked={settings.enableAuditLog}
                    onCheckedChange={() => handleToggle('enableAuditLog')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-backup">Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">Enable daily data backups</p>
                  </div>
                  <Switch 
                    id="auto-backup" 
                    checked={settings.enableAutoBackup}
                    onCheckedChange={() => handleToggle('enableAutoBackup')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                  </div>
                  <Switch 
                    id="dark-mode" 
                    checked={settings.darkMode}
                    onCheckedChange={() => handleToggle('darkMode')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for third-party integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="api-key">TrialSage API Key</Label>
                <div className="flex mt-2">
                  <div className="relative flex-grow">
                    <Input
                      id="api-key"
                      value={displayApiKey}
                      readOnly
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-8 top-0"
                      onClick={() => setIsRevealed(!isRevealed)}
                    >
                      {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={handleCopy}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This key is used for authenticating API requests
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage application security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    defaultValue={30}
                    min={5}
                    max={120}
                    className="w-full mt-2"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch id="two-factor" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                </div>
                <Switch 
                  id="email-notifications" 
                  checked={settings.notificationsEnabled}
                  onCheckedChange={() => handleToggle('notificationsEnabled')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}