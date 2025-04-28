// /client/src/components/ind-wizard/InvestigatorBrochureUploader.jsx

import { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, HelpCircle, Trash2, Download, List } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function InvestigatorBrochureUploader({ setFormStatus }) {
  const [ibFile, setIbFile] = useState(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const [showOutline, setShowOutline] = useState(false);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, upload the file to server here
      setIbFile(file);
      setFormStatus(prev => ({ ...prev, ibUploaded: true }));
    }
  };

  // Handle file deletion
  const handleDeleteFile = () => {
    // In a real app, delete file from server here
    setIbFile(null);
    setFormStatus(prev => ({ ...prev, ibUploaded: false }));
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Investigator Brochure
            </CardTitle>
            <CardDescription className="mt-1">
              Upload the Investigator Brochure (IB) for your IND application.
            </CardDescription>
          </div>
          
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowGuidance(true)}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <HelpCircle className="h-4 w-4 mr-1" /> Guidance
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="bg-blue-50 rounded p-4 text-blue-800 text-sm">
            <h4 className="font-medium mb-1">Investigator Brochure (IB) Requirements</h4>
            <p>The IB is a comprehensive document summarizing the available information about the investigational product to inform clinical investigators and potential participants.</p>
          </div>
          
          {!ibFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <h3 className="text-gray-700 font-medium mb-1">Upload Investigator Brochure</h3>
                <p className="text-gray-500 text-sm mb-4">PDF document (Max 50MB)</p>
                
                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowOutline(true)}
                  >
                    <List className="h-4 w-4 mr-2" />
                    View IB Outline
                  </Button>
                  
                  <div>
                    <input
                      type="file"
                      id="ibUpload"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Label htmlFor="ibUpload" asChild>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Investigator Brochure
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-medium">{ibFile.name}</h4>
                    <p className="text-sm text-gray-500">
                      {(ibFile.size / (1024 * 1024)).toFixed(2)} MB • Uploaded {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={handleDeleteFile}>
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 flex items-center text-green-600 bg-green-50 px-3 py-2 rounded text-sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Investigator Brochure uploaded successfully
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div>
          {!ibFile ? (
            <div className="flex items-center text-amber-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Investigator Brochure needs to be uploaded</span>
            </div>
          ) : (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Investigator Brochure uploaded</span>
            </div>
          )}
        </div>
        
        {!ibFile && (
          <div>
            <input
              type="file"
              id="ibUpload2"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Label htmlFor="ibUpload2" asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Investigator Brochure
              </Button>
            </Label>
          </div>
        )}
      </CardFooter>

      {/* Guidance Dialog */}
      <AlertDialog open={showGuidance} onOpenChange={setShowGuidance}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Investigator Brochure Guidance</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 text-left mt-2">
                <p>
                  <span className="font-semibold">Purpose:</span> The Investigator Brochure (IB) provides clinical investigators with all the relevant information about the investigational drug to support the clinical trial's conduct and facilitate informed consent discussions.
                </p>
                
                <p>
                  <span className="font-semibold">Content:</span> A comprehensive IB should include:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Physical, chemical, and pharmaceutical properties of the drug</li>
                  <li>Preclinical studies (pharmacology, toxicology, pharmacokinetics)</li>
                  <li>Previous human experience (if any)</li>
                  <li>Summary of known and potential risks and benefits</li>
                  <li>Description of possible adverse reactions</li>
                  <li>Dosing and administration instructions</li>
                  <li>Drug handling procedures and precautions</li>
                </ul>
                
                <p>
                  <span className="font-semibold">Format:</span> The IB should be clearly organized, with numbered sections and a table of contents. It should be updated as new significant information becomes available.
                </p>
                
                <p className="text-blue-600 border-l-4 border-blue-600 pl-3 py-2 bg-blue-50">
                  <span className="font-semibold">Regulatory Note:</span> The IB is required under 21 CFR 312.23(a)(5) and should follow the structure outlined in the ICH E6(R2) Good Clinical Practice guidelines. The IB serves as the scientific foundation for the clinical protocol.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* IB Outline Dialog */}
      <AlertDialog open={showOutline} onOpenChange={setShowOutline}>
        <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Investigator Brochure Outline</AlertDialogTitle>
            <AlertDialogDescription>
              Below is the recommended structure for an Investigator Brochure following ICH E6(R2) guidelines.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="mt-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="title">
                <AccordionTrigger>Title Page</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Sponsor's name</li>
                    <li>Product identifier (number, code)</li>
                    <li>Chemical/generic name</li>
                    <li>Trade name (if legally permissible and desired by sponsor)</li>
                    <li>IB edition number and release date</li>
                    <li>Confidentiality statement</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="confidentiality">
                <AccordionTrigger>Confidentiality Statement</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm">A statement instructing investigators to treat the IB as a confidential document for the sole information and use of the investigator's team and the IRB/IEC.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="toc">
                <AccordionTrigger>Table of Contents</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm">Comprehensive list of all sections with page numbers.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="summary">
                <AccordionTrigger>Summary</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm">Brief overview of available information about the product, including:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
                    <li>Physical, chemical, and pharmaceutical properties</li>
                    <li>Nonclinical studies</li>
                    <li>Clinical studies (if any)</li>
                    <li>Risks and benefits for study subjects</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="intro">
                <AccordionTrigger>Introduction</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Brief introductory statement with chemical name, generic name, trade name</li>
                    <li>Rationale for performing the research</li>
                    <li>Anticipated prophylactic, therapeutic, or diagnostic indication</li>
                    <li>General approach to evaluation</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="physical">
                <AccordionTrigger>Physical, Chemical, and Pharmaceutical Properties</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Description of substance (formula, structure)</li>
                    <li>Relevant physical, chemical, and pharmaceutical properties</li>
                    <li>Formulation details, including excipients</li>
                    <li>Storage and handling requirements</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="nonclinical">
                <AccordionTrigger>Nonclinical Studies</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm font-medium mb-2">Results of all relevant nonclinical studies, including:</p>
                  
                  <p className="text-sm font-medium">Nonclinical Pharmacology:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm mb-2">
                    <li>Mechanism of action</li>
                    <li>Pharmacodynamic effects related to proposed human use</li>
                    <li>Safety pharmacology</li>
                  </ul>
                  
                  <p className="text-sm font-medium">Pharmacokinetics and Product Metabolism:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm mb-2">
                    <li>Absorption, distribution, metabolism, excretion (ADME)</li>
                    <li>Bioavailability</li>
                    <li>Pharmacokinetic drug interactions</li>
                  </ul>
                  
                  <p className="text-sm font-medium">Toxicology:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Single dose toxicity</li>
                    <li>Repeated dose toxicity</li>
                    <li>Carcinogenicity</li>
                    <li>Genotoxicity</li>
                    <li>Reproductive and developmental toxicity</li>
                    <li>Local tolerance</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="clinical">
                <AccordionTrigger>Effects in Humans (if applicable)</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm font-medium mb-2">Detailed summary of known information about the product in humans:</p>
                  
                  <p className="text-sm font-medium">Pharmacokinetics and Metabolism:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm mb-2">
                    <li>ADME properties in humans</li>
                    <li>Bioavailability</li>
                    <li>Effect of demographic factors</li>
                    <li>Drug-drug interactions</li>
                  </ul>
                  
                  <p className="text-sm font-medium">Safety and Efficacy:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm mb-2">
                    <li>Safety information from previous human studies</li>
                    <li>Efficacy information from previous human studies</li>
                    <li>Experience with marketing (if applicable)</li>
                  </ul>
                  
                  <p className="text-sm font-medium">Dosing and Administration:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Dose range in humans</li>
                    <li>Recommended doses</li>
                    <li>Administration details</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="summary-data">
                <AccordionTrigger>Summary of Data and Investigator Guidance</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Discussion of clinical and nonclinical data, including their implications</li>
                    <li>Benefit-risk assessment</li>
                    <li>Guidance on drug use in the trial</li>
                    <li>Monitoring requirements for safety</li>
                    <li>Drug interactions and precautions</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="references">
                <AccordionTrigger>References</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Citations for all published literature</li>
                    <li>References to unpublished data</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="appendices">
                <AccordionTrigger>Appendices (if needed)</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Detailed information on specific topics</li>
                    <li>Published literature reprints</li>
                    <li>Technical data for complex formulations</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <AlertDialogFooter className="mt-4">
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}