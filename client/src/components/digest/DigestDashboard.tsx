import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw, Mail } from 'lucide-react';
import DigestPreferences from './DigestPreferences';

export default function DigestDashboard() {
  const { user } = useAuth();
  const [digest, setDigest] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('digest');
  
  const fetchDigest = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/digest/get-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setDigest(data.digest || data.message || 'No activity in the past week.');
      } else {
        throw new Error(data.message || 'Failed to fetch digest data');
      }
    } catch (error) {
      console.error('Error fetching digest:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load weekly digest',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Load digest on component mount
  useEffect(() => {
    if (user) {
      fetchDigest();
    }
  }, [user]);
  
  const handleSendDigest = async () => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'No email address available for this user',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setSending(true);
      const response = await fetch('/api/notify/send-weekly-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          user_email: user.email
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Weekly digest email sent successfully',
        });
      } else {
        throw new Error(data.message || 'Failed to send digest email');
      }
    } catch (error) {
      console.error('Error sending digest email:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send digest email',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };
  
  const formatDigestContent = (content: string) => {
    if (!content) return <p className="text-slate-500">No activity in the past week.</p>;
    
    // Simple formatting for digest content
    return (
      <div className="whitespace-pre-wrap">
        {content.split('\n\n').map((paragraph, idx) => {
          if (paragraph.trim().startsWith('📊')) {
            return <h3 key={idx} className="font-bold text-blue-700 text-lg mb-4">{paragraph}</h3>;
          }
          if (paragraph.includes(':')) {
            const [title, ...rest] = paragraph.split('\n');
            return (
              <div key={idx} className="mb-6">
                <h4 className="font-semibold text-blue-600 mb-2">{title}</h4>
                <ul className="space-y-1 ml-2">
                  {rest.map((item, itemIdx) => (
                    <li key={`${idx}-${itemIdx}`} className="text-slate-700">{item}</li>
                  ))}
                </ul>
              </div>
            );
          }
          return <p key={idx} className="mb-4">{paragraph}</p>;
        })}
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Weekly Digest</CardTitle>
        <CardDescription>
          Your weekly summary of TrialSage activity and intelligence
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="digest">Weekly Digest</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="digest" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">This Week's Activity</h3>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchDigest}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSendDigest}
                  disabled={sending}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : 'Send via Email'}
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-blue-800">Loading digest...</span>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  {formatDigestContent(digest)}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="preferences">
            <DigestPreferences />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}