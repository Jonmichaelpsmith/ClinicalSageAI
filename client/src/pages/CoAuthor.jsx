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
              <FileText className="h-5 w-5 mr-2" />
              eCTD Structure Navigator
            </CardTitle>
            <CardDescription>Navigate and manage your eCTD submission structure</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Easily browse through your eCTD modules and sections, manage document placement,
              and ensure compliance with regulatory guidelines.
            </p>
            <Button variant="outline" className="w-full">Open Navigator</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Validation Engine
            </CardTitle>
            <CardDescription>Ensure your documents meet eCTD requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Run comprehensive validation checks on your documents to verify compliance
              with eCTD technical specifications and regulatory guidelines.
            </p>
            <Button variant="outline" className="w-full">Run Validation</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Template Library
            </CardTitle>
            <CardDescription>Access pre-approved document templates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Browse through a collection of pre-approved templates for various regulatory documents,
              customized for different regions and submission types.
            </p>
            <Button variant="outline" className="w-full">Browse Templates</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}