import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Download } from "lucide-react";

export default function CSRInsightPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState("");
  const [comparison, setComparison] = useState([]);
  const [delta, setDelta] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const res = await fetch(`/api/csrs/search/?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.results);
    setSummary("");
    setComparison([]);
    setDelta(null);
    setLoading(false);
  };

  const handleSummarize = async () => {
    setLoading(true);
    const res = await fetch(`/api/csrs/summary/?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    setSummary(data.summary);
    setComparison([]);
    setDelta(null);
    setLoading(false);
  };

  const handleCompare = async () => {
    setLoading(true);
    const res = await fetch(`/api/csrs/search/?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    const top = data.results.slice(0, 2);
    setComparison(top);
    setResults([]);
    setSummary("");
    setDelta(null);
    setLoading(false);
  };

  const handleDelta = async () => {
    setLoading(true);
    const res = await fetch(`/api/csrs/compare-deltas?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    setDelta(data);
    setComparison([]);
    setResults([]);
    setSummary("");
    setLoading(false);
  };

  const handleExport = () => {
    // Create export content based on active view
    let exportContent = "";
    
    if (results.length > 0) {
      exportContent = `CSR Search Results for: ${query}\n\n` +
        results.map(r => `CSR #${r.id}: ${r.filename}\n${r.excerpt}\n\n`).join('');
    } else if (summary) {
      exportContent = `AI-Generated Summary for: ${query}\n\n${summary}`;
    } else if (delta) {
      exportContent = `Field-Level Delta Analysis\nCompared CSR #${delta.csr_ids[0]} vs. #${delta.csr_ids[1]}\n` +
        `\nSummary: ${delta.delta.summary}` +
        `\n\nAE Keywords: ${delta.delta.AE_keywords.join(', ')}` +
        `\n\nEndpoints: ${delta.delta.Endpoints.join(', ')}` +
        `\n\nDropout Rates: ${delta.delta['Dropout Difference']}`;
    }
    
    // Create blob and download
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trialsage-export-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">TrialSage CSR Intelligence</h1>
        {(results.length > 0 || summary || delta) && (
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </div>
      
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g., Phase 2 NASH trial endpoints with high dropout"
        className="mb-4"
      />
      
      <div className="flex flex-wrap gap-2 mb-6">
        <Button onClick={handleSearch}>Search Similar CSRs</Button>
        <Button onClick={handleSummarize} variant="outline">Summarize Insights</Button>
        <Button onClick={handleCompare} variant="secondary">Compare Top CSRs</Button>
        <Button onClick={handleDelta} variant="ghost">Field-Level Delta</Button>
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-2">Search Results</h2>
          {results.map((r, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">CSR #{r.id}: {r.filename}</p>
                <pre className="text-xs mt-2 whitespace-pre-wrap max-h-48 overflow-auto">{r.excerpt}</pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {summary && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">AI-Generated Summary</h2>
          <Card>
            <CardContent className="pt-4">
              <p className="whitespace-pre-wrap text-sm text-gray-800">{summary}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {comparison.length === 2 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Benchmark Comparison</h2>
          <div className="grid grid-cols-2 gap-4">
            {comparison.map((item, idx) => (
              <Card key={idx}>
                <CardContent className="pt-4">
                  <p className="text-sm font-bold text-muted-foreground">CSR #{item.id}: {item.filename}</p>
                  <pre className="text-xs mt-2 whitespace-pre-wrap max-h-64 overflow-auto">{item.excerpt}</pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {delta && (
        <div className="mt-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold mb-4">Field-Level Delta Analysis</h2>
            <Badge variant="outline" className="mb-2">CSR #{delta.csr_ids[0]} vs. #{delta.csr_ids[1]}</Badge>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-green-700 mb-4">{delta.delta.summary}</p>
              
              <Tabs defaultValue="ae" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ae">Adverse Events</TabsTrigger>
                  <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                  <TabsTrigger value="dropout">Dropout Rates</TabsTrigger>
                </TabsList>
                
                {/* AE Keywords Tab */}
                <TabsContent value="ae" className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Differing AE Keywords</h3>
                  
                  {delta.delta.AE_keywords.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {delta.delta.AE_keywords.map((term, idx) => (
                        <div key={idx} className="text-xs p-2 bg-gray-50 rounded-md">
                          {term}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic">No significant AE keyword differences found</p>
                  )}
                </TabsContent>
                
                {/* Endpoints Tab */}
                <TabsContent value="endpoints" className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Endpoint Differences</h3>
                  
                  {delta.delta.Endpoints && delta.delta.Endpoints.length > 0 ? (
                    <div className="space-y-2">
                      {delta.delta.Endpoints.map((endpoint, idx) => (
                        <div key={idx} className="text-xs p-2 bg-blue-50 rounded-md">
                          {endpoint}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic">No endpoint differences found</p>
                  )}
                </TabsContent>
                
                {/* Dropout Tab */}
                <TabsContent value="dropout" className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Dropout Analysis</h3>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Dropout Rate Difference:</p>
                        <Badge variant="outline" className="text-base">
                          {delta.delta['Dropout Difference']}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}