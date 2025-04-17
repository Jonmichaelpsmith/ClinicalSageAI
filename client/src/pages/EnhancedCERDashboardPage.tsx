import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import AdvancedDashboard from '../components/AdvancedDashboard';
import NLPQuery from '../components/NLPQuery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Info, AlertTriangle, Lock, Unlock, FileText, ChevronRight, Search, X } from 'lucide-react';

// Mock NDC codes for demonstration
const SAMPLE_NDC_CODES = [
  { code: '0078-0357-15', name: 'ENTRESTO 24/26 MG', description: 'Sacubitril/Valsartan tablets for heart failure' },
  { code: '0006-0277-31', name: 'JANUVIA 100 MG', description: 'Sitagliptin for type 2 diabetes' },
  { code: '0006-5125-58', name: 'KEYTRUDA 100 MG', description: 'Pembrolizumab injection for cancer treatment' },
  { code: '50090-1895-0', name: 'FARXIGA 10 MG', description: 'Dapagliflozin for type 2 diabetes/heart failure' },
  { code: '0002-3232-30', name: 'TRULICITY 1.5 MG', description: 'Dulaglutide for type 2 diabetes' }
];

const DEVICE_CODES = [
  { code: 'DEN123456', name: 'HeartFlow FFRCT', description: 'Non-invasive coronary artery disease testing' },
  { code: 'DEN765432', name: 'Dexcom G6', description: 'Continuous glucose monitoring system' },
  { code: 'DEN246801', name: 'Inspire Upper Airway Stimulation', description: 'Sleep apnea treatment device' }
];

const EnhancedCERDashboardPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [ndcCode, setNdcCode] = useState<string>('');
  const [selectedNdcCodes, setSelectedNdcCodes] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<any>(null);
  const [showAuthDialog, setShowAuthDialog] = useState<boolean>(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Check for authentication on component mount
  useEffect(() => {
    const cerAuth = localStorage.getItem('cer_auth');
    if (cerAuth === 'authenticated') {
      setIsAuthenticated(true);
    } else {
      setShowAuthDialog(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('cer_auth', 'authenticated');
    setIsAuthenticated(true);
    setShowAuthDialog(false);
    
    toast({
      title: "Authentication successful",
      description: "You have been granted access to the CER Dashboard."
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('cer_auth');
    setIsAuthenticated(false);
    
    toast({
      title: "Logged out",
      description: "You have been logged out of the CER Dashboard."
    });
  };

  const handleSearchNdc = () => {
    if (!ndcCode.trim()) {
      toast({
        title: "Empty NDC Code",
        description: "Please enter an NDC code to search.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, we would fetch data from the API
    // For now, check if the code exists in our sample data
    const foundCode = SAMPLE_NDC_CODES.find(item => item.code === ndcCode);
    
    if (foundCode) {
      if (selectedNdcCodes.includes(ndcCode)) {
        toast({
          title: "Already Selected",
          description: `${foundCode.name} (${ndcCode}) is already in your selection.`,
          variant: "destructive"
        });
      } else {
        setSelectedNdcCodes([...selectedNdcCodes, ndcCode]);
        setNdcCode('');
        
        toast({
          title: "Product Added",
          description: `${foundCode.name} (${ndcCode}) has been added to your selection.`,
        });
      }
    } else {
      // Try to find in device codes
      const foundDevice = DEVICE_CODES.find(item => item.code === ndcCode);
      
      if (foundDevice) {
        if (selectedNdcCodes.includes(ndcCode)) {
          toast({
            title: "Already Selected",
            description: `${foundDevice.name} (${ndcCode}) is already in your selection.`,
            variant: "destructive"
          });
        } else {
          setSelectedNdcCodes([...selectedNdcCodes, ndcCode]);
          setNdcCode('');
          
          toast({
            title: "Device Added",
            description: `${foundDevice.name} (${ndcCode}) has been added to your selection.`,
          });
        }
      } else {
        toast({
          title: "Product Not Found",
          description: "The NDC or device code you entered could not be found.",
          variant: "destructive"
        });
      }
    }
  };

  const handleRemoveCode = (code: string) => {
    setSelectedNdcCodes(selectedNdcCodes.filter(c => c !== code));
    
    toast({
      title: "Product Removed",
      description: `Code ${code} has been removed from your selection.`,
    });
  };

  const getProductDetails = (code: string) => {
    // Check in both NDC codes and device codes
    const ndcProduct = SAMPLE_NDC_CODES.find(item => item.code === code);
    if (ndcProduct) return ndcProduct;
    
    const deviceProduct = DEVICE_CODES.find(item => item.code === code);
    if (deviceProduct) return deviceProduct;
    
    return { code, name: code, description: 'No details available' };
  };

  const handleFilterResults = (data: any) => {
    setFilteredData(data);
  };

  // If not authenticated, show login dialog
  if (!isAuthenticated) {
    return (
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              You need to authenticate to access the Enhanced CER Dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input id="username" defaultValue="demo_user" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input id="password" type="password" defaultValue="demo1234" className="col-span-3" />
            </div>
          </div>
          <Button onClick={handleLogin} className="w-full">
            <Lock className="mr-2 h-4 w-4" />
            Login
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Enhanced CER Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Interactive Clinical Evaluation Report Analysis and Monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleLogout}>
            <Unlock className="mr-2 h-4 w-4" />
            Logout
          </Button>
          <Button variant="outline" onClick={() => navigate('/cer-generator')}>
            <FileText className="mr-2 h-4 w-4" />
            Simple CER
          </Button>
        </div>
      </div>
      
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          This enhanced dashboard provides real-time analysis of FDA FAERS and MAUDE data. For regulatory submissions, 
          please use the PDF export feature to generate official documentation.
        </AlertDescription>
      </Alert>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Product Selection</CardTitle>
          <CardDescription>
            Enter NDC codes or device identifiers to analyze and compare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Enter NDC or device code (e.g., 0078-0357-15)"
                value={ndcCode}
                onChange={(e) => setNdcCode(e.target.value)}
              />
            </div>
            <Button onClick={handleSearchNdc}>
              <Search className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
          
          {selectedNdcCodes.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium mb-2">Selected Products:</h3>
              <div className="space-y-2">
                {selectedNdcCodes.map((code) => {
                  const product = getProductDetails(code);
                  return (
                    <div key={code} className="flex justify-between items-center p-3 bg-muted rounded-md">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">Code: {code}</div>
                        <div className="text-sm text-muted-foreground">{product.description}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCode(code)}
                      >
                        <span className="sr-only">Remove</span>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No products selected yet. Add NDC or device codes to begin analysis.</p>
              <div className="mt-4 text-sm">
                <p className="mb-2">Try these example codes:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SAMPLE_NDC_CODES.slice(0, 3).map(item => (
                    <Button
                      key={item.code}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setNdcCode(item.code);
                      }}
                    >
                      {item.code}
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedNdcCodes.length > 0 && (
        <>
          <NLPQuery onFilterResults={handleFilterResults} />
          <AdvancedDashboard filteredData={filteredData} />
        </>
      )}
    </div>
  );
};

export default EnhancedCERDashboardPage;