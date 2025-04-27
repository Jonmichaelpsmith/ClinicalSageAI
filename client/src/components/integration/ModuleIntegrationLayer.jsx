import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { ArrowRightCircle, File, FileText, Settings, BarChart, RefreshCw, Share2, AlertTriangle } from 'lucide-react';

/**
 * ModuleIntegrationLayer
 * 
 * This component provides a sophisticated integration layer between different TrialSage modules.
 * It shows relevant data from other modules and provides cross-navigation and data sharing options.
 * 
 * @param {Object} props
 * @param {string} props.sourceModule - The name of the source module (e.g., 'ind-wizard', 'cmc')
 * @param {string} props.targetModule - The name of the target module (e.g., 'cmc', 'protocol')
 * @param {Object} props.data - The data to share between modules
 * @param {string} props.context - The context of the integration (e.g., 'ind-submission')
 */
export default function ModuleIntegrationLayer({ 
  sourceModule,
  targetModule,
  data = {},
  context = null
}) {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState('overview');
  const [integrationData, setIntegrationData] = useState({
    recentDocuments: [],
    metadata: {},
    linkStatus: 'linked',
    statusMessages: []
  });

  // Construct navigation paths based on source and target modules
  const getTargetPath = () => {
    if (targetModule === 'cmc') {
      return `/cmc/blueprints/${data.id || 'new'}${context ? `?context=${context}` : ''}`;
    } else if (targetModule === 'protocol') {
      return `/study-architect/protocol/${data.id || 'new'}${context ? `?context=${context}` : ''}`;
    } else if (targetModule === 'ind') {
      return `/ind-wizard${context ? `/${context}` : ''}`;
    }
    return `/${targetModule}`;
  };

  // Get module display names
  const getModuleDisplayName = (moduleId) => {
    const moduleNames = {
      'cmc': 'CMC Intelligence™',
      'ind-wizard': 'IND Wizard™',
      'protocol': 'Study Architect™',
      'vault': 'TrialSage Vault™',
      'ich-wiz': 'ICH Wiz™',
      'csr-intelligence': 'CSR Intelligence™'
    };
    
    return moduleNames[moduleId] || moduleId;
  };

  // Format dates for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Simulate loading integration data
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate network request
    setTimeout(() => {
      let mockData = {
        recentDocuments: [
          {
            id: 'doc-123',
            title: 'CMC Strategy Overview',
            module: 'cmc',
            updatedAt: '2024-09-15T14:30:00Z',
            type: 'document'
          },
          {
            id: 'doc-456',
            title: 'Drug Product Specification',
            module: 'cmc',
            updatedAt: '2024-09-10T09:15:00Z',
            type: 'specification'
          },
          {
            id: 'doc-789',
            title: 'IND Initial Submission Outline',
            module: 'ind-wizard',
            updatedAt: '2024-09-08T16:45:00Z',
            type: 'submission'
          }
        ],
        metadata: {
          project: 'IND-123',
          drugProduct: 'RA-502',
          stage: 'Phase I',
          lastSync: '2024-09-15T20:15:00Z'
        },
        linkStatus: 'linked',
        statusMessages: [
          {
            type: 'info',
            message: 'Data is synchronized across modules'
          }
        ]
      };
      
      setIntegrationData(mockData);
      setIsLoading(false);
    }, 800);
  }, [sourceModule, targetModule]);

  // Handle refresh click
  const handleRefresh = () => {
    setIsLoading(true);
    toast({
      title: "Refreshing integration data",
      description: "Synchronizing data between modules...",
    });
    
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Data synchronized",
        description: "All modules are now updated with the latest information.",
      });
    }, 1500);
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center">
              {getModuleDisplayName(targetModule)}
              <Badge variant="outline" className="ml-2">
                {integrationData.linkStatus === 'linked' ? 'Linked' : 'Unlinked'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Integration between {getModuleDisplayName(sourceModule)} and {getModuleDisplayName(targetModule)}
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh integration data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={tabValue} onValueChange={setTabValue} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Project:</span>
                <span className="font-medium">{integrationData.metadata.project}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Drug Product:</span>
                <span className="font-medium">{integrationData.metadata.drugProduct}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Development Stage:</span>
                <span className="font-medium">{integrationData.metadata.stage}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Synchronized:</span>
                <span className="font-medium">
                  {integrationData.metadata.lastSync 
                    ? formatDate(integrationData.metadata.lastSync) 
                    : 'Never'}
                </span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="documents" className="pt-4">
            <div className="space-y-2">
              {integrationData.recentDocuments.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex items-center">
                    <div className="mr-3 text-muted-foreground">
                      {doc.type === 'document' && <FileText className="h-4 w-4" />}
                      {doc.type === 'specification' && <File className="h-4 w-4" />}
                      {doc.type === 'submission' && <FileText className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(doc.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Share2 className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share to {getModuleDisplayName(targetModule)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
              
              {integrationData.recentDocuments.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No shared documents found</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="status" className="pt-4">
            <div className="space-y-3">
              {integrationData.statusMessages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex items-start p-2 rounded-md text-sm ${
                    msg.type === 'error' ? 'bg-destructive/10 text-destructive' : 
                    msg.type === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-muted'
                  }`}
                >
                  <div className="mr-2 mt-0.5">
                    {msg.type === 'error' && <AlertTriangle className="h-4 w-4" />}
                    {msg.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                    {msg.type === 'info' && <BarChart className="h-4 w-4" />}
                  </div>
                  <p>{msg.message}</p>
                </div>
              ))}
              
              {integrationData.statusMessages.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No status messages</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" size="sm" asChild>
          <a href={getTargetPath()} className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Configure Integration
          </a>
        </Button>
        <Button size="sm" asChild>
          <a href={getTargetPath()} className="flex items-center">
            <ArrowRightCircle className="h-4 w-4 mr-2" />
            Go to {getModuleDisplayName(targetModule)}
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}