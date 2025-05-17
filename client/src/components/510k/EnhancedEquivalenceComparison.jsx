import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Download, Check, X, AlertTriangle, Lightbulb, 
  FileText, HelpCircle, Plus, Minus
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
  const [filterNonEquivalent, setFilterNonEquivalent] = useState(false);
  const [showEquivalenceCriteria, setShowEquivalenceCriteria] = useState(false);
  
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
  const isEquivalent = (value1, value2, parameterType = 'general') => {
    if (value1 === value2) return true;
    
    // For numeric comparisons, allow small differences
    if (!isNaN(value1) && !isNaN(value2)) {
      const num1 = parseFloat(value1);
      const num2 = parseFloat(value2);
      return Math.abs((num1 - num2) / Math.max(num1, num2)) < 0.1; // Allow 10% difference
    }
    
    // Special handling for performance metrics
    if (parameterType === 'performance') {
      // For percentage values in performance metrics, subject device should be at least as good
      if (String(value1).includes('%') && String(value2).includes('%')) {
        const num1 = parseFloat(String(value1));
        const num2 = parseFloat(String(value2));
        if (!isNaN(num1) && !isNaN(num2)) {
          return num1 >= num2;
        }
      }
      
      // For time/latency metrics, lower is better
      if (String(value1).includes('ms') && String(value2).includes('ms')) {
        const num1 = parseFloat(String(value1));
        const num2 = parseFloat(String(value2));
        if (!isNaN(num1) && !isNaN(num2)) {
          return num1 <= num2;
        }
      }
    }
    
    // String comparisons - could be enhanced with more sophisticated equivalence logic
    if (typeof value1 === 'string' && typeof value2 === 'string') {
      const v1 = value1.toLowerCase();
      const v2 = value2.toLowerCase();
      return v1.includes(v2) || v2.includes(v1);
    }
    
    return false;
  };
  
  // Get filtered parameters based on the non-equivalent filter setting
  const getFilteredParameters = (paramType) => {
    let parameters = [];
    
    // Get the appropriate parameter list based on tab
    if (paramType === 'technical') {
      parameters = subjectDevice.technicalCharacteristics || [];
    } else if (paramType === 'performance') {
      parameters = subjectDevice.performanceData || [];
    } else if (paramType === 'safety') {
      parameters = subjectDevice.safetyFeatures || [];
    } else {
      parameters = []; // No clinical parameters in this demo
    }
    
    // If filter is off, return all parameters
    if (!filterNonEquivalent) {
      return parameters;
    }
    
    // If filter is on, only return non-equivalent parameters
    const selectedPredicateData = predicateDevices.find(p => p.id === selectedPredicate);
    if (!selectedPredicateData) return parameters;
    
    return parameters.filter(param => {
      // Get the matching parameter from the predicate device
      let predicateParams = [];
      if (paramType === 'technical') {
        predicateParams = selectedPredicateData.technicalCharacteristics || [];
      } else if (paramType === 'performance') {
        predicateParams = selectedPredicateData.performanceData || [];
      } else if (paramType === 'safety') {
        predicateParams = selectedPredicateData.safetyFeatures || [];
      }
      
      const predicateParam = predicateParams.find(p => p.name === param.name);
      
      // If no matching parameter found in predicate, consider it non-equivalent
      if (!predicateParam) return true;
      
      // Check equivalence with appropriate parameter type
      return !isEquivalent(
        param.value, 
        predicateParam.value,
        paramType === 'performance' ? 'performance' : 'general'
      );
    });
  };
  
  // Export the comparison data for sharing/saving
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
                  Export comparison as JSON for 510(k) submission
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
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowEquivalenceCriteria(!showEquivalenceCriteria)}
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Criteria
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Show/hide substantial equivalence criteria information
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Equivalence Criteria Information Panel */}
        {showEquivalenceCriteria && (
          <Alert className="mt-4">
            <HelpCircle className="h-4 w-4" />
            <AlertTitle>Substantial Equivalence Criteria</AlertTitle>
            <AlertDescription>
              <div className="text-sm mt-2">
                <p className="mb-2">
                  Two devices are considered substantially equivalent when they have:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The same intended use; and</li>
                  <li>Either the same technological characteristics or different technological characteristics that don't raise different questions of safety and effectiveness.</li>
                </ul>
                <p className="mt-2 mb-2">
                  <strong>Equivalence thresholds:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><span className="text-green-600 font-medium">Numeric values:</span> Within 10% difference (e.g., weight, dimensions, power)</li>
                  <li><span className="text-green-600 font-medium">Categorical values:</span> Exact match or functionally equivalent (e.g., connectivity types)</li>
                  <li><span className="text-green-600 font-medium">Performance metrics:</span> Subject device must be at least as good as predicate</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
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
                <div className="text-sm text-gray-500 dark:text-gray-400">{device.manufacturer}</div>
                <Badge variant="outline" className="mt-1">
                  {device.predicateType || 'Predicate'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="technical" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="technical">Technical Characteristics</TabsTrigger>
              <TabsTrigger value="performance">Performance Data</TabsTrigger>
              <TabsTrigger value="safety">Safety & Compliance</TabsTrigger>
              <TabsTrigger value="clinical">Clinical Outcomes</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
                  checked={filterNonEquivalent}
                  onChange={() => setFilterNonEquivalent(!filterNonEquivalent)}
                />
                <span className="text-sm font-medium">Show non-equivalent only</span>
              </label>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Filter to show only parameters that are not equivalent between devices
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <TabsContent value="technical">
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-3 bg-gray-50 dark:bg-gray-800 border-b font-medium">
                <div className="col-span-3">Parameter</div>
                <div className="col-span-3">Subject Device</div>
                <div className="col-span-3">Predicate Device</div>
                <div className="col-span-2">Equivalence</div>
                <div className="col-span-1">Actions</div>
              </div>
              
              <ScrollArea className="h-[400px]">
                {getFilteredParameters('technical').map((param, index) => {
                  const predicateDevice = getPredicateById(selectedPredicate);
                  const predicateParam = predicateDevice?.technicalCharacteristics?.find(p => p.name === param.name);
                  const equivalent = predicateParam ? isEquivalent(param.value, predicateParam.value) : false;
                  const isExpanded = expandedParameters[param.name] || false;
                  
                  return (
                    <div key={`${param.name}-${index}`} className="border-b last:border-0">
                      <div 
                        className={`grid grid-cols-12 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          !equivalent ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                        }`}
                      >
                        <div className="col-span-3 font-medium">{param.name}</div>
                        <div className="col-span-3">{param.value}</div>
                        <div className="col-span-3">{predicateParam?.value || 'N/A'}</div>
                        <div className="col-span-2 flex items-center">
                          {predicateParam ? getEquivalenceIcon(param.value, predicateParam.value) : <X className="h-5 w-5 text-red-600 dark:text-red-400" />}
                          <span className="ml-1">
                            {equivalent ? 'Equivalent' : 'Not Equivalent'}
                          </span>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          {!equivalent && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleRequestAI(param.name)}>
                                    <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Get AI suggestions for addressing this non-equivalent feature
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => toggleParameter(param.name)}
                          >
                            {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Expanded content with AI suggestions */}
                      {isExpanded && !equivalent && aiSuggestions[param.name] && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-dashed">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <div>
                              <div className="font-medium">AI Suggestion</div>
                              <div className="text-sm mt-1">{aiSuggestions[param.name]}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="performance">
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-3 bg-gray-50 dark:bg-gray-800 border-b font-medium">
                <div className="col-span-3">Parameter</div>
                <div className="col-span-3">Subject Device</div>
                <div className="col-span-3">Predicate Device</div>
                <div className="col-span-2">Equivalence</div>
                <div className="col-span-1">Actions</div>
              </div>
              
              <ScrollArea className="h-[400px]">
                {getFilteredParameters('performance').map((param, index) => {
                  const predicateDevice = getPredicateById(selectedPredicate);
                  const predicateParam = predicateDevice?.performanceData?.find(p => p.name === param.name);
                  const equivalent = predicateParam ? isEquivalent(param.value, predicateParam.value, 'performance') : false;
                  const isExpanded = expandedParameters[param.name] || false;
                  
                  return (
                    <div key={`${param.name}-${index}`} className="border-b last:border-0">
                      <div 
                        className={`grid grid-cols-12 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          !equivalent ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                        }`}
                      >
                        <div className="col-span-3 font-medium">{param.name}</div>
                        <div className="col-span-3">{param.value}</div>
                        <div className="col-span-3">{predicateParam?.value || 'N/A'}</div>
                        <div className="col-span-2 flex items-center">
                          {predicateParam ? getEquivalenceIcon(param.value, predicateParam.value) : <X className="h-5 w-5 text-red-600 dark:text-red-400" />}
                          <span className="ml-1">
                            {equivalent ? 'Equivalent' : 'Not Equivalent'}
                          </span>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          {!equivalent && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleRequestAI(param.name)}>
                                    <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Get AI suggestions for addressing this non-equivalent feature
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => toggleParameter(param.name)}
                          >
                            {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Expanded content with AI suggestions */}
                      {isExpanded && !equivalent && aiSuggestions[param.name] && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-dashed">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <div>
                              <div className="font-medium">AI Suggestion</div>
                              <div className="text-sm mt-1">{aiSuggestions[param.name]}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="safety">
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-3 bg-gray-50 dark:bg-gray-800 border-b font-medium">
                <div className="col-span-3">Parameter</div>
                <div className="col-span-3">Subject Device</div>
                <div className="col-span-3">Predicate Device</div>
                <div className="col-span-2">Equivalence</div>
                <div className="col-span-1">Actions</div>
              </div>
              
              <ScrollArea className="h-[400px]">
                {getFilteredParameters('safety').map((param, index) => {
                  const predicateDevice = getPredicateById(selectedPredicate);
                  const predicateParam = predicateDevice?.safetyFeatures?.find(p => p.name === param.name);
                  const equivalent = predicateParam ? isEquivalent(param.value, predicateParam.value) : false;
                  const isExpanded = expandedParameters[param.name] || false;
                  
                  return (
                    <div key={`${param.name}-${index}`} className="border-b last:border-0">
                      <div 
                        className={`grid grid-cols-12 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          !equivalent ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                        }`}
                      >
                        <div className="col-span-3 font-medium">{param.name}</div>
                        <div className="col-span-3">{param.value}</div>
                        <div className="col-span-3">{predicateParam?.value || 'N/A'}</div>
                        <div className="col-span-2 flex items-center">
                          {predicateParam ? getEquivalenceIcon(param.value, predicateParam.value) : <X className="h-5 w-5 text-red-600 dark:text-red-400" />}
                          <span className="ml-1">
                            {equivalent ? 'Equivalent' : 'Not Equivalent'}
                          </span>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          {!equivalent && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleRequestAI(param.name)}>
                                    <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Get AI suggestions for addressing this non-equivalent feature
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => toggleParameter(param.name)}
                          >
                            {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Expanded content with AI suggestions */}
                      {isExpanded && !equivalent && aiSuggestions[param.name] && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-dashed">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <div>
                              <div className="font-medium">AI Suggestion</div>
                              <div className="text-sm mt-1">{aiSuggestions[param.name]}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="clinical">
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-center p-8 max-w-md">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Clinical Data Under Development</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Clinical outcomes comparison tools are currently being built. In the full 510(k) submission, 
                  this section will include detailed analysis of clinical data supporting substantial equivalence.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedEquivalenceComparison;