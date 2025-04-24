import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosWithToken from '../../utils/axiosWithToken';
import { useToast } from '@/hooks/use-toast';
import { Timeline, TimelineItem } from 'vertical-timeline-component-for-react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  History, 
  ClipboardList, 
  FileText, 
  Info, 
  Users,
  Loader2,
  AlertCircle,
  File,
  CheckCircle2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface AssetVersion {
  id: string;
  version: string;
  status: string;
  updated_at: string;
  updated_by: string;
  changes?: string;
}

interface AuditEntry {
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

interface AssetDetail {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: string;
  updated_at: string;
  created_at: string;
  created_by: string;
  associated_studies?: string[];
  attributes?: Record<string, any>;
}

interface AssetDetailProps { 
  assetType: string; 
  assetId: string; 
}

export default function AssetDetail({ assetType, assetId }: AssetDetailProps) {
  const { toast } = useToast();

  // Fetch asset details
  const { data: assetData, isLoading: isLoadingAsset, error: assetError } = useQuery({
    queryKey: ['assetDetail', assetType, assetId],
    queryFn: () => 
      axiosWithToken.get<AssetDetail>(`/api/metadata/${assetType}/${assetId}`)
        .then(res => res.data),
  });

  // Fetch version history
  const { data: versionsData, isLoading: isLoadingVersions } = useQuery({
    queryKey: ['assetVersions', assetType, assetId],
    queryFn: () => 
      axiosWithToken.get<AssetVersion[]>(`/api/metadata/${assetType}/${assetId}/versions`)
        .then(res => res.data),
  });

  // Fetch audit trail
  const { data: auditData, isLoading: isLoadingAudit } = useQuery({
    queryKey: ['assetAudit', assetType, assetId],
    queryFn: () => 
      axiosWithToken.get<AuditEntry[]>(`/api/metadata/${assetType}/${assetId}/audit`)
        .then(res => res.data),
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: () => 
      axiosWithToken.post(`/api/metadata/export-edc`, { form_id: assetId }),
    onSuccess: (res) => {
      toast({
        title: "Export Successful",
        description: "EDC package is ready for download",
      });
      
      // Open the download URL in a new tab
      if (res.data?.packageUrl) {
        window.open(res.data.packageUrl, '_blank');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "An error occurred during export",
        variant: "destructive"
      });
    }
  });

  const handleExport = () => {
    exportMutation.mutate();
  };

  if (isLoadingAsset) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (assetError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <h3 className="text-lg font-medium">Failed to load asset details</h3>
            <p className="text-sm text-gray-500 mt-1">
              {(assetError as any).message || "An error occurred while loading this asset"}
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assetData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <Info className="h-10 w-10 text-amber-500 mb-3" />
            <h3 className="text-lg font-medium">Asset Not Found</h3>
            <p className="text-sm text-gray-500 mt-1">
              The requested asset could not be found or may have been deleted
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{assetData.name}</CardTitle>
            <CardDescription className="mt-1">
              {assetData.description || `${assetType} asset for clinical trials`}
            </CardDescription>
          </div>
          <Badge variant={assetData.status.toLowerCase() === 'active' ? 'default' : 'outline'}>
            {assetData.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details" className="flex items-center gap-1">
              <Info className="h-4 w-4" /> Details
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-1">
              <History className="h-4 w-4" /> Versions
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-1">
              <ClipboardList className="h-4 w-4" /> Audit Trail
            </TabsTrigger>
            <TabsTrigger value="studies" className="flex items-center gap-1">
              <FileText className="h-4 w-4" /> Associated Studies
            </TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="rounded-md bg-gray-50 p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Asset Information</h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="text-gray-500">ID</dt>
                    <dd className="text-gray-900 font-mono text-xs">{assetData.id}</dd>
                    <dt className="text-gray-500">Version</dt>
                    <dd className="text-gray-900">v{assetData.version}</dd>
                    <dt className="text-gray-500">Status</dt>
                    <dd className="text-gray-900">{assetData.status}</dd>
                    <dt className="text-gray-500">Created</dt>
                    <dd className="text-gray-900">{new Date(assetData.created_at).toLocaleDateString()}</dd>
                    <dt className="text-gray-500">Last Updated</dt>
                    <dd className="text-gray-900">{new Date(assetData.updated_at).toLocaleDateString()}</dd>
                    <dt className="text-gray-500">Created By</dt>
                    <dd className="text-gray-900">{assetData.created_by}</dd>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Attributes</h3>
                  {assetData.attributes ? (
                    <Accordion type="single" collapsible>
                      {Object.entries(assetData.attributes).map(([key, value], index) => (
                        <AccordionItem key={index} value={key}>
                          <AccordionTrigger className="text-sm">
                            {key}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="bg-gray-50 p-3 rounded-md overflow-auto">
                              <pre className="text-xs">
                                {typeof value === 'object' 
                                  ? JSON.stringify(value, null, 2) 
                                  : String(value)}
                              </pre>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <p className="text-sm text-gray-500">No additional attributes available</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                {/* EDC Export Functionality */}
                <div className="rounded-md border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Export Options</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Export this {assetType === 'forms' ? 'form' : 'metadata asset'} for use in EDC systems
                  </p>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={handleExport}
                      disabled={exportMutation.isPending}
                      className="w-full flex items-center"
                    >
                      {exportMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Export EDC Blueprint
                        </>
                      )}
                    </Button>
                    
                    <Button variant="outline" className="w-full flex items-center">
                      <File className="h-4 w-4 mr-2" />
                      Download as JSON
                    </Button>
                  </div>
                  
                  {exportMutation.isSuccess && (
                    <div className="mt-3 p-2 bg-green-50 text-green-800 text-sm rounded-md flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mr-1.5 mt-0.5 flex-shrink-0" />
                      <span>Export successful. Your package is ready for download.</span>
                    </div>
                  )}
                  
                  {exportMutation.isError && (
                    <div className="mt-3 p-2 bg-red-50 text-red-800 text-sm rounded-md flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-600 mr-1.5 mt-0.5 flex-shrink-0" />
                      <span>{(exportMutation.error as any)?.message || "Export failed"}</span>
                    </div>
                  )}
                </div>
                
                {/* Compliance Information */}
                <div className="rounded-md border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Compliance Status</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CDISC Compliance</span>
                      <Badge variant="outline" className="bg-green-50 text-green-800 hover:bg-green-50">
                        Compliant
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">FDA 21 CFR Part 11</span>
                      <Badge variant="outline" className="bg-green-50 text-green-800 hover:bg-green-50">
                        Validated
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ICH Guidelines</span>
                      <Badge variant="outline" className="bg-green-50 text-green-800 hover:bg-green-50">
                        Compliant
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Versions Tab */}
          <TabsContent value="versions" className="mt-4">
            {isLoadingVersions ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin mr-2" />
                <span>Loading version history...</span>
              </div>
            ) : versionsData && versionsData.length > 0 ? (
              <Timeline lineColor="#e5e7eb">
                {versionsData.map((version, index) => (
                  <TimelineItem
                    key={version.id || index}
                    dateText={`v${version.version}`}
                    dateInnerStyle={{ background: '#f3f4f6', color: '#4b5563' }}
                    style={{ color: '#4b5563' }}
                  >
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <Badge 
                          variant={version.status.toLowerCase() === 'active' ? 'default' : 'outline'}
                        >
                          {version.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(version.updated_at).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-sm">
                        <span className="font-medium">Updated by:</span> {version.updated_by}
                      </p>
                      
                      {version.changes && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Changes:</p>
                          <p className="text-sm mt-1 text-gray-700">{version.changes}</p>
                        </div>
                      )}
                    </div>
                  </TimelineItem>
                ))}
              </Timeline>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No version history available</p>
              </div>
            )}
          </TabsContent>
          
          {/* Audit Trail Tab */}
          <TabsContent value="audit" className="mt-4">
            {isLoadingAudit ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin mr-2" />
                <span>Loading audit trail...</span>
              </div>
            ) : auditData && auditData.length > 0 ? (
              <div className="rounded-md border border-gray-200 divide-y">
                {auditData.map((entry, index) => (
                  <div key={index} className="p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <Users className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">
                            {entry.user} <span className="font-normal text-gray-500">{entry.action}</span>
                          </p>
                          {entry.details && (
                            <p className="text-xs text-gray-500 mt-1">{entry.details}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No audit trail available</p>
              </div>
            )}
          </TabsContent>
          
          {/* Associated Studies Tab */}
          <TabsContent value="studies" className="mt-4">
            {assetData.associated_studies && assetData.associated_studies.length > 0 ? (
              <div className="rounded-md border border-gray-200 divide-y">
                {assetData.associated_studies.map((study, index) => (
                  <div key={index} className="p-3 hover:bg-gray-50">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm">{study}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">
                  No studies are currently associated with this {assetType === 'forms' ? 'form' : 'metadata asset'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t pt-6">
        <div className="flex justify-between w-full">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to List
          </Button>
          
          <div className="space-x-2">
            <Button variant="outline">Edit</Button>
            <Button variant="default">Approve</Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}