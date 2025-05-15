import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beaker, BarChart3, Database, FileText, SearchCode, Plus, CheckCircle, LineChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'wouter';
import FDA510kService from '../../services/FDA510kService';
import DeviceProfileList from '../cer/DeviceProfileList';
import DeviceProfileDialog from '../cer/DeviceProfileDialog';
import PredicateFinderPanel from './PredicateFinderPanel';

/**
 * 510(k) Workflow Panel
 * 
 * This component provides a unified interface for the 510(k) workflow,
 * including AI tools, workflow steps, and insights.
 */
const WorkflowPanel = ({ projectId, organizationId }) => {
  // Get the current location and URL parameters
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  
  // If there's a tab parameter, use it as the initial tab
  const initialTab = params.get('tab') || 'workflow';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedDeviceProfile, setSelectedDeviceProfile] = useState(null);
  const [isLoading, setIsLoading] = useState({
    predicateFinder: false,
    contentAssistant: false,
    complianceChecker: false
  });
  const { toast } = useToast();
  const [_, navigate] = useNavigate();

  // Handle predicate finder
  const handlePredicateFinder = async () => {
    if (!selectedDeviceProfile) {
      toast({
        title: "Device Profile Required",
        description: "Please select a device profile before running the predicate finder",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading({ ...isLoading, predicateFinder: true });
    
    try {
      // We'll use the enhanced findPredicatesAndLiterature method that searches for both
      // predicate devices and literature references in one call
      const result = await FDA510kService.findPredicatesAndLiterature(selectedDeviceProfile, organizationId || 1);
      
      toast({
        title: "Search Complete",
        description: `Found ${result.predicateDevices?.length || 0} potential predicate devices and ${result.literatureReferences?.length || 0} literature references`,
      });
      
      // Navigate to predicate analysis tab
      setActiveTab('predicateAnalysis');
    } catch (error) {
      console.error('Error in predicate finder:', error);
      toast({
        title: "Predicate Search Error",
        description: error.message || "Could not complete predicate device search",
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, predicateFinder: false });
    }
  };
  
  // Handle content assistant
  const handleContentAssistant = async () => {
    setIsLoading({ ...isLoading, contentAssistant: true });
    
    try {
      // Use the service for content generation
      await FDA510kService.createDefaultSections(projectId || "demo-project-id", organizationId || 1);
      
      toast({
        title: "Content Generation Started",
        description: "Content assistant is generating section drafts",
      });
      
      // Navigate to document editor
      navigate('/client-portal/510k?tab=documentRecommender');
    } catch (error) {
      console.error('Error in content assistant:', error);
      toast({
        title: "Content Generation Error",
        description: error.message || "Could not generate content",
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, contentAssistant: false });
    }
  };
  
  // Handle compliance check
  const handleComplianceCheck = async () => {
    if (!selectedDeviceProfile) {
      toast({
        title: "Device Profile Required",
        description: "Please select a device profile before running compliance check",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading({ ...isLoading, complianceChecker: true });
    
    try {
      // Use the service for compliance checking against the profile
      const result = await FDA510kService.runComplianceCheck(selectedDeviceProfile, organizationId || 1);
      
      // Store result in localStorage for display in insights tab
      localStorage.setItem('complianceResults', JSON.stringify(result));
      
      toast({
        title: "Compliance Check Complete",
        description: `Compliance score: ${Math.round(result.score * 100)}%. ${result.detailedChecks?.length || 0} checks performed.`,
      });
      
      // Navigate to insights tab and show compliance results
      navigate('/client-portal/510k?tab=insights');
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    } catch (error) {
      console.error('Error in compliance checker:', error);
      toast({
        title: "Compliance Check Error",
        description: error.message || "Could not complete compliance check",
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, complianceChecker: false });
    }
  };

  // Handler for device profile selection
  const handleDeviceProfileSelect = (profile) => {
    setSelectedDeviceProfile(profile);
    // Here you can add logic to use the selected profile for the 510(k) process
    toast({
      title: 'Device Profile Selected',
      description: `${profile.deviceName} has been selected for your 510(k) submission.`,
    });
  };

  return (
    <div className="mb-8">
      {/* Card-based interface */}
      {activeTab === 'workflow' && (
          <>
          {/* Workflow Progress Indicator */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex justify-between mb-4 items-center">
              <h3 className="text-md font-medium">510(k) Workflow Progress</h3>
              
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Your progress:</span>
                <div className="bg-gray-200 rounded-full h-2 w-32">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${selectedDeviceProfile ? 20 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-1">
              <div className={`p-2 rounded-lg text-center ${selectedDeviceProfile ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                <div className={`rounded-full h-6 w-6 flex items-center justify-center mx-auto mb-1 ${selectedDeviceProfile ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  1
                </div>
                <div className="text-xs">Device Profile</div>
                {selectedDeviceProfile && (
                  <div className="text-xs mt-1 truncate max-w-full">
                    {selectedDeviceProfile.deviceName}
                  </div>
                )}
              </div>
              
              <div className="p-2 rounded-lg text-center bg-gray-100 text-gray-600">
                <div className="rounded-full h-6 w-6 flex items-center justify-center mx-auto mb-1 bg-gray-300 text-gray-600">
                  2
                </div>
                <div className="text-xs">Predicate Search</div>
              </div>
              
              <div className="p-2 rounded-lg text-center bg-gray-100 text-gray-600">
                <div className="rounded-full h-6 w-6 flex items-center justify-center mx-auto mb-1 bg-gray-300 text-gray-600">
                  3
                </div>
                <div className="text-xs">Pathway Analysis</div>
              </div>
              
              <div className="p-2 rounded-lg text-center bg-gray-100 text-gray-600">
                <div className="rounded-full h-6 w-6 flex items-center justify-center mx-auto mb-1 bg-gray-300 text-gray-600">
                  4
                </div>
                <div className="text-xs">Draft Generation</div>
              </div>
              
              <div className="p-2 rounded-lg text-center bg-gray-100 text-gray-600">
                <div className="rounded-full h-6 w-6 flex items-center justify-center mx-auto mb-1 bg-gray-300 text-gray-600">
                  5
                </div>
                <div className="text-xs">Compliance Check</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-2">
                <CardTitle className="flex items-center text-blue-700">
                  <Database className="mr-2 h-5 w-5 text-blue-600" />
                  1. Device Intake
                </CardTitle>
                <CardDescription>
                  Upload or enter device metadata to kick off the pipeline.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Creating a thorough device profile is the critical first step in your 510(k) submission process. This information will be used to find predicates and analyze the regulatory pathway.
                </p>

                <div className="flex flex-col space-y-3">
                  {!selectedDeviceProfile ? (
                    <DeviceProfileDialog
                      buttonText="Create New Device Profile"
                      buttonVariant="default"
                      dialogTitle="Create 510(k) Device Profile"
                      dialogDescription="Enter the details of your medical device to begin the 510(k) submission process."
                      onSuccessfulSubmit={(profile) => {
                        setSelectedDeviceProfile(profile);
                        toast({
                          title: 'Device Profile Ready',
                          description: `${profile.deviceName} has been created and selected for your 510(k) submission.`,
                        });
                      }}
                      isStartingPoint={true}
                    />
                  ) : (
                    <>
                      <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-100 rounded-md">
                        <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-green-800">Selected Device: {selectedDeviceProfile.deviceName}</h4>
                          <p className="text-xs text-green-700">
                            Class {selectedDeviceProfile.deviceClass} • {selectedDeviceProfile.manufacturer || 'No manufacturer specified'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="flex-shrink-0" onClick={() => setSelectedDeviceProfile(null)}>
                          Change
                        </Button>
                      </div>
                      
                      <DeviceProfileDialog
                        buttonText="Edit Device Profile"
                        buttonVariant="outline"
                        dialogTitle="Edit 510(k) Device Profile"
                        dialogDescription="Update the details of your medical device for the 510(k) submission."
                        existingData={selectedDeviceProfile}
                        onSuccessfulSubmit={(profile) => {
                          setSelectedDeviceProfile(profile);
                          toast({
                            title: 'Device Profile Updated',
                            description: `${profile.deviceName} has been updated for your 510(k) submission.`,
                          });
                        }}
                      />
                    </>
                  )}
                  
                  <Button
                    onClick={() => setActiveTab('deviceProfile')}
                    variant="link"
                    className="text-blue-600 hover:text-blue-800 -mt-1"
                  >
                    View All Device Profiles
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-green-50 to-white pb-2">
                <CardTitle className="flex items-center text-green-700">
                  <SearchCode className="mr-2 h-5 w-5 text-green-600" />
                  2. Predicate & Literature Discovery
                </CardTitle>
                <CardDescription>
                  Draft predicate list and literature search results.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Automatically discover potential predicate devices and relevant scientific literature for your submission.
                </p>
                <Button
                  onClick={handlePredicateFinder}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isLoading.predicateFinder || !selectedDeviceProfile}
                >
                  {isLoading.predicateFinder ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Processing...
                    </>
                  ) : (
                    "Run Predicate Finder"
                  )}
                </Button>
                {!selectedDeviceProfile && (
                  <p className="text-xs text-amber-600 mt-2">
                    Please select a device profile first
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          </>
      )}
      
      {activeTab === 'deviceProfile' && (
          <div className="space-y-6">
            <DeviceProfileList 
              onSelectProfile={handleDeviceProfileSelect} 
            />
            
            {selectedDeviceProfile && (
              <Card className="bg-gradient-to-r from-blue-50 to-white">
                <CardHeader>
                  <CardTitle>Selected Device: {selectedDeviceProfile.deviceName}</CardTitle>
                  <CardDescription>
                    This device profile will be used for your 510(k) submission workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm">Device Class</h4>
                      <p className="text-sm">{selectedDeviceProfile.deviceClass}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Manufacturer</h4>
                      <p className="text-sm">{selectedDeviceProfile.manufacturer || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm">Intended Use</h4>
                    <p className="text-sm">{selectedDeviceProfile.intendedUse}</p>
                  </div>
                  <div className="mt-4">
                    <Button onClick={() => setActiveTab('workflow')} className="mr-2">
                      Continue to Workflow
                    </Button>>
                      Continue to Workflow
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedDeviceProfile(null)}
                    >
                      Deselect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="predicateAnalysis">
          <div className="space-y-6">
            {/* Selected Profile Summary */}
            {selectedDeviceProfile ? (
              <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-2 mr-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Selected Device: {selectedDeviceProfile.deviceName}</h3>
                    <p className="text-sm text-gray-600">
                      Class {selectedDeviceProfile.deviceClass} • {selectedDeviceProfile.manufacturer || 'No manufacturer specified'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-md p-4 mb-6">
                <div className="flex items-start">
                  <div className="rounded-full bg-amber-100 p-2 mr-3 mt-0.5">
                    <LineChart className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-amber-800">No Device Profile Selected</h3>
                    <p className="text-sm text-amber-700 mb-2">
                      Please select or create a device profile before running the predicate finder.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-200 text-amber-700 hover:bg-amber-50"
                      onClick={() => setActiveTab('deviceProfile')}
                    >
                      Go to Device Profiles
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Predicate Finder Panel */}
            <PredicateFinderPanel 
              deviceProfile={selectedDeviceProfile}
              organizationId={organizationId}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="ai-tools">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-2">
                <CardTitle className="flex items-center text-indigo-700">
                  <SearchCode className="mr-2 h-5 w-5 text-indigo-600" />
                  Smart Predicate Finder
                </CardTitle>
                <CardDescription>
                  AI-powered discovery of predicate devices
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Uses advanced machine learning to identify appropriate predicate devices based on your device characteristics.
                </p>
                <Button
                  onClick={handlePredicateFinder}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={isLoading.predicateFinder || !selectedDeviceProfile}
                >
                  {isLoading.predicateFinder ? "Processing..." : "Run AI Analysis"}
                </Button>
                {!selectedDeviceProfile && (
                  <p className="text-xs text-amber-600 mt-2">
                    Please select a device profile first
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-white pb-2">
                <CardTitle className="flex items-center text-teal-700">
                  <FileText className="mr-2 h-5 w-5 text-teal-600" />
                  510(k) Content Assistant
                </CardTitle>
                <CardDescription>
                  AI writing and content generation
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Generates draft content for all required 510(k) sections based on your device specifications and intended use.
                </p>
                <Button
                  onClick={handleContentAssistant}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={isLoading.contentAssistant || !selectedDeviceProfile}
                >
                  {isLoading.contentAssistant ? "Processing..." : "Launch Content Assistant"}
                </Button>
                {!selectedDeviceProfile && (
                  <p className="text-xs text-amber-600 mt-2">
                    Please select a device profile first
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-red-50 to-white pb-2">
                <CardTitle className="flex items-center text-red-700">
                  <FileText className="mr-2 h-5 w-5 text-red-600" />
                  Compliance Checker
                </CardTitle>
                <CardDescription>
                  AI validation against FDA requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Analyzes your 510(k) submission for compliance with FDA requirements and guidelines, identifying potential issues.
                </p>
                <Button
                  onClick={handleComplianceCheck}
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading.complianceChecker || !selectedDeviceProfile}
                >
                  {isLoading.complianceChecker ? "Processing..." : "Check Compliance"}
                </Button>
                {!selectedDeviceProfile && (
                  <p className="text-xs text-amber-600 mt-2">
                    Please select a device profile first
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="insights">
          {(() => {
            // Get compliance results from localStorage if available
            const complianceResultsStr = localStorage.getItem('complianceResults');
            const complianceResults = complianceResultsStr ? JSON.parse(complianceResultsStr) : null;
            
            return (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Submission Insights</CardTitle>
                    <CardDescription>
                      Analytics and insights for your 510(k) submission process
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!complianceResults && (
                      <>
                        <p className="text-gray-500 italic text-sm mb-4">No insights available yet. Complete more pipeline steps to generate insights.</p>
                        <Button onClick={() => setActiveTab('workflow')} variant="outline">
                          Return to Workflow
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
                
                {complianceResults && (
                  <Card className="shadow-md">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                      <CardTitle className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-blue-600" />
                        Compliance Check Results
                      </CardTitle>
                      <CardDescription>
                        Summary of 510(k) submission compliance check
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold mb-1">Compliance Score</h3>
                          <div className="text-2xl font-bold text-blue-700">
                            {Math.round(complianceResults.score * 100)}%
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Overall submission readiness
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold mb-1">Checks Passed</h3>
                          <div className="text-2xl font-bold text-green-600">
                            {complianceResults.passedChecks} / {complianceResults.totalChecks}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Compliance criteria met
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold mb-1">Issues Found</h3>
                          <div className="text-2xl font-bold text-amber-600">
                            {complianceResults.warnings + complianceResults.errors}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {complianceResults.errors} critical, {complianceResults.warnings} warnings
                          </p>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-4">Detailed Compliance Checks</h3>
                      
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Check</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Category</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Recommendation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {complianceResults.detailedChecks.map((check, index) => (
                              <tr key={check.id || index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm">{check.name}</td>
                                <td className="px-4 py-3 text-sm">{check.category}</td>
                                <td className="px-4 py-3 text-sm">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${check.status === 'passed' ? 'bg-green-100 text-green-800' : 
                                      check.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-red-100 text-red-800'}`
                                  }>
                                    {check.status === 'passed' ? 'Passed' : 
                                      check.status === 'warning' ? 'Warning' : 'Failed'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {check.status !== 'passed' ? check.recommendation : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="flex justify-between mt-6">
                        <Button onClick={() => setActiveTab('workflow')} variant="outline">
                          Return to Workflow
                        </Button>
                        <Button className="bg-blue-600" onClick={() => window.print()}>
                          Export Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowPanel;