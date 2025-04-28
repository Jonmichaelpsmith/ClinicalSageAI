// client/src/components/ind-wizard/Module1AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2, FileText, Upload } from 'lucide-react';
import SponsorInfoForm from './SponsorInfoForm';
import FDAFormsUploader from './FDAFormsUploader';
import CoverLetterUploader from './CoverLetterUploader';
import InvestigatorBrochureUploader from './InvestigatorBrochureUploader';
import USAgentForm from './USAgentForm';
import UploadStatusTracker from './UploadStatusTracker';

const Module1AdminPage = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [formStatus, setFormStatus] = useState({
    sponsorInfo: 'not_started',
    fdaForms: 'not_started',
    coverLetter: 'not_started',
    investigatorBrochure: 'not_started',
    usAgent: 'not_required' // Default to not required, will update based on sponsor location
  });
  const [, navigate] = useLocation();

  // Fetch project data
  const { data: projectData, isLoading, error } = useQuery({
    queryKey: ['/api/ind/wizard', projectId],
    enabled: !!projectId,
  });

  // Fetch documents
  const { data: documents, isLoading: isLoadingDocs } = useQuery({
    queryKey: ['/api/docs/list', { projectId, type: 'Administrative' }],
    enabled: !!projectId,
  });
  
  // Calculate overall completion
  const getCompletionPercentage = () => {
    const statusValues = {
      'not_started': 0,
      'in_progress': 0.5,
      'completed': 1,
      'not_required': 1
    };
    
    const total = Object.values(formStatus).reduce((sum, status) => sum + statusValues[status], 0);
    const percentage = (total / Object.keys(formStatus).length) * 100;
    return Math.round(percentage);
  };

  // Check if all required sections are complete
  const canProceedToNextModule = () => {
    const requiredSections = ['sponsorInfo', 'fdaForms', 'coverLetter', 'investigatorBrochure'];
    return requiredSections.every(section => formStatus[section] === 'completed');
  };

  // Handle form status updates from child components
  const updateFormStatus = (section, status) => {
    setFormStatus(prev => ({ ...prev, [section]: status }));
  };

  const handleNext = () => {
    // Save progress and navigate to Module 2
    navigate(`/ind-wizard/${projectId}/module-2`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading Module 1 data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load Module 1 data. Please try again or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Module 1: Administrative Information</h1>
          <p className="text-muted-foreground mt-1">
            Complete all administrative components required for your Investigational New Drug (IND) submission.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium">Completion</p>
            <p className="text-2xl font-bold">{getCompletionPercentage()}%</p>
          </div>
          <div className="w-24 h-24 rounded-full flex items-center justify-center border-8 border-primary/20">
            <div 
              className="rounded-full bg-primary text-white w-16 h-16 flex items-center justify-center"
              style={{ opacity: getCompletionPercentage() / 100 }}
            >
              <span className="text-xl font-bold">{getCompletionPercentage()}%</span>
            </div>
          </div>
        </div>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <FileText className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Module 1 Requirements</AlertTitle>
        <AlertDescription className="text-blue-700">
          Module 1 contains administrative information such as forms, contact details, and cover documentation.
          All sections marked with * are required for submission.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sponsor-info">Sponsor Info*</TabsTrigger>
          <TabsTrigger value="fda-forms">FDA Forms*</TabsTrigger>
          <TabsTrigger value="cover-letter">Cover Letter*</TabsTrigger>
          <TabsTrigger value="ib-documents">IB Documents*</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Module 1 Overview</CardTitle>
              <CardDescription>
                Track your progress and view submission requirements for Module 1.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadStatusTracker formStatus={formStatus} />
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Required Documents</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle2 className={`mr-2 h-4 w-4 ${formStatus.sponsorInfo === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                    <span>Sponsor Information Form</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className={`mr-2 h-4 w-4 ${formStatus.fdaForms === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                    <span>FDA Form 1571 (IND Application)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className={`mr-2 h-4 w-4 ${formStatus.fdaForms === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                    <span>FDA Form 1572 (Statement of Investigator)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className={`mr-2 h-4 w-4 ${formStatus.coverLetter === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                    <span>Cover Letter</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className={`mr-2 h-4 w-4 ${formStatus.investigatorBrochure === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                    <span>Investigator Brochure</span>
                  </li>
                  {formStatus.usAgent !== 'not_required' && (
                    <li className="flex items-center">
                      <CheckCircle2 className={`mr-2 h-4 w-4 ${formStatus.usAgent === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                      <span>US Agent Appointment Form</span>
                    </li>
                  )}
                </ul>
              </div>

              {isLoadingDocs ? (
                <div className="mt-6 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Loading document status...</span>
                </div>
              ) : documents && documents.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Uploaded Documents</h3>
                  <ul className="space-y-2">
                    {documents.map(doc => (
                      <li key={doc.id} className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-blue-500" />
                        <span>{doc.name}</span>
                        <span className="ml-auto text-sm text-muted-foreground">
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sponsor-info" className="mt-6">
          <SponsorInfoForm 
            projectId={projectId} 
            initialData={projectData}
            updateStatus={(status) => updateFormStatus('sponsorInfo', status)}
            onRequireUSAgent={(required) => updateFormStatus('usAgent', required ? 'required' : 'not_required')}
          />
        </TabsContent>
        
        <TabsContent value="fda-forms" className="mt-6">
          <FDAFormsUploader 
            projectId={projectId}
            updateStatus={(status) => updateFormStatus('fdaForms', status)}
          />
        </TabsContent>
        
        <TabsContent value="cover-letter" className="mt-6">
          <CoverLetterUploader 
            projectId={projectId}
            updateStatus={(status) => updateFormStatus('coverLetter', status)}
          />
        </TabsContent>
        
        <TabsContent value="ib-documents" className="mt-6">
          <InvestigatorBrochureUploader 
            projectId={projectId}
            updateStatus={(status) => updateFormStatus('investigatorBrochure', status)}
          />
          
          {formStatus.usAgent !== 'not_required' && (
            <div className="mt-6">
              <USAgentForm 
                projectId={projectId}
                updateStatus={(status) => updateFormStatus('usAgent', status)}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={() => navigate(`/ind-wizard/${projectId}`)}>
          Back to Project
        </Button>
        
        <Button 
          onClick={handleNext} 
          disabled={!canProceedToNextModule()}
        >
          {canProceedToNextModule() ? (
            'Next: Module 2 (CMC)'
          ) : (
            <>
              <AlertCircle className="mr-2 h-4 w-4" />
              Complete Required Fields
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Module1AdminPage;