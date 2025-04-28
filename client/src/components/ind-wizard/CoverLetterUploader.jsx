// /client/src/components/ind-wizard/CoverLetterUploader.jsx

import { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, HelpCircle, Trash2, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function CoverLetterUploader({ setFormStatus }) {
  const [coverLetter, setCoverLetter] = useState(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, upload the file to server here
      setCoverLetter(file);
      setFormStatus(prev => ({ ...prev, coverLetterUploaded: true }));
    }
  };

  // Handle file deletion
  const handleDeleteFile = () => {
    // In a real app, delete file from server here
    setCoverLetter(null);
    setFormStatus(prev => ({ ...prev, coverLetterUploaded: false }));
  };

  // Template content for the modal
  const templateContent = `
[Sponsor Name]
[Sponsor Address]
[City, State ZIP]
[Phone]
[Email]

[Date]

Division of [Appropriate FDA Division]
Center for Drug Evaluation and Research
Food and Drug Administration
5901-B Ammendale Road
Beltsville, MD 20705-1266

Re: Initial Investigational New Drug Application
    [Drug Name/Compound Number]
    [Indication/Treatment]

Dear Sir/Madam:

[Sponsor Name] is submitting this Investigational New Drug Application (IND) for [Drug Name], a [brief description of the drug, e.g., "novel small molecule inhibitor of..."] being developed for the treatment of [indication].

This IND contains the following:
• Form FDA 1571
• Table of Contents
• Introductory Statement and General Investigational Plan
• Investigator's Brochure
• Clinical Protocol
• Chemistry, Manufacturing, and Controls Information
• Pharmacology and Toxicology Information
• Previous Human Experience
• Additional Information

[Brief paragraph on any special considerations or requests]

If you have any questions or require additional information, please contact:

[Contact Name]
[Title]
[Phone]
[Email]

Sincerely,

[Signature]
[Typed Name]
[Title]
[Sponsor Company]
  `;

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Cover Letter
            </CardTitle>
            <CardDescription className="mt-1">
              Upload a cover letter for your IND application.
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
            <h4 className="font-medium mb-1">Cover Letter Requirements</h4>
            <p>A cover letter is required for all IND submissions. It should provide an overview of the submission and any special considerations for FDA reviewers.</p>
          </div>
          
          {!coverLetter ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <h3 className="text-gray-700 font-medium mb-1">Upload Cover Letter</h3>
                <p className="text-gray-500 text-sm mb-4">PDF or Word document (Max 10MB)</p>
                
                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowTemplate(true)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Template
                  </Button>
                  
                  <div>
                    <input
                      type="file"
                      id="coverLetterUpload"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Label htmlFor="coverLetterUpload" asChild>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Cover Letter
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
                    <h4 className="font-medium">{coverLetter.name}</h4>
                    <p className="text-sm text-gray-500">
                      {(coverLetter.size / 1024).toFixed(2)} KB • Uploaded {new Date().toLocaleDateString()}
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
                Cover Letter uploaded successfully
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div>
          {!coverLetter ? (
            <div className="flex items-center text-amber-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Cover Letter needs to be uploaded</span>
            </div>
          ) : (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Cover Letter uploaded</span>
            </div>
          )}
        </div>
        
        {!coverLetter && (
          <div>
            <input
              type="file"
              id="coverLetterUpload2"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Label htmlFor="coverLetterUpload2" asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Cover Letter
              </Button>
            </Label>
          </div>
        )}
      </CardFooter>

      {/* Guidance Dialog */}
      <AlertDialog open={showGuidance} onOpenChange={setShowGuidance}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Cover Letter Guidance</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 text-left mt-2">
                <p>
                  <span className="font-semibold">Purpose:</span> The cover letter serves as an introduction to your IND submission and provides FDA reviewers with a high-level overview of what's included.
                </p>
                
                <p>
                  <span className="font-semibold">Content:</span> A comprehensive cover letter should include:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Name of the drug product and its proposed indication</li>
                  <li>Brief description of the drug's mechanism of action</li>
                  <li>Type of submission (initial IND)</li>
                  <li>List of major components included in the submission</li>
                  <li>Any special considerations or requests (e.g., expedited review)</li>
                  <li>Contact information for questions</li>
                </ul>
                
                <p>
                  <span className="font-semibold">Format:</span> The cover letter should be on company letterhead and signed by an authorized representative of the sponsor.
                </p>
                
                <p className="text-blue-600 border-l-4 border-blue-600 pl-3 py-2 bg-blue-50">
                  <span className="font-semibold">Regulatory Note:</span> While the cover letter is not a technical part of the IND, it is the first document reviewers see. A clear, well-organized cover letter sets a positive tone for your submission. This document is mentioned in 21 CFR 312.23(a) as part of the required IND content.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Template Dialog */}
      <AlertDialog open={showTemplate} onOpenChange={setShowTemplate}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Cover Letter Template</AlertDialogTitle>
            <AlertDialogDescription>
              Below is a sample template for your IND cover letter. You can copy this text and customize it for your submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="bg-gray-50 p-4 rounded border text-sm font-mono whitespace-pre-wrap">
            {templateContent}
          </div>
          
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => {
              navigator.clipboard.writeText(templateContent);
              alert('Template copied to clipboard');
            }}>
              Copy to Clipboard
            </Button>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}