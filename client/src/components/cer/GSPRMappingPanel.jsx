import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, FileCheck, AlertCircle, Search, CheckCircle, FileText, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
            tooltipPosition="bottom"
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
      
      <Tabs defaultValue="mapping" className="w-full">
        <TabsList className="bg-white border-b border-gray-200 rounded-none w-full flex justify-start gap-2 mb-4">
          <TabsTrigger value="mapping" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161]">
            GSPR Mapping
          </TabsTrigger>
          <TabsTrigger value="evidence" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161]">
            Evidence Library
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="mapping">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white p-4 rounded border border-[#E1DFDD]">
                <h3 className="text-[#323130] font-medium mb-3">Selected GSPRs</h3>
                <div className="h-[450px] overflow-y-auto">
                  {selectedGSPRs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <Info className="h-6 w-6 text-[#0F6CBD] mb-2" />
                      <p className="text-[#605E5C] text-sm">No GSPRs selected</p>
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
                            className={`p-3 cursor-pointer hover:bg-[#F3F2F1] ${isActive ? 'bg-[#EFF6FC] border-l-2 border-[#0F6CBD]' : ''}`}
                            onClick={() => handleSetActiveGspr(gsprId)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm text-[#323130]">{gspr.title}</span>
                              <Badge className={`text-xs ${getStatusColor(mappingData.complianceStatus)}`}>
                                {getStatusIcon(mappingData.complianceStatus)}
                                <span>
                                  {mappingData.complianceStatus === 'compliant' ? 'Compliant' : 
                                   mappingData.complianceStatus === 'partial' ? 'Partial' : 'Pending'}
                                </span>
                              </Badge>
                            </div>
                            <div className="flex items-center mt-1 text-xs text-[#605E5C]">
                              <FileText className="h-3 w-3 mr-1" />
                              <span>{mappingData.evidenceSources.length} evidence items</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              {activeGspr ? (
                <div className="bg-white p-5 rounded border border-[#E1DFDD]">
                  <div className="flex justify-between items-start mb-4 border-b border-[#E1DFDD] pb-4">
                    <div>
                      <h3 className="text-lg font-medium text-[#323130]">
                        {getGsprDetails(activeGspr).title}
                      </h3>
                      <p className="text-sm text-[#605E5C] mt-1">
                        {getGsprDetails(activeGspr).description}
                      </p>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(mapping[activeGspr]?.complianceStatus || 'pending')}`}>
                      {getStatusIcon(mapping[activeGspr]?.complianceStatus || 'pending')}
                      <span>
                        {mapping[activeGspr]?.complianceStatus === 'compliant' ? 'Compliant' : 
                         mapping[activeGspr]?.complianceStatus === 'partial' ? 'Partial' : 'Pending'}
                      </span>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-[#323130] mb-2">Compliance Statement</h4>
                      <Textarea
                        value={mapping[activeGspr]?.complianceStatement || ''}
                        onChange={(e) => handleComplianceStatementChange(activeGspr, e.target.value)}
                        placeholder="Explain how evidence demonstrates compliance..."
                        className="border-[#E1DFDD] h-20 text-sm"
                      />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-[#323130] mb-2">Compliance Status</h4>
                      <Select
                        value={mapping[activeGspr]?.complianceStatus || 'pending'}
                        onValueChange={(value) => handleComplianceStatusChange(activeGspr, value)}
                      >
                        <SelectTrigger className="border-[#E1DFDD] mb-2">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending Evaluation</SelectItem>
                          <SelectItem value="partial">Partially Compliant</SelectItem>
                          <SelectItem value="compliant">Fully Compliant</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                          id="gaps-identified"
                          checked={mapping[activeGspr]?.gapsIdentified || false}
                          onCheckedChange={(checked) => handleGapsIdentifiedChange(activeGspr, checked)}
                        />
                        <label
                          htmlFor="gaps-identified"
                          className="text-xs font-medium leading-none"
                        >
                          Evidence gaps identified
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {mapping[activeGspr]?.gapsIdentified && (
                    <div className="p-3 border border-[#F2C811] bg-[#FFFCE5] rounded mb-4">
                      <h4 className="text-sm font-medium text-[#323130] mb-2">Gap Assessment</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Textarea
                          value={mapping[activeGspr]?.gapStatement || ''}
                          onChange={(e) => handleGapStatementChange(activeGspr, e.target.value)}
                          placeholder="Describe identified gaps..."
                          className="border-[#E1DFDD] h-16 text-sm"
                        />
                        <Textarea
                          value={mapping[activeGspr]?.nextSteps || ''}
                          onChange={(e) => handleNextStepsChange(activeGspr, e.target.value)}
                          placeholder="Define actions to address gaps..."
                          className="border-[#E1DFDD] h-16 text-sm"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-[#323130]">Linked Evidence</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-xs text-[#0F6CBD] hover:bg-[#EFF6FC]"
                        onClick={() => {}}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Evidence
                      </Button>
                    </div>
                    
                    {mapping[activeGspr]?.evidenceSources && mapping[activeGspr]?.evidenceSources.length > 0 ? (
                      <div className="border border-[#E1DFDD] rounded overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-[#FAFAFA] text-[#605E5C]">
                            <tr>
                              <th className="text-left px-3 py-2 font-medium">Title</th>
                              <th className="text-left px-3 py-2 font-medium w-24">Type</th>
                              <th className="text-right px-3 py-2 font-medium w-16"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E1DFDD]">
                            {mapping[activeGspr].evidenceSources.slice(0, 3).map(evidence => (
                              <tr key={evidence.id} className="hover:bg-[#F3F2F1]">
                                <td className="px-3 py-2 truncate">{evidence.title}</td>
                                <td className="px-3 py-2">{EVIDENCE_SOURCES[evidence.type] || evidence.type}</td>
                                <td className="px-3 py-2 text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-7 px-2 text-[#A19F9D] hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleRemoveEvidence(activeGspr, evidence.id)}
                                  >
                                    Remove
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {mapping[activeGspr].evidenceSources.length > 3 && (
                          <div className="px-3 py-2 text-center text-xs text-[#0F6CBD] hover:bg-[#EFF6FC] cursor-pointer">
                            Show {mapping[activeGspr].evidenceSources.length - 3} more items
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center border border-dashed border-[#E1DFDD] rounded p-4">
                        <p className="text-[#605E5C] text-sm">No evidence linked to this requirement yet</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end border-t border-[#E1DFDD] pt-4">
                    <Button
                      variant="outline"
                      className="border-[#0F6CBD] text-[#0F6CBD] hover:bg-[#EFF6FC]"
                      onClick={handleSave}
                      disabled={!changes}
                    >
                      Save Mapping
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded border border-[#E1DFDD] flex flex-col items-center justify-center h-[450px] text-center p-6">
                  <Info className="h-8 w-8 text-[#0F6CBD] mb-3" />
                  <h3 className="text-md font-medium text-[#323130] mb-1">Select a GSPR to Map</h3>
                  <p className="text-sm text-[#605E5C] max-w-md">
                    Choose a requirement from the list to map clinical evidence
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="evidence">
          <div className="bg-white p-5 rounded border border-[#E1DFDD]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-[#323130]">Evidence Library</h3>
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
                placeholder="Search evidence by title, type, or date..."
                value={evidenceSearchTerm}
                onChange={(e) => setEvidenceSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="border border-[#E1DFDD] rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#FAFAFA] text-[#605E5C]">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Title</th>
                    <th className="text-left px-4 py-3 font-medium w-32">Type</th>
                    <th className="text-left px-4 py-3 font-medium w-32">Date</th>
                    <th className="text-right px-4 py-3 font-medium w-32">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1DFDD]">
                  {filteredEvidence.length > 0 ? (
                    filteredEvidence.map(evidence => (
                      <tr key={evidence.id} className="hover:bg-[#F3F2F1]">
                        <td className="px-4 py-3 truncate max-w-[300px]">{evidence.title}</td>
                        <td className="px-4 py-3">{EVIDENCE_SOURCES[evidence.type] || evidence.type}</td>
                        <td className="px-4 py-3">{evidence.date}</td>
                        <td className="px-4 py-3 text-right">
                          {activeGspr && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 px-3 text-[#0F6CBD] hover:text-[#115EA3] hover:bg-[#EFF6FC]"
                              onClick={() => handleAddEvidence(activeGspr, evidence)}
                              disabled={mapping[activeGspr]?.evidenceSources?.some(e => e.id === evidence.id)}
                            >
                              {mapping[activeGspr]?.evidenceSources?.some(e => e.id === evidence.id) 
                                ? 'Added' 
                                : 'Add'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-[#605E5C]">
                        No evidence found. Try adjusting your search or retrieving more data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}