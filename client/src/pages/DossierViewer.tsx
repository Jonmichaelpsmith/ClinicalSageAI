import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { Copy, Download, FileText, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DossierViewer() {
  const { dossier_id } = useParams();
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchDossier = async () => {
      try {
        const data = await apiRequest('GET', `/api/dossier/${dossier_id}`);
        
        setDossier(data);
        setNotes(data.notes || {});
        setSignatures(data.signatures || {});
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dossier:", error);
        toast({
          title: "Error",
          description: "Failed to load dossier data.",
          variant: "destructive"
        });
        setLoading(false);
      }
    };
    
    if (dossier_id) fetchDossier();
  }, [dossier_id, toast]);

  const downloadJSON = () => {
    if (!dossier) return;
    
    const enriched = { ...dossier, notes, signatures };
    const blob = new Blob([JSON.stringify(enriched, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dossier_${dossier_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Dossier JSON has been downloaded."
    });
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to clipboard.",
    });
  };
  
  const shareableURL = dossier_id ? `${window.location.origin}/dossier/${dossier_id}` : '';
  const versions = dossier?.optimizer_versions || [];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
  
  if (!dossier) return (
    <div className="text-center p-8">
      <h2 className="text-xl font-bold text-red-500">Dossier Not Found</h2>
      <p className="mt-2 text-muted-foreground">The requested dossier could not be found or has been deleted.</p>
      <Link to="/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">Return to Dashboard</Link>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-blue-800">📁 TrialSage Dossier: {dossier_id.slice(0, 8)}...</h2>
      <p className="text-sm text-gray-600 pb-2">{dossier.csrs?.length || 0} CSRs included | Created at {new Date(dossier.created_at).toLocaleString()}</p>
      <div className="text-sm text-blue-700 pb-4">
        🔗 Shareable Link: 
        <a 
          href={shareableURL} 
          onClick={(e) => {
            e.preventDefault();
            copyToClipboard(shareableURL);
          }} 
          className="underline text-blue-600 ml-1 cursor-pointer"
        >
          {shareableURL}
        </a>
      </div>

      {dossier.csrs && dossier.csrs.map((csr: any, idx: number) => (
        <Card key={csr.csr_id || idx} className="border border-gray-200">
          <CardContent className="py-4 space-y-3">
            <h3 className="text-lg font-semibold">{csr.title} ({csr.phase})</h3>
            <p className="text-sm text-gray-600">Indication: {csr.indication}</p>
            <p className="text-sm">Primary Endpoints: {csr.primary_endpoints?.join(', ')}</p>
            <p className="text-sm">Arms: {csr.arms?.join(', ')}</p>
            <p className="text-sm">Sample Size: {csr.sample_size}</p>
            <p className="text-sm">Outcome: {csr.outcome_summary}</p>
            {csr.adverse_events && (
              <p className="text-sm text-gray-500 italic">
                AE Summary: {typeof csr.adverse_events === 'string' 
                  ? csr.adverse_events 
                  : JSON.stringify(csr.adverse_events || [])}
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {versions.length > 0 && (
        <Card className="border border-green-300">
          <CardContent className="py-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-green-700">📘 Protocol Optimization History</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = `/optimizer?dossier_id=${dossier_id}`}
              >
                Run New Optimization
              </Button>
            </div>
            
            {versions.map((v: any, i: number) => (
              <div key={i} className="border p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm text-gray-700">Version {i + 1} | Saved: {new Date(v.timestamp).toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Referenced CSRs: {v.csr_ids?.join(', ')}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 px-2"
                      onClick={() => copyToClipboard(v.recommendation)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 px-2"
                      onClick={() => {
                        // Export recommendation as text file
                        const blob = new Blob([v.recommendation], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `optimization_v${i+1}_${new Date(v.timestamp).toISOString().split('T')[0]}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <Textarea 
                  value={v.recommendation} 
                  rows={6} 
                  readOnly 
                  className="text-xs bg-white border mt-1" 
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="text-center pt-6 space-x-4">
        <Button 
          onClick={() => window.print()} 
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Dossier
        </Button>
        <Button 
          onClick={downloadJSON} 
          className="bg-gray-700 text-white hover:bg-gray-800"
        >
          <FileText className="h-4 w-4 mr-2" />
          Download JSON
        </Button>
      </div>
      
      <style jsx global>
        {`
          @media print {
            nav, button, footer, .no-print {
              display: none !important;
            }
            .card {
              break-inside: avoid;
              margin-bottom: 15px;
            }
          }
        `}
      </style>
    </div>
  );
}