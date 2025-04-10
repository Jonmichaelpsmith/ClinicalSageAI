import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AgentLog {
  timestamp: string;
  message: string;
  response: string;
  csrIds: string[];
  hasContext: boolean;
}

export default function AgentLogDashboard() {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [csrId, setCsrId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [endpointStats, setEndpointStats] = useState<Record<string, number>>({});

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (csrId) params.append('csr_id', csrId);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const res = await fetch(`/api/logs/agent?${params.toString()}`);
      const data = await res.json();
      setLogs(data);
      
      // Count endpoint mentions (simple frequency count based on response text)
      const termMap: Record<string, number> = {};
      const commonEndpoints = ['orr', 'pfs', 'os', 'hba1c', 'response rate', 'safety', 'ae', 
                              'efficacy', 'duration', 'progression', 'survival', 'dfs', 'recist'];
      
      data.forEach((entry: AgentLog) => {
        const response = entry.response.toLowerCase();
        commonEndpoints.forEach(term => {
          if (response.includes(term)) {
            termMap[term] = (termMap[term] || 0) + 1;
          }
        });
      });
      
      // Sort by frequency (descending)
      const sortedStats: Record<string, number> = {};
      Object.entries(termMap)
        .sort((a, b) => b[1] - a[1])
        .forEach(([key, value]) => {
          sortedStats[key] = value;
        });
        
      setEndpointStats(sortedStats);
    } catch (error) {
      console.error('Error fetching agent logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['timestamp', 'message', 'csr_ids', 'response'];
    const rows = logs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.message.replace(/\n/g, ' ').replace(/"/g, '""'),
      log.csrIds?.join(', ') || '',
      log.response.replace(/\n/g, ' ').replace(/"/g, '""')
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'agent_logs.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-blue-800">📊 Study Design Agent Logs</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
        <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="🔍 Keyword" />
        <Input value={csrId} onChange={(e) => setCsrId(e.target.value)} placeholder="🔎 CSR ID" />
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" />
      </div>

      <div className="flex justify-between items-center pb-4">
        <div className="flex gap-2">
          <Button 
            onClick={fetchLogs} 
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Apply Filters'}
          </Button>
          
          <Button 
            onClick={() => {
              setKeyword('');
              setCsrId('');
              setDateFrom('');
              setDateTo('');
              setTimeout(fetchLogs, 0);
            }} 
            variant="outline"
            disabled={isLoading}
          >
            Clear Filters
          </Button>
        </div>
        
        <Button 
          onClick={exportToCSV} 
          className="bg-gray-700 text-white hover:bg-gray-800"
          disabled={isLoading || logs.length === 0}
        >
          📥 Export CSV
        </Button>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && logs.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No agent logs found. Try using the agent to generate some logs!
        </div>
      )}
      
      {/* Endpoint Stats */}
      {Object.keys(endpointStats).length > 0 && (
        <Card className="border border-gray-200 mb-4">
          <CardContent className="pt-6">
            <h4 className="text-md font-semibold text-green-800 mb-2">📈 Endpoint Mentions</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.entries(endpointStats).map(([term, count], i) => (
                <div key={i} className="text-sm text-gray-700 bg-green-50 p-2 rounded border">
                  🔹 <span className="font-medium">{term.toUpperCase()}</span>: {count} mentions
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {logs.map((entry, i) => (
          <Card key={i} className="border border-gray-200">
            <CardContent className="space-y-2 pt-6">
              <p className="text-sm text-gray-600">🕒 {new Date(entry.timestamp).toLocaleString()}</p>
              <p className="text-sm text-blue-700 font-medium">🧑‍💬 Question:</p>
              <p className="text-sm bg-blue-50 p-2 rounded border text-gray-800 whitespace-pre-wrap">{entry.message}</p>
              {entry.csrIds?.length > 0 && (
                <p className="text-sm text-gray-600 italic">CSR Context: {entry.csrIds.join(', ')}</p>
              )}
              <p className="text-sm text-green-700 font-medium">🤖 Response:</p>
              <p className="text-sm bg-green-50 p-2 rounded border whitespace-pre-wrap">{entry.response}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}