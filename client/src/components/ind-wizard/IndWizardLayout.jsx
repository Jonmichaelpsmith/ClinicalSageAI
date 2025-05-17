// src/components/ind-wizard/IndWizardLayout.jsx
import React, { useState, createContext, useContext, useMemo } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, FileText } from 'lucide-react'; // AI icon and file icon

// Import DocuShare components and tabs
import UnifiedVaultPanel from '@/components/document-management/UnifiedVaultPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import the steps configuration
// NOTE: In production, adjust the import path as needed
const indWizardSteps = [
  { path: 'pre-planning', title: 'Initial Planning & Pre-IND' },
  { path: 'nonclinical', title: 'Nonclinical Data Collection' },
  { path: 'cmc', title: 'CMC Data' },
  { path: 'clinical-protocol', title: 'Clinical Protocol' },
  { path: 'investigator-brochure', title: 'Investigator Brochure' },
  { path: 'fda-forms', title: 'FDA Forms' },
  { path: 'final-assembly', title: 'Final Assembly & Submission' },
];

// Define the structure for your IND data
const initialIndData = {
  projectDetails: {},
  preIndMeeting: {},
  nonclinicalData: {},
  cmcData: {},
  clinicalProtocol: {},
  investigatorBrochure: {},
  fdaForms: {},
  finalSubmission: {},
};

// Create Context for Wizard State (Global Data & Actions)
const WizardContext = createContext(null);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within an IndWizardLayout');
  }
  return context;
}

export default function IndWizardLayout({ children }) {
  const [location, setLocation] = useLocation();
  const [indData, setIndData] = useState(initialIndData); // Overall draft data
  const [isCoPilotOpen, setIsCoPilotOpen] = useState(false);
  const [savingStatus, setSavingStatus] = useState('idle'); // idle, saving, success, error

  // Determine current step from route
  const currentPath = location && location.pathname ? location.pathname.split('/').pop() : '';
  const currentStepIndex = indWizardSteps.findIndex(step => step.path === currentPath);
  const adjustedStepIndex = currentStepIndex === -1 ? 0 : currentStepIndex;
  const currentStep = indWizardSteps[adjustedStepIndex] || indWizardSteps[0]; // Default to first step if path not found
  const totalSteps = indWizardSteps.length;
  const progress = ((adjustedStepIndex + 1) / totalSteps) * 100;

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setLocation(`/ind/wizard/${indWizardSteps[stepIndex].path}`);
    }
  };

  const goToNextStep = () => {
    // Save current step data before proceeding
    saveCurrentStep().then(() => {
      goToStep(adjustedStepIndex + 1);
    });
  };
  
  const goToPreviousStep = () => goToStep(adjustedStepIndex - 1);

  // Function to update shared IND data (could involve API calls via TanStack Query)
  const updateIndDataSection = (section, data) => {
     console.log(`Updating IND data section: ${section}`, data);
     setSavingStatus('saving');
     
     // Update local state
     setIndData((prevData) => ({
       ...prevData,
       [section]: { ...prevData[section], ...data },
     }));
     
     // Here we'd make an API call to save data in a real implementation
     setTimeout(() => {
       setSavingStatus('success');
     }, 1000);
  };
  
  // Save current step data to the server
  const saveCurrentStep = async () => {
    try {
      setSavingStatus('saving');
      // API call to save the current state
      // const response = await apiRequest('POST', '/api/ind/save-draft', indData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSavingStatus('success');
      return true;
    } catch (error) {
      setSavingStatus('error');
      return false;
    }
  };
  
  // AI co-pilot assistance
  const getAiAssistance = (context) => {
    console.log(`Getting AI assistance for: ${context}`);
    // In production, this would integrate with OpenAI or similar
    alert(`AI Co-Pilot: Analyzing ${context}... (To be implemented with OpenAI)`);
  };

  const wizardContextValue = useMemo(() => ({
    currentStepIndex: adjustedStepIndex,
    totalSteps,
    indData,
    updateIndDataSection,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    getAiAssistance,
    savingStatus,
    saveCurrentStep,
  }), [adjustedStepIndex, totalSteps, indData, savingStatus]); // Dependencies updated

  return (
    <WizardContext.Provider value={wizardContextValue}>
      <div className="flex h-screen bg-gray-100">

        {/* Sidebar for Steps Navigation */}
        <nav className="w-64 bg-white border-r p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">IND Wizard Steps</h2>
          <ScrollArea className="flex-grow">
            <ul className="space-y-2">
              {indWizardSteps.map((step, index) => (
                <li key={step.path}>
                  <Link
                    to={`/module-${index + 1}`}
                    className={`block p-2 rounded hover:bg-gray-100 ${index === adjustedStepIndex ? 'font-bold text-blue-600 bg-blue-50' : ''}`}
                  >
                    Step {index + 1}: {step.title}
                  </Link>
                  {/* Optionally add status indicators (completed, errors) */}
                </li>
              ))}
            </ul>
            
            {/* DocuShare Documents Integration */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-1.5 text-teal-600" />
                DocuShare Documents
              </h3>
              <UnifiedVaultPanel
                moduleName="ind"
                moduleLabel="IND Documents"
                compact
                hidePreview
                showMetrics={false}
              />
            </div>
          </ScrollArea>
          <div className="mt-auto border-t pt-4">
             {/* Maybe add overall save draft / exit buttons */}
             <Button 
               variant="outline" 
               className="w-full"
               onClick={saveCurrentStep}
             >
               Save Draft
             </Button>
             <div className="text-center mt-2">
               <Link to="/document-management" className="text-xs text-teal-600 hover:text-teal-800">
                 Open Full DocuShare System
               </Link>
             </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">{currentStep.title}</h1>
            <div className="flex items-center space-x-2">
              {/* DocuShare Integration Badge */}
              <div className="mr-3 flex items-center">
                <span className="bg-teal-100 text-teal-800 text-xs px-1.5 py-0.5 rounded-md border border-teal-200 flex items-center">
                  <FileText className="h-3 w-3 mr-1 text-teal-600" />
                  21 CFR Part 11 Compliant
                </span>
              </div>
              
              {/* AI Co-Pilot Toggle Button */}
              <Button variant="outline" size="icon" onClick={() => setIsCoPilotOpen(!isCoPilotOpen)}>
                <Bot className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Step Content */}
          <ScrollArea className="flex-1 p-6">
            {/* DocuShare Integration Card for current step */}
            <Card className="mb-5 border-teal-100 bg-teal-50/30">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-teal-600 mr-2" />
                  <CardTitle className="text-sm font-medium">Step Documents</CardTitle>
                </div>
                <div className="text-xs bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-sm">
                  21 CFR Part 11 Compliant
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <UnifiedVaultPanel
                  moduleName="ind"
                  moduleLabel={`${currentStep.title} Documents`}
                  compact
                  hidePreview
                  hideMetadata
                  showMetrics={false}
                />
              </CardContent>
            </Card>
            
            {children} {/* Display the current step's component */}
          </ScrollArea>

          {/* Save Status */}
          <div className="bg-white px-6 py-2 text-sm text-right">
            {savingStatus === 'saving' && <span className="text-amber-500">Saving progress...</span>}
            {savingStatus === 'success' && <span className="text-green-500">Changes saved</span>}
            {savingStatus === 'error' && <span className="text-red-500">Error saving changes</span>}
          </div>

          {/* Navigation Footer */}
          <footer className="bg-white border-t p-4 flex justify-between items-center">
              {/* Progress Indicator */}
              <div className="w-1/3">
                  <Progress value={progress} />
                  <span className="text-xs text-gray-500">Overall Progress ({Math.round(progress)}%)</span>
              </div>
              {/* Navigation Buttons */}
              <div className="space-x-2">
                  <Button
                      variant="outline"
                      onClick={goToPreviousStep}
                      disabled={adjustedStepIndex === 0}
                  >
                      Previous
                  </Button>
                  {adjustedStepIndex < totalSteps - 1 ? (
                      <Button onClick={goToNextStep}>
                          Save and Next
                      </Button>
                  ) : (
                      <Button onClick={() => alert('Trigger Final Review & Submit (Implement Me!)')}>
                          Final Review & Submit
                      </Button>
                  )}
              </div>
          </footer>
        </main>

        {/* AI Co-Pilot Panel (Example: Collapsible Sidebar) */}
        {isCoPilotOpen && (
           <aside className="w-80 bg-white border-l p-4 flex flex-col transition-all duration-300 ease-in-out">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-semibold">AI Co-Pilot</h3>
                 <Button variant="ghost" size="icon" onClick={() => setIsCoPilotOpen(false)}>X</Button>
              </div>
              <ScrollArea className="flex-grow">
                 {/* AI Chat interface or contextual help content goes here */}
                 <p className="text-sm text-gray-600">AI assistance context for: {currentStep.title}</p>
                 {/* Placeholder for AI interaction components */}
                 <textarea className="w-full h-40 border rounded p-2 text-sm" placeholder="Ask the AI Co-Pilot..."></textarea>
                 <Button 
                   className="w-full mt-2"
                   onClick={() => getAiAssistance(`User query regarding ${currentStep.title}`)}
                 >
                   Send
                 </Button>
              </ScrollArea>
           </aside>
        )}
      </div>
    </WizardContext.Provider>
  );
}