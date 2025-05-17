import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';

const CmcWizard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [docName, setDocName] = useState('');
  const [comments, setComments] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    // Placeholder for save logic
    setDocName('');
    setComments('');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CMC Wizard™</h1>
        <p className="text-muted-foreground">
          Manage your Chemistry, Manufacturing, and Controls documentation efficiently.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to CMC Wizard</CardTitle>
              <CardDescription>
                Guidance for creating and tracking your CMC files.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Use the tabs above to upload key documents or explore available tools.
              </p>
              <Button onClick={() => setActiveTab('documentation')}>Get Started</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input type="file" />
              <Button variant="outline">Upload</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-3">
                <Input
                  placeholder="Document name"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                />
                <Textarea
                  placeholder="Comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
                <Button type="submit">Save</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>CMC Tools</CardTitle>
              <CardDescription>Select an action</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline">Batch Record Generator</Button>
              <Button variant="outline">Stability Data Analyzer</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CmcWizard;

