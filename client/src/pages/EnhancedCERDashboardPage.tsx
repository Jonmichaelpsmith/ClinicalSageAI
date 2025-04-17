import React, { useState, useEffect } from 'react';
import CERDashboard from '@/components/CERDashboard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const EnhancedCERDashboardPage: React.FC = () => {
  // Set to true to bypass authentication for testing
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Set auth to true in localStorage for the CERDashboard component
    if (isAuthenticated) {
      localStorage.setItem('cer_auth', 'true');
    }
  }, [isAuthenticated]);
  
  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('cer_auth', 'true');
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-muted/30">
            <h2 className="text-2xl font-bold">Enhanced CER Dashboard</h2>
            <p className="text-sm text-muted-foreground">Clinical Evaluation Reporting Dashboard</p>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="mb-6 text-center max-w-md">
              <p className="mb-4">This dashboard provides tools for comprehensive regulatory data analysis from FDA FAERS, FDA MAUDE, and EU EUDAMED sources.</p>
              <ul className="text-sm text-left list-disc pl-5 mb-4 space-y-1">
                <li>FAERS adverse event analytics</li>
                <li>Medical device reporting analysis</li>
                <li>Multi-source regulatory data integration</li>
                <li>Automated narrative generation</li>
              </ul>
            </div>
            <Button 
              size="lg" 
              onClick={login} 
              className="px-8 py-2 font-medium"
            >
              Enter Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <CERDashboard />
    </div>
  );
};

export default EnhancedCERDashboardPage;