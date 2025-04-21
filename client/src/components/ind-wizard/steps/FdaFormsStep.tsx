import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useWizard } from '../IndWizardLayout';

export default function FdaFormsStep() {
  const { indData, updateIndData } = useWizard();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>FDA Forms</CardTitle>
          <CardDescription>Prepare and manage FDA forms for your IND submission</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-10 text-center">
            FDA Forms (Coming Soon)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}