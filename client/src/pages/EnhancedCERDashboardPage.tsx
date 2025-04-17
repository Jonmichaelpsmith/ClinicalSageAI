import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import AdvancedDashboard from '../components/AdvancedDashboard';
import NLPQuery from '../components/NLPQuery';
import { ChevronLeft, Clipboard, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EnhancedCERDashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filteredData, setFilteredData] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the user is authenticated
    const authData = localStorage.getItem('cer_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed && parsed.authenticated) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to parse auth data', error);
      }
    }

    // Demo mode - automatically set authenticated
    setIsAuthenticated(true);
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleFilterResults = (results: any) => {
    setFilteredData(results);
  };

  const handleLogin = () => {
    // Set demo authentication
    localStorage.setItem('cer_auth', JSON.stringify({ authenticated: true }));
    setIsAuthenticated(true);
    
    toast({
      title: "Logged in successfully",
      description: "Welcome to the CER Dashboard"
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <AlertTriangle className="h-12 w-12 text-warning" />
            <h1 className="text-2xl font-bold">Authentication Required</h1>
            <p className="text-muted-foreground">
              You need to log in to access the Enhanced CER Dashboard.
            </p>
          </div>
          
          <div className="flex flex-col space-y-4">
            <Button onClick={handleLogin} size="lg" className="w-full">
              Log In
            </Button>
            <Link href="/">
              <Button variant="outline" size="lg" className="w-full">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Enhanced CER Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/cer-generator">
              <Clipboard className="mr-2 h-4 w-4" />
              CER Generator
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="mb-4 p-4 border bg-card rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Welcome to the Enhanced Clinical Evaluation Report Dashboard</h2>
        <p className="text-muted-foreground mb-4">
          Use natural language queries to filter and analyze adverse event data from FDA FAERS, 
          visualize trends, compare multiple products, and generate comprehensive reports.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
            Data Source: FDA FAERS
          </span>
          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            Natural Language Processing
          </span>
          <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20">
            Comparative Analysis
          </span>
          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
            PDF Export
          </span>
        </div>
      </div>
      
      <NLPQuery onFilterResults={handleFilterResults} />
      <AdvancedDashboard filteredData={filteredData} />
    </div>
  );
};

export default EnhancedCERDashboardPage;