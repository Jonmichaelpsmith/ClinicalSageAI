import React from 'react';
import { BlueprintGenerator } from '@/components/cmc/BlueprintGenerator';
import { useLocation, Route, Switch } from 'wouter';
import { BlueprintEditor } from '@/components/cmc/BlueprintEditor';

function CMCBlueprintPage() {
  const [location] = useLocation();
  
  // Check if we're on a specific blueprint page
  const match = location.match(/^\/cmc\/blueprints\/([^/]+)$/);
  const blueprintId = match ? match[1] : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {blueprintId ? (
        <BlueprintEditor />
      ) : (
        <BlueprintGenerator />
      )}
    </div>
  );
}

export default function CMCRoutes() {
  return (
    <Switch>
      <Route path="/cmc" component={CMCBlueprintPage} />
      <Route path="/cmc/blueprints/:id" component={CMCBlueprintPage} />
    </Switch>
  );
}