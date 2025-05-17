import React from 'react';
import { DocuShareProvider, useDocuShare } from '@/contexts/DocuShareContext';
import DocuSharePanel from './DocuSharePanel';
import { Card, CardContent } from '@/components/ui/card';

function Metrics() {
  const { docs } = useDocuShare();
  const total = docs.length;
  const finalCount = docs.filter(d => d.status && d.status.toLowerCase() === 'final').length;
  const draftCount = docs.filter(d => d.status && d.status.toLowerCase() === 'draft').length;
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <Card>
        <CardContent className="p-2 text-center">
          <div className="font-bold text-lg">{total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-2 text-center">
          <div className="font-bold text-green-600">{finalCount}</div>
          <div className="text-xs text-gray-600">Final</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-2 text-center">
          <div className="font-bold text-amber-600">{draftCount}</div>
          <div className="text-xs text-gray-600">Draft</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnifiedVaultPanel({
  moduleName = 'default',
  moduleLabel = 'Document Repository',
  includeGeneral = true,
  showMetrics = true,
  ...panelProps
}) {
  return (
    <DocuShareProvider moduleName={moduleName} moduleLabel={moduleLabel} includeGeneral={includeGeneral}>
      {showMetrics && <Metrics />}
      <DocuSharePanel {...panelProps} />
    </DocuShareProvider>
  );
}
