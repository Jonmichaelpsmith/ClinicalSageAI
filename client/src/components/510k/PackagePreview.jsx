import React from 'react';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/alert';
import { isFeatureEnabled } from '../../flags/featureFlags';
import { ESTARPackageBuilder } from '.';

/**
 * eSTAR Plus Package Assembly and Preview component
 * Displays file information, AI validation results, and provides options
 * to build and download the full package or submit to FDA ESG.
 * 
 * This component now delegates to the enhanced ESTARPackageBuilder component
 * for a more comprehensive package building experience.
 */
const PackagePreview = ({ projectId = "demo-project-id" }) => {
  if (!isFeatureEnabled('ENABLE_PACKAGE_ASSEMBLY')) {
    return (
      <Alert>
        <AlertTitle>Feature Disabled</AlertTitle>
        <AlertDescription>
          eSTAR Package Assembly feature is currently disabled
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <ESTARPackageBuilder projectId={projectId} />
      <ESTARPackageBuilder.FAQ />
    </div>
  );
};

export default PackagePreview;