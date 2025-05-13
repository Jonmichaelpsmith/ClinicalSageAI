import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, ExternalLink, PlusCircle, Route } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { isFeatureEnabled } from '../flags/featureFlags';

// Import our components
import { ESTARPackageBuilder } from '../components/510k';

/**
 * eSTAR Package Showcase Page
 * 
 * This page provides a dedicated showcase for the eSTAR Package Assembly feature,
 * including detailed examples and step-by-step guidance.
 */
const ESTARPackagePage = () => {
  const [projectId] = useState("demo-project-id");
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Navigation handler
  const handleBack = () => {
    setLocation('/510k');
  };
  
  // Navigate to 510k dashboard
  const navigateToDashboard = () => {
    setLocation('/510k-dashboard');
  };

  const handleOpenFdaGuidance = () => {
    window.open('https://www.fda.gov/medical-devices/premarket-notification-510k/estar-program', '_blank');
  };

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={handleBack} className="h-8 px-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to 510(k)</span>
          </Button>
          <Button variant="outline" onClick={navigateToDashboard} size="sm" className="h-8 px-2">
            <Route className="h-4 w-4 mr-1" />
            <span>View 510(k) Dashboard</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-center">eSTAR Package Builder</h1>
        <Button variant="outline" size="sm" onClick={handleOpenFdaGuidance} className="flex items-center gap-1.5">
          <ExternalLink className="h-4 w-4" />
          <span>FDA eSTAR Guidance</span>
        </Button>
      </div>

      {/* Introduction */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>FDA eSTAR Submission Package Builder</CardTitle>
          <CardDescription>
            The eSTAR (electronic Submission Template And Resource) is the FDA's standardized format for 510(k) submissions. 
            This tool helps you assemble, validate, and submit your eSTAR package.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-t-4 border-t-blue-600">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 mb-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Document Assembly</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  Automatically organize and validate all your submission documents according to FDA requirements. 
                  The system ensures no critical documents are missing.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-t-4 border-t-green-600">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100 mb-2">
                  <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Compliance Validation</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  AI-powered validation identifies compliance issues before submission. 
                  This prevents common rejection reasons and speeds up the review process.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-t-4 border-t-purple-600">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 mb-2">
                  <ExternalLink className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">FDA ESG Submission</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  Direct submission to the FDA Electronic Submissions Gateway (ESG).
                  Fully compliant with the FDA's eCopy requirements and digital signature standards.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Package Builder */}
      {isFeatureEnabled('ENABLE_PACKAGE_ASSEMBLY') ? (
        <div className="space-y-6">
          <ESTARPackageBuilder projectId={projectId} />
          <ESTARPackageBuilder.FAQ />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>eSTAR Package Assembly</CardTitle>
            <CardDescription>
              This feature is not enabled for your organization.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Quick Links */}
      <div className="mt-10 pt-8 border-t">
        <h2 className="text-lg font-medium mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start" onClick={() => window.open('https://www.fda.gov/medical-devices/how-study-and-market-your-device/device-advice-comprehensive-regulatory-assistance', '_blank')}>
            <FileText className="h-4 w-4 mr-2" />
            FDA Device Advice
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => window.open('https://www.fda.gov/medical-devices/premarket-submissions/premarket-notification-510k', '_blank')}>
            <FileText className="h-4 w-4 mr-2" />
            510(k) Submission Guidelines
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => window.open('https://www.fda.gov/industry/electronic-submissions-gateway', '_blank')}>
            <FileText className="h-4 w-4 mr-2" />
            FDA ESG Information
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ESTARPackagePage;