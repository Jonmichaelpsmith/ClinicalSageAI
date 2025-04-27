import React, { useState } from 'react';
import { useWizard } from '../IndWizardLayout';
import { useToast } from '@/hooks/use-toast';

// Import the FormsManager component
const FormsManager = require('../forms/FormsManager').default;

export default function FdaFormsStep() {
  const { indData } = useWizard();
  const projectId = indData?.projectId || '';

  return (
    <div className="space-y-6">
      <FormsManager projectId={projectId} />
    </div>
  );
}