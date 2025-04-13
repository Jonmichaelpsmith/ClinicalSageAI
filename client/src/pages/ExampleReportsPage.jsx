import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Filter, Eye, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExampleReportsPage() {
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState("all");
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch('/api/reports/subscriptions');
        if (!response.ok) {
          throw new Error('Failed to fetch subscription data');
        }
        const data = await response.json();
        setSubscriptionTypes(data.available_subscriptions);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        toast({
          title: "Error",
          description: "Failed to load subscription data. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [toast]);

  const fetchSubscriptionDetails = async (path) => {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error('Failed to fetch subscription details');
      }
      const data = await response.json();
      setActiveSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription details. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredSubscriptions = selectedPersona === "all" 
    ? subscriptionTypes 
    : subscriptionTypes.filter(sub => sub.persona === selectedPersona);

  const personaMap = {
    "ceo": "Chief Executive Officer",
    "biostats": "Biostatistics",
    "ops": "Clinical Operations",
    "planner": "Study Planning",
    "writer": "Medical Writing",
    "regulatory": "Regulatory Affairs",
    "investor": "Investor Relations",
    "pi": "Principal Investigator",
    "intelligence": "Study Intelligence",
    "cxo": "Executive Team"
  };

  const handleDownload = (filename) => {
    const path = `/api/reports/download/${activeSubscription.persona}/${filename}`;
    
    // Create temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = path;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: `${filename} is being downloaded.`
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
          LumenTrialGuide.AI Intelligence Suites
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore example reports from our 10 subscription tiers, each tailored to specific roles in clinical trial development
        </p>
      </div>

      {/* Filter Section */}
      <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-500" />
          <span className="font-medium">Filter by role:</span>
          <Select
            value={selectedPersona}
            onValueChange={setSelectedPersona}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {subscriptionTypes.map((sub) => (
                <SelectItem key={sub.persona} value={sub.persona}>
                  {personaMap[sub.persona] || sub.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={() => setSelectedPersona("all")}>
          Reset Filters
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubscriptions.map((subscription) => (
            <Card key={subscription.persona} className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="mb-2">
                    {personaMap[subscription.persona] || subscription.persona}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{subscription.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => fetchSubscriptionDetails(subscription.path)}
                >
                  <Eye className="mr-2 h-4 w-4" /> View Reports
                </Button>
              </CardContent>
              <CardFooter className="pt-1">
                <Link href="/subscribe">
                  <Button variant="ghost" size="sm" className="w-full">
                    <span>Subscribe</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {activeSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {personaMap[activeSubscription.persona] || activeSubscription.persona}
                  </Badge>
                  <h2 className="text-2xl font-bold">{activeSubscription.title}</h2>
                  <p className="text-gray-600 mt-1">{activeSubscription.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveSubscription(null)}
                >
                  ✕
                </Button>
              </div>

              <Tabs defaultValue="included">
                <TabsList className="mb-6">
                  <TabsTrigger value="included">What's Included</TabsTrigger>
                  <TabsTrigger value="files">Available Files</TabsTrigger>
                </TabsList>
                
                <TabsContent value="included">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">This subscription includes:</h3>
                    <ul className="space-y-2">
                      {activeSubscription.includes.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                            <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="files">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Download example files:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeSubscription.files.map((file, idx) => {
                        const fileExt = file.split('.').pop().toLowerCase();
                        const getIconColor = (ext) => {
                          switch (ext) {
                            case 'pdf': return 'text-red-500';
                            case 'xlsx': return 'text-green-600';
                            case 'pptx': return 'text-orange-500';
                            case 'docx': return 'text-blue-500';
                            default: return 'text-gray-500';
                          }
                        };
                        
                        return (
                          <div
                            key={idx}
                            className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <FileText className={`h-8 w-8 mr-3 ${getIconColor(fileExt)}`} />
                            <div className="flex-1">
                              <p className="font-medium">{file}</p>
                              <p className="text-xs text-gray-500">
                                {fileExt.toUpperCase()} • Example File
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownload(file)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-8 pt-6 border-t flex justify-between">
                <Button variant="outline" onClick={() => setActiveSubscription(null)}>
                  Close
                </Button>
                <Link href="/subscribe">
                  <Button>
                    Subscribe to {activeSubscription.title}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}