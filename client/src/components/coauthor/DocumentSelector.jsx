// client/src/components/coauthor/DocumentSelector.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, ChevronRight, LayoutDashboard, FileCheck } from 'lucide-react';
import ModuleDashboard from './ModuleDashboard';

// Mock document templates
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

export default function DocumentSelector({ onSelectDocument }) {
  const [activeTab, setActiveTab] = useState('recent');

  const handleModuleSelect = (moduleTitle) => {
    // For now just open Module 2 editor
    if (moduleTitle.includes('2')) {
      onSelectDocument('module2');
    } else {
      // Could display a message that this module is not yet implemented
      console.log('Module selected:', moduleTitle);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">eCTD Co-Author™</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-blue-600" />
              <span>Module Dashboard</span>
            </CardTitle>
            <CardDescription>
              Overview of your submission modules and their completion status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ModuleDashboard onSelectModule={handleModuleSelect} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-600" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => onSelectDocument('module2')}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>Continue Module 2.7</span>
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </li>
              <li>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => setActiveTab('templates')}
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span>New from Template</span>
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </li>
              <li>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>Import Document</span>
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <Tabs defaultValue="recent" value={activeTab} onValueChange={setActiveTab}>
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
                      <Button 
                        size="sm" 
                        onClick={() => onSelectDocument('module2')}
                      >
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
                      <Button 
                        size="sm" 
                        onClick={() => onSelectDocument('module2')}
                      >
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
    </div>
  );
}