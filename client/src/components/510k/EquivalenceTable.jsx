import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CircleCheck, Pencil, Save, X, FileText, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import FDA510kService from '../../services/FDA510kService';
import { useTenant } from '@/contexts/TenantContext';

/**
 * EquivalenceTable Component
 * 
 * This component displays a side-by-side comparison table between the user's device
 * and the selected predicate device, highlighting key attributes for substantial 
 * equivalence analysis.
 */
const EquivalenceTable = ({ deviceProfile, predicateDevice, onDraftGenerate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [equivalenceData, setEquivalenceData] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [deviations, setDeviations] = useState([]);
  
  const { currentOrganization } = useTenant();

  // Initialize table data when deviceProfile or predicateDevice changes
  useEffect(() => {
    if (deviceProfile && predicateDevice) {
      generateEquivalenceData();
    }
  }, [deviceProfile, predicateDevice]);

  // Generate the equivalence data for comparison
  const generateEquivalenceData = () => {
    // Define comparison categories and fields
    const categories = [
      {
        name: "Intended Use",
        fields: [
          { key: "indications", label: "Indications for Use" },
          { key: "targetPopulation", label: "Target Population" },
          { key: "anatomicalSites", label: "Anatomical Sites" }
        ]
      },
      {
        name: "Technology",
        fields: [
          { key: "operatingPrinciple", label: "Operating Principle" },
          { key: "mechanism", label: "Mechanism of Action" },
          { key: "energyType", label: "Energy Type/Source" }
        ]
      },
      {
        name: "Materials",
        fields: [
          { key: "patientContactMaterials", label: "Patient-Contact Materials" },
          { key: "coatings", label: "Coatings/Surface Treatments" },
          { key: "sterilization", label: "Sterilization Method" }
        ]
      },
      {
        name: "Performance",
        fields: [
          { key: "accuracy", label: "Accuracy/Precision" },
          { key: "sensitivity", label: "Sensitivity/Specificity" },
          { key: "performanceSpecs", label: "Key Performance Specifications" }
        ]
      },
      {
        name: "Safety",
        fields: [
          { key: "safetyFeatures", label: "Safety Features" },
          { key: "riskControls", label: "Risk Control Measures" },
          { key: "warnings", label: "Warnings/Contraindications" }
        ]
      }
    ];

    // Extract data for comparison
    const data = [];
    const newDeviations = [];
    
    categories.forEach(category => {
      const categoryData = {
        category: category.name,
        fields: []
      };
      
      category.fields.forEach(field => {
        // Get subject device value (from device profile)
        const subjectValue = getNestedValue(deviceProfile, field.key) || 'Not specified';
        
        // Get predicate device value
        const predicateValue = getNestedValue(predicateDevice, field.key) || 'Not specified';
        
        // Determine if there's a significant deviation
        const hasMajorDeviation = detectMajorDeviation(subjectValue, predicateValue);
        
        if (hasMajorDeviation) {
          newDeviations.push({
            category: category.name,
            field: field.label,
            key: field.key
          });
        }
        
        categoryData.fields.push({
          key: field.key,
          label: field.label,
          subjectValue,
          predicateValue,
          hasMajorDeviation
        });
      });
      
      data.push(categoryData);
    });
    
    setEquivalenceData(data);
    setDeviations(newDeviations);
  };

  // Safely get nested value from an object using key path
  const getNestedValue = (obj, keyPath) => {
    if (!obj) return null;
    
    const keys = keyPath.split('.');
    let value = obj;
    
    for (const key of keys) {
      if (value === null || value === undefined || !value.hasOwnProperty(key)) {
        return null;
      }
      value = value[key];
    }
    
    return value;
  };

  // Detect if there's a major deviation between subject and predicate values
  const detectMajorDeviation = (subjectValue, predicateValue) => {
    if (!subjectValue || !predicateValue) return false;
    
    // Simple string comparison for now
    // In a real implementation, this would use more sophisticated comparison logic
    if (typeof subjectValue === 'string' && typeof predicateValue === 'string') {
      // Remove whitespace and convert to lowercase for comparison
      const normalizedSubject = subjectValue.toLowerCase().replace(/\s+/g, ' ').trim();
      const normalizedPredicate = predicateValue.toLowerCase().replace(/\s+/g, ' ').trim();
      
      // Check for significant word differences
      const subjectWords = new Set(normalizedSubject.split(/\W+/).filter(w => w.length > 3));
      const predicateWords = new Set(normalizedPredicate.split(/\W+/).filter(w => w.length > 3));
      
      // Calculate similarity score
      let commonCount = 0;
      for (const word of subjectWords) {
        if (predicateWords.has(word)) commonCount++;
      }
      
      const similarity = commonCount / Math.max(subjectWords.size, predicateWords.size, 1);
      
      return similarity < 0.5; // Threshold for major deviation
    }
    
    return false;
  };

  // Start editing a field
  const handleEdit = (field) => {
    setEditingField(field);
    setEditValue(field.subjectValue);
  };

  // Save edited field
  const handleSave = (categoryIndex, fieldIndex) => {
    const newData = [...equivalenceData];
    const field = newData[categoryIndex].fields[fieldIndex];
    
    field.subjectValue = editValue;
    field.hasMajorDeviation = detectMajorDeviation(editValue, field.predicateValue);
    
    setEquivalenceData(newData);
    setEditingField(null);
    
    // Update deviations list
    updateDeviations();
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingField(null);
  };

  // Update deviations list after edits
  const updateDeviations = () => {
    const newDeviations = [];
    
    equivalenceData.forEach(category => {
      category.fields.forEach(field => {
        if (field.hasMajorDeviation) {
          newDeviations.push({
            category: category.category,
            field: field.label,
            key: field.key
          });
        }
      });
    });
    
    setDeviations(newDeviations);
  };

  // Generate substantial equivalence draft
  const handleGenerateDraft = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const payload = {
        deviceProfile,
        predicateProfile: predicateDevice,
        equivalenceData
      };
      
      const response = await FDA510kService.draftEquivalence(
        payload,
        currentOrganization?.id
      );
      
      if (response.success && response.draftText) {
        if (onDraftGenerate) {
          onDraftGenerate(response.draftText);
        }
      } else {
        setError(response.error || 'Failed to generate equivalence draft.');
      }
    } catch (err) {
      console.error('Draft equivalence error:', err);
      setError('An error occurred while generating the draft. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!deviceProfile || !predicateDevice) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Substantial Equivalence Analysis</CardTitle>
          <CardDescription>
            Select a predicate device to begin the equivalence analysis
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <ArrowRightLeft className="h-5 w-5 mr-2 text-primary" />
          Substantial Equivalence Analysis
        </CardTitle>
        <CardDescription>
          Compare your device with the selected predicate device
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="font-medium">Your Device vs. Predicate Device</h4>
              <p className="text-sm text-muted-foreground">
                Edit your device's attributes to refine the comparison
              </p>
            </div>
            
            {deviations.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="destructive" className="flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {deviations.length} Major Deviation{deviations.length !== 1 ? 's' : ''}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Major deviations may require additional testing or justification</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <ScrollArea className="h-[400px] rounded-md border">
            <div className="p-1">
              {equivalenceData.map((category, categoryIndex) => (
                <div key={category.category} className="mb-4">
                  <h5 className="font-medium text-sm bg-muted px-3 py-2 rounded-md">
                    {category.category}
                  </h5>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Attribute</TableHead>
                        <TableHead>Your Device</TableHead>
                        <TableHead>Predicate Device</TableHead>
                        <TableHead className="w-[50px]">Edit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {category.fields.map((field, fieldIndex) => (
                        <TableRow key={field.key} className={field.hasMajorDeviation ? "bg-destructive/10" : ""}>
                          <TableCell className="font-medium">{field.label}</TableCell>
                          <TableCell>
                            {editingField === field ? (
                              <div className="flex flex-col space-y-2">
                                <Textarea
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="min-h-[80px]"
                                />
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    onClick={() => handleSave(categoryIndex, fieldIndex)}
                                  >
                                    <Save className="h-4 w-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={handleCancel}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="overflow-hidden">
                                  {field.subjectValue}
                                </div>
                                {field.hasMajorDeviation && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <AlertTriangle className="h-4 w-4 text-destructive ml-2 flex-shrink-0" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Major deviation detected</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{field.predicateValue}</TableCell>
                          <TableCell>
                            {editingField !== field && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleEdit(field)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div>
          {deviations.length > 0 && (
            <p className="text-sm text-destructive flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {deviations.length} major deviation{deviations.length !== 1 ? 's' : ''} detected. 
              Consider addressing these before submitting.
            </p>
          )}
        </div>
        
        <Button 
          onClick={handleGenerateDraft}
          disabled={isLoading}
          className="ml-auto"
        >
          <FileText className="h-4 w-4 mr-2" />
          Draft SE Section
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EquivalenceTable;