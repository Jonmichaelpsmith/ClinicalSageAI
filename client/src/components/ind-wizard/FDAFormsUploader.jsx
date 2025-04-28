// /client/src/components/ind-wizard/FDAFormsUploader.jsx

import { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, HelpCircle, Trash2, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsItem, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function FDAFormsUploader({ setFormStatus }) {
  const [form1571, setForm1571] = useState(null);
  const [form1572, setForm1572] = useState(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const [activeTab, setActiveTab] = useState('form1571');
  const [uploadStatus, setUploadStatus] = useState({
    form1571: 'not_uploaded',
    form1572: 'not_uploaded'
  });

  // Handle file upload for Form 1571
  const handleForm1571Upload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, upload the file to server here
      setForm1571(file);
      setUploadStatus(prev => ({ ...prev, form1571: 'uploaded' }));
      setFormStatus(prev => ({ ...prev, form1571Uploaded: true }));
    }
  };

  // Handle file upload for Form 1572
  const handleForm1572Upload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, upload the file to server here
      setForm1572(file);
      setUploadStatus(prev => ({ ...prev, form1572: 'uploaded' }));
      setFormStatus(prev => ({ ...prev, form1572Uploaded: true }));
    }
  };

  // Handle deletion of Form 1571
  const handleDeleteForm1571 = () => {
    // In a real app, delete file from server here
    setForm1571(null);
    setUploadStatus(prev => ({ ...prev, form1571: 'not_uploaded' }));
    setFormStatus(prev => ({ ...prev, form1571Uploaded: false }));
  };

  // Handle deletion of Form 1572
  const handleDeleteForm1572 = () => {
    // In a real app, delete file from server here
    setForm1572(null);
    setUploadStatus(prev => ({ ...prev, form1572: 'not_uploaded' }));
    setFormStatus(prev => ({ ...prev, form1572Uploaded: false }));
  };

  // Handle downloading template
  const handleDownloadTemplate = (formType) => {
    // In a real app, this would download the actual template file
    console.log(`Downloading template for ${formType}`);
    alert(`In a production environment, this would download the ${formType} template`);
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              FDA Forms
            </CardTitle>
            <CardDescription className="mt-1">
              Upload the required FDA forms for your IND application.
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
        <Tabs defaultValue="form1571" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form1571" className="relative">
              Form FDA 1571
              {uploadStatus.form1571 === 'uploaded' && (
                <span className="absolute top-0 right-2 transform -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="form1572" className="relative">
              Form FDA 1572
              {uploadStatus.form1572 === 'uploaded' && (
                <span className="absolute top-0 right-2 transform -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="form1571" className="mt-6">
            <div className="space-y-4">
              <div className="bg-blue-50 rounded p-4 text-blue-800 text-sm">
                <h4 className="font-medium mb-1">Form FDA 1571: Investigational New Drug Application</h4>
                <p>This is the primary application form for an IND. It includes information about the sponsor, proposed indication, and drug development phase.</p>
              </div>
              
              {!form1571 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <h3 className="text-gray-700 font-medium mb-1">Upload Form FDA 1571</h3>
                    <p className="text-gray-500 text-sm mb-4">PDF or Word document (Max 10MB)</p>
                    
                    <div className="flex space-x-4">
                      <Button 
                        variant="outline" 
                        onClick={() => handleDownloadTemplate('Form FDA 1571')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Template
                      </Button>
                      
                      <div>
                        <input
                          type="file"
                          id="form1571Upload"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={handleForm1571Upload}
                        />
                        <Label htmlFor="form1571Upload" asChild>
                          <Button>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Form
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
                        <h4 className="font-medium">{form1571.name}</h4>
                        <p className="text-sm text-gray-500">
                          {(form1571.size / 1024).toFixed(2)} KB • Uploaded {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={handleDeleteForm1571}>
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center text-green-600 bg-green-50 px-3 py-2 rounded text-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Form FDA 1571 uploaded successfully
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="form1572" className="mt-6">
            <div className="space-y-4">
              <div className="bg-blue-50 rounded p-4 text-blue-800 text-sm">
                <h4 className="font-medium mb-1">Form FDA 1572: Statement of Investigator</h4>
                <p>This form must be completed by each clinical investigator participating in the clinical investigation. It includes investigator qualifications and commitments.</p>
              </div>
              
              {!form1572 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <h3 className="text-gray-700 font-medium mb-1">Upload Form FDA 1572</h3>
                    <p className="text-gray-500 text-sm mb-4">PDF or Word document (Max 10MB)</p>
                    
                    <div className="flex space-x-4">
                      <Button 
                        variant="outline" 
                        onClick={() => handleDownloadTemplate('Form FDA 1572')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Template
                      </Button>
                      
                      <div>
                        <input
                          type="file"
                          id="form1572Upload"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={handleForm1572Upload}
                        />
                        <Label htmlFor="form1572Upload" asChild>
                          <Button>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Form
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
                        <h4 className="font-medium">{form1572.name}</h4>
                        <p className="text-sm text-gray-500">
                          {(form1572.size / 1024).toFixed(2)} KB • Uploaded {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={handleDeleteForm1572}>
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center text-green-600 bg-green-50 px-3 py-2 rounded text-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Form FDA 1572 uploaded successfully
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div>
          {(uploadStatus.form1571 === 'uploaded' && uploadStatus.form1572 === 'uploaded') ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Both required forms uploaded</span>
            </div>
          ) : (
            <div className="flex items-center text-amber-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {(uploadStatus.form1571 === 'not_uploaded' && uploadStatus.form1572 === 'not_uploaded') ? 
                  'Both forms need to be uploaded' : 
                  (uploadStatus.form1571 === 'not_uploaded' ? 'Form FDA 1571 needs to be uploaded' : 'Form FDA 1572 needs to be uploaded')
                }
              </span>
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={() => setActiveTab(uploadStatus.form1571 === 'not_uploaded' ? 'form1571' : 'form1572')}
          disabled={uploadStatus.form1571 === 'uploaded' && uploadStatus.form1572 === 'uploaded'}
        >
          {uploadStatus.form1571 === 'not_uploaded' ? 'Upload Form 1571' : 'Upload Form 1572'}
        </Button>
      </CardFooter>

      {/* Guidance Dialog */}
      <AlertDialog open={showGuidance} onOpenChange={setShowGuidance}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>FDA Forms Guidance</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 text-left mt-2">
                <p>
                  <span className="font-semibold">Form FDA 1571:</span> This is the primary application form for an IND submission and must be completed by the sponsor. It includes information about:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Sponsor name and address</li>
                  <li>Name of the drug product</li>
                  <li>Indication(s) for which the drug is being studied</li>
                  <li>Phase(s) of clinical investigation</li>
                  <li>List of clinical investigators</li>
                  <li>Commitments to comply with FDA regulations</li>
                </ul>
                
                <p>
                  <span className="font-semibold">Form FDA 1572:</span> This "Statement of Investigator" form must be completed by each clinical investigator who will participate in the clinical investigation. It includes:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Investigator's name, address, and qualifications</li>
                  <li>Names of sub-investigators</li>
                  <li>Location(s) where the study will be conducted</li>
                  <li>Name and address of the research IRB</li>
                  <li>Commitments regarding protocol adherence and FDA regulations</li>
                </ul>
                
                <p className="text-blue-600 border-l-4 border-blue-600 pl-3 py-2 bg-blue-50">
                  <span className="font-semibold">Regulatory Note:</span> Both forms must be signed and dated. Electronic signatures compliant with 21 CFR Part 11 are acceptable. The most current versions of these forms should be used, as available on the FDA website.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}