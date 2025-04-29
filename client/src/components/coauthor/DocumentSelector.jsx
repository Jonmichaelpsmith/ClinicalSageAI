import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, PlusCircle, Clock, Star, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

export default function DocumentSelector() {
  const [_, setLocation] = useLocation();
  
  const startNewDocument = (moduleNumber, sectionNumber) => {
    // In a production app, this would create a new document in the database
    // and then redirect to the editor for that document
    setLocation(`/coauthor/edit?module=${moduleNumber}&section=${sectionNumber}`);
  };

  const recentDocuments = [
    { id: 1, title: 'Module 2 / Section 2.5', description: 'Clinical Overview', lastEdited: '30 minutes ago' },
    { id: 2, title: 'Module 2 / Section 2.7', description: 'Clinical Summary', lastEdited: '2 hours ago' },
    { id: 3, title: 'Module 3 / Section 3.2', description: 'Body of Data', lastEdited: '1 day ago' },
  ];
  
  const popularTemplates = [
    { id: 1, title: 'Module 2.5 Clinical Overview', description: 'Complete clinical overview with integrated efficacy and safety sections' },
    { id: 2, title: 'Module 2.7 Clinical Summary', description: 'Summary of clinical study results with tables and figures' },
    { id: 3, title: 'Module 3.2 Quality Information', description: 'Quality data with CMC information' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">eCTD Co-Author™</h1>
        <p className="text-gray-500">Create and edit regulatory submission documents with AI assistance</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-blue-600" />
                Recent Documents
              </CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDocuments.map(doc => (
                  <div 
                    key={doc.id} 
                    className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setLocation(`/coauthor/edit?id=${doc.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-600" />
                          {doc.title}
                        </h3>
                        <p className="text-sm text-gray-500">{doc.description}</p>
                      </div>
                      <span className="text-xs text-gray-400">Last edited: {doc.lastEdited}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Documents</Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlusCircle className="mr-2 h-5 w-5 text-green-600" />
                Create New Document
              </CardTitle>
              <CardDescription>Start from a template or create a custom document</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-3">Select a module and section</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => startNewDocument(2, 5)}
                      className="justify-between"
                    >
                      <span>Module 2.5</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => startNewDocument(2, 7)}
                      className="justify-between"
                    >
                      <span>Module 2.7</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => startNewDocument(3, 2)}
                      className="justify-between"
                    >
                      <span>Module 3.2</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => startNewDocument(5, 3)}
                      className="justify-between"
                    >
                      <span>Module 5.3</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="font-medium mt-2 mb-3 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  Popular Templates
                </h3>
                
                {popularTemplates.map(template => (
                  <div 
                    key={template.id} 
                    className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setLocation(`/coauthor/edit?template=${template.id}`)}
                  >
                    <h4 className="font-medium">{template.title}</h4>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}