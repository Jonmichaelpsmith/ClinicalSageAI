import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  CheckCircle2, 
  ChevronDown, 
  Copy, 
  Download, 
  FileText, 
  HelpCircle, 
  FlaskConical, 
  AtomIcon,
  Beaker,
  PenTool,
  Layers,
  ArrowRight,
  Loader2,
  Check,
  Trash2,
  DownloadCloud,
  FileUp
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const MolecularStructureForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formSchema = z.object({
    moleculeName: z.string().min(2, {
      message: "Molecule name must be at least 2 characters.",
    }),
    molecularFormula: z.string().min(2, {
      message: "Molecular formula is required.",
    }),
    smiles: z.string().optional(),
    inchi: z.string().optional(),
    molecularWeight: z.string().optional(),
    synthesisPathway: z.string().optional(),
    analyticalMethods: z.array(z.string()).default([]),
    formulation: z.object({
      dosageForm: z.string(),
      routeOfAdministration: z.string(),
      ingredients: z.array(z.object({
        name: z.string(),
        function: z.string(),
        amount: z.string()
      })).optional()
    }).optional(),
  });
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
        ingredients: []
      }
    }
  });
  
  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      // In production, this would call the API
      // const response = await fetch('/api/cmc-blueprint-generator', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values)
      // });
      // const data = await response.json();
      
      // Simulate API response time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Blueprint Generated Successfully",
        description: "The CMC blueprint has been generated based on the molecular structure data.",
      });
      
      // In production, this would navigate to the results page
      // navigate('/cmc-blueprint-results');
    } catch (error) {
      console.error('Error generating blueprint:', error);
      toast({
        title: "Error Generating Blueprint",
        description: "An error occurred while generating the blueprint. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onDrop = acceptedFiles => {
    // Handle file uploads (e.g. mol files, structure data)
    if (acceptedFiles.length > 0) {
      toast({
        title: "File Uploaded",
        description: `${acceptedFiles[0].name} has been uploaded for processing.`,
      });
      
      // In production, this would parse the file contents
    }
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'chemical/x-mol': ['.mol'],
      'chemical/x-pdb': ['.pdb'],
      'application/json': ['.json'],
      'text/plain': ['.txt', '.smi']
    },
    maxFiles: 1
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <AtomIcon className="h-5 w-5 text-indigo-600" />
                Molecular Identity
              </CardTitle>
              <CardDescription>
                Provide basic information about the molecule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="moleculeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Molecule Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Imatinib Mesylate" {...field} />
                    </FormControl>
                    <FormDescription>
                      INN or USAN name of the molecule
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="molecularFormula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Molecular Formula</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. C29H31N7O" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="molecularWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Molecular Weight (g/mol)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 493.6" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="pt-2">
                <Label className="text-sm font-medium">Structure Format</Label>
                <div {...getRootProps()} className="mt-2 border-2 border-dashed rounded-md p-6 cursor-pointer hover:border-indigo-300 transition-colors">
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <FileUp className="h-8 w-8 text-indigo-500" />
                    {isDragActive ? (
                      <p className="text-sm text-gray-600">Drop the file here...</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium">Upload a structure file</p>
                        <p className="text-xs text-gray-500">Drag and drop or click to select a .mol, .pdb, or .smi file</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-indigo-600" />
                Chemical Structure Notation
              </CardTitle>
              <CardDescription>
                Provide structural information in standard chemical notations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="smiles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      SMILES Notation
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Simplified Molecular Input Line Entry System (SMILES) is a notation that represents the chemical structure in a linear format.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. CCN(CC)CCNC(=O)c1cc(Cl)c(N)cc1OC"
                        className="font-mono text-sm"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="inchi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      InChI Identifier
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">International Chemical Identifier (InChI) is a textual identifier for chemical substances designed to provide a standard way to encode molecular information.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. InChI=1S/C29H31N7O/c1-4-34(5-2)..."
                        className="font-mono text-sm"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="synthesisPathway"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Synthesis Pathway (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the key synthetic steps..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of the synthetic route or reaction tree
                    </FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Beaker className="h-5 w-5 text-indigo-600" />
              Formulation Details
            </CardTitle>
            <CardDescription>
              Provide information about the drug product formulation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="formulation.dosageForm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage Form</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select dosage form" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tablet">Tablet</SelectItem>
                        <SelectItem value="capsule">Capsule</SelectItem>
                        <SelectItem value="injectable">Injectable Solution</SelectItem>
                        <SelectItem value="suspension">Suspension</SelectItem>
                        <SelectItem value="powder">Powder for Reconstitution</SelectItem>
                        <SelectItem value="topical">Topical Formulation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="formulation.routeOfAdministration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route of Administration</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select route" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="oral">Oral</SelectItem>
                        <SelectItem value="intravenous">Intravenous</SelectItem>
                        <SelectItem value="intramuscular">Intramuscular</SelectItem>
                        <SelectItem value="subcutaneous">Subcutaneous</SelectItem>
                        <SelectItem value="topical">Topical</SelectItem>
                        <SelectItem value="inhaled">Inhaled</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mt-6">
              <Label className="text-base font-medium">Excipients and Ingredients</Label>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                List the ingredients in your formulation including functional excipients
              </p>
              
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-3 gap-4 w-full font-medium text-sm">
                    <div>Name</div>
                    <div>Function</div>
                    <div>Amount</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const currentIngredients = form.getValues('formulation.ingredients') || [];
                      form.setValue('formulation.ingredients', [
                        ...currentIngredients,
                        { name: '', function: '', amount: '' }
                      ]);
                    }}
                  >
                    Add Ingredient
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                {/* This would dynamically display ingredients based on form.watch('formulation.ingredients') */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <Input placeholder="Active Ingredient" defaultValue="Imatinib Mesylate" />
                    <Input placeholder="API" defaultValue="Active Pharmaceutical Ingredient" />
                    <div className="flex gap-2">
                      <Input placeholder="100 mg" defaultValue="100 mg" />
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <Input placeholder="e.g. Lactose Monohydrate" defaultValue="Microcrystalline Cellulose" />
                    <Input placeholder="e.g. Filler" defaultValue="Diluent" />
                    <div className="flex gap-2">
                      <Input placeholder="e.g. 50 mg" defaultValue="200 mg" />
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <FormField
              control={form.control}
              name="generateAll"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Generate all ICH Module 3 sections
                  </FormLabel>
                </FormItem>
              )}
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Output Format <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>eCTD-ready Word Documents</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <PenTool className="mr-2 h-4 w-4" />
                  <span>PDF with Digital Signatures</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Layers className="mr-2 h-4 w-4" />
                  <span>Structured XML for Submission</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Blueprint
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const CMCBlueprintGenerator = () => {
  const [activeTab, setActiveTab] = useState('input');
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI-CMC Blueprint Generator™</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          From Molecular Structure to Regulatory-Ready Draft in Minutes
        </p>
      </div>
      
      <Alert className="mb-6 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-900">
        <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <AlertTitle className="text-indigo-600 dark:text-indigo-400">Accelerate CMC Regulatory Documentation</AlertTitle>
        <AlertDescription>
          This AI-powered tool generates complete Chemistry, Manufacturing, and Controls (CMC) documentation
          from molecular structure and formulation details, producing regulatory-ready documents formatted for eCTD submission.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="input" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="input" className="flex items-center gap-2">
            <AtomIcon className="h-4 w-4" />
            <span>Molecular Input</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Document Preview</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <DownloadCloud className="h-4 w-4" />
            <span>Export & Finalize</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="input" className="mt-0">
          <MolecularStructureForm />
        </TabsContent>
        
        <TabsContent value="preview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">
                  Generated Sections
                </CardTitle>
                <CardDescription>
                  ICH Module 3 CTD format
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="p-4">
                    <Accordion type="single" collapsible defaultValue="s.1">
                      <AccordionItem value="s.1">
                        <AccordionTrigger className="hover:bg-gray-50 dark:hover:bg-gray-900 px-4 py-2 rounded-md">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                              S.1
                            </Badge>
                            <span>General Information</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                          <div className="space-y-2 ml-8">
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">S.1.1 Nomenclature</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">S.1.2 Structure</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">S.1.3 General Properties</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="s.2">
                        <AccordionTrigger className="hover:bg-gray-50 dark:hover:bg-gray-900 px-4 py-2 rounded-md">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                              S.2
                            </Badge>
                            <span>Manufacture</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                          <div className="space-y-2 ml-8">
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">S.2.1 Manufacturer(s)</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">S.2.2 Description of Manufacturing Process</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">S.2.3 Control of Materials</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">S.2.4 Controls of Critical Steps and Intermediates</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">S.2.5 Process Validation</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">S.2.6 Manufacturing Process Development</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="s.3">
                        <AccordionTrigger className="hover:bg-gray-50 dark:hover:bg-gray-900 px-4 py-2 rounded-md">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                              S.3
                            </Badge>
                            <span>Characterisation</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                          <div className="space-y-2 ml-8">
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">S.3.1 Elucidation of Structure</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">S.3.2 Impurities</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="s.4">
                        <AccordionTrigger className="hover:bg-gray-50 dark:hover:bg-gray-900 px-4 py-2 rounded-md">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                              S.4
                            </Badge>
                            <span>Control of Drug Substance</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                          <div className="space-y-2 ml-8">
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">S.4.1 Specification</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">S.4.2 Analytical Procedures</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">S.4.3 Validation of Analytical Procedures</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">S.4.4 Batch Analyses</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">S.4.5 Justification of Specification</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="p.1">
                        <AccordionTrigger className="hover:bg-gray-50 dark:hover:bg-gray-900 px-4 py-2 rounded-md">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                              P.1
                            </Badge>
                            <span>Description and Composition</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                          <div className="space-y-2 ml-8">
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">P.1 Description and Composition</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="p.2">
                        <AccordionTrigger className="hover:bg-gray-50 dark:hover:bg-gray-900 px-4 py-2 rounded-md">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                              P.2
                            </Badge>
                            <span>Pharmaceutical Development</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                          <div className="space-y-2 ml-8">
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">P.2.1 Components of the Drug Product</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">P.2.2 Drug Product</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">P.2.3 Manufacturing Process Development</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">P.2.4 Container Closure System</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">P.2.5 Microbiological Attributes</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">P.2.6 Compatibility</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <div className="w-full flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">23</span> sections generated
                  </div>
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Table of Contents
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader className="border-b pb-3">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-xl">Document Preview</CardTitle>
                    <CardDescription>
                      S.2.2 Description of Manufacturing Process
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <PenTool className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="p-6 prose dark:prose-invert max-w-none">
                    <h2>S.2.2 Description of Manufacturing Process and Process Controls</h2>
                    
                    <h3>2.2.1 Manufacturing Process Overview</h3>
                    <p>
                      Imatinib Mesylate is manufactured via a convergent synthetic route involving six main chemical transformations. The process begins with the reaction of 4-chloromethyl-benzoyl chloride (Compound A) with N-methylpiperazine (Compound B) to form intermediate C. This intermediate undergoes a condensation reaction with 3-acetylpyridine to yield pyridyl-pyrimidine intermediate D.
                    </p>
                    
                    <p>
                      In a parallel synthesis pathway, 2-methyl-5-nitroaniline is subjected to diazotization followed by reduction to produce intermediate E. Intermediates D and E are then coupled in the presence of a palladium catalyst to form the penultimate intermediate F. Finally, salt formation with methanesulfonic acid yields the target compound, Imatinib Mesylate, which is isolated by crystallization from a suitable solvent system.
                    </p>
                    
                    <h3>2.2.2 Detailed Synthetic Scheme</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md mb-4 font-mono text-sm overflow-auto">
                      {`
                      Compound A + Compound B → Intermediate C
                      Intermediate C + 3-acetylpyridine → Intermediate D
                      2-methyl-5-nitroaniline → Intermediate E
                      Intermediate D + Intermediate E → Intermediate F
                      Intermediate F + methanesulfonic acid → Imatinib Mesylate
                      `}
                    </div>
                    
                    <h3>2.2.3 Step-by-Step Manufacturing Process</h3>
                    
                    <h4>Step 1: Formation of Intermediate C</h4>
                    <p>
                      4-Chloromethyl-benzoyl chloride (10.0 kg, 1.0 eq) is charged into a clean, dry reactor under nitrogen atmosphere. Dichloromethane (50 L) is added and the mixture is cooled to 0-5°C. N-Methylpiperazine (9.5 kg, 1.1 eq) is dissolved in dichloromethane (20 L) and added dropwise over 2 hours, maintaining the temperature below 10°C. After complete addition, the mixture is allowed to warm to ambient temperature and stirred for an additional 4 hours. The reaction is monitored by HPLC until the content of 4-chloromethyl-benzoyl chloride is ≤0.5%. The reaction mixture is then washed with 1 M sodium hydroxide solution (2 × 30 L) followed by water (30 L). The organic layer is dried over anhydrous sodium sulfate, filtered, and concentrated under reduced pressure at temperature not exceeding 40°C to yield Intermediate C as an off-white solid.
                    </p>
                    
                    <h4>Step 2: Formation of Intermediate D</h4>
                    <p>
                      Intermediate C (8.0 kg, 1.0 eq) and 3-acetylpyridine (4.2 kg, 1.05 eq) are charged into a clean, dry reactor. Toluene (40 L) is added, followed by potassium tert-butoxide (6.5 kg, 1.7 eq) in portions over 30 minutes, maintaining the temperature below 30°C. The mixture is heated to 70-75°C and stirred for 6 hours. The reaction progress is monitored by HPLC. Upon completion, the mixture is cooled to ambient temperature, and water (40 L) is added. The layers are separated, and the aqueous layer is extracted with toluene (20 L). The combined organic layers are washed with water (30 L), dried over anhydrous sodium sulfate, filtered, and concentrated under reduced pressure to yield crude Intermediate D, which is used directly in the next step.
                    </p>
                    
                    <h3>2.2.4 Process Controls</h3>
                    <p>
                      Critical process parameters are controlled during the synthesis to ensure consistent quality of the drug substance. These include:
                    </p>
                    
                    <ul>
                      <li>Temperature monitoring and control at each reaction step</li>
                      <li>Reaction time control based on in-process testing</li>
                      <li>Solvent volume ratios for optimal yield and purity</li>
                      <li>Catalyst loading for the coupling reaction</li>
                      <li>Crystallization parameters for final isolation</li>
                    </ul>
                    
                    <h3>2.2.5 Reprocessing</h3>
                    <p>
                      Reprocessing may be performed in the event of failure to meet specifications at the final crystallization step. The material may be redissolved and recrystallized according to the established procedure. Reprocessing is limited to one time only, and any batch requiring more than one reprocessing event will be rejected.
                    </p>
                    
                    <h3>2.2.6 Process Validation Summary</h3>
                    <p>
                      The manufacturing process has been validated through the production of consecutive validation batches, which demonstrated consistency in yields, impurity profiles, and physical characteristics. The critical process parameters identified during development have been established with appropriate ranges to ensure batch-to-batch consistency.
                    </p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="export" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <DownloadCloud className="h-5 w-5 text-indigo-600" />
                  Export Options
                </CardTitle>
                <CardDescription>
                  Select your preferred document format and export settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Document Format</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="docx" name="format" className="h-4 w-4 accent-indigo-600" defaultChecked />
                      <Label htmlFor="docx" className="font-normal">MS Word (.docx)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="pdf" name="format" className="h-4 w-4 accent-indigo-600" />
                      <Label htmlFor="pdf" className="font-normal">PDF</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="xml" name="format" className="h-4 w-4 accent-indigo-600" />
                      <Label htmlFor="xml" className="font-normal">eCTD XML</Label>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Document Settings</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="headers" className="h-4 w-4 accent-indigo-600" defaultChecked />
                      <Label htmlFor="headers" className="font-normal">Include eCTD-compliant headers and footers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="toc" className="h-4 w-4 accent-indigo-600" defaultChecked />
                      <Label htmlFor="toc" className="font-normal">Generate table of contents</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="bookmarks" className="h-4 w-4 accent-indigo-600" defaultChecked />
                      <Label htmlFor="bookmarks" className="font-normal">Include PDF bookmarks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="hyperlinks" className="h-4 w-4 accent-indigo-600" defaultChecked />
                      <Label htmlFor="hyperlinks" className="font-normal">Create hyperlinks for references</Label>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Regulatory Region Customization</Label>
                  <div className="space-y-3">
                    <Select defaultValue="fda">
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary regulatory authority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fda">US FDA</SelectItem>
                        <SelectItem value="ema">EU EMA</SelectItem>
                        <SelectItem value="pmda">Japan PMDA</SelectItem>
                        <SelectItem value="health-canada">Health Canada</SelectItem>
                        <SelectItem value="mhra">UK MHRA</SelectItem>
                        <SelectItem value="multi">Multiple Regions (Harmonized)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Content Options</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="placeholders" className="h-4 w-4 accent-indigo-600" defaultChecked />
                      <Label htmlFor="placeholders" className="font-normal">Include placeholders for missing information</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="comments" className="h-4 w-4 accent-indigo-600" defaultChecked />
                      <Label htmlFor="comments" className="font-normal">Add review comments for key sections</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="references" className="h-4 w-4 accent-indigo-600" defaultChecked />
                      <Label htmlFor="references" className="font-normal">Generate reference list</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Export Documents
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                  Export Summary
                </CardTitle>
                <CardDescription>
                  Review the documents ready for export
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-6 pt-4 pb-2">
                  <Progress value={100} className="h-2 mb-1" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Blueprint Generation Complete</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <ScrollArea className="h-[400px] px-6">
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-900 border-b px-4 py-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-indigo-600" />
                          <span className="font-medium">Module 3.2.S CTD Sections</span>
                        </div>
                        <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                          Ready for Export
                        </Badge>
                      </div>
                      <div className="p-4">
                        <div className="text-sm">
                          <p>Generated CMC sections for drug substance based on molecular structure and synthesis data:</p>
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>S.1 General Information (complete)</li>
                            <li>S.2 Manufacture (complete)</li>
                            <li>S.3 Characterisation (complete)</li>
                            <li>S.4 Control of Drug Substance (complete)</li>
                            <li>S.5 Reference Standards (complete)</li>
                            <li>S.6 Container Closure System (complete)</li>
                            <li>S.7 Stability (partial - requires stability data)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-900 border-b px-4 py-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-indigo-600" />
                          <span className="font-medium">Module 3.2.P CTD Sections</span>
                        </div>
                        <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                          Ready for Export
                        </Badge>
                      </div>
                      <div className="p-4">
                        <div className="text-sm">
                          <p>Generated CMC sections for drug product based on formulation details:</p>
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>P.1 Description and Composition (complete)</li>
                            <li>P.2 Pharmaceutical Development (complete)</li>
                            <li>P.3 Manufacture (complete)</li>
                            <li>P.4 Control of Excipients (complete)</li>
                            <li>P.5 Control of Drug Product (complete)</li>
                            <li>P.6 Reference Standards (complete)</li>
                            <li>P.7 Container Closure System (partial)</li>
                            <li>P.8 Stability (partial - requires stability data)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-900 border-b px-4 py-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-indigo-600" />
                          <span className="font-medium">Supporting Diagrams and Tables</span>
                        </div>
                        <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                          Ready for Export
                        </Badge>
                      </div>
                      <div className="p-4">
                        <div className="text-sm">
                          <p>Generated supplementary materials for inclusion in the dossier:</p>
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Manufacturing process flow diagram (SVG format)</li>
                            <li>Analytical methods summary table</li>
                            <li>Specification tables for drug substance and product</li>
                            <li>Critical process parameters table</li>
                            <li>Impurity profile visualization</li>
                            <li>Structure elucidation diagram</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                
                <div className="border-t p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Total Document Size:</div>
                      <div className="text-sm text-gray-500">352 pages / 15.2 MB</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Generation Date:</div>
                      <div className="text-sm text-gray-500">April 22, 2025</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Template Version:</div>
                      <div className="text-sm text-gray-500">eCTD v4.0 (ICH M4Q compatible)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CMCBlueprintGenerator;