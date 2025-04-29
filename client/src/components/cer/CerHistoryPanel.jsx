import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Download, FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function CerHistoryPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample job history
  const jobs = [
    {
      id: 'JOB-20250415-001',
      product: 'Enzymex Forte',
      status: 'completed',
      date: 'April 15, 2025 09:12 AM',
      template: 'EU MDR Template v2.1',
      duration: '8m 42s'
    },
    {
      id: 'JOB-20250410-003',
      product: 'Enzymex Forte',
      status: 'failed',
      date: 'April 10, 2025 02:34 PM',
      template: 'EU MDR Template v2.0',
      duration: '2m 18s'
    },
    {
      id: 'JOB-20250405-007',
      product: 'Enzymex Forte',
      status: 'completed',
      date: 'April 5, 2025 11:05 AM',
      template: 'EU MDR Template v1.5',
      duration: '7m 56s'
    }
  ];
  
  const filteredJobs = jobs.filter(job => 
    job.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Report Generation History</h3>
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <div key={job.id} className="p-4 border rounded flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} />
                    <span className="font-medium">{job.product}</span>
                    <Badge variant={
                      job.status === 'completed' ? 'success' : 
                      job.status === 'failed' ? 'destructive' : 
                      'secondary'
                    }>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{job.id}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} />
                      {job.date}
                    </span>
                    <span className="ml-4">Template: {job.template}</span>
                    <span className="ml-4">Duration: {job.duration}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {job.status === 'completed' && (
                    <Button size="sm" variant="outline" className="gap-1">
                      <Download size={14} />
                      Download
                    </Button>
                  )}
                  <Button size="sm">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}