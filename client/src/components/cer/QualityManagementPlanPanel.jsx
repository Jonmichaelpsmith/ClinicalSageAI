import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ClipboardList, Plus, Trash2, Info, FilePlus2, ShieldCheck } from 'lucide-react';
import CerTooltipWrapper from './CerTooltipWrapper';

export default function QualityManagementPlanPanel({
  deviceName = '',
  manufacturer = '',
  initialData = null,
  cerData = {},
  onUpdateQMP = () => {}
}) {
  // Default QMS Plan data structure
  const defaultQMPData = {
    planName: `${deviceName || 'Device'} CER QMS Plan v1.0`,
    cerVersion: cerData.version || '1.0',
    author: cerData.author || '',
    date: new Date().toISOString().split('T')[0],
    qualityObjectives: [],
    ctqFactors: []
  };

  const [qmpData, setQmpData] = useState(initialData || defaultQMPData);
  const [changes, setChanges] = useState(false);
  const [expandedObjective, setExpandedObjective] = useState(null);

  // Update data when props change
  useEffect(() => {
    if (initialData) {
      setQmpData(initialData);
    } else if (deviceName !== qmpData.deviceName || manufacturer !== qmpData.manufacturer) {
      setQmpData(prev => ({
        ...prev,
        planName: `${deviceName || 'Device'} CER QMS Plan v1.0`,
        cerVersion: cerData.version || '1.0'
      }));
    }
  }, [initialData, deviceName, manufacturer, cerData]);

  // Handle field changes
  const handleChange = (field, value) => {
    setQmpData(prev => ({
      ...prev,
      [field]: value
    }));
    setChanges(true);
  };

  // Handle add new quality objective
  const handleAddObjective = () => {
    const newObjective = {
      id: `obj-${Date.now()}`,
      description: '',
      scope: 'Entire Document',
      riskRating: 'Medium',
      controlMitigation: ''
    };
    
    setQmpData(prev => ({
      ...prev,
      qualityObjectives: [...prev.qualityObjectives, newObjective]
    }));
    
    setExpandedObjective(newObjective.id);
    setChanges(true);
  };

  // Handle remove quality objective
  const handleRemoveObjective = (objectiveId) => {
    setQmpData(prev => ({
      ...prev,
      qualityObjectives: prev.qualityObjectives.filter(obj => obj.id !== objectiveId),
      // Also remove any CtQ factors associated with this objective
      ctqFactors: prev.ctqFactors.filter(factor => factor.objectiveId !== objectiveId)
    }));
    setChanges(true);
  };

  // Handle update objective
  const handleUpdateObjective = (objectiveId, field, value) => {
    setQmpData(prev => ({
      ...prev,
      qualityObjectives: prev.qualityObjectives.map(obj => 
        obj.id === objectiveId ? { ...obj, [field]: value } : obj
      )
    }));
    setChanges(true);
  };

  // Handle add new CtQ factor for an objective
  const handleAddCtqFactor = (objectiveId) => {
    const newFactor = {
      id: `ctq-${Date.now()}`,
      objectiveId,
      name: '',
      description: '',
      associatedSection: '',
      riskLevel: 'Medium',
      mitigation: ''
    };
    
    setQmpData(prev => ({
      ...prev,
      ctqFactors: [...prev.ctqFactors, newFactor]
    }));
    
    setChanges(true);
  };

  // Handle remove CtQ factor
  const handleRemoveCtqFactor = (factorId) => {
    setQmpData(prev => ({
      ...prev,
      ctqFactors: prev.ctqFactors.filter(factor => factor.id !== factorId)
    }));
    setChanges(true);
  };

  // Handle update CtQ factor
  const handleUpdateCtqFactor = (factorId, field, value) => {
    setQmpData(prev => ({
      ...prev,
      ctqFactors: prev.ctqFactors.map(factor => 
        factor.id === factorId ? { ...factor, [field]: value } : factor
      )
    }));
    setChanges(true);
  };

  // Handle save
  const handleSave = (linkToCER = false) => {
    onUpdateQMP(qmpData, linkToCER);
    setChanges(false);
  };

  // Get the CtQ factors for a specific objective
  const getCtqFactorsForObjective = (objectiveId) => {
    return qmpData.ctqFactors.filter(factor => factor.objectiveId === objectiveId);
  };

  // Get color for risk level badge
  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'High':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'Low':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // List of possible CER sections for dropdown
  const cerSections = [
    'Device Description',
    'Intended Purpose',
    'Target Population',
    'State of the Art',
    'Literature Review',
    'Clinical Data Analysis',
    'Safety Profile',
    'Performance Evaluation',
    'Risk Analysis',
    'Benefit-Risk Analysis',
    'PMS Plan',
    'PMCF Plan',
    'Entire Document'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#323130]">Quality Management Plan</h2>
          <p className="text-[#605E5C] mt-1">
            Define quality objectives and critical-to-quality factors according to ICH E6(R3) requirements.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="border-[#0F6CBD] text-[#0F6CBD] hover:bg-[#EFF6FC]"
            onClick={() => handleSave(false)}
            disabled={!changes}
          >
            Save Draft
          </Button>
          <CerTooltipWrapper
            tooltipContent="Add this Quality Management Plan as a dedicated section in your CER document. This creates a structured QMS Plan section that documents your quality objectives and critical-to-quality factors."
            whyThisMatters="A comprehensive QMS Plan is required by ICH E6(R3). It demonstrates a risk-based approach to quality management and helps regulatory reviewers understand your quality control processes."
          >
            <Button
              className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white"
              onClick={() => handleSave(true)}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Add to CER
            </Button>
          </CerTooltipWrapper>
        </div>
      </div>
      
      {/* Plan Metadata */}
      <Card className="border-[#E1DFDD]">
        <CardHeader className="bg-[#FAFAFA] border-b border-[#E1DFDD]">
          <CardTitle className="text-lg text-[#323130]">QMS Plan Metadata</CardTitle>
          <CardDescription>Basic information about the Quality Management Plan</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-name" className="text-[#323130]">
                Plan Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="plan-name"
                value={qmpData.planName}
                onChange={(e) => handleChange('planName', e.target.value)}
                placeholder="Enter QMS plan name"
                className="border-[#E1DFDD]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cer-version" className="text-[#323130]">
                Associated CER Version <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cer-version"
                value={qmpData.cerVersion}
                onChange={(e) => handleChange('cerVersion', e.target.value)}
                placeholder="Enter CER version"
                className="border-[#E1DFDD]"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author" className="text-[#323130]">
                Author <span className="text-red-500">*</span>
              </Label>
              <Input
                id="author"
                value={qmpData.author}
                onChange={(e) => handleChange('author', e.target.value)}
                placeholder="Enter author name"
                className="border-[#E1DFDD]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-[#323130]">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={qmpData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="border-[#E1DFDD]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quality Objectives */}
      <Card className="border-[#E1DFDD]">
        <CardHeader className="bg-[#FAFAFA] border-b border-[#E1DFDD]">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg text-[#323130]">Quality Objectives</CardTitle>
              <CardDescription>Define what must be achieved for quality requirements</CardDescription>
            </div>
            <Button 
              onClick={handleAddObjective}
              className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Objective
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {qmpData.qualityObjectives.length === 0 ? (
            <div className="text-center py-8 text-[#605E5C]">
              <AlertCircle className="h-10 w-10 mx-auto mb-2 text-[#0F6CBD]" />
              <p>No quality objectives defined yet.</p>
              <p className="text-sm">Click "Add Objective" to define quality requirements for your CER.</p>
            </div>
          ) : (
            <Accordion 
              type="single" 
              collapsible 
              className="w-full"
              value={expandedObjective}
              onValueChange={setExpandedObjective}
            >
              {qmpData.qualityObjectives.map((objective) => (
                <AccordionItem key={objective.id} value={objective.id} className="border border-[#E1DFDD] rounded-md mb-4 overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 hover:bg-[#F3F2F1] hover:no-underline">
                    <div className="flex items-center justify-between w-full text-left">
                      <div className="flex-1 mr-4">
                        <h3 className="font-medium text-[#323130]">
                          {objective.description || 'Unnamed Objective'}
                        </h3>
                        <p className="text-sm text-[#605E5C]">
                          {objective.scope} 
                          <span className="mx-2">•</span> 
                          Risk: {objective.riskRating}
                        </p>
                      </div>
                      <Badge className={`${getRiskBadgeColor(objective.riskRating)} flex-shrink-0`}>
                        {objective.riskRating}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 border-t border-[#E1DFDD] bg-[#FAFAFA]">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`objective-desc-${objective.id}`} className="text-[#323130]">
                          Objective Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id={`objective-desc-${objective.id}`}
                          value={objective.description}
                          onChange={(e) => handleUpdateObjective(objective.id, 'description', e.target.value)}
                          placeholder="What must be achieved? (e.g., 'Ensure completeness of literature search for safety signals')"
                          className="border-[#E1DFDD] bg-white h-20"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`objective-scope-${objective.id}`} className="text-[#323130]">
                            Scope <span className="text-red-500">*</span>
                          </Label>
                          <Select 
                            value={objective.scope} 
                            onValueChange={(value) => handleUpdateObjective(objective.id, 'scope', value)}
                          >
                            <SelectTrigger className="border-[#E1DFDD] bg-white">
                              <SelectValue placeholder="Select scope" />
                            </SelectTrigger>
                            <SelectContent>
                              {cerSections.map((section) => (
                                <SelectItem key={section} value={section}>{section}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`objective-risk-${objective.id}`} className="text-[#323130]">
                            Risk Rating <span className="text-red-500">*</span>
                          </Label>
                          <Select 
                            value={objective.riskRating} 
                            onValueChange={(value) => handleUpdateObjective(objective.id, 'riskRating', value)}
                          >
                            <SelectTrigger className="border-[#E1DFDD] bg-white">
                              <SelectValue placeholder="Select risk level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`objective-mitigation-${objective.id}`} className="text-[#323130]">
                          Control/Mitigation <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id={`objective-mitigation-${objective.id}`}
                          value={objective.controlMitigation}
                          onChange={(e) => handleUpdateObjective(objective.id, 'controlMitigation', e.target.value)}
                          placeholder="Planned actions or checks (e.g., 'Automated FAERS frequency cross-check')"
                          className="border-[#E1DFDD] bg-white h-20"
                        />
                      </div>
                      
                      {/* Critical-to-Quality Factors for this objective */}
                      <div className="mt-6 border-t border-[#E1DFDD] pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-[#323130] font-medium">Critical-to-Quality (CtQ) Factors</h4>
                          <Button 
                            onClick={() => handleAddCtqFactor(objective.id)}
                            variant="outline"
                            size="sm"
                            className="border-[#0F6CBD] text-[#0F6CBD]"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add CtQ Factor
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          {getCtqFactorsForObjective(objective.id).length === 0 ? (
                            <div className="bg-[#F3F2F1] p-3 rounded text-[#605E5C] text-sm">
                              <div className="flex items-center">
                                <Info className="h-4 w-4 mr-2 text-[#0F6CBD]" />
                                <span>No CtQ factors defined for this objective.</span>
                              </div>
                              <p className="mt-1 ml-6">CtQ factors specify the exact data points or processes to monitor.</p>
                            </div>
                          ) : (
                            getCtqFactorsForObjective(objective.id).map(factor => (
                              <Card key={factor.id} className="border-[#E1DFDD] bg-white">
                                <CardHeader className="p-3 pb-2">
                                  <div className="flex justify-between items-center">
                                    <CardTitle className="text-sm font-medium text-[#323130]">
                                      {factor.name || 'Unnamed Factor'}
                                    </CardTitle>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveCtqFactor(factor.id)}
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 space-y-3">
                                  <div className="space-y-2">
                                    <Label htmlFor={`factor-name-${factor.id}`} className="text-xs text-[#323130]">
                                      Factor Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                      id={`factor-name-${factor.id}`}
                                      value={factor.name}
                                      onChange={(e) => handleUpdateCtqFactor(factor.id, 'name', e.target.value)}
                                      placeholder="e.g., 'ADE Frequency Capture'"
                                      className="border-[#E1DFDD] h-8 text-sm"
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                      <Label htmlFor={`factor-section-${factor.id}`} className="text-xs text-[#323130]">
                                        Associated CER Section <span className="text-red-500">*</span>
                                      </Label>
                                      <Select 
                                        value={factor.associatedSection} 
                                        onValueChange={(value) => handleUpdateCtqFactor(factor.id, 'associatedSection', value)}
                                      >
                                        <SelectTrigger className="border-[#E1DFDD] h-8 text-sm">
                                          <SelectValue placeholder="Select section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {cerSections.map((section) => (
                                            <SelectItem key={section} value={section}>{section}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor={`factor-risk-${factor.id}`} className="text-xs text-[#323130]">
                                        Risk Level <span className="text-red-500">*</span>
                                      </Label>
                                      <Select 
                                        value={factor.riskLevel} 
                                        onValueChange={(value) => handleUpdateCtqFactor(factor.id, 'riskLevel', value)}
                                      >
                                        <SelectTrigger className="border-[#E1DFDD] h-8 text-sm">
                                          <SelectValue placeholder="Select risk level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="High">High</SelectItem>
                                          <SelectItem value="Medium">Medium</SelectItem>
                                          <SelectItem value="Low">Low</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`factor-desc-${factor.id}`} className="text-xs text-[#323130]">
                                      Description <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                      id={`factor-desc-${factor.id}`}
                                      value={factor.description}
                                      onChange={(e) => handleUpdateCtqFactor(factor.id, 'description', e.target.value)}
                                      placeholder="What this factor measures..."
                                      className="border-[#E1DFDD] text-sm h-16"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`factor-mitigation-${factor.id}`} className="text-xs text-[#323130]">
                                      Mitigation <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                      id={`factor-mitigation-${factor.id}`}
                                      value={factor.mitigation}
                                      onChange={(e) => handleUpdateCtqFactor(factor.id, 'mitigation', e.target.value)}
                                      placeholder="How discrepancies will be detected and corrected..."
                                      className="border-[#E1DFDD] text-sm h-16"
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      </div>
                      
                      {/* Remove objective button */}
                      <div className="flex justify-end mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveObjective(objective.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Remove Objective
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
          
          {qmpData.qualityObjectives.length > 0 && (
            <div className="flex items-center text-sm text-[#605E5C] mt-2">
              <Info className="h-4 w-4 mr-2 text-[#0F6CBD]" />
              <span>Click on each objective to add or edit Critical-to-Quality factors.</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Validation Summary */}
      {qmpData.qualityObjectives.length === 0 && (
        <Card className="border-[#E1DFDD] border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-[#323130]">QMS Plan Incomplete</h4>
                <p className="text-sm text-[#605E5C]">
                  ICH E6(R3) requires a formal Quality Management System. Add at least one Quality Objective to establish a risk-based quality approach.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}