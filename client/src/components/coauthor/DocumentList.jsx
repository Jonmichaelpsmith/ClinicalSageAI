import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen } from 'lucide-react';

const recentDocuments = [
  { id: 'doc1', title: 'Enzymase 10mg Clinical Overview', module: '2.5', lastEdited: '2 hours ago' },
  { id: 'doc2', title: 'NAD-102 Stability Analysis', module: '2.3', lastEdited: '1 day ago' },
  { id: 'doc3', title: 'Cellbloc Safety Summary', module: '2.7', lastEdited: '3 days ago' },
];

const templates = [
  { id: 'tpl1', title: 'Clinical Study Report Template', module: '5.3', description: 'ICH E3 compliant CSR template with guidance' },
  { id: 'tpl2', title: 'Quality Overall Summary Template', module: '2.3', description: 'Complete QOS template with examples' },
  { id: 'tpl3', title: 'FDA CTD Module 2 Template', module: '2', description: 'FDA-specific template for Module 2 summaries' },
];

export default function DocumentList({ activeTab, onTabChange, onSelectDocument }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Tabs defaultValue="recent" value={activeTab} onValueChange={onTabChange}>
          <TabsList>
            <TabsTrigger value="recent">Recent Documents</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab}>
          <TabsContent value="recent" className="m-0">
            <div className="space-y-4">
              {recentDocuments.map(doc => (
                <div key={doc.id} className="border rounded p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        {doc.title}
                      </h3>
                      <p className="text-sm text-gray-500">Module {doc.module} • Last edited {doc.lastEdited}</p>
                    </div>
                    <Button size="sm" onClick={() => onSelectDocument('module2')}>
                      Open
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="templates" className="m-0">
            <div className="space-y-4">
              {templates.map(tpl => (
                <div key={tpl.id} className="border rounded p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        {tpl.title}
                      </h3>
                      <p className="text-sm text-gray-500">Module {tpl.module}</p>
                      <p className="text-sm mt-1">{tpl.description}</p>
                    </div>
                    <Button size="sm" onClick={() => onSelectDocument('module2')}>
                      Use Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
