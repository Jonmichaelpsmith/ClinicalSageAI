import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, RefreshCw, Save, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '../../services/api';

type Preferences = {
  email: boolean;
  teams: boolean;
  warning_alerts: boolean;
  error_alerts: boolean;
};

export default function AlertPreferencesPanel() {
  const [preferences, setPreferences] = useState<Preferences>({
    email: true,
    teams: false,
    warning_alerts: true,
    error_alerts: true
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  // Load preferences on component mount
  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/ind-automation/alert-preferences');
      
      if (response.data.success) {
        setPreferences(response.data.preferences);
      }
    } catch (error) {
      console.error('Failed to load alert preferences:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load your alert preferences.'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveUserPreferences = async () => {
    setSaving(true);
    try {
      const response = await api.post('/api/ind-automation/alert-preferences', { 
        preferences 
      });
      
      if (response.data.success) {
        toast({
          title: 'Preferences Saved',
          description: 'Your alert preferences have been updated successfully.',
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save alert preferences:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save your alert preferences.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof Preferences) => (value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alert Channel Preferences
        </CardTitle>
        <CardDescription>
          Customize how and when you receive monitoring alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Channels</h3>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="email-alerts" className="flex-1">
                Email Alerts
                <p className="text-xs text-muted-foreground">
                  Receive alerts via email
                </p>
              </Label>
            </div>
            <Switch
              id="email-alerts"
              checked={preferences.email}
              onCheckedChange={handleChange('email')}
              disabled={loading || saving}
            />
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="teams-alerts" className="flex-1">
                Microsoft Teams
                <p className="text-xs text-muted-foreground">
                  Receive alerts via Teams channel
                </p>
              </Label>
            </div>
            <Switch
              id="teams-alerts"
              checked={preferences.teams}
              onCheckedChange={handleChange('teams')}
              disabled={loading || saving}
            />
          </div>
        </div>
        
        <div className="space-y-4 pt-3">
          <h3 className="text-sm font-medium">Alert Types</h3>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="warning-alerts" className="flex-1">
                Warning Alerts
                <p className="text-xs text-muted-foreground">
                  Example: Certificate expiring soon
                </p>
              </Label>
            </div>
            <Switch
              id="warning-alerts"
              checked={preferences.warning_alerts}
              onCheckedChange={handleChange('warning_alerts')}
              disabled={loading || saving}
            />
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="error-alerts" className="flex-1">
                Error Alerts
                <p className="text-xs text-muted-foreground">
                  Example: Service down, certificate expired
                </p>
              </Label>
            </div>
            <Switch
              id="error-alerts"
              checked={preferences.error_alerts}
              onCheckedChange={handleChange('error_alerts')}
              disabled={loading || saving}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={loadUserPreferences}
          disabled={loading || saving}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button 
          onClick={saveUserPreferences}
          disabled={loading || saving}
        >
          {success ? (
            <CheckCircle className="h-4 w-4 mr-1" />
          ) : saving ? (
            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          {success ? 'Saved' : saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardFooter>
    </Card>
  );
}