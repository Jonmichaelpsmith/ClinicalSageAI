import React, { useState } from 'react';
import { 
  FileUp, 
  FileCheck, 
  CheckCircle2,
  Settings,
  DownloadCloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * IND to eCTD Converter Component
 * 
 * This component facilitates the conversion from IND application format
 * to the Electronic Common Technical Document (eCTD) format required 
 * for regulatory submissions.
 */
const INDtoECTDConverter = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStatus, setConversionStatus] = useState('idle'); // idle | uploading | converting | complete | error
  const [conversionSettings, setConversionSettings] = useState({
    targetRegion: 'us',
    includeCoverLetter: true,
    validateAfterConversion: true,
    optimizePDFs: true,
    preserveBookmarks: true
  });
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setConversionProgress(0);
      setConversionStatus('idle');
    }
  };
  
  const handleSettingChange = (setting, value) => {
    setConversionSettings({
      ...conversionSettings,
      [setting]: value
    });
  };
  
  const startConversion = () => {
    if (!selectedFile) return;
    
    setConversionStatus('uploading');
    setConversionProgress(10);
    
    // This would be an actual API call in a real application
    setTimeout(() => {
      setConversionStatus('converting');
      setConversionProgress(30);
      
      // Simulate conversion progress
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 10);
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            setConversionStatus('complete');
            return 100;
          }
          return newProgress;
        });
      }, 600);
    }, 1500);
  };
  
  const renderProgressStatus = () => {
    switch(conversionStatus) {
      case 'idle':
        return null;
      case 'uploading':
        return (
          <Alert className="mt-4">
            <FileUp className="h-4 w-4" />
            <AlertTitle>Uploading</AlertTitle>
            <AlertDescription>
              Uploading your IND submission for conversion...
            </AlertDescription>
          </Alert>
        );
      case 'converting':
        return (
          <Alert className="mt-4">
            <Settings className="h-4 w-4" />
            <AlertTitle>Converting</AlertTitle>
            <AlertDescription>
              Converting your IND submission to eCTD format...
            </AlertDescription>
          </Alert>
        );
      case 'complete':
        return (
          <Alert className="mt-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Conversion Complete</AlertTitle>
            <AlertDescription className="text-green-700">
              Your IND submission has been successfully converted to eCTD format.
            </AlertDescription>
          </Alert>
        );
      case 'error':
        return (
          <Alert className="mt-4 bg-red-50 border-red-200">
            <FileCheck className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Conversion Error</AlertTitle>
            <AlertDescription className="text-red-700">
              An error occurred during the conversion process. Please try again.
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <label htmlFor="ind-file" className="text-sm font-medium">
          Upload IND Submission
        </label>
        <div className="flex flex-col space-y-2">
          <Input
            id="ind-file"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xml,.zip"
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          <p className="text-xs text-gray-500">
            Supported formats: PDF, DOC, DOCX, XML, ZIP (up to 500MB)
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Conversion Settings</CardTitle>
          <CardDescription>
            Configure how your IND submission will be converted to eCTD format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Region</label>
            <Select 
              value={conversionSettings.targetRegion}
              onValueChange={(value) => handleSettingChange('targetRegion', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Regions</SelectLabel>
                  <SelectItem value="us">United States (FDA)</SelectItem>
                  <SelectItem value="eu">European Union (EMA)</SelectItem>
                  <SelectItem value="jp">Japan (PMDA)</SelectItem>
                  <SelectItem value="ca">Canada (Health Canada)</SelectItem>
                  <SelectItem value="ch">Switzerland (Swissmedic)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="includeCoverLetter" 
              checked={conversionSettings.includeCoverLetter}
              onCheckedChange={(checked) => handleSettingChange('includeCoverLetter', checked)}
            />
            <label
              htmlFor="includeCoverLetter"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Include cover letter template
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="validateAfterConversion" 
              checked={conversionSettings.validateAfterConversion}
              onCheckedChange={(checked) => handleSettingChange('validateAfterConversion', checked)}
            />
            <label
              htmlFor="validateAfterConversion"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Validate eCTD structure after conversion
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="optimizePDFs" 
              checked={conversionSettings.optimizePDFs}
              onCheckedChange={(checked) => handleSettingChange('optimizePDFs', checked)}
            />
            <label
              htmlFor="optimizePDFs"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Optimize PDFs for eCTD compliance
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="preserveBookmarks" 
              checked={conversionSettings.preserveBookmarks}
              onCheckedChange={(checked) => handleSettingChange('preserveBookmarks', checked)}
            />
            <label
              htmlFor="preserveBookmarks"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Preserve document bookmarks and hyperlinks
            </label>
          </div>
        </CardContent>
      </Card>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced Options</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">PDF Standard</label>
                  <Select defaultValue="pdf-a">
                    <SelectTrigger>
                      <SelectValue placeholder="Select PDF standard" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf-a">PDF/A (Archival)</SelectItem>
                      <SelectItem value="pdf-ua">PDF/UA (Universal Access)</SelectItem>
                      <SelectItem value="pdf-standard">Standard PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Document Naming Convention</label>
                  <Select defaultValue="ectd-standard">
                    <SelectTrigger>
                      <SelectValue placeholder="Select naming convention" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ectd-standard">eCTD Standard</SelectItem>
                      <SelectItem value="fda-specific">FDA-Specific</SelectItem>
                      <SelectItem value="ema-specific">EMA-Specific</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Submission Metadata</label>
                <textarea 
                  className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                  placeholder="Enter any additional metadata for this submission..."
                ></textarea>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="space-y-4">
        <Button 
          onClick={startConversion} 
          disabled={!selectedFile || conversionStatus === 'uploading' || conversionStatus === 'converting'} 
          className="w-full"
        >
          {conversionStatus === 'complete' ? (
            <>
              <DownloadCloud className="h-4 w-4 mr-2" />
              Download Converted eCTD
            </>
          ) : (
            <>
              <FileCheck className="h-4 w-4 mr-2" />
              Convert to eCTD Format
            </>
          )}
        </Button>
        
        {(conversionStatus === 'uploading' || conversionStatus === 'converting') && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Conversion Progress</span>
              <span>{conversionProgress}%</span>
            </div>
            <Progress value={conversionProgress} className="h-2" />
          </div>
        )}
        
        {renderProgressStatus()}
      </div>
    </div>
  );
};

export default INDtoECTDConverter;