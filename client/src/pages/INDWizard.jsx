// src/pages/INDWizard.jsx
import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import IndWizardLayout from '../components/ind-wizard/IndWizardLayout';
import PreIndStep from '../components/ind-wizard/steps/PreIndStep';
import NonclinicalStep from '../components/ind-wizard/steps/NonclinicalStep';
import ClinicalProtocolStep from '../components/ind-wizard/steps/ClinicalProtocolStep';
import InvestigatorBrochureStep from '../components/ind-wizard/steps/InvestigatorBrochureStep';
import FdaFormsStep from '../components/ind-wizard/steps/FdaFormsStep';
import FinalAssemblyStep from '../components/ind-wizard/steps/FinalAssemblyStep';
import { Button } from '@/components/ui/button';

import CmcStep from '../components/ind-wizard/steps/CmcStep';

export default function INDWizard() {
  const [location] = useLocation();
  console.log("INDWizard component rendering with location:", location);

  // Force IndWizardLayout with PreIndStep as a fallback if no specific route matches
  const renderFallbackContent = () => {
    console.log("Rendering fallback content");
    return (
      <IndWizardLayout>
        <PreIndStep />
      </IndWizardLayout>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center p-4 bg-white border-b">
        <h1 className="text-3xl font-bold">IND Preparation Wizard</h1>
        <div>
          <Button 
            variant="outline" 
            className="mr-2"
            onClick={() => {
              // Return to the dashboard without an alert
              window.location.href = '/';
            }}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>

      <Switch>
        <Route path="/ind/wizard" exact>
          {renderFallbackContent()}
        </Route>
        <Route path="/ind/wizard/pre-planning">
          <IndWizardLayout>
            <PreIndStep />
          </IndWizardLayout>
        </Route>
        <Route path="/ind/wizard/nonclinical">
          <IndWizardLayout>
            <NonclinicalStep />
          </IndWizardLayout>
        </Route>
        <Route path="/ind/wizard/cmc">
          <IndWizardLayout>
            <CmcStep />
          </IndWizardLayout>
        </Route>
        <Route path="/ind/wizard/clinical-protocol">
          <IndWizardLayout>
            <ClinicalProtocolStep />
          </IndWizardLayout>
        </Route>
        <Route path="/ind/wizard/investigator-brochure">
          <IndWizardLayout>
            <InvestigatorBrochureStep />
          </IndWizardLayout>
        </Route>
        <Route path="/ind/wizard/fda-forms">
          <IndWizardLayout>
            <FdaFormsStep />
          </IndWizardLayout>
        </Route>
        <Route path="/ind/wizard/final-submission">
          <IndWizardLayout>
            <FinalAssemblyStep />
          </IndWizardLayout>
        </Route>
        <Route path="/ind/wizard/final-assembly">
          <IndWizardLayout>
            <FinalAssemblyStep />
          </IndWizardLayout>
        </Route>
        <Route>
          {/* Catch-all route to ensure at least something renders */}
          {renderFallbackContent()}
        </Route>
      </Switch>
    </div>
  );
}