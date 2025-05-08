import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Icons
import { 
  FileDown, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  FileText, 
  File, 
  FileIcon,
  FileOutput,
  Code,
  FileBadge,
  FileDigit,
  Table,
  ClipboardCheck,
  Settings,
  Printer
} from 'lucide-react';

/**
 * Export Module Component
 * 
 * This component handles:
 * 1. Generating Word (.docx) documents
 * 2. Generating PDF with ICH formatting
 * 3. Generating eCTD XML shell
 * 4. Saving drafts in workspace library
 */
const ExportModule = ({ 
  documentId, 
  documentTitle, 
  documentType = "cer", 
  framework = "mdr",
  lastModified,
  isComplete = false,
  canExport = true
}) => {
  const [exportFormat, setExportFormat] = useState('docx');
  const [selectedFramework, setSelectedFramework] = useState(framework || 'mdr');
  const [exportOptions, setExportOptions] = useState({
    includeTableOfContents: true,
    includeAppendices: true,
    includeMetadata: true,
    includeCoverPage: true,
    addWatermark: false,
    watermarkText: 'DRAFT'
  });
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Format options
  const formatOptions = [
    { id: 'docx', label: 'Microsoft Word (.docx)', icon: <FileText className="h-4 w-4" /> },
    { id: 'pdf', label: 'PDF Document', icon: <FileDown className="h-4 w-4" /> },
    { id: 'xml', label: 'eCTD XML Shell', icon: <Code className="h-4 w-4" /> },
  ];
  
  // Framework options
  const frameworkOptions = [
    { id: 'mdr', label: 'EU MDR', description: 'European Union Medical Device Regulation' },
    { id: 'fda', label: 'US FDA', description: 'US Food and Drug Administration' },
    { id: 'ukca', label: 'UKCA', description: 'UK Conformity Assessed' },
    { id: 'health_canada', label: 'Health Canada', description: 'Canadian medical device regulations' },
    { id: 'ich', label: 'ICH', description: 'International Council for Harmonisation' }
  ];

  // Export templates
  const templates = {
    'mdr': [
      { 
        id: 'mdr_standard', 
        name: 'EU MDR Standard', 
        description: 'MEDDEV 2.7/1 Rev 4 compliant template for EU MDR submissions with emphasis on GSPR' 
      },
      { 
        id: 'mdr_extended', 
        name: 'EU MDR Extended', 
        description: 'Extended template with additional sections for high-risk devices and combination products' 
      },
      {
        id: 'mdr_pmcf',
        name: 'EU MDR with PMCF',
        description: 'Template with enhanced Post-Market Clinical Follow-up (PMCF) sections per MDCG 2020-7'
      }
    ],
    'fda': [
      { 
        id: 'fda_510k', 
        name: 'FDA 510(k) Summary', 
        description: 'Template for FDA 510(k) submissions with substantial equivalence focus' 
      },
      { 
        id: 'fda_pma', 
        name: 'FDA PMA Clinical Summary', 
        description: 'Template for FDA PMA submissions with pivotal clinical study emphasis' 
      },
      {
        id: 'fda_de_novo',
        name: 'FDA De Novo',
        description: 'Template for FDA De Novo submissions with emphasis on risk-benefit analysis'
      }
    ],
    'ukca': [
      {
        id: 'ukca_standard',
        name: 'UKCA Standard',
        description: 'UK Conformity Assessed standard template aligned with UK MDR requirements'
      },
      {
        id: 'ukca_extended',
        name: 'UKCA Extended',
        description: 'Extended template for UK market submissions with UK-specific clinical evidence requirements'
      }
    ],
    'health_canada': [
      { 
        id: 'hc_standard', 
        name: 'Health Canada Standard', 
        description: 'Standard template for Health Canada submissions aligned with Canadian Medical Devices Regulations' 
      },
      {
        id: 'hc_licensing',
        name: 'Health Canada Licensing',
        description: 'Template focused on Medical Device Licensing requirements for Class III and IV devices'
      }
    ],
    'ich': [
      { 
        id: 'ich_standard', 
        name: 'ICH Standard', 
        description: 'Template following ICH guidelines for international harmonization' 
      }
    ]
  };

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (data) => {
      setIsExporting(true);
      setExportProgress(0);
      
      // Setup interval to simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 500);
      
      // Call API
      const response = await apiRequest('POST', `/api/cer/documents/${documentId}/export`, data, {
        responseType: 'blob'
      });
      
      // Clear interval and set to 100%
      clearInterval(progressInterval);
      setExportProgress(100);
      
      return response;
    },
    onSuccess: (response) => {
      // Create download
      const blob = new Blob([response.data], { 
        type: getContentType(exportFormat) 
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generateFileName(documentTitle, exportFormat);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Export complete',
        description: `Your document has been exported as ${exportFormat.toUpperCase()}`,
      });
      
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
    },
    onError: (error) => {
      console.error('Error exporting document:', error);
      
      toast({
        title: 'Export failed',
        description: 'There was a problem exporting your document. Please try again.',
        variant: 'destructive'
      });
      
      setIsExporting(false);
      setExportProgress(0);
    }
  });

  // Get content type based on format
  const getContentType = (format) => {
    switch (format) {
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'pdf':
        return 'application/pdf';
      case 'xml':
        return 'application/xml';
      default:
        return 'application/octet-stream';
    }
  };

  // Generate file name
  const generateFileName = (title, format) => {
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').substring(0, 14);
    return `${sanitizedTitle}_${timestamp}.${format}`;
  };

  // Handle export option change
  const handleOptionChange = (option, value) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  // Handle watermark text change
  const handleWatermarkTextChange = (value) => {
    if (!value) value = 'DRAFT';
    setExportOptions(prev => ({
      ...prev,
      watermarkText: value
    }));
  };

  // Handle export
  const handleExport = () => {
    // Get selected template
    const templateId = document.querySelector('input[name="template"]:checked')?.value || 
                      templates[selectedFramework]?.[0]?.id;
    
    exportMutation.mutate({
      format: exportFormat,
      options: exportOptions,
      templateId,
      framework: selectedFramework
    });
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold flex items-center mb-4">
        <FileOutput className="mr-2 h-5 w-5 text-blue-600" />
        Export Module
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Export Format */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Export Format</CardTitle>
              <CardDescription>
                Choose the output format for your document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup 
                value={exportFormat} 
                onValueChange={setExportFormat}
                className="space-y-3"
              >
                {formatOptions.map((format) => (
                  <div key={format.id} className="flex items-start space-x-2">
                    <RadioGroupItem id={`format-${format.id}`} value={format.id} />
                    <div>
                      <Label 
                        htmlFor={`format-${format.id}`} 
                        className="font-medium flex items-center"
                      >
                        {React.cloneElement(format.icon, { className: "h-4 w-4 mr-2 text-blue-600" })}
                        {format.label}
                      </Label>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {format.id === 'docx' && 'Editable document for Microsoft Word'}
                        {format.id === 'pdf' && 'Fixed-layout document with proper formatting'}
                        {format.id === 'xml' && 'XML structure for eCTD submissions'}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
              
              <Separator />
              
              <div className="mb-4">
                <Label className="mb-2 block">Regulatory Framework</Label>
                <Select 
                  value={selectedFramework} 
                  onValueChange={setSelectedFramework}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select regulatory framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworkOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-gray-500">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the appropriate regulatory framework for your target market
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <Label className="mb-3 block">Template</Label>
                <RadioGroup 
                  name="template" 
                  defaultValue={templates[selectedFramework]?.[0]?.id}
                  className="space-y-3"
                >
                  {templates[selectedFramework]?.map((template) => (
                    <div key={template.id} className="flex items-start space-x-2">
                      <RadioGroupItem id={`template-${template.id}`} value={template.id} />
                      <div>
                        <Label 
                          htmlFor={`template-${template.id}`} 
                          className="font-medium"
                        >
                          {template.name}
                        </Label>
                        <p className="text-sm text-gray-500 mt-0.5">{template.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Middle Panel: Options */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Settings className="h-4 w-4 mr-2 text-blue-600" />
                Export Options
              </CardTitle>
              <CardDescription>
                Configure the export settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="toc" className="flex items-center">
                    <Table className="h-4 w-4 mr-2 text-gray-500" />
                    Table of Contents
                  </Label>
                  <Switch 
                    id="toc" 
                    checked={exportOptions.includeTableOfContents}
                    onCheckedChange={(checked) => handleOptionChange('includeTableOfContents', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="appendices" className="flex items-center">
                    <ClipboardCheck className="h-4 w-4 mr-2 text-gray-500" />
                    Include Appendices
                  </Label>
                  <Switch 
                    id="appendices" 
                    checked={exportOptions.includeAppendices}
                    onCheckedChange={(checked) => handleOptionChange('includeAppendices', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="metadata" className="flex items-center">
                    <FileBadge className="h-4 w-4 mr-2 text-gray-500" />
                    Include Metadata
                  </Label>
                  <Switch 
                    id="metadata" 
                    checked={exportOptions.includeMetadata}
                    onCheckedChange={(checked) => handleOptionChange('includeMetadata', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="coverPage" className="flex items-center">
                    <FileDigit className="h-4 w-4 mr-2 text-gray-500" />
                    Include Cover Page
                  </Label>
                  <Switch 
                    id="coverPage" 
                    checked={exportOptions.includeCoverPage}
                    onCheckedChange={(checked) => handleOptionChange('includeCoverPage', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="watermark" className="flex items-center">
                    <Printer className="h-4 w-4 mr-2 text-gray-500" />
                    Add Watermark
                  </Label>
                  <Switch 
                    id="watermark" 
                    checked={exportOptions.addWatermark}
                    onCheckedChange={(checked) => handleOptionChange('addWatermark', checked)}
                  />
                </div>
                
                {exportOptions.addWatermark && (
                  <div>
                    <Label className="text-sm mb-1 block">Watermark Text</Label>
                    <Select 
                      value={exportOptions.watermarkText} 
                      onValueChange={handleWatermarkTextChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select watermark" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">DRAFT</SelectItem>
                        <SelectItem value="CONFIDENTIAL">CONFIDENTIAL</SelectItem>
                        <SelectItem value="FOR REVIEW">FOR REVIEW</SelectItem>
                        <SelectItem value="INTERNAL USE">INTERNAL USE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <Button 
                  className="w-full"
                  disabled={isExporting || !canExport}
                  onClick={handleExport}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export Document
                    </>
                  )}
                </Button>
                
                {!canExport && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Document must be complete before exporting
                    </AlertDescription>
                  </Alert>
                )}
                
                {isExporting && (
                  <div className="mt-4">
                    <Label className="text-sm mb-1 block">Export Progress</Label>
                    <Progress value={exportProgress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {exportProgress === 100 ? 'Complete!' : 'Processing document...'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Panel: Preview */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Export Preview</CardTitle>
              <CardDescription>
                Preview of export settings and document info
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Document Info */}
              <div>
                <h3 className="text-sm font-medium mb-2">Document Information</h3>
                <div className="bg-gray-50 rounded-md p-3 border">
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Title:</span>
                      <span className="font-medium">{documentTitle}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{documentType.toUpperCase()}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Framework:</span>
                      <span className="font-medium">
                        {frameworkOptions.find(option => option.id === selectedFramework)?.label || framework.toUpperCase()}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Last Modified:</span>
                      <span className="font-medium">
                        {new Date(lastModified).toLocaleDateString()}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${isComplete ? 'text-green-600' : 'text-amber-600'}`}>
                        {isComplete ? 'Complete' : 'Draft'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Export Settings Summary */}
              <div>
                <h3 className="text-sm font-medium mb-2">Export Settings</h3>
                <div className="bg-blue-50 rounded-md p-3 border border-blue-100">
                  <ul className="space-y-1 text-sm text-blue-900">
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-2 text-blue-700" />
                      Format: {formatOptions.find(f => f.id === exportFormat)?.label}
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-2 text-blue-700" />
                      Template: {templates[selectedFramework]?.find(t => t.id === document.querySelector('input[name="template"]:checked')?.value)?.name || templates[selectedFramework]?.[0]?.name}
                    </li>
                    {exportOptions.includeTableOfContents && (
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-blue-700" />
                        Includes Table of Contents
                      </li>
                    )}
                    {exportOptions.includeAppendices && (
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-blue-700" />
                        Includes Appendices
                      </li>
                    )}
                    {exportOptions.addWatermark && (
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-blue-700" />
                        Watermark: {exportOptions.watermarkText}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              
              {/* Document Preview */}
              <div className="border rounded-md flex items-center justify-center bg-gray-50 h-[180px]">
                <div className="text-center">
                  {exportFormat === 'docx' && (
                    <FileText className="h-16 w-16 text-blue-200 mx-auto mb-2" />
                  )}
                  {exportFormat === 'pdf' && (
                    <FileDown className="h-16 w-16 text-red-200 mx-auto mb-2" />
                  )}
                  {exportFormat === 'xml' && (
                    <Code className="h-16 w-16 text-green-200 mx-auto mb-2" />
                  )}
                  <p className="text-sm text-gray-500">
                    {documentTitle}.{exportFormat}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Preview not available
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExportModule;