import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  FolderTree, 
  FileSearch, 
  Upload, 
  Clock, 
  FileCheck, 
  FileWarning,
  Sparkles,
  PlusCircle,
  Library,
  FileCog,
  BookOpen,
  Users,
  CheckSquare,
  Newspaper
} from 'lucide-react';
import CoauthorModule from './CoauthorModule';
import LumenChatPane from './LumenChatPane';

// Mock CTD sections
const CTD_SECTIONS = [
  { id: '1.1', title: 'FDA Forms', status: 'approved', lastEdited: '2025-04-27T12:00:00Z' },
  { id: '1.2', title: 'Cover Letter', status: 'approved', lastEdited: '2025-04-28T09:30:00Z' },
  { id: '1.3', title: 'Administrative Information', status: 'review', lastEdited: '2025-04-29T14:15:00Z' },
  { id: '2.1', title: 'Table of Contents', status: 'draft', lastEdited: '2025-04-29T10:20:00Z' },
  { id: '2.5', title: 'Clinical Overview', status: 'draft', lastEdited: '2025-04-29T08:45:00Z' },
  { id: '2.7', title: 'Clinical Summary', status: 'draft', lastEdited: '2025-04-29T15:30:00Z' },
  { id: '3.2', title: 'Quality Information', status: 'draft', lastEdited: '2025-04-28T16:10:00Z' },
  { id: '4.2', title: 'Pharmacology Studies', status: 'draft', lastEdited: '2025-04-28T11:25:00Z' }
];

// Mock templates
const TEMPLATES = [
  { id: 'fda-nda', title: 'FDA New Drug Application', sections: 32, category: 'NDA' },
  { id: 'fda-bla', title: 'FDA Biologics License Application', sections: 28, category: 'BLA' },
  { id: 'fda-ind', title: 'FDA Investigational New Drug', sections: 24, category: 'IND' },
  { id: 'ema-maa', title: 'EMA Marketing Authorization Application', sections: 30, category: 'MAA' },
  { id: 'pmda-nda', title: 'PMDA New Drug Application', sections: 26, category: 'JNDA' }
];

// Mock recent activity
const RECENT_ACTIVITY = [
  { id: 1, section: '2.7', title: 'Clinical Summary', action: 'edited', user: 'Alex Smith', time: '2025-04-29T15:30:00Z' },
  { id: 2, section: '3.2', title: 'Quality Information', action: 'reviewed', user: 'Jamie Chen', time: '2025-04-29T14:45:00Z' },
  { id: 3, section: '2.5', title: 'Clinical Overview', action: 'commented', user: 'Taylor Wong', time: '2025-04-29T13:20:00Z' },
  { id: 4, section: '1.3', title: 'Administrative Information', action: 'approved', user: 'Jordan Lee', time: '2025-04-29T11:15:00Z' },
  { id: 5, section: '1.2', title: 'Cover Letter', action: 'edited', user: 'Alex Smith', time: '2025-04-29T10:05:00Z' }
];

export default function ModuleDashboard() {
  const [selectedTab, setSelectedTab] = useState('sections');
  const [editingSection, setEditingSection] = useState(null);
  
  const handleOpenSection = (sectionId, sectionTitle) => {
    setEditingSection({ id: sectionId, title: sectionTitle });
  };
  
  const handleBackToDashboard = () => {
    setEditingSection(null);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Get status badge for section
  const getSectionStatusBadge = (status) => {
    const statusMap = {
      'draft': { variant: 'outline', icon: Clock },
      'review': { variant: 'secondary', icon: FileSearch },
      'approved': { variant: 'success', icon: FileCheck },
      'rejected': { variant: 'destructive', icon: FileWarning }
    };
    
    const { variant, icon: Icon } = statusMap[status] || statusMap.draft;
    
    return (
      <Badge variant={variant} className="ml-2 flex items-center gap-1">
        <Icon className="h-3 w-3" />
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };
  
  // If editing a section, show the editor interface
  if (editingSection) {
    return (
      <CoauthorModule 
        sectionId={editingSection.id} 
        sectionTitle={editingSection.title}
        onBack={handleBackToDashboard}
      />
    );
  }
  
  // Otherwise show the dashboard
  return (
    <div className="container p-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">eCTD Co-Author</h1>
          <p className="text-muted-foreground mt-1">AI-powered regulatory document authoring</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="default" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Create New
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sections" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Sections
              </TabsTrigger>
              <TabsTrigger value="structure" className="flex items-center gap-1">
                <FolderTree className="h-4 w-4" />
                Structure
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-1">
                <FileSearch className="h-4 w-4" />
                Templates
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sections" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CTD_SECTIONS.map(section => (
                  <Card key={section.id} className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <span>{section.id}</span>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span>{section.title}</span>
                        {getSectionStatusBadge(section.status)}
                      </CardTitle>
                      <CardDescription>
                        Last edited: {formatDate(section.lastEdited)}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2">
                      <Button 
                        variant="default" 
                        size="sm"
                        className="w-full"
                        onClick={() => handleOpenSection(section.id, section.title)}
                      >
                        Open Section
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                <Card className="border border-dashed flex flex-col items-center justify-center p-6">
                  <PlusCircle className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm text-center mb-4">
                    Add a new section to your submission
                  </p>
                  <Button variant="outline">Add Section</Button>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="structure" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>eCTD Structure</CardTitle>
                  <CardDescription>
                    View and manage your submission structure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="pl-4 border-l-2 border-l-muted-foreground/20 space-y-4">
                    <div>
                      <h3 className="font-medium">Module 1: Administrative Information</h3>
                      <div className="mt-2 pl-4 border-l-2 border-l-muted-foreground/20 space-y-2">
                        <div className="flex items-center">
                          <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                          <span>1.1 FDA Forms</span>
                        </div>
                        <div className="flex items-center">
                          <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                          <span>1.2 Cover Letter</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-blue-500 mr-2" />
                          <span>1.3 Administrative Information</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Module 2: Summaries</h3>
                      <div className="mt-2 pl-4 border-l-2 border-l-muted-foreground/20 space-y-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-blue-500 mr-2" />
                          <span>2.1 Table of Contents</span>
                        </div>
                        <div className="flex items-center">
                          <FileWarning className="h-4 w-4 text-amber-500 mr-2" />
                          <span>2.5 Clinical Overview</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-blue-500 mr-2" />
                          <span>2.7 Clinical Summary</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Module 3: Quality</h3>
                      <div className="mt-2 pl-4 border-l-2 border-l-muted-foreground/20 space-y-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-blue-500 mr-2" />
                          <span>3.2 Quality Information</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Module 4: Nonclinical Study Reports</h3>
                      <div className="mt-2 pl-4 border-l-2 border-l-muted-foreground/20 space-y-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-blue-500 mr-2" />
                          <span>4.2 Pharmacology Studies</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Manage Structure</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="templates" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submission Templates</CardTitle>
                  <CardDescription>
                    Start with a regulatory-compliant template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {TEMPLATES.map(template => (
                      <div 
                        key={template.id}
                        className="border rounded-md p-4 flex justify-between items-center hover:bg-accent/50 cursor-pointer transition-colors"
                      >
                        <div>
                          <h3 className="font-medium">{template.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {template.sections} sections • {template.category}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Use Template
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Create Custom Template</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {RECENT_ACTIVITY.map(activity => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {activity.action === 'edited' ? (
                      <FileCog className="h-4 w-4 text-blue-500" />
                    ) : activity.action === 'reviewed' ? (
                      <BookOpen className="h-4 w-4 text-purple-500" />
                    ) : activity.action === 'commented' ? (
                      <Newspaper className="h-4 w-4 text-amber-500" />
                    ) : (
                      <CheckSquare className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-muted-foreground">{activity.action}</span>{' '}
                      <span>
                        {activity.section} {activity.title}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.time)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View All Activity
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Team Workload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Alex Smith</span>
                    <span className="text-muted-foreground">3 sections</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-3/4 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Jamie Chen</span>
                    <span className="text-muted-foreground">2 sections</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-1/2 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Taylor Wong</span>
                    <span className="text-muted-foreground">1 section</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-1/4 rounded-full"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <LumenChatPane contextId="coauthor-dashboard" />
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Library className="h-4 w-4 mr-2" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  CTD Guidelines
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  FDA Submission Requirements
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  EMA Formatting Standards
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  PMDA Specific Requirements
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}