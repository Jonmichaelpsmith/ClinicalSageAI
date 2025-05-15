import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitCompare, ArrowRight, Check, Loader2, FileCheck, X, ChevronDown, ChevronUp, Info, Save, FileText, BookOpen, Calendar, BarChart2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { FDA510kService } from "@/services/FDA510kService";
import LiteratureTab from "./LiteratureTab";

/**
 * Equivalence Builder Panel for 510(k) Submissions
 * 
 * This component allows users to build a substantial equivalence argument
 * for their 510(k) submission by comparing their device to predicate devices.
 */
const EquivalenceBuilderPanel = ({ 
  deviceProfile, 
  documentId, 
  onComplete,
  predicateDevices = [],
  selectedLiterature = []
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [comparisonFeatures, setComparisonFeatures] = useState([
    { id: 'f1', name: 'Intended Use', subjectDevice: deviceProfile?.intendedUse || '', predicateDevice: '', substantial: true, comments: '' },
    { id: 'f2', name: 'Indications for Use', subjectDevice: '', predicateDevice: '', substantial: null, comments: '' },
    { id: 'f3', name: 'Technology', subjectDevice: '', predicateDevice: '', substantial: null, comments: '' },
    { id: 'f4', name: 'Materials', subjectDevice: '', predicateDevice: '', substantial: null, comments: '' },
    { id: 'f5', name: 'Performance', subjectDevice: '', predicateDevice: '', substantial: null, comments: '' },
    { id: 'f6', name: 'Safety', subjectDevice: '', predicateDevice: '', substantial: null, comments: '' },
    { id: 'f7', name: 'Standards Compliance', subjectDevice: deviceProfile?.technicalSpecifications || '', predicateDevice: '', substantial: null, comments: '' }
  ]);
  const [selectedPredicateDevice, setSelectedPredicateDevice] = useState(predicateDevices?.[0]?.id || '');
  const [summaryStatement, setSummaryStatement] = useState('');
  const [equivalenceComplete, setEquivalenceComplete] = useState(false);
  const [literatureEvidence, setLiteratureEvidence] = useState({});
  const [activeFeatureForEvidence, setActiveFeatureForEvidence] = useState(null);
  const { toast } = useToast();
  
  // Initialize with predicate devices data
  useEffect(() => {
    if (predicateDevices?.length > 0 && !selectedPredicateDevice) {
      setSelectedPredicateDevice(predicateDevices[0].id);
    }
  }, [predicateDevices, selectedPredicateDevice]);
  
  // Process selected literature
  useEffect(() => {
    if (selectedLiterature?.length > 0) {
      const evidenceMap = {};
      
      // Organize literature evidence by relevant feature
      selectedLiterature.forEach(paper => {
        if (paper.relevantFeatures) {
          paper.relevantFeatures.forEach(feature => {
            if (!evidenceMap[feature]) {
              evidenceMap[feature] = [];
            }
            evidenceMap[feature].push(paper);
          });
        }
      });
      
      setLiteratureEvidence(evidenceMap);
    }
  }, [selectedLiterature]);
  
  // Load saved analysis from Document Vault if available
  useEffect(() => {
    async function loadSavedAnalysis() {
      if (!deviceProfile?.folderStructure?.equivalenceFolderId) {
        return;
      }
      
      try {
        setIsAnalyzing(true);
        setProgress(30);
        
        // Fetch the latest analysis
        const result = await FDA510kService.getLatestEquivalenceAnalysis(
          deviceProfile.folderStructure.equivalenceFolderId,
          deviceProfile.id
        );
        
        setProgress(70);
        
        if (result?.success && result.analysis) {
          // Update state with saved analysis data
          const savedAnalysis = result.analysis;
          
          // If there's a predicate device ID, set it
          if (savedAnalysis.predicateDeviceId) {
            setSelectedPredicateDevice(savedAnalysis.predicateDeviceId);
          }
          
          // If there are comparison features, merge them with the current ones
          if (savedAnalysis.features && savedAnalysis.features.length > 0) {
            setComparisonFeatures(prev => {
              // Create a map of existing features
              const featureMap = new Map(prev.map(f => [f.id, f]));
              
              // Update with saved features where IDs match
              savedAnalysis.features.forEach(savedFeature => {
                if (featureMap.has(savedFeature.id)) {
                  const existingFeature = featureMap.get(savedFeature.id);
                  featureMap.set(savedFeature.id, {
                    ...existingFeature,
                    ...savedFeature
                  });
                }
              });
              
              return Array.from(featureMap.values());
            });
          }
          
          // Set summary statement if available
          if (savedAnalysis.summary) {
            setSummaryStatement(savedAnalysis.summary);
          }
          
          // Load literature data if available
          if (savedAnalysis.literature) {
            if (savedAnalysis.literature.selectedPapers) {
              setSelectedLiterature(savedAnalysis.literature.selectedPapers);
            }
            
            if (savedAnalysis.literature.featureEvidence) {
              setLiteratureEvidence(savedAnalysis.literature.featureEvidence);
            }
          }
          
          // Set completion status if this is a completed analysis
          if (savedAnalysis.status === 'completed' || savedAnalysis.completedAt) {
            setEquivalenceComplete(true);
          }
          
          toast({
            title: "Analysis Loaded",
            description: "Previously saved equivalence analysis has been loaded.",
            variant: "success"
          });
        }
      } catch (error) {
        console.error('Error loading saved analysis:', error);
        toast({
          title: "Load Error",
          description: "Unable to load previously saved analysis.",
          variant: "warning"
        });
      } finally {
        setIsAnalyzing(false);
        setProgress(0);
      }
    }
    
    loadSavedAnalysis();
  }, [deviceProfile?.id, deviceProfile?.folderStructure?.equivalenceFolderId, toast]);
  
  // Generate a summary statement based on the comparison
  const generateSummaryStatement = () => {
    const subjectDeviceName = deviceProfile?.deviceName || 'Subject Device';
    const predicateDevice = predicateDevices.find(d => d.id === selectedPredicateDevice);
    const predicateDeviceName = predicateDevice?.deviceName || predicateDevice?.name || 'Predicate Device';
    
    // Count "substantial equivalence" true items
    const substantialCount = comparisonFeatures.filter(f => f.substantial === true).length;
    const totalFeatures = comparisonFeatures.length;
    const equivalencePercentage = Math.round((substantialCount / totalFeatures) * 100);
    
    // Count literature evidence
    const literatureCount = Object.keys(literatureEvidence).length;
    const totalPapers = selectedLiterature.length;
    const literatureStatement = totalPapers > 0 
      ? ` This determination is supported by ${totalPapers} academic publication${totalPapers > 1 ? 's' : ''} providing evidence for ${literatureCount} key device characteristics.`
      : '';
    
    // Generate a summary statement
    if (equivalencePercentage >= 80) {
      return `${subjectDeviceName} has demonstrated substantial equivalence to ${predicateDeviceName} (${predicateDevice?.id || ''}) in ${substantialCount} out of ${totalFeatures} key characteristics (${equivalencePercentage}%), including intended use and technological characteristics. Any differences between the devices do not raise new questions of safety and effectiveness.${literatureStatement}`;
    } else if (equivalencePercentage >= 50) {
      return `${subjectDeviceName} is partially equivalent to ${predicateDeviceName} (${predicateDevice?.id || ''}) with ${substantialCount} out of ${totalFeatures} key characteristics (${equivalencePercentage}%) being substantially equivalent. Additional testing and documentation may be required to fully establish substantial equivalence.${literatureStatement}`;
    } else {
      return `${subjectDeviceName} shows limited equivalence to ${predicateDeviceName} (${predicateDevice?.id || ''}) with only ${substantialCount} out of ${totalFeatures} key characteristics (${equivalencePercentage}%) being substantially equivalent. Consider choosing a different predicate device or addressing the differences through additional testing and documentation.${literatureStatement}`;
    }
  };
  
  // Update a feature in the comparison
  const updateFeature = (id, field, value) => {
    setComparisonFeatures(prevFeatures =>
      prevFeatures.map(feature =>
        feature.id === id ? { ...feature, [field]: value } : feature
      )
    );
  };
  
  // Auto-populate predicate device information
  const autoPopulatePredicateInfo = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    
    try {
      // Find the selected predicate device
      const predicateDevice = predicateDevices.find(d => d.id === selectedPredicateDevice);
      
      if (!predicateDevice) {
        toast({
          title: "Error",
          description: "No predicate device selected.",
          variant: "destructive"
        });
        return;
      }
      
      // Simulate progressive analysis
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgress(prev => prev + 20);
      }
      
      // Update comparison features with predicate device information
      const updatedFeatures = [...comparisonFeatures];
      
      // Update Intended Use
      const intendedUseFeature = updatedFeatures.find(f => f.name === 'Intended Use');
      if (intendedUseFeature) {
        intendedUseFeature.predicateDevice = predicateDevice.intendedUse || '';
        // Auto-mark substantial if the intended uses are very similar
        const subjectIntendedUse = deviceProfile?.intendedUse?.toLowerCase() || '';
        const predicateIntendedUse = predicateDevice.intendedUse?.toLowerCase() || '';
        intendedUseFeature.substantial = 
          (subjectIntendedUse && predicateIntendedUse && 
           (subjectIntendedUse.includes(predicateIntendedUse) || 
            predicateIntendedUse.includes(subjectIntendedUse)));
      }
      
      // Auto-fill predicate device values based on device type
      const indications = updatedFeatures.find(f => f.name === 'Indications for Use');
      if (indications) {
        indications.predicateDevice = predicateDevice.intendedUse || '';
      }
      
      // Set default values for other fields
      updatedFeatures.forEach(feature => {
        if (!feature.predicateDevice && feature.name !== 'Intended Use' && feature.name !== 'Indications for Use') {
          // Generate a placeholder predicate feature value
          feature.predicateDevice = `${predicateDevice.deviceName || predicateDevice.name} ${feature.name.toLowerCase()} characteristics`;
        }
      });
      
      // Update state
      setComparisonFeatures(updatedFeatures);
      
      // Generate a summary statement
      setSummaryStatement(generateSummaryStatement());
      
      toast({
        title: "Auto-Population Complete",
        description: "Predicate device information has been populated. Please review and edit as needed.",
        variant: "success"
      });
    } catch (error) {
      console.error("Error auto-populating predicate info:", error);
      toast({
        title: "Error",
        description: "An error occurred while analyzing predicate device information.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setProgress(100);
    }
  };
  
  // Mark all uncompleted features as substantially equivalent
  const markAllSubstantial = () => {
    setComparisonFeatures(prevFeatures =>
      prevFeatures.map(feature => ({
        ...feature,
        substantial: feature.substantial === null ? true : feature.substantial
      }))
    );
    
    // Update summary
    setSummaryStatement(generateSummaryStatement());
    
    toast({
      title: "Features Updated",
      description: "All incomplete features have been marked as substantially equivalent.",
      variant: "success"
    });
  };
  
  // Complete the equivalence analysis
  const completeEquivalenceAnalysis = async () => {
    // Check if all features have been marked
    const incompleteFeatures = comparisonFeatures.filter(f => f.substantial === null);
    
    if (incompleteFeatures.length > 0) {
      toast({
        title: "Incomplete Analysis",
        description: `Please complete the analysis for all ${incompleteFeatures.length} remaining features.`,
        variant: "warning"
      });
      return;
    }
    
    // Set analyzing state to show progress
    setIsAnalyzing(true);
    setProgress(25);
    
    try {
      // Update summary if not already done
      const finalSummary = summaryStatement || generateSummaryStatement();
      if (!summaryStatement) {
        setSummaryStatement(finalSummary);
      }
      
      setProgress(50);
      
      // Check if we have Document Vault integration
      if (deviceProfile?.folderStructure?.equivalenceFolderId) {
        // Save equivalence analysis to Document Vault
        const equivalenceData = {
          deviceProfile: deviceProfile,
          predicateDeviceId: selectedPredicateDevice,
          predicateDevice: predicateDevices.find(p => p.id === selectedPredicateDevice),
          features: comparisonFeatures,
          summary: finalSummary,
          completedAt: new Date().toISOString(),
          // Include literature evidence in completed analysis
          literature: {
            selectedPapers: selectedLiterature,
            featureEvidence: literatureEvidence,
            count: selectedLiterature.length
          },
          analysis: {
            substantiallyEquivalent: comparisonFeatures.every(f => f.substantial === true),
            featuresCount: comparisonFeatures.length,
            equivalentFeaturesCount: comparisonFeatures.filter(f => f.substantial === true).length,
            nonEquivalentFeaturesCount: comparisonFeatures.filter(f => f.substantial === false).length,
            // Add literature statistics to analysis
            literaturesCount: selectedLiterature.length,
            featureWithEvidenceCount: Object.keys(literatureEvidence).length,
            literatureEvidenceRatio: selectedLiterature.length > 0 
              ? (Object.keys(literatureEvidence).length / comparisonFeatures.length).toFixed(2) 
              : 0
          }
        };
        
        // Create JSON blob for upload
        const jsonBlob = new Blob([JSON.stringify(equivalenceData, null, 2)], {
          type: 'application/json'
        });
        
        // Create file object for upload
        const jsonFile = new File([jsonBlob], 'equivalence-analysis.json', {
          type: 'application/json'
        });
        
        setProgress(75);
        
        // Upload to Document Vault
        await FDA510kService.saveEquivalenceAnalysis(
          deviceProfile.folderStructure.equivalenceFolderId,
          jsonFile,
          deviceProfile.id
        );
        
        console.log('Equivalence analysis saved to Document Vault successfully');
      }
      
      setProgress(100);
      
      // Mark as complete and call callback
      setEquivalenceComplete(true);
      
      if (onComplete) {
        onComplete({
          predicateDeviceId: selectedPredicateDevice,
          features: comparisonFeatures,
          summary: finalSummary
        });
      }
      
      toast({
        title: "Equivalence Analysis Complete",
        description: "Your substantial equivalence analysis has been saved. You can now proceed to the next step.",
        variant: "success"
      });
    } catch (error) {
      console.error('Error saving equivalence analysis:', error);
      toast({
        title: "Warning",
        description: "Analysis completed but there was an issue saving to Document Vault.",
        variant: "warning"
      });
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };
  
  // Render the overview tab
  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Substantial Equivalence Analysis</h3>
        <p className="text-blue-700">
          Substantial equivalence is a central concept in the FDA 510(k) process. A device is substantially equivalent if it has:
        </p>
        <ul className="list-disc pl-6 mt-2 text-blue-700 space-y-2">
          <li>The same intended use as the predicate device, <strong>AND</strong></li>
          <li>
            Either the same technological characteristics as the predicate device,
            <strong> OR</strong>
          </li>
          <li>
            Different technological characteristics that don't raise new questions 
            of safety and effectiveness, and is demonstrated to be as safe and effective 
            as the predicate.
          </li>
        </ul>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Subject Device</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Device Name:</span>
                <p className="text-base">{deviceProfile?.deviceName || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Manufacturer:</span>
                <p className="text-base">{deviceProfile?.manufacturer || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Intended Use:</span>
                <p className="text-sm">{deviceProfile?.intendedUse || 'Not specified'}</p>
              </div>
              {deviceProfile?.technicalSpecifications && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Technical Specifications:</span>
                  <p className="text-sm">{deviceProfile.technicalSpecifications}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Predicate Device</CardTitle>
          </CardHeader>
          <CardContent>
            {predicateDevices.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="predicateDevice">Select Predicate Device</Label>
                  <Select 
                    value={selectedPredicateDevice}
                    onValueChange={setSelectedPredicateDevice}
                  >
                    <SelectTrigger id="predicateDevice">
                      <SelectValue placeholder="Select a predicate device" />
                    </SelectTrigger>
                    <SelectContent>
                      {predicateDevices.map(device => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.deviceName || device.name} ({device.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedPredicateDevice && (
                  <div className="space-y-2">
                    {(() => {
                      const predicateDevice = predicateDevices.find(d => d.id === selectedPredicateDevice);
                      return (
                        <>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Device Name:</span>
                            <p className="text-base">{predicateDevice?.deviceName || predicateDevice?.name || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Manufacturer:</span>
                            <p className="text-base">{predicateDevice?.manufacturer || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Intended Use:</span>
                            <p className="text-sm">{predicateDevice?.intendedUse || 'Not specified'}</p>
                          </div>
                          {predicateDevice?.id && (
                            <div>
                              <span className="text-sm font-medium text-gray-500">510(k) Number:</span>
                              <p className="text-base">{predicateDevice.id}</p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-gray-500">No predicate devices selected.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Return to the Predicate Finder step to select predicate devices.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button 
          variant="outline" 
          disabled={predicateDevices.length === 0 || !selectedPredicateDevice || isAnalyzing}
          onClick={() => setSelectedTab('comparison')}
        >
          Start Manual Comparison
        </Button>
        <Button 
          disabled={predicateDevices.length === 0 || !selectedPredicateDevice || isAnalyzing}
          onClick={autoPopulatePredicateInfo}
          className="relative"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
              <span 
                className="absolute bottom-0 left-0 h-1 bg-blue-400 transition-all rounded-bl-md rounded-br-md"
                style={{ width: `${progress}%` }}
              />
            </>
          ) : (
            <>
              <GitCompare className="mr-2 h-4 w-4" />
              Analyze Predicate Device
            </>
          )}
        </Button>
      </div>
    </div>
  );
  
  // Render the comparison tab
  const renderComparisonTab = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">Instructions</h3>
            <p className="text-sm text-amber-700 mt-1">
              Complete the table below by comparing your device with the selected predicate device.
              Mark each feature as "Substantially Equivalent" if the feature is similar enough
              for FDA 510(k) purposes, or "Not Substantially Equivalent" if there are significant differences.
            </p>
          </div>
        </div>
      </div>
      
      <ScrollArea className="h-[450px] rounded-md">
        <div className="space-y-6">
          {comparisonFeatures.map((feature, index) => (
            <div 
              key={feature.id} 
              className={`p-4 border rounded-lg ${
                feature.substantial === true ? 'bg-green-50 border-green-200' :
                feature.substantial === false ? 'bg-red-50 border-red-200' :
                'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">{feature.name}</h3>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant={feature.substantial === true ? "default" : "outline"}
                    className={`h-9 ${
                      feature.substantial === true 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'border-green-200 text-green-700 hover:bg-green-50'
                    }`}
                    onClick={() => updateFeature(feature.id, 'substantial', true)}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Substantially Equivalent
                  </Button>
                  <Button 
                    size="sm" 
                    variant={feature.substantial === false ? "default" : "outline"}
                    className={`h-9 ${
                      feature.substantial === false 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'border-red-200 text-red-700 hover:bg-red-50'
                    }`}
                    onClick={() => updateFeature(feature.id, 'substantial', false)}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Not Substantially Equivalent
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <Label htmlFor={`subject-${feature.id}`} className="text-sm font-medium text-gray-700">
                    Subject Device
                  </Label>
                  <Textarea 
                    id={`subject-${feature.id}`}
                    value={feature.subjectDevice}
                    onChange={(e) => updateFeature(feature.id, 'subjectDevice', e.target.value)}
                    placeholder={`Enter your device's ${feature.name.toLowerCase()}...`}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`predicate-${feature.id}`} className="text-sm font-medium text-gray-700">
                    Predicate Device
                  </Label>
                  <Textarea 
                    id={`predicate-${feature.id}`}
                    value={feature.predicateDevice}
                    onChange={(e) => updateFeature(feature.id, 'predicateDevice', e.target.value)}
                    placeholder={`Enter predicate device's ${feature.name.toLowerCase()}...`}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor={`comments-${feature.id}`} className="text-sm font-medium text-gray-700">
                  Comments on {feature.name} Comparison
                </Label>
                <Textarea 
                  id={`comments-${feature.id}`}
                  value={feature.comments}
                  onChange={(e) => updateFeature(feature.id, 'comments', e.target.value)}
                  placeholder="Enter any comments or justification for your equivalence determination..."
                  className="mt-1"
                />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="pt-3 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setSelectedTab('overview')}
        >
          Back to Overview
        </Button>
        
        <div className="space-x-3">
          <Button 
            variant="outline" 
            onClick={markAllSubstantial}
          >
            Mark All Equivalent
          </Button>
          
          <Button 
            onClick={() => {
              setSummaryStatement(generateSummaryStatement());
              setSelectedTab('summary');
            }}
          >
            Generate Summary
          </Button>
        </div>
      </div>
    </div>
  );
  
  // Render the summary tab
  const renderSummaryTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="text-lg font-medium mb-3">Substantial Equivalence Summary</h3>
        
        {/* Summary statement */}
        <div className="mb-4">
          <Label htmlFor="summary-statement" className="text-sm font-medium text-gray-700">
            Summary Statement
          </Label>
          <Textarea 
            id="summary-statement"
            value={summaryStatement}
            onChange={(e) => setSummaryStatement(e.target.value)}
            placeholder="Enter a summary statement for your substantial equivalence determination..."
            className="mt-1"
            rows={4}
          />
        </div>
        
        {/* Stats on equivalence */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-3 rounded-md border text-center">
            <p className="text-sm text-gray-500 mb-1">Total Features</p>
            <p className="text-2xl font-bold text-gray-800">{comparisonFeatures.length}</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-md border border-green-100 text-center">
            <p className="text-sm text-green-700 mb-1">Substantially Equivalent</p>
            <p className="text-2xl font-bold text-green-700">
              {comparisonFeatures.filter(f => f.substantial === true).length}
            </p>
          </div>
          
          <div className="bg-red-50 p-3 rounded-md border border-red-100 text-center">
            <p className="text-sm text-red-700 mb-1">Not Substantially Equivalent</p>
            <p className="text-2xl font-bold text-red-700">
              {comparisonFeatures.filter(f => f.substantial === false).length}
            </p>
          </div>
        </div>
        
        {/* Literature evidence stats */}
        {selectedLiterature.length > 0 && (
          <div className="mt-2 mb-4">
            <h4 className="text-md font-medium mb-2">Literature Evidence</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-center">
                <p className="text-sm text-blue-700 mb-1">Academic Papers</p>
                <p className="text-2xl font-bold text-blue-700">{selectedLiterature.length}</p>
              </div>
              
              <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100 text-center">
                <p className="text-sm text-indigo-700 mb-1">Features with Evidence</p>
                <p className="text-2xl font-bold text-indigo-700">
                  {Object.keys(literatureEvidence).length}
                </p>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-md border border-purple-100 text-center">
                <p className="text-sm text-purple-700 mb-1">Evidence Coverage</p>
                <p className="text-2xl font-bold text-purple-700">
                  {comparisonFeatures.length > 0 
                    ? `${Math.round((Object.keys(literatureEvidence).length / comparisonFeatures.length) * 100)}%` 
                    : '0%'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Summary table of features */}
        <ScrollArea className="h-[250px] border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Substantial Equivalence</TableHead>
                {selectedLiterature.length > 0 && (
                  <TableHead>Literature Evidence</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonFeatures.map(feature => (
                <TableRow key={feature.id}>
                  <TableCell className="font-medium">{feature.name}</TableCell>
                  <TableCell>
                    {feature.substantial === true && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Substantially Equivalent
                      </Badge>
                    )}
                    {feature.substantial === false && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        Not Substantially Equivalent
                      </Badge>
                    )}
                    {feature.substantial === null && (
                      <Badge variant="outline" className="text-gray-500">
                        Not Determined
                      </Badge>
                    )}
                  </TableCell>
                  {selectedLiterature.length > 0 && (
                    <TableCell>
                      {literatureEvidence[feature.id] ? (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          {literatureEvidence[feature.id].length} {literatureEvidence[feature.id].length === 1 ? 'Paper' : 'Papers'}
                        </Badge>
                      ) : (
                        <span className="text-gray-500 text-sm">None</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      
      <div className="pt-3 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setSelectedTab('comparison')}
        >
          Back to Comparison
        </Button>
        
        <Button 
          onClick={completeEquivalenceAnalysis}
          disabled={equivalenceComplete}
        >
          {equivalenceComplete ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Equivalence Analysis Complete
            </>
          ) : (
            <>
              <FileCheck className="mr-2 h-4 w-4" />
              Complete Equivalence Analysis
            </>
          )}
        </Button>
      </div>
    </div>
  );
  
  // Render tabs
  const renderTabs = () => (
    <div className="mb-6 border-b">
      <div className="flex space-x-2">
        <Button 
          variant={selectedTab === 'overview' ? 'subtle' : 'ghost'} 
          className={`rounded-none border-b-2 ${
            selectedTab === 'overview' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-600'
          }`}
          onClick={() => setSelectedTab('overview')}
        >
          Overview
        </Button>
        <Button 
          variant={selectedTab === 'comparison' ? 'subtle' : 'ghost'} 
          className={`rounded-none border-b-2 ${
            selectedTab === 'comparison' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-600'
          }`}
          onClick={() => setSelectedTab('comparison')}
          disabled={predicateDevices.length === 0 || !selectedPredicateDevice}
        >
          Feature Comparison
        </Button>
        <Button 
          variant={selectedTab === 'literature' ? 'subtle' : 'ghost'} 
          className={`rounded-none border-b-2 ${
            selectedTab === 'literature' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-600'
          }`}
          onClick={() => setSelectedTab('literature')}
          disabled={selectedLiterature.length === 0}
        >
          Supporting Literature
        </Button>
        <Button 
          variant={selectedTab === 'summary' ? 'subtle' : 'ghost'} 
          className={`rounded-none border-b-2 ${
            selectedTab === 'summary' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-600'
          }`}
          onClick={() => {
            setSummaryStatement(generateSummaryStatement());
            setSelectedTab('summary');
          }}
          disabled={predicateDevices.length === 0 || !selectedPredicateDevice}
        >
          Summary
        </Button>
      </div>
    </div>
  );
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-blue-800 flex items-center">
          <GitCompare className="mr-2 h-5 w-5 text-blue-600" />
          Substantial Equivalence Analysis
        </CardTitle>
        <CardDescription>
          Demonstrate substantial equivalence to predicate devices for your 510(k) submission
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {renderTabs()}
        
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'comparison' && renderComparisonTab()}
        {selectedTab === 'literature' && <LiteratureTab selectedLiterature={selectedLiterature} literatureEvidence={literatureEvidence} />}
        {selectedTab === 'summary' && renderSummaryTab()}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
        <div className="flex items-center text-sm text-gray-600">
          {isAnalyzing && (
            <div className="mr-4 flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </div>
          )}
          {progress > 0 && (
            <div className="w-32">
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
        
        <div className="flex space-x-4">
          {deviceProfile?.folderStructure?.equivalenceFolderId && (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                setIsAnalyzing(true);
                setProgress(30);
                
                try {
                  // Save the current analysis to Document Vault
                  const equivalenceData = {
                    deviceProfile: deviceProfile,
                    predicateDeviceId: selectedPredicateDevice,
                    predicateDevice: predicateDevices.find(p => p.id === selectedPredicateDevice),
                    features: comparisonFeatures,
                    summary: summaryStatement || generateSummaryStatement(),
                    savedAt: new Date().toISOString(),
                    status: 'draft',
                    // Include literature evidence in saved data
                    literature: {
                      selectedPapers: selectedLiterature,
                      featureEvidence: literatureEvidence,
                      count: selectedLiterature.length
                    },
                    analysis: {
                      featuresCount: comparisonFeatures.length,
                      completedFeaturesCount: comparisonFeatures.filter(f => f.substantial !== null).length,
                      literaturesCount: selectedLiterature.length,
                      featureWithEvidenceCount: Object.keys(literatureEvidence).length
                    }
                  };
                  
                  setProgress(60);
                  
                  // Create JSON blob for upload
                  const jsonBlob = new Blob([JSON.stringify(equivalenceData, null, 2)], {
                    type: 'application/json'
                  });
                  
                  // Create file object for upload
                  const jsonFile = new File([jsonBlob], 'equivalence-analysis-draft.json', {
                    type: 'application/json'
                  });
                  
                  // Upload to Document Vault
                  await FDA510kService.saveEquivalenceAnalysis(
                    deviceProfile.folderStructure.equivalenceFolderId,
                    jsonFile,
                    deviceProfile.id
                  );
                  
                  setProgress(100);
                  
                  toast({
                    title: "Analysis Saved",
                    description: "Your current equivalence analysis has been saved to Document Vault.",
                    variant: "success"
                  });
                } catch (error) {
                  console.error('Error saving analysis to vault:', error);
                  toast({
                    title: "Save Error",
                    description: "There was an issue saving your analysis to Document Vault.",
                    variant: "destructive"
                  });
                } finally {
                  setIsAnalyzing(false);
                  setProgress(0);
                }
              }}
              disabled={isAnalyzing || !selectedPredicateDevice}
            >
              <Save className="mr-2 h-4 w-4" />
              Save to Document Vault
            </Button>
          )}
          
          <Button
            variant="primary"
            onClick={completeEquivalenceAnalysis}
            disabled={equivalenceComplete || isAnalyzing}
          >
            {equivalenceComplete ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Completed
              </>
            ) : (
              <>
                <FileCheck className="mr-2 h-4 w-4" />
                Complete Equivalence Analysis
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EquivalenceBuilderPanel;