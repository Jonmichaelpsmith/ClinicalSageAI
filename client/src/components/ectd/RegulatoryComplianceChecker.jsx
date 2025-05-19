/**
 * Regulatory Compliance Checker Component for eCTD Module
 * 
 * This component verifies template compliance with regulatory requirements
 * for different regions (FDA, EMA, Health Canada, etc.) and provides
 * actionable feedback for meeting compliance standards.
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  Lightbulb, 
  FileSpreadsheet, 
  Download,
  CheckSquare,
  Globe,
  ShieldCheck,
  RefreshCw,
  FileText,
  Info
} from 'lucide-react';

export default function RegulatoryComplianceChecker({ templateId, templateData, region = 'us', onUpdate }) {
  const [complianceResults, setComplianceResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [regulatoryRegion, setRegulatoryRegion] = useState(region);
  const { toast } = useToast();

  // Regulatory standards by region
  const regulatoryStandards = {
    us: {
      name: 'FDA (United States)',
      icon: '🇺🇸',
      key: 'us',
      standards: [
        'FDA eCTD Technical Conformance Guide',
        'FDA Content and Format Guidance',
        'CDER/CBER/CDRH Technical Requirements'
      ]
    },
    eu: {
      name: 'EMA (European Union)',
      icon: '🇪🇺',
      key: 'eu',
      standards: [
        'EU Module 1 Specification',
        'EMA Technical Validation Criteria',
        'EU Regional Content Requirements'
      ]
    },
    ca: {
      name: 'Health Canada',
      icon: '🇨🇦',
      key: 'ca',
      standards: [
        'HC eCTD v4.0 Requirements',
        'Canadian Module 1 Requirements',
        'Product Monograph Standards'
      ]
    },
    jp: {
      name: 'PMDA (Japan)',
      icon: '🇯🇵',
      key: 'jp',
      standards: [
        'Japan eCTD Technical Requirements',
        'PMDA Module 1 Requirements',
        'Japanese Regional Standards'
      ]
    },
    intl: {
      name: 'ICH (International)',
      icon: '🌎',
      key: 'intl',
      standards: [
        'ICH eCTD Specification v4.0',
        'ICH M4 Organization Standards',
        'ICH E3, E6, M8 Guidelines'
      ]
    }
  };

  useEffect(() => {
    if (templateId && templateData) {
      checkCompliance();
    }
  }, [templateId, templateData, regulatoryRegion]);

  // Function to check template compliance
  const checkCompliance = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call an API with the template data
      // For demonstration, using mock compliance results
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      
      const mockResults = generateMockComplianceResults(templateData, regulatoryRegion);
      setComplianceResults(mockResults);
      setOverallScore(calculateOverallScore(mockResults));
    } catch (error) {
      console.error('Error checking compliance:', error);
      toast({
        title: 'Compliance Check Failed',
        description: 'Unable to verify regulatory compliance. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall compliance score
  const calculateOverallScore = (results) => {
    if (!results || !results.checkResults) return 0;
    
    const checks = results.checkResults;
    const totalChecks = checks.length;
    const passedChecks = checks.filter(check => check.status === 'pass').length;
    const warningChecks = checks.filter(check => check.status === 'warning').length;
    
    // Weight: passed = 1.0, warnings = 0.5, failed = 0
    return Math.round(((passedChecks + (warningChecks * 0.5)) / totalChecks) * 100);
  };

  // Function to fix a compliance issue
  const handleFixIssue = async (issueId) => {
    if (!complianceResults) return;
    
    setLoading(true);
    try {
      // In a real implementation, this would call an API to fix the issue
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      
      // Update local state to reflect the fix
      const updatedResults = {
        ...complianceResults,
        checkResults: complianceResults.checkResults.map(check => 
          check.id === issueId ? { ...check, status: 'pass', message: 'Issue fixed automatically' } : check
        )
      };
      
      setComplianceResults(updatedResults);
      setOverallScore(calculateOverallScore(updatedResults));
      
      toast({
        title: 'Issue Fixed',
        description: 'The compliance issue has been automatically resolved.',
      });
      
      // If onUpdate callback provided, call it with updated template data
      if (onUpdate) {
        onUpdate({
          ...templateData,
          complianceStatus: {
            score: calculateOverallScore(updatedResults),
            lastChecked: new Date().toISOString(),
            region: regulatoryRegion
          }
        });
      }
    } catch (error) {
      console.error('Error fixing issue:', error);
      toast({
        title: 'Fix Failed',
        description: 'Unable to automatically fix the issue. Manual correction may be required.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to get status icon
  const getStatusIcon = (status, size = 16) => {
    switch (status) {
      case 'pass':
        return <CheckCircle size={size} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={size} className="text-amber-500" />;
      case 'fail':
        return <AlertCircle size={size} className="text-red-500" />;
      default:
        return <Info size={size} className="text-gray-500" />;
    }
  };
  
  // Generate score color based on score value
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };
  
  // Generate progress bar color based on score value
  const getProgressColor = (score) => {
    if (score >= 90) return 'bg-green-600';
    if (score >= 70) return 'bg-amber-600';
    return 'bg-red-600';
  };
  
  // Get compliance label based on score
  const getComplianceLabel = (score) => {
    if (score >= 90) return 'Compliant';
    if (score >= 70) return 'Needs Minor Revisions';
    return 'Major Compliance Issues';
  };

  // Region selector
  const RegionSelector = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {Object.values(regulatoryStandards).map(region => (
        <Button
          key={region.key}
          variant={regulatoryRegion === region.key ? "default" : "outline"}
          size="sm"
          onClick={() => setRegulatoryRegion(region.key)}
          className="flex items-center"
        >
          <span className="mr-1">{region.icon}</span>
          {region.name}
        </Button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <RefreshCw size={24} className="animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Checking regulatory compliance...</p>
        </div>
      </div>
    );
  }

  if (!complianceResults) {
    return (
      <div className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Ready to Check Compliance</AlertTitle>
          <AlertDescription>
            Select a regulatory region to verify template compliance with specific standards and requirements.
          </AlertDescription>
        </Alert>
        
        <RegionSelector />
        
        <Button onClick={checkCompliance} className="w-full flex items-center justify-center">
          <ShieldCheck className="mr-2 h-4 w-4" />
          Start Compliance Check
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Regulatory Compliance Check</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkCompliance}
          className="flex items-center"
        >
          <RefreshCw className="mr-1 h-4 w-4" />
          Re-check
        </Button>
      </div>
      
      <RegionSelector />
      
      {/* Overall compliance score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Compliance Score</span>
            <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress 
              value={overallScore} 
              className="h-2.5" 
              indicatorClassName={getProgressColor(overallScore)} 
            />
            <div className="flex justify-between text-sm">
              <Badge variant={overallScore >= 70 ? (overallScore >= 90 ? "success" : "warning") : "destructive"}>
                {getComplianceLabel(overallScore)}
              </Badge>
              <span className="text-gray-500 text-xs">
                Last checked: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Compliance details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {regulatoryStandards[regulatoryRegion].name} Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-64 overflow-auto border-t">
            <div className="divide-y">
              {complianceResults.checkResults.map((check) => (
                <div key={check.id} className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getStatusIcon(check.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{check.title}</p>
                        <Badge 
                          variant={check.status === 'pass' ? "outline" : (check.status === 'warning' ? "secondary" : "destructive")}
                          className="ml-auto"
                        >
                          {check.status === 'pass' ? 'Passed' : (check.status === 'warning' ? 'Warning' : 'Failed')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                      
                      {check.status !== 'pass' && check.canAutoFix && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2 text-xs h-7 px-2 text-indigo-600"
                          onClick={() => handleFixIssue(check.id)}
                        >
                          <CheckSquare className="mr-1 h-3 w-3" />
                          Auto-fix issue
                        </Button>
                      )}
                      
                      {check.recommendation && (
                        <div className="mt-2 bg-amber-50 p-2 rounded-sm text-xs text-amber-800 flex items-start gap-1.5">
                          <Lightbulb className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                          <span>{check.recommendation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t px-4 py-3">
          <div className="flex w-full justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Standards checked: </span>
              {regulatoryStandards[regulatoryRegion].standards.join(', ')}
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Function to generate mock compliance results
function generateMockComplianceResults(templateData, region) {
  const standards = {
    us: [
      { 
        id: 'usa-1', 
        title: 'FDA-compliant header/footer format', 
        status: Math.random() > 0.3 ? 'pass' : 'fail',
        message: 'The header/footer format follows FDA guidelines for eCTD submissions.',
        category: 'formatting',
        canAutoFix: true,
        recommendation: null
      },
      { 
        id: 'usa-2', 
        title: 'Referenced CFR sections', 
        status: Math.random() > 0.6 ? 'pass' : 'warning',
        message: 'Some CFR references need to be updated to the latest revisions.',
        category: 'content',
        canAutoFix: false,
        recommendation: 'Review and update CFR references to include the latest revisions from 2025.'
      },
      { 
        id: 'usa-3', 
        title: 'PDF/A compliance', 
        status: 'pass',
        message: 'The template will generate PDF/A-compliant documents required by FDA.',
        category: 'technical',
        canAutoFix: false,
        recommendation: null
      },
      { 
        id: 'usa-4', 
        title: 'Document margins for 510k/NDA/BLA', 
        status: Math.random() > 0.5 ? 'pass' : 'warning',
        message: 'Document margins meet FDA specifications for electronic review.',
        category: 'formatting',
        canAutoFix: true,
        recommendation: null
      },
      { 
        id: 'usa-5', 
        title: 'Hyperlink requirements', 
        status: Math.random() > 0.7 ? 'pass' : 'fail',
        message: 'Some internal hyperlinks may not conform to FDA Electronic Submissions guidance.',
        category: 'technical',
        canAutoFix: true,
        recommendation: 'Use relative paths for cross-document references and bookmark all sections.'
      },
      { 
        id: 'usa-6', 
        title: 'Bookmarks and TOC structure', 
        status: Math.random() > 0.4 ? 'pass' : 'warning',
        message: 'Bookmark structure uses FDA-recommended hierarchy.',
        category: 'formatting',
        canAutoFix: true,
        recommendation: null
      },
      { 
        id: 'usa-7', 
        title: 'Required font embedding', 
        status: 'pass',
        message: 'All fonts are embedded as required for FDA submissions.',
        category: 'technical',
        canAutoFix: false,
        recommendation: null
      }
    ],
    eu: [
      { 
        id: 'eu-1', 
        title: 'EMA metadata requirements', 
        status: Math.random() > 0.4 ? 'pass' : 'fail',
        message: 'Document metadata includes all required EMA fields.',
        category: 'technical',
        canAutoFix: true,
        recommendation: null
      },
      { 
        id: 'eu-2', 
        title: 'EU Module 1 region specifics', 
        status: Math.random() > 0.5 ? 'pass' : 'warning',
        message: 'Template includes EU-specific Module 1 sections as required.',
        category: 'content',
        canAutoFix: false,
        recommendation: 'Review EU variations regulation updates from 2025.'
      },
      { 
        id: 'eu-3', 
        title: 'EU SmPC template compliance', 
        status: Math.random() > 0.6 ? 'pass' : 'warning',
        message: 'SmPC template sections meet current EMA formatting requirements.',
        category: 'formatting',
        canAutoFix: true,
        recommendation: null
      },
      { 
        id: 'eu-4', 
        title: 'Language identification tagging', 
        status: 'warning',
        message: 'Language identifiers for multi-language content need to be standardized.',
        category: 'technical',
        canAutoFix: true,
        recommendation: 'Use ISO language codes for all sections with multi-language content.'
      },
      { 
        id: 'eu-5', 
        title: 'PDF version compliance', 
        status: 'pass',
        message: 'PDF version meets EMA requirements for electronic submissions.',
        category: 'technical',
        canAutoFix: false,
        recommendation: null
      }
    ],
    ca: [
      { 
        id: 'ca-1', 
        title: 'Health Canada folder structure', 
        status: Math.random() > 0.4 ? 'pass' : 'warning',
        message: 'Template organization follows Health Canada eCTD folder structure.',
        category: 'structure',
        canAutoFix: true,
        recommendation: null
      },
      { 
        id: 'ca-2', 
        title: 'Bilingual content requirements', 
        status: 'fail',
        message: 'Template does not fully support bilingual (English/French) content requirements.',
        category: 'content',
        canAutoFix: false,
        recommendation: 'Add placeholders for French translations in all patient-facing sections.'
      },
      { 
        id: 'ca-3', 
        title: 'Product Monograph format', 
        status: Math.random() > 0.5 ? 'pass' : 'warning',
        message: 'Product Monograph sections follow Health Canada guidance.',
        category: 'formatting',
        canAutoFix: true,
        recommendation: null
      },
      { 
        id: 'ca-4', 
        title: 'Administrative form compatibility', 
        status: 'pass',
        message: 'Template is compatible with current HC administrative forms.',
        category: 'technical',
        canAutoFix: false,
        recommendation: null
      }
    ],
    jp: [
      { 
        id: 'jp-1', 
        title: 'PMDA file naming convention', 
        status: Math.random() > 0.3 ? 'pass' : 'fail',
        message: 'File naming meets PMDA eCTD requirements.',
        category: 'technical',
        canAutoFix: true,
        recommendation: null
      },
      { 
        id: 'jp-2', 
        title: 'Japanese character support', 
        status: 'warning',
        message: 'Template may have limited support for Japanese character rendering.',
        category: 'technical',
        canAutoFix: false,
        recommendation: 'Use embedded fonts that fully support Japanese character sets.'
      },
      { 
        id: 'jp-3', 
        title: 'PMDA-specific sections', 
        status: Math.random() > 0.6 ? 'pass' : 'warning',
        message: 'Template includes Japan-specific sections required by PMDA.',
        category: 'content',
        canAutoFix: true,
        recommendation: null
      }
    ],
    intl: [
      { 
        id: 'intl-1', 
        title: 'ICH M4 organization', 
        status: 'pass',
        message: 'Template structure follows ICH M4 CTD organization.',
        category: 'structure',
        canAutoFix: false,
        recommendation: null
      },
      { 
        id: 'intl-2', 
        title: 'ICH E3 CSR compliance', 
        status: Math.random() > 0.4 ? 'pass' : 'warning',
        message: 'Clinical report sections meet ICH E3 guidance requirements.',
        category: 'content',
        canAutoFix: true,
        recommendation: null
      },
      { 
        id: 'intl-3', 
        title: 'ICH eCTD granularity', 
        status: Math.random() > 0.5 ? 'pass' : 'fail',
        message: 'Document granularity follows ICH eCTD specifications.',
        category: 'structure',
        canAutoFix: true,
        recommendation: 'Ensure each document contains only one CTD section to maintain proper granularity.'
      },
      { 
        id: 'intl-4', 
        title: 'ICH M8 implementation', 
        status: 'pass',
        message: 'Template follows ICH M8 eCTD specification v4.0.',
        category: 'technical',
        canAutoFix: false,
        recommendation: null
      },
      { 
        id: 'intl-5', 
        title: 'Cross-reference compatibility', 
        status: Math.random() > 0.7 ? 'pass' : 'warning',
        message: 'Cross-references work across module boundaries.',
        category: 'technical',
        canAutoFix: true,
        recommendation: null
      }
    ]
  };

  return {
    templateId: templateData?.id || '12345',
    region,
    timestamp: new Date().toISOString(),
    checkResults: standards[region] || standards.intl
  };
}