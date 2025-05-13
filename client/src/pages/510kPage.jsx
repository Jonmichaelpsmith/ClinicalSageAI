import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, FileText, Clipboard, Database, BookOpen, Search, Route } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import { useNavigate } from 'wouter';
import FDA510kService from '../services/FDA510kService';
import { isFeatureEnabled } from '../flags/featureFlags';

// Import our components
import { 
  DeviceProfileForm, 
  PredicateAnalysis, 
  EnhancedLiteratureDiscovery,
  EquivalenceDraft,
  ComplianceChecker,
  PackagePreview
} from '../components/510k';
import RegPathwayAnalyzer from '../components/510k/RegPathwayAnalyzer';
import { DocumentSectionRecommender } from '../components/documentrecommender';

/**
 * 510(k) Page Component
 * 
 * This page provides a comprehensive interface for managing 510(k) submissions,
 * including device profiles, predicate device analysis, and document section
 * recommendations.
 */
const FDA510kPage = () => {
  const [activeTab, setActiveTab] = useState('deviceProfile');
  const [deviceProfile, setDeviceProfile] = useState(null);
  const [predicateDevice, setPredicateDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentOrganization } = useTenant();
  const [_, navigate] = useNavigate();

  // Check if features are enabled
  const isPredicateAnalysisEnabled = isFeatureEnabled('ENABLE_PREDICATE_SEARCH', currentOrganization?.id);
  const isDocumentRecommenderEnabled = isFeatureEnabled('ENABLE_SECTION_RECOMMENDER', currentOrganization?.id);
  const isLiteratureDiscoveryEnabled = isFeatureEnabled('ENABLE_LITERATURE_DISCOVERY', currentOrganization?.id);
  const isPathwayAdvisorEnabled = isFeatureEnabled('ENABLE_PATHWAY_ADVISOR', currentOrganization?.id);
  const isEquivalenceDraftingEnabled = isFeatureEnabled('ENABLE_EQUIVALENCE_DRAFTING', currentOrganization?.id);
  const isComplianceCheckerEnabled = isFeatureEnabled('ENABLE_COMPLIANCE_CHECKER', currentOrganization?.id);

  // Load device profile if available
  useEffect(() => {
    if (currentOrganization) {
      loadDeviceProfile();
    }
  }, [currentOrganization]);

  // Load device profile from server
  const loadDeviceProfile = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, we would load the user's device profile here
      // For now, we'll use a simple mock profile
      const mockProfile = {
        deviceName: "GlucoTrack Continuous Glucose Monitor",
        productCode: "NBW",
        deviceClass: "II",
        regulationNumber: "862.1345",
        indications: "For continuous monitoring of glucose levels in adults with diabetes",
        mechanism: "Minimally-invasive subcutaneous sensor with wireless transmitter",
        measurementRange: "40-400 mg/dL",
        accuracy: "±15% over entire range",
        materials: "Biocompatible plastic housing, medical-grade adhesive, platinum electrode"
      };
      
      setDeviceProfile(mockProfile);
    } catch (error) {
      console.error('Error loading device profile:', error);
      toast({
        title: "Failed to load profile",
        description: "Could not load your device profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle device profile update
  const handleProfileUpdate = (profile) => {
    setDeviceProfile(profile);
    
    toast({
      title: "Profile Updated",
      description: "Your device profile has been updated successfully.",
    });
  };

  // Handle predicate device selection
  const handlePredicateSelect = (predicate) => {
    setPredicateDevice(predicate);
    setActiveTab('predicateAnalysis');
  };

  // Handle section selection from recommender
  const handleSectionSelect = (sectionKey) => {
    // In a real implementation, we would navigate to the specific section editor
    toast({
      title: "Section Selected",
      description: `Selected section: ${sectionKey}`,
    });
  };

  // Navigation handler
  const handleBack = () => {
    navigate('/client-portal');
  };

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="outline" onClick={() => navigate('/510k-dashboard')}>
            <Route className="h-4 w-4 mr-2" />
            Dashboard View
          </Button>
        </div>
        <h1 className="text-2xl font-bold">FDA 510(k) Automation</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-8 mb-8">
          <TabsTrigger value="deviceProfile" className="flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Device Profile
          </TabsTrigger>

          <TabsTrigger 
            value="pathwayAdvisor" 
            className="flex items-center"
            disabled={!deviceProfile || !isPathwayAdvisorEnabled}
          >
            <Route className="h-4 w-4 mr-2" />
            Regulatory Pathway
          </TabsTrigger>
          <TabsTrigger 
            value="predicateAnalysis" 
            className="flex items-center"
            disabled={!deviceProfile || !isPredicateAnalysisEnabled}
          >
            <Clipboard className="h-4 w-4 mr-2" />
            Predicate Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="equivalenceDraft" 
            className="flex items-center"
            disabled={!deviceProfile || !isEquivalenceDraftingEnabled || !predicateDevice}
          >
            <FileText className="h-4 w-4 mr-2" />
            SE Draft
          </TabsTrigger>
          <TabsTrigger 
            value="literatureDiscovery" 
            className="flex items-center"
            disabled={!deviceProfile || !isLiteratureDiscoveryEnabled}
          >
            <Search className="h-4 w-4 mr-2" />
            Literature Discovery
          </TabsTrigger>
          <TabsTrigger 
            value="documentRecommender" 
            className="flex items-center"
            disabled={!deviceProfile || !isDocumentRecommenderEnabled}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Document Recommendations
          </TabsTrigger>
          <TabsTrigger 
            value="complianceChecker" 
            className="flex items-center"
            disabled={!deviceProfile || !isComplianceCheckerEnabled}
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Compliance Check
          </TabsTrigger>
          <TabsTrigger 
            value="packageAssembly" 
            className="flex items-center"
            disabled={!deviceProfile || !isFeatureEnabled('ENABLE_PACKAGE_ASSEMBLY')}
          >
            <FileText className="h-4 w-4 mr-2" />
            eSTAR Package
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="deviceProfile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Profile</CardTitle>
              <CardDescription>
                Define your device characteristics to enable AI-powered 510(k) automation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deviceProfile ? (
                <DeviceProfileForm 
                  initialData={deviceProfile}
                  onSubmit={handleProfileUpdate}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading device profile...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pathwayAdvisor" className="space-y-4">
          {isPathwayAdvisorEnabled ? (
            <RegPathwayAnalyzer
              deviceProfile={deviceProfile}
              organizationId={currentOrganization?.id || 1}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Regulatory Pathway Advisor</CardTitle>
                <CardDescription>
                  This feature is not enabled for your organization.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="predicateAnalysis" className="space-y-4">
          {isPredicateAnalysisEnabled ? (
            <PredicateAnalysis 
              deviceProfile={deviceProfile}
              onNavigateBack={() => setActiveTab('deviceProfile')}
              initialPredicate={predicateDevice}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Predicate Analysis</CardTitle>
                <CardDescription>
                  This feature is not enabled for your organization.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="equivalenceDraft" className="space-y-4">
          {isEquivalenceDraftingEnabled && predicateDevice ? (
            <EquivalenceDraft
              projectId={deviceProfile?.id}
              onAddToReport={(draftText) => {
                toast({
                  title: "Draft Added",
                  description: "Substantial Equivalence section added to your 510(k) report"
                });
                // Navigate to document recommendations after adding the draft to the report
                setActiveTab("documentRecommender");
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Substantial Equivalence Draft</CardTitle>
                <CardDescription>
                  {!predicateDevice 
                    ? "Please complete the Predicate Analysis step first." 
                    : "This feature is not enabled for your organization."}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="literatureDiscovery" className="space-y-4">
          {isLiteratureDiscoveryEnabled ? (
            <EnhancedLiteratureDiscovery
              deviceProfile={deviceProfile}
              onLiteratureAdded={(citations) => {
                toast({
                  title: "Literature Added",
                  description: `${citations.length} citations added to your submission`
                });
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Literature Discovery</CardTitle>
                <CardDescription>
                  This feature is not enabled for your organization.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="documentRecommender" className="space-y-4">
          {isDocumentRecommenderEnabled ? (
            <DocumentSectionRecommender 
              deviceProfile={deviceProfile}
              documentType="510k"
              onSectionSelect={handleSectionSelect}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Document Recommendations</CardTitle>
                <CardDescription>
                  This feature is not enabled for your organization.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="complianceChecker" className="space-y-4">
          {isComplianceCheckerEnabled ? (
            <ComplianceChecker 
              projectId={deviceProfile?.id || "demo-project-id"} 
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Compliance Checker</CardTitle>
                <CardDescription>
                  This feature is not enabled for your organization.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="packageAssembly" className="space-y-4">
          {isFeatureEnabled('ENABLE_PACKAGE_ASSEMBLY') ? (
            <PackagePreview 
              projectId={deviceProfile?.id || "demo-project-id"} 
            />
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FDA510kPage;