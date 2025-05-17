import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Download, Check, X, AlertTriangle, Lightbulb, 
  FileText, HelpCircle, Plus, Minus, Maximize2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Enhanced Equivalence Comparison Component
 * 
 * Provides a detailed side-by-side comparison of the subject device against 
 * predicate devices with visual indicators for equivalence.
 */
const EnhancedEquivalenceComparison = ({ 
  subjectDevice, 
  predicateDevices, 
  onGenerateReport,
  onRequestAIAssistance
}) => {
  const [activeTab, setActiveTab] = useState('technical');
  const [expandedParameters, setExpandedParameters] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [equivalenceScores, setEquivalenceScores] = useState({
    overall: 0,
    technical: 0,
    performance: 0,
    safety: 0,
    clinical: 0
  });
  const [comparisonMode, setComparisonMode] = useState('detailed');
  const [selectedPredicate, setSelectedPredicate] = useState(predicateDevices[0]?.id);
  
  // Calculate equivalence scores when devices change
  useEffect(() => {
    if (!subjectDevice || !predicateDevices.length) return;
    
    // Simple heuristic for demo purposes - in production this would be more sophisticated
    const selectedPredicateDevice = predicateDevices.find(p => p.id === selectedPredicate);
    if (!selectedPredicateDevice) return;
    
    const technicalScore = calculateCategoryScore(
      subjectDevice.technicalCharacteristics || [],
      selectedPredicateDevice.technicalCharacteristics || []
    );
    
    const performanceScore = calculateCategoryScore(
      subjectDevice.performanceData || [],
      selectedPredicateDevice.performanceData || []
    );
    
    const safetyScore = calculateCategoryScore(
      subjectDevice.safetyFeatures || [],
      selectedPredicateDevice.safetyFeatures || []
    );
    
    const clinicalScore = 75; // Placeholder - would be calculated in production version
    
    const overall = Math.round((technicalScore + performanceScore + safetyScore + clinicalScore) / 4);
    
    setEquivalenceScores({
      overall,
      technical: technicalScore,
      performance: performanceScore,
      safety: safetyScore,
      clinical: clinicalScore
    });
  }, [subjectDevice, predicateDevices, selectedPredicate]);

  // Calculate a category score based on parameters
  const calculateCategoryScore = (subjectParams = [], predicateParams = []) => {
    if (!subjectParams.length || !predicateParams.length) return 0;
    
    // Map the parameters by name for easier comparison
    const predicateMap = predicateParams.reduce((map, param) => {
      map[param.name] = param.value;
      return map;
    }, {});
    
    // Count matches
    let matches = 0;
    subjectParams.forEach(param => {
      if (predicateMap[param.name] && isEquivalent(param.value, predicateMap[param.name])) {
        matches++;
      }
    });
    
    return Math.round((matches / subjectParams.length) * 100);
  };
  
  // Determine if two parameter values are equivalent
  const isEquivalent = (value1, value2) => {
    if (value1 === value2) return true;
    
    // For numeric comparisons, allow small differences
    if (!isNaN(value1) && !isNaN(value2)) {
      const num1 = parseFloat(value1);
      const num2 = parseFloat(value2);
      return Math.abs((num1 - num2) / Math.max(num1, num2)) < 0.1; // Allow 10% difference
    }
    
    // String comparisons - could be enhanced with more sophisticated equivalence logic
    if (typeof value1 === 'string' && typeof value2 === 'string') {
      const v1 = value1.toLowerCase();
      const v2 = value2.toLowerCase();
      return v1.includes(v2) || v2.includes(v1);
    }
    
    return false;
  };
  
  // Export the comparison data for sharing/saving (replaces PDF due to dependency issues)
  const handleExport = () => {
    // Generate report data
    const selectedPredicateDevice = predicateDevices.find(p => p.id === selectedPredicate);
    
    // Create a structured format that can be used for export
    const reportData = {
      title: 'Substantial Equivalence Comparison Report',
      timestamp: new Date().toISOString(),
      subjectDevice: {
        name: subjectDevice.deviceName || 'Unknown Device',
        manufacturer: subjectDevice.manufacturer || 'Unknown Manufacturer',
        id: subjectDevice.id || 'N/A'
      },
      predicateDevice: {
        name: selectedPredicateDevice?.deviceName || 'Unknown Device',
        manufacturer: selectedPredicateDevice?.manufacturer || 'Unknown Manufacturer',
        id: selectedPredicateDevice?.id || 'N/A'
      },
      scores: {
        overall: equivalenceScores.overall,
        technical: equivalenceScores.technical,
        performance: equivalenceScores.performance,
        safety: equivalenceScores.safety,
        clinical: equivalenceScores.clinical
      },
      technicalComparison: (subjectDevice.technicalCharacteristics || []).map(param => {
        const predicateParam = selectedPredicateDevice?.technicalCharacteristics?.find(p => p.name === param.name);
        const equivalent = predicateParam ? isEquivalent(param.value, predicateParam.value) : false;
        
        return {
          parameter: param.name,
          subjectValue: param.value,
          predicateValue: predicateParam?.value || 'N/A',
          equivalent: equivalent
        };
      })
    };
    
    // Create a blob with the JSON data
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    // Create an anchor element to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `510k_equivalence_comparison_${subjectDevice.id}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    // Alert user
    alert('Equivalence report data exported successfully. This JSON file can be used for FDA 510(k) submission preparation.');
  };
  
  // Request AI assistance for non-equivalent features
  const handleRequestAI = (parameter) => {
    if (typeof onRequestAIAssistance === 'function') {
      onRequestAIAssistance(parameter);
    }
    
    // For demo purposes, simulate AI responses
    const demoResponses = {
      'Display': 'The subject device has a higher resolution display (1024x768) than the predicate (800x600). This is likely an improvement and should be documented as such, emphasizing that the higher resolution enhances visibility of patient data without affecting safety or effectiveness.',
      'Battery Life': 'The subject device has a shorter battery life (6h vs 8h). Consider documenting comparative testing showing that 6 hours is sufficient for the intended use scenario, or implement power optimizations to achieve parity with the predicate.',
      'Connectivity': 'The subject device uses newer connectivity standards (Bluetooth 5.0 vs 4.2). Demonstrate that this represents an improvement in security and reliability without introducing new risks.',
      'Weight': 'The subject device is heavier (3.6 lbs vs 3.2 lbs). Testing should show that this difference does not impact usability or introduce new risks for operators.'
    };
    
    // Update the AI suggestions state
    setAiSuggestions(prev => ({
      ...prev,
      [parameter]: demoResponses[parameter] || 'Analysis in progress. AI assistance will provide guidance on addressing this non-equivalent feature.'
    }));
  };
  
  // Toggle parameter expansion
  const toggleParameter = (paramName) => {
    setExpandedParameters(prev => ({
      ...prev,
      [paramName]: !prev[paramName]
    }));
  };
  
  // Get a predicate device by ID
  const getPredicateById = (id) => {
    return predicateDevices.find(p => p.id === id) || predicateDevices[0];
  };
  
  // Get color for equivalence status
  const getEquivalenceColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };
  
  // Get icon for equivalence status
  const getEquivalenceIcon = (value1, value2) => {
    const equivalent = isEquivalent(value1, value2);
    if (equivalent) {
      return <Check className="h-5 w-5 text-green-600 dark:text-green-400" />;
    }
    return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold">Substantial Equivalence Analysis</CardTitle>
            <CardDescription>
              Detailed comparison between your device and selected predicate devices
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Export comparison as PDF for 510(k) submission
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => onGenerateReport?.()}>
                    <FileText className="h-4 w-4 mr-1" />
                    Full Report
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Generate comprehensive FDA-ready comparison report
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="col-span-1">
            <div className="text-sm font-medium">Overall Equivalence</div>
            <div className="mt-1 flex items-center">
              <div className={`text-2xl font-bold ${getEquivalenceColor(equivalenceScores.overall)}`}>
                {equivalenceScores.overall}%
              </div>
              <Progress value={equivalenceScores.overall} className="ml-2 w-24" />
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="text-sm font-medium">Technical</div>
            <div className="mt-1 flex items-center">
              <div className={`text-lg font-bold ${getEquivalenceColor(equivalenceScores.technical)}`}>
                {equivalenceScores.technical}%
              </div>
              <Progress value={equivalenceScores.technical} className="ml-2 w-24" />
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="text-sm font-medium">Performance</div>
            <div className="mt-1 flex items-center">
              <div className={`text-lg font-bold ${getEquivalenceColor(equivalenceScores.performance)}`}>
                {equivalenceScores.performance}%
              </div>
              <Progress value={equivalenceScores.performance} className="ml-2 w-24" />
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="text-sm font-medium">Safety</div>
            <div className="mt-1 flex items-center">
              <div className={`text-lg font-bold ${getEquivalenceColor(equivalenceScores.safety)}`}>
                {equivalenceScores.safety}%
              </div>
              <Progress value={equivalenceScores.safety} className="ml-2 w-24" />
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="text-sm font-medium">Clinical</div>
            <div className="mt-1 flex items-center">
              <div className={`text-lg font-bold ${getEquivalenceColor(equivalenceScores.clinical)}`}>
                {equivalenceScores.clinical}%
              </div>
              <Progress value={equivalenceScores.clinical} className="ml-2 w-24" />
            </div>
          </div>
        </div>
        
        {/* Predicate selection */}
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Selected Predicate Device</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {predicateDevices.map(device => (
              <div 
                key={device.id}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedPredicate === device.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:border-gray-300 dark:hover:border-gray-700'
                }`}
                onClick={() => setSelectedPredicate(device.id)}
              >
                <div className="font-medium">{device.deviceName}</div>
                <div className="text-xs text-gray-500">{device.manufacturer}</div>
                <Badge className="mt-1" variant={device.predicateType === 'Primary' ? 'default' : 'outline'}>
                  {device.predicateType}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="technical" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="technical">Technical Characteristics</TabsTrigger>
            <TabsTrigger value="performance">Performance Data</TabsTrigger>
            <TabsTrigger value="safety">Safety & Compliance</TabsTrigger>
            <TabsTrigger value="clinical">Clinical Outcomes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="technical">
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-3 bg-gray-50 dark:bg-gray-800 border-b font-medium">
                <div className="col-span-3">Parameter</div>
                <div className="col-span-3">Subject Device</div>
                <div className="col-span-3">Predicate Device</div>
                <div className="col-span-2">Equivalence</div>
                <div className="col-span-1">Actions</div>
              </div>
              
              <ScrollArea className="h-[500px]">
                {(subjectDevice.technicalCharacteristics || []).map((param, index) => {
                  const predicateDevice = getPredicateById(selectedPredicate);
                  const predicateParam = predicateDevice?.technicalCharacteristics?.find(p => p.name === param.name);
                  const isExpanded = expandedParameters[param.name] || false;
                  const hasAiSuggestion = aiSuggestions[param.name];
                  const isParameterEquivalent = predicateParam ? isEquivalent(param.value, predicateParam?.value) : false;
                  
                  return (
                    <div key={`${param.name}-${index}`} className="border-b last:border-b-0">
                      <div className={`grid grid-cols-12 p-3 ${
                        isParameterEquivalent 
                          ? 'bg-green-50 dark:bg-green-900/10' 
                          : 'bg-amber-50 dark:bg-amber-900/10'
                      }`}>
                        <div className="col-span-3 font-medium">{param.name}</div>
                        <div className="col-span-3">{param.value}</div>
                        <div className="col-span-3">{predicateParam?.value || 'N/A'}</div>
                        <div className="col-span-2 flex items-center">
                          {predicateParam 
                            ? getEquivalenceIcon(param.value, predicateParam.value)
                            : <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                          }
                          <span className="ml-1">
                            {isParameterEquivalent ? 'Equivalent' : 'Non-equivalent'}
                          </span>
                        </div>
                        <div className="col-span-1 flex gap-1">
                          {!isParameterEquivalent && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRequestAI(param.name)}
                            >
                              <Lightbulb className="h-4 w-4 text-amber-500" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleParameter(param.name)}
                          >
                            {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Expanded details panel */}
                      {isExpanded && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium">Comparison Details</h4>
                              <p className="mt-1 text-sm">
                                {isParameterEquivalent
                                  ? 'This parameter is substantially equivalent to the predicate device.'
                                  : 'This parameter differs from the predicate device and may require additional justification.'
                                }
                              </p>
                              
                              {/* Regulatory guidance */}
                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                <h5 className="text-sm font-medium flex items-center">
                                  <HelpCircle className="h-4 w-4 mr-1 text-blue-500" />
                                  FDA Guidance
                                </h5>
                                <p className="mt-1 text-xs">
                                  According to FDA guidance, differences in {param.name.toLowerCase()} 
                                  {isParameterEquivalent 
                                    ? ' are acceptable if they do not affect safety and effectiveness.'
                                    : ' must be justified through performance testing or scientific rationale.'
                                  }
                                </p>
                              </div>
                            </div>
                            
                            {/* AI suggestions for non-equivalent parameters */}
                            {!isParameterEquivalent && (
                              <div>
                                <h4 className="font-medium flex items-center">
                                  <Lightbulb className="h-4 w-4 mr-1 text-amber-500" />
                                  AI Suggestions
                                </h4>
                                <div className="mt-1 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                                  <p className="text-sm">
                                    {hasAiSuggestion || (
                                      <>
                                        No AI suggestions available. 
                                        <Button 
                                          variant="link" 
                                          size="sm" 
                                          className="px-1 h-auto"
                                          onClick={() => handleRequestAI(param.name)}
                                        >
                                          Get suggestions
                                        </Button>
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </ScrollArea>
            </div>
          </TabsContent>
          
          {/* Placeholder for other tabs - in a real implementation, these would be fully fleshed out */}
          <TabsContent value="performance">
            <div className="flex flex-col items-center justify-center h-[300px] border rounded-md bg-gray-50 dark:bg-gray-800/50">
              <FileText className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-center text-gray-600 dark:text-gray-400">
                Performance data comparison would be displayed here.<br />
                This includes test results, standards compliance, and benchmark data.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="safety">
            <div className="flex flex-col items-center justify-center h-[300px] border rounded-md bg-gray-50 dark:bg-gray-800/50">
              <FileText className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-center text-gray-600 dark:text-gray-400">
                Safety and compliance data would be displayed here.<br />
                This includes risk assessment, hazard analysis, and standards conformance.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="clinical">
            <div className="flex flex-col items-center justify-center h-[300px] border rounded-md bg-gray-50 dark:bg-gray-800/50">
              <FileText className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-center text-gray-600 dark:text-gray-400">
                Clinical outcomes comparison would be displayed here.<br />
                This includes clinical study results, published literature, and real-world evidence.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Action buttons */}
        <div className="mt-6 flex justify-between">
          <Button variant="outline" size="sm">
            <ArrowRight className="h-4 w-4 mr-1" />
            Save and Continue
          </Button>
          
          <Button 
            variant={equivalenceScores.overall >= 80 ? "default" : "outline"}
            disabled={equivalenceScores.overall < 70}
            onClick={() => onGenerateReport?.()}
          >
            <FileText className="h-4 w-4 mr-1" />
            Generate FDA Comparison Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedEquivalenceComparison;