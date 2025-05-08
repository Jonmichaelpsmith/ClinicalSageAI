/**
 * Regulatory Traceability Matrix Component
 * 
 * This component provides comprehensive traceability between Critical-to-Quality (CtQ) factors
 * and CER sections, allowing users to track, monitor and control these factors throughout the
 * clinical evaluation process - a key requirement for both ICH E6(R3) and EU MDR audits.
 * 
 * The traceability matrix clearly maps:
 * 1. CtQ factors to specific CER sections
 * 2. Current monitoring status and metrics
 * 3. Compliance status with both ICH E6(R3) and EU MDR requirements
 * 4. Control measures implemented
 * 5. Evidence of verification activities
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertCircle, AlertTriangle, ChevronRight, Info, Link, FileCheck, ShieldCheck, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CerTooltipWrapper from './CerTooltipWrapper';
import { cerApiService } from '@/services/CerAPIService';

const RegulatoryTraceabilityMatrix = ({ 
  deviceName, 
  cerSections = [], 
  qmpData = { objectives: [], ctqFactors: [] },
  onUpdateCtq,
  onGenerateReport 
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState('ich_e6r3'); // Default to ICH E6(R3)
  const [selectedView, setSelectedView] = useState('matrix'); // 'matrix', 'metrics', 'controls'
  const [trackedCtqFactors, setTrackedCtqFactors] = useState([]);
  const [activeDialog, setActiveDialog] = useState(null);
  const [editingFactor, setEditingFactor] = useState(null);
  const [evidenceItems, setEvidenceItems] = useState({});
  const [controlMeasures, setControlMeasures] = useState({});
  
  // Monitor status values
  const monitoringStatus = {
    COMPLIANT: 'compliant',
    AT_RISK: 'at-risk',
    NON_COMPLIANT: 'non-compliant',
    PENDING: 'pending'
  };
  
  // Extract CtQ factors from QMP data on load
  useEffect(() => {
    if (qmpData && qmpData.ctqFactors && qmpData.ctqFactors.length > 0) {
      const enhancedFactors = qmpData.ctqFactors.map(factor => ({
        ...factor,
        status: factor.status || monitoringStatus.PENDING,
        monitoringMetrics: factor.monitoringMetrics || [],
        verificationActivities: factor.verificationActivities || [],
        complianceStatus: {
          ich: factor.complianceStatus?.ich || monitoringStatus.PENDING,
          mdr: factor.complianceStatus?.mdr || monitoringStatus.PENDING
        }
      }));
      
      setTrackedCtqFactors(enhancedFactors);
      
      // Initialize evidence items and control measures
      const evidenceObj = {};
      const controlsObj = {};
      
      enhancedFactors.forEach(factor => {
        evidenceObj[factor.id] = factor.verificationActivities || [];
        controlsObj[factor.id] = factor.controls || [];
      });
      
      setEvidenceItems(evidenceObj);
      setControlMeasures(controlsObj);
    }
  }, [qmpData]);
  
  // Save updates to a CtQ factor
  const saveCtqUpdate = async (factorId, updates) => {
    setIsLoading(true);
    
    try {
      // Find the factor to update
      const updatedFactors = trackedCtqFactors.map(factor => 
        factor.id === factorId ? { ...factor, ...updates } : factor
      );
      
      setTrackedCtqFactors(updatedFactors);
      
      // Call the parent component to update QMP data
      if (onUpdateCtq) {
        onUpdateCtq(updatedFactors);
      }
      
      toast({
        title: "Traceability Updated",
        description: "CtQ factor monitoring information has been updated.",
        variant: "success"
      });
    } catch (error) {
      console.error('Error updating CtQ factor:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update CtQ factor information.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setActiveDialog(null);
    }
  };
  
  // Generate a traceability report document
  const generateTraceabilityReport = async () => {
    setIsLoading(true);
    
    try {
      const response = await cerApiService.generateQmpTraceabilityReport({
        deviceName,
        qmpData: {
          ...qmpData,
          ctqFactors: trackedCtqFactors
        },
        sections: cerSections
      });
      
      if (response && response.success) {
        if (onGenerateReport) {
          onGenerateReport(response.reportSection);
        }
        
        toast({
          title: "Traceability Report Generated",
          description: "Regulatory traceability report has been generated for your CER.",
          variant: "success"
        });
      } else {
        throw new Error(response.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating traceability report:', error);
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate the regulatory traceability report.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add evidence item to a CtQ factor
  const addEvidenceItem = (factorId, evidenceItem) => {
    const currentItems = evidenceItems[factorId] || [];
    const newItems = [...currentItems, {
      id: `evidence-${factorId}-${Date.now()}`,
      description: evidenceItem.description,
      date: evidenceItem.date || new Date().toISOString(),
      type: evidenceItem.type
    }];
    
    // Update local state
    setEvidenceItems({
      ...evidenceItems,
      [factorId]: newItems
    });
    
    // Update the factor with verification activities
    saveCtqUpdate(factorId, {
      verificationActivities: newItems
    });
  };
  
  // Add control measure to a CtQ factor
  const addControlMeasure = (factorId, measure) => {
    const currentMeasures = controlMeasures[factorId] || [];
    const newMeasures = [...currentMeasures, {
      id: `control-${factorId}-${Date.now()}`,
      description: measure.description,
      type: measure.type,
      implementationDate: measure.implementationDate || new Date().toISOString(),
      effectiveness: measure.effectiveness || 'pending'
    }];
    
    // Update local state
    setControlMeasures({
      ...controlMeasures,
      [factorId]: newMeasures
    });
    
    // Update the factor with control measures
    saveCtqUpdate(factorId, {
      controls: newMeasures
    });
  };
  
  // Render status badge with appropriate color
  const renderStatusBadge = (status) => {
    let color;
    let icon;
    let label;
    
    switch (status) {
      case monitoringStatus.COMPLIANT:
        color = 'bg-green-100 text-green-800 border-green-200';
        icon = <CheckCircle className="h-3 w-3 mr-1" />;
        label = 'Compliant';
        break;
      case monitoringStatus.AT_RISK:
        color = 'bg-amber-100 text-amber-800 border-amber-200';
        icon = <AlertTriangle className="h-3 w-3 mr-1" />;
        label = 'At Risk';
        break;
      case monitoringStatus.NON_COMPLIANT:
        color = 'bg-red-100 text-red-800 border-red-200';
        icon = <AlertCircle className="h-3 w-3 mr-1" />;
        label = 'Non-Compliant';
        break;
      default:
        color = 'bg-gray-100 text-gray-800 border-gray-200';
        icon = <Info className="h-3 w-3 mr-1" />;
        label = 'Pending';
    }
    
    return (
      <Badge className={`${color} rounded-md py-0.5 px-2 text-xs font-medium capitalize flex items-center`}>
        {icon} {label}
      </Badge>
    );
  };
  
  // Get linked sections for a CtQ factor
  const getLinkedSections = (factor) => {
    if (!factor.associatedSection) return [];
    
    return cerSections.filter(section => {
      const sectionTitle = (section.title || '').toLowerCase();
      const associatedSection = factor.associatedSection.toLowerCase();
      return sectionTitle.includes(associatedSection) || associatedSection.includes(sectionTitle);
    });
  };
  
  // Calculate completion percentage for a factor
  const calculateCompletion = (factor) => {
    let total = 0;
    let completed = 0;
    
    // Check for evidence
    if (factor.verificationActivities && factor.verificationActivities.length > 0) {
      completed++;
    }
    total++;
    
    // Check for controls
    if (factor.controls && factor.controls.length > 0) {
      completed++;
    }
    total++;
    
    // Check for status
    if (factor.status && factor.status !== monitoringStatus.PENDING) {
      completed++;
    }
    total++;
    
    // Check for linked sections
    if (getLinkedSections(factor).length > 0) {
      completed++;
    }
    total++;
    
    return Math.round((completed / total) * 100);
  };
  
  // Get objective title for a CtQ factor
  const getObjectiveForFactor = (factor) => {
    if (!factor.objectiveId || !qmpData.objectives) return 'Unknown objective';
    
    const objective = qmpData.objectives.find(obj => obj.id === factor.objectiveId);
    return objective ? objective.title : 'Unknown objective';
  };
  
  // Dialog for editing CtQ factor status
  const StatusDialog = () => {
    const [status, setStatus] = useState(editingFactor?.status || monitoringStatus.PENDING);
    const [ichStatus, setIchStatus] = useState(editingFactor?.complianceStatus?.ich || monitoringStatus.PENDING);
    const [mdrStatus, setMdrStatus] = useState(editingFactor?.complianceStatus?.mdr || monitoringStatus.PENDING);
    const [notes, setNotes] = useState(editingFactor?.statusNotes || '');
    
    const handleSave = () => {
      if (!editingFactor) return;
      
      saveCtqUpdate(editingFactor.id, {
        status,
        statusNotes: notes,
        complianceStatus: {
          ich: ichStatus,
          mdr: mdrStatus
        }
      });
    };
    
    return (
      <Dialog open={activeDialog === 'status'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Monitoring Status</DialogTitle>
            <DialogDescription>
              Update the monitoring status and compliance assessment for this Critical-to-Quality factor.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Overall Monitoring Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={monitoringStatus.COMPLIANT}>Compliant</SelectItem>
                  <SelectItem value={monitoringStatus.AT_RISK}>At Risk</SelectItem>
                  <SelectItem value={monitoringStatus.NON_COMPLIANT}>Non-Compliant</SelectItem>
                  <SelectItem value={monitoringStatus.PENDING}>Pending Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-y-4 p-3 bg-gray-50 rounded-md">
              <div>
                <Label className="flex items-center gap-1">
                  <Target className="h-4 w-4 text-[#0F6CBD]" />
                  <span>ICH E6(R3) Compliance</span>
                </Label>
                <Select value={ichStatus} onValueChange={setIchStatus} className="mt-1">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={monitoringStatus.COMPLIANT}>Compliant</SelectItem>
                    <SelectItem value={monitoringStatus.AT_RISK}>At Risk</SelectItem>
                    <SelectItem value={monitoringStatus.NON_COMPLIANT}>Non-Compliant</SelectItem>
                    <SelectItem value={monitoringStatus.PENDING}>Pending Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-[#E3008C]" />
                  <span>EU MDR Compliance</span>
                </Label>
                <Select value={mdrStatus} onValueChange={setMdrStatus} className="mt-1">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={monitoringStatus.COMPLIANT}>Compliant</SelectItem>
                    <SelectItem value={monitoringStatus.AT_RISK}>At Risk</SelectItem>
                    <SelectItem value={monitoringStatus.NON_COMPLIANT}>Non-Compliant</SelectItem>
                    <SelectItem value={monitoringStatus.PENDING}>Pending Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status Notes</Label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter status notes and assessment findings..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Dialog for adding evidence
  const EvidenceDialog = () => {
    const [description, setDescription] = useState('');
    const [evidenceType, setEvidenceType] = useState('document');
    const [evidenceDate, setEvidenceDate] = useState(new Date().toISOString().split('T')[0]);
    
    const handleSave = () => {
      if (!editingFactor || !description) return;
      
      addEvidenceItem(editingFactor.id, {
        description,
        type: evidenceType,
        date: evidenceDate
      });
      
      // Reset form
      setDescription('');
      setEvidenceType('document');
      setActiveDialog(null);
    };
    
    return (
      <Dialog open={activeDialog === 'evidence'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Verification Evidence</DialogTitle>
            <DialogDescription>
              Add evidence of verification activities to demonstrate CtQ factor monitoring.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Evidence Description</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the verification activity or evidence..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Evidence Type</Label>
              <Select value={evidenceType} onValueChange={setEvidenceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document Review</SelectItem>
                  <SelectItem value="testing">Testing Result</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="audit">Audit Finding</SelectItem>
                  <SelectItem value="analysis">Data Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={evidenceDate}
                onChange={(e) => setEvidenceDate(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading || !description}>
              {isLoading ? 'Saving...' : 'Add Evidence'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Dialog for adding control measure
  const ControlDialog = () => {
    const [description, setDescription] = useState('');
    const [controlType, setControlType] = useState('procedural');
    const [implementationDate, setImplementationDate] = useState(new Date().toISOString().split('T')[0]);
    const [effectiveness, setEffectiveness] = useState('effective');
    
    const handleSave = () => {
      if (!editingFactor || !description) return;
      
      addControlMeasure(editingFactor.id, {
        description,
        type: controlType,
        implementationDate,
        effectiveness
      });
      
      // Reset form
      setDescription('');
      setControlType('procedural');
      setActiveDialog(null);
    };
    
    return (
      <Dialog open={activeDialog === 'control'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Control Measure</DialogTitle>
            <DialogDescription>
              Define control measures implemented to ensure this Critical-to-Quality factor is properly managed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Control Measure Description</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the control measure..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Control Type</Label>
              <Select value={controlType} onValueChange={setControlType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="procedural">Procedural Control</SelectItem>
                  <SelectItem value="system">System Control</SelectItem>
                  <SelectItem value="validation">Validation Control</SelectItem>
                  <SelectItem value="monitoring">Monitoring Control</SelectItem>
                  <SelectItem value="review">Review Process</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Implementation Date</Label>
              <Input
                type="date"
                value={implementationDate}
                onChange={(e) => setImplementationDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Effectiveness Assessment</Label>
              <Select value={effectiveness} onValueChange={setEffectiveness}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assessment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="effective">Effective</SelectItem>
                  <SelectItem value="partially">Partially Effective</SelectItem>
                  <SelectItem value="ineffective">Ineffective</SelectItem>
                  <SelectItem value="pending">Pending Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading || !description}>
              {isLoading ? 'Saving...' : 'Add Control'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <div className="space-y-6 px-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#323130] flex items-center">
            <CerTooltipWrapper
              tooltipContent="This regulatory traceability matrix provides clear evidence that you've identified critical quality factors and implemented monitoring and control measures—a key requirement for both ICH E6(R3) and MDR audits."
              whyThisMatters="Regulatory agencies increasingly require demonstrable traceability between quality requirements and implemented controls with verification evidence. This helps you prove you've operationalized risk-based quality management."
            >
              Regulatory Traceability Matrix
            </CerTooltipWrapper>
          </h2>
          <div className="mt-2 mb-4 flex flex-wrap gap-2">
            <div className="bg-[#EFF6FC] rounded-md px-3 py-1 text-sm inline-flex items-center gap-1 text-[#0F6CBD]">
              <span>ICH E6(R3) Compliant</span>
            </div>
            <div className="bg-[#FCF2FA] rounded-md px-3 py-1 text-sm inline-flex items-center gap-1 text-[#E3008C]">
              <span>EU MDR Requirement</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedFramework} onValueChange={setSelectedFramework}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ich_e6r3">ICH E6(R3)</SelectItem>
              <SelectItem value="eu_mdr">EU MDR</SelectItem>
              <SelectItem value="both">Both Frameworks</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={generateTraceabilityReport} disabled={isLoading || trackedCtqFactors.length === 0}>
            Generate Traceability Report
          </Button>
        </div>
      </div>
      
      <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matrix">Traceability Matrix</TabsTrigger>
          <TabsTrigger value="metrics">Monitoring Metrics</TabsTrigger>
          <TabsTrigger value="controls">Control Measures</TabsTrigger>
        </TabsList>
        
        <TabsContent value="matrix" className="space-y-4 pt-4">
          {trackedCtqFactors.length === 0 ? (
            <Alert>
              <AlertTitle>No Critical-to-Quality factors defined</AlertTitle>
              <AlertDescription>
                Define Critical-to-Quality (CtQ) factors in the Quality Management Plan to enable traceability. 
                CtQ factors should identify what matters most for regulatory compliance and data quality.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableCaption>Critical-to-Quality Factors Traceability Matrix</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">CtQ Factor</TableHead>
                  <TableHead>Objective</TableHead>
                  <TableHead>CER Section</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Compliance</TableHead>
                  <TableHead className="text-right">Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackedCtqFactors.map(factor => (
                  <TableRow key={factor.id} className="group hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{factor.name}</span>
                        <span className="text-xs text-gray-500 flex items-center">
                          {factor.riskLevel === 'high' && (
                            <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
                          )}
                          {factor.description.substring(0, 60)}{factor.description.length > 60 ? '...' : ''}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{getObjectiveForFactor(factor)}</span>
                    </TableCell>
                    <TableCell>
                      {getLinkedSections(factor).length > 0 ? (
                        <div className="space-y-1">
                          {getLinkedSections(factor).map((section, i) => (
                            <div key={i} className="text-xs flex items-center">
                              <ChevronRight className="h-3 w-3 mr-1 text-[#0F6CBD]" />
                              {section.title || 'Untitled Section'}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">No linked sections</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        {renderStatusBadge(factor.status)}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setEditingFactor(factor);
                            setActiveDialog('status');
                          }}
                          className="hidden group-hover:flex h-6 text-xs"
                        >
                          Update
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs text-[#0F6CBD] font-medium">ICH:</span>
                          {renderStatusBadge(factor.complianceStatus?.ich || 'pending')}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs text-[#E3008C] font-medium">MDR:</span>
                          {renderStatusBadge(factor.complianceStatus?.mdr || 'pending')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-2">
                        <Progress value={calculateCompletion(factor)} className="h-2 w-[100px]" />
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingFactor(factor);
                              setActiveDialog('evidence');
                            }}
                            className="h-7 text-xs"
                          >
                            Add Evidence
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingFactor(factor);
                              setActiveDialog('control');
                            }}
                            className="h-7 text-xs"
                          >
                            Add Control
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
        
        <TabsContent value="metrics" className="space-y-4 pt-4">
          {trackedCtqFactors.length === 0 ? (
            <Alert>
              <AlertTitle>No Critical-to-Quality factors defined</AlertTitle>
              <AlertDescription>
                Define Critical-to-Quality (CtQ) factors in the Quality Management Plan to establish monitoring metrics.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trackedCtqFactors.map(factor => {
                const evidence = evidenceItems[factor.id] || [];
                return (
                  <Card key={factor.id} className="group">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-md">{factor.name}</CardTitle>
                        {renderStatusBadge(factor.status)}
                      </div>
                      <CardDescription>{factor.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-0">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <FileCheck className="h-4 w-4 mr-1 text-[#0F6CBD]" />
                            Verification Evidence
                          </h4>
                          
                          {evidence.length > 0 ? (
                            <ScrollArea className="h-[120px] rounded-md border p-2">
                              <div className="space-y-2">
                                {evidence.map((item, index) => (
                                  <div key={index} className="text-sm border-b pb-1">
                                    <div className="flex justify-between">
                                      <span className="font-medium">{item.type}</span>
                                      <span className="text-xs text-gray-500">{item.date}</span>
                                    </div>
                                    <p className="text-xs text-gray-700">{item.description}</p>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          ) : (
                            <div className="text-xs text-gray-500 italic p-2 border rounded-md">
                              No verification evidence recorded
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-2">
                          <Progress 
                            value={calculateCompletion(factor)} 
                            className="h-2 w-full" 
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Documentation: {evidence.length > 0 ? 'Complete' : 'Incomplete'}</span>
                            <span>{calculateCompletion(factor)}% Complete</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingFactor(factor);
                          setActiveDialog('evidence');
                        }}
                        className="h-8 text-xs"
                      >
                        Add Evidence
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="controls" className="space-y-4 pt-4">
          {trackedCtqFactors.length === 0 ? (
            <Alert>
              <AlertTitle>No Critical-to-Quality factors defined</AlertTitle>
              <AlertDescription>
                Define Critical-to-Quality (CtQ) factors in the Quality Management Plan to implement control measures.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trackedCtqFactors.map(factor => {
                const controls = controlMeasures[factor.id] || [];
                return (
                  <Card key={factor.id} className="group">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-md">{factor.name}</CardTitle>
                        {renderStatusBadge(factor.status)}
                      </div>
                      <CardDescription>{factor.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-0">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <ShieldCheck className="h-4 w-4 mr-1 text-[#E3008C]" />
                            Control Measures
                          </h4>
                          
                          {controls.length > 0 ? (
                            <ScrollArea className="h-[120px] rounded-md border p-2">
                              <div className="space-y-2">
                                {controls.map((item, index) => (
                                  <div key={index} className="text-sm border-b pb-1">
                                    <div className="flex justify-between">
                                      <span className="font-medium capitalize">{item.type} Control</span>
                                      <Badge 
                                        className={
                                          item.effectiveness === 'effective' ? 'bg-green-100 text-green-800' :
                                          item.effectiveness === 'partially' ? 'bg-amber-100 text-amber-800' :
                                          item.effectiveness === 'ineffective' ? 'bg-red-100 text-red-800' :
                                          'bg-gray-100 text-gray-800'
                                        }
                                      >
                                        {item.effectiveness}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-700">{item.description}</p>
                                    <p className="text-xs text-gray-500">Implemented: {item.implementationDate}</p>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          ) : (
                            <div className="text-xs text-gray-500 italic p-2 border rounded-md">
                              No control measures implemented
                            </div>
                          )}
                        </div>
                        
                        {selectedFramework === 'ich_e6r3' && (
                          <Alert className="bg-[#EFF6FC] text-[#0F6CBD] border-[#0F6CBD]/20">
                            <AlertTitle className="flex items-center text-xs">
                              <Info className="h-3 w-3 mr-1" />
                              ICH E6(R3) Risk-Based Quality Management
                            </AlertTitle>
                            <AlertDescription className="text-xs">
                              Control measures should focus on critical data and processes that are essential to ensure 
                              human subject protection and reliability of trial results.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {selectedFramework === 'eu_mdr' && (
                          <Alert className="bg-[#FCF2FA] text-[#E3008C] border-[#E3008C]/20">
                            <AlertTitle className="flex items-center text-xs">
                              <Info className="h-3 w-3 mr-1" />
                              EU MDR Quality System Requirements
                            </AlertTitle>
                            <AlertDescription className="text-xs">
                              Control measures must demonstrably address GSPR requirements and be proportionate to 
                              the risk classification of the device.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingFactor(factor);
                          setActiveDialog('control');
                        }}
                        className="h-8 text-xs"
                      >
                        Add Control
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Dialogs */}
      {editingFactor && (
        <>
          <StatusDialog />
          <EvidenceDialog />
          <ControlDialog />
        </>
      )}
    </div>
  );
};

export default RegulatoryTraceabilityMatrix;