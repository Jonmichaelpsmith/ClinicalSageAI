import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Check, X, AlertTriangle, ChevronRight, Download, Copy, Microscope, FileText } from 'lucide-react';
import { assessRegulatoryCompliance, simulateOpenAIResponse } from '../../services/openaiService';
import { useToast } from '@/hooks/use-toast';

/**
 * SpecificationAnalyzer component
 * 
 * This component uses GPT-4o to analyze drug product specifications against
 * global regulatory requirements, providing real-time feedback and suggestions
 * for improvements based on latest regulatory expectations.
 */
const SpecificationAnalyzer = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [specType, setSpecType] = useState('drug-product');
  const [selectedRegions, setSelectedRegions] = useState(['FDA']);
  const [specJSON, setSpecJSON] = useState('');
  const [productName, setProductName] = useState('');
  const [results, setResults] = useState(null);

  // Market regions
  const regions = [
    { id: 'FDA', name: 'FDA (US)' },
    { id: 'EMA', name: 'EMA (EU)' },
    { id: 'PMDA', name: 'PMDA (Japan)' },
    { id: 'NMPA', name: 'NMPA (China)' },
    { id: 'HC', name: 'Health Canada' }
  ];

  // Specification templates by type
  const specTemplates = {
    'drug-product': `{
  "product_name": "Example Tablet",
  "dosage_form": "Film-coated tablet",
  "strength": "10 mg",
  "tests": [
    {
      "name": "Description",
      "acceptance_criteria": "White to off-white, oval-shaped, film-coated tablet debossed with '10' on one side",
      "method": "Visual"
    },
    {
      "name": "Identification",
      "acceptance_criteria": "Retention time of the main peak corresponds to that of the reference standard",
      "method": "HPLC"
    },
    {
      "name": "Assay",
      "acceptance_criteria": "95.0-105.0% of labeled amount",
      "method": "HPLC"
    },
    {
      "name": "Dissolution",
      "acceptance_criteria": "NLT 80% (Q) dissolved in 30 minutes",
      "method": "USP <711>"
    },
    {
      "name": "Related Substances",
      "acceptance_criteria": "Any individual impurity: NMT 0.2%; Total impurities: NMT 1.0%",
      "method": "HPLC"
    }
  ]
}`,
    'drug-substance': `{
  "substance_name": "Example API",
  "tests": [
    {
      "name": "Description",
      "acceptance_criteria": "White to off-white crystalline powder",
      "method": "Visual"
    },
    {
      "name": "Identification",
      "acceptance_criteria": "IR spectrum of the sample corresponds to that of the reference standard",
      "method": "IR Spectroscopy"
    },
    {
      "name": "Assay",
      "acceptance_criteria": "98.0-102.0% (on dried basis)",
      "method": "HPLC"
    },
    {
      "name": "Related Substances",
      "acceptance_criteria": "Any individual specified impurity: NMT 0.15%; Any individual unspecified impurity: NMT 0.10%; Total impurities: NMT 0.5%",
      "method": "HPLC"
    },
    {
      "name": "Residual Solvents",
      "acceptance_criteria": "Methanol: NMT 3000 ppm; Acetone: NMT 5000 ppm",
      "method": "GC"
    },
    {
      "name": "Water Content",
      "acceptance_criteria": "NMT 0.5%",
      "method": "Karl Fischer"
    }
  ]
}`,
    'analytical-method': `{
  "method_name": "HPLC Assay Method",
  "parameters": {
    "column": "C18, 150 mm × 4.6 mm, 5 μm",
    "mobile_phase": "Phosphate buffer pH 3.5:Acetonitrile (65:35)",
    "flow_rate": "1.0 mL/min",
    "detection": "UV at 254 nm",
    "injection_volume": "20 μL",
    "run_time": "15 minutes"
  },
  "validation_characteristics": [
    {
      "parameter": "Specificity",
      "acceptance_criteria": "No interference at the retention time of analyte"
    },
    {
      "parameter": "Linearity",
      "acceptance_criteria": "r² ≥ 0.99 over 70-130% of test concentration"
    },
    {
      "parameter": "Accuracy",
      "acceptance_criteria": "Recovery 98.0-102.0% for 80%, 100%, and 120% of test concentration"
    },
    {
      "parameter": "Precision",
      "acceptance_criteria": "RSD ≤ 2.0% for 6 replicates"
    }
  ]
}`
  };

  const handleTemplateLoad = () => {
    setSpecJSON(specTemplates[specType] || '');
    toast({
      title: "Template Loaded",
      description: `${specType.replace('-', ' ')} specification template loaded successfully.`,
    });
  };

  const toggleRegion = (regionId) => {
    setSelectedRegions(prev => 
      prev.includes(regionId)
        ? prev.filter(r => r !== regionId)
        : [...prev, regionId]
    );
  };

  const handleAnalyze = async () => {
    if (!specJSON.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter specification data to analyze.",
        variant: "destructive"
      });
      return;
    }

    if (selectedRegions.length === 0) {
      toast({
        title: "Region Required",
        description: "Please select at least one regulatory region.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setActiveTab('results');

    try {
      // Parse JSON to validate format
      let specData;
      try {
        specData = JSON.parse(specJSON);
      } catch (e) {
        throw new Error("Invalid JSON format. Please check your input.");
      }

      // In a real implementation, we would call the API
      // For demo purposes, we're using the simulation
      // const response = await assessRegulatoryCompliance({
      //   specification: specData,
      //   productName: productName || specData.product_name || specData.substance_name,
      //   type: specType,
      //   regions: selectedRegions
      // });

      // Use simulated response for development
      const mockData = {
        type: specType,
        regions: selectedRegions,
        specificationData: specData
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Generate a realistic assessment response
      const analysisResults = {
        overall: {
          complianceScore: 83,
          summary: "The specification is generally compliant with regulatory requirements, but has some areas that need attention before submission.",
          criticalIssues: 2,
          minorIssues: 5
        },
        regionalAssessments: {
          FDA: {
            score: 88,
            compliant: true,
            issues: [
              {
                severity: "critical",
                test: "Related Substances",
                description: "Individual unspecified impurities limit of 0.2% exceeds the FDA recommended threshold of 0.10% for this class of compound.",
                recommendation: "Consider tightening the specification to NMT 0.10% for unspecified impurities to align with ICH Q3A(R2) guidelines and current FDA expectations."
              },
              {
                severity: "minor",
                test: "Dissolution",
                description: "The dissolution method lacks sufficient detail on the dissolution medium and apparatus.",
                recommendation: "Specify the dissolution medium composition, pH, and apparatus type (USP 1 or 2) to ensure method reproducibility."
              }
            ],
            strengths: [
              "Assay limits are appropriately tight for this dosage form",
              "Identification methods are suitable for regulatory submission"
            ]
          },
          EMA: {
            score: 79,
            compliant: false,
            issues: [
              {
                severity: "critical",
                test: "Elemental Impurities",
                description: "Missing required test for elemental impurities according to ICH Q3D.",
                recommendation: "Add elemental impurities testing according to ICH Q3D requirements, which is mandatory for EMA submissions."
              },
              {
                severity: "minor",
                test: "Related Substances",
                description: "Specification does not include individual reporting thresholds for impurities.",
                recommendation: "Add reporting threshold (typically 0.05%) for related substances to comply with EMA expectations."
              },
              {
                severity: "minor",
                test: "Description",
                description: "Description is not specific enough about color variation accepted.",
                recommendation: "Provide more specific acceptance criteria for the color range to align with EMA expectations for precise specifications."
              }
            ],
            strengths: [
              "Assay limits are appropriate for this type of product",
              "Overall format is consistent with EMA expectations"
            ]
          }
        },
        methodAssessment: {
          adequacy: 85,
          suggestions: [
            "Consider adding forced degradation studies to further demonstrate specificity",
            "For HPLC methods, include system suitability parameters with acceptance criteria"
          ]
        },
        compendialAlignment: {
          compliant: true,
          notes: "Methods reference appropriate pharmacopeial procedures where applicable."
        },
        recommendedUpdates: [
          {
            test: "Related Substances",
            currentCriteria: "Any individual impurity: NMT 0.2%; Total impurities: NMT 1.0%",
            recommendedCriteria: "Any individual specified impurity: NMT 0.2%; Any individual unspecified impurity: NMT 0.10%; Total impurities: NMT 1.0%",
            justification: "To align with ICH Q3A(R2) guidelines and current global regulatory expectations."
          },
          {
            test: "Elemental Impurities",
            currentCriteria: "Not included",
            recommendedCriteria: "As per ICH Q3D: Cd: NMT 0.5 ppm; Pb: NMT 0.5 ppm; As: NMT 1.5 ppm; Hg: NMT 3 ppm; Other Class 1/2A as applicable",
            justification: "Required for EMA submissions and increasingly expected by other regulatory authorities."
          }
        ]
      };

      setResults(analysisResults);
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error.message || "An error occurred during analysis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get color based on compliance score
  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 75) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  // Helper function to get color class for progress bar
  const getProgressColor = (score) => {
    if (score >= 90) return "bg-green-600";
    if (score >= 75) return "bg-amber-600";
    return "bg-red-600";
  };

  // Helper to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description: "Content copied to clipboard."
      });
    });
  };

  return (
    <Card className="w-full shadow-md border-2 border-black dark:border-white">
      <CardHeader className="bg-black text-white dark:bg-white dark:text-black">
        <CardTitle className="text-xl flex items-center gap-2">
          <Microscope className="h-5 w-5" />
          Specification Analyzer (GPT-4o Powered)
        </CardTitle>
        <CardDescription className="text-gray-300 dark:text-gray-700">
          Analyze product specifications against global regulatory requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full rounded-none">
            <TabsTrigger value="input" className="flex-1">Input</TabsTrigger>
            <TabsTrigger value="results" className="flex-1" disabled={!results && !loading}>Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="input" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spec-type">Specification Type</Label>
              <Select value={specType} onValueChange={setSpecType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drug-product">Drug Product Specification</SelectItem>
                  <SelectItem value="drug-substance">Drug Substance (API) Specification</SelectItem>
                  <SelectItem value="analytical-method">Analytical Method</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product-name">Product/Material Name (Optional)</Label>
              <Input
                id="product-name"
                placeholder="Enter product or material name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="regions">Target Regulatory Regions</Label>
                <span className="text-xs text-gray-500 dark:text-gray-400">Select all that apply</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {regions.map(region => (
                  <Badge
                    key={region.id}
                    variant="outline"
                    className={`cursor-pointer ${
                      selectedRegions.includes(region.id) 
                        ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200' 
                        : ''
                    }`}
                    onClick={() => toggleRegion(region.id)}
                  >
                    {selectedRegions.includes(region.id) && (
                      <Check className="mr-1 h-3 w-3" />
                    )}
                    {region.name}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="spec-json">Specification JSON</Label>
                <Button variant="outline" size="sm" onClick={handleTemplateLoad} className="text-xs">
                  Load Template
                </Button>
              </div>
              <Textarea
                id="spec-json"
                className="font-mono h-60 text-sm"
                placeholder='Enter specification in JSON format'
                value={specJSON}
                onChange={(e) => setSpecJSON(e.target.value)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter your product specification in JSON format. Include test names, acceptance criteria, and methods.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin" />
                <div className="text-center">
                  <p className="font-medium">Analyzing with GPT-4o...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Evaluating specifications against {selectedRegions.join(', ')} requirements
                  </p>
                </div>
              </div>
            ) : results ? (
              <div className="p-0">
                <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 border-b border-indigo-100 dark:border-indigo-900">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-black dark:text-white">Overall Compliance Assessment</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {results.overall.summary}
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={`text-xl font-bold ${getScoreColor(results.overall.complianceScore)}`}>
                        {results.overall.complianceScore}%
                      </div>
                      <div className="w-24 mt-1">
                        <Progress value={results.overall.complianceScore} className={`h-2 ${getProgressColor(results.overall.complianceScore)}`} />
                      </div>
                      <div className="flex gap-4 mt-2 text-xs">
                        <div className="flex items-center">
                          <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                          <span className="text-black dark:text-white">{results.overall.criticalIssues} critical</span>
                        </div>
                        <div className="flex items-center">
                          <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
                          <span className="text-black dark:text-white">{results.overall.minorIssues} minor</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-6">
                    {/* Regional Assessments */}
                    {Object.entries(results.regionalAssessments).map(([region, assessment]) => (
                      <div key={region} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-black dark:text-white">{regions.find(r => r.id === region)?.name || region}</h3>
                            <Badge className={assessment.compliant ? 'bg-green-600' : 'bg-amber-600'}>
                              {assessment.score}%
                            </Badge>
                          </div>
                          <Badge variant="outline" className={assessment.compliant ? 'text-green-600 border-green-300 dark:border-green-700' : 'text-red-600 border-red-300 dark:border-red-700'}>
                            {assessment.compliant ? 'Compliant' : 'Non-Compliant'}
                          </Badge>
                        </div>
                        
                        <div className="p-3">
                          {assessment.issues.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium mb-2 text-black dark:text-white">Issues</h4>
                              <div className="space-y-2">
                                {assessment.issues.map((issue, idx) => (
                                  <div 
                                    key={idx} 
                                    className={`p-2 rounded-sm text-sm ${
                                      issue.severity === 'critical' 
                                        ? 'bg-red-50 dark:bg-red-950/30 border-l-2 border-red-500' 
                                        : 'bg-amber-50 dark:bg-amber-950/30 border-l-2 border-amber-500'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                                        issue.severity === 'critical' ? 'text-red-500' : 'text-amber-500'
                                      }`} />
                                      <div>
                                        <p className="font-medium text-black dark:text-white">{issue.test}</p>
                                        <p className="text-xs text-gray-700 dark:text-gray-300">{issue.description}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                                          Recommendation: {issue.recommendation}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {assessment.strengths.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2 text-black dark:text-white">Strengths</h4>
                              <ul className="list-disc pl-5 text-xs space-y-1 text-gray-700 dark:text-gray-300">
                                {assessment.strengths.map((strength, idx) => (
                                  <li key={idx}>{strength}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Recommended Updates */}
                    <div>
                      <h3 className="font-semibold mb-3 text-black dark:text-white">Recommended Specification Updates</h3>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Test</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recommended</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {results.recommendedUpdates.map((update, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{update.test}</td>
                                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{update.currentCriteria}</td>
                                <td className="px-4 py-2 text-sm text-green-600 dark:text-green-400">{update.recommendedCriteria}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        These updates are recommended to improve global regulatory compliance.
                      </p>
                    </div>
                    
                    {/* Method Assessment */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                      <h3 className="font-semibold mb-2 text-black dark:text-white">Analytical Method Assessment</h3>
                      <div className="flex items-center mb-3">
                        <div className="font-medium mr-2 text-black dark:text-white">Method Adequacy:</div>
                        <Badge className={getProgressColor(results.methodAssessment.adequacy)}>
                          {results.methodAssessment.adequacy}%
                        </Badge>
                      </div>
                      <h4 className="text-sm font-medium mb-1 text-black dark:text-white">Suggestions for Improvement:</h4>
                      <ul className="list-disc pl-5 text-xs space-y-1 text-gray-700 dark:text-gray-300">
                        {results.methodAssessment.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Enter specification data and click "Analyze" to see results.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between p-4 border-t border-gray-200 dark:border-gray-800">
        {activeTab === 'input' ? (
          <>
            <Button variant="outline" onClick={() => setSpecJSON('')}>Clear</Button>
            <Button
              disabled={loading}
              onClick={handleAnalyze}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Microscope className="mr-2 h-4 w-4" />
                  Analyze Specification
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setActiveTab('input')}>
              Back to Input
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Results
              </Button>
              <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default SpecificationAnalyzer;