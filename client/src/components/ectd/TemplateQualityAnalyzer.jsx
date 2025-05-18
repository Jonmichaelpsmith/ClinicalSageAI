/**
 * Template Quality Analyzer Component for eCTD Module
 * 
 * This component analyzes document templates for quality and compliance with
 * regulatory standards, providing feedback and improvement suggestions.
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Check, X, AlertTriangle, HelpCircle, BookOpen, FileCheck, CircleSlash, CheckCircle, Award, Shield, ArrowRight, Download, FileSpreadsheet, FileText, BarChart4, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function TemplateQualityAnalyzer({ template, onFixIssues }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [activeTab, setActiveTab] = useState('issues');
  const [selectedRegions, setSelectedRegions] = useState(['us']); // Default to US/FDA
  const [exporting, setExporting] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [analyticsTracking, setAnalyticsTracking] = useState({
    totalAnalysesRun: 0,
    regionsChecked: {},
    issuesByCategory: {},
    lastRunTimestamp: null
  });
  const { toast } = useToast();
  
  // Track analytics data
  useEffect(() => {
    if (analysisResults && !analyzing) {
      // Update analytics tracking
      setAnalyticsTracking(prev => {
        const newTracking = {
          totalAnalysesRun: prev.totalAnalysesRun + 1,
          regionsChecked: { ...prev.regionsChecked },
          issuesByCategory: { ...prev.issuesByCategory },
          lastRunTimestamp: new Date().toISOString()
        };
        
        // Track regions used
        selectedRegions.forEach(region => {
          newTracking.regionsChecked[region] = (newTracking.regionsChecked[region] || 0) + 1;
        });
        
        // Track issues by category
        analysisResults.issues.forEach(issue => {
          newTracking.issuesByCategory[issue.category] = 
            (newTracking.issuesByCategory[issue.category] || 0) + 1;
        });
        
        return newTracking;
      });
    }
  }, [analysisResults, analyzing]);
  
  const runAnalysis = async () => {
    if (!template) {
      toast({
        title: "No Template Selected",
        description: "Please select a template to analyze",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setAnalyzing(true);
      
      // In a real implementation, this would call your API
      // Example:
      // const response = await fetch('/api/templates/analyze', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     templateId: template.id,
      //     content: template.content,
      //     category: template.category,
      //     regions: selectedRegions, // Include selected regulatory regions
      //   }),
      // });
      // const results = await response.json();
      
      // For demo purposes, simulate an API call with a delay
      setTimeout(() => {
        // Generate results based on template category and selected regions
        const results = generateAnalysisResults(template, selectedRegions);
        setAnalysisResults(results);
        setAnalyzing(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error analyzing template:', error);
      setAnalyzing(false);
      
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your template",
        variant: "destructive"
      });
    }
  };
  
  // Toggle region selection
  const toggleRegion = (region) => {
    if (selectedRegions.includes(region)) {
      // Don't allow deselecting all regions
      if (selectedRegions.length > 1) {
        setSelectedRegions(selectedRegions.filter(r => r !== region));
      }
    } else {
      setSelectedRegions([...selectedRegions, region]);
    }
  };
  
  // Export analysis results as PDF or CSV
  const exportAnalysisReport = (format) => {
    if (!analysisResults) {
      toast({
        title: "No Analysis Results",
        description: "Please run an analysis before exporting results",
        variant: "destructive"
      });
      return;
    }
    
    setExporting(true);
    
    // In a real implementation, this would call your API to generate a PDF or CSV
    // Example:
    // const response = await fetch('/api/templates/export-report', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     templateId: template.id,
    //     analysisResults,
    //     format,
    //     regions: selectedRegions,
    //   }),
    // });
    
    // For demo purposes, simulate an API call with a delay
    setTimeout(() => {
      setExporting(false);
      
      // Format is either 'pdf' or 'csv'
      toast({
        title: "Report Generated",
        description: `Your ${format.toUpperCase()} report has been downloaded`,
      });
      
      // In a real implementation, this would download the file
      // window.open(URL.createObjectURL(response.blob()), '_blank');
    }, 1500);
  };
  
  const handleFixIssue = (issueId) => {
    if (onFixIssues) {
      onFixIssues(issueId);
    }
    
    // In a real implementation, you would apply the fix and update the template
    // For demo purposes, just update the analysis results
    if (analysisResults) {
      const updatedIssues = analysisResults.issues.map(issue => 
        issue.id === issueId ? { ...issue, status: 'fixed' } : issue
      );
      
      const fixedCount = updatedIssues.filter(issue => issue.status === 'fixed').length;
      const newScore = Math.min(100, analysisResults.score + (fixedCount * 3));
      
      setAnalysisResults({
        ...analysisResults,
        issues: updatedIssues,
        score: newScore,
        complianceStatus: newScore >= 90 ? 'compliant' : 'needs-review'
      });
      
      toast({
        title: "Issue Fixed",
        description: "The template has been updated to address the issue",
      });
    }
  };
  
  const applyAllFixes = () => {
    // In a real implementation, you would apply all possible automatic fixes
    // For demo purposes, just update the analysis results
    if (analysisResults) {
      const autoFixableIssues = analysisResults.issues.filter(issue => issue.autoFixable);
      
      if (autoFixableIssues.length === 0) {
        toast({
          title: "No Auto-Fixable Issues",
          description: "There are no issues that can be automatically fixed",
        });
        return;
      }
      
      const updatedIssues = analysisResults.issues.map(issue => 
        issue.autoFixable ? { ...issue, status: 'fixed' } : issue
      );
      
      const fixedCount = autoFixableIssues.length;
      const newScore = Math.min(100, analysisResults.score + (fixedCount * 3));
      
      setAnalysisResults({
        ...analysisResults,
        issues: updatedIssues,
        score: newScore,
        complianceStatus: newScore >= 90 ? 'compliant' : 'needs-review'
      });
      
      // Call onFixIssues with all auto-fixable issue IDs
      if (onFixIssues) {
        autoFixableIssues.forEach(issue => onFixIssues(issue.id));
      }
      
      toast({
        title: "Multiple Issues Fixed",
        description: `${fixedCount} issues have been automatically fixed`,
      });
    }
  };
  
  // Define regulatory authorities and their requirements
  const regulatoryAuthorities = {
    us: {
      name: 'FDA (United States)',
      icon: '🇺🇸',
      key: 'us',
      color: 'bg-blue-100 text-blue-800',
      specificRequirements: [
        'Electronic signatures (21 CFR Part 11)',
        'Module 1 US-specific document format',
        'FDA guidances for specific submission types',
        'FDA eCTD Technical Conformance Guide compliance',
        'FDA-specific PDF/A version requirements'
      ],
      documentLinks: [
        { name: 'FDA eCTD Guidance', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/providing-regulatory-submissions-electronic-format-certain-human-pharmaceutical-product-applications' },
        { name: 'FDA Technical Conformance Guide', url: 'https://www.fda.gov/media/153097/download' }
      ]
    },
    eu: {
      name: 'EMA (European Union)',
      icon: '🇪🇺',
      key: 'eu',
      color: 'bg-yellow-100 text-yellow-800',
      specificRequirements: [
        'EU Module 1 specification',
        'EU QRD template compliance',
        'EMA eSubmission Gateway requirements',
        'Multi-language content requirements',
        'EU-specific metadata requirements'
      ],
      documentLinks: [
        { name: 'EMA eSubmission Guidance', url: 'https://www.ema.europa.eu/en/human-regulatory/marketing-authorisation/electronic-submission' },
        { name: 'EU M1 Specification', url: 'https://www.ema.europa.eu/en/human-regulatory/marketing-authorisation/common-technical-document/ectd/module-1-administrative-information' }
      ]
    },
    ca: {
      name: 'Health Canada',
      icon: '🇨🇦',
      key: 'ca',
      color: 'bg-red-100 text-red-800',
      specificRequirements: [
        'Bilingual content (English/French)',
        'Health Canada Module 1 specifications',
        'Canadian regulatory transactions',
        'Therapeutic Products Directorate guidance compliance',
        'Health Canada eCTD validation criteria'
      ],
      documentLinks: [
        { name: 'Health Canada Guidance', url: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/drug-products/applications-submissions/guidance-documents/common-technical-document/updated-guidance-document-preparation-drug-regulatory-activities-electronic-common-technical-document.html' }
      ]
    },
    jp: {
      name: 'PMDA (Japan)',
      icon: '🇯🇵',
      key: 'jp',
      color: 'bg-rose-100 text-rose-800',
      specificRequirements: [
        'Japanese character encoding compliance',
        'PMDA Module 1 requirements',
        'Japan-specific eCTD validation rules',
        'Specific document naming conventions',
        'PMDA Gateway transmission requirements'
      ],
      documentLinks: [
        { name: 'PMDA eCTD Guidance', url: 'https://www.pmda.go.jp/english/review-services/regulatory-submissions/0003.html' }
      ]
    },
    intl: {
      name: 'ICH (International)',
      icon: '🌎',
      key: 'intl',
      color: 'bg-green-100 text-green-800',
      specificRequirements: [
        'ICH M8 eCTD specification v4.0',
        'ICH M2 Electronic Standards',
        'ICH E3 Clinical Study Report structure',
        'ICH Common Technical Document format',
        'ICH E6(R2) GCP compliance references'
      ],
      documentLinks: [
        { name: 'ICH M8 Guidelines', url: 'https://ich.org/page/m8-ectd' },
        { name: 'ICH CTD Organization', url: 'https://www.ich.org/page/ctd' }
      ]
    }
  };
  
  // Generate analysis results based on template category and selected regions
  const generateAnalysisResults = (template, regions = ['us']) => {
    // Common issues for all regions
    const baseIssues = [
      {
        id: 1,
        severity: 'medium',
        category: 'formatting',
        message: 'Inconsistent heading structure may affect eCTD navigation',
        location: 'throughout document',
        autoFixable: true,
        status: 'active',
        regions: ['us', 'eu', 'ca', 'jp', 'intl'] // Affects all regions
      },
      {
        id: 2,
        severity: 'low',
        category: 'style',
        message: 'Consider using approved terminology for consistency',
        location: 'multiple sections',
        autoFixable: false,
        status: 'active',
        regions: ['us', 'eu', 'ca', 'jp', 'intl'] // Affects all regions
      }
    ];
    
    // Region-specific issues
    const regionSpecificIssues = {
      us: [
        {
          id: 101,
          severity: 'high',
          category: 'regulatory',
          message: 'Missing FDA-required electronic signatures and certifications',
          location: 'document metadata',
          autoFixable: true,
          status: 'active',
          regions: ['us']
        },
        {
          id: 102,
          severity: 'medium',
          category: 'technical',
          message: 'PDF format does not meet FDA PDF/A requirements for archiving',
          location: 'document properties',
          autoFixable: true,
          status: 'active',
          regions: ['us'] 
        }
      ],
      eu: [
        {
          id: 201,
          severity: 'high',
          category: 'regulatory',
          message: 'Missing EMA-required product information template sections',
          location: 'section 1.3',
          autoFixable: true,
          status: 'active',
          regions: ['eu']
        },
        {
          id: 202,
          severity: 'medium',
          category: 'formatting',
          message: 'EMA submission requires multilingual content placeholders',
          location: 'multiple sections',
          autoFixable: true,
          status: 'active',
          regions: ['eu']
        }
      ],
      ca: [
        {
          id: 301,
          severity: 'high',
          category: 'regulatory',
          message: 'Missing bilingual English/French content required by Health Canada',
          location: 'patient information sections',
          autoFixable: false,
          status: 'active',
          regions: ['ca']
        }
      ],
      jp: [
        {
          id: 401,
          severity: 'high',
          category: 'technical',
          message: 'PMDA submission requires Japanese character encoding support',
          location: 'document properties',
          autoFixable: true,
          status: 'active',
          regions: ['jp']
        }
      ],
      intl: [
        {
          id: 501,
          severity: 'medium',
          category: 'regulatory',
          message: 'Missing ICH E2C-compliant safety reporting structure',
          location: 'safety sections',
          autoFixable: true,
          status: 'active',
          regions: ['intl']
        }
      ]
    };
    
    // Add region-specific issues based on selected regions
    const regionIssues = regions.flatMap(region => 
      regionSpecificIssues[region] ? regionSpecificIssues[region] : []
    );
    
    let categorySpecificIssues = [];
    let baseScore = 80;
    let categoryRecommendations = [];
    
    switch(template.category) {
      case 'm1':
        categorySpecificIssues = [
          {
            id: 3,
            severity: 'high',
            category: 'regulatory',
            message: 'Missing required contact information section',
            location: 'end of document',
            autoFixable: true,
            status: 'active'
          }
        ];
        categoryRecommendations = [
          'Add standard FDA contact section at the end of the cover letter',
          'Include document submission type reference'
        ];
        baseScore = 78;
        break;
      case 'm2':
        categorySpecificIssues = [
          {
            id: 3,
            severity: 'high',
            category: 'regulatory',
            message: 'Missing benefit-risk assessment section required for summaries',
            location: 'section 2.5',
            autoFixable: true,
            status: 'active'
          }
        ];
        categoryRecommendations = [
          'Add clear cross-references to Module 3, 4, and 5',
          'Include standardized benefit-risk framework table'
        ];
        baseScore = 82;
        break;
      case 'm3':
        categorySpecificIssues = [
          {
            id: 3,
            severity: 'high',
            category: 'regulatory',
            message: 'Missing required quality control acceptance criteria',
            location: 'section 3.2.S.4.1',
            autoFixable: true,
            status: 'active'
          }
        ];
        categoryRecommendations = [
          'Add standard acceptance criteria table format',
          'Include method validation references'
        ];
        baseScore = 75;
        break;
      case 'm4':
        categorySpecificIssues = [
          {
            id: 3,
            severity: 'medium',
            category: 'regulatory',
            message: 'Missing GLP compliance statement required for nonclinical studies',
            location: 'study header',
            autoFixable: true,
            status: 'active'
          }
        ];
        categoryRecommendations = [
          'Add standardized results tables for toxicology studies',
          'Include clear cross-references to other nonclinical studies'
        ];
        baseScore = 83;
        break;
      case 'm5':
        categorySpecificIssues = [
          {
            id: 3,
            severity: 'high',
            category: 'regulatory',
            message: 'Missing ICH E3 required statistical methods section',
            location: 'study synopsis',
            autoFixable: true,
            status: 'active'
          }
        ];
        categoryRecommendations = [
          'Follow ICH E3 guideline structure for all clinical study reports',
          'Include standard safety evaluation section'
        ];
        baseScore = 76;
        break;
      default:
        baseScore = 80;
    }
    
    // Combine all applicable issues
    const allIssues = [...baseIssues, ...regionIssues, ...categorySpecificIssues].filter(issue => 
      // Only include issues for the selected regions
      issue.regions.some(r => regions.includes(r))
    );
    
    // Base recommendations applicable to all templates
    const baseRecommendations = [
      'Ensure consistent heading structure (H1 > H2 > H3)',
      'Use standardized terminology throughout the document',
      'Add appropriate document history table'
    ];
    
    // Region-specific recommendations
    const regionRecommendations = {
      us: [
        'Include a 21 CFR Part 11 compliance statement',
        'Ensure all FDA-specific templates have form field validation'
      ],
      eu: [
        'Include translations for pivotal EU member states',
        'Follow EMA electronic submission gateway requirements'
      ],
      ca: [
        'Include both English and French versions for Health Canada',
        'Follow Health Canada Module 1 format requirements'
      ],
      jp: [
        'Ensure font compatibility with Japanese character sets',
        'Follow PMDA-specific region Module 1 organization'
      ],
      intl: [
        'Apply ICH E3 and E6 guidelines for structure compliance',
        'Ensure proper CTD granularity as per ICH M8 guidance'
      ]
    };
    
    // Add region-specific recommendations
    const selectedRegionRecommendations = regions.flatMap(region => 
      regionRecommendations[region] || []
    );
    
    // Calculate scores for each selected region
    const regionScores = regions.map(region => {
      const regIssues = allIssues.filter(issue => issue.regions.includes(region));
      const highCount = regIssues.filter(i => i.severity === 'high').length;
      const mediumCount = regIssues.filter(i => i.severity === 'medium').length;
      
      // Adjust score based on issue severity
      let score = 95 - (highCount * 7) - (mediumCount * 3);
      
      // Minimum score floor
      score = Math.max(60, score);
      
      return {
        region,
        score,
        name: regulatoryAuthorities[region].name,
        icon: regulatoryAuthorities[region].icon,
        status: score >= 90 ? 'compliant' : (score >= 75 ? 'needs-revisions' : 'non-compliant')
      };
    });
    
    // Calculate overall score as weighted average of regional scores
    const overallScore = Math.round(
      regionScores.reduce((total, reg) => total + reg.score, 0) / regionScores.length
    );
    
    // Generate regulatory standards status
    const regulatoryStandards = [
      { name: 'eCTD Structure', status: 'pass' },
      { name: 'ICH Guidelines', status: regions.includes('intl') && overallScore >= 80 ? 'pass' : 'warning' }
    ];
    
    // Add region-specific standards
    regions.forEach(region => {
      if (region === 'us') {
        regulatoryStandards.push({ 
          name: 'FDA Requirements', 
          status: regionScores.find(r => r.region === 'us')?.score >= 85 ? 'pass' : 'warning' 
        });
      }
      if (region === 'eu') {
        regulatoryStandards.push({ 
          name: 'EMA Requirements', 
          status: regionScores.find(r => r.region === 'eu')?.score >= 80 ? 'pass' : 'warning' 
        });
      }
      if (region === 'ca') {
        regulatoryStandards.push({ 
          name: 'Health Canada Requirements', 
          status: regionScores.find(r => r.region === 'ca')?.score >= 80 ? 'pass' : 'warning' 
        });
      }
      if (region === 'jp') {
        regulatoryStandards.push({ 
          name: 'PMDA Requirements', 
          status: regionScores.find(r => r.region === 'jp')?.score >= 80 ? 'pass' : 'warning' 
        });
      }
    });
    
    return {
      score: overallScore,
      issues: allIssues,
      recommendations: [...baseRecommendations, ...selectedRegionRecommendations, ...categoryRecommendations],
      complianceStatus: overallScore >= 90 ? 'compliant' : 'needs-review',
      regulatoryStandards,
      regionScores
    };
  };
  
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-amber-600';
    return 'text-red-600';
  };
  
  const getScoreBackground = (score) => {
    if (score >= 90) return 'bg-green-50';
    if (score >= 75) return 'bg-amber-50';
    return 'bg-red-50';
  };
  
  const getSeverityBadge = (severity) => {
    switch(severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="warning" className="bg-amber-500">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  const getCategoryBadge = (category) => {
    switch(category) {
      case 'regulatory':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Regulatory</Badge>;
      case 'formatting':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Formatting</Badge>;
      case 'style':
        return <Badge variant="secondary" className="bg-slate-100 text-slate-800">Style</Badge>;
      default:
        return <Badge variant="secondary">Other</Badge>;
    }
  };
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'fail':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  // Region selector component
  const RegionSelector = () => (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Select Regulatory Regions:</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(regulatoryAuthorities).map(([key, region]) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={selectedRegions.includes(key) ? "default" : "outline"}
            className={selectedRegions.includes(key) ? "" : "border-dashed"}
            onClick={() => toggleRegion(key)}
          >
            <span className="mr-1">{region.icon}</span>
            {region.name}
          </Button>
        ))}
      </div>
    </div>
  );

  // Region scores component
  const RegionScores = ({ regionScores }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4">
      {regionScores.map((region) => (
        <div 
          key={region.region} 
          className={`border rounded-md p-2 ${region.score >= 90 ? 'bg-green-50' : (region.score >= 75 ? 'bg-amber-50' : 'bg-red-50')}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="mr-1 text-lg">{region.icon}</span>
              <span className="text-sm font-medium">{region.name}</span>
            </div>
            <span className={`font-bold ${getScoreColor(region.score)}`}>{region.score}%</span>
          </div>
          <Badge 
            className={`mt-1 ${region.score >= 90 ? 'bg-green-100 text-green-800' : (region.score >= 75 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')}`}
          >
            {region.status === 'compliant' ? 'Compliant' : (region.status === 'needs-revisions' ? 'Needs Revisions' : 'Non-Compliant')}
          </Badge>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Template Quality Analysis</CardTitle>
            <CardDescription>
              Analyze your template for quality, compliance with regulatory standards, and best practices
            </CardDescription>
          </div>
          
          {analysisResults && (
            <div className={`px-4 py-2 rounded-md flex flex-col items-center ${getScoreBackground(analysisResults.score)}`}>
              <span className={`text-3xl font-bold ${getScoreColor(analysisResults.score)}`}>
                {analysisResults.score}
              </span>
              <span className="text-sm text-gray-600">Quality Score</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {!analysisResults ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
              <FileCheck className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze</h3>
            <p className="text-gray-500 mb-4 max-w-md mx-auto">
              Run a quality analysis to check your template against regulatory standards, 
              formatting best practices, and content completeness.
            </p>
            
            {/* Region selector */}
            <div className="mb-6 max-w-md mx-auto">
              <RegionSelector />
            </div>
            
            <Button 
              onClick={runAnalysis}
              disabled={analyzing || !template}
              className="min-w-[200px]"
            >
              {analyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                'Run Quality Analysis'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Region selector remains available after analysis */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900">Regulatory Regions</h3>
                
                {/* Export buttons */}
                {analysisResults && (
                  <div className="flex space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => exportAnalysisReport('pdf')}
                            disabled={exporting}
                            className="flex items-center space-x-1"
                          >
                            {exporting ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            ) : (
                              <FileText className="h-3.5 w-3.5" />
                            )}
                            <span>PDF</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Export compliance report as PDF</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => exportAnalysisReport('csv')}
                            disabled={exporting}
                            className="flex items-center space-x-1"
                          >
                            {exporting ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            ) : (
                              <FileSpreadsheet className="h-3.5 w-3.5" />
                            )}
                            <span>CSV</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Export compliance data as CSV</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center space-x-1"
                              >
                                <Settings className="h-3.5 w-3.5" />
                                <span>Requirements</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Regulatory Requirements by Region</DialogTitle>
                                <DialogDescription>
                                  Detailed regulatory requirements for each selected region
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {selectedRegions.map(regionKey => {
                                  const region = regulatoryAuthorities[regionKey];
                                  return (
                                    <div key={regionKey} className={`border rounded-lg p-4 ${region.color}`}>
                                      <div className="flex items-center mb-3 font-medium">
                                        <span className="text-lg mr-2">{region.icon}</span>
                                        <h4 className="text-md">{region.name} Requirements</h4>
                                      </div>
                                      <ul className="space-y-2 text-sm">
                                        {region.specificRequirements.map((req, idx) => (
                                          <li key={idx} className="flex items-start">
                                            <Check className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                                            <span>{req}</span>
                                          </li>
                                        ))}
                                      </ul>
                                      {region.documentLinks && region.documentLinks.length > 0 && (
                                        <div className="mt-4 pt-3 border-t">
                                          <h5 className="text-sm font-medium mb-2">Reference Documentation:</h5>
                                          <ul className="space-y-1 text-sm">
                                            {region.documentLinks.map((link, idx) => (
                                              <li key={idx}>
                                                <a href={link.url} target="_blank" rel="noopener noreferrer" 
                                                   className="text-blue-600 hover:underline flex items-center">
                                                  <BookOpen className="h-3.5 w-3.5 mr-1" />
                                                  {link.name}
                                                </a>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View detailed regulatory requirements</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                Select regions to analyze compliance with different regulatory authorities:
              </p>
              <RegionSelector />
              
              {/* Only show if analysis complete and has region scores */}
              {analysisResults.regionScores && (
                <RegionScores regionScores={analysisResults.regionScores} />
              )}
              
              {/* Re-analyze button */}
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={runAnalysis}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                      Re-analyzing...
                    </>
                  ) : (
                    'Re-analyze with Selected Regions'
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-1/2 border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  Compliance Status
                </h3>
                
                <div className="flex flex-col space-y-1 mb-4">
                  {analysisResults.regulatoryStandards.map((standard, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        {getStatusIcon(standard.status)}
                        <span className="ml-2 text-sm text-gray-600">{standard.name}</span>
                      </div>
                      <Badge variant={standard.status === 'pass' ? 'outline' : 'secondary'}>
                        {standard.status === 'pass' ? 'Compliant' : 'Review Needed'}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <Alert className={analysisResults.complianceStatus === 'compliant' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}>
                  <div className="flex items-start">
                    {analysisResults.complianceStatus === 'compliant' 
                      ? <Award className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                      : <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                    }
                    <div>
                      <AlertTitle className={analysisResults.complianceStatus === 'compliant' ? 'text-green-700' : 'text-amber-700'}>
                        {analysisResults.complianceStatus === 'compliant' 
                          ? 'Template is Compliant' 
                          : 'Review Recommended'
                        }
                      </AlertTitle>
                      <AlertDescription className={analysisResults.complianceStatus === 'compliant' ? 'text-green-600' : 'text-amber-600'}>
                        {analysisResults.complianceStatus === 'compliant' 
                          ? 'This template meets regulatory standards and can be used for submissions.' 
                          : 'Address the highlighted issues before using this template for regulatory submissions.'
                        }
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              </div>
              
              <div className="md:w-1/2 border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Award className="h-5 w-5 text-blue-600 mr-2" />
                  Quality Score: {analysisResults.score}/100
                </h3>
                
                <div className="mb-4 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Overall Quality</span>
                      <span className={`text-sm font-medium ${getScoreColor(analysisResults.score)}`}>
                        {analysisResults.score >= 90 ? 'Excellent' : analysisResults.score >= 75 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                    <Progress value={analysisResults.score} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Structure</div>
                      <Progress value={analysisResults.score - 5} className="h-2" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Content</div>
                      <Progress value={analysisResults.score + 5} className="h-2" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Regulatory</div>
                      <Progress value={analysisResults.score - 10} className="h-2" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Formatting</div>
                      <Progress value={analysisResults.score + 8} className="h-2" />
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>
                    This analysis evaluates your template against industry standards and regulatory 
                    requirements specific to {getCategoryName(template.category)}.
                  </p>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="issues" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="issues" className="relative">
                  Issues
                  {analysisResults.issues.filter(i => i.status !== 'fixed').length > 0 && (
                    <Badge className="ml-2 absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                      {analysisResults.issues.filter(i => i.status !== 'fixed').length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="regulatory">Regulatory Guidance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="issues">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b font-medium flex justify-between items-center">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                      Issues Found ({analysisResults.issues.filter(i => i.status !== 'fixed').length})
                    </div>
                    
                    {analysisResults.issues.some(i => i.autoFixable && i.status !== 'fixed') && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={applyAllFixes}
                        className="text-xs"
                      >
                        Fix All Auto-fixable Issues
                      </Button>
                    )}
                  </div>
                  
                  {analysisResults.issues.filter(i => i.status !== 'fixed').length === 0 ? (
                    <div className="p-6 text-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Issues Found</h3>
                      <p className="text-gray-600">Your template has passed all quality checks.</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {analysisResults.issues.filter(i => i.status !== 'fixed').map(issue => (
                        <div key={issue.id} className="p-4">
                          <div className="flex items-start">
                            <div className="mt-0.5 mr-3">
                              {issue.severity === 'high' ? (
                                <X size={18} className="text-red-500" />
                              ) : issue.severity === 'medium' ? (
                                <AlertTriangle size={18} className="text-amber-500" />
                              ) : (
                                <HelpCircle size={18} className="text-blue-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{issue.message}</span>
                                <div className="flex gap-1">
                                  {getSeverityBadge(issue.severity)}
                                  {getCategoryBadge(issue.category)}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Location: {issue.location}
                              </p>
                              {issue.autoFixable && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleFixIssue(issue.id)}
                                  className="text-xs"
                                >
                                  Auto-Fix Issue
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {analysisResults.issues.some(i => i.status === 'fixed') && (
                    <div className="border-t">
                      <Accordion type="single" collapsible>
                        <AccordionItem value="fixed-issues">
                          <AccordionTrigger className="px-4 py-2 text-sm font-medium text-gray-600">
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              Fixed Issues ({analysisResults.issues.filter(i => i.status === 'fixed').length})
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="divide-y">
                              {analysisResults.issues.filter(i => i.status === 'fixed').map(issue => (
                                <div key={issue.id} className="p-4 bg-gray-50">
                                  <div className="flex items-start">
                                    <div className="mt-0.5 mr-3">
                                      <CheckCircle size={18} className="text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium line-through text-gray-500">{issue.message}</span>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Fixed</Badge>
                                      </div>
                                      <p className="text-sm text-gray-400 mb-2">
                                        Location: {issue.location}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="recommendations">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b font-medium flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                    Recommendations
                  </div>
                  
                  <div className="divide-y">
                    {analysisResults.recommendations.map((recommendation, index) => (
                      <div key={index} className="p-4 flex items-start hover:bg-gray-50">
                        <div className="mt-0.5 mr-3">
                          <ArrowRight size={18} className="text-blue-500" />
                        </div>
                        <span>{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="regulatory">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b font-medium flex items-center">
                    <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                    Regulatory Guidance for {getCategoryName(template.category)}
                  </div>
                  
                  <div className="p-4">
                    <RegulatoryGuidance category={template.category} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="outline" 
          disabled={analyzing}
          onClick={() => setAnalysisResults(null)}
          className="text-sm"
        >
          Reset Analysis
        </Button>
        
        {analysisResults && (
          <Button 
            onClick={runAnalysis}
            disabled={analyzing}
            className="text-sm"
          >
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              'Re-analyze Template'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Regulatory guidance component based on template category
function RegulatoryGuidance({ category }) {
  switch(category) {
    case 'm1':
      return (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Module 1 - Administrative Information</h3>
          <p>Module 1 contains region-specific administrative documents such as application forms and prescribing information.</p>
          
          <div className="mt-4">
            <h4 className="font-medium text-base">Key Regulatory References:</h4>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>FDA Guidance: <span className="text-blue-600">Format and Content of the Administrative Section</span></li>
              <li>EMA Guidance: <span className="text-blue-600">Module 1 eCTD Specification</span></li>
              <li>ICH M4: <span className="text-blue-600">Organization of the CTD</span></li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium">Required Elements:</h4>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Cover Letter with clear submission purpose</li>
              <li>Application Form (e.g., FDA Form 356h)</li>
              <li>Administrative information and contact details</li>
              <li>Labeling information</li>
              <li>Reference to application number (for amendments/supplements)</li>
            </ul>
          </div>
        </div>
      );
      
    case 'm2':
      return (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Module 2 - Common Technical Document Summaries</h3>
          <p>Module 2 contains the CTD summaries - the overviews and summaries of Modules 3, 4, and 5.</p>
          
          <div className="mt-4">
            <h4 className="font-medium text-base">Key Regulatory References:</h4>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>ICH M4E: <span className="text-blue-600">Common Technical Document for the Registration of Pharmaceuticals for Human Use - Efficacy</span></li>
              <li>ICH M4Q: <span className="text-blue-600">Quality Overall Summary</span></li>
              <li>FDA Guidance: <span className="text-blue-600">M4E: The CTD — Efficacy</span></li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium">Required Elements:</h4>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>CTD Table of Contents (2.1)</li>
              <li>CTD Introduction (2.2)</li>
              <li>Quality Overall Summary (2.3)</li>
              <li>Nonclinical Overview (2.4)</li>
              <li>Clinical Overview (2.5) with benefit-risk assessment</li>
              <li>Nonclinical Summary (2.6)</li>
              <li>Clinical Summary (2.7)</li>
            </ul>
          </div>
        </div>
      );
      
    case 'm3':
      return (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Module 3 - Quality</h3>
          <p>Module 3 contains detailed information on the quality aspects of the drug substance and drug product.</p>
          
          <div className="mt-4">
            <h4 className="font-medium text-base">Key Regulatory References:</h4>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>ICH M4Q: <span className="text-blue-600">The CTD — Quality</span></li>
              <li>ICH Q1A-E: <span className="text-blue-600">Stability Testing Guidelines</span></li>
              <li>ICH Q6A: <span className="text-blue-600">Specifications: Test Procedures and Acceptance Criteria</span></li>
              <li>ICH Q8: <span className="text-blue-600">Pharmaceutical Development</span></li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium">Required Elements:</h4>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>3.2.S Drug Substance sections (3.2.S.1-3.2.S.7)</li>
              <li>3.2.P Drug Product sections (3.2.P.1-3.2.P.8)</li>
              <li>Detailed analytical methods and validation</li>
              <li>Manufacturing process description</li>
              <li>Batch analysis data</li>
              <li>Stability data supporting shelf life</li>
            </ul>
          </div>
        </div>
      );
      
    case 'm4':
      return (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Module 4 - Nonclinical Study Reports</h3>
          <p>Module 4 contains the nonclinical study reports that detail pharmacology, pharmacokinetics, and toxicology studies.</p>
          
          <div className="mt-4">
            <h4 className="font-medium text-base">Key Regulatory References:</h4>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>ICH M4S: <span className="text-blue-600">The CTD — Safety</span></li>
              <li>ICH S1-S9: <span className="text-blue-600">Safety Guidelines</span></li>
              <li>FDA Guidance: <span className="text-blue-600">Nonclinical Safety Evaluation of Drug or Biologic Combinations</span></li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium">Required Elements:</h4>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>GLP compliance statement</li>
              <li>Pharmacology study reports (primary, secondary, safety)</li>
              <li>Pharmacokinetics study reports (ADME)</li>
              <li>Toxicology study reports (single-dose, repeat-dose, genotoxicity, carcinogenicity, etc.)</li>
              <li>Local tolerance studies</li>
              <li>Other toxicity studies as applicable</li>
            </ul>
          </div>
        </div>
      );
      
    case 'm5':
      return (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Module 5 - Clinical Study Reports</h3>
          <p>Module 5 contains the clinical study reports that document the clinical trials conducted with the product.</p>
          
          <div className="mt-4">
            <h4 className="font-medium text-base">Key Regulatory References:</h4>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>ICH E3: <span className="text-blue-600">Structure and Content of Clinical Study Reports</span></li>
              <li>ICH E6: <span className="text-blue-600">Good Clinical Practice</span></li>
              <li>FDA Guidance: <span className="text-blue-600">Submission of Clinical Trial Results Information</span></li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium">Required Elements:</h4>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Table of Contents (5.1)</li>
              <li>Tabular Listing of All Clinical Studies (5.2)</li>
              <li>Clinical Study Reports (5.3)</li>
              <li>Statistical methods description</li>
              <li>Efficacy and safety evaluations</li>
              <li>Risk-benefit conclusions</li>
              <li>Case report forms and individual patient data listings</li>
            </ul>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="text-center py-6">
          <CircleSlash className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-600">No Category Selected</h3>
          <p className="text-gray-500 mt-1">
            Select a template category to view specific regulatory guidance.
          </p>
        </div>
      );
  }
}

// Helper function to get category name
function getCategoryName(category) {
  switch(category) {
    case 'm1': return 'Module 1 (Administrative)';
    case 'm2': return 'Module 2 (Summaries)';
    case 'm3': return 'Module 3 (Quality)';
    case 'm4': return 'Module 4 (Nonclinical)';
    case 'm5': return 'Module 5 (Clinical)';
    default: return 'eCTD Module';
  }
}