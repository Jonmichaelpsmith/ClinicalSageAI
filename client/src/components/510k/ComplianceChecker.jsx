/**
 * 510(k) Compliance Checker Component
 * 
 * This component provides an automated pre-submission quality check
 * to verify that a 510(k) submission complies with FDA regulations and
 * contains all required information.
 */

import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaExclamationTriangle, 
  FaFilePdf, 
  FaFileExcel, 
  FaMagic, 
  FaSpinner, 
  FaRedo,
  FaDownload,
  FaClipboardCheck
} from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import fda510kService from '../../services/FDA510kService';

// Progress bar component
const ProgressBar = ({ value, max, color }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color}`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

// Status badge component
const StatusBadge = ({ status }) => {
  if (status === 'passed') {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200">
        <FaCheckCircle className="mr-1" />
        Passed
      </Badge>
    );
  } else if (status === 'warning') {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800 border-yellow-200">
        <FaExclamationTriangle className="mr-1" />
        Warning
      </Badge>
    );
  } else if (status === 'failed') {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200">
        <FaExclamationCircle className="mr-1" />
        Failed
      </Badge>
    );
  }
  return null;
};

const ComplianceChecker = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [applyingFix, setApplyingFix] = useState({ status: false, checkId: null });
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Fetch initial compliance results
  useEffect(() => {
    if (projectId) {
      fetchComplianceResults();
    }
  }, [projectId]);

  // Fetch compliance results
  const fetchComplianceResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fda510kService.getComplianceCheckResults(projectId);
      setResults(data);
    } catch (err) {
      console.error('Error fetching compliance results:', err);
      setError('Failed to load compliance check results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Run new compliance check
  const runComplianceCheck = async () => {
    setChecking(true);
    setError(null);
    
    try {
      const data = await fda510kService.runComplianceCheck(projectId);
      setResults(data);
    } catch (err) {
      console.error('Error running compliance check:', err);
      setError('Failed to run compliance check. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  // Apply automatic fix for a compliance issue
  const applyAutoFix = async (sectionId, checkId) => {
    setApplyingFix({ status: true, checkId });
    setError(null);
    
    try {
      await fda510kService.applyAutoFix(projectId, sectionId, checkId);
      // Refresh compliance results after applying fix
      await fetchComplianceResults();
    } catch (err) {
      console.error('Error applying auto-fix:', err);
      setError('Failed to apply automatic fix. Please try again.');
    } finally {
      setApplyingFix({ status: false, checkId: null });
    }
  };

  // Export compliance report
  const exportReport = async (format) => {
    setExporting(true);
    setError(null);
    
    try {
      const result = await fda510kService.exportComplianceReport(projectId, format);
      
      // Create a download link
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.setAttribute('download', result.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export compliance report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Toggle section visibility
  const toggleSection = (sectionId) => {
    if (activeSection === sectionId) {
      setActiveSection(null);
    } else {
      setActiveSection(sectionId);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-primary mr-3 text-2xl" />
            <span className="text-muted-foreground text-lg">Loading compliance check results...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Compliance Data</CardTitle>
          <CardDescription>
            We encountered a problem while fetching compliance check results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive mb-6 p-4 bg-destructive/10 rounded-md">{error}</div>
          <Button
            onClick={() => {
              fetchComplianceResults();
              toast({
                title: "Retrying",
                description: "Attempting to fetch compliance results again",
              });
            }}
            variant="default"
            className="gap-2"
          >
            <FaRedo className="h-4 w-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pre-Submission Compliance Check</h2>
        <div className="flex gap-2">
          <button
            onClick={runComplianceCheck}
            disabled={checking}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50"
          >
            {checking ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Running Check...
              </>
            ) : (
              <>
                <FaRedo className="mr-2" />
                Run Check
              </>
            )}
          </button>
          <div className="relative group">
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center"
            >
              Export Report
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
              <button
                onClick={() => exportReport('pdf')}
                disabled={exporting}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
              >
                <FaFilePdf className="mr-2 text-red-500" />
                Export as PDF
              </button>
              <button
                onClick={() => exportReport('excel')}
                disabled={exporting}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
              >
                <FaFileExcel className="mr-2 text-green-500" />
                Export as Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {results && (
        <>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="bg-white p-3 rounded-md shadow-sm flex-1">
                <div className="text-sm text-gray-500 mb-1">Overall Score</div>
                <div className="text-2xl font-bold text-blue-600">{results.overallScore}/100</div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm flex-1">
                <div className="text-sm text-gray-500 mb-1">Completed Sections</div>
                <div className="text-2xl font-bold text-green-600">{results.completedSections}/{results.totalSections}</div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm flex-1">
                <div className="text-sm text-gray-500 mb-1">Critical Issues</div>
                <div className="text-2xl font-bold text-red-600">{results.criticalIssues}</div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm flex-1">
                <div className="text-sm text-gray-500 mb-1">Warnings</div>
                <div className="text-2xl font-bold text-yellow-600">{results.warnings}</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Overall Progress</div>
              <ProgressBar 
                value={results.completedSections} 
                max={results.totalSections} 
                color="bg-blue-500" 
              />
            </div>
          </div>

          <div className="space-y-4">
            {results.sections.map((section) => (
              <div key={section.id} className="border border-gray-200 rounded-md overflow-hidden">
                <div 
                  className={`flex justify-between items-center p-4 cursor-pointer ${
                    section.status === 'passed' 
                      ? 'bg-green-50' 
                      : section.status === 'warning' 
                        ? 'bg-yellow-50' 
                        : 'bg-red-50'
                  }`}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center">
                    <StatusBadge status={section.status} />
                    <h3 className="ml-3 font-medium text-gray-900">{section.name}</h3>
                  </div>
                  <div className="text-gray-500">
                    {activeSection === section.id ? (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>

                {activeSection === section.id && (
                  <div className="p-4 bg-white">
                    <ul className="space-y-3">
                      {section.checks.map((check) => (
                        <li key={check.id} className="flex flex-col md:flex-row justify-between border-b border-gray-100 pb-3">
                          <div className="flex-1">
                            <div className="flex items-center">
                              {check.status === 'passed' ? (
                                <FaCheckCircle className="text-green-500 mr-2" />
                              ) : check.status === 'warning' ? (
                                <FaExclamationTriangle className="text-yellow-500 mr-2" />
                              ) : (
                                <FaExclamationCircle className="text-red-500 mr-2" />
                              )}
                              <span className="font-medium">{check.description}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 ml-6">{check.message}</p>
                          </div>
                          
                          {check.autoFixAvailable && (
                            <button
                              onClick={() => applyAutoFix(section.id, check.id)}
                              disabled={applyingFix.status}
                              className="mt-2 md:mt-0 ml-6 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-sm flex items-center disabled:opacity-50"
                            >
                              {applyingFix.status && applyingFix.checkId === check.id ? (
                                <>
                                  <FaSpinner className="animate-spin mr-1.5" />
                                  Applying...
                                </>
                              ) : (
                                <>
                                  <FaMagic className="mr-1.5" />
                                  Auto-Fix
                                </>
                              )}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-800 mb-2">About Compliance Checks</h3>
            <p className="text-blue-700 text-sm">
              This automated compliance checker verifies that your 510(k) submission meets FDA requirements. 
              It checks for completeness, consistency, and adherence to FDA guidelines. 
              Address all critical issues before submission to increase chances of acceptance.
            </p>
          </div>
        </>
      )}

      {!results && !loading && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No compliance checks have been run for this project.</p>
          <button
            onClick={runComplianceCheck}
            disabled={checking}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {checking ? 'Running Check...' : 'Run Compliance Check'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplianceChecker;