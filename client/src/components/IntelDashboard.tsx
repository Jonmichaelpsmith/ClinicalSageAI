import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import html2pdf from 'html2pdf.js';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function IntelDashboard() {
  const [indication, setIndication] = useState('');
  const [brief, setBrief] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [protocol, setProtocol] = useState(null);
  const [threadId, setThreadId] = useState('');
  const [loading, setLoading] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpResponse, setFollowUpResponse] = useState('');
  const pdfRef = useRef(null);

  const fetchIntel = async () => {
    setLoading(true);
    const res = await fetch(`/api/intel/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics: { indication } })
    });
    const data = await res.json();
    setBrief(data.brief);
    setLoading(false);
  };

  const fetchKPI = async () => {
    setLoading(true);
    const res = await fetch(`/api/intel/kpi-dashboard`);
    const data = await res.json();
    setMetrics(data.global_kpis);
    setLoading(false);
  };

  const fetchProtocol = async () => {
    setLoading(true);
    const res = await fetch(`/api/intel/protocol-suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ indication, thread_id: threadId })
    });
    const data = await res.json();
    setProtocol(data);
    if (data.thread_id) {
      setThreadId(data.thread_id);
    }
    setLoading(false);
  };

  const sendFollowUpQuestion = async () => {
    if (!followUpQuestion || !threadId) return;
    
    setLoading(true);
    const res = await fetch(`/api/intel/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        question: followUpQuestion, 
        thread_id: threadId,
        related_studies: []
      })
    });
    const data = await res.json();
    setFollowUpResponse(data.answer);
    setFollowUpQuestion('');
    setLoading(false);
  };

  const formatBarData = (obj) => {
    if (!obj) return [];
    return Object.entries(obj).map(([name, value]) => ({ name, count: value }));
  };

  const exportPDF = () => {
    if (pdfRef.current) {
      html2pdf()
        .set({ 
          margin: 0.5, 
          filename: `TrialSage_${indication}_Report.pdf`, 
          html2canvas: { scale: 2 }, 
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } 
        })
        .from(pdfRef.current)
        .save();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">TrialSage Intelligence Dashboard</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        <Input
          className="min-w-[300px]"
          placeholder="Enter indication keyword (e.g., NASH, RA, NSCLC)"
          value={indication}
          onChange={(e) => setIndication(e.target.value)}
        />
        <Button onClick={fetchIntel}>Generate Insight Brief</Button>
        <Button variant="outline" onClick={fetchKPI}>Global KPI Summary</Button>
        <Button variant="default" onClick={fetchProtocol}>Protocol Suggestion</Button>
        <Button variant="secondary" onClick={exportPDF}>Export to PDF</Button>
      </div>

      <div ref={pdfRef}>
        {loading && <div className="flex items-center justify-center p-6">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>}

        {brief && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-2">Weekly Intelligence Brief</h2>
              <p className="whitespace-pre-wrap text-sm">{brief}</p>
            </CardContent>
          </Card>
        )}

        {protocol && (
          <>
            <Tabs defaultValue="protocol" className="mb-6">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="protocol">Protocol</TabsTrigger>
                <TabsTrigger value="ind">IND Module 2.5</TabsTrigger>
                <TabsTrigger value="risk">Regulatory Risk</TabsTrigger>
              </TabsList>
              
              <TabsContent value="protocol" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-2">AI-Recommended Study Protocol</h2>
                    <p className="text-sm whitespace-pre-wrap">{protocol.recommendation}</p>
                    {protocol.citations && protocol.citations.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h3 className="text-md font-semibold mb-1">Evidence Citations</h3>
                        <ul className="list-disc list-inside text-xs text-muted-foreground">
                          {protocol.citations.map((citation, i) => (
                            <li key={i}>{citation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="ind" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-2">IND Module 2.5 Draft</h2>
                    <div className="text-sm whitespace-pre-wrap">{protocol.ind_module_2_5?.content}</div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="risk" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-2">Regulatory Risk Summary</h2>
                    <div className="text-sm whitespace-pre-wrap">{protocol.risk_summary}</div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {threadId && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-2">Continue Analysis</h2>
                  <p className="text-sm mb-2">You can ask follow-up questions to refine protocol or address specific concerns.</p>
                  <div className="flex gap-2 mb-4">
                    <Textarea 
                      placeholder="Enter follow-up question about the protocol recommendation..."
                      value={followUpQuestion}
                      onChange={(e) => setFollowUpQuestion(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <Button className="self-end" onClick={sendFollowUpQuestion}>Ask</Button>
                  </div>
                  
                  {followUpResponse && (
                    <div className="bg-muted p-4 rounded-md">
                      <h3 className="text-md font-semibold mb-1">Response</h3>
                      <p className="text-sm whitespace-pre-wrap">{followUpResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-2">Reports by Phase</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formatBarData(metrics.reportsByPhase)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-2">Top Indications</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.topIndications || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-2">Common Adverse Events & Endpoints</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-md font-semibold mb-1">Common Adverse Events</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {metrics.metrics?.commonAdverseEvents?.map((ae, i) => (
                        <li key={i}>{ae.name}: {ae.frequency}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-md font-semibold mb-1">Common Endpoints</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {metrics.metrics?.commonEndpoints?.map((endpoint, i) => (
                        <li key={i}>{endpoint}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}