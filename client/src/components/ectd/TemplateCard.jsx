/**
 * Template Card Component for eCTD Module
 * 
 * This component renders an individual template card with actions
 * for viewing, editing, and using templates.
 */
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Edit, FileText, Trash, Clock, Tag, Eye, History, Download } from 'lucide-react';

export default function TemplateCard({ template, onUse, onEdit, onDelete }) {
  const [showPreview, setShowPreview] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  
  const handleUse = () => {
    if (onUse) onUse(template);
  };
  
  const handleEdit = () => {
    if (onEdit) onEdit(template);
  };
  
  const handleDelete = () => {
    if (onDelete) onDelete(template);
  };
  
  const getMockContent = () => {
    // This would be replaced with actual template content in a real implementation
    switch(template.category) {
      case 'm1':
        return `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Cover Letter Template</h1>
          <p style="margin-bottom: 10px;">[Company Letterhead]</p>
          <p style="margin-bottom: 10px;">[Date]</p>
          <p style="margin-bottom: 10px;">Food and Drug Administration<br>
          Center for Drug Evaluation and Research<br>
          Central Document Room<br>
          5901-B Ammendale Road<br>
          Beltsville, MD 20705-1266</p>
          <p style="margin-bottom: 10px;"><strong>Subject:</strong> [Application Type] [Application Number]<br>
          [Product Name] ([Generic Name])<br>
          [Submission Type]</p>
          <p style="margin-bottom: 10px;"><strong>Dear Sir/Madam:</strong></p>
          <p style="margin-bottom: 10px;">[Company Name] is providing this submission to [purpose of submission].</p>
          <p style="margin-bottom: 10px;">[Additional details regarding the submission]</p>
          <p style="margin-bottom: 10px;">This submission is being sent through the Electronic Submissions Gateway (ESG).</p>
          <p style="margin-bottom: 10px;">If you have any questions regarding this submission, please contact [Contact Name] at [Phone Number] or by email at [Email Address].</p>
          <p style="margin-bottom: 10px;">Sincerely,</p>
          <p style="margin-bottom: 10px;">[Signature]<br>
          [Printed Name]<br>
          [Title]<br>
          [Company Name]</p>
        `;
      case 'm2':
        return `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Quality Overall Summary</h1>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">2.3.S Drug Substance</h2>
          <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">2.3.S.1 General Information</h3>
          <p style="margin-bottom: 10px;">[Provide the nomenclature, molecular structure, and general properties of the drug substance]</p>
          <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">2.3.S.2 Manufacture</h3>
          <p style="margin-bottom: 10px;">[Describe the manufacturer(s), manufacturing process and process controls, controls of critical steps and intermediates, process validation and/or evaluation]</p>
          <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">2.3.S.3 Characterisation</h3>
          <p style="margin-bottom: 10px;">[Describe the elucidation of structure and other characteristics, impurities]</p>
          <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">2.3.S.4 Control of Drug Substance</h3>
          <p style="margin-bottom: 10px;">[Provide the specification, analytical procedures, validation of analytical procedures, batch analyses, justification of specification]</p>
          <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">2.3.S.5 Reference Standards or Materials</h3>
          <p style="margin-bottom: 10px;">[Describe the reference standards or materials used for testing of the drug substance]</p>
          <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">2.3.S.6 Container Closure System</h3>
          <p style="margin-bottom: 10px;">[Describe the container closure system(s) used for storage and transportation of the drug substance]</p>
          <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">2.3.S.7 Stability</h3>
          <p style="margin-bottom: 10px;">[Summarize the stability studies and results, conclusions regarding storage conditions and retest date or shelf-life, stability commitment]</p>
        `;
      case 'm3':
        return `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Drug Substance Specifications</h1>
          <p style="margin-bottom: 10px;"><strong>3.2.S.4.1 Specification</strong></p>
          <p style="margin-bottom: 10px;">The drug substance specification is provided in Table 1.</p>
          <p style="margin-bottom: 10px;"><strong>Table 1: Drug Substance Specification</strong></p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Test</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Method</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Acceptance Criteria</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Description</td>
                <td style="border: 1px solid #ddd; padding: 8px;">Visual</td>
                <td style="border: 1px solid #ddd; padding: 8px;">[Description]</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Identification</td>
                <td style="border: 1px solid #ddd; padding: 8px;">IR</td>
                <td style="border: 1px solid #ddd; padding: 8px;">Conforms to reference spectrum</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Assay</td>
                <td style="border: 1px solid #ddd; padding: 8px;">HPLC</td>
                <td style="border: 1px solid #ddd; padding: 8px;">98.0 - 102.0%</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Impurities</td>
                <td style="border: 1px solid #ddd; padding: 8px;">HPLC</td>
                <td style="border: 1px solid #ddd; padding: 8px;">
                  Individual unknown: NMT 0.10%<br>
                  Total impurities: NMT 0.5%
                </td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Residual Solvents</td>
                <td style="border: 1px solid #ddd; padding: 8px;">GC</td>
                <td style="border: 1px solid #ddd; padding: 8px;">Per ICH Q3C</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Water Content</td>
                <td style="border: 1px solid #ddd; padding: 8px;">Karl Fischer</td>
                <td style="border: 1px solid #ddd; padding: 8px;">NMT 0.5%</td>
              </tr>
            </tbody>
          </table>
          <p style="margin-bottom: 10px;"><strong>3.2.S.4.2 Analytical Procedures</strong></p>
          <p style="margin-bottom: 10px;">The analytical procedures used for testing the drug substance are summarized below.</p>
        `;
      case 'm4':
        return `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Toxicology Summary</h1>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">4.2.3.2 Repeat-Dose Toxicity</h2>
          <p style="margin-bottom: 10px;"><strong>Study Title:</strong> [Title of Study]</p>
          <p style="margin-bottom: 10px;"><strong>Study No.:</strong> [Study Number]</p>
          <p style="margin-bottom: 10px;"><strong>Testing Facility:</strong> [Name of Testing Facility]</p>
          <p style="margin-bottom: 10px;"><strong>GLP Compliance:</strong> This study was conducted in compliance with Good Laboratory Practice Regulations.</p>
          <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">Methods</h3>
          <p style="margin-bottom: 10px;"><strong>Species/Strain:</strong> [Species and Strain]</p>
          <p style="margin-bottom: 10px;"><strong>Number/Sex/Group:</strong> [Number] males and [Number] females per group</p>
          <p style="margin-bottom: 10px;"><strong>Route of Administration:</strong> [Route]</p>
          <p style="margin-bottom: 10px;"><strong>Dose Levels:</strong> [Dose levels]</p>
          <p style="margin-bottom: 10px;"><strong>Duration of Dosing:</strong> [Duration]</p>
          <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">Results</h3>
          <p style="margin-bottom: 10px;"><strong>Mortality:</strong> [Mortality observations]</p>
          <p style="margin-bottom: 10px;"><strong>Clinical Signs:</strong> [Clinical sign observations]</p>
          <p style="margin-bottom: 10px;"><strong>Body Weight:</strong> [Body weight observations]</p>
          <p style="margin-bottom: 10px;"><strong>Food Consumption:</strong> [Food consumption observations]</p>
          <p style="margin-bottom: 10px;"><strong>Clinical Pathology:</strong> [Clinical pathology observations]</p>
          <p style="margin-bottom: 10px;"><strong>Organ Weights:</strong> [Organ weight observations]</p>
          <p style="margin-bottom: 10px;"><strong>Gross Pathology:</strong> [Gross pathology observations]</p>
          <p style="margin-bottom: 10px;"><strong>Histopathology:</strong> [Histopathology observations]</p>
          <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">Conclusion</h3>
          <p style="margin-bottom: 10px;">[Conclusions regarding the toxicity profile of the test article and the no-observed-adverse-effect level (NOAEL)]</p>
        `;
      case 'm5':
        return `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Clinical Study Report Synopsis</h1>
          <p style="margin-bottom: 10px;"><strong>Protocol Number:</strong> [Protocol Number]</p>
          <p style="margin-bottom: 10px;"><strong>Study Title:</strong> [Study Title]</p>
          <p style="margin-bottom: 10px;"><strong>Phase:</strong> [Phase]</p>
          <p style="margin-bottom: 10px;"><strong>Study Design:</strong> [Study Design]</p>
          <p style="margin-bottom: 10px;"><strong>Study Centers:</strong> [Number and Location of Study Centers]</p>
          <p style="margin-bottom: 10px;"><strong>Study Period:</strong> [Date of First Enrollment] to [Date of Last Subject Completed]</p>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Objectives</h2>
          <p style="margin-bottom: 10px;"><strong>Primary Objective:</strong> [Primary Objective]</p>
          <p style="margin-bottom: 10px;"><strong>Secondary Objectives:</strong> [Secondary Objectives]</p>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Methodology</h2>
          <p style="margin-bottom: 10px;">[Brief description of the study methodology]</p>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Number of Subjects</h2>
          <p style="margin-bottom: 10px;"><strong>Planned:</strong> [Number]</p>
          <p style="margin-bottom: 10px;"><strong>Enrolled:</strong> [Number]</p>
          <p style="margin-bottom: 10px;"><strong>Completed:</strong> [Number]</p>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Diagnosis and Main Criteria for Inclusion</h2>
          <p style="margin-bottom: 10px;">[Key inclusion and exclusion criteria]</p>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Test Product, Dose, Mode of Administration</h2>
          <p style="margin-bottom: 10px;">[Description of test product, dose, and mode of administration]</p>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Duration of Treatment</h2>
          <p style="margin-bottom: 10px;">[Duration of treatment]</p>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Reference Therapy</h2>
          <p style="margin-bottom: 10px;">[Description of reference therapy, if applicable]</p>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Criteria for Evaluation</h2>
          <p style="margin-bottom: 10px;"><strong>Efficacy:</strong> [Efficacy endpoints]</p>
          <p style="margin-bottom: 10px;"><strong>Safety:</strong> [Safety endpoints]</p>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Statistical Methods</h2>
          <p style="margin-bottom: 10px;">[Brief description of statistical methods]</p>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Summary of Results</h2>
          <p style="margin-bottom: 10px;"><strong>Efficacy Results:</strong> [Summary of efficacy results]</p>
          <p style="margin-bottom: 10px;"><strong>Safety Results:</strong> [Summary of safety results]</p>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Conclusions</h2>
          <p style="margin-bottom: 10px;">[Overall conclusions]</p>
        `;
      default:
        return '<p>Template content preview not available.</p>';
    }
  };
  
  // Mock version history
  const versionHistory = [
    { version: 3, date: '2025-04-20', user: 'John Smith', changes: 'Updated formatting to meet FDA eCTD requirements' },
    { version: 2, date: '2025-03-15', user: 'Maria Johnson', changes: 'Added section for regulatory references' },
    { version: 1, date: '2025-02-01', user: 'Robert Chen', changes: 'Initial template creation' }
  ];
  
  return (
    <>
      <Card className="h-full flex flex-col shadow-sm hover:shadow transition-shadow duration-200">
        <CardContent className="p-4 flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium truncate mr-2">{template.name}</h3>
            <Badge variant={getCategoryVariant(template.category)}>
              {template.category.toUpperCase()}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.description}</p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">+{template.tags.length - 3}</Badge>
            )}
          </div>
          
          <div className="text-xs text-gray-500 flex justify-between mt-auto">
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{formatDate(template.lastModified)}</span>
            </div>
            <div className="flex items-center">
              <FileText size={14} className="mr-1" />
              <span>{template.useCount} uses</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center p-0 border-t">
          <div className="flex divide-x w-full">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 rounded-none h-10"
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preview Template</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 rounded-none h-10"
                    onClick={() => setShowVersionHistory(true)}
                  >
                    <History size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Version History</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 rounded-none h-10"
                    onClick={handleUse}
                  >
                    <Check size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Use Template</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 rounded-none h-10"
                    onClick={handleEdit}
                  >
                    <Edit size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Template</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 rounded-none h-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleDelete}
                  >
                    <Trash size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Template</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardFooter>
      </Card>
      
      {/* Template Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{template.name}</span>
              <Badge variant={getCategoryVariant(template.category)}>
                {template.category.toUpperCase()}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="border rounded-md p-4 bg-white">
            <ScrollArea className="h-[400px]">
              <div dangerouslySetInnerHTML={{ __html: getMockContent() }} />
            </ScrollArea>
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div className="text-sm text-gray-500 flex items-center">
              <Clock size={16} className="mr-1" />
              <span>Last updated: {formatDate(template.lastModified)}</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={() => setShowPreview(false)}
              >
                Close
              </Button>
              <Button 
                size="sm" 
                className="flex items-center"
                onClick={() => {
                  handleUse();
                  setShowPreview(false);
                }}
              >
                <Check size={16} className="mr-1" />
                Use Template
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={() => {
                  window.alert('Template would be downloaded in a real implementation');
                }}
              >
                <Download size={16} className="mr-1" />
                Download
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
          </DialogHeader>
          
          <div className="border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 grid grid-cols-12 gap-4">
              <div className="col-span-2">Version</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-3">Modified By</div>
              <div className="col-span-4">Changes</div>
            </div>
            
            <div className="divide-y">
              {versionHistory.map((version, index) => (
                <div key={index} className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-gray-50">
                  <div className="col-span-2 font-medium">v{version.version}</div>
                  <div className="col-span-3 text-sm">{version.date}</div>
                  <div className="col-span-3 text-sm">{version.user}</div>
                  <div className="col-span-4 text-sm">{version.changes}</div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowVersionHistory(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(date);
}

// Helper function to get appropriate badge color variant based on CTD module
function getCategoryVariant(category) {
  switch(category) {
    case 'm1': return 'blue';
    case 'm2': return 'green';
    case 'm3': return 'orange';
    case 'm4': return 'purple';
    case 'm5': return 'red';
    default: return 'default';
  }
}