import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, AlertTriangle, Info, FileCheck, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';

/**
 * Document Intake Form Component
 * 
 * This component displays the extracted data from documents and allows
 * users to review, edit, and apply it to the device profile.
 * 
 * @param {Object} props
 * @param {Object} props.extractedData - The extracted data from documents
 * @param {string} props.regulatoryContext - The regulatory context (510k, cer, etc.)
 * @param {Function} props.onApplyData - Callback for when data is applied
 */
const DocumentIntakeForm = ({
  extractedData = null,
  regulatoryContext = '510k',
  onApplyData
}) => {
  const [formData, setFormData] = useState({});
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedFields, setSelectedFields] = useState({});
  const [editedFields, setEditedFields] = useState({});
  const [validationError, setValidationError] = useState(null);
  const { toast } = useToast();

  // Initialize form data from extracted data
  useEffect(() => {
    if (extractedData) {
      setFormData(extractedData);
      
      // Initialize all checkboxes as checked
      const initialSelectedFields = {};
      Object.keys(extractedData).forEach(key => {
        initialSelectedFields[key] = true;
      });
      setSelectedFields(initialSelectedFields);
    }
  }, [extractedData]);

  // Toggle selection for a field
  const toggleFieldSelection = (fieldName) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  // Handle field value change
  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Mark field as edited
    setEditedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  // Validate the extracted data against regulatory requirements
  const validateData = async () => {
    if (!formData) {
      setValidationError('No data to validate.');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const results = await documentIntelligenceService.validateExtractedData(
        formData,
        regulatoryContext
      );
      
      setValidationResults(results);
      
      // Show toast based on validation results
      if (results.valid) {
        toast({
          title: 'Validation Successful',
          description: 'The extracted data meets regulatory requirements.',
          variant: 'success',
        });
      } else {
        toast({
          title: 'Validation Warning',
          description: 'Some fields may need attention. Please review the validation results.',
          variant: 'warning',
        });
      }
    } catch (error) {
      console.error('Error validating data:', error);
      setValidationError(error.message || 'An error occurred during validation.');
      
      toast({
        title: 'Validation Failed',
        description: error.message || 'An error occurred during validation.',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Apply the selected fields to the device profile
  const applyData = () => {
    // Create a new object with only the selected fields
    const selectedData = {};
    Object.keys(selectedFields).forEach(key => {
      if (selectedFields[key]) {
        selectedData[key] = formData[key];
      }
    });
    
    // Call the callback with the selected data
    if (onApplyData) {
      onApplyData(selectedData);
    }
  };

  // Get the field label from a camelCase field name
  const getFieldLabel = (fieldName) => {
    if (!fieldName) return '';
    
    // Handle special cases
    if (fieldName === 'id') return 'ID';
    if (fieldName === 'ifu') return 'IFU';
    if (fieldName === 'ndc') return 'NDC';
    if (fieldName === 'fda') return 'FDA';
    
    // Convert camelCase to Title Case with spaces
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  // Get the appropriate validation icon for a field
  const getValidationIcon = (fieldName) => {
    if (!validationResults || !validationResults.fieldResults) return null;
    
    const fieldResult = validationResults.fieldResults[fieldName];
    if (!fieldResult) return null;
    
    if (fieldResult.valid) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
  };

  // Determine if a field has been edited
  const isFieldEdited = (fieldName) => {
    return editedFields[fieldName] || false;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Review Extracted Data</CardTitle>
          <CardDescription>
            Review the data extracted from your documents and apply it to your device profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!extractedData && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Data Available</AlertTitle>
              <AlertDescription>No data has been extracted from documents yet.</AlertDescription>
            </Alert>
          )}
          
          {extractedData && (
            <>
              {/* Validation Controls */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Extracted Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Review and edit the extracted data before applying it to your device profile.
                  </p>
                </div>
                <Button
                  onClick={validateData}
                  disabled={isValidating || !extractedData}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isValidating ? 'Validating...' : 'Validate Data'}
                  <FileCheck className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Validation Error */}
              {validationError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Validation Error</AlertTitle>
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}
              
              {/* Validation Results */}
              {validationResults && (
                <Alert 
                  variant={validationResults.valid ? 'success' : 'warning'}
                  className={validationResults.valid ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}
                >
                  {validationResults.valid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                  <AlertTitle className={validationResults.valid ? 'text-green-800' : 'text-amber-800'}>
                    {validationResults.valid ? 'Validation Successful' : 'Validation Warning'}
                  </AlertTitle>
                  <AlertDescription className={validationResults.valid ? 'text-green-700' : 'text-amber-700'}>
                    {validationResults.message}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Extracted Data Fields */}
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {Object.keys(formData).map((fieldName) => (
                    <div key={fieldName} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`select-${fieldName}`}
                            checked={selectedFields[fieldName] || false}
                            onCheckedChange={() => toggleFieldSelection(fieldName)}
                          />
                          <Label 
                            htmlFor={`select-${fieldName}`}
                            className="font-medium cursor-pointer"
                          >
                            {getFieldLabel(fieldName)}
                          </Label>
                          {isFieldEdited(fieldName) && (
                            <Badge variant="outline" className="text-xs">
                              Edited
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getValidationIcon(fieldName)}
                          {validationResults?.fieldResults?.[fieldName]?.confidence && (
                            <span className="text-xs text-muted-foreground">
                              {Math.round(validationResults.fieldResults[fieldName].confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Input
                        value={formData[fieldName] || ''}
                        onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                        disabled={!selectedFields[fieldName]}
                        className={`${validationResults?.fieldResults?.[fieldName]?.valid === false ? 'border-amber-300' : ''}`}
                      />
                      
                      {validationResults?.fieldResults?.[fieldName]?.message && (
                        <p className="text-xs text-amber-600">
                          {validationResults.fieldResults[fieldName].message}
                        </p>
                      )}
                      
                      <Separator className="my-2" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">
            Reset Changes
          </Button>
          <Button
            onClick={applyData}
            disabled={!extractedData || Object.keys(selectedFields).length === 0}
            className="flex items-center gap-2"
          >
            Apply to Device Profile
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DocumentIntakeForm;