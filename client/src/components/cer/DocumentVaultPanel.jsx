import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from 'axios';

export default function DocumentVaultPanel({ jobId }) {
  const [versions, setVersions] = useState([]);
  const [selected, setSelected] = useState({ v1: null, v2: null });
  const [diffHtml, setDiffHtml] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVersions = async () => {
      setLoading(true);
      try {
        // This would be a real API call in production
        // const res = await axios.get(`/api/cer/vault/versions/${jobId || 'all'}`);
        // setVersions(res.data.versions);
        
        // Mock data for demo
        await new Promise(resolve => setTimeout(resolve, 800));
        setVersions([
          { id: 1, version: '1.0.0', name: 'Initial Draft', createdAt: '2025-04-22T14:30:00Z', createdBy: 'John Smith' },
          { id: 2, version: '1.1.0', name: 'Revision 1', createdAt: '2025-04-23T09:15:00Z', createdBy: 'Sarah Johnson' },
          { id: 3, version: '1.2.0', name: 'Final Review', createdAt: '2025-04-24T16:45:00Z', createdBy: 'John Smith' },
          { id: 4, version: '2.0.0', name: 'Published Version', createdAt: '2025-04-25T10:00:00Z', createdBy: 'Michael Chen' }
        ]);
      } catch (err) {
        console.error('Failed to fetch versions', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVersions();
  }, [jobId]);

  const computeDiff = async () => {
    if (!selected.v1 || !selected.v2) return;
    
    setLoading(true);
    try {
      // This would be a real API call in production
      // const res = await axios.get(
      //   `/api/cer/vault/diff/${jobId || 'latest'}?v1=${selected.v1}&v2=${selected.v2}`
      // );
      // setDiffHtml(res.data.diff);
      
      // Mock data for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDiffHtml(`
        <div class="diff-content">
          <h3>Differences between v${selected.v1} and v${selected.v2}</h3>
          <p>Document: <strong>Clinical Evaluation Report</strong></p>
          <div class="diff-section">
            <h4>Section 1.3: Clinical Background</h4>
            <p class="diff-removed">The device is intended for use in clinical settings with supervision by qualified healthcare professionals.</p>
            <p class="diff-added">The device is intended for use in clinical settings with supervision by qualified healthcare professionals and may be used for self-monitoring by patients after proper training.</p>
          </div>
          <div class="diff-section">
            <h4>Section 2.1: Risk Analysis</h4>
            <p class="diff-removed">Based on the available data, three significant risks were identified.</p>
            <p class="diff-added">Based on the available data, four significant risks were identified.</p>
            <p class="diff-added">The additional risk of improper home usage has been added to the risk analysis matrix.</p>
          </div>
        </div>
      `);
    } catch (err) {
      console.error('Failed to compute diff', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (versionId) => {
    // In a real implementation, this would download the specified version
    window.open(`/api/cer/vault/download/${versionId}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Document History</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map(v => (
                <TableRow key={v.id}>
                  <TableCell>{v.version}</TableCell>
                  <TableCell>{v.name}</TableCell>
                  <TableCell>{new Date(v.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{v.createdBy}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => handleDownload(v.id)}>Download</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Version Comparison</h3>
          <div className="flex gap-4 items-end mb-4">
            <div className="flex-1">
              <Label htmlFor="v1-select">Base Version</Label>
              <select 
                id="v1-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onChange={e => setSelected({ ...selected, v1: e.target.value })}
                value={selected.v1 || ""}
              >
                <option value="">Select base version</option>
                {versions.map(v => <option key={v.id} value={v.version}>v{v.version}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <Label htmlFor="v2-select">Compare Version</Label>
              <select 
                id="v2-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                onChange={e => setSelected({ ...selected, v2: e.target.value })}
                value={selected.v2 || ""}
              >
                <option value="">Select compare version</option>
                {versions.map(v => <option key={v.id} value={v.version}>v{v.version}</option>)}
              </select>
            </div>
            <Button 
              onClick={computeDiff} 
              disabled={!selected.v1 || !selected.v2 || loading}
            >
              {loading ? 'Processing...' : 'Show Diff'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {diffHtml && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Diff Results</h3>
            <div 
              dangerouslySetInnerHTML={{ __html: diffHtml }} 
              className="prose max-w-none p-4 border rounded"
              style={{
                '--diff-removed-color': '#fee2e2',
                '--diff-added-color': '#dcfce7',
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}