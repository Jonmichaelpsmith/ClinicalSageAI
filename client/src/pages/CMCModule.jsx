import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  ChevronRight,
  FileText,
  PlusCircle,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Search,
  FileSymlink,
  Factory,
  Beaker,
  FlaskConical,
  Microscope,
  ShieldAlert,
  BarChart3,
  Shield,
  Activity,
  Landmark,
  Lock,
  Scale
} from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

// Status badge component with hover details
const StatusBadge = ({ status, text, details }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900';
      case 'error': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'warning': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'error': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'info': return <FileSymlink className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Badge className={`${getStatusColor()} flex items-center gap-1 cursor-help`}>
          {getStatusIcon()}
          {text}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex flex-col gap-2">
          <h4 className="font-medium">{text} Details</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{details}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

// Regulatory compliance check component
const RegulatoryCheck = ({ requirement, status, region, details }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'compliant': return 'text-green-600 dark:text-green-400';
      case 'partial': return 'text-yellow-600 dark:text-yellow-400';
      case 'non-compliant': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <AlertTriangle className="w-4 h-4" />;
      case 'non-compliant': return <ShieldAlert className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="flex items-start justify-between p-2 border-b dark:border-gray-700">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{requirement}</span>
          <Badge variant="outline" className="text-xs">{region}</Badge>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{details}</p>
      </div>
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-xs font-medium">{status}</span>
      </div>
    </div>
  );
};

// Process card component
const ProcessCard = ({ title, description, status, progress, linkedRecords }) => {
  return (
    <Card className="mb-4 border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <StatusBadge 
            status={status === 'Validated' ? 'success' : status === 'In Review' ? 'warning' : 'info'} 
            text={status}
            details={`This manufacturing process is currently ${status.toLowerCase()}. ${status === 'Validated' ? 'All requirements have been met.' : 'Additional actions may be required.'}`}
          />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Documentation Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        {linkedRecords.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-1">Linked Quality Records</h4>
            <div className="space-y-1">
              {linkedRecords.map((record, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-1.5 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    <span>{record.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {record.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" size="sm" className="text-xs">
          <FileSymlink className="w-3.5 h-3.5 mr-1" /> Link Records
        </Button>
        <Button size="sm" className="text-xs">
          <ChevronRight className="w-3.5 h-3.5" /> View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

// Risk analysis card component
const RiskAnalysisCard = ({ title, severity, probability, description, recommendations, impact }) => {
  const getRiskLevelColor = () => {
    const riskScore = severity * probability;
    if (riskScore >= 15) return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
    if (riskScore >= 8) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
    return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
  };

  const getRiskLevel = () => {
    const riskScore = severity * probability;
    if (riskScore >= 15) return 'High';
    if (riskScore >= 8) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="absolute top-0 right-0 h-full w-1.5 bg-gradient-to-b from-indigo-500 to-purple-600"></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge className={getRiskLevelColor()}>
            {getRiskLevel()} Risk
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">Severity</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{severity}/5</span>
              <Progress value={severity * 20} className="h-1.5 w-16" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">Probability</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{probability}/5</span>
              <Progress value={probability * 20} className="h-1.5 w-16" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">Impact</span>
            <span className="font-medium">{impact}</span>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Recommendations</h4>
          <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 pl-4 list-disc">
            {recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-end gap-2">
        <Button variant="outline" size="sm" className="text-xs">Assign Task</Button>
        <Button size="sm" className="text-xs">View Analysis</Button>
      </CardFooter>
    </Card>
  );
};

// CMC Section template component
const CMCTemplate = ({ title, section, status, content, nextRevision, feedbackCount }) => {
  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Section {section}</Badge>
              <StatusBadge 
                status={status === 'Approved' ? 'success' : status === 'In Review' ? 'warning' : 'info'} 
                text={status}
                details={`This CMC section is currently ${status.toLowerCase()}. ${status === 'Approved' ? 'No further changes are needed.' : 'Additional edits or reviews may be required.'}`}
              />
              {feedbackCount > 0 && (
                <Badge variant="secondary">{feedbackCount} {feedbackCount === 1 ? 'Comment' : 'Comments'}</Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 dark:text-gray-400">Next Revision: </span>
            <span className="text-xs font-medium">{nextRevision}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-24 overflow-hidden relative">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">{content}</p>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Button variant="outline" size="sm" className="text-xs">
          <FileText className="w-3.5 h-3.5 mr-1" /> View Content
        </Button>
        <Button size="sm" className="text-xs">
          <PlusCircle className="w-3.5 h-3.5 mr-1" /> Edit Section
        </Button>
      </CardFooter>
    </Card>
  );
};

const CMCModule = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  const cmcSections = [
    {
      id: 1,
      title: 'Drug Substance Manufacturing Process',
      section: 'S.2.2',
      status: 'Approved',
      content: 'The active pharmaceutical ingredient (API) is manufactured via a six-step synthetic process. The process begins with the reaction of Compound A with Compound B in the presence of a palladium catalyst to form the key intermediate C. After purification by recrystallization, Intermediate C undergoes further transformations including reduction, protection, coupling, and deprotection steps. Quality is ensured through in-process controls at critical steps, with special attention to impurity profiles and stereochemical purity.',
      nextRevision: 'June 15, 2025',
      feedbackCount: 0
    },
    {
      id: 2,
      title: 'Manufacturing Process Controls',
      section: 'S.2.4',
      status: 'In Review',
      content: 'Critical process parameters have been identified through risk assessment and design of experiments (DoE). Temperature control during the coupling reaction (Step 4) is maintained at 55±2°C, as higher temperatures lead to formation of Impurity X, while lower temperatures reduce yield. Reaction time is controlled between 4-6 hours with in-process testing to ensure completion. Catalyst concentration impacts both yield and impurity profile, with optimal range established as 0.2-0.3 mol%. Process validation has demonstrated that these controls ensure consistent quality across multiple batches.',
      nextRevision: 'May 10, 2025',
      feedbackCount: 3
    },
    {
      id: 3,
      title: 'Control of Drug Product',
      section: 'P.5',
      status: 'Draft',
      content: 'The drug product specification includes tests for identity, assay, impurities, dissolution, content uniformity, and microbial limits. The analytical methods have been validated according to ICH Q2(R1) guidelines for specificity, linearity, accuracy, precision, range, detection limit, quantitation limit, and robustness as appropriate for each test. Chromatographic methods include HPLC with UV detection for assay and impurities, with method transfers completed to quality control laboratories at all manufacturing sites. Stability-indicating methods have been developed and validated to monitor potential degradation products.',
      nextRevision: 'May 25, 2025',
      feedbackCount: 5
    }
  ];

  const manufacturingProcesses = [
    {
      title: 'API Synthesis - Route B',
      description: 'Multi-step organic synthesis including critical catalytic hydrogenation',
      status: 'Validated',
      progress: 100,
      linkedRecords: [
        { name: 'Process Validation Report PVR-2025-003', type: 'Validation' },
        { name: 'CAPA-2024-112: Catalyst Purity Issue', type: 'CAPA' }
      ]
    },
    {
      title: 'Tablet Compression Process',
      description: 'Direct compression method with in-line PAT monitoring',
      status: 'In Review',
      progress: 75,
      linkedRecords: [
        { name: 'Deviation Report DEV-2025-017', type: 'Deviation' },
        { name: 'Qualification Protocol QP-COMP-2025', type: 'Qualification' }
      ]
    }
  ];

  const riskAnalyses = [
    {
      title: 'API Supplier Change Impact',
      severity: 4,
      probability: 3,
      impact: 'Product Quality & Supply',
      description: 'Evaluation of quality and regulatory impact for changing the API supplier from Vendor A to Vendor B',
      recommendations: [
        'Conduct comparative impurity profiling between vendors',
        'Execute 3-batch bridging stability study with new API source',
        'Update supplier qualification documentation',
        'Prepare regulatory variation/amendment strategy'
      ]
    },
    {
      title: 'Manufacturing Facility Transfer',
      severity: 3,
      probability: 4,
      impact: 'Regulatory Submissions & Timelines',
      description: 'Assessment of risks associated with moving production from Site 1 to Site 2',
      recommendations: [
        'Implement enhanced equipment qualification at new site',
        'Conduct process performance qualification (PPQ) with increased sampling',
        'Update facility-specific sections in regulatory documents',
        'Develop comprehensive comparability protocol'
      ]
    }
  ];

  const regulatoryChecks = [
    { requirement: 'Stability Data Duration', status: 'compliant', region: 'ICH', details: 'Long-term stability data covers 36 months at 25°C/60% RH' },
    { requirement: 'Starting Material Justification', status: 'partial', region: 'EMA', details: 'Synthetic route description requires additional details on impurity fate and purge' },
    { requirement: 'Process Validation Approach', status: 'compliant', region: 'FDA', details: 'Lifecycle approach implemented with continued process verification' },
    { requirement: 'Elemental Impurities Assessment', status: 'non-compliant', region: 'ICH Q3D', details: 'Risk assessment does not address potential catalyst residues adequately' }
  ];

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CMC Management Suite</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive Chemistry, Manufacturing, and Controls management system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search CMC documents..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> New Section
          </Button>
        </div>
      </div>

      <Alert className="mb-6 border-indigo-200 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-900">
        <FlaskConical className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <AlertTitle className="text-indigo-600 dark:text-indigo-400">Enterprise CMC Module</AlertTitle>
        <AlertDescription className="text-indigo-700/80 dark:text-indigo-300">
          This module provides advanced capabilities for managing Chemistry, Manufacturing, and Controls documentation and processes. 
          Link manufacturing records, validate against regulatory requirements, and perform AI-driven risk analysis.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="sections" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>CMC Sections</span>
          </TabsTrigger>
          <TabsTrigger value="processes" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            <span>Manufacturing Processes</span>
          </TabsTrigger>
          <TabsTrigger value="risk-analysis" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Risk Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="regulatory" className="flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            <span>Regulatory Compliance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cmcSections.map((section) => (
              <CMCTemplate
                key={section.id}
                title={section.title}
                section={section.section}
                status={section.status}
                content={section.content}
                nextRevision={section.nextRevision}
                feedbackCount={section.feedbackCount}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="processes" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {manufacturingProcesses.map((process, index) => (
              <ProcessCard 
                key={index}
                title={process.title}
                description={process.description}
                status={process.status}
                progress={process.progress}
                linkedRecords={process.linkedRecords}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risk-analysis" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {riskAnalyses.map((risk, index) => (
              <RiskAnalysisCard
                key={index}
                title={risk.title}
                severity={risk.severity}
                probability={risk.probability}
                description={risk.description}
                recommendations={risk.recommendations}
                impact={risk.impact}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="regulatory" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  ICH Guideline Compliance
                </CardTitle>
                <CardDescription>
                  Validation against international regulatory requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px] rounded-md border">
                  <div className="p-4">
                    {regulatoryChecks.map((check, index) => (
                      <RegulatoryCheck
                        key={index}
                        requirement={check.requirement}
                        status={check.status}
                        region={check.region}
                        details={check.details}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  Export Report
                </Button>
                <Button size="sm">
                  Run Compliance Check
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Global Requirements Validator
                </CardTitle>
                <CardDescription>
                  Configure and run validation against region-specific requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="specification-type">Specification Type</Label>
                    <Select defaultValue="drug-substance">
                      <SelectTrigger>
                        <SelectValue placeholder="Select specification type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="drug-substance">Drug Substance Specification</SelectItem>
                        <SelectItem value="drug-product">Drug Product Specification</SelectItem>
                        <SelectItem value="excipients">Excipient Specification</SelectItem>
                        <SelectItem value="impurities">Impurity Control</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="regions">Target Regions</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="cursor-pointer bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800">
                        FDA (US)
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        EMA (EU)
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        PMDA (Japan)
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        NMPA (China)
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800">
                        Health Canada
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specification">Specification JSON</Label>
                    <Textarea
                      placeholder='{"tests": [{"name": "Assay", "acceptance_criteria": "98.0-102.0%", "method": "HPLC"}]}'
                      className="font-mono h-[120px] text-xs"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  Load Template
                </Button>
                <Button size="sm">
                  Validate Specifications
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CMCModule;