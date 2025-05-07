import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, FileCheck, AlertCircle, Search, CheckCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import CerTooltipWrapper from './CerTooltipWrapper';

// Evidence source types
const EVIDENCE_SOURCES = {
  FAERS: 'FDA Adverse Events',
  LITERATURE: 'Scientific Literature',
  CLINICAL_INVESTIGATION: 'Clinical Investigation',
  PMCF: 'Post-Market Clinical Follow-up',
  COMPLAINT: 'Complaint & Vigilance',
  NON_CLINICAL: 'Non-Clinical Study',
  EQUIVALENT_DEVICE: 'Equivalent Device Data'
};

// Standard GSPRs based on MDR
const GSPRs = [
  { id: '1', title: 'GSPR 1 - General safety and performance', description: 'Devices shall achieve their intended performance and be designed and manufactured in such a way that, during normal conditions of use, they are suitable for their intended purpose.' },
  { id: '2', title: 'GSPR 2 - Risk reduction', description: 'The manufacturer shall establish, implement, document and maintain a risk management system.' },
  { id: '3', title: 'GSPR 3 - Risk control measures', description: 'Devices shall be designed and manufactured in such a way that they remove or reduce risks as far as possible through safe design and manufacture.' },
  { id: '14', title: 'GSPR 14 - Clinical evaluation requirements', description: 'Demonstration of conformity with the general safety and performance requirements shall include a clinical evaluation in accordance with Article 61 of MDR.' },
  { id: '14.1', title: 'GSPR 14.1 - Clinical investigations', description: 'Clinical investigations shall be performed in accordance with MDR Annex XV on an equivalent or similar device to obtain data regarding safety and performance, including clinical benefits.' },
  { id: '14.2', title: 'GSPR 14.2 - Clinical evidence', description: 'Clinical evidence must be sufficient to demonstrate compliance with relevant GSPRs when the device is used as intended by the manufacturer.' },
  { id: '14.3', title: 'GSPR 14.3 - Clinical benefits', description: 'Demonstration of clinical benefit must be based on available clinical data relevant to the intended purpose, target population, and performance of the device.' },
  { id: '23', title: 'GSPR 23 - Information supplied by the manufacturer', description: 'Each device shall be accompanied by information needed to identify the device and manufacturer, safety and performance information for the user or patient, and information on risks, warnings, and precautions.' }
];

// Default initial mapping structure
const createInitialMapping = (selectedGSPRs = []) => {
  const mapping = {};
  selectedGSPRs.forEach(gsprId => {
    mapping[gsprId] = {
      evidenceSources: [],
      complianceStatement: '',
      gapsIdentified: false,
      gapStatement: '',
      nextSteps: '',
      complianceStatus: 'pending' // pending, partial, compliant
    };
  });
  return mapping;
};

export default function GSPRMappingPanel({ 
  deviceName = '',
  faersData = [],
  literatureData = [],
  sections = [],
  selectedGSPRs = ['1', '2', '3', '14', '14.2'],
  initialMapping = null,
  onUpdateMapping = () => {},
  onAddToReport = () => {}
}) {
  const [mapping, setMapping] = useState(initialMapping || createInitialMapping(selectedGSPRs));
  const [availableEvidenceCount, setAvailableEvidenceCount] = useState({
    FAERS: 0,
    LITERATURE: 0,
    CLINICAL_INVESTIGATION: 0,
    PMCF: 0,
    COMPLAINT: 0,
    NON_CLINICAL: 0,
    EQUIVALENT_DEVICE: 0
  });
  const [changes, setChanges] = useState(false);
  const [activeGspr, setActiveGspr] = useState(null);
  const [evidenceSearchTerm, setEvidenceSearchTerm] = useState('');
  const [availableEvidence, setAvailableEvidence] = useState([]);
  const [filteredEvidence, setFilteredEvidence] = useState([]);
  
  // Initialize or update the mapping when selectedGSPRs change
  useEffect(() => {
    if (!initialMapping) {
      // Only update if not provided with initial data
      setMapping(prevMapping => {
        const newMapping = { ...prevMapping };
        
        // Add new GSPRs
        selectedGSPRs.forEach(gsprId => {
          if (!newMapping[gsprId]) {
            newMapping[gsprId] = {
              evidenceSources: [],
              complianceStatement: '',
              gapsIdentified: false,
              gapStatement: '',
              nextSteps: '',
              complianceStatus: 'pending'
            };
          }
        });
        
        // Remove GSPRs that are no longer selected
        Object.keys(newMapping).forEach(gsprId => {
          if (!selectedGSPRs.includes(gsprId)) {
            delete newMapping[gsprId];
          }
        });
        
        return newMapping;
      });
    }
  }, [selectedGSPRs, initialMapping]);
  
  // Process available evidence
  useEffect(() => {
    // Process FAERS data
    const faersEvidence = faersData.map((item, index) => ({
      id: `faers-${index}`,
      type: 'FAERS',
      title: `${item.product_name || 'Product'} Adverse Event Report`,
      description: item.reaction_text || 'Adverse event report',
      date: item.report_date || new Date().toISOString().split('T')[0],
      severity: item.serious ? 'High' : 'Medium',
      sourceUrl: null,
      data: item
    }));
    
    // Process literature data
    const literatureEvidence = literatureData.map((item, index) => ({
      id: `lit-${index}`,
      type: 'LITERATURE',
      title: item.title || 'Scientific Publication',
      description: item.abstract ? `${item.abstract.substring(0, 150)}...` : 'Scientific literature',
      date: item.publication_date || new Date().toISOString().split('T')[0],
      severity: 'Medium',
      sourceUrl: item.url || null,
      data: item
    }));
    
    // Combine all evidence
    const allEvidence = [...faersEvidence, ...literatureEvidence];
    
    // Update evidence counts
    setAvailableEvidenceCount({
      FAERS: faersEvidence.length,
      LITERATURE: literatureEvidence.length,
      CLINICAL_INVESTIGATION: 0, // These would come from other data sources
      PMCF: 0,
      COMPLAINT: 0,
      NON_CLINICAL: 0,
      EQUIVALENT_DEVICE: 0
    });
    
    setAvailableEvidence(allEvidence);
    setFilteredEvidence(allEvidence);
  }, [faersData, literatureData]);
  
  // Filter evidence based on search term
  useEffect(() => {
    if (!evidenceSearchTerm.trim()) {
      setFilteredEvidence(availableEvidence);
      return;
    }
    
    const lowercaseTerm = evidenceSearchTerm.toLowerCase();
    const filtered = availableEvidence.filter(evidence => 
      evidence.title.toLowerCase().includes(lowercaseTerm) || 
      evidence.description.toLowerCase().includes(lowercaseTerm)
    );
    
    setFilteredEvidence(filtered);
  }, [evidenceSearchTerm, availableEvidence]);
  
  // Change handlers
  const handleAddEvidence = (gsprId, evidence) => {
    setMapping(prevMapping => {
      // Skip if this evidence is already linked to this GSPR
      if (prevMapping[gsprId].evidenceSources.some(e => e.id === evidence.id)) {
        return prevMapping;
      }
      
      const updatedMapping = {
        ...prevMapping,
        [gsprId]: {
          ...prevMapping[gsprId],
          evidenceSources: [...prevMapping[gsprId].evidenceSources, evidence]
        }
      };
      
      // Update compliance status based on evidence count
      if (updatedMapping[gsprId].evidenceSources.length > 0) {
        updatedMapping[gsprId].complianceStatus = updatedMapping[gsprId].gapsIdentified ? 'partial' : 'compliant';
      }
      
      return updatedMapping;
    });
    
    setChanges(true);
  };
  
  const handleRemoveEvidence = (gsprId, evidenceId) => {
    setMapping(prevMapping => {
      const updatedSources = prevMapping[gsprId].evidenceSources.filter(e => e.id !== evidenceId);
      
      const updatedMapping = {
        ...prevMapping,
        [gsprId]: {
          ...prevMapping[gsprId],
          evidenceSources: updatedSources
        }
      };
      
      // Update compliance status based on evidence count
      if (updatedSources.length === 0) {
        updatedMapping[gsprId].complianceStatus = 'pending';
      } else {
        updatedMapping[gsprId].complianceStatus = updatedMapping[gsprId].gapsIdentified ? 'partial' : 'compliant';
      }
      
      return updatedMapping;
    });
    
    setChanges(true);
  };
  
  const handleComplianceStatementChange = (gsprId, statement) => {
    setMapping(prevMapping => ({
      ...prevMapping,
      [gsprId]: {
        ...prevMapping[gsprId],
        complianceStatement: statement
      }
    }));
    
    setChanges(true);
  };
  
  const handleGapsIdentifiedChange = (gsprId, hasGaps) => {
    setMapping(prevMapping => {
      const updatedMapping = {
        ...prevMapping,
        [gsprId]: {
          ...prevMapping[gsprId],
          gapsIdentified: hasGaps
        }
      };
      
      // Update compliance status based on gaps and evidence
      if (updatedMapping[gsprId].evidenceSources.length > 0) {
        updatedMapping[gsprId].complianceStatus = hasGaps ? 'partial' : 'compliant';
      }
      
      return updatedMapping;
    });
    
    setChanges(true);
  };
  
  const handleGapStatementChange = (gsprId, statement) => {
    setMapping(prevMapping => ({
      ...prevMapping,
      [gsprId]: {
        ...prevMapping[gsprId],
        gapStatement: statement
      }
    }));
    
    setChanges(true);
  };
  
  const handleNextStepsChange = (gsprId, steps) => {
    setMapping(prevMapping => ({
      ...prevMapping,
      [gsprId]: {
        ...prevMapping[gsprId],
        nextSteps: steps
      }
    }));
    
    setChanges(true);
  };
  
  const handleComplianceStatusChange = (gsprId, status) => {
    setMapping(prevMapping => ({
      ...prevMapping,
      [gsprId]: {
        ...prevMapping[gsprId],
        complianceStatus: status
      }
    }));
    
    setChanges(true);
  };
  
  const handleSetActiveGspr = (gsprId) => {
    setActiveGspr(gsprId);
    setEvidenceSearchTerm('');
    setFilteredEvidence(availableEvidence);
  };
  
  const handleSave = () => {
    onUpdateMapping(mapping);
    setChanges(false);
  };
  
  const handleAddToReport = () => {
    // Convert mapping to CER section content
    const gsprEvaluationContent = generateGsprEvaluationContent(mapping);
    onAddToReport(gsprEvaluationContent);
    setChanges(false);
  };
  
  // Generate CER section content from the mapping data
  const generateGsprEvaluationContent = (mappingData) => {
    const content = {
      title: "GSPR Clinical Evaluation Mapping",
      type: "gspr-mapping",
      content: `
# GSPR Clinical Evaluation Mapping

## Overview
This section provides a systematic mapping between the General Safety and Performance Requirements (GSPRs) and the clinical evidence that supports compliance with each requirement.

${Object.entries(mappingData).map(([gsprId, data]) => {
  const gspr = GSPRs.find(g => g.id === gsprId) || { title: `GSPR ${gsprId}`, description: 'No description available' };
  
  return `
## ${gspr.title}
**Description:** ${gspr.description}

**Compliance Status:** ${data.complianceStatus === 'compliant' ? 'Compliant' : data.complianceStatus === 'partial' ? 'Partially Compliant' : 'Pending Evaluation'}

${data.complianceStatement ? `**Compliance Statement:**\n${data.complianceStatement}\n` : ''}

${data.evidenceSources.length > 0 ? `
### Supporting Evidence
${data.evidenceSources.map(evidence => `
- **${evidence.title}** (${EVIDENCE_SOURCES[evidence.type] || evidence.type})
  - Description: ${evidence.description}
  - Date: ${evidence.date}
  - Severity: ${evidence.severity}
${evidence.sourceUrl ? `  - Source: ${evidence.sourceUrl}` : ''}
`).join('')}
` : ''}

${data.gapsIdentified ? `
### Identified Gaps
${data.gapStatement || 'Gaps have been identified but not detailed.'}

${data.nextSteps ? `**Next Steps:**\n${data.nextSteps}` : ''}
` : ''}
`;
}).join('')}

## Summary
This mapping provides traceability from clinical evidence to regulatory requirements, demonstrating how the compiled clinical data supports the device's compliance with relevant GSPRs from MDR Annex I.
`,
      lastUpdated: new Date().toISOString()
    };
    
    return content;
  };
  
  // Get the GSPR details for a given ID
  const getGsprDetails = (gsprId) => {
    return GSPRs.find(g => g.id === gsprId) || { title: `GSPR ${gsprId}`, description: 'No description available' };
  };
  
  // Get status color for compliance state
  const getStatusColor = (status) => {
    switch(status) {
      case 'compliant':
        return 'bg-[#DFF6DD] text-[#107C10] border-[#107C10]';
      case 'partial':
        return 'bg-[#FFFCE5] text-[#986F0B] border-[#F2C811]';
      case 'pending':
      default:
        return 'bg-[#F5F5F5] text-[#616161] border-[#BDBDBD]';
    }
  };
  
  // Get status icon for compliance state
  const getStatusIcon = (status) => {
    switch(status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 mr-1.5" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 mr-1.5" />;
      case 'pending':
      default:
        return <Info className="h-4 w-4 mr-1.5" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#323130]">GSPR Requirements Mapping</h2>
          <p className="text-[#605E5C] mt-1">
            Map each selected GSPR to supporting clinical evidence and evaluate compliance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="border-[#0F6CBD] text-[#0F6CBD] hover:bg-[#EFF6FC]"
            onClick={handleSave}
            disabled={!changes}
          >
            Save Mapping
          </Button>
          <CerTooltipWrapper
            tooltipContent="Add this GSPR mapping as a dedicated section in your CER document. This creates a traceability matrix between regulatory requirements and clinical evidence."
            whyThisMatters="Clear traceability from GSPRs to supporting evidence is a key requirement for regulatory approval. It demonstrates how your clinical evaluation supports device conformity with essential requirements."
          >
            <Button
              className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white"
              onClick={handleAddToReport}
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Add to CER
            </Button>
          </CerTooltipWrapper>
        </div>
      </div>
      
      <div className="bg-[#F3F2F1] p-4 rounded border border-[#E1DFDD]">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-[#0F6CBD] mt-0.5" />
          <div>
            <h4 className="text-[#323130] font-medium">GSPR Mapping Guidance</h4>
            <p className="text-[#605E5C] text-sm">
              For each selected GSPR, link supporting clinical evidence from your data sources. Provide a compliance statement explaining how the evidence demonstrates conformity. Identify any gaps and define next steps where needed.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="border-[#E1DFDD] h-full">
            <CardHeader className="bg-[#FAFAFA] border-b border-[#E1DFDD]">
              <CardTitle className="text-lg text-[#323130]">Selected GSPRs</CardTitle>
              <CardDescription>Select a GSPR to map to clinical evidence</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px] overflow-y-auto">
                {selectedGSPRs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <Info className="h-10 w-10 text-[#0F6CBD] mb-2" />
                    <p className="text-[#605E5C]">No GSPRs have been selected for this evaluation</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-[#E1DFDD]">
                    {selectedGSPRs.map(gsprId => {
                      const gspr = getGsprDetails(gsprId);
                      const mappingData = mapping[gsprId] || { evidenceSources: [], complianceStatus: 'pending' };
                      const isActive = activeGspr === gsprId;
                      
                      return (
                        <li 
                          key={gsprId}
                          className={`p-4 cursor-pointer hover:bg-[#F3F2F1] ${isActive ? 'bg-[#EFF6FC] border-l-4 border-[#0F6CBD]' : ''}`}
                          onClick={() => handleSetActiveGspr(gsprId)}
                        >
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-[#323130]">{gspr.title}</span>
                            <Badge className={`text-xs ${getStatusColor(mappingData.complianceStatus)}`}>
                              {getStatusIcon(mappingData.complianceStatus)}
                              <span>
                                {mappingData.complianceStatus === 'compliant' ? 'Compliant' : 
                                 mappingData.complianceStatus === 'partial' ? 'Partial' : 'Pending'}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-[#605E5C] text-sm line-clamp-2">{gspr.description}</p>
                          <div className="flex items-center mt-2 text-xs text-[#605E5C]">
                            <FileText className="h-3 w-3 mr-1" />
                            <span>{mappingData.evidenceSources.length} evidence items linked</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {activeGspr ? (
            <Card className="border-[#E1DFDD]">
              <CardHeader className="bg-[#FAFAFA] border-b border-[#E1DFDD]">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-[#323130]">
                      {getGsprDetails(activeGspr).title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {getGsprDetails(activeGspr).description}
                    </CardDescription>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(mapping[activeGspr]?.complianceStatus || 'pending')}`}>
                    {getStatusIcon(mapping[activeGspr]?.complianceStatus || 'pending')}
                    <span>
                      {mapping[activeGspr]?.complianceStatus === 'compliant' ? 'Compliant' : 
                       mapping[activeGspr]?.complianceStatus === 'partial' ? 'Partial' : 'Pending'}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-[#323130] font-medium">Compliance Statement</h3>
                  <Textarea
                    value={mapping[activeGspr]?.complianceStatement || ''}
                    onChange={(e) => handleComplianceStatementChange(activeGspr, e.target.value)}
                    placeholder="Explain how clinical evidence demonstrates compliance with this GSPR..."
                    className="border-[#E1DFDD] h-24"
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-[#323130] font-medium">Compliance Status</h3>
                  <Select
                    value={mapping[activeGspr]?.complianceStatus || 'pending'}
                    onValueChange={(value) => handleComplianceStatusChange(activeGspr, value)}
                  >
                    <SelectTrigger className="border-[#E1DFDD] w-full md:w-1/3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Evaluation</SelectItem>
                      <SelectItem value="partial">Partially Compliant</SelectItem>
                      <SelectItem value="compliant">Fully Compliant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gaps-identified"
                    checked={mapping[activeGspr]?.gapsIdentified || false}
                    onCheckedChange={(checked) => handleGapsIdentifiedChange(activeGspr, checked)}
                  />
                  <label
                    htmlFor="gaps-identified"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Evidence gaps identified
                  </label>
                </div>
                
                {mapping[activeGspr]?.gapsIdentified && (
                  <div className="space-y-4 mt-4 p-4 border border-[#F2C811] bg-[#FFFCE5] rounded">
                    <div className="space-y-2">
                      <h3 className="text-[#323130] font-medium">Gap Description</h3>
                      <Textarea
                        value={mapping[activeGspr]?.gapStatement || ''}
                        onChange={(e) => handleGapStatementChange(activeGspr, e.target.value)}
                        placeholder="Describe the identified gaps in evidence..."
                        className="border-[#E1DFDD] h-20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-[#323130] font-medium">Next Steps</h3>
                      <Textarea
                        value={mapping[activeGspr]?.nextSteps || ''}
                        onChange={(e) => handleNextStepsChange(activeGspr, e.target.value)}
                        placeholder="Define actions to address gaps..."
                        className="border-[#E1DFDD] h-20"
                      />
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[#323130] font-medium">Linked Evidence</h3>
                    <Badge variant="outline" className="bg-[#EFF6FC] text-[#0F6CBD] border-[#0F6CBD]">
                      {mapping[activeGspr]?.evidenceSources.length || 0} items
                    </Badge>
                  </div>
                  
                  {mapping[activeGspr]?.evidenceSources.length > 0 ? (
                    <div className="border border-[#E1DFDD] rounded mb-4 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-[#FAFAFA]">
                          <TableRow>
                            <TableHead className="w-[40%]">Title</TableHead>
                            <TableHead className="w-[25%]">Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mapping[activeGspr].evidenceSources.map(evidence => (
                            <TableRow key={evidence.id}>
                              <TableCell className="font-medium truncate max-w-[200px]">
                                {evidence.title}
                              </TableCell>
                              <TableCell>{EVIDENCE_SOURCES[evidence.type] || evidence.type}</TableCell>
                              <TableCell>{evidence.date}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleRemoveEvidence(activeGspr, evidence.id)}
                                >
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border border-dashed border-[#E1DFDD] rounded p-6 mb-4">
                      <p className="text-[#605E5C] text-center mb-2">No evidence linked to this GSPR yet</p>
                      <p className="text-[#605E5C] text-sm text-center">
                        Use the evidence selector below to link supporting data
                      </p>
                    </div>
                  )}
                  
                  <Accordion type="single" collapsible className="border rounded border-[#E1DFDD]">
                    <AccordionItem value="evidence-selector">
                      <AccordionTrigger className="px-4 py-2 text-[#323130] hover:no-underline">
                        <div className="flex items-center">
                          <Search className="h-4 w-4 mr-2" />
                          <span>Add Supporting Evidence</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 pb-1 px-4">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex space-x-3">
                              <Badge variant="outline" className="bg-[#EFF6FC] text-[#0F6CBD]">
                                FAERS: {availableEvidenceCount.FAERS}
                              </Badge>
                              <Badge variant="outline" className="bg-[#EFF6FC] text-[#0F6CBD]">
                                Literature: {availableEvidenceCount.LITERATURE}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#605E5C]" />
                            <Input
                              className="border-[#E1DFDD] pl-10"
                              placeholder="Search available evidence..."
                              value={evidenceSearchTerm}
                              onChange={(e) => setEvidenceSearchTerm(e.target.value)}
                            />
                          </div>
                          
                          <div className="overflow-y-auto max-h-[300px] border border-[#E1DFDD] rounded">
                            {filteredEvidence.length > 0 ? (
                              <Table>
                                <TableHeader className="bg-[#FAFAFA]">
                                  <TableRow>
                                    <TableHead className="w-[40%]">Title</TableHead>
                                    <TableHead className="w-[25%]">Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {filteredEvidence.map(evidence => (
                                    <TableRow key={evidence.id}>
                                      <TableCell className="font-medium truncate max-w-[200px]">
                                        {evidence.title}
                                      </TableCell>
                                      <TableCell>{EVIDENCE_SOURCES[evidence.type] || evidence.type}</TableCell>
                                      <TableCell>{evidence.date}</TableCell>
                                      <TableCell className="text-right">
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="h-8 px-2 text-[#0F6CBD] hover:text-[#115EA3] hover:bg-[#EFF6FC]"
                                          onClick={() => handleAddEvidence(activeGspr, evidence)}
                                          disabled={mapping[activeGspr]?.evidenceSources.some(e => e.id === evidence.id)}
                                        >
                                          {mapping[activeGspr]?.evidenceSources.some(e => e.id === evidence.id) 
                                            ? 'Added' 
                                            : 'Add'}
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-6">
                                <p className="text-[#605E5C] text-center mb-2">No evidence found</p>
                                <p className="text-[#605E5C] text-sm text-center">
                                  Try adjusting your search or retrieving more data
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </CardContent>
              <CardFooter className="border-t border-[#E1DFDD] bg-[#FAFAFA] px-6 py-4">
                <div className="flex justify-end space-x-2 w-full">
                  <Button
                    variant="outline"
                    className="border-[#0F6CBD] text-[#0F6CBD] hover:bg-[#EFF6FC]"
                    onClick={handleSave}
                    disabled={!changes}
                  >
                    Save Mapping
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-[#E1DFDD] h-full">
              <CardContent className="flex flex-col items-center justify-center h-[500px] text-center p-6">
                <Info className="h-12 w-12 text-[#0F6CBD] mb-4" />
                <h3 className="text-lg font-medium text-[#323130] mb-2">Select a GSPR to Map</h3>
                <p className="text-[#605E5C] max-w-md">
                  Choose a GSPR from the list to map clinical evidence and evaluate its compliance status
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}