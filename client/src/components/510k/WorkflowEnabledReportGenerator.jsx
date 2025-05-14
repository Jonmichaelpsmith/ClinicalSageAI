import React, { useState, useEffect } from 'react';
import ReportGenerator from './ReportGenerator';
import UnifiedWorkflowPanel from '../unified-workflow/UnifiedWorkflowPanel';
import { register510kDocument } from '../unified-workflow/registerModuleDocument';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { ArrowRight, FileCheck, Loader2 } from 'lucide-react';

/**
 * WorkflowEnabledReportGenerator
 * 
 * Extended version of the ReportGenerator that integrates with the unified document workflow system.
 * This component allows 510(k) reports to be registered in the workflow system and sent through
 * review/approval processes.
 */
const WorkflowEnabledReportGenerator = ({
  deviceProfile = {},
  predicates = [],
  literatureReferences = [],
  insightData = [],
  complianceStatus = {},
  onGenerateReport,
  recentReports = []
}) => {
  const [registeredDocuments, setRegisteredDocuments] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const { toast } = useToast();

  // Generate a report and register it in the workflow system
  const handleGenerateAndRegister = async (reportOptions) => {
    try {
      setIsRegistering(true);
      
      // First, generate the report using the provided handler
      const reportResult = await onGenerateReport(reportOptions);
      
      // Then register the generated report with the workflow system
      const registrationResult = await register510kDocument({
        documentId: reportResult.id,
        title: reportResult.name || `510(k) Report - ${deviceProfile.deviceName || 'Unknown Device'}`,
        documentType: '510k_submission',
        metadata: {
          reportFormat: reportOptions.type,
          deviceType: deviceProfile.deviceType,
          deviceClass: deviceProfile.deviceClass,
          predicateDevices: predicates.map(p => p.id),
          sections: Object.keys(reportOptions.sections).filter(k => reportOptions.sections[k])
        },
        content: {
          generatedReport: reportResult,
          deviceProfile,
          predicates,
          literatureReferences: literatureReferences.slice(0, 10) // Limit to avoid overly large payloads
        }
      });
      
      // Add to registered documents list
      setRegisteredDocuments(prev => [
        {
          id: registrationResult.documentId,
          originalId: reportResult.id,
          name: reportResult.name,
          timestamp: new Date().toISOString(),
          type: reportOptions.type,
          workflowId: registrationResult.workflowId
        },
        ...prev
      ]);
      
      setIsRegistering(false);
      
      toast({
        title: 'Report Registered',
        description: 'The report has been generated and registered in the workflow system.',
        variant: 'success'
      });
      
      return reportResult;
    } catch (error) {
      console.error('Error generating and registering report:', error);
      setIsRegistering(false);
      
      toast({
        title: 'Error',
        description: `Failed to register report: ${error.message}`,
        variant: 'destructive'
      });
      
      // Still try to return whatever the report generator produced
      if (onGenerateReport) {
        return onGenerateReport(reportOptions);
      }
    }
  };
  
  // Open workflow dialog for a specific report
  const openWorkflowForReport = (report) => {
    setSelectedReport(report);
    setShowWorkflowDialog(true);
  };
  
  return (
    <div className="space-y-4">
      <ReportGenerator
        deviceProfile={deviceProfile}
        predicates={predicates}
        literatureReferences={literatureReferences}
        insightData={insightData}
        complianceStatus={complianceStatus}
        onGenerateReport={handleGenerateAndRegister}
        recentReports={[
          ...registeredDocuments,
          ...recentReports.filter(r => !registeredDocuments.some(rd => rd.originalId === r.id))
        ].slice(0, 5)}
      />
      
      {registeredDocuments.length > 0 && (
        <div className="mt-6 p-4 border rounded-lg bg-white shadow-sm">
          <h3 className="text-sm font-medium flex items-center mb-3">
            <FileCheck className="h-4 w-4 mr-2 text-green-600" />
            Reports in Workflow System
          </h3>
          
          <div className="space-y-2">
            {registeredDocuments.map((report) => (
              <div 
                key={report.id}
                className="flex items-center justify-between p-3 border rounded hover:bg-blue-50"
              >
                <div>
                  <span className="font-medium">{report.name}</span>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(report.timestamp).toLocaleString()}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="text-blue-600 border-blue-200"
                  onClick={() => openWorkflowForReport(report)}
                >
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Workflow
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Workflow Dialog */}
      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document Workflow - {selectedReport?.name}</DialogTitle>
            <DialogDescription>
              Manage the approval workflow for this 510(k) report
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="my-4">
              <UnifiedWorkflowPanel
                documentId={selectedReport.originalId}
                moduleType="med_device"
              />
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWorkflowDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowEnabledReportGenerator;