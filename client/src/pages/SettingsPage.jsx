import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Settings, Bell, Shield, Cloud, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Platform Settings</h2>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5 text-blue-600" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure general platform settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-gray-500">Use dark theme throughout the application</p>
                </div>
                <Switch id="dark-mode" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <span className="text-sm font-medium">30</span>
                </div>
                <Slider defaultValue={[30]} max={120} step={5} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">Auto-save Documents</Label>
                  <p className="text-sm text-gray-500">Automatically save document changes</p>
                </div>
                <Switch id="auto-save" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-orange-600" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive important updates via email</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">In-app Notifications</Label>
                  <p className="text-sm text-gray-500">Show notifications within the platform</p>
                </div>
                <Switch id="push-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="document-notifications">Document Updates</Label>
                  <p className="text-sm text-gray-500">Get notified when documents are modified</p>
                </div>
                <Switch id="document-notifications" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-green-600" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
                </div>
                <Switch id="two-factor" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="password-policy">Strict Password Policy</Label>
                  <p className="text-sm text-gray-500">Enforce complex passwords</p>
                </div>
                <Switch id="password-policy" defaultChecked />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                  <span className="text-sm font-medium">90</span>
                </div>
                <Slider defaultValue={[90]} max={180} step={15} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cloud className="mr-2 h-5 w-5 text-purple-600" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Configure system-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">Put system in maintenance mode</p>
                </div>
                <Switch id="maintenance-mode" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="debug-mode">Debug Logging</Label>
                  <p className="text-sm text-gray-500">Enable verbose logging</p>
                </div>
                <Switch id="debug-mode" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="audit-logging">Audit Logging</Label>
                  <p className="text-sm text-gray-500">Track all user actions</p>
                </div>
                <Switch id="audit-logging" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end mt-6">
        <Button className="flex items-center">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}