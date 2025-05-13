import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  FileCheck, 
  Shield, 
  Search,
  AlertCircle,
  CheckCircle2,
  Filter,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FDA510kService from '../../services/FDA510kService';
import { isFeatureEnabled } from '@/flags/featureFlags';

/**
 * ComplianceCheckerPanel component provides automated 510(k) submission 
 * compliance checking against FDA requirements.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.deviceProfile - The device profile to check
 * @param {number} props.organizationId - The organization ID
 * @param {string} props.projectId - The project ID (optional)
 * @returns {JSX.Element} - Rendered component
 */
const ComplianceCheckerPanel = ({ deviceProfile, organizationId, projectId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [complianceResults, setComplianceResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    if (projectId && isFeatureEnabled('ENABLE_COMPLIANCE_CHECKER')) {
      // If project ID is provided, load compliance data for the project
      handleCheckComplianceByProject();
    }
  }, [projectId]);

  const handleCheckComplianceByProject = async () => {
    if (!projectId) {
      toast({
        title: "No Project Selected",
        description: "Please select a project to check compliance",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const results = await FDA510kService.checkCompliance(projectId);
      setComplianceResults(results);
      toast({
        title: "Compliance Check Complete",
        description: "Project compliance check completed successfully",
      });
    } catch (error) {
      console.error('Error checking compliance by project:', error);
      toast({
        title: "Compliance Check Error",
        description: error.message || "Could not complete project compliance check",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckCompliance = async () => {
    if (!deviceProfile) {
      toast({
        title: "No Device Profile Selected",
        description: "Please select a device profile to check compliance",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const results = await FDA510kService.runComplianceCheck(
        deviceProfile,
        organizationId || 1
      );
      setComplianceResults(results);
      toast({
        title: "Compliance Check Complete",
        description: "Device compliance check completed successfully",
      });
    } catch (error) {
      console.error('Error checking compliance:', error);
      toast({
        title: "Compliance Check Error",
        description: error.message || "Could not complete compliance check",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    const percentage = score * 100;
    if (percentage >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 70) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (percentage >= 50) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Documentation':
        return <FileCheck className="h-4 w-4 text-blue-500" />;
      case 'Technical':
        return <Shield className="h-4 w-4 text-purple-500" />;
      case 'Clinical':
        return <Search className="h-4 w-4 text-emerald-500" />;
      case 'Labeling':
        return <CheckCircle2 className="h-4 w-4 text-amber-500" />;
      case 'Regulatory':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileCheck className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Documentation':
        return 'border-blue-200 bg-blue-50 text-blue-700';
      case 'Technical':
        return 'border-purple-200 bg-purple-50 text-purple-700';
      case 'Clinical':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'Labeling':
        return 'border-amber-200 bg-amber-50 text-amber-700';
      case 'Regulatory':
        return 'border-red-200 bg-red-50 text-red-700';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'border-green-200 bg-green-50 text-green-700';
      case 'warning':
        return 'border-amber-200 bg-amber-50 text-amber-700';
      case 'failed':
        return 'border-red-200 bg-red-50 text-red-700';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  const getFilteredChecks = () => {
    if (!complianceResults?.detailedChecks) return [];
    
    return complianceResults.detailedChecks.filter(check => {
      const statusMatch = filterStatus === 'all' || check.status === filterStatus;
      const categoryMatch = filterCategory === 'all' || check.category === filterCategory;
      return statusMatch && categoryMatch;
    });
  };

  const renderComplianceOverview = () => {
    if (!complianceResults) return null;
    const { score, totalChecks, passedChecks, warnings, errors, criticalIssues } = complianceResults;
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-sm mb-3">Compliance Score</h3>
          <div className="flex items-center justify-between mb-2">
            <Badge className={`${getScoreColor(score)}`}>
              {Math.round(score * 100)}% Compliant
            </Badge>
            <span className="text-sm text-gray-500">
              {passedChecks} of {totalChecks} checks passed
            </span>
          </div>
          <Progress value={score * 100} className="h-2 mb-2" />
          <p className="text-sm text-gray-600 mt-2">
            {
              score >= 0.9 ? "Excellent! Your submission meets most FDA requirements." :
              score >= 0.7 ? "Good progress. Some minor issues need to be addressed." :
              score >= 0.5 ? "Several issues need attention before submission." :
              "Significant compliance issues found. Major revisions needed."
            }
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="py-4 px-4">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-8 w-8 text-red-500" />
                <span className="text-2xl font-bold">{criticalIssues}</span>
              </div>
            </CardContent>
            <CardFooter className="py-3 px-4">
              <p className="text-xs text-gray-500">
                {
                  criticalIssues === 0 ? "No critical issues found." :
                  criticalIssues === 1 ? "1 critical issue requires immediate attention." :
                  `${criticalIssues} critical issues require immediate attention.`
                }
              </p>
            </CardFooter>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="py-4 px-4">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <span className="text-2xl font-bold">{errors}</span>
              </div>
            </CardContent>
            <CardFooter className="py-3 px-4">
              <p className="text-xs text-gray-500">
                {
                  errors === 0 ? "No errors found in your submission." :
                  errors === 1 ? "1 error needs to be fixed." :
                  `${errors} errors need to be fixed.`
                }
              </p>
            </CardFooter>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="py-4 px-4">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-amber-400" />
                <span className="text-2xl font-bold">{warnings}</span>
              </div>
            </CardContent>
            <CardFooter className="py-3 px-4">
              <p className="text-xs text-gray-500">
                {
                  warnings === 0 ? "No warnings identified." :
                  warnings === 1 ? "1 warning should be addressed." :
                  `${warnings} warnings should be addressed.`
                }
              </p>
            </CardFooter>
          </Card>
        </div>
        
        {/* Overall assessment */}
        <Alert className={`${score >= 0.7 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <AlertTitle className={`${score >= 0.7 ? 'text-green-800' : 'text-amber-800'} flex items-center`}>
            {score >= 0.7 ? <CheckCircle className="mr-2 h-4 w-4" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
            FDA 510(k) Submission Assessment
          </AlertTitle>
          <AlertDescription className={`${score >= 0.7 ? 'text-green-700' : 'text-amber-700'}`}>
            {
              score >= 0.9 ? "Your submission is well-prepared and ready for final review before FDA submission. Address any remaining minor issues for completeness." :
              score >= 0.7 ? "Your submission is on track but has some minor issues to address. Review the detailed findings to ensure a complete submission." :
              score >= 0.5 ? "Your submission needs improvement in several areas before it can be considered ready for FDA review. Address all critical issues and errors." :
              "Your submission has significant compliance gaps that must be addressed. A thorough revision is recommended before proceeding."
            }
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  const renderDetailedChecks = () => {
    if (!complianceResults) return null;
    
    const filteredChecks = getFilteredChecks();
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-3 mb-2">
          <h3 className="font-medium text-sm">Detailed Compliance Checks</h3>
          <div className="flex gap-2">
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-gray-500 mr-2" />
              <select 
                className="text-xs border rounded-md px-2 py-1"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="passed">Passed</option>
                <option value="warning">Warnings</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex items-center">
              <select 
                className="text-xs border rounded-md px-2 py-1"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Documentation">Documentation</option>
                <option value="Technical">Technical</option>
                <option value="Clinical">Clinical</option>
                <option value="Labeling">Labeling</option>
                <option value="Regulatory">Regulatory</option>
              </select>
            </div>
          </div>
        </div>
        
        <ScrollArea className="h-[400px] pr-3">
          <div className="space-y-4">
            {filteredChecks.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 rounded-md">
                <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <h4 className="text-sm font-medium text-gray-700">No checks match your filters</h4>
                <p className="text-xs text-gray-500 mt-1">Try adjusting your filter criteria</p>
              </div>
            ) : (
              filteredChecks.map((check, index) => (
                <div 
                  key={check.id || index} 
                  className={`border rounded-md p-4 transition-colors ${
                    check.status === 'passed' ? 'border-green-200 bg-green-50' : 
                    check.status === 'warning' ? 'border-amber-200 bg-amber-50' : 
                    'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3">{getStatusIcon(check.status)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{check.name}</h4>
                        <Badge variant="outline" className={getCategoryColor(check.category)}>
                          <span className="flex items-center gap-1">
                            {getCategoryIcon(check.category)}
                            {check.category}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{check.description}</p>
                      {check.recommendation && (
                        <div className="bg-white bg-opacity-50 rounded p-3 border border-opacity-50">
                          <p className="text-sm font-medium mb-1">Recommendation:</p>
                          <p className="text-sm text-gray-700">{check.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="text-center p-8">
      <div className="mx-auto h-12 w-12 text-gray-400 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <FileCheck className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No Compliance Check Yet</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
        Run a compliance check to identify potential issues with your 510(k) submission. Our AI-powered compliance checker evaluates your device against FDA requirements.
      </p>
      <Button onClick={projectId ? handleCheckComplianceByProject : handleCheckCompliance} disabled={isLoading}>
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Running Compliance Check...
          </>
        ) : "Check 510(k) Compliance"}
      </Button>
    </div>
  );

  const renderComplianceContent = () => {
    if (!complianceResults) return renderEmptyState();

    return (
      <>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">510(k) Compliance Check</h3>
              <p className="text-sm text-gray-500">
                {deviceProfile?.deviceName || `Project ${projectId}`} - {new Date(complianceResults.timestamp).toLocaleString()}
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1" onClick={projectId ? handleCheckComplianceByProject : handleCheckCompliance}>
                    <RefreshCw className="h-4 w-4" />
                    <span>Recheck</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Run a new compliance check</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-1.5">
              <FileCheck className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="detailed" className="flex items-center gap-1.5">
              <Search className="h-4 w-4" />
              <span>Detailed Checks</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-3 border rounded-md p-4">
            <TabsContent value="overview" className="m-0">
              {renderComplianceOverview()}
            </TabsContent>
            
            <TabsContent value="detailed" className="m-0">
              {renderDetailedChecks()}
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </Button>
        </div>
      </>
    );
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>510(k) Compliance Checker</CardTitle>
        <CardDescription>
          Verify your submission against FDA 510(k) requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderComplianceContent()}
      </CardContent>
    </Card>
  );
};

export default ComplianceCheckerPanel;