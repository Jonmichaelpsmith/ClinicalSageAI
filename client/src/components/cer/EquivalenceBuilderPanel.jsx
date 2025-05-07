import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  FileText, 
  Settings, 
  X, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Define feature categories based on MEDDEV 2.7/1 Rev 4 requirements
const featureCategories = [
  { value: 'clinical', label: 'Clinical Characteristics' },
  { value: 'technical', label: 'Technical Characteristics' },
  { value: 'biological', label: 'Biological Characteristics' },
  { value: 'materials', label: 'Materials' },
  { value: 'design', label: 'Design Features' },
  { value: 'principles', label: 'Principles of Operation' },
  { value: 'intended_use', label: 'Intended Use / Purpose' },
];

/**
 * This component allows users to build a structured equivalence justification
 * for Clinical Evaluation Reports.
 * 
 * It follows MEDDEV 2.7/1 Rev 4 requirements for device equivalence assessment
 * by allowing feature-by-feature comparison of the subject device with claimed
 * equivalent devices.
 */
export default function EquivalenceBuilderPanel({ onEquivalenceDataChange }) {
  const { toast } = useToast();
  
  // Device states
  const [subjectDevice, setSubjectDevice] = useState({
    name: '',
    manufacturer: '',
    model: '',
    description: ''
  });
  
  const [equivalentDevices, setEquivalentDevices] = useState([]);
  const [currentEquivalentDevice, setCurrentEquivalentDevice] = useState({
    id: null,
    name: '',
    manufacturer: '',
    model: '',
    description: '',
    features: [],
    overallRationale: ''
  });
  
  // Current feature state
  const [currentFeature, setCurrentFeature] = useState({
    id: null,
    category: '',
    name: '',
    subjectValue: '',
    equivalentValue: '',
    impact: 'none', // 'none', 'minor', 'moderate', 'significant'
    rationale: '',
    isEditing: false
  });
  
  // UI states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [isGeneratingRationale, setIsGeneratingRationale] = useState(false);
  const [rationaleSuggestion, setRationaleSuggestion] = useState('');
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [activeDeviceId, setActiveDeviceId] = useState(null);
  
  // Save whole equivalence data to parent
  useEffect(() => {
    if (subjectDevice.name && onEquivalenceDataChange) {
      const data = {
        subjectDevice,
        equivalentDevices
      };
      
      onEquivalenceDataChange(data);
    }
  }, [subjectDevice, equivalentDevices, onEquivalenceDataChange]);
  
  // Reset feature state
  const resetFeatureForm = () => {
    setCurrentFeature({
      id: null,
      category: '',
      name: '',
      subjectValue: '',
      equivalentValue: '',
      impact: 'none',
      rationale: '',
      isEditing: false
    });
  };
  
  // Reset equivalent device form
  const resetEquivalentDeviceForm = () => {
    setCurrentEquivalentDevice({
      id: null,
      name: '',
      manufacturer: '',
      model: '',
      description: '',
      features: [],
      overallRationale: ''
    });
  };
  
  // Add new equivalent device
  const addEquivalentDevice = () => {
    if (!currentEquivalentDevice.name || !currentEquivalentDevice.manufacturer) {
      toast({
        title: 'Missing information',
        description: 'Please provide at least a name and manufacturer for the equivalent device.',
        variant: 'destructive',
      });
      return;
    }
    
    const newDevice = {
      ...currentEquivalentDevice,
      id: Date.now().toString(),
      features: []
    };
    
    setEquivalentDevices([...equivalentDevices, newDevice]);
    setActiveDeviceId(newDevice.id);
    resetEquivalentDeviceForm();
    setIsDialogOpen(false);
    
    toast({
      title: 'Device added',
      description: `${newDevice.name} has been added as an equivalent device.`,
    });
  };
  
  // Update equivalent device
  const updateEquivalentDevice = () => {
    if (!currentEquivalentDevice.name || !currentEquivalentDevice.manufacturer) {
      toast({
        title: 'Missing information',
        description: 'Please provide at least a name and manufacturer for the equivalent device.',
        variant: 'destructive',
      });
      return;
    }
    
    const updatedDevices = equivalentDevices.map(device => 
      device.id === currentEquivalentDevice.id 
        ? { ...currentEquivalentDevice }
        : device
    );
    
    setEquivalentDevices(updatedDevices);
    resetEquivalentDeviceForm();
    setIsDialogOpen(false);
    
    toast({
      title: 'Device updated',
      description: `${currentEquivalentDevice.name} has been updated.`,
    });
  };
  
  // Delete equivalent device
  const deleteEquivalentDevice = (deviceId) => {
    setEquivalentDevices(equivalentDevices.filter(device => device.id !== deviceId));
    
    if (activeDeviceId === deviceId) {
      setActiveDeviceId(equivalentDevices.length > 1 ? equivalentDevices[0].id : null);
    }
    
    toast({
      title: 'Device removed',
      description: 'The equivalent device has been removed.',
    });
  };
  
  // Set device for editing
  const editEquivalentDevice = (device) => {
    setCurrentEquivalentDevice(device);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };
  
  // Add feature to equivalent device
  const addFeature = () => {
    if (!currentFeature.category || !currentFeature.name || !activeDeviceId) {
      toast({
        title: 'Missing information',
        description: 'Please provide all required feature information.',
        variant: 'destructive',
      });
      return;
    }
    
    const newFeature = {
      ...currentFeature,
      id: Date.now().toString()
    };
    
    const updatedDevices = equivalentDevices.map(device => {
      if (device.id === activeDeviceId) {
        return {
          ...device,
          features: [...device.features, newFeature]
        };
      }
      return device;
    });
    
    setEquivalentDevices(updatedDevices);
    resetFeatureForm();
    setIsFeatureDialogOpen(false);
    
    toast({
      title: 'Feature added',
      description: `${newFeature.name} comparison has been added.`,
    });
  };
  
  // Update feature
  const updateFeature = () => {
    if (!currentFeature.category || !currentFeature.name || !activeDeviceId) {
      toast({
        title: 'Missing information',
        description: 'Please provide all required feature information.',
        variant: 'destructive',
      });
      return;
    }
    
    const updatedDevices = equivalentDevices.map(device => {
      if (device.id === activeDeviceId) {
        return {
          ...device,
          features: device.features.map(feature => 
            feature.id === currentFeature.id 
              ? { ...currentFeature, isEditing: false }
              : feature
          )
        };
      }
      return device;
    });
    
    setEquivalentDevices(updatedDevices);
    resetFeatureForm();
    setIsFeatureDialogOpen(false);
    
    toast({
      title: 'Feature updated',
      description: `${currentFeature.name} comparison has been updated.`,
    });
  };
  
  // Delete feature
  const deleteFeature = (deviceId, featureId) => {
    const updatedDevices = equivalentDevices.map(device => {
      if (device.id === deviceId) {
        return {
          ...device,
          features: device.features.filter(feature => feature.id !== featureId)
        };
      }
      return device;
    });
    
    setEquivalentDevices(updatedDevices);
    
    toast({
      title: 'Feature removed',
      description: 'The feature comparison has been removed.',
    });
  };
  
  // Edit feature
  const editFeature = (feature) => {
    setCurrentFeature({
      ...feature,
      isEditing: true
    });
    setIsFeatureDialogOpen(true);
  };
  
  // Generate AI rationale for feature
  const generateFeatureRationale = async () => {
    if (!currentFeature.category || !currentFeature.name || !currentFeature.subjectValue || !currentFeature.equivalentValue) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all feature values before generating a rationale.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGeneratingRationale(true);
    
    try {
      // Get the active device
      const activeDevice = equivalentDevices.find(d => d.id === activeDeviceId);
      
      const response = await fetch('/api/cer/equivalence/feature-rationale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectDevice: {
            name: subjectDevice.name,
            feature: {
              category: currentFeature.category,
              name: currentFeature.name,
              value: currentFeature.subjectValue
            }
          },
          equivalentDevice: {
            name: activeDevice?.name || 'Equivalent device',
            feature: {
              category: currentFeature.category,
              name: currentFeature.name,
              value: currentFeature.equivalentValue
            }
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error generating rationale: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Determine impact based on AI assessment
      let suggestedImpact = 'none';
      const impactText = data.impact ? data.impact.toLowerCase() : '';
      
      if (impactText.includes('significant') || impactText.includes('high')) {
        suggestedImpact = 'significant';
      } else if (impactText.includes('moderate') || impactText.includes('medium')) {
        suggestedImpact = 'moderate';
      } else if (impactText.includes('minor') || impactText.includes('low')) {
        suggestedImpact = 'minor';
      }
      
      // Update the form with AI suggestions
      setCurrentFeature({
        ...currentFeature,
        impact: suggestedImpact,
        rationale: data.rationale || data.text || ''
      });
      
      setRationaleSuggestion(data.rationale || data.text || '');
      
      toast({
        title: 'Rationale generated',
        description: 'AI has provided a suggested rationale for this feature comparison.',
      });
    } catch (error) {
      console.error('Error generating rationale:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate rationale. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingRationale(false);
    }
  };
  
  // Generate overall equivalence assessment
  const generateOverallEquivalence = async (deviceId) => {
    const device = equivalentDevices.find(d => d.id === deviceId);
    
    if (!device || device.features.length === 0) {
      toast({
        title: 'Missing features',
        description: 'Please add feature comparisons before generating an overall assessment.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const response = await fetch('/api/cer/equivalence/overall-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectDevice,
          equivalentDevice: device
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error generating assessment: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update the device with the overall rationale
      const updatedDevices = equivalentDevices.map(d => {
        if (d.id === deviceId) {
          return {
            ...d,
            overallRationale: data.overallRationale || data.text || ''
          };
        }
        return d;
      });
      
      setEquivalentDevices(updatedDevices);
      
      toast({
        title: 'Assessment generated',
        description: 'Overall equivalence assessment has been generated.',
      });
    } catch (error) {
      console.error('Error generating overall assessment:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate overall assessment. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Get the active device
  const activeDevice = equivalentDevices.find(device => device.id === activeDeviceId);
  
  // Get impact badge color
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'significant':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'minor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };
  
  // Get impact label
  const getImpactLabel = (impact) => {
    switch (impact) {
      case 'significant':
        return 'Significant Difference';
      case 'moderate':
        return 'Moderate Difference';
      case 'minor':
        return 'Minor Difference';
      default:
        return 'No Significant Difference';
    }
  };
  
  // Calculate overall equivalence status
  const getEquivalenceStatus = (device) => {
    if (!device.features || device.features.length === 0) {
      return 'incomplete';
    }
    
    const hasMissingRationale = device.features.some(
      f => !f.rationale || f.rationale.trim() === ''
    );
    
    if (hasMissingRationale) {
      return 'incomplete';
    }
    
    const hasSignificantDifference = device.features.some(
      f => f.impact === 'significant'
    );
    
    if (hasSignificantDifference) {
      return 'not-equivalent';
    }
    
    // If there are many moderate differences, it might not be equivalent
    const moderateDifferences = device.features.filter(
      f => f.impact === 'moderate'
    ).length;
    
    if (moderateDifferences > 2 && device.features.length > 4) {
      return 'questionable';
    }
    
    return 'equivalent';
  };
  
  return (
    <div className="space-y-4">
      {/* Subject Device Section */}
      <div className="bg-white p-4 border border-[#E1DFDD] rounded">
        <div className="flex items-center justify-between border-b border-[#E1DFDD] pb-3 mb-3">
          <h3 className="text-base font-semibold text-[#323130]">Subject Device</h3>
          <Badge variant="outline" className="bg-[#E5F2FF] text-[#0F6CBD] text-xs border-[#0F6CBD] px-2 py-0.5">
            MEDDEV 2.7/1 Rev 4 Compliant
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subject-name" className="text-sm font-medium text-[#323130]">Device Name</Label>
            <Input
              id="subject-name"
              value={subjectDevice.name}
              onChange={(e) => setSubjectDevice({...subjectDevice, name: e.target.value})}
              className="h-9 border-[#E1DFDD] focus:border-[#0F6CBD] focus:ring-1 focus:ring-[#0F6CBD]"
              placeholder="e.g. OrthoFlex Medical Implant"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject-manufacturer" className="text-sm font-medium text-[#323130]">Manufacturer</Label>
            <Input
              id="subject-manufacturer"
              value={subjectDevice.manufacturer}
              onChange={(e) => setSubjectDevice({...subjectDevice, manufacturer: e.target.value})}
              className="h-9 border-[#E1DFDD] focus:border-[#0F6CBD] focus:ring-1 focus:ring-[#0F6CBD]"
              placeholder="e.g. OrthoFlex Medical, Inc."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject-model" className="text-sm font-medium text-[#323130]">Model/Version</Label>
            <Input
              id="subject-model"
              value={subjectDevice.model}
              onChange={(e) => setSubjectDevice({...subjectDevice, model: e.target.value})}
              className="h-9 border-[#E1DFDD] focus:border-[#0F6CBD] focus:ring-1 focus:ring-[#0F6CBD]"
              placeholder="e.g. OF-2025-A"
            />
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="subject-description" className="text-sm font-medium text-[#323130]">Brief Description</Label>
            <Textarea
              id="subject-description"
              value={subjectDevice.description}
              onChange={(e) => setSubjectDevice({...subjectDevice, description: e.target.value})}
              className="border-[#E1DFDD] focus:border-[#0F6CBD] focus:ring-1 focus:ring-[#0F6CBD] resize-none"
              placeholder="Enter a brief description of the device..."
              rows={3}
            />
          </div>
        </div>
      </div>
      
      {/* Equivalent Devices Section */}
      <div className="bg-white p-4 border border-[#E1DFDD] rounded">
        <div className="flex items-center justify-between border-b border-[#E1DFDD] pb-3 mb-3">
          <h3 className="text-base font-semibold text-[#323130]">Equivalent Devices</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-[#F5F5F5] text-[#616161] border-[#E1DFDD] px-2 py-0.5">
              {equivalentDevices.length} device{equivalentDevices.length !== 1 ? 's' : ''}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[#0F6CBD] border-[#0F6CBD] hover:bg-[#EFF6FC] hover:text-[#0F6CBD]"
              onClick={() => {
                resetEquivalentDeviceForm();
                setDialogMode('add');
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              <span>Add Device</span>
            </Button>
          </div>
        </div>
        
        {equivalentDevices.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 bg-[#FAF9F8] rounded border border-[#E1DFDD] text-center">
            <FileText className="h-8 w-8 text-[#A19F9D] mb-2" />
            <p className="text-sm text-[#323130] font-medium">No equivalent devices yet</p>
            <p className="text-xs text-[#616161] mt-1">Add equivalent devices to start building the comparison table</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Device tabs */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-[#E1DFDD]">
              {equivalentDevices.map((device) => (
                <Button
                  key={device.id}
                  variant={activeDeviceId === device.id ? "default" : "outline"}
                  className={activeDeviceId === device.id 
                    ? "bg-[#0F6CBD] hover:bg-[#115EA3] text-white" 
                    : "text-[#323130] hover:bg-[#F3F2F1]"}
                  onClick={() => setActiveDeviceId(device.id)}
                >
                  {device.name}
                  {getEquivalenceStatus(device) === 'equivalent' && (
                    <CheckCircle2 className="h-3.5 w-3.5 ml-1.5 text-green-500" />
                  )}
                  {getEquivalenceStatus(device) === 'not-equivalent' && (
                    <AlertCircle className="h-3.5 w-3.5 ml-1.5 text-red-500" />
                  )}
                </Button>
              ))}
            </div>
            
            {/* Active device details */}
            {activeDevice && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-[#323130]">{activeDevice.name}</h4>
                    <p className="text-xs text-[#616161]">
                      {activeDevice.manufacturer} {activeDevice.model ? `• ${activeDevice.model}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => editEquivalentDevice(activeDevice)}
                      className="h-8 text-[#323130] hover:bg-[#F3F2F1]"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteEquivalentDevice(activeDevice.id)}
                      className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
                
                {/* Device description */}
                {activeDevice.description && (
                  <div className="p-3 bg-[#FAF9F8] rounded border border-[#E1DFDD] mb-4">
                    <p className="text-sm text-[#323130]">{activeDevice.description}</p>
                  </div>
                )}
                
                {/* Features section */}
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-medium text-[#323130]">Feature Comparison Table</h5>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-[#0F6CBD] border-[#0F6CBD] hover:bg-[#EFF6FC] hover:text-[#0F6CBD]"
                    onClick={() => {
                      resetFeatureForm();
                      setIsFeatureDialogOpen(true);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    <span>Add Feature</span>
                  </Button>
                </div>
                
                {activeDevice.features.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-4 bg-[#FAF9F8] rounded border border-[#E1DFDD] text-center">
                    <p className="text-xs text-[#616161]">No features added yet. Click 'Add Feature' to begin the comparison.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-[#E1DFDD] rounded">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#FAF9F8]">
                          <TableHead className="w-1/4">Feature</TableHead>
                          <TableHead className="w-1/4">Subject Device</TableHead>
                          <TableHead className="w-1/4">Equivalent Device</TableHead>
                          <TableHead className="w-1/6">Difference</TableHead>
                          <TableHead className="w-1/12">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeDevice.features.map((feature) => (
                          <TableRow key={feature.id}>
                            <TableCell className="align-top">
                              <div className="text-sm font-medium">{feature.name}</div>
                              <Badge variant="outline" className="mt-1 text-xs bg-[#F5F5F5] text-[#616161] border-[#E1DFDD]">
                                {featureCategories.find(c => c.value === feature.category)?.label || feature.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{feature.subjectValue}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{feature.equivalentValue}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn("text-xs", getImpactColor(feature.impact))}>
                                {getImpactLabel(feature.impact)}
                              </Badge>
                              {feature.rationale && (
                                <div className="text-xs text-[#616161] mt-1 line-clamp-2">
                                  {feature.rationale}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => editFeature(feature)}
                                  className="h-7 w-7 text-[#323130] hover:bg-[#F3F2F1]"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => deleteFeature(activeDevice.id, feature.id)}
                                  className="h-7 w-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                {/* Overall Equivalence Rationale */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-[#323130]">Overall Equivalence Assessment</h5>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={activeDevice.features.length === 0}
                      onClick={() => generateOverallEquivalence(activeDevice.id)}
                      className="h-8 text-[#0F6CBD] border-[#0F6CBD] hover:bg-[#EFF6FC] hover:text-[#0F6CBD]"
                    >
                      <Settings className="h-3.5 w-3.5 mr-1.5" />
                      <span>Generate Assessment</span>
                    </Button>
                  </div>
                  
                  {/* Display equivalence status */}
                  <div className="mb-2">
                    {getEquivalenceStatus(activeDevice) === 'equivalent' && (
                      <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                        Equivalent
                      </Badge>
                    )}
                    {getEquivalenceStatus(activeDevice) === 'not-equivalent' && (
                      <Badge className="text-xs bg-red-100 text-red-800 border-red-200">
                        Not Equivalent
                      </Badge>
                    )}
                    {getEquivalenceStatus(activeDevice) === 'questionable' && (
                      <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                        Questionable Equivalence
                      </Badge>
                    )}
                    {getEquivalenceStatus(activeDevice) === 'incomplete' && (
                      <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                        Assessment Incomplete
                      </Badge>
                    )}
                  </div>
                  
                  {activeDevice.overallRationale ? (
                    <div className="p-3 bg-[#FAF9F8] rounded border border-[#E1DFDD] text-sm">
                      {activeDevice.overallRationale.split("\n").map((paragraph, i) => (
                        <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-[#FAF9F8] rounded border border-[#E1DFDD] text-center">
                      <p className="text-xs text-[#616161]">
                        {activeDevice.features.length === 0 
                          ? "Add features to enable overall assessment generation" 
                          : "Click 'Generate Assessment' to create an overall equivalence justification"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Add/Edit Device Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Add Equivalent Device' : 'Edit Device'}</DialogTitle>
            <DialogDescription>
              Enter the details of the device you want to compare with your subject device.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="device-name" className="text-sm font-medium">Device Name</Label>
              <Input
                id="device-name"
                placeholder="e.g. CompetitorFlex Implant"
                value={currentEquivalentDevice.name}
                onChange={(e) => setCurrentEquivalentDevice({...currentEquivalentDevice, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="device-manufacturer" className="text-sm font-medium">Manufacturer</Label>
              <Input
                id="device-manufacturer"
                placeholder="e.g. Competitor Medical Ltd."
                value={currentEquivalentDevice.manufacturer}
                onChange={(e) => setCurrentEquivalentDevice({...currentEquivalentDevice, manufacturer: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="device-model" className="text-sm font-medium">Model/Version (Optional)</Label>
              <Input
                id="device-model"
                placeholder="e.g. CF-100"
                value={currentEquivalentDevice.model}
                onChange={(e) => setCurrentEquivalentDevice({...currentEquivalentDevice, model: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="device-description" className="text-sm font-medium">
                Brief Description (Optional)
              </Label>
              <Textarea
                id="device-description"
                placeholder="Brief description of the device..."
                rows={3}
                value={currentEquivalentDevice.description}
                onChange={(e) => setCurrentEquivalentDevice({...currentEquivalentDevice, description: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={dialogMode === 'add' ? addEquivalentDevice : updateEquivalentDevice}
              className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white"
            >
              {dialogMode === 'add' ? 'Add Device' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add/Edit Feature Dialog */}
      <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentFeature.isEditing ? 'Edit Feature Comparison' : 'Add Feature Comparison'}</DialogTitle>
            <DialogDescription>
              Compare a specific feature between your subject device and the equivalent device.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feature-category" className="text-sm font-medium">Feature Category</Label>
                <Select 
                  value={currentFeature.category} 
                  onValueChange={(value) => setCurrentFeature({...currentFeature, category: value})}
                >
                  <SelectTrigger id="feature-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categories</SelectLabel>
                      {featureCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feature-name" className="text-sm font-medium">Feature Name</Label>
                <Input
                  id="feature-name"
                  placeholder="e.g. Material Composition"
                  value={currentFeature.name}
                  onChange={(e) => setCurrentFeature({...currentFeature, name: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject-value" className="text-sm font-medium">
                  Subject Device Value
                  <span className="text-xs text-[#616161] ml-1">
                    ({subjectDevice.name || 'Subject Device'})
                  </span>
                </Label>
                <Textarea
                  id="subject-value"
                  placeholder="e.g. Titanium alloy Ti-6Al-4V"
                  rows={3}
                  value={currentFeature.subjectValue}
                  onChange={(e) => setCurrentFeature({...currentFeature, subjectValue: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="equivalent-value" className="text-sm font-medium">
                  Equivalent Device Value
                  <span className="text-xs text-[#616161] ml-1">
                    ({activeDevice?.name || 'Equivalent Device'})
                  </span>
                </Label>
                <Textarea
                  id="equivalent-value"
                  placeholder="e.g. Titanium alloy Ti-6Al-4V with nickel coating"
                  rows={3}
                  value={currentFeature.equivalentValue}
                  onChange={(e) => setCurrentFeature({...currentFeature, equivalentValue: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="impact-assessment" className="text-sm font-medium">
                  Impact Assessment
                </Label>
                <Select 
                  value={currentFeature.impact} 
                  onValueChange={(value) => setCurrentFeature({...currentFeature, impact: value})}
                >
                  <SelectTrigger id="impact-assessment">
                    <SelectValue placeholder="Select impact level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Impact Levels</SelectLabel>
                      <SelectItem value="none">No Significant Difference</SelectItem>
                      <SelectItem value="minor">Minor Difference</SelectItem>
                      <SelectItem value="moderate">Moderate Difference</SelectItem>
                      <SelectItem value="significant">Significant Difference</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline"
                  disabled={isGeneratingRationale || !currentFeature.subjectValue || !currentFeature.equivalentValue}
                  onClick={generateFeatureRationale}
                  className="h-9 border-[#0F6CBD] text-[#0F6CBD] hover:bg-[#EFF6FC] hover:text-[#0F6CBD]"
                >
                  {isGeneratingRationale ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Generate AI Rationale</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rationale" className="text-sm font-medium">
                Rationale for Equivalence
              </Label>
              <Textarea
                id="rationale"
                placeholder="Explain why this difference does or does not impact safety and performance..."
                rows={4}
                value={currentFeature.rationale}
                onChange={(e) => setCurrentFeature({...currentFeature, rationale: e.target.value})}
              />
              <p className="text-xs text-[#616161]">
                Provide justification for why any differences do not affect safety or performance,
                per MEDDEV 2.7/1 Rev 4 requirements.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeatureDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={currentFeature.isEditing ? updateFeature : addFeature}
              className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white"
            >
              {currentFeature.isEditing ? 'Save Changes' : 'Add Feature'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}