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
      const response = await fetch('/api/cmc-blueprint-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(molecularData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate CMC blueprint');
      }
      
      const data = await response.json();
      setBlueprintResults(data);
      
      // Switch to the drug substance tab to show results
      setActiveTab('drug-substance');
      
      toast({
        title: 'Blueprint Generated',
        description: `CMC blueprint for ${molecularData.moleculeName} has been successfully generated.`,
      });
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
  
  const handleAskLumen = () => {
    openAssistant(`I need help with generating a CMC blueprint for ${molecularData.moleculeName || 'my molecule'}. Can you provide guidance on the required information for ICH CTD Module 3 sections?`);
  };
  
  const renderFormSection = () => {
    return (
      <div className="space-y-8">
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
            <div className="space-y-4 p-4 bg-gray-50 rounded-md">
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
                    <option value="powder">Powder</option>
                    <option value="cream">Cream</option>
                    <option value="ointment">Ointment</option>
                    <option value="injection">Injection</option>
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
                    <option value="intravenous">Intravenous</option>
                    <option value="intramuscular">Intramuscular</option>
                    <option value="subcutaneous">Subcutaneous</option>
                    <option value="topical">Topical</option>
                    <option value="inhalation">Inhalation</option>
                    <option value="ophthalmic">Ophthalmic</option>
                    <option value="rectal">Rectal</option>
                    <option value="vaginal">Vaginal</option>
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
                  {molecularData.formulation.ingredients.map((ingredient, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 items-center">
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        className="px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={ingredient.function}
                        onChange={(e) => handleIngredientChange(index, 'function', e.target.value)}
                        className="px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none"
                        placeholder="Function"
                      />
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={ingredient.amount}
                          onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                          className="flex-1 px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-regulatory-500 focus:outline-none"
                          placeholder="Amount"
                        />
                        {molecularData.formulation.ingredients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(index)}
                            className="ml-2 text-red-500"
                          >
                            <MinusCircle size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center pt-4">
          <button
            onClick={handleGenerateBlueprint}
            disabled={isGenerating}
            className="flex items-center justify-center px-6 py-3 bg-regulatory-600 text-white rounded-md hover:bg-regulatory-700 focus:outline-none focus:ring-2 focus:ring-regulatory-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Beaker className="w-5 h-5 mr-2" />
                Generate CMC Blueprint
              </>
            )}
          </button>
          
          <button
            onClick={handleAskLumen}
            className="ml-4 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Ask Lumen Assistant
          </button>
        </div>
      </div>
    );
  };
  
  const renderSectionContent = (section, content) => {
    if (!content) return null;
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{content.title}</h2>
        <p className="text-gray-700">{content.content}</p>
        
        {content.subsections?.map((subsection, index) => (
          <div key={index} className="mt-6">
            <h3 className="text-xl font-semibold">{subsection.title}</h3>
            <div className="mt-2 prose max-w-none">
              {subsection.content.split('\n').map((paragraph, pidx) => (
                <p key={pidx} className="mb-2">{paragraph}</p>
              ))}
            </div>
            
            {subsection.subsections?.map((nestedSubsection, nidx) => (
              <div key={nidx} className="mt-4 ml-4">
                <h4 className="text-lg font-medium">{nestedSubsection.title}</h4>
                <div className="mt-1 prose max-w-none">
                  {nestedSubsection.content.split('\n').map((paragraph, pidx) => (
                    <p key={pidx} className="mb-2">{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };
  
  const renderDrugSubstanceTab = () => {
    if (!blueprintResults) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Generate a blueprint to view Drug Substance sections</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-4">Sections</h3>
          <ul className="space-y-2">
            {SUBSTANCE_SECTIONS.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => handleSectionChange('drug-substance', section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    activeSection['drug-substance'] === section.id
                      ? 'bg-regulatory-100 text-regulatory-700 font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="col-span-3 bg-white p-6 rounded-md border">
          {renderSectionContent(
            activeSection['drug-substance'],
            blueprintResults?.drugSubstance?.[activeSection['drug-substance']]
          )}
        </div>
      </div>
    );
  };
  
  const renderDrugProductTab = () => {
    if (!blueprintResults) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Generate a blueprint to view Drug Product sections</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-4">Sections</h3>
          <ul className="space-y-2">
            {PRODUCT_SECTIONS.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => handleSectionChange('drug-product', section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    activeSection['drug-product'] === section.id
                      ? 'bg-regulatory-100 text-regulatory-700 font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="col-span-3 bg-white p-6 rounded-md border">
          {renderSectionContent(
            activeSection['drug-product'],
            blueprintResults?.drugProduct?.[activeSection['drug-product']]
          )}
        </div>
      </div>
    );
  };
  
  const renderVisualizationsTab = () => {
    if (!blueprintResults) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Generate a blueprint to view visualizations</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-8">
        {blueprintResults.diagrams.manufacturingProcess && (
          <div className="bg-white p-6 rounded-md border">
            <h2 className="text-xl font-semibold mb-4">Manufacturing Process Diagram</h2>
            
            {blueprintResults.diagrams.manufacturingProcess.error ? (
              <div className="text-red-600 p-4 bg-red-50 rounded-md">
                {blueprintResults.diagrams.manufacturingProcess.errorMessage}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={blueprintResults.diagrams.manufacturingProcess.url}
                    alt="Manufacturing Process Diagram"
                    className="max-w-full rounded-md border shadow-sm"
                  />
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Generated: {new Date(blueprintResults.diagrams.manufacturingProcess.generatedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'input':
        return renderFormSection();
      case 'drug-substance':
        return renderDrugSubstanceTab();
      case 'drug-product':
        return renderDrugProductTab();
      case 'visualizations':
        return renderVisualizationsTab();
      default:
        return null;
    }
  };
  
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