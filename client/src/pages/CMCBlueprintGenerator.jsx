import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, FileText, FileUp, CheckCircle2, Microscope, SquareCode 
} from 'lucide-react';

function CMCBlueprintGenerator() {
  const [activeTab, setActiveTab] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [moleculeData, setMoleculeData] = useState({
    moleculeName: '',
    molecularFormula: '',
    smiles: '',
    inchi: '',
    molecularWeight: '',
    synthesisPathway: '',
    formulation: {
      dosageForm: '',
      routeOfAdministration: '',
      ingredients: []
    }
  });
  const [ingredient, setIngredient] = useState({ name: '', function: '', amount: '' });
  const [generatedBlueprint, setGeneratedBlueprint] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  // File dropzone configuration
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: {
      'chemical/x-mol': ['.mol'],
      'chemical/x-sdf': ['.sdf'],
      'chemical/x-pdb': ['.pdb'],
      'chemical/x-cif': ['.cif'],
      'chemical/x-smiles': ['.smi'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0]);
      }
    }
  });

  // Handle file upload
  const handleFileUpload = async (file) => {
    setLoading(true);
    setUploadProgress(10);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);
      
      const response = await fetch('/api/cmc-blueprint-generator/upload', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }
      
      const data = await response.json();
      
      // Update molecule data with extracted information
      setMoleculeData(prev => ({
        ...prev,
        moleculeName: data.extractedData.moleculeName || prev.moleculeName,
        molecularFormula: data.extractedData.molecularFormula || prev.molecularFormula,
        molecularWeight: data.extractedData.estimatedMolecularWeight || prev.molecularWeight
      }));
      
      toast({
        title: 'File Uploaded Successfully',
        description: `Extracted data for ${data.extractedData.moleculeName || 'molecule'}`,
        variant: 'default',
      });
      
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMoleculeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle formulation input changes
  const handleFormulationChange = (e) => {
    const { name, value } = e.target;
    setMoleculeData(prev => ({
      ...prev,
      formulation: {
        ...prev.formulation,
        [name]: value
      }
    }));
  };

  // Handle ingredient input changes
  const handleIngredientChange = (e) => {
    const { name, value } = e.target;
    setIngredient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add ingredient to formulation
  const handleAddIngredient = () => {
    if (ingredient.name && ingredient.function) {
      setMoleculeData(prev => ({
        ...prev,
        formulation: {
          ...prev.formulation,
          ingredients: [...(prev.formulation.ingredients || []), {...ingredient}]
        }
      }));
      setIngredient({ name: '', function: '', amount: '' });
    }
  };

  // Remove ingredient from formulation
  const handleRemoveIngredient = (index) => {
    setMoleculeData(prev => ({
      ...prev,
      formulation: {
        ...prev.formulation,
        ingredients: prev.formulation.ingredients.filter((_, i) => i !== index)
      }
    }));
  };

  // Generate CMC blueprint
  const handleGenerateBlueprint = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cmc-blueprint-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moleculeData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate blueprint');
      }
      
      const data = await response.json();
      setGeneratedBlueprint(data);
      setShowResults(true);
      
      toast({
        title: 'Blueprint Generated Successfully',
        description: `Created CMC blueprint for ${moleculeData.moleculeName}`,
        variant: 'default',
      });
      
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Export blueprint as document
  const handleExport = async (format) => {
    setLoading(true);
    try {
      const response = await fetch('/api/cmc-blueprint-generator/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          template: 'standard',
          moleculeName: moleculeData.moleculeName,
          blueprintId: generatedBlueprint?.metadata?.generatedAt || new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export document');
      }
      
      // Handle different content types
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${moleculeData.moleculeName}-CMC-Module3.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      toast({
        title: 'Export Successful',
        description: `Document exported as ${format.toUpperCase()}`,
        variant: 'default',
      });
      
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI-CMC Blueprint Generator</h1>
        <p className="text-muted-foreground mt-2">
          Generate regulatory-ready CMC documentation from molecular structure data
        </p>
      </div>

      {!showResults ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Input</TabsTrigger>
            <TabsTrigger value="upload">File Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Molecule Information</CardTitle>
                <CardDescription>
                  Enter the molecular details for CMC documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="moleculeName">Molecule Name</Label>
                    <Input
                      id="moleculeName"
                      name="moleculeName"
                      value={moleculeData.moleculeName}
                      onChange={handleInputChange}
                      placeholder="e.g., Paracetamol"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="molecularFormula">Molecular Formula</Label>
                    <Input
                      id="molecularFormula"
                      name="molecularFormula"
                      value={moleculeData.molecularFormula}
                      onChange={handleInputChange}
                      placeholder="e.g., C8H9NO2"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smiles">SMILES Notation (optional)</Label>
                    <Input
                      id="smiles"
                      name="smiles"
                      value={moleculeData.smiles}
                      onChange={handleInputChange}
                      placeholder="e.g., CC(=O)NC1=CC=C(C=C1)O"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="molecularWeight">Molecular Weight (optional)</Label>
                    <Input
                      id="molecularWeight"
                      name="molecularWeight"
                      value={moleculeData.molecularWeight}
                      onChange={handleInputChange}
                      placeholder="e.g., 151.16 g/mol"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="synthesisPathway">Synthesis Pathway (optional)</Label>
                  <Textarea
                    id="synthesisPathway"
                    name="synthesisPathway"
                    value={moleculeData.synthesisPathway}
                    onChange={handleInputChange}
                    placeholder="Describe the chemical synthesis process..."
                    rows={4}
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Formulation Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosageForm">Dosage Form</Label>
                      <Select 
                        value={moleculeData.formulation.dosageForm} 
                        onValueChange={(value) => {
                          setMoleculeData(prev => ({
                            ...prev,
                            formulation: {
                              ...prev.formulation,
                              dosageForm: value
                            }
                          }));
                        }}
                      >
                        <SelectTrigger id="dosageForm">
                          <SelectValue placeholder="Select dosage form" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tablet">Tablet</SelectItem>
                          <SelectItem value="capsule">Capsule</SelectItem>
                          <SelectItem value="injection">Injection</SelectItem>
                          <SelectItem value="solution">Solution</SelectItem>
                          <SelectItem value="suspension">Suspension</SelectItem>
                          <SelectItem value="powder">Powder</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routeOfAdministration">Route of Administration</Label>
                      <Select 
                        value={moleculeData.formulation.routeOfAdministration} 
                        onValueChange={(value) => {
                          setMoleculeData(prev => ({
                            ...prev,
                            formulation: {
                              ...prev.formulation,
                              routeOfAdministration: value
                            }
                          }));
                        }}
                      >
                        <SelectTrigger id="routeOfAdministration">
                          <SelectValue placeholder="Select route" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oral">Oral</SelectItem>
                          <SelectItem value="parenteral">Parenteral</SelectItem>
                          <SelectItem value="topical">Topical</SelectItem>
                          <SelectItem value="inhalation">Inhalation</SelectItem>
                          <SelectItem value="ophthalmic">Ophthalmic</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ingredientName">Ingredient Name</Label>
                        <Input
                          id="ingredientName"
                          name="name"
                          value={ingredient.name}
                          onChange={handleIngredientChange}
                          placeholder="e.g., Microcrystalline cellulose"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ingredientFunction">Function</Label>
                        <Input
                          id="ingredientFunction"
                          name="function"
                          value={ingredient.function}
                          onChange={handleIngredientChange}
                          placeholder="e.g., Binder"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ingredientAmount">Amount</Label>
                        <Input
                          id="ingredientAmount"
                          name="amount"
                          value={ingredient.amount}
                          onChange={handleIngredientChange}
                          placeholder="e.g., 50 mg"
                        />
                      </div>
                    </div>
                    
                    <Button type="button" onClick={handleAddIngredient} className="w-full">
                      Add Ingredient
                    </Button>
                    
                    {moleculeData.formulation.ingredients?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-md font-medium mb-2">Ingredients List</h4>
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-muted">
                              <tr>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Function</th>
                                <th className="px-4 py-2 text-left">Amount</th>
                                <th className="px-4 py-2 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {moleculeData.formulation.ingredients.map((item, index) => (
                                <tr key={index} className="border-t">
                                  <td className="px-4 py-2">{item.name}</td>
                                  <td className="px-4 py-2">{item.function}</td>
                                  <td className="px-4 py-2">{item.amount}</td>
                                  <td className="px-4 py-2 text-center">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleRemoveIngredient(index)}
                                    >
                                      Remove
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleGenerateBlueprint} 
                  disabled={loading || !moleculeData.moleculeName || !moleculeData.molecularFormula}
                  className="w-full"
                >
                  {loading ? 'Generating...' : 'Generate CMC Blueprint'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="upload" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Molecular Structure File</CardTitle>
                <CardDescription>
                  Drag and drop or click to upload a molecular structure file (.mol, .sdf, .pdb, .cif, .smi) or an image (.png, .jpg)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-md p-10 text-center cursor-pointer hover:bg-muted/50 transition-colors ${
                    acceptedFiles.length > 0 ? 'border-primary' : 'border-muted-foreground/25'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <FileUp className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Click to upload, or drag and drop</p>
                      <p className="text-sm text-muted-foreground">
                        Supported formats: MOL, SDF, PDB, CIF, SMI, PNG, JPG
                      </p>
                    </div>
                  </div>
                </div>
                
                {loading && (
                  <div className="mt-4 space-y-2">
                    <Progress value={uploadProgress} className="h-2 w-full" />
                    <p className="text-sm text-center text-muted-foreground">
                      {uploadProgress < 100 
                        ? 'Processing file...' 
                        : 'Analyzing molecular structure...'}
                    </p>
                  </div>
                )}
                
                {acceptedFiles.length > 0 && !loading && (
                  <div className="mt-4 p-3 bg-muted rounded-md flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{acceptedFiles[0].name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round(acceptedFiles[0].size / 1024)} KB)
                    </span>
                  </div>
                )}
                
                {moleculeData.moleculeName && moleculeData.molecularFormula && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-medium">Extracted Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="extractedName">Molecule Name</Label>
                        <Input
                          id="extractedName"
                          name="moleculeName"
                          value={moleculeData.moleculeName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="extractedFormula">Molecular Formula</Label>
                        <Input
                          id="extractedFormula"
                          name="molecularFormula"
                          value={moleculeData.molecularFormula}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={() => setActiveTab('manual')} 
                      variant="outline" 
                      className="w-full"
                    >
                      Edit Additional Details
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleGenerateBlueprint} 
                  disabled={loading || !moleculeData.moleculeName || !moleculeData.molecularFormula}
                  className="w-full"
                >
                  {loading ? 'Generating...' : 'Generate CMC Blueprint'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              CMC Blueprint: {moleculeData.moleculeName}
            </h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowResults(false)}>
                Back to Editor
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('json')}
                disabled={loading}
              >
                <SquareCode className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport('pdf')}
                disabled={loading}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => handleExport('word')}
                disabled={loading}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export Word
              </Button>
            </div>
          </div>
          
          {generatedBlueprint && (
            <Tabs defaultValue="s.1" className="w-full">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="s.1">S.1 General Information</TabsTrigger>
                <TabsTrigger value="s.2">S.2 Manufacture</TabsTrigger>
                <TabsTrigger value="p.1">P.1 Description</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>
              
              <TabsContent value="s.1" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{generatedBlueprint.drugSubstance['s.1']?.title || 'General Information'}</CardTitle>
                    <CardDescription>
                      General information about the drug substance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p>{generatedBlueprint.drugSubstance['s.1']?.content || 'No content available'}</p>
                      
                      {generatedBlueprint.drugSubstance['s.1']?.regulatoryConsiderations && (
                        <div className="mt-4">
                          <h4>Regulatory Considerations</h4>
                          <ul>
                            {generatedBlueprint.drugSubstance['s.1']?.regulatoryConsiderations.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="s.2" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{generatedBlueprint.drugSubstance['s.2']?.title || 'Manufacture'}</CardTitle>
                    <CardDescription>
                      Information about the drug substance manufacturing process
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p>{generatedBlueprint.drugSubstance['s.2']?.content || 'No content available'}</p>
                      
                      {generatedBlueprint.drugSubstance['s.2']?.criticalSteps && (
                        <div className="mt-4">
                          <h4>Critical Steps</h4>
                          <ul>
                            {generatedBlueprint.drugSubstance['s.2']?.criticalSteps.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="p.1" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{generatedBlueprint.drugProduct['p.1']?.title || 'Description and Composition'}</CardTitle>
                    <CardDescription>
                      Description and composition of the drug product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p>{generatedBlueprint.drugProduct['p.1']?.content || 'No content available'}</p>
                      
                      {generatedBlueprint.drugProduct['p.1']?.composition && (
                        <div className="mt-4">
                          <h4>Composition</h4>
                          {generatedBlueprint.drugProduct['p.1']?.composition.length > 0 ? (
                            <table className="w-full border-collapse">
                              <thead>
                                <tr>
                                  <th className="border p-2 text-left">Ingredient</th>
                                  <th className="border p-2 text-left">Function</th>
                                  <th className="border p-2 text-left">Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {generatedBlueprint.drugProduct['p.1']?.composition.map((item, index) => (
                                  <tr key={index}>
                                    <td className="border p-2">{item.name}</td>
                                    <td className="border p-2">{item.function}</td>
                                    <td className="border p-2">{item.amount}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-muted-foreground">No composition data available</p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="summary" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Blueprint Summary</CardTitle>
                    <CardDescription>
                      Overview of the generated CMC blueprint
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Microscope className="h-5 w-5" />
                        <span>
                          <strong>Molecule:</strong> {moleculeData.moleculeName} ({moleculeData.molecularFormula})
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Generated Sections</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.keys(generatedBlueprint.drugSubstance || {}).map((key) => (
                            <div 
                              key={key} 
                              className="flex items-center space-x-2 p-2 border rounded-md"
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>
                                <strong>{key.toUpperCase()}</strong>: {generatedBlueprint.drugSubstance[key]?.title}
                              </span>
                            </div>
                          ))}
                          {Object.keys(generatedBlueprint.drugProduct || {}).map((key) => (
                            <div 
                              key={key} 
                              className="flex items-center space-x-2 p-2 border rounded-md"
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>
                                <strong>{key.toUpperCase()}</strong>: {generatedBlueprint.drugProduct[key]?.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Metadata</h4>
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm">
                            <strong>Generated At:</strong> {new Date(generatedBlueprint.metadata?.generatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Export Options</h4>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleExport('json')}
                            disabled={loading}
                          >
                            <SquareCode className="h-4 w-4 mr-2" />
                            JSON
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleExport('pdf')}
                            disabled={loading}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleExport('word')}
                            disabled={loading}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Word
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleExport('ectd')}
                            disabled={loading}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            eCTD
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
}

export default CMCBlueprintGenerator;