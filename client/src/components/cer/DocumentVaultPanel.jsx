import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDown, FileText, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function DocumentVaultPanel({ jobId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVersion1, setSelectedVersion1] = useState('');
  const [selectedVersion2, setSelectedVersion2] = useState('');
  const [showDiff, setShowDiff] = useState(false);
  
  // Sample vault documents
  const documents = [
    { 
      id: 'doc-001', 
      name: 'CER_Enzymex_Forte_v1.0.pdf', 
      version: '1.0',
      date: '2025-03-10',
      size: '2.4MB',
      status: 'approved'
    },
    { 
      id: 'doc-002', 
      name: 'CER_Enzymex_Forte_v1.1.pdf', 
      version: '1.1',
      date: '2025-03-25',
      size: '2.5MB',
      status: 'draft'
    },
    { 
      id: 'doc-003', 
      name: 'CER_Enzymex_Forte_v2.0.pdf', 
      version: '2.0',
      date: '2025-04-15',
      size: '2.7MB',
      status: 'review'
    }
  ];
  
  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const computeDiff = () => {
    setShowDiff(true);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button>Upload New</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Document Name</th>
                  <th className="text-left p-2">Version</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Size</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map(doc => (
                  <tr key={doc.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 flex items-center gap-2">
                      <FileText size={16} />
                      {doc.name}
                    </td>
                    <td className="p-2">{doc.version}</td>
                    <td className="p-2">{doc.date}</td>
                    <td className="p-2">{doc.size}</td>
                    <td className="p-2">
                      <Badge variant={
                        doc.status === 'approved' ? 'success' : 
                        doc.status === 'review' ? 'warning' : 
                        'outline'
                      }>
                        {doc.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" variant="ghost">
                          <ArrowDown size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Version Comparison</h3>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <select
                className="w-full p-2 border rounded"
                value={selectedVersion1}
                onChange={(e) => setSelectedVersion1(e.target.value)}
              >
                <option value="">Select base version</option>
                {documents.map(doc => (
                  <option key={`v1-${doc.id}`} value={doc.version}>
                    Version {doc.version} ({doc.date})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                className="w-full p-2 border rounded"
                value={selectedVersion2}
                onChange={(e) => setSelectedVersion2(e.target.value)}
              >
                <option value="">Select compare version</option>
                {documents.map(doc => (
                  <option key={`v2-${doc.id}`} value={doc.version}>
                    Version {doc.version} ({doc.date})
                  </option>
                ))}
              </select>
            </div>
            <Button 
              onClick={computeDiff}
              disabled={!selectedVersion1 || !selectedVersion2}
            >
              Compare
            </Button>
          </div>
          
          {showDiff && (
            <div className="border p-4 rounded bg-slate-50">
              <h4 className="font-medium mb-2">Comparison Results</h4>
              <div className="space-y-2">
                <div className="bg-green-50 p-2 border-l-4 border-green-500">
                  <p className="text-sm text-green-800">+ Added new section 4.2.1 - Post-market Clinical Follow-up</p>
                </div>
                <div className="bg-red-50 p-2 border-l-4 border-red-500">
                  <p className="text-sm text-red-800">- Removed outdated reference to ISO 14155:2011</p>
                </div>
                <div className="bg-yellow-50 p-2 border-l-4 border-yellow-500">
                  <p className="text-sm text-yellow-800">~ Updated clinical data summary with latest findings</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}