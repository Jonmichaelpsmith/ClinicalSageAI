// client/src/pages/Settings.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  RefreshCw, 
  Save, 
  Globe, 
  Key, 
  Lock, 
  FileKey,
  ScreenShare,
  Database,
  Palette,
  Upload,
  RotateCw,
  FileJson,
  AlertTriangle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const Settings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  
  // Get organization ID from context (would come from your TenantContext)
  const organizationId = '1'; // Placeholder - would come from TenantContext
  
  // Fetch organization settings
  const { 
    data: settingsData, 
    isLoading: isLoadingSettings,
    isError: isSettingsError,
    error: settingsError
  } = useQuery({
    queryKey: ['/api/organizations', organizationId, 'settings'],
    queryFn: () => apiRequest(`/api/organizations/${organizationId}/settings`)
  });
  
  // Update organization settings
  const updateSettingsMutation = useMutation({
    mutationFn: (data) => apiRequest(`/api/organizations/${organizationId}/settings`, {
      method: 'PATCH',
      data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/organizations', organizationId, 'settings']);
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    }
  });
  
  const handleUpdateSettings = (formData) => {
    updateSettingsMutation.mutate(formData);
  };
  
  // Loading state
  if (isLoadingSettings) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your organization and application settings
            </p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="col-span-12 md:col-span-9">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (isSettingsError) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-red-300">
          <CardHeader>
            <CardTitle className="text-lg text-red-500">Error Loading Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{settingsError?.message || "Failed to load settings. Please try again later."}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => queryClient.invalidateQueries(['/api/organizations', organizationId, 'settings'])}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // For development
  const settings = settingsData?.settings || {
    general: {
      organizationName: "Your Organization",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
      language: "en"
    },
    security: {
      mfaEnabled: false,
      passwordPolicy: {
        minLength: 10,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: true,
        historyCount: 5
      },
      sessionTimeout: 30
    },
    notifications: {
      emailNotifications: true,
      projectUpdates: true,
      securityAlerts: true,
      systemAnnouncements: true
    },
    integrations: {
      openaiApiKey: "",
      openaiEnabled: false,
      vaultEnabled: false,
      vaultUrl: "",
      vaultApiKey: ""
    },
    appearance: {
      theme: "light",
      accentColor: "#4f46e5",
      compactMode: false
    },
    advanced: {
      debugMode: false,
      betaFeatures: false,
      dataRetentionDays: 90
    }
  };
  
  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <Globe className="h-4 w-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
    { id: 'advanced', label: 'Advanced', icon: <Database className="h-4 w-4" /> },
  ];
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your organization and application settings
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Settings Navigation */}
        <div className="col-span-12 md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
              <CardDescription>Configure your environment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-0">
              <div className="flex flex-col">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`flex items-center gap-2 px-6 py-3 text-left transition ${
                      activeTab === tab.id 
                        ? 'bg-muted text-primary font-medium' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Settings Content */}
        <div className="col-span-12 md:col-span-9">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {tabs.find(t => t.id === activeTab)?.label} Settings
              </CardTitle>
              <CardDescription>
                {activeTab === 'general' && "Configure basic organization settings"}
                {activeTab === 'security' && "Manage security and access controls"}
                {activeTab === 'notifications' && "Configure notification preferences"}
                {activeTab === 'integrations' && "Manage third-party integrations"}
                {activeTab === 'appearance' && "Customize the application appearance"}
                {activeTab === 'advanced' && "Advanced system configuration options"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="organizationName" className="text-sm font-medium">Organization Name</label>
                    <Input
                      id="organizationName"
                      defaultValue={settings.general.organizationName}
                      placeholder="Your Organization"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="timezone" className="text-sm font-medium">Timezone</label>
                      <select 
                        id="timezone" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        defaultValue={settings.general.timezone}
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="dateFormat" className="text-sm font-medium">Date Format</label>
                      <select 
                        id="dateFormat" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        defaultValue={settings.general.dateFormat}
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="language" className="text-sm font-medium">Language</label>
                    <select 
                      id="language" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      defaultValue={settings.general.language}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ja">Japanese</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Language settings apply to the user interface and some documents
                    </p>
                  </div>
                </div>
              )}
              
              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Multi-Factor Authentication</h3>
                      <p className="text-xs text-muted-foreground">
                        Require MFA for all users in this organization
                      </p>
                    </div>
                    <Switch defaultChecked={settings.security.mfaEnabled} />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Password Policy</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="minLength" className="text-xs font-medium">Minimum Length</label>
                          <Input
                            id="minLength"
                            type="number"
                            min="8"
                            max="32"
                            defaultValue={settings.security.passwordPolicy.minLength}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="historyCount" className="text-xs font-medium">Password History</label>
                          <Input
                            id="historyCount"
                            type="number"
                            min="0"
                            max="24"
                            defaultValue={settings.security.passwordPolicy.historyCount}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1 pt-2">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="requireUppercase" 
                            defaultChecked={settings.security.passwordPolicy.requireUppercase} 
                          />
                          <label htmlFor="requireUppercase" className="text-xs">
                            Require uppercase letters
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="requireLowercase" 
                            defaultChecked={settings.security.passwordPolicy.requireLowercase} 
                          />
                          <label htmlFor="requireLowercase" className="text-xs">
                            Require lowercase letters
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="requireNumber" 
                            defaultChecked={settings.security.passwordPolicy.requireNumber} 
                          />
                          <label htmlFor="requireNumber" className="text-xs">
                            Require numbers
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="requireSpecial" 
                            defaultChecked={settings.security.passwordPolicy.requireSpecial} 
                          />
                          <label htmlFor="requireSpecial" className="text-xs">
                            Require special characters
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="space-y-2">
                      <label htmlFor="sessionTimeout" className="text-sm font-medium">Session Timeout (minutes)</label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        min="5"
                        max="1440"
                        defaultValue={settings.security.sessionTimeout}
                      />
                      <p className="text-xs text-muted-foreground">
                        Users will be automatically logged out after this period of inactivity
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Email Notifications</h3>
                      <p className="text-xs text-muted-foreground">
                        Send email notifications for important events
                      </p>
                    </div>
                    <Switch defaultChecked={settings.notifications.emailNotifications} />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Notification Types</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="projectUpdates" className="text-xs">
                          Project updates and changes
                        </label>
                        <Switch 
                          id="projectUpdates" 
                          defaultChecked={settings.notifications.projectUpdates} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="securityAlerts" className="text-xs">
                          Security alerts and warnings
                        </label>
                        <Switch 
                          id="securityAlerts" 
                          defaultChecked={settings.notifications.securityAlerts} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="systemAnnouncements" className="text-xs">
                          System announcements and updates
                        </label>
                        <Switch 
                          id="systemAnnouncements" 
                          defaultChecked={settings.notifications.systemAnnouncements} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Integrations Settings */}
              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          OpenAI Integration
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Connect to OpenAI for enhanced AI capabilities
                        </p>
                      </div>
                      <Switch defaultChecked={settings.integrations.openaiEnabled} />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="openaiApiKey" className="text-xs font-medium">API Key</label>
                      <div className="relative">
                        <Input
                          id="openaiApiKey"
                          type="password"
                          defaultValue={settings.integrations.openaiApiKey}
                          placeholder="sk-..."
                        />
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
                        >
                          <FileKey className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The API key is stored encrypted and never exposed
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Vault Integration
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Connect to document vault for secure storage
                        </p>
                      </div>
                      <Switch defaultChecked={settings.integrations.vaultEnabled} />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="vaultUrl" className="text-xs font-medium">Vault URL</label>
                      <Input
                        id="vaultUrl"
                        defaultValue={settings.integrations.vaultUrl}
                        placeholder="https://vault.example.com"
                      />
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      <label htmlFor="vaultApiKey" className="text-xs font-medium">Vault API Key</label>
                      <div className="relative">
                        <Input
                          id="vaultApiKey"
                          type="password"
                          defaultValue={settings.integrations.vaultApiKey}
                          placeholder="vault-..."
                        />
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
                        >
                          <FileKey className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="theme" className="text-sm font-medium">Theme</label>
                    <select 
                      id="theme" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      defaultValue={settings.appearance.theme}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Select the appearance theme for the application
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="accentColor" className="text-sm font-medium">Accent Color</label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        defaultValue={settings.appearance.accentColor}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        defaultValue={settings.appearance.accentColor}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <h3 className="text-sm font-medium">Compact Mode</h3>
                      <p className="text-xs text-muted-foreground">
                        Reduce padding and spacing throughout the interface
                      </p>
                    </div>
                    <Switch defaultChecked={settings.appearance.compactMode} />
                  </div>
                </div>
              )}
              
              {/* Advanced Settings */}
              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800">Caution</h4>
                        <p className="text-xs text-amber-700">
                          These advanced settings may affect system behavior and performance.
                          Changes should be made with care.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Debug Mode</h3>
                      <p className="text-xs text-muted-foreground">
                        Enable detailed logging for troubleshooting
                      </p>
                    </div>
                    <Switch defaultChecked={settings.advanced.debugMode} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Beta Features</h3>
                      <p className="text-xs text-muted-foreground">
                        Enable experimental features that are still in development
                      </p>
                    </div>
                    <Switch defaultChecked={settings.advanced.betaFeatures} />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <label htmlFor="dataRetentionDays" className="text-sm font-medium">Data Retention Period (days)</label>
                    <Input
                      id="dataRetentionDays"
                      type="number"
                      min="1"
                      max="3650"
                      defaultValue={settings.advanced.dataRetentionDays}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of days to retain temporary files and logs
                    </p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-medium">Data Management</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-auto py-2">
                        <FileJson className="h-4 w-4 mr-2" />
                        <div className="text-left">
                          <span className="block text-xs font-medium">Export Settings</span>
                          <span className="block text-xs text-muted-foreground">Download as JSON</span>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="h-auto py-2">
                        <Upload className="h-4 w-4 mr-2" />
                        <div className="text-left">
                          <span className="block text-xs font-medium">Import Settings</span>
                          <span className="block text-xs text-muted-foreground">Load from file</span>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="h-auto py-2 text-amber-600 border-amber-200">
                        <RotateCw className="h-4 w-4 mr-2" />
                        <div className="text-left">
                          <span className="block text-xs font-medium">Reset to Default</span>
                          <span className="block text-xs text-muted-foreground">Restore default settings</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <div className="flex justify-between w-full">
                <Button variant="outline">
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleUpdateSettings(settings)}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;