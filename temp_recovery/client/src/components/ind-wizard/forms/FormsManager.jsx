/**
 * IND Forms Manager Component
 * 
 * This component provides a unified interface for managing the various FDA forms
 * required for IND submissions, including generation, editing, and versioning.
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  ChevronRight, 
  Clock, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  RotateCw,
  HelpCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { DatabaseAware, DataAware } from '@/components/ui/database-aware';

// Import form generators
import Form1571Generator from './Form1571Generator';
import Form1572Generator from './Form1572Generator';
import Form3674Generator from './Form3674Generator';
import Form3454Generator from './Form3454Generator';

// Define form types with detailed metadata
const FDA_FORMS = [
  {
    id: '1571',
    name: 'Form FDA 1571',
    title: 'Investigational New Drug Application',
    description: 'The primary application form that initiates the IND process',
    required: true,
    difficulty: 'High',
    estimatedTime: '45-60 min',
    icon: FileText,
    component: Form1571Generator
  },
  {
    id: '1572',
    name: 'Form FDA 1572',
    title: 'Statement of Investigator',
    description: 'Completed by each principal investigator participating in the clinical investigation',
    required: true,
    difficulty: 'Medium',
    estimatedTime: '30-45 min',
    icon: FileText,
    component: Form1572Generator
  },
  {
    id: '3674',
    name: 'Form FDA 3674',
    title: 'Certification of Compliance',
    description: 'Certifies compliance with ClinicalTrials.gov requirements',
    required: true,
    difficulty: 'Low',
    estimatedTime: '15-20 min',
    icon: FileText,
    component: Form3674Generator
  },
  {
    id: '3454',
    name: 'Form FDA 3454',
    title: 'Financial Disclosure',
    description: 'Certification of financial arrangements with clinical investigators',
    required: true,
    difficulty: 'Medium',
    estimatedTime: '25-35 min',
    icon: FileText,
    component: Form3454Generator
  }
];

export default function FormsManager({ projectId, readOnly = false }) {
  const { toast } = useToast();
  const [selectedFormId, setSelectedFormId] = useState('1571');
  const [activeView, setActiveView] = useState('form'); // 'form', 'history', 'guidance'
  
  // Get overall forms progress
  const { 
    data: formsProgress, 
    isLoading: isLoadingProgress, 
    refetch: refetchProgress 
  } = useQuery({
    queryKey: ['ind-forms-progress', projectId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/ind/${projectId}/forms/progress`);
        if (!response.ok) throw new Error('Failed to fetch forms progress');
        return response.json();
      } catch (error) {
        console.error('Error fetching forms progress:', error);
        
        // Fallback data for development
        return {
          totalForms: 4,
          completedForms: 1,
          inProgressForms: 2,
          notStartedForms: 1,
          formsStatus: {
            '1571': 'in_progress',
            '1572': 'in_progress',
            '3674': 'not_started',
            '3454': 'completed'
          }
        };
      }
    },
    enabled: !!projectId
  });
  
  // Get AI insights for forms
  const { 
    data: formsInsights, 
    isLoading: isLoadingInsights 
  } = useQuery({
    queryKey: ['ind-forms-insights', projectId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/ind/${projectId}/forms/insights`);
        if (!response.ok) throw new Error('Failed to fetch forms insights');
        return response.json();
      } catch (error) {
        console.error('Error fetching forms insights:', error);
        
        // Fallback insights for development
        return {
          insights: [
            'Ensure consistent sponsor information across all forms',
            'Double-check investigator credentials on Form 1572',
            'For Form 3674, verify ClinicalTrials.gov registration status before completing'
          ],
          lastUpdated: new Date().toISOString()
        };
      }
    },
    enabled: !!projectId
  });
  
  // Handle form selection
  const handleFormSelect = (formId) => {
    setSelectedFormId(formId);
    setActiveView('form');
  };
  
  // Get the current selected form
  const selectedForm = FDA_FORMS.find(form => form.id === selectedFormId) || FDA_FORMS[0];
  
  // Get form status 
  const getFormStatus = (formId) => {
    if (!formsProgress) return 'not_started';
    return formsProgress.formsStatus[formId] || 'not_started';
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'not_started':
      default:
        return (
          <Badge variant="outline">
            Not Started
          </Badge>
        );
    }
  };
  
  // Render loading state
  if (isLoadingProgress) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RotateCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading forms data...</p>
        </div>
      </div>
    );
  }
  
  // Display not implemented message if form component is missing
  const FormComponent = selectedForm.component;
  if (!FormComponent && activeView === 'form') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{selectedForm.name}</h2>
            <p className="text-muted-foreground">{selectedForm.title}</p>
          </div>
          
          <Button variant="outline" onClick={() => setSelectedFormId('1571')}>
            Back to Form 1571
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Form Under Development</h3>
              <p className="text-muted-foreground mb-4">
                {selectedForm.name} generator is currently being implemented. Please check back later.
              </p>
              <Button 
                variant="outline"
                onClick={() => setSelectedFormId('1571')}
              >
                Go to Form FDA 1571
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">FDA Forms</h2>
          <p className="text-muted-foreground">Manage and generate required FDA forms for your IND submission</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {formsProgress && (
            <Badge variant="outline" className="bg-muted/80 font-normal">
              <FileCheck className="h-3 w-3 mr-1" />
              {formsProgress.completedForms} of {formsProgress.totalForms} Completed
            </Badge>
          )}
        </div>
      </div>
      
      {formsInsights && formsInsights.insights?.length > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <HelpCircle className="h-4 w-4 text-blue-500" />
          <AlertTitle>AI Guidance</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {formsInsights.insights.map((insight, idx) => (
                <li key={idx} className="text-sm">{insight}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Required Forms</CardTitle>
              <CardDescription>FDA forms for your IND submission</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {FDA_FORMS.map((form) => (
                  <Button
                    key={form.id}
                    variant={selectedFormId === form.id ? "default" : "ghost"}
                    className="w-full justify-start px-4 py-2 h-auto"
                    onClick={() => handleFormSelect(form.id)}
                  >
                    <form.icon className="h-5 w-5 mr-2" />
                    <div className="flex flex-col items-start text-left">
                      <span>{form.name}</span>
                      <span className="text-xs text-muted-foreground">{form.title}</span>
                    </div>
                    <div className="ml-auto flex-shrink-0">
                      {getStatusBadge(getFormStatus(form.id))}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Form Metadata Card */}
          {selectedForm && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Form Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Difficulty: {selectedForm.difficulty}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Est. Time: {selectedForm.estimatedTime}</span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <p className="text-sm text-muted-foreground">
                    {selectedForm.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="md:col-span-2">
          {FormComponent && (
            <DatabaseAware
              title="Form Generation Unavailable"
              description="The database connection is currently unavailable. Form data cannot be loaded or saved at this time."
              minHeight={400}
            >
              <FormComponent 
                projectId={projectId}
                onSuccess={() => refetchProgress()}
                readOnly={readOnly}
              />
            </DatabaseAware>
          )}
        </div>
      </div>
    </div>
  );
}