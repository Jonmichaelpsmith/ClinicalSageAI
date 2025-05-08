import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  User, 
  FileText, 
  Download,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * QMP Audit Trail Panel Component
 * 
 * Displays historical changes to the Quality Management Plan for audit and traceability purposes.
 * Allows filtering by date, user, and modification type.
 */
export default function QmpAuditTrailPanel() {
  const { toast } = useToast();
  const [auditTrail, setAuditTrail] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [exportingPdf, setExportingPdf] = useState(false);
  
  useEffect(() => {
    fetchAuditTrail();
  }, []);
  
  // Fetch QMP audit trail data
  const fetchAuditTrail = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/qmp/audit-trail');
      setAuditTrail(response.data.auditRecords || []);
    } catch (error) {
      console.error('Error fetching QMP audit trail:', error);
      toast({
        title: 'Error fetching audit trail',
        description: 'Could not retrieve QMP change history. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Export audit trail to JSON
  const exportAuditTrail = async () => {
    setExportingPdf(true);
    try {
      const response = await axios.get('/api/qmp/export-audit-trail', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `QMP_Audit_Trail_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Audit trail exported',
        description: 'QMP audit trail has been exported to JSON successfully.',
      });
    } catch (error) {
      console.error('Error exporting audit trail:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export QMP audit trail. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExportingPdf(false);
    }
  };
  
  // Filter audit records based on active tab
  const getFilteredRecords = () => {
    if (activeTab === 'all') {
      return auditTrail;
    }
    
    return auditTrail.filter(record => record.changeType === activeTab);
  };
  
  // Get appropriate color and icon for change type
  const getChangeTypeProps = (changeType) => {
    switch (changeType) {
      case 'objective-added':
        return { 
          color: 'bg-green-50 text-green-700 border-green-200', 
          icon: <CheckCircle2 className="h-4 w-4 mr-1.5" />
        };
      case 'objective-updated':
        return { 
          color: 'bg-blue-50 text-blue-700 border-blue-200', 
          icon: <FileText className="h-4 w-4 mr-1.5" />
        };
      case 'ctq-added':
        return { 
          color: 'bg-purple-50 text-purple-700 border-purple-200', 
          icon: <CheckCircle2 className="h-4 w-4 mr-1.5" />
        };
      case 'ctq-updated':
        return { 
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200', 
          icon: <FileText className="h-4 w-4 mr-1.5" />
        };
      case 'ctq-completed':
        return { 
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
          icon: <CheckCircle2 className="h-4 w-4 mr-1.5" />
        };
      case 'status-changed':
        return { 
          color: 'bg-amber-50 text-amber-700 border-amber-200', 
          icon: <AlertCircle className="h-4 w-4 mr-1.5" />
        };
      default:
        return { 
          color: 'bg-gray-50 text-gray-700 border-gray-200', 
          icon: <FileText className="h-4 w-4 mr-1.5" />
        };
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">QMP Audit Trail</CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-1">
              Track changes and updates to your Quality Management Plan
            </CardDescription>
          </div>
          <Button 
            onClick={exportAuditTrail} 
            disabled={isLoading || exportingPdf}
            variant="outline"
            className="border-blue-200 text-blue-700 flex items-center"
          >
            {exportingPdf ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-1.5" />
                <span>Export JSON</span>
              </>
            )}
          </Button>
        </div>
        
        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-4"
        >
          <TabsList className="grid grid-cols-7 mb-4">
            <TabsTrigger value="all">All Changes</TabsTrigger>
            <TabsTrigger value="objective-added">Objectives Added</TabsTrigger>
            <TabsTrigger value="objective-updated">Objectives Updated</TabsTrigger>
            <TabsTrigger value="ctq-added">CtQ Factors Added</TabsTrigger>
            <TabsTrigger value="ctq-updated">CtQ Factors Updated</TabsTrigger>
            <TabsTrigger value="ctq-completed">CtQ Factors Completed</TabsTrigger>
            <TabsTrigger value="status-changed">Status Changes</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading audit trail data...</span>
          </div>
        ) : getFilteredRecords().length === 0 ? (
          <div className="text-center py-8 border rounded-md bg-gray-50">
            <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <h3 className="text-gray-700 font-medium mb-1">No audit records found</h3>
            <p className="text-gray-500 text-sm">
              {activeTab === 'all' 
                ? 'There are no recorded changes to the Quality Management Plan.' 
                : 'No changes of this type have been recorded yet.'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {getFilteredRecords().map((record, index) => {
                const { color, icon } = getChangeTypeProps(record.changeType);
                
                return (
                  <div 
                    key={record.id || index} 
                    className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className={cn("mb-2", color)}>
                          <div className="flex items-center">
                            {icon}
                            <span>
                              {record.changeType === 'objective-added' && 'Objective Added'}
                              {record.changeType === 'objective-updated' && 'Objective Updated'}
                              {record.changeType === 'ctq-added' && 'CtQ Factor Added'}
                              {record.changeType === 'ctq-updated' && 'CtQ Factor Updated'}
                              {record.changeType === 'ctq-completed' && 'CtQ Factor Completed'}
                              {record.changeType === 'status-changed' && 'Status Changed'}
                              {!['objective-added', 'objective-updated', 'ctq-added', 'ctq-updated', 'ctq-completed', 'status-changed'].includes(record.changeType) && 'QMP Change'}
                            </span>
                          </div>
                        </Badge>
                        
                        <h4 className="font-medium text-gray-900 mb-1">{record.title}</h4>
                        <p className="text-sm text-gray-600">{record.description}</p>
                        
                        {record.details && (
                          <div className="mt-3 text-xs bg-gray-50 p-2 rounded border text-gray-700">
                            <pre className="whitespace-pre-wrap font-sans">
                              {typeof record.details === 'object' 
                                ? JSON.stringify(record.details, null, 2) 
                                : record.details}
                            </pre>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right text-xs text-gray-500">
                        <div className="flex items-center justify-end mb-1">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          <span>{formatDate(record.timestamp)}</span>
                        </div>
                        
                        <div className="flex items-center justify-end">
                          <User className="h-3.5 w-3.5 mr-1" />
                          <span>{record.user || 'System User'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4 text-xs text-gray-500">
        <div className="flex items-center">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          <span>Records are retained for 10 years per 21 CFR Part 11 compliance</span>
        </div>
        
        <div>
          {auditTrail.length > 0 && (
            <span>{auditTrail.length} record{auditTrail.length !== 1 ? 's' : ''} found</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}