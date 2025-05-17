import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell
} from '@/components/ui/table';

const CerGenerator = () => {
  const [activeTab, setActiveTab] = useState('generator');
  const [ndcCode, setNdcCode] = useState('');
  const [history, setHistory] = useState([]);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!ndcCode.trim()) return;
    const record = { id: Date.now(), code: ndcCode };
    setHistory([record, ...history]);
    setNdcCode('');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CER Generator™</h1>
        <p className="text-muted-foreground">
          Create Clinical Evaluation Reports following EU MDR guidelines intelligently.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="generator">Generate</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-3">
                <Input
                  placeholder="Enter NDC code"
                  value={ndcCode}
                  onChange={(e) => setNdcCode(e.target.value)}
                />
                <Button type="submit">Generate</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NDC Code</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell>{h.code}</TableCell>
                      <TableCell>{new Date(h.id).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {history.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">No reports generated yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Enter the product NDC code and click &quot;Generate&quot; to produce a basic CER outline.</p>
              <p>This simple demo does not save generated PDFs.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CerGenerator;

