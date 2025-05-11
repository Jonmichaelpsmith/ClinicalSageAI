import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Edit, Search, BookOpen } from 'lucide-react';

export default function CoAuthor() {
  return (
    <div className="container mx-auto py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">eCTD Co-Author Module</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered regulatory document authoring and management
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              Document Editor
            </CardTitle>
            <CardDescription>Create and edit regulatory documents with AI assistance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The AI-powered editor helps you draft regulatory documents with intelligent suggestions, 
              automatic formatting, and real-time compliance checks.
            </p>
            <Button variant="outline" className="w-full">Launch Editor</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Template Library
            </CardTitle>
            <CardDescription>Pre-approved document templates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Access a comprehensive library of regulatory document templates that follow 
              FDA, EMA, and ICH guidelines for various submission types.
            </p>
            <Button variant="outline" className="w-full">Browse Templates</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Regulatory Search
            </CardTitle>
            <CardDescription>Find relevant guidance and precedents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Search through regulatory guidelines, precedent documents, and knowledge base 
              to support evidence-based document authoring.
            </p>
            <Button variant="outline" className="w-full">Explore Knowledge Base</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recent Documents
            </CardTitle>
            <CardDescription>Recently edited or viewed documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border rounded-md p-2 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Module 2.5 Clinical Overview</div>
                  <div className="text-xs text-muted-foreground">Edited 2 days ago</div>
                </div>
                <Button size="sm" variant="ghost">Open</Button>
              </div>
              <div className="border rounded-md p-2 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Module 1.3.3 Package Insert</div>
                  <div className="text-xs text-muted-foreground">Edited 5 days ago</div>
                </div>
                <Button size="sm" variant="ghost">Open</Button>
              </div>
              <div className="border rounded-md p-2 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Module 3.2.P.8 Stability Summary</div>
                  <div className="text-xs text-muted-foreground">Edited 1 week ago</div>
                </div>
                <Button size="sm" variant="ghost">Open</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Module Progress</CardTitle>
            <CardDescription>eCTD submission module completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Module 1: Administrative</span>
                  <span className="text-sm text-muted-foreground">80%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[80%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Module 2: Summaries</span>
                  <span className="text-sm text-muted-foreground">65%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[65%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Module 3: Quality</span>
                  <span className="text-sm text-muted-foreground">90%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[90%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Module 4: Nonclinical</span>
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[45%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Module 5: Clinical</span>
                  <span className="text-sm text-muted-foreground">30%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[30%]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}