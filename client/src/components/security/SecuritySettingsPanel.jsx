import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldAlert, Clock, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react';
import { secureLocalStorage } from '@/lib/security';

// Default security settings
const defaultSettings = {
  autoLogoutEnabled: true,
  autoLogoutTime: 30, // minutes
  encryptLocalStorage: true,
  auditLoggingEnabled: false,
  sensitiveDataMasking: true,
  documentIntegrityCheck: true,
  securityLevel: 'standard', // 'basic', 'standard', 'high'
  notifications: {
    securityEvents: true,
    loginAttempts: true,
    documentAccess: false
  }
};

const SecuritySettingsPanel = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const savedSettings = await secureLocalStorage.getItem('securitySettings');
        
        if (savedSettings) {
          setSettings({...defaultSettings, ...savedSettings});
        }
      } catch (error) {
        console.error('Error loading security settings:', error);
        toast({
          title: "Error loading settings",
          description: "Could not load your security settings. Using defaults.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Save to secure storage
      await secureLocalStorage.setItem('securitySettings', settings);
      
      // Enable/disable audit logging based on setting
      localStorage.setItem('enableAuditLogging', settings.auditLoggingEnabled.toString());
      
      toast({
        title: "Settings Saved",
        description: "Your security preferences have been updated.",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast({
        title: "Error saving settings",
        description: "An error occurred while saving your security settings.",
        variant: "destructive",
        icon: <XCircle className="h-4 w-4" />
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle toggle changes
  const handleToggle = (field) => {
    setSettings({
      ...settings,
      [field]: !settings[field]
    });
  };
  
  // Handle notification toggles
  const handleNotificationToggle = (field) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [field]: !settings.notifications[field]
      }
    });
  };
  
  // Handle slider changes
  const handleSliderChange = (value) => {
    setSettings({
      ...settings,
      autoLogoutTime: value[0]
    });
  };
  
  // Handle security level changes
  const handleSecurityLevelChange = (value) => {
    // Preset configurations for different security levels
    const securityLevels = {
      basic: {
        autoLogoutEnabled: false,
        autoLogoutTime: 60,
        encryptLocalStorage: false,
        sensitiveDataMasking: true,
        documentIntegrityCheck: false
      },
      standard: {
        autoLogoutEnabled: true,
        autoLogoutTime: 30,
        encryptLocalStorage: true,
        sensitiveDataMasking: true,
        documentIntegrityCheck: true
      },
      high: {
        autoLogoutEnabled: true,
        autoLogoutTime: 15,
        encryptLocalStorage: true,
        sensitiveDataMasking: true,
        documentIntegrityCheck: true
      }
    };
    
    setSettings({
      ...settings,
      ...securityLevels[value],
      securityLevel: value
    });
  };
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hotpink"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-hotpink" />
          <CardTitle>Security Settings</CardTitle>
        </div>
        <CardDescription>
          Configure your TrialSage security and privacy preferences
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Security Level Preset */}
        <div className="space-y-2">
          <Label htmlFor="security-level" className="font-medium">
            Security Level
          </Label>
          <Select
            value={settings.securityLevel}
            onValueChange={handleSecurityLevelChange}
          >
            <SelectTrigger id="security-level" className="w-full">
              <SelectValue placeholder="Select security level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic - Minimal Security</SelectItem>
              <SelectItem value="standard">Standard - Recommended</SelectItem>
              <SelectItem value="high">High - Enhanced Protection</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Choose a preset security level or customize individual settings below
          </p>
        </div>
        
        {/* Session Security */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-hotpink" />
            <h3 className="font-medium">Session Security</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-logout">Automatic Logout</Label>
              <p className="text-sm text-muted-foreground">
                Automatically log out after a period of inactivity
              </p>
            </div>
            <Switch
              id="auto-logout"
              checked={settings.autoLogoutEnabled}
              onCheckedChange={() => handleToggle('autoLogoutEnabled')}
            />
          </div>
          
          {settings.autoLogoutEnabled && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="logout-time">Inactivity Timeout</Label>
                <span className="text-sm font-medium">{settings.autoLogoutTime} minutes</span>
              </div>
              <Slider
                id="logout-time"
                value={[settings.autoLogoutTime]}
                min={5}
                max={60}
                step={5}
                onValueChange={handleSliderChange}
              />
              <p className="text-xs text-muted-foreground">
                Set how long before inactivity triggers automatic logout
              </p>
            </div>
          )}
        </div>
        
        {/* Data Security */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-hotpink" />
            <h3 className="font-medium">Data Security</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="encrypt-storage">Encrypt Local Storage</Label>
              <p className="text-sm text-muted-foreground">
                Encrypt sensitive data stored on your device
              </p>
            </div>
            <Switch
              id="encrypt-storage"
              checked={settings.encryptLocalStorage}
              onCheckedChange={() => handleToggle('encryptLocalStorage')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="data-masking">Sensitive Data Masking</Label>
              <p className="text-sm text-muted-foreground">
                Hide sensitive information in the interface
              </p>
            </div>
            <Switch
              id="data-masking"
              checked={settings.sensitiveDataMasking}
              onCheckedChange={() => handleToggle('sensitiveDataMasking')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="integrity-check">Document Integrity Check</Label>
              <p className="text-sm text-muted-foreground">
                Verify documents for tampering before operations
              </p>
            </div>
            <Switch
              id="integrity-check"
              checked={settings.documentIntegrityCheck}
              onCheckedChange={() => handleToggle('documentIntegrityCheck')}
            />
          </div>
        </div>
        
        {/* Security Monitoring */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-hotpink" />
            <h3 className="font-medium">Security Monitoring</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="audit-logging">Client-Side Audit Logging</Label>
              <p className="text-sm text-muted-foreground">
                Record security events in browser console (for troubleshooting)
              </p>
            </div>
            <Switch
              id="audit-logging"
              checked={settings.auditLoggingEnabled}
              onCheckedChange={() => handleToggle('auditLoggingEnabled')}
            />
          </div>
        </div>
        
        {/* Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-hotpink" />
            <h3 className="font-medium">Security Notifications</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="notify-security">Security Events</Label>
            <Switch
              id="notify-security"
              checked={settings.notifications.securityEvents}
              onCheckedChange={() => handleNotificationToggle('securityEvents')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="notify-login">Login Attempts</Label>
            <Switch
              id="notify-login"
              checked={settings.notifications.loginAttempts}
              onCheckedChange={() => handleNotificationToggle('loginAttempts')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="notify-document">Document Access</Label>
            <Switch
              id="notify-document"
              checked={settings.notifications.documentAccess}
              onCheckedChange={() => handleNotificationToggle('documentAccess')}
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="ml-auto bg-hotpink hover:bg-hotpink/90"
        >
          {saving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Saving...
            </>
          ) : "Save Security Settings"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SecuritySettingsPanel;