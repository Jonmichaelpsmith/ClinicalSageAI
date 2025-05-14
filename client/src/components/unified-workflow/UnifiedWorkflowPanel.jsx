import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  RefreshCw,
  Users
} from "lucide-react";
import { 
  getDocumentWorkflow, 
  initiateDocumentWorkflow,
  submitWorkflowApproval 
} from './registerModuleDocument';
import { getTemplatesForModule } from './WorkflowTemplateService';

const WorkflowBadge = ({ status }) => {
  const badgeProps = {
    pending: { variant: "outline", children: "Pending", icon: <Clock className="h-3 w-3 mr-1" /> },
    in_progress: { variant: "secondary", children: "In Progress", icon: <RefreshCw className="h-3 w-3 mr-1" /> },
    approved: { variant: "success", children: "Approved", icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
    rejected: { variant: "destructive", children: "Rejected", icon: <XCircle className="h-3 w-3 mr-1" /> },
    review_needed: { variant: "warning", children: "Review Needed", icon: <AlertCircle className="h-3 w-3 mr-1" /> }
  };

  const { variant, children, icon } = badgeProps[status] || badgeProps.pending;

  return (
    <Badge variant={variant} className="flex items-center">
      {icon}
      {children}
    </Badge>
  );
};

/**
 * Unified Workflow Panel Component
 * 
 * This component displays the workflow status for a document and allows
 * users to initiate workflows and submit approvals.
 * 
 * @param {Object} props Component props
 * @param {string} props.moduleType Type of module (med_device, cmc_wizard, etc.)
 * @param {string} props.documentId Original document ID in the source module
 * @param {string} props.documentType Type of document (510k, CER, etc.)
 * @param {Function} props.onWorkflowUpdate Optional callback when workflow status changes
 */
export default function UnifiedWorkflowPanel({ 
  moduleType, 
  documentId, 
  documentType,
  onWorkflowUpdate = () => {}
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [document, setDocument] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [initiating, setInitiating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Fetch workflow status and templates
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get workflow status
        const { document, workflow } = await getDocumentWorkflow(moduleType, documentId);
        setDocument(document);
        setWorkflow(workflow);

        // Get templates
        const templates = await getTemplatesForModule(moduleType);
        setTemplates(templates);
        
        if (templates.length > 0) {
          setSelectedTemplate(templates[0].id);
        }
      } catch (err) {
        console.error('Error fetching workflow data:', err);
        setError('Failed to load workflow data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [moduleType, documentId]);

  // Handle template selection
  const handleTemplateChange = (e) => {
    setSelectedTemplate(Number(e.target.value));
  };

  // Initiate workflow
  const handleInitiateWorkflow = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Template Required",
        description: "Please select a workflow template to continue.",
        variant: "destructive"
      });
      return;
    }

    try {
      setInitiating(true);
      setError(null);

      const newWorkflow = await initiateDocumentWorkflow(
        moduleType,
        documentId,
        selectedTemplate
      );

      setWorkflow(newWorkflow);
      onWorkflowUpdate(newWorkflow);

      toast({
        title: "Workflow Initiated",
        description: "The approval workflow has been successfully initiated."
      });
    } catch (err) {
      console.error('Error initiating workflow:', err);
      setError('Failed to initiate workflow. Please try again later.');
      toast({
        title: "Workflow Error",
        description: err.message || "Failed to initiate workflow",
        variant: "destructive"
      });
    } finally {
      setInitiating(false);
    }
  };

  // Handle approval submission
  const handleApproval = async (stepIndex, status, comments = "") => {
    try {
      setApproving(true);
      setError(null);

      const updatedWorkflow = await submitWorkflowApproval(
        workflow.id,
        stepIndex,
        status,
        comments
      );

      setWorkflow(updatedWorkflow);
      onWorkflowUpdate(updatedWorkflow);

      toast({
        title: status === "approved" ? "Step Approved" : "Step Rejected",
        description: `The workflow step has been ${status === "approved" ? "approved" : "rejected"}.`
      });
    } catch (err) {
      console.error('Error submitting approval:', err);
      setError('Failed to submit approval. Please try again later.');
      toast({
        title: "Approval Error",
        description: err.message || "Failed to submit approval",
        variant: "destructive"
      });
    } finally {
      setApproving(false);
    }
  };

  // Refresh workflow status
  const refreshWorkflow = async () => {
    try {
      setLoading(true);
      setError(null);

      const { document, workflow } = await getDocumentWorkflow(moduleType, documentId);
      setDocument(document);
      setWorkflow(workflow);

      toast({
        title: "Workflow Refreshed",
        description: "The workflow status has been updated."
      });
    } catch (err) {
      console.error('Error refreshing workflow:', err);
      setError('Failed to refresh workflow data. Please try again later.');
      toast({
        title: "Refresh Error",
        description: err.message || "Failed to refresh workflow",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="h-5 w-5 mr-2" />
            Document Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="h-5 w-5 mr-2" />
            Document Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={refreshWorkflow}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If no workflow exists yet, show the initiation form
  if (!workflow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="h-5 w-5 mr-2" />
            Initiate Document Workflow
          </CardTitle>
          <CardDescription>
            Start an approval workflow for this {documentType} document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="template" className="block text-sm font-medium mb-1">
                Workflow Template
              </label>
              <select
                id="template"
                className="w-full p-2 border rounded-md"
                value={selectedTemplate || ""}
                onChange={handleTemplateChange}
                disabled={templates.length === 0}
              >
                {templates.length === 0 ? (
                  <option value="">No templates available</option>
                ) : (
                  templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))
                )}
              </select>
              {selectedTemplate && (
                <p className="text-sm text-muted-foreground mt-1">
                  {templates.find(t => t.id === selectedTemplate)?.description || ""}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleInitiateWorkflow}
            disabled={!selectedTemplate || initiating}
          >
            {initiating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Initiating...
              </>
            ) : (
              <>
                <ClipboardList className="h-4 w-4 mr-2" />
                Initiate Workflow
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Workflow exists, show status and details
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <ClipboardList className="h-5 w-5 mr-2" />
            Document Workflow
          </CardTitle>
          <WorkflowBadge status={workflow.status} />
        </div>
        <CardDescription>
          {workflow.templateName || "Approval Workflow"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium">Status</h4>
                <p className="text-sm">{workflow.status.replace('_', ' ').charAt(0).toUpperCase() + workflow.status.replace('_', ' ').slice(1)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Started</h4>
                <p className="text-sm">{new Date(workflow.createdAt).toLocaleString()}</p>
              </div>
              {workflow.completedAt && (
                <div>
                  <h4 className="text-sm font-medium">Completed</h4>
                  <p className="text-sm">{new Date(workflow.completedAt).toLocaleString()}</p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium">Document Type</h4>
                <p className="text-sm">{document.documentType}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Template</h4>
                <p className="text-sm">{workflow.templateName}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="approvals">
            {workflow.approvals?.length > 0 ? (
              <div className="space-y-3">
                {workflow.approvals.map((approval, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{approval.stepName || `Step ${index + 1}`}</h4>
                        <p className="text-sm text-muted-foreground">{approval.description || ""}</p>
                      </div>
                      <WorkflowBadge status={approval.status || "pending"} />
                    </div>
                    {approval.assignedTo && (
                      <div className="flex items-center text-sm mb-2">
                        <Users className="h-3 w-3 mr-1" />
                        Assigned to: {approval.assignedTo}
                      </div>
                    )}
                    {approval.approvedBy && (
                      <div className="text-sm">
                        {approval.status === "approved" ? "Approved" : "Rejected"} by {approval.approvedBy} 
                        {approval.approvedAt && ` on ${new Date(approval.approvedAt).toLocaleString()}`}
                      </div>
                    )}
                    {approval.comments && (
                      <div className="text-sm mt-2">
                        <span className="font-medium">Comments:</span> {approval.comments}
                      </div>
                    )}
                    {approval.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleApproval(index, "approved")}
                          disabled={approving}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleApproval(index, "rejected")}
                          disabled={approving}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No approval steps defined for this workflow.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="audit">
            {workflow.auditLog?.length > 0 ? (
              <div className="space-y-2">
                {workflow.auditLog.map((entry, index) => (
                  <div key={index} className="text-sm border-b pb-2 last:border-0">
                    <p className="font-medium">{entry.action}</p>
                    <div className="flex justify-between text-muted-foreground">
                      <span>{entry.userName}</span>
                      <span>{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                    {entry.details && <p className="mt-1">{entry.details}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No audit log entries available.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshWorkflow}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  );
}