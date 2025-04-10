// React Page: DossierViewer.tsx (with Print, JSON Export, Annotations, and Shareable Link)

import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileText, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DossierViewer() {
  const { dossier_id } = useParams();
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  useEffect(() => {
    const fetchDossier = async () => {
      try {
        const res = await fetch(`/data/dossiers/${dossier_id}.json`);
        if (!res.ok) {
          throw new Error(`Failed to fetch dossier: ${res.status}`);
        }
        const data = await res.json();
        setDossier(data);
        // Load any existing notes from the dossier
        if (data.notes) {
          setNotes(data.notes);
        }
      } catch (error) {
        console.error("Error loading dossier:", error);
        toast({
          title: "Error loading dossier",
          description: "The requested dossier could not be found or loaded.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (dossier_id) fetchDossier();
  }, [dossier_id, toast]);

  const downloadJSON = () => {
    const enriched = { ...dossier, notes };
    const blob = new Blob([JSON.stringify(enriched, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dossier_${dossier_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "JSON Downloaded",
      description: "Your dossier with notes has been downloaded.",
    });
  };

  const updateNote = async (id: string, value: string) => {
    const updatedNotes = { ...notes, [id]: value };
    setNotes(updatedNotes);
    
    try {
      setSaving(true);
      const response = await fetch(`/api/dossier/${dossier_id}/update-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: updatedNotes }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save notes: ${response.status}`);
      }
      
      // Successful response
      console.log('Notes saved successfully');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Failed to save notes",
        description: "Changes may not persist when you leave this page.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading dossier...</p>
      </div>
    );
  }
  
  if (!dossier) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-destructive font-semibold">Dossier not found</p>
        <p className="text-muted-foreground mt-2">The requested dossier could not be found or may have been deleted.</p>
      </div>
    );
  }

  const shareableURL = `${window.location.origin}/dossier/${dossier_id}`;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 mb-20">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-2xl font-bold text-blue-800">📁 TrialSage Dossier: {dossier_id?.slice(0, 8)}...</h2>
        <p className="text-sm text-gray-600 pb-2">{dossier.csrs.length} CSRs included | Created at {new Date(dossier.created_at).toLocaleString()}</p>
        <div className="text-sm text-blue-700 pb-1 flex flex-wrap items-center gap-2">
          <span>🔗 Shareable Link:</span> 
          <code className="bg-white px-2 py-1 rounded border flex-1">{shareableURL}</code>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(shareableURL);
              toast({ title: "Link copied to clipboard" });
            }}
          >
            Copy
          </Button>
        </div>
      </div>

      {dossier.csrs.map((csr: any, idx: number) => (
        <Card key={csr.csr_id || idx} className="border border-gray-200 shadow-sm">
          <CardContent className="space-y-3 pt-6">
            <h3 className="text-lg font-semibold">{csr.title} ({csr.phase})</h3>
            <p className="text-sm text-gray-600">Indication: {csr.indication}</p>
            <p className="text-sm">Primary Endpoints: {csr.primary_endpoints?.join(', ') || 'None specified'}</p>
            <p className="text-sm">Arms: {csr.arms?.join(', ') || 'None specified'}</p>
            <p className="text-sm">Sample Size: {csr.sample_size || 'Not specified'}</p>
            <p className="text-sm">Outcome: {csr.outcome_summary || csr.outcome || 'Not specified'}</p>
            <p className="text-sm text-gray-500 italic">AE Summary: {
              Array.isArray(csr.adverse_events) && csr.adverse_events.length > 0 
                ? JSON.stringify(csr.adverse_events) 
                : 'No adverse events data'
            }</p>
            <div className="pt-2 mt-1 border-t">
              <label className="block text-sm font-medium text-blue-700 mb-1">📝 Notes / Annotations:</label>
              <div className="relative">
                <Textarea
                  className="w-full text-sm min-h-[100px]"
                  placeholder="Add notes about this study (regulatory considerations, decision factors, etc.)"
                  value={notes[csr.csr_id] || ''}
                  onChange={(e) => updateNote(csr.csr_id, e.target.value)}
                  rows={3}
                />
                {saving && (
                  <div className="absolute top-2 right-2 text-blue-600 flex items-center gap-1 text-xs bg-white/80 px-2 py-1 rounded-md">
                    <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="text-center pt-8 space-y-4 print:hidden">
        <div className="flex justify-center space-x-4">
          <Button onClick={() => window.print()} className="bg-blue-600 text-white hover:bg-blue-700">
            🖨️ Print Dossier
          </Button>
          <Button onClick={downloadJSON} className="bg-gray-700 text-white hover:bg-gray-800">
            📥 Download JSON (with Notes)
          </Button>
        </div>
        
        <div className="flex justify-center items-center border-t border-gray-200 pt-4 mt-6">
          <Button 
            onClick={() => {
              // Create CSR IDs string from dossier
              const csrIds = dossier.csrs.map((csr: any) => csr.csr_id).join(',');
              navigate(`/protocol-optimizer?csr_ids=${encodeURIComponent(csrIds)}`);
            }}
            className="bg-emerald-700 text-white hover:bg-emerald-800 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Continue to Protocol Optimizer
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Print-only styling */}
      <style jsx global>{`
        @media print {
          body {
            font-size: 12pt;
          }
          .no-print {
            display: none;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}