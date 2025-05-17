// client/src/components/coauthor/DocumentSelector.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, ChevronRight, LayoutDashboard, FileCheck } from 'lucide-react';
import ModuleDashboard from './ModuleDashboard';
import DocumentList from './DocumentList';


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
      
      <DocumentList
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSelectDocument={onSelectDocument}
      />
    </div>
  );
}