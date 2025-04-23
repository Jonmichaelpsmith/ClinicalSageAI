import React, { useState, useRef } from 'react';
import { useToast } from '../hooks/use-toast';
import { 
  Beaker, FileText, Download, PlusCircle, MinusCircle, Loader2, 
  FlaskConical, Dna, BarChart3, Upload, Zap, BookCopy, 
  FileCheck, GitBranch, Microscope, ChevronRight, HelpCircle,
  ArrowRight, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import { useLumenAssistant } from '../components/assistant';

// Tabs and sections for the generated blueprint
const TABS = [
  { id: 'input', label: 'Molecular Input', icon: Beaker },
  { id: 'drug-substance', label: 'Drug Substance (S)', icon: FlaskConical },
  { id: 'drug-product', label: 'Drug Product (P)', icon: FileText },
  { id: 'visualizations', label: 'Visualizations', icon: BarChart3 },
  { id: 'export', label: 'Export & Format', icon: FileCheck },
  { id: 'citations', label: 'Regulatory Citations', icon: BookCopy }
];

const SUBSTANCE_SECTIONS = [
  { id: 's.1', label: 'S.1 General Information' },
  { id: 's.2', label: 'S.2 Manufacture' },
  { id: 's.3', label: 'S.3 Characterisation' },
  { id: 's.4', label: 'S.4 Control of Drug Substance' },
  { id: 's.5', label: 'S.5 Reference Standards' },
  { id: 's.6', label: 'S.6 Container Closure System' },
  { id: 's.7', label: 'S.7 Stability' }
];

const PRODUCT_SECTIONS = [
  { id: 'p.1', label: 'P.1 Description and Composition' },
  { id: 'p.2', label: 'P.2 Pharmaceutical Development' },
  { id: 'p.3', label: 'P.3 Manufacture' },
  { id: 'p.4', label: 'P.4 Control of Excipients' },
  { id: 'p.5', label: 'P.5 Control of Drug Product' },
  { id: 'p.6', label: 'P.6 Reference Standards' },
  { id: 'p.7', label: 'P.7 Container Closure System' },
  { id: 'p.8', label: 'P.8 Stability' }
];

const EXPORT_FORMATS = [
  { id: 'word', label: 'Microsoft Word (.docx)', icon: FileText },
  { id: 'pdf', label: 'PDF Document (.pdf)', icon: FileText },
  { id: 'ectd', label: 'eCTD Format (.xml + PDF)', icon: GitBranch },
  { id: 'json', label: 'JSON Data (.json)', icon: BarChart3 }
];

const TEMPLATE_TYPES = [
  { id: 'fda', label: 'FDA (US)' },
  { id: 'ema', label: 'EMA (EU)' },
  { id: 'pmda', label: 'PMDA (Japan)' },
  { id: 'nmpa', label: 'NMPA (China)' },
  { id: 'hc', label: 'Health Canada' },
  { id: 'global', label: 'Global (ICH)' }
];

export default function CMCBlueprintGenerator() {
  const { toast } = useToast();
  const { openAssistant } = useLumenAssistant();
  const fileInputRef = useRef(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('input');
  const [activeSection, setActiveSection] = useState({
    'drug-substance': 's.1',
    'drug-product': 'p.1',
    'export': 'word',
    'citations': 'recent'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFormulation, setShowFormulation] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('global');
  const [exportFormat, setExportFormat] = useState('word');
  const [includeReferences, setIncludeReferences] = useState(true);
  const [includeVisualizations, setIncludeVisualizations] = useState(true);
  const [isLoadingStructure, setIsLoadingStructure] = useState(false);
  
  // Form state
  const [molecularData, setMolecularData] = useState({
    moleculeName: '',
    molecularFormula: '',
    smiles: '',
    inchi: '',
    molecularWeight: '',
    synthesisPathway: '',
    analyticalMethods: [],
    formulation: {
      dosageForm: 'tablet',
      routeOfAdministration: 'oral',
      ingredients: [
        { name: '', function: '', amount: '' }
      ]
    },
    processDevelopment: {
      flowDiagram: null,
      criticalSteps: [],
      impurities: [],
      controlStrategy: ''
    },
    analyticalData: {
      spectra: [],
      purity: '',
      solubility: '',
      stability: ''
    }
  });
  
  // Results state
  const [blueprintResults, setBlueprintResults] = useState(null);
  const [processDiagram, setProcessDiagram] = useState(null);
  const [regulatoryCitations, setRegulatoryCitations] = useState([]);
  const [exportStatus, setExportStatus] = useState({ inProgress: false, progress: 0, format: null });
  const [riskAnalysisResults, setRiskAnalysisResults] = useState(null);
  
  // Handlers
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  const handleSectionChange = (tabId, sectionId) => {
    setActiveSection({
      ...activeSection,
      [tabId]: sectionId
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMolecularData({
      ...molecularData,
      [name]: value
    });
  };
  
  const handleAnalyticalMethodAdd = () => {
    setMolecularData({
      ...molecularData,
      analyticalMethods: [...(molecularData.analyticalMethods || []), '']
    });
  };
  
  const handleAnalyticalMethodChange = (index, value) => {
    const updatedMethods = [...(molecularData.analyticalMethods || [])];
    updatedMethods[index] = value;
    setMolecularData({
      ...molecularData,
      analyticalMethods: updatedMethods
    });
  };
  
  const handleAnalyticalMethodRemove = (index) => {
    const updatedMethods = [...(molecularData.analyticalMethods || [])];
    updatedMethods.splice(index, 1);
    setMolecularData({
      ...molecularData,
      analyticalMethods: updatedMethods
    });
  };
  
  const handleFormulationChange = (e) => {
    const { name, value } = e.target;
    setMolecularData({
      ...molecularData,
      formulation: {
        ...molecularData.formulation,
        [name]: value
      }
    });
  };
  
  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...molecularData.formulation.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    };
    setMolecularData({
      ...molecularData,
      formulation: {
        ...molecularData.formulation,
        ingredients: updatedIngredients
      }
    });
  };
  
  const handleAddIngredient = () => {
    setMolecularData({
      ...molecularData,
      formulation: {
        ...molecularData.formulation,
        ingredients: [
          ...molecularData.formulation.ingredients,
          { name: '', function: '', amount: '' }
        ]
      }
    });
  };
  
  const handleRemoveIngredient = (index) => {
    const updatedIngredients = [...molecularData.formulation.ingredients];
    updatedIngredients.splice(index, 1);
    setMolecularData({
      ...molecularData,
      formulation: {
        ...molecularData.formulation,
        ingredients: updatedIngredients
      }
    });
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoadingStructure(true);
    
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', file);
    
    // Use FileReader to display the file contents if it's an image
    if (file.type.includes('image')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProcessDiagram(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
    
    // Send the file to the server for processing
    fetch('/api/cmc-blueprint-generator/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to upload file');
      return response.json();
    })
    .then(data => {
      // Update the molecular data with extracted information
      setMolecularData(prevData => ({
        ...prevData,
        ...data.extractedData
      }));
      
      toast({
        title: 'File Processed',
        description: 'Successfully extracted molecular structure information.',
      });
    })
    .catch(error => {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to process the uploaded file.',
        variant: 'destructive'
      });
    })
    .finally(() => {
      setIsLoadingStructure(false);
    });
  };
  
  const handleGenerateBlueprint = async () => {
    // Validate required fields
    if (!molecularData.moleculeName || !molecularData.molecularFormula) {
      toast({
        title: 'Missing Information',
        description: 'Please provide at least the molecule name and formula.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Add regional template and formatting options to the request
      const requestData = {
        ...molecularData,
        options: {
          template: selectedTemplate,
          includeReferences,
          includeVisualizations
        }
      };
      
      const response = await fetch('/api/cmc-blueprint-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate CMC blueprint');
      }
      
      const data = await response.json();
      setBlueprintResults(data);
      
      // Fetch regulatory citations based on the generated content
      fetchRegulatoryCitations();
      
      // Generate process diagram if needed
      if (includeVisualizations && molecularData.synthesisPathway) {
        generateProcessDiagram();
      }
      
      // Switch to the drug substance tab to show results
      setActiveTab('drug-substance');
      
      toast({
        title: 'Blueprint Generated',
        description: `CMC blueprint for ${molecularData.moleculeName} has been successfully generated.`,
      });
      
      // Also run an automated risk analysis
      performRiskAnalysis();
    } catch (error) {
      console.error('Error generating CMC blueprint:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate CMC blueprint. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const fetchRegulatoryCitations = async () => {
    try {
      const response = await fetch('/api/cmc-blueprint-generator/citations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          moleculeType: determineMoleculeType(),
          regulatoryRegion: selectedTemplate,
          sections: ['s.1', 's.2', 's.3', 's.4', 'p.1', 'p.2']
        })
      });
      
      if (!response.ok) throw new Error('Failed to fetch regulatory citations');
      
      const data = await response.json();
      setRegulatoryCitations(data.citations);
    } catch (error) {
      console.error('Error fetching citations:', error);
      toast({
        title: 'Citations Error',
        description: 'Failed to fetch regulatory citations.',
        variant: 'destructive'
      });
    }
  };
  
  const determineMoleculeType = () => {
    // Simple logic to determine if it's a small molecule, biological, etc.
    // Would be more sophisticated in a real implementation
    const { molecularFormula, molecularWeight } = molecularData;
    
    if (!molecularWeight) return 'small-molecule';
    
    const weight = parseFloat(molecularWeight);
    if (isNaN(weight)) return 'small-molecule';
    
    if (weight > 5000) return 'biological';
    if (weight > 1000) return 'peptide';
    return 'small-molecule';
  };
  
  const generateProcessDiagram = async () => {
    try {
      const response = await fetch('/api/cmc-blueprint-generator/diagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          moleculeName: molecularData.moleculeName,
          molecularFormula: molecularData.molecularFormula,
          synthesisPathway: molecularData.synthesisPathway
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate process diagram');
      
      const data = await response.json();
      setProcessDiagram(data.url);
    } catch (error) {
      console.error('Error generating diagram:', error);
      toast({
        title: 'Diagram Generation Error',
        description: 'Failed to generate process diagram.',
        variant: 'destructive'
      });
    }
  };
  
  const performRiskAnalysis = async () => {
    try {
      const response = await fetch('/api/cmc-blueprint-generator/risk-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          molecularData,
          targetMarkets: [selectedTemplate === 'global' ? 'fda' : selectedTemplate]
        })
      });
      
      if (!response.ok) throw new Error('Failed to perform risk analysis');
      
      const data = await response.json();
      setRiskAnalysisResults(data);
    } catch (error) {
      console.error('Error performing risk analysis:', error);
      // Not showing a toast here to avoid overwhelming the user
    }
  };
  
  const handleExportDocument = async (format) => {
    setExportStatus({
      inProgress: true,
      progress: 0,
      format
    });
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportStatus(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 500);
      
      const response = await fetch('/api/cmc-blueprint-generator/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format,
          template: selectedTemplate,
          moleculeName: molecularData.moleculeName,
          blueprintId: blueprintResults?.metadata?.generatedAt
        })
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) throw new Error('Failed to export document');
      
      // For the actual file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${molecularData.moleculeName}-CMC-Module3.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      setExportStatus({
        inProgress: false,
        progress: 100,
        format: null
      });
      
      toast({
        title: 'Export Complete',
        description: `Successfully exported CMC blueprint as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Error exporting document:', error);
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export document.',
        variant: 'destructive'
      });
      
      setExportStatus({
        inProgress: false,
        progress: 0,
        format: null
      });
    }
  };
  
  const handleAskLumen = () => {
    openAssistant(`I need help with generating a CMC blueprint for ${molecularData.moleculeName || 'my molecule'}. Can you provide guidance on the required information for ICH CTD Module 3 sections?`);
  };
  
  // Render the content based on which tab is active
  const renderContent = () => {
    switch (activeTab) {
      case 'input':
        return renderFormSection();
      
      case 'drug-substance':
        return renderDrugSubstanceSection();
      
      case 'drug-product':
        return renderDrugProductSection();
      
      case 'visualizations':
        return renderVisualizationsSection();
      
      case 'export':
        return renderExportSection();
      
      case 'citations':
        return renderCitationsSection();
      
      default:
        return renderFormSection();
    }
  };
  
  // Render the Drug Substance section with subsections
  const renderDrugSubstanceSection = () => {
    const currentSection = activeSection['drug-substance'];
    
    if (!blueprintResults) {
      return (
        <div className="p-10 text-center">
          <div className="p-8 rounded-lg border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Content Generated Yet</h3>
            <p className="text-gray-500 mb-4">
              Use the Molecular Input tab to enter molecule details and generate your blueprint.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('input')}
              className="px-4 py-2 bg-regulatory-600 text-white rounded-md hover:bg-regulatory-700"
            >
              Go to Input Form
            </button>
          </div>
        </div>
      );
    }
    
    const sectionContent = blueprintResults?.drugSubstance?.[currentSection];
    
    return (
      <div className="space-y-6">
        <div className="flex space-x-1 overflow-x-auto border-b border-gray-200">
          {SUBSTANCE_SECTIONS.map(section => (
            <button
              key={section.id}
              onClick={() => handleSectionChange('drug-substance', section.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                currentSection === section.id
                  ? 'text-regulatory-700 border-b-2 border-regulatory-500'
                  : 'text-gray-600 hover:text-regulatory-600'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
        
        <div className="bg-white border rounded-md shadow-sm">
          {sectionContent ? (
            <div className="p-6 space-y-6">
              <h2 className="text-2xl font-bold text-regulatory-800">{sectionContent.title}</h2>
              
              <div className="space-y-4">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sectionContent.content }} />
                
                {sectionContent.subsections?.map((subsection, index) => (
                  <div key={index} className="mt-6">
                    <h3 className="text-xl font-bold text-regulatory-700 mb-2">{subsection.title}</h3>
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: subsection.content }} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">No content available for this section.</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render the Drug Product section with subsections
  const renderDrugProductSection = () => {
    const currentSection = activeSection['drug-product'];
    
    if (!blueprintResults) {
      return (
        <div className="p-10 text-center">
          <div className="p-8 rounded-lg border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Content Generated Yet</h3>
            <p className="text-gray-500 mb-4">
              Use the Molecular Input tab to enter molecule details and generate your blueprint.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('input')}
              className="px-4 py-2 bg-regulatory-600 text-white rounded-md hover:bg-regulatory-700"
            >
              Go to Input Form
            </button>
          </div>
        </div>
      );
    }
    
    const sectionContent = blueprintResults?.drugProduct?.[currentSection];
    
    return (
      <div className="space-y-6">
        <div className="flex space-x-1 overflow-x-auto border-b border-gray-200">
          {PRODUCT_SECTIONS.map(section => (
            <button
              key={section.id}
              onClick={() => handleSectionChange('drug-product', section.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                currentSection === section.id
                  ? 'text-regulatory-700 border-b-2 border-regulatory-500'
                  : 'text-gray-600 hover:text-regulatory-600'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
        
        <div className="bg-white border rounded-md shadow-sm">
          {sectionContent ? (
            <div className="p-6 space-y-6">
              <h2 className="text-2xl font-bold text-regulatory-800">{sectionContent.title}</h2>
              
              <div className="space-y-4">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sectionContent.content }} />
                
                {sectionContent.subsections?.map((subsection, index) => (
                  <div key={index} className="mt-6">
                    <h3 className="text-xl font-bold text-regulatory-700 mb-2">{subsection.title}</h3>
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: subsection.content }} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">No content available for this section.</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render the Visualizations section
  const renderVisualizationsSection = () => {
    if (!blueprintResults) {
      return (
        <div className="p-10 text-center">
          <div className="p-8 rounded-lg border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Content Generated Yet</h3>
            <p className="text-gray-500 mb-4">
              Use the Molecular Input tab to enter molecule details and generate your blueprint.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('input')}
              className="px-4 py-2 bg-regulatory-600 text-white rounded-md hover:bg-regulatory-700"
            >
              Go to Input Form
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-regulatory-800">Visualizations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Process Flow Diagram */}
          <div className="bg-white border rounded-md shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b px-4 py-3">
              <h3 className="text-lg font-medium text-regulatory-700">Manufacturing Process Flow</h3>
            </div>
            <div className="p-4">
              {processDiagram ? (
                <div className="flex flex-col items-center">
                  <img 
                    src={processDiagram} 
                    alt="Manufacturing Process Flow Diagram" 
                    className="max-w-full rounded-md border shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => window.open(processDiagram, '_blank')}
                    className="mt-4 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm flex items-center"
                  >
                    <Download size={16} className="mr-2" />
                    Download Image
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-gray-500 mb-4">No process diagram available.</p>
                  {molecularData.synthesisPathway && (
                    <button
                      type="button"
                      onClick={generateProcessDiagram}
                      className="px-4 py-2 bg-regulatory-600 text-white rounded-md hover:bg-regulatory-700 flex items-center"
                    >
                      <Zap size={16} className="mr-2" />
                      Generate Diagram
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Risk Analysis Results */}
          <div className="bg-white border rounded-md shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b px-4 py-3">
              <h3 className="text-lg font-medium text-regulatory-700">Risk Analysis</h3>
            </div>
            <div className="p-4">
              {riskAnalysisResults ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                      riskAnalysisResults.overallRiskScore < 3 ? 'bg-green-500' :
                      riskAnalysisResults.overallRiskScore < 7 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}>
                      {riskAnalysisResults.overallRiskScore}/10
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Overall Risk Score</h4>
                      <p className="text-gray-600">{riskAnalysisResults.riskSummary}</p>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold">Key Risk Factors:</h4>
                  <ul className="space-y-2">
                    {riskAnalysisResults.riskFactors?.map((factor, index) => (
                      <li key={index} className="flex items-start">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 ${
                          factor.severity === 'high' ? 'bg-red-100 text-red-600' :
                          factor.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {factor.severity === 'high' ? '!' : factor.severity === 'medium' ? '⚠' : '✓'}
                        </span>
                        <span>{factor.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-gray-500 mb-4">No risk analysis available.</p>
                  <button
                    type="button"
                    onClick={performRiskAnalysis}
                    className="px-4 py-2 bg-regulatory-600 text-white rounded-md hover:bg-regulatory-700 flex items-center"
                  >
                    <AlertCircle size={16} className="mr-2" />
                    Perform Risk Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the Export section
  const renderExportSection = () => {
    if (!blueprintResults) {
      return (
        <div className="p-10 text-center">
          <div className="p-8 rounded-lg border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Content Generated Yet</h3>
            <p className="text-gray-500 mb-4">
              Use the Molecular Input tab to enter molecule details and generate your blueprint.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('input')}
              className="px-4 py-2 bg-regulatory-600 text-white rounded-md hover:bg-regulatory-700"
            >
              Go to Input Form
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-regulatory-800">Export & Format</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-regulatory-700">Export Options</h3>
            <div className="bg-white border rounded-md shadow-sm divide-y">
              {EXPORT_FORMATS.map(format => (
                <button
                  key={format.id}
                  onClick={() => handleExportDocument(format.id)}
                  disabled={exportStatus.inProgress}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <format.icon className="h-6 w-6 mr-4 text-regulatory-600" />
                    <span>{format.label}</span>
                  </div>
                  {exportStatus.inProgress && exportStatus.format === format.id ? (
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className="bg-regulatory-600 h-2.5 rounded-full"
                          style={{ width: `${exportStatus.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{exportStatus.progress}%</span>
                    </div>
                  ) : (
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-regulatory-700">Document Metadata</h3>
            <div className="bg-white border rounded-md shadow-sm p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none"
                  placeholder={`Module 3 CTD for ${molecularData.moleculeName}`}
                  defaultValue={`Module 3 CTD for ${molecularData.moleculeName}`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Document Version
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none"
                  placeholder="1.0"
                  defaultValue="1.0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Author/Organization
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none"
                  placeholder="Your Organization"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Target Authority
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none"
                >
                  {TEMPLATE_TYPES.map(template => (
                    <option key={template.id} value={template.id}>{template.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the Citations section
  const renderCitationsSection = () => {
    if (!blueprintResults) {
      return (
        <div className="p-10 text-center">
          <div className="p-8 rounded-lg border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Content Generated Yet</h3>
            <p className="text-gray-500 mb-4">
              Use the Molecular Input tab to enter molecule details and generate your blueprint.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('input')}
              className="px-4 py-2 bg-regulatory-600 text-white rounded-md hover:bg-regulatory-700"
            >
              Go to Input Form
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-regulatory-800">Regulatory Citations & References</h2>
        
        <div className="bg-white border rounded-md shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-regulatory-700">Citations</h3>
              <button
                type="button"
                onClick={fetchRegulatoryCitations}
                className="px-3 py-1.5 border border-regulatory-600 text-regulatory-600 rounded-md hover:bg-regulatory-50 text-sm flex items-center"
              >
                <RefreshCw size={14} className="mr-1" />
                Refresh
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {regulatoryCitations.length > 0 ? (
              <div className="space-y-6">
                {regulatoryCitations.map((citation, index) => (
                  <div key={index} className="p-4 border rounded-md">
                    <h4 className="font-semibold text-regulatory-700 mb-1">{citation.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{citation.source} • {citation.date}</p>
                    <p className="mb-2">{citation.text}</p>
                    <div className="flex items-center text-sm">
                      <span className="bg-regulatory-100 text-regulatory-800 px-2 py-0.5 rounded mr-2">{citation.section}</span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded">{citation.authority}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No citations available.</p>
                <button
                  type="button"
                  onClick={fetchRegulatoryCitations}
                  className="px-4 py-2 bg-regulatory-600 text-white rounded-md hover:bg-regulatory-700"
                >
                  Generate Citations
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Form input section
  const renderFormSection = () => {
    return (
      <div className="space-y-8">
        {/* Top Options Bar */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-wrap gap-4 items-center">
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Import Structure:</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center text-sm"
            >
              <Upload size={16} className="mr-2" />
              {isLoadingStructure ? 'Processing...' : 'Upload File'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".mol,.sdf,.pdb,.cif,.smi,.png,.jpg,.jpeg"
            />
          </div>
          
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Template:</span>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm"
            >
              {TEMPLATE_TYPES.map(template => (
                <option key={template.id} value={template.id}>{template.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeReferences}
                onChange={(e) => setIncludeReferences(e.target.checked)}
                className="form-checkbox rounded border-gray-300 text-regulatory-600 focus:ring-regulatory-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include References</span>
            </label>
          </div>
          
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeVisualizations}
                onChange={(e) => setIncludeVisualizations(e.target.checked)}
                className="form-checkbox rounded border-gray-300 text-regulatory-600 focus:ring-regulatory-500"
              />
              <span className="ml-2 text-sm text-gray-700">Auto-generate Diagrams</span>
            </label>
          </div>
          
          <div className="flex items-center ml-auto">
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center text-sm"
            >
              {showAdvancedOptions ? 'Hide Advanced' : 'Advanced Options'}
              <ChevronRight size={16} className={`ml-1 transition-transform duration-200 ${showAdvancedOptions ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Advanced Options Panel */}
        {showAdvancedOptions && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Advanced Generation Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Optimization Level</label>
                <select
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm"
                  defaultValue="standard"
                >
                  <option value="draft">Draft (Faster)</option>
                  <option value="standard">Standard</option>
                  <option value="enhanced">Enhanced (More Detail)</option>
                  <option value="maximum">Maximum (Slower)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Target Phase</label>
                <select
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm"
                  defaultValue="ind"
                >
                  <option value="preclinical">Preclinical</option>
                  <option value="ind">IND</option>
                  <option value="phase1">Phase 1</option>
                  <option value="phase2">Phase 2</option>
                  <option value="phase3">Phase 3</option>
                  <option value="nda">NDA/BLA</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Regulatory Strategy</label>
                <select
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm"
                  defaultValue="standard"
                >
                  <option value="accelerated">Accelerated/Fast Track</option>
                  <option value="standard">Standard</option>
                  <option value="orphan">Orphan Drug</option>
                  <option value="breakthrough">Breakthrough Therapy</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Dna className="mr-2" />
              Basic Molecular Information
            </h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Molecule Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="moleculeName"
                value={molecularData.moleculeName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none"
                placeholder="e.g., Atorvastatin"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Molecular Formula <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="molecularFormula"
                value={molecularData.molecularFormula}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none"
                placeholder="e.g., C₃₃H₃₅FN₂O₅"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Molecular Weight (g/mol)
              </label>
              <input
                type="text"
                name="molecularWeight"
                value={molecularData.molecularWeight}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none"
                placeholder="e.g., 558.64"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Beaker className="mr-2" />
              Chemical Identifiers
            </h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                SMILES Notation
              </label>
              <textarea
                name="smiles"
                value={molecularData.smiles}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none"
                placeholder="e.g., CC(C)c1c(C(=O)Nc2ccccc2)c(c(c2ccccc12)c1ccc(F)cc1)O[C@@H]1CCOC1"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                InChI Key
              </label>
              <textarea
                name="inchi"
                value={molecularData.inchi}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none"
                placeholder="e.g., InChI=1S/C33H35FN2O5/c1-..."
                rows={2}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center">
            <FlaskConical className="mr-2" />
            Manufacturing & Analytical Information
          </h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Synthesis Pathway (optional)
            </label>
            <textarea
              name="synthesisPathway"
              value={molecularData.synthesisPathway}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none"
              placeholder="Describe the synthetic route used to manufacture the API..."
              rows={4}
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                Analytical Methods (optional)
              </label>
              <button
                type="button"
                onClick={handleAnalyticalMethodAdd}
                className="text-sm text-regulatory-600 flex items-center"
              >
                <PlusCircle size={16} className="mr-1" />
                Add Method
              </button>
            </div>
            
            {(molecularData.analyticalMethods || []).map((method, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={method}
                  onChange={(e) => handleAnalyticalMethodChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none"
                  placeholder="e.g., HPLC, NMR, UV Spectroscopy"
                />
                <button
                  type="button"
                  onClick={() => handleAnalyticalMethodRemove(index)}
                  className="ml-2 text-red-500"
                >
                  <MinusCircle size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center">
              <FileText className="mr-2" />
              Drug Product Formulation (optional)
            </h2>
            <button
              type="button"
              onClick={() => setShowFormulation(!showFormulation)}
              className="text-sm text-regulatory-600"
            >
              {showFormulation ? 'Hide Formulation' : 'Show Formulation'}
            </button>
          </div>
          
          {showFormulation && (
            <div className="space-y-4 border p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Dosage Form
                  </label>
                  <select
                    name="dosageForm"
                    value={molecularData.formulation.dosageForm}
                    onChange={handleFormulationChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none"
                  >
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="solution">Solution</option>
                    <option value="suspension">Suspension</option>
                    <option value="injection">Injection</option>
                    <option value="powder">Powder</option>
                    <option value="cream">Cream/Ointment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Route of Administration
                  </label>
                  <select
                    name="routeOfAdministration"
                    value={molecularData.formulation.routeOfAdministration}
                    onChange={handleFormulationChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none"
                  >
                    <option value="oral">Oral</option>
                    <option value="intravenous">Intravenous (IV)</option>
                    <option value="intramuscular">Intramuscular (IM)</option>
                    <option value="subcutaneous">Subcutaneous (SC)</option>
                    <option value="topical">Topical</option>
                    <option value="inhalation">Inhalation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">
                    Ingredients
                  </label>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="text-sm text-regulatory-600 flex items-center"
                  >
                    <PlusCircle size={16} className="mr-1" />
                    Add Ingredient
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 mb-1">
                    <div className="text-xs font-medium text-gray-500">Name</div>
                    <div className="text-xs font-medium text-gray-500">Function</div>
                    <div className="text-xs font-medium text-gray-500">Amount</div>
                  </div>
                  
                  {molecularData.formulation.ingredients.map((ingredient, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 items-center">
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        className="px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none text-sm"
                        placeholder="Ingredient name"
                      />
                      <input
                        type="text"
                        value={ingredient.function}
                        onChange={(e) => handleIngredientChange(index, 'function', e.target.value)}
                        className="px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none text-sm"
                        placeholder="e.g., Active, Excipient"
                      />
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={ingredient.amount}
                          onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                          className="flex-1 px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none text-sm"
                          placeholder="e.g., 10 mg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(index)}
                          className="ml-2 text-red-500"
                          disabled={molecularData.formulation.ingredients.length <= 1}
                        >
                          <MinusCircle size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <button
            type="button"
            onClick={handleAskLumen}
            className="px-4 py-2 border border-regulatory-600 text-regulatory-600 rounded-md hover:bg-regulatory-50 flex items-center"
          >
            <HelpCircle size={18} className="mr-2" />
            Ask Lumen for Help
          </button>
          
          <button
            type="button"
            onClick={handleGenerateBlueprint}
            disabled={isGenerating}
            className="px-6 py-2 bg-regulatory-600 text-white rounded-md hover:bg-regulatory-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Generate CMC Blueprint
              </>
            )}
          </button>
        </div>
      </div>
    );
  };
  
  // Main render method
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-regulatory-800">AI-CMC Blueprint Generator</h1>
          <p className="text-gray-600 mt-1">
            Transform molecular structures into regulatory-ready CMC documents
          </p>
        </div>
        
        {blueprintResults && (
          <div className="mt-4 md:mt-0">
            <button
              type="button"
              className="flex items-center px-4 py-2 bg-regulatory-600 text-white rounded-md hover:bg-regulatory-700 focus:outline-none focus:ring-2 focus:ring-regulatory-500 focus:ring-offset-2"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Full Blueprint
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="bg-regulatory-50 border-b">
          <nav className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-4 text-sm font-medium flex items-center ${
                  activeTab === tab.id
                    ? 'text-regulatory-700 border-b-2 border-regulatory-500 bg-white'
                    : 'text-gray-600 hover:text-regulatory-600 hover:bg-regulatory-100/50'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}