import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, AlertTriangle, ArrowRight, BarChart3, Check, CheckCircle, Clipboard, ClipboardCheck, Download, Edit, FilePlus, FileText, LinkIcon, Plus, Save, Shield, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CerTooltipWrapper from './CerTooltipWrapper';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// ICH E6(R3) Compliant Quality Management Plan Component
const QualityManagementPlanPanel = ({ deviceName, manufacturer, onQMPGenerated }) => {
  const { toast } = useToast();
  const [objectives, setObjectives] = useState([]);
  const [ctqFactors, setCtqFactors] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // QMP Metadata fields (added based on new requirements)
  const [planMetadata, setPlanMetadata] = useState({
    planName: 'Quality Management Plan',
    planVersion: '1.0.0',
    authorName: 'System User', // Default value, should be replaced with actual user
    authorRole: 'Quality Manager',
    dateCreated: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    linkedCerVersion: 'Current Draft'
  });
  
  const [currentObjective, setCurrentObjective] = useState({ 
    id: null, 
    title: '', 
    description: '', 
    measures: '',
    responsible: '',
    timeline: '',
    status: 'planned',
    scopeSections: [], // New field for multi-select list of CER sections 
    mitigationActions: '' // New field for control actions
  });
  
  const [currentCtq, setCurrentCtq] = useState({
    id: null,
    objectiveId: null,
    name: '',
    description: '',
    riskLevel: 'medium',
    associatedSection: '',
    mitigation: '',
    nextReviewDate: '', // For risk-based review scheduling
    status: 'pending' // For tracking CtQ satisfaction status
  });
  
  const [editingCtqId, setEditingCtqId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  // Load existing QMP data from API on component mount
  useEffect(() => {
    const loadQmpData = async () => {
      try {
        setIsLoadingPlan(true);
        // TODO: Implement API call to load QMP data
        // For now, use sample data
        setTimeout(() => {
          const sampleObjectives = [
            {
              id: 1,
              title: "Ensure Clinical Data Integrity",
              description: "Maintain the highest standards for clinical data collection, processing, and analysis to ensure data integrity throughout the clinical evaluation process.",
              measures: "Data validation rate >98%, Error reporting within 24 hours, Monthly data quality audits",
              responsible: "Clinical Data Manager",
              timeline: "Throughout CER development and ongoing monitoring",
              status: "in-progress"
            },
            {
              id: 2,
              title: "Regulatory Compliance Assurance",
              description: "Ensure all aspects of the clinical evaluation comply with EU MDR 2017/745, MEDDEV 2.7/1 Rev 4, and applicable international standards.",
              measures: "100% compliance with regulatory requirements, Pre-submission regulatory review completed",
              responsible: "Regulatory Affairs Manager",
              timeline: "Verification prior to submission and ongoing monitoring",
              status: "planned"
            }
          ];
          
          const sampleCtqFactors = [
            {
              id: 1,
              objectiveId: 1,
              name: "Literature Search Comprehensiveness",
              description: "Ensuring literature searches capture all relevant clinical data for the device and equivalent devices",
              riskLevel: "high",
              associatedSection: "Literature Review",
              mitigation: "Use structured search protocol with multiple databases; independent verification of search results"
            },
            {
              id: 2,
              objectiveId: 1,
              name: "FAERS Data Integration",
              description: "Ensuring complete and accurate adverse event data integration from FDA FAERS",
              riskLevel: "medium",
              associatedSection: "Post-Market Surveillance",
              mitigation: "Automated data validation checks; manual verification of critical signals"
            },
            {
              id: 3,
              objectiveId: 2,
              name: "GSPR Documentation Completeness",
              description: "Ensuring all applicable GSPRs are addressed with appropriate evidence",
              riskLevel: "high",
              associatedSection: "GSPR Mapping",
              mitigation: "Dual verification process; regulatory expert review; completeness checklist"
            }
          ];
          
          setObjectives(sampleObjectives);
          setCtqFactors(sampleCtqFactors);
          setIsLoadingPlan(false);
        }, 1000);
      } catch (error) {
        toast({
          title: "Error loading Quality Management Plan",
          description: error.message || "Could not load QMP data. Please try again.",
          variant: "destructive"
        });
        setIsLoadingPlan(false);
      }
    };
    
    loadQmpData();
  }, []);

  // Add or update objective
  const handleSaveObjective = () => {
    if (!currentObjective.title || !currentObjective.description) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and description for the quality objective.",
        variant: "destructive"
      });
      return;
    }

    if (currentObjective.id) {
      // Update existing objective
      setObjectives(objectives.map(obj => 
        obj.id === currentObjective.id ? currentObjective : obj
      ));
      toast({
        title: "Objective Updated",
        description: "Quality objective has been updated successfully.",
        variant: "success"
      });
    } else {
      // Add new objective
      const newObjective = {
        ...currentObjective,
        id: objectives.length ? Math.max(...objectives.map(o => o.id)) + 1 : 1
      };
      setObjectives([...objectives, newObjective]);
      toast({
        title: "Objective Added",
        description: "New quality objective has been added successfully.",
        variant: "success"
      });
    }

    // Reset form
    setCurrentObjective({ 
      id: null, 
      title: '', 
      description: '', 
      measures: '',
      responsible: '',
      timeline: '',
      status: 'planned' 
    });
    setIsEditing(false);
  };

  // Edit existing objective
  const handleEditObjective = (objective) => {
    setCurrentObjective(objective);
    setIsEditing(true);
  };

  // Delete objective
  const handleDeleteObjective = (id) => {
    // Check if there are any CtQ factors associated with this objective
    const associatedFactors = ctqFactors.filter(factor => factor.objectiveId === id);
    
    if (associatedFactors.length > 0) {
      // Ask for confirmation before deleting the objective and associated factors
      if (window.confirm(`This objective has ${associatedFactors.length} associated Critical-to-Quality factors. Are you sure you want to delete it and all associated factors?`)) {
        setObjectives(objectives.filter(obj => obj.id !== id));
        setCtqFactors(ctqFactors.filter(factor => factor.objectiveId !== id));
        toast({
          title: "Objective Deleted",
          description: `Quality objective and ${associatedFactors.length} associated Critical-to-Quality factors have been removed.`,
          variant: "success"
        });
      }
    } else {
      setObjectives(objectives.filter(obj => obj.id !== id));
      toast({
        title: "Objective Deleted",
        description: "Quality objective has been removed.",
        variant: "success"
      });
    }
  };

  // Add or update CtQ factor
  const handleSaveCtqFactor = () => {
    if (!currentCtq.name || !currentCtq.description || !currentCtq.objectiveId) {
      toast({
        title: "Missing Information",
        description: "Please provide a name, description, and select an objective for the Critical-to-Quality factor.",
        variant: "destructive"
      });
      return;
    }

    if (editingCtqId) {
      // Update existing CtQ factor
      setCtqFactors(ctqFactors.map(factor => 
        factor.id === editingCtqId ? { ...currentCtq, id: editingCtqId } : factor
      ));
      toast({
        title: "CtQ Factor Updated",
        description: "Critical-to-Quality factor has been updated successfully.",
        variant: "success"
      });
    } else {
      // Add new CtQ factor
      const newCtq = {
        ...currentCtq,
        id: ctqFactors.length ? Math.max(...ctqFactors.map(f => f.id)) + 1 : 1
      };
      setCtqFactors([...ctqFactors, newCtq]);
      toast({
        title: "CtQ Factor Added",
        description: "New Critical-to-Quality factor has been added successfully.",
        variant: "success"
      });
    }

    // Reset form
    setCurrentCtq({
      id: null,
      objectiveId: null,
      name: '',
      description: '',
      riskLevel: 'medium',
      associatedSection: '',
      mitigation: ''
    });
    setEditingCtqId(null);
  };

  // Edit existing CtQ factor
  const handleEditCtqFactor = (factor) => {
    setCurrentCtq(factor);
    setEditingCtqId(factor.id);
  };

  // Delete CtQ factor
  const handleDeleteCtqFactor = (id) => {
    setCtqFactors(ctqFactors.filter(factor => factor.id !== id));
    toast({
      title: "CtQ Factor Deleted",
      description: "Critical-to-Quality factor has been removed.",
      variant: "success"
    });
  };

  // Generate QMP document and add to CER
  const handleGenerateQMP = async () => {
    if (objectives.length === 0) {
      toast({
        title: "No Objectives Defined",
        description: "Please define at least one quality objective before generating the QMP document.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Format QMP content
      const qmpContent = formatQmpContent();
      
      // TODO: Implement API call to save QMP and add to CER
      // For now, simulate API call
      setTimeout(() => {
        if (onQMPGenerated) {
          onQMPGenerated({
            title: "Quality Management Plan",
            type: "qmp",
            content: qmpContent,
            lastUpdated: new Date().toISOString()
          });
        }
        
        toast({
          title: "QMP Generated Successfully",
          description: "Quality Management Plan has been generated and added to your CER.",
          variant: "success"
        });
        setIsGenerating(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "QMP Generation Failed",
        description: error.message || "Could not generate QMP document. Please try again.",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  // Format QMP content for inclusion in CER
  const formatQmpContent = () => {
    const deviceInfo = deviceName ? 
      `Device: ${deviceName}${manufacturer ? ` (Manufacturer: ${manufacturer})` : ''}` : 
      `Unnamed Device${manufacturer ? ` (Manufacturer: ${manufacturer})` : ''}`;

    // Include metadata fields in the QMP document
    const metadataSection = `
# ${planMetadata.planName}
Version: ${planMetadata.planVersion}

${deviceInfo}
Author: ${planMetadata.authorName}, ${planMetadata.authorRole}
Created: ${new Date(planMetadata.dateCreated).toLocaleDateString()}
Last Updated: ${new Date(planMetadata.lastUpdated).toLocaleDateString()}
Linked CER Version: ${planMetadata.linkedCerVersion}
`;

    const content = `${metadataSection}

## 1. Introduction

This Quality Management Plan (QMP) has been developed in accordance with ICH E6(R3) principles and EU MDR 2017/745 requirements to ensure the quality, integrity, and compliance of the clinical evaluation process for this medical device. The QMP outlines quality objectives, critical-to-quality factors, and methods for monitoring and maintaining quality throughout the clinical evaluation process.

## 2. Quality Objectives

${objectives.map(obj => `
### 2.${objectives.indexOf(obj) + 1}. ${obj.title}

**Description:** ${obj.description}

**Success Measures:** ${obj.measures}

**Responsible Party:** ${obj.responsible}

**Timeline:** ${obj.timeline}

**Status:** ${obj.status.charAt(0).toUpperCase() + obj.status.slice(1)}

${getCtqFactorsForObjective(obj.id)}
`).join('')}

## 3. Quality Risk Management

The Critical-to-Quality factors identified above form the basis of our risk-based approach to quality management throughout the clinical evaluation process. Each factor has been assessed for risk level and appropriate mitigation strategies have been implemented.

## 4. Monitoring and Continuous Improvement

Quality monitoring will be conducted continuously throughout the clinical evaluation process. Regular quality reviews will be conducted at key milestones, with a comprehensive review prior to finalization of the CER.

## 5. Compliance Statement

This Quality Management Plan complies with:
- ICH E6(R3) Good Clinical Practice
- EU MDR 2017/745 Quality Management System requirements
- ISO 14155:2020 Clinical investigation of medical devices for human subjects
- MEDDEV 2.7/1 Rev 4 Clinical Evaluation guidance

_Document Generated: ${new Date().toLocaleDateString()}_
`;

    return content;
  };

  // Helper function to format CtQ factors for a specific objective
  const getCtqFactorsForObjective = (objectiveId) => {
    const factors = ctqFactors.filter(factor => factor.objectiveId === objectiveId);
    
    if (factors.length === 0) {
      return "No Critical-to-Quality factors defined for this objective.";
    }
    
    return `**Critical-to-Quality Factors:**\n${factors.map(factor => `
* **${factor.name}**
  * Associated Section: ${factor.associatedSection}
  * Risk Level: ${factor.riskLevel.charAt(0).toUpperCase() + factor.riskLevel.slice(1)}
  * Description: ${factor.description}
  * Mitigation: ${factor.mitigation}
`).join('')}`;
  };

  // Render status badge with appropriate color and icon
  const renderStatusBadge = (status) => {
    let color, icon;
    
    switch (status) {
      case 'completed':
        color = 'bg-green-100 text-green-800 border-green-200';
        icon = <CheckCircle className="mr-1 h-3 w-3" />;
        break;
      case 'in-progress':
        color = 'bg-blue-100 text-blue-800 border-blue-200';
        icon = <ArrowRight className="mr-1 h-3 w-3" />;
        break;
      case 'at-risk':
        color = 'bg-red-100 text-red-800 border-red-200';
        icon = <AlertTriangle className="mr-1 h-3 w-3" />;
        break;
      default:
        color = 'bg-gray-100 text-gray-800 border-gray-200';
        icon = <AlertCircle className="mr-1 h-3 w-3" />;
    }
    
    return (
      <Badge className={`${color} rounded-md py-0.5 px-2 text-xs font-medium capitalize flex items-center`}>
        {icon}
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  // Render risk level badge with appropriate color and icon
  const renderRiskBadge = (level) => {
    let color, icon;
    switch (level) {
      case 'high':
        color = 'bg-red-100 text-red-800 border-red-200';
        icon = <AlertCircle className="mr-1 h-3 w-3" />;
        break;
      case 'medium':
        color = 'bg-amber-100 text-amber-800 border-amber-200';
        icon = <AlertTriangle className="mr-1 h-3 w-3" />;
        break;
      case 'low':
        color = 'bg-green-100 text-green-800 border-green-200';
        icon = <CheckCircle className="mr-1 h-3 w-3" />;
        break;
      default:
        color = 'bg-gray-100 text-gray-800 border-gray-200';
        icon = <AlertCircle className="mr-1 h-3 w-3" />;
    }
    
    return (
      <Badge className={`${color} rounded-md py-0.5 px-2 text-xs font-medium capitalize flex items-center`}>
        {icon}
        {level} risk
      </Badge>
    );
  };
  
  // Calculate metrics for dashboard
  const metrics = useMemo(() => {
    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter(obj => obj.status === 'completed').length;
    const inProgressObjectives = objectives.filter(obj => obj.status === 'in-progress').length;
    const atRiskObjectives = objectives.filter(obj => obj.status === 'at-risk').length;
    
    const totalCtqFactors = ctqFactors.length;
    const highRiskFactors = ctqFactors.filter(factor => factor.riskLevel === 'high').length;
    const mediumRiskFactors = ctqFactors.filter(factor => factor.riskLevel === 'medium').length;
    const lowRiskFactors = ctqFactors.filter(factor => factor.riskLevel === 'low').length;
    
    // Link analysis - checks which CtQ factors have associated sections
    const linkedFactors = ctqFactors.filter(factor => factor.associatedSection && factor.associatedSection.trim() !== '').length;
    
    // Calculate completion percentage
    const objectivesCompletionPercentage = totalObjectives > 0 
      ? Math.round((completedObjectives / totalObjectives) * 100) 
      : 0;
      
    const ctqFactorsWithMitigation = ctqFactors.filter(
      factor => factor.mitigation && factor.mitigation.trim() !== ''
    ).length;
    
    const mitigationCompletionPercentage = totalCtqFactors > 0
      ? Math.round((ctqFactorsWithMitigation / totalCtqFactors) * 100)
      : 0;
      
    const documentReadiness = totalObjectives > 0 && totalCtqFactors > 0
      ? Math.round(((objectivesCompletionPercentage + mitigationCompletionPercentage + (linkedFactors / totalCtqFactors * 100)) / 3))
      : 0;
    
    return {
      totalObjectives,
      completedObjectives,
      inProgressObjectives,
      atRiskObjectives,
      totalCtqFactors,
      highRiskFactors,
      mediumRiskFactors,
      lowRiskFactors,
      linkedFactors,
      objectivesCompletionPercentage,
      mitigationCompletionPercentage,
      documentReadiness
    };
  }, [objectives, ctqFactors]);

  return (
    <div className="bg-[#F9F9F9] p-4">
      {/* QMP Metadata Section */}
      <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold text-[#323130] mb-3 flex items-center">
          <FileText className="mr-2 h-5 w-5 text-[#E3008C]" />
          Plan Metadata
          <span className="text-xs font-normal text-[#605E5C] ml-2">ICH E6(R3) Documentation</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Plan Name & Version */}
          <div>
            <label className="text-sm font-medium text-[#323130]">Plan Name</label>
            <Input
              value={planMetadata.planName}
              onChange={(e) => setPlanMetadata({...planMetadata, planName: e.target.value, lastUpdated: new Date().toISOString()})}
              placeholder="Quality Management Plan"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#323130]">Plan Version</label>
            <Input
              value={planMetadata.planVersion}
              onChange={(e) => setPlanMetadata({...planMetadata, planVersion: e.target.value, lastUpdated: new Date().toISOString()})}
              placeholder="1.0.0"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#323130]">Linked CER Version</label>
            <Select
              value={planMetadata.linkedCerVersion}
              onValueChange={(value) => setPlanMetadata({...planMetadata, linkedCerVersion: value, lastUpdated: new Date().toISOString()})}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select CER version" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Current Draft">Current Draft</SelectItem>
                  <SelectItem value="v1.0">v1.0</SelectItem>
                  <SelectItem value="v2.0">v2.0</SelectItem>
                  <SelectItem value="v2.3">v2.3</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {/* Author Info & Dates */}
          <div>
            <label className="text-sm font-medium text-[#323130]">Author Name</label>
            <Input
              value={planMetadata.authorName}
              onChange={(e) => setPlanMetadata({...planMetadata, authorName: e.target.value, lastUpdated: new Date().toISOString()})}
              placeholder="Auto-populated from user profile"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#323130]">Author Role</label>
            <Input
              value={planMetadata.authorRole}
              onChange={(e) => setPlanMetadata({...planMetadata, authorRole: e.target.value, lastUpdated: new Date().toISOString()})}
              placeholder="Quality Manager"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium text-[#323130]">Date Created</label>
              <Input
                value={new Date(planMetadata.dateCreated).toLocaleDateString()}
                readOnly
                className="mt-1 bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#323130]">Last Updated</label>
              <Input
                value={new Date(planMetadata.lastUpdated).toLocaleDateString()}
                readOnly
                className="mt-1 bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard Metrics */}
      <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold text-[#323130] mb-3 flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-[#E3008C]" />
          Quality Management Dashboard
          <span className="text-xs font-normal text-[#605E5C] ml-2">ICH E6(R3) Implementation Status</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card className="shadow-none border-l-4 border-l-blue-500">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm text-[#323130]">
                Quality Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              <div className="text-2xl font-bold text-[#0F6CBD]">{metrics.totalObjectives}</div>
              <div className="text-xs text-[#605E5C] mt-1 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> 
                {metrics.completedObjectives} Complete
                {metrics.atRiskObjectives > 0 && (
                  <span className="ml-2 text-red-500 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {metrics.atRiskObjectives} At Risk
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-none border-l-4 border-l-[#E3008C]">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm text-[#323130]">
                Critical-to-Quality Factors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              <div className="text-2xl font-bold text-[#E3008C]">{metrics.totalCtqFactors}</div>
              <div className="text-xs text-[#605E5C] mt-1 flex items-center flex-wrap">
                {metrics.highRiskFactors > 0 && (
                  <span className="mr-2 text-red-700 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {metrics.highRiskFactors} High
                  </span>
                )}
                {metrics.mediumRiskFactors > 0 && (
                  <span className="mr-2 text-amber-700 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {metrics.mediumRiskFactors} Medium
                  </span>
                )}
                {metrics.lowRiskFactors > 0 && (
                  <span className="text-green-700 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {metrics.lowRiskFactors} Low
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-none border-l-4 border-l-green-500">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm text-[#323130]">
                Traceability Links
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              <div className="text-2xl font-bold text-green-600">
                {metrics.linkedFactors}/{metrics.totalCtqFactors}
              </div>
              <div className="text-xs text-[#605E5C] mt-1 flex items-center">
                <LinkIcon className="h-3 w-3 mr-1 text-[#0F6CBD]" /> 
                {metrics.totalCtqFactors > 0 
                  ? Math.round((metrics.linkedFactors / metrics.totalCtqFactors) * 100) 
                  : 0}% Linked to CER
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-none border-l-4 border-l-purple-500">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm text-[#323130]">
                Document Readiness
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              <div className="text-2xl font-bold text-purple-600">{metrics.documentReadiness}%</div>
              <div className="mt-1">
                <Progress value={metrics.documentReadiness} className="h-1.5 w-full bg-gray-200" />
              </div>
              <div className="text-xs text-[#605E5C] mt-1 flex items-center">
                <FileText className="h-3 w-3 mr-1 text-purple-500" /> 
                {metrics.documentReadiness < 50 ? 'Needs attention' : 
                 metrics.documentReadiness < 80 ? 'Making progress' : 
                 'Almost ready'}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-xs text-[#605E5C] flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-1 text-[#E3008C]" />
            <span>ICH E6(R3) Quality Management Implementation</span>
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateQMP}
              disabled={isGenerating}
              className="h-7 text-xs"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#0F6CBD] mr-1"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-1 h-3 w-3" />
                  Export QMP Document
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Panel - Quality Objectives */}
        <div className="w-full md:w-1/2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#323130] flex items-center">
              <CerTooltipWrapper
                tooltipContent="Quality Objectives define specific, measurable goals to ensure the quality of your clinical evaluation process according to ICH E6(R3) principles."
                whyThisMatters="Quality objectives are required under EU MDR to demonstrate your approach to ensuring clinical data quality and integrity. They provide auditable evidence of your quality management system."
              >
                Quality Objectives
              </CerTooltipWrapper>
            </h2>
            <div className="mt-2 mb-4">
              <div className="bg-[#EFF6FC] rounded-md px-3 py-1 text-sm inline-flex items-center gap-1 text-[#0F6CBD]">
                <span>ICH E6(R3) Compliant</span>
              </div>
            </div>
            
            {isLoadingPlan ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F6CBD]"></div>
              </div>
            ) : (
              <>
                {objectives.length > 0 ? (
                  <div className="space-y-4">
                    {objectives.map((objective) => (
                      <Card key={objective.id} className="bg-white border rounded-md shadow-sm">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-md font-medium text-[#323130]">{objective.title}</CardTitle>
                            <div className="flex space-x-1">
                              {renderStatusBadge(objective.status)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <p className="text-sm text-[#605E5C] mb-2">{objective.description}</p>
                          {objective.measures && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-[#605E5C]">Success Measures:</p>
                              <p className="text-xs text-[#605E5C]">{objective.measures}</p>
                            </div>
                          )}
                          {objective.responsible && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-[#605E5C]">Responsible:</p>
                              <p className="text-xs text-[#605E5C]">{objective.responsible}</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="p-3 pt-0 flex justify-between items-center">
                          <div className="flex space-x-1">
                            <Button
                              onClick={() => handleEditObjective(objective)}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-[#0F6CBD]"
                            >
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteObjective(objective.id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-red-500"
                            >
                              <Trash2 size={14} className="mr-1" />
                              Delete
                            </Button>
                          </div>
                          <Button
                            onClick={() => {
                              setCurrentCtq({
                                ...currentCtq,
                                objectiveId: objective.id
                              });
                              document.getElementById('add-ctq-section').scrollIntoView({ behavior: 'smooth' });
                            }}
                            variant="outline"
                            size="sm"
                            className="h-8 bg-transparent text-[#0F6CBD] border-[#0F6CBD]"
                          >
                            <Plus size={14} className="mr-1" />
                            Add CtQ Factor
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Quality Objectives</AlertTitle>
                    <AlertDescription>
                      Quality objectives define how you will ensure quality in your CER. Add at least one objective to create your Quality Management Plan.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
            
            {/* Add/Edit Objective Form */}
            {isEditing ? (
              <Card className="bg-white border rounded-md shadow-sm mt-4">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-md font-medium text-[#323130]">
                    {currentObjective.id ? 'Edit Objective' : 'Add New Objective'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-[#323130]">Title</label>
                    <Input
                      value={currentObjective.title}
                      onChange={(e) => setCurrentObjective({...currentObjective, title: e.target.value})}
                      placeholder="E.g., Ensure Data Integrity"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#323130]">Description</label>
                    <Textarea
                      value={currentObjective.description}
                      onChange={(e) => setCurrentObjective({...currentObjective, description: e.target.value})}
                      placeholder="Describe the quality objective..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#323130]">Success Measures</label>
                    <Textarea
                      value={currentObjective.measures}
                      onChange={(e) => setCurrentObjective({...currentObjective, measures: e.target.value})}
                      placeholder="Define how success will be measured..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#323130]">Responsible Party</label>
                    <Input
                      value={currentObjective.responsible}
                      onChange={(e) => setCurrentObjective({...currentObjective, responsible: e.target.value})}
                      placeholder="E.g., Clinical Data Manager"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#323130]">Timeline</label>
                    <Input
                      value={currentObjective.timeline}
                      onChange={(e) => setCurrentObjective({...currentObjective, timeline: e.target.value})}
                      placeholder="E.g., Throughout CER development"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#323130]">Status</label>
                    <Select
                      value={currentObjective.status}
                      onValueChange={(value) => setCurrentObjective({...currentObjective, status: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="at-risk">At Risk</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="p-4 flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      setCurrentObjective({ 
                        id: null, 
                        title: '', 
                        description: '', 
                        measures: '',
                        responsible: '',
                        timeline: '',
                        status: 'planned' 
                      });
                      setIsEditing(false);
                    }}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveObjective}
                    className="bg-[#0F6CBD] hover:bg-[#0E5CA8]"
                  >
                    <Save size={16} className="mr-1" />
                    Save Objective
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="mt-4 bg-[#0F6CBD] hover:bg-[#0E5CA8]"
              >
                <Plus size={16} className="mr-1" />
                Add Quality Objective
              </Button>
            )}
          </div>
        </div>
        
        {/* Right Panel - Critical-to-Quality Factors */}
        <div className="w-full md:w-1/2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#323130] flex items-center">
              <CerTooltipWrapper
                tooltipContent="Critical-to-Quality (CtQ) factors identify the specific aspects of your clinical evaluation that are most important for maintaining quality and regulatory compliance."
                whyThisMatters="CtQ factors help you implement a risk-based approach to quality management as required by ICH E6(R3) and EU MDR. They allow you to focus resources on the most critical quality aspects."
              >
                Critical-to-Quality Factors
              </CerTooltipWrapper>
            </h2>
            <div className="mt-2 mb-4">
              <div className="bg-[#EFF6FC] rounded-md px-3 py-1 text-sm inline-flex items-center gap-1 text-[#0F6CBD]">
                <span>Risk-Based Approach</span>
              </div>
            </div>
            
            {isLoadingPlan ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F6CBD]"></div>
              </div>
            ) : (
              <>
                {ctqFactors.length > 0 ? (
                  <div className="space-y-3">
                    {ctqFactors.map((factor) => {
                      const associatedObjective = objectives.find(obj => obj.id === factor.objectiveId);
                      
                      return (
                        <Card key={factor.id} className="bg-white border rounded-md shadow-sm">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-md font-medium text-[#323130]">{factor.name}</CardTitle>
                              <div className="flex space-x-1">
                                {renderRiskBadge(factor.riskLevel)}
                              </div>
                            </div>
                            {associatedObjective && (
                              <CardDescription className="text-xs text-[#0F6CBD]">
                                {associatedObjective.title}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <p className="text-sm text-[#605E5C] mb-2">{factor.description}</p>
                            
                            {/* Visual traceability links - improved with ICH E6(R3) alignment */}
                            <div className="mt-3 mb-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-[#E3008C]">CER Traceability</span>
                                <div className="text-xs text-gray-500">ICH E6(R3)</div>
                              </div>
                              
                              {factor.associatedSection ? (
                                <div className="border border-green-200 rounded-md overflow-hidden">
                                  <div className="bg-green-100 px-2 py-1 flex items-center justify-between">
                                    <div className="flex items-center">
                                      <CheckCircle className="h-3 w-3 mr-1 text-green-700" />
                                      <p className="text-xs font-medium text-green-700">Traced to CER</p>
                                    </div>
                                    <Badge className="bg-green-200 text-green-800 px-2 py-0 text-xs">Linked</Badge>
                                  </div>
                                  <div className="p-2 bg-white border-t border-green-200">
                                    <div className="flex flex-col">
                                      <div className="flex items-center mb-1">
                                        <FileText className="h-3 w-3 mr-1 text-[#0F6CBD]" />
                                        <p className="text-xs font-medium text-[#0F6CBD]">Associated CER Section:</p>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs text-[#323130] pl-4">{factor.associatedSection}</p>
                                        <div className="bg-[#EFF6FC] rounded-md px-2 py-0.5 text-xs text-[#0F6CBD]">
                                          Direct Link
                                        </div>
                                      </div>
                                      
                                      {/* Add CER compliance status indicator */}
                                      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Compliance Verification:</span>
                                        <Badge className="bg-blue-100 text-blue-800 px-2 py-0 text-xs">
                                          Verified
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="border border-amber-200 rounded-md overflow-hidden">
                                  <div className="bg-amber-100 px-2 py-1 flex items-center justify-between">
                                    <div className="flex items-center">
                                      <AlertTriangle className="h-3 w-3 mr-1 text-amber-700" />
                                      <p className="text-xs font-medium text-amber-700">Needs Traceability</p>
                                    </div>
                                    <Badge className="bg-amber-200 text-amber-800 px-2 py-0 text-xs">Pending</Badge>
                                  </div>
                                  <div className="p-2 bg-white border-t border-amber-200 flex items-center">
                                    <LinkIcon className="h-3 w-3 mr-1 text-amber-700" />
                                    <span className="text-xs text-amber-700">
                                      Link this factor to a CER section for complete ICH E6(R3) traceability
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {factor.mitigation && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-[#605E5C]">Mitigation Strategy:</p>
                                <p className="text-xs text-[#605E5C]">{factor.mitigation}</p>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="p-3 pt-0 flex justify-end space-x-2">
                            <Button
                              onClick={() => handleEditCtqFactor(factor)}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-[#0F6CBD]"
                            >
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteCtqFactor(factor.id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-red-500"
                            >
                              <Trash2 size={14} className="mr-1" />
                              Delete
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No CtQ Factors</AlertTitle>
                    <AlertDescription>
                      Critical-to-Quality factors identify specific elements that are crucial for maintaining quality in your CER. 
                      Add objectives first, then define CtQ factors for each objective.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
            
            {/* Add/Edit CtQ Factor Form */}
            <div id="add-ctq-section">
              <Card className="bg-white border rounded-md shadow-sm mt-4">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-md font-medium text-[#323130]">
                    {editingCtqId ? 'Edit CtQ Factor' : 'Add New CtQ Factor'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-[#323130]">Associated Objective</label>
                    <Select
                      value={currentCtq.objectiveId?.toString() || ''}
                      onValueChange={(value) => setCurrentCtq({...currentCtq, objectiveId: parseInt(value)})}
                      disabled={objectives.length === 0}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={objectives.length > 0 ? "Select an objective" : "No objectives available"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {objectives.map(obj => (
                            <SelectItem key={obj.id} value={obj.id.toString()}>
                              {obj.title}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#323130]">Factor Name</label>
                    <Input
                      value={currentCtq.name}
                      onChange={(e) => setCurrentCtq({...currentCtq, name: e.target.value})}
                      placeholder="E.g., Literature Search Comprehensiveness"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#323130]">Description</label>
                    <Textarea
                      value={currentCtq.description}
                      onChange={(e) => setCurrentCtq({...currentCtq, description: e.target.value})}
                      placeholder="Describe why this factor is critical to quality..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#323130]">Associated CER Section</label>
                    <Input
                      value={currentCtq.associatedSection}
                      onChange={(e) => setCurrentCtq({...currentCtq, associatedSection: e.target.value})}
                      placeholder="E.g., Literature Review, Post-Market Surveillance"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#323130]">Risk Level</label>
                    <Select
                      value={currentCtq.riskLevel}
                      onValueChange={(value) => setCurrentCtq({...currentCtq, riskLevel: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="low">Low Risk</SelectItem>
                          <SelectItem value="medium">Medium Risk</SelectItem>
                          <SelectItem value="high">High Risk</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#323130]">Mitigation Strategy</label>
                    <Textarea
                      value={currentCtq.mitigation}
                      onChange={(e) => setCurrentCtq({...currentCtq, mitigation: e.target.value})}
                      placeholder="Describe how risks will be mitigated..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </CardContent>
                <CardFooter className="p-4 flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      setCurrentCtq({
                        id: null,
                        objectiveId: null,
                        name: '',
                        description: '',
                        riskLevel: 'medium',
                        associatedSection: '',
                        mitigation: ''
                      });
                      setEditingCtqId(null);
                    }}
                    variant="ghost"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleSaveCtqFactor}
                    className="bg-[#0F6CBD] hover:bg-[#0E5CA8]"
                    disabled={objectives.length === 0}
                  >
                    <Save size={16} className="mr-1" />
                    Save CtQ Factor
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Panel - Generate QMP Document */}
      <div className="mt-6 bg-white p-4 rounded-md border shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-[#323130]">Quality Management Plan Document</h3>
            <p className="text-sm text-[#605E5C]">
              Generate an ICH E6(R3) compliant Quality Management Plan to include in your CER.
            </p>
          </div>
          <div className="mt-2 md:mt-0">
            <CerTooltipWrapper
              tooltipContent="Preview the QMP document before adding it to your CER."
              whyThisMatters="A well-structured Quality Management Plan demonstrates to regulators that you have a systematic approach to ensuring clinical evaluation quality."
              side="left"
            >
              <Button
                onClick={() => {
                  const qmpContent = formatQmpContent();
                  // In a real implementation, show a preview modal
                  console.log(qmpContent);
                  toast({
                    title: "QMP Preview Generated",
                    description: "Quality Management Plan preview is available in browser console.",
                    variant: "success"
                  });
                }}
                variant="outline"
                className="mr-2 bg-transparent text-[#0F6CBD] hover:bg-[#EFF6FC] border-[#D1E5FA]"
              >
                <Clipboard size={16} className="mr-1" />
                Preview
              </Button>
            </CerTooltipWrapper>
            
            <CerTooltipWrapper
              tooltipContent="Generate the QMP document and add it to your CER. This will create a new section or update an existing QMP section in your CER."
              whyThisMatters="Having a QMP as part of your CER ensures regulatory compliance with EU MDR and ICH E6(R3) requirements."
              side="left"
            >
              <Button 
                onClick={handleGenerateQMP}
                className="bg-[#0F6CBD] hover:bg-[#0E5CA8]"
                disabled={objectives.length === 0 || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FilePlus size={16} className="mr-1" />
                    Generate QMP Document
                  </>
                )}
              </Button>
            </CerTooltipWrapper>
          </div>
        </div>
        
        <Card className="bg-[#FAFAFA] border rounded-md overflow-hidden">
          <CardHeader className="p-3 bg-[#F5F5F5] border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-[#323130]">QMP Document Preview</CardTitle>
              <div className="text-xs text-gray-500">ICH E6(R3) Compliant Format</div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[200px] py-2 px-4">
              <div className="text-xs text-[#323130] font-mono whitespace-pre-wrap">
                {objectives.length > 0 ? (
                  <pre className="text-xs font-mono">
                    {`# Quality Management Plan

Device: ${deviceName || 'Unnamed Device'}${manufacturer ? ` (Manufacturer: ${manufacturer})` : ''}

## 1. Introduction

This Quality Management Plan (QMP) has been developed in accordance with ICH E6(R3) principles...

## 2. Quality Objectives

${objectives.map((obj, idx) => `### 2.${idx + 1}. ${obj.title}

**Description:** ${obj.description}

**Success Measures:** ${obj.measures || 'Not specified'}

**Status:** ${obj.status.charAt(0).toUpperCase() + obj.status.slice(1)}

${getCtqFactorsForObjective(obj.id).substring(0, 100)}...
`).join('\n')}

## 3. Quality Risk Management

The Critical-to-Quality factors identified above form the basis of our risk-based approach...

## 4. Monitoring and Continuous Improvement

Quality monitoring will be conducted continuously throughout the clinical evaluation process...

...
`}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-8 text-gray-500">
                    <AlertCircle className="h-5 w-5 mb-2" />
                    <p>Add quality objectives to generate a preview</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QualityManagementPlanPanel;