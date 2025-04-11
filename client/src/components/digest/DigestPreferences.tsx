import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input'; 
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface DigestPreferences {
  include_exports: boolean;
  include_risk_changes: boolean;
  include_version_changes: boolean;
  include_sap: boolean;
  risk_change_threshold: number;
}

export default function DigestPreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<DigestPreferences>({
    include_exports: true,
    include_risk_changes: true,
    include_version_changes: true,
    include_sap: false,
    risk_change_threshold: 10
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Load user preferences on component mount
  useEffect(() => {
    if (!user) return;
    
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/preferences?user_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.prefs) {
            setPrefs(data.prefs);
          }
        }
      } catch (error) {
        console.error('Error fetching digest preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPreferences();
  }, [user]);
  
  const handleSavePreferences = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/user/save-digest-prefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id, 
          prefs 
        })
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Digest preferences saved successfully",
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving digest preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save digest preferences",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Loading preferences...</span>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Weekly Digest Preferences</CardTitle>
        <CardDescription>
          Customize what information you receive in your weekly digest emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="include_exports" className="flex-1">Show exported reports</Label>
            <Switch 
              id="include_exports"
              checked={prefs.include_exports}
              onCheckedChange={(checked) => setPrefs({ ...prefs, include_exports: checked })}
            />
          </div>
          <p className="text-sm text-slate-500">Receive summaries of reports you've exported</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="include_risk_changes" className="flex-1">Show risk changes</Label>
            <Switch 
              id="include_risk_changes"
              checked={prefs.include_risk_changes}
              onCheckedChange={(checked) => setPrefs({ ...prefs, include_risk_changes: checked })}
            />
          </div>
          <p className="text-sm text-slate-500">Alert when predicted success rates change significantly</p>
          
          {prefs.include_risk_changes && (
            <div className="pt-2">
              <Label htmlFor="risk_threshold">Minimum change threshold (%)</Label>
              <div className="flex items-center gap-4 pt-2">
                <Slider
                  id="risk_threshold"
                  value={[prefs.risk_change_threshold]}
                  onValueChange={(value) => setPrefs({ ...prefs, risk_change_threshold: value[0] })}
                  max={50}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <Input 
                  type="number" 
                  value={prefs.risk_change_threshold}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1 && value <= 50) {
                      setPrefs({ ...prefs, risk_change_threshold: value });
                    }
                  }}
                  className="w-16"
                  min={1}
                  max={50}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Only show changes greater than {prefs.risk_change_threshold}%
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="include_version_changes" className="flex-1">Show protocol version changes</Label>
            <Switch 
              id="include_version_changes"
              checked={prefs.include_version_changes}
              onCheckedChange={(checked) => setPrefs({ ...prefs, include_version_changes: checked })}
            />
          </div>
          <p className="text-sm text-slate-500">Receive updates on protocol version comparisons</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="include_sap" className="flex-1">Show SAP exports only</Label>
            <Switch 
              id="include_sap"
              checked={prefs.include_sap}
              onCheckedChange={(checked) => setPrefs({ ...prefs, include_sap: checked })}
            />
          </div>
          <p className="text-sm text-slate-500">Filter for Statistical Analysis Plans (SAPs)</p>
        </div>
        
        <Button 
          onClick={handleSavePreferences} 
          className="w-full mt-4"
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving preferences...
            </>
          ) : (
            <>💾 Save Digest Preferences</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}