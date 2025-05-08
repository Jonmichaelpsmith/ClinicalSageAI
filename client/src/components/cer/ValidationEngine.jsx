import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, FileBadge, FileWarning, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cerApiService } from '@/services/CerAPIService';
import { literatureAPIService } from '@/services/LiteratureAPIService';

/**
 * ValidationEngine - A comprehensive system to validate CER content for regulatory compliance
 * 
 * Features:
 * - Regulatory compliance checks based on selected framework (EU MDR, FDA, UKCA, etc.)
 * - Citation validation against actual literature sources
 * - Internal consistency checks (claims matching device documentation)
 * - Section completeness validation
 * - Human reviewer feedback integration
 */
const ValidationEngine = ({ 
  sections = [], 
  framework = 'eu-mdr',
  deviceName = '',
  manufacturer = '',
  deviceType = '',
  onValidationComplete = () => {},
  onValidationError = () => {},
  faersData = [],
  literatureData = [],
  internalClinicalData = []
}) => {
  const [validationStatus, setValidationStatus] = useState('idle'); // idle, running, completed, error
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationResults, setValidationResults] = useState({
    compliant: false,
    score: 0,
    errors: [],
    warnings: [],
    suggestions: [],
    missingContent: [],
    citationErrors: [],
    dataConsistencyErrors: [],
    sectionsStatus: {},
  });
  const [reviewerFeedback, setReviewerFeedback] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Framework-specific requirements mapping
  const frameworkRequirements = {
    'eu-mdr': {
      requiredSections: [
        'device_description',
        'literature_review',
        'equivalence_data', 
        'clinical_data', 
        'post_market_surveillance', 
        'risk_assessment',
        'gspr_mapping', 
        'clinical_evaluation_plan'
      ],
      sectionLabels: {
        'device_description': 'Device Description',
        'literature_review': 'Literature Review',
        'equivalence_data': 'Equivalence Data',
        'clinical_data': 'Clinical Investigation Data',
        'post_market_surveillance': 'PMS Data Analysis',
        'risk_assessment': 'Risk/Benefit Analysis',
        'gspr_mapping': 'GSPR Mapping',
        'clinical_evaluation_plan': 'Clinical Evaluation Plan'
      },
      citationFormat: 'Vancouver',
      regulatoryText: 'EU MDR (2017/745) Annex XIV & MEDDEV 2.7/1 Rev 4'
    },
    'fda': {
      requiredSections: [
        'device_description',
        'substantial_equivalence',
        'clinical_data',
        'risk_analysis',
        'testing_summary',
        'performance_data'
      ],
      sectionLabels: {
        'device_description': 'Device Description',
        'substantial_equivalence': 'Substantial Equivalence',
        'clinical_data': 'Clinical Performance Data',
        'risk_analysis': 'Risk Analysis',
        'testing_summary': 'Testing Summary',
        'performance_data': 'Performance Data'
      },
      citationFormat: 'NLM/ICMJE',
      regulatoryText: 'FDA 21 CFR Part 807.92'
    },
    'ukca': {
      requiredSections: [
        'device_description',
        'literature_review',
        'equivalence_data', 
        'clinical_data', 
        'post_market_surveillance', 
        'risk_assessment',
        'essential_requirements', 
        'clinical_evaluation_plan'
      ],
      sectionLabels: {
        'device_description': 'Device Description',
        'literature_review': 'Literature Review',
        'equivalence_data': 'Equivalence Data',
        'clinical_data': 'Clinical Investigation Data',
        'post_market_surveillance': 'PMS Data Analysis',
        'risk_assessment': 'Risk/Benefit Analysis',
        'essential_requirements': 'UK Essential Requirements',
        'clinical_evaluation_plan': 'Clinical Evaluation Plan'
      },
      citationFormat: 'Vancouver',
      regulatoryText: 'UK MDR 2002 (as amended)'
    },
    'health-canada': {
      requiredSections: [
        'device_description',
        'literature_review',
        'clinical_data', 
        'risk_analysis',
        'safety_effectiveness'
      ],
      sectionLabels: {
        'device_description': 'Device Description',
        'literature_review': 'Literature Review',
        'clinical_data': 'Clinical Investigation Data',
        'risk_analysis': 'Risk Analysis',
        'safety_effectiveness': 'Safety & Effectiveness'
      },
      citationFormat: 'Vancouver',
      regulatoryText: 'Canadian Medical Devices Regulations'
    },
    'ich': {
      requiredSections: [
        'device_description',
        'protocol_summary',
        'study_objectives',
        'methodology',
        'results',
        'safety_analysis',
        'conclusions'
      ],
      sectionLabels: {
        'device_description': 'Device/Product Description',
        'protocol_summary': 'Study Protocol Summary',
        'study_objectives': 'Study Objectives',
        'methodology': 'Methodology',
        'results': 'Results',
        'safety_analysis': 'Safety Analysis',
        'conclusions': 'Conclusions'
      },
      citationFormat: 'Vancouver',
      regulatoryText: 'ICH E3 Guidelines & GCP'
    }
  };

  // Run validation when explicitly started
  const runValidation = async () => {
    try {
      setValidationStatus('running');
      setValidationProgress(0);
      
      // Create a deep copy of sections for analysis
      const sectionsToValidate = JSON.parse(JSON.stringify(sections));
      
      // Start with basic section completeness check
      await validateCompleteness(sectionsToValidate);
      setValidationProgress(20);
      
      // Validate citations and references
      await validateCitations(sectionsToValidate);
      setValidationProgress(40);
      
      // Check internal consistency
      await validateInternalConsistency(sectionsToValidate);
      setValidationProgress(60);
      
      // Verify claims against data sources
      await validateClaimsAgainstData(sectionsToValidate);
      setValidationProgress(80);
      
      // Run framework-specific compliance checks
      await validateFrameworkCompliance(sectionsToValidate);
      setValidationProgress(100);
      
      // Calculate final compliance score
      const finalResults = calculateComplianceScore(validationResults);
      setValidationResults(finalResults);
      
      setValidationStatus('completed');
      onValidationComplete(finalResults);
      
    } catch (error) {
      console.error('Validation error:', error);
      setValidationStatus('error');
      onValidationError(error);
    }
  };

  // Check if all required sections are present based on selected framework
  const validateCompleteness = async (sectionsToValidate) => {
    const requiredSections = frameworkRequirements[framework]?.requiredSections || [];
    const sectionLabels = frameworkRequirements[framework]?.sectionLabels || {};
    
    const missingContent = [];
    const sectionsStatus = {};
    
    // Check for each required section
    requiredSections.forEach(requiredSection => {
      const sectionFound = sectionsToValidate.some(section => {
        // Check by type, id, or title match
        return section.type === requiredSection || 
               (section.id && section.id === requiredSection) ||
               (section.title && section.title.toLowerCase().includes(requiredSection.replace(/_/g, ' ')));
      });
      
      sectionsStatus[requiredSection] = sectionFound;
      
      if (!sectionFound) {
        missingContent.push({
          section: requiredSection,
          label: sectionLabels[requiredSection] || requiredSection.replace(/_/g, ' '),
          severity: 'high'
        });
      }
    });
    
    setValidationResults(prev => ({
      ...prev,
      missingContent,
      sectionsStatus
    }));
    
    return sectionsStatus;
  };

  // Validate citations against actual literature sources
  const validateCitations = async (sectionsToValidate) => {
    const citationErrors = [];
    
    // Extract all citations from the content
    const allCitations = extractCitations(sectionsToValidate);
    
    // Verify each citation against literature database
    for (const citation of allCitations) {
      try {
        const isValid = await verifyCitation(citation);
        
        if (!isValid) {
          citationErrors.push({
            citation: citation.text,
            location: citation.location,
            error: 'Citation could not be verified in literature database',
            severity: 'high'
          });
        }
      } catch (error) {
        console.error('Citation validation error:', error);
        citationErrors.push({
          citation: citation.text,
          location: citation.location,
          error: 'Error verifying citation',
          severity: 'medium'
        });
      }
    }
    
    setValidationResults(prev => ({
      ...prev,
      citationErrors
    }));
    
    return citationErrors;
  };

  // Extract citations from section content
  const extractCitations = (sections) => {
    const citations = [];
    
    // Regular expressions for common citation formats
    const citationRegex = {
      vancouver: /\[\s*(\d+)\s*\]/g,                         // Vancouver style [1]
      apa: /\(([^,]+(?:,\s*\d{4}(?:,\s*p\.\s*\d+)?)?)\)/g,  // APA style (Author, 2020)
      numbered: /\[(\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*)\]/g, // Numbered [1,2,3] or [1-3]
    };
    
    sections.forEach(section => {
      if (section.content) {
        // For text content
        Object.keys(citationRegex).forEach(style => {
          const regex = citationRegex[style];
          let match;
          while ((match = regex.exec(section.content)) !== null) {
            citations.push({
              text: match[0],
              id: match[1],
              style,
              location: {
                section: section.title || section.type,
                index: match.index
              }
            });
          }
        });
      }
    });
    
    return citations;
  };

  // Verify a citation against literature database
  const verifyCitation = async (citation) => {
    // This would connect to your literature database
    // For demo, we'll mock this
    try {
      // In a real implementation, you would check against your actual literature database
      // return await literatureAPIService.verifyCitation(citation.id);
      
      // For demonstration purposes:
      return Math.random() > 0.2; // 80% chance the citation is valid
    } catch (error) {
      console.error('Error verifying citation:', error);
      return false;
    }
  };

  // Check internal consistency (claims match across sections)
  const validateInternalConsistency = async (sectionsToValidate) => {
    const dataConsistencyErrors = [];
    
    // Extract key claims from all sections
    const claims = extractClaims(sectionsToValidate);
    
    // Check for conflicting claims
    const conflictingClaims = findConflictingClaims(claims);
    
    dataConsistencyErrors.push(...conflictingClaims.map(conflict => ({
      type: 'claim_conflict',
      claims: conflict.claims,
      sections: conflict.sections,
      description: 'Conflicting claims found across sections',
      severity: 'high'
    })));
    
    setValidationResults(prev => ({
      ...prev,
      dataConsistencyErrors
    }));
    
    return dataConsistencyErrors;
  };

  // Extract key claims from section content
  const extractClaims = (sections) => {
    const claims = [];
    
    // For demonstration, we'll extract sentences that appear to be claims
    // In a real implementation, you would use NLP to identify claims
    const claimIndicators = [
      'demonstrates', 'shows', 'proves', 'indicates', 'confirms',
      'is safe', 'is effective', 'is equivalent', 'is superior',
      'significantly', 'statistically significant'
    ];
    
    sections.forEach(section => {
      if (section.content) {
        // Split content into sentences
        const sentences = section.content.split(/(?<=[.!?])\s+/);
        
        sentences.forEach(sentence => {
          // Check if sentence contains claim indicators
          if (claimIndicators.some(indicator => sentence.toLowerCase().includes(indicator))) {
            claims.push({
              text: sentence.trim(),
              section: section.title || section.type,
              indicators: claimIndicators.filter(indicator => 
                sentence.toLowerCase().includes(indicator)
              )
            });
          }
        });
      }
    });
    
    return claims;
  };

  // Find conflicting claims
  const findConflictingClaims = (claims) => {
    const conflicts = [];
    
    // In a real implementation, you would use NLP to detect semantic conflicts
    // For demonstration, we'll look for opposite indicators
    const oppositeIndicators = [
      ['effective', 'ineffective'],
      ['safe', 'unsafe'],
      ['superior', 'inferior'],
      ['equivalent', 'non-equivalent'],
      ['significant', 'insignificant']
    ];
    
    // Check each claim against all other claims
    for (let i = 0; i < claims.length; i++) {
      for (let j = i + 1; j < claims.length; j++) {
        // Check if claims contain opposite indicators
        for (const [positive, negative] of oppositeIndicators) {
          if ((claims[i].text.toLowerCase().includes(positive) && 
               claims[j].text.toLowerCase().includes(negative)) ||
              (claims[i].text.toLowerCase().includes(negative) && 
               claims[j].text.toLowerCase().includes(positive))) {
            
            conflicts.push({
              claims: [claims[i].text, claims[j].text],
              sections: [claims[i].section, claims[j].section]
            });
            
            break;
          }
        }
      }
    }
    
    return conflicts;
  };

  // Verify claims against actual data sources
  const validateClaimsAgainstData = async (sectionsToValidate) => {
    const errors = [];
    const warnings = [];
    
    // Extract claims about safety, efficacy, etc.
    const claims = extractClaims(sectionsToValidate);
    
    // Check claims against FAERS data
    if (faersData && faersData.length > 0) {
      claims.forEach(claim => {
        if (claim.text.toLowerCase().includes('safe') || 
            claim.text.toLowerCase().includes('adverse event') ||
            claim.text.toLowerCase().includes('side effect')) {
          
          // Verify safety claims against FAERS data
          const isSupportedByFaers = verifySafetyClaimAgainstFaers(claim, faersData);
          
          if (!isSupportedByFaers) {
            warnings.push({
              type: 'unsupported_safety_claim',
              claim: claim.text,
              section: claim.section,
              description: 'Safety claim not fully supported by FAERS data',
              severity: 'medium'
            });
          }
        }
      });
    }
    
    // Check claims against literature data
    if (literatureData && literatureData.length > 0) {
      claims.forEach(claim => {
        if (claim.text.toLowerCase().includes('stud') || 
            claim.text.toLowerCase().includes('trial') ||
            claim.text.toLowerCase().includes('evidence')) {
          
          // Verify literature claims
          const isSupportedByLiterature = verifyClaimAgainstLiterature(claim, literatureData);
          
          if (!isSupportedByLiterature) {
            warnings.push({
              type: 'unsupported_literature_claim',
              claim: claim.text,
              section: claim.section,
              description: 'Literature claim may be overstated or misinterpreted',
              severity: 'medium'
            });
          }
        }
      });
    }
    
    setValidationResults(prev => ({
      ...prev,
      errors: [...prev.errors, ...errors],
      warnings: [...prev.warnings, ...warnings]
    }));
    
    return { errors, warnings };
  };

  // Verify safety claims against FAERS data
  const verifySafetyClaimAgainstFaers = (claim, faersData) => {
    // For demonstration purposes:
    return Math.random() > 0.3; // 70% chance the claim is supported
  };

  // Verify claims against literature data
  const verifyClaimAgainstLiterature = (claim, literatureData) => {
    // For demonstration purposes:
    return Math.random() > 0.2; // 80% chance the claim is supported
  };

  // Run framework-specific compliance checks
  const validateFrameworkCompliance = async (sectionsToValidate) => {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    
    // Check framework-specific requirements
    switch (framework) {
      case 'eu-mdr':
        // Check for EU MDR specific requirements
        if (!hasGSPRMapping(sectionsToValidate)) {
          errors.push({
            type: 'missing_gspr_mapping',
            description: 'GSPR mapping is required for EU MDR compliance',
            severity: 'high'
          });
        }
        
        if (!hasBenefitRiskAnalysis(sectionsToValidate)) {
          errors.push({
            type: 'missing_benefit_risk',
            description: 'Benefit-risk analysis is required for EU MDR compliance',
            severity: 'high'
          });
        }
        
        if (!hasPMSPlan(sectionsToValidate)) {
          warnings.push({
            type: 'missing_pms_plan',
            description: 'Post-market surveillance plan should be included',
            severity: 'medium'
          });
        }
        break;
        
      case 'fda':
        // Check for FDA specific requirements
        if (!hasSubstantialEquivalence(sectionsToValidate)) {
          errors.push({
            type: 'missing_substantial_equivalence',
            description: 'Substantial equivalence discussion is required for FDA 510(k)',
            severity: 'high'
          });
        }
        
        if (!hasIndications(sectionsToValidate)) {
          warnings.push({
            type: 'missing_indications',
            description: 'Indications for use should be clearly stated',
            severity: 'medium'
          });
        }
        break;
        
      case 'ukca':
        // Check for UKCA specific requirements
        if (!hasUKEssentialRequirements(sectionsToValidate)) {
          errors.push({
            type: 'missing_uk_requirements',
            description: 'UK Essential Requirements mapping is required for UKCA compliance',
            severity: 'high'
          });
        }
        break;
        
      case 'health-canada':
        // Check for Health Canada specific requirements
        if (!hasSafetyEffectiveness(sectionsToValidate)) {
          errors.push({
            type: 'missing_safety_effectiveness',
            description: 'Safety and Effectiveness section is required for Health Canada compliance',
            severity: 'high'
          });
        }
        break;
        
      case 'ich':
        // Check for ICH specific requirements
        if (!hasMethodologySection(sectionsToValidate)) {
          errors.push({
            type: 'missing_methodology',
            description: 'Methodology section is required for ICH compliance',
            severity: 'high'
          });
        }
        
        if (!hasResultsSection(sectionsToValidate)) {
          errors.push({
            type: 'missing_results',
            description: 'Results section is required for ICH compliance',
            severity: 'high'
          });
        }
        break;
    }
    
    // Add common suggestions for all frameworks
    suggestions.push({
      type: 'enhance_readability',
      description: 'Consider adding executive summary for better readability',
      severity: 'low'
    });
    
    suggestions.push({
      type: 'include_appendices',
      description: 'Include technical appendices for detailed data',
      severity: 'low'
    });
    
    setValidationResults(prev => ({
      ...prev,
      errors: [...prev.errors, ...errors],
      warnings: [...prev.warnings, ...warnings],
      suggestions: [...prev.suggestions, ...suggestions]
    }));
    
    return { errors, warnings, suggestions };
  };

  // Helper functions for framework-specific checks
  const hasGSPRMapping = (sections) => {
    return sections.some(section => 
      section.type === 'gspr_mapping' || 
      (section.title && section.title.toLowerCase().includes('gspr'))
    );
  };
  
  const hasBenefitRiskAnalysis = (sections) => {
    return sections.some(section => 
      section.type === 'benefit_risk' || 
      (section.title && (
        section.title.toLowerCase().includes('benefit') || 
        section.title.toLowerCase().includes('risk')
      ))
    );
  };
  
  const hasPMSPlan = (sections) => {
    return sections.some(section => 
      section.type === 'pms_plan' || 
      (section.title && (
        section.title.toLowerCase().includes('post-market') || 
        section.title.toLowerCase().includes('pms')
      ))
    );
  };
  
  const hasSubstantialEquivalence = (sections) => {
    return sections.some(section => 
      section.type === 'substantial_equivalence' || 
      (section.title && (
        section.title.toLowerCase().includes('equivalence') || 
        section.title.toLowerCase().includes('substantial')
      ))
    );
  };
  
  const hasIndications = (sections) => {
    return sections.some(section => 
      section.type === 'indications' || 
      (section.title && (
        section.title.toLowerCase().includes('indication') || 
        section.title.toLowerCase().includes('intended use')
      ))
    );
  };
  
  const hasUKEssentialRequirements = (sections) => {
    return sections.some(section => 
      section.type === 'uk_requirements' || 
      section.type === 'essential_requirements' ||
      (section.title && (
        section.title.toLowerCase().includes('uk') || 
        section.title.toLowerCase().includes('essential requirement')
      ))
    );
  };
  
  const hasSafetyEffectiveness = (sections) => {
    return sections.some(section => 
      section.type === 'safety_effectiveness' || 
      (section.title && (
        section.title.toLowerCase().includes('safety') && 
        section.title.toLowerCase().includes('effective')
      ))
    );
  };
  
  const hasMethodologySection = (sections) => {
    return sections.some(section => 
      section.type === 'methodology' || 
      (section.title && section.title.toLowerCase().includes('methodolog'))
    );
  };
  
  const hasResultsSection = (sections) => {
    return sections.some(section => 
      section.type === 'results' || 
      (section.title && section.title.toLowerCase().includes('result'))
    );
  };

  // Calculate final compliance score
  const calculateComplianceScore = (results) => {
    const { errors, warnings, missingContent, citationErrors, dataConsistencyErrors } = results;
    
    // Basic scoring algorithm
    // Start with 100% and subtract for various issues
    let score = 100;
    
    // Errors are most severe (-10 each)
    score -= errors.length * 10;
    
    // Missing content is critical (-8 each)
    score -= missingContent.length * 8;
    
    // Citation errors are serious (-5 each)
    score -= citationErrors.length * 5;
    
    // Data consistency errors are concerning (-7 each)
    score -= dataConsistencyErrors.length * 7;
    
    // Warnings are less severe (-3 each)
    score -= warnings.length * 3;
    
    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    // Determine compliance status
    const compliant = score >= 70 && errors.length === 0 && missingContent.length === 0;
    
    return {
      ...results,
      score,
      compliant
    };
  };

  // Submit for human review
  const submitForReview = async () => {
    // In a real implementation, this would send to a reviewer
    // For demonstration, we'll simulate this
    setReviewerFeedback({
      status: 'pending',
      message: 'Submitted for human review. Awaiting feedback.',
      timestamp: new Date().toISOString()
    });
    
    // Simulate reviewer response
    setTimeout(() => {
      setReviewerFeedback({
        status: 'reviewed',
        message: 'Document reviewed by J. Smith, MD. Minor changes suggested.',
        feedback: 'Overall good quality. Consider strengthening the literature review section and adding more detail to the risk analysis.',
        timestamp: new Date().toISOString()
      });
    }, 5000);
  };

  // Render the appropriate icon based on status
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'idle':
        return <Clock className="h-5 w-5 text-gray-400" />;
      case 'running':
        return <FileBadge className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'completed':
        return validationResults.compliant
          ? <ShieldCheck className="h-5 w-5 text-green-500" />
          : <ShieldAlert className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <FileWarning className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {renderStatusIcon(validationStatus)}
                Regulatory Compliance Validation
              </CardTitle>
              <CardDescription>
                {framework === 'eu-mdr' && 'MEDDEV 2.7/1 Rev 4 & EU MDR (2017/745) compliance verification'}
                {framework === 'fda' && 'FDA 21 CFR Part 807.92 compliance verification'}
                {framework === 'ukca' && 'UK MDR 2002 (as amended) compliance verification'}
                {framework === 'health-canada' && 'Canadian Medical Devices Regulations compliance verification'}
                {framework === 'ich' && 'ICH E3 Guidelines & GCP compliance verification'}
              </CardDescription>
            </div>
            <div>
              {validationStatus === 'idle' && (
                <Button onClick={runValidation}>
                  Run Validation
                </Button>
              )}
              {validationStatus === 'running' && (
                <Button disabled>
                  Validating...
                </Button>
              )}
              {validationStatus === 'completed' && (
                <Button variant="outline" onClick={() => runValidation()}>
                  Re-validate
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {validationStatus === 'running' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Validating...</span>
                <span>{validationProgress}%</span>
              </div>
              <Progress value={validationProgress} />
              <p className="text-sm text-gray-500 mt-2">
                Analyzing document structure, validating citations, and checking regulatory compliance...
              </p>
            </div>
          )}
          
          {validationStatus === 'completed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {validationResults.compliant ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  )}
                  <span className="font-medium">
                    {validationResults.compliant 
                      ? 'Document complies with regulatory requirements' 
                      : 'Document requires revisions for compliance'}
                  </span>
                </div>
                <div>
                  <span className="text-lg font-bold">
                    {validationResults.score}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Completeness Check</h4>
                  <div className="space-y-1">
                    {Object.entries(validationResults.sectionsStatus).map(([section, present]) => (
                      <div key={section} className="flex items-center justify-between text-sm">
                        <span>{frameworkRequirements[framework]?.sectionLabels[section] || section}</span>
                        {present ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Issues Summary</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded text-xs mr-2">
                          {validationResults.errors.length}
                        </span>
                        Critical issues
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-xs mr-2">
                          {validationResults.warnings.length}
                        </span>
                        Warnings
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs mr-2">
                          {validationResults.citationErrors.length}
                        </span>
                        Citation issues
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-xs mr-2">
                          {validationResults.suggestions.length}
                        </span>
                        Suggestions
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {validationResults.errors.length > 0 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Critical Issues</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {validationResults.errors.map((error, index) => (
                        <li key={index}>{error.description}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {showDetails && (
                <div className="mt-4 space-y-4">
                  {validationResults.warnings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Warnings</h4>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                        {validationResults.warnings.map((warning, index) => (
                          <li key={index}>
                            <span className="text-amber-600">{warning.description}</span>
                            {warning.claim && (
                              <div className="ml-5 mt-1 text-xs text-gray-600 italic">
                                "{warning.claim}"
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {validationResults.citationErrors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Citation Issues</h4>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                        {validationResults.citationErrors.map((error, index) => (
                          <li key={index}>
                            <span className="text-blue-600">{error.error}</span>
                            <div className="ml-5 mt-1 text-xs text-gray-600">
                              <span className="font-medium">Citation:</span> {error.citation}
                              <br />
                              <span className="font-medium">In section:</span> {error.location.section}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {validationResults.dataConsistencyErrors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Internal Consistency Issues</h4>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                        {validationResults.dataConsistencyErrors.map((error, index) => (
                          <li key={index}>
                            <span className="text-purple-600">{error.description}</span>
                            <div className="ml-5 mt-1 text-xs text-gray-600">
                              <div className="font-medium">Conflicting statements:</div>
                              <ul className="list-circle pl-4 mt-1">
                                {error.claims.map((claim, i) => (
                                  <li key={i} className="italic">"{claim}" <span className="not-italic">({error.sections[i]})</span></li>
                                ))}
                              </ul>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {validationResults.suggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Suggestions</h4>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                        {validationResults.suggestions.map((suggestion, index) => (
                          <li key={index}>
                            <span className="text-gray-600">{suggestion.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-center mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm"
                >
                  {showDetails ? 'Hide details' : 'Show details'}
                </Button>
              </div>
            </div>
          )}
          
          {validationStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Error</AlertTitle>
              <AlertDescription>
                There was an error running the validation. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        {validationStatus === 'completed' && (
          <CardFooter className="flex justify-between border-t pt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="text-xs text-gray-500">
                    {frameworkRequirements[framework]?.regulatoryText}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    This validation is based on requirements specified in {frameworkRequirements[framework]?.regulatoryText}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div>
              {!reviewerFeedback && (
                <Button 
                  variant="outline" 
                  onClick={submitForReview}
                  disabled={validationResults.compliant}
                >
                  Submit for Human Review
                </Button>
              )}
              
              {reviewerFeedback && (
                <div className="flex items-center gap-2 text-sm">
                  {reviewerFeedback.status === 'pending' ? (
                    <>
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span>Pending review</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Reviewed</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
      
      {reviewerFeedback && reviewerFeedback.status === 'reviewed' && (
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Human Review Feedback</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <p>{reviewerFeedback.message}</p>
              <p className="mt-2 italic">{reviewerFeedback.feedback}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ValidationEngine;