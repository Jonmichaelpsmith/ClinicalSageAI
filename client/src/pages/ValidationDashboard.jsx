import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Book, 
  RefreshCw, 
  Filter,
  Clock,
  Zap,
  List
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

const ValidationDashboard = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [filters, setFilters] = useState({
    showErrors: true,
    showWarnings: true,
    showPassed: true
  });

  // Mock validation results data
  const validationResults = [
    {
      id: 1,
      file: 'clinical-summary.doc',
      status: 'error',
      errors: 3,
      warnings: 1,
      lastChecked: '2025-05-11 10:30 AM',
      issues: [
        { type: 'error', message: 'Invalid margins detected on pages 2-5', rule: 'eCTD.M2.2.1' },
        { type: 'error', message: 'Unsupported font "Calibri" used', rule: 'eCTD.M2.font.1' },
        { type: 'error', message: 'Missing required section: Discussion of Clinical Pharmacology', rule: 'eCTD.M2.7.section' },
        { type: 'warning', message: 'Image resolution below recommended 300dpi', rule: 'eCTD.media.1' }
      ]
    },
    {
      id: 2,
      file: 'module3-quality.doc',
      status: 'warning',
      errors: 0,
      warnings: 2,
      lastChecked: '2025-05-11 11:45 AM',
      issues: [
        { type: 'warning', message: 'Table of contents formatting inconsistent', rule: 'eCTD.M3.TOC.1' },
        { type: 'warning', message: 'References not in recommended format', rule: 'eCTD.reference.format' }
      ]
    },
    {
      id: 3,
      file: 'cover-letter.doc',
      status: 'success',
      errors: 0,
      warnings: 0,
      lastChecked: '2025-05-11 09:15 AM',
      issues: []
    },
    {
      id: 4,
      file: 'nonclinical-overview.doc',
      status: 'warning',
      errors: 0,
      warnings: 1,
      lastChecked: '2025-05-11 10:00 AM',
      issues: [
        { type: 'warning', message: 'Section 4.3 header formatting inconsistent', rule: 'eCTD.M4.header.format' }
      ]
    }
  ];

  // Filter validation results based on current filters
  const filteredResults = validationResults.filter(result => {
    if (result.status === 'error' && !filters.showErrors) return false;
    if (result.status === 'warning' && !filters.showWarnings) return false;
    if (result.status === 'success' && !filters.showPassed) return false;
    return true;
  });

  // Calculate compliance stats
  const totalDocuments = validationResults.length;
  const docsWithErrors = validationResults.filter(doc => doc.status === 'error').length;
  const docsWithWarnings = validationResults.filter(doc => doc.status === 'warning').length;
  const passedDocs = validationResults.filter(doc => doc.status === 'success').length;
  const complianceRate = Math.round((passedDocs / totalDocuments) * 100);

  const toggleFilter = (filter) => {
    setFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const runValidation = () => {
    // This would trigger the validation process in a real implementation
    console.log('Running validation on all documents...');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">eCTD Validation Dashboard</h1>
          <p className="text-gray-600">
            Monitor and resolve regulatory compliance issues across your documents
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0 flex items-center" 
          onClick={runValidation}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Run Validation
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Compliance Rate</p>
                <p className="text-2xl font-bold">{complianceRate}%</p>
              </div>
              <div className={`p-3 rounded-full ${
                complianceRate >= 90 ? 'bg-green-100' : 
                complianceRate >= 70 ? 'bg-amber-100' : 'bg-red-100'
              }`}>
                <CheckCircle className={`h-5 w-5 ${
                  complianceRate >= 90 ? 'text-green-600' : 
                  complianceRate >= 70 ? 'text-amber-600' : 'text-red-600'
                }`} />
              </div>
            </div>
            <Progress 
              value={complianceRate} 
              className="h-2 mt-4"
              color={
                complianceRate >= 90 ? 'bg-green-600' : 
                complianceRate >= 70 ? 'bg-amber-600' : 'bg-red-600'
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Documents with Errors</p>
                <p className="text-2xl font-bold">{docsWithErrors}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {docsWithErrors === 0 ? 'All documents free of critical errors' : `${docsWithErrors} of ${totalDocuments} documents`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Documents with Warnings</p>
                <p className="text-2xl font-bold">{docsWithWarnings}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {docsWithWarnings === 0 ? 'All documents free of warnings' : `${docsWithWarnings} of ${totalDocuments} documents`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Passed Documents</p>
                <p className="text-2xl font-bold">{passedDocs}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {passedDocs === totalDocuments ? 'All documents passed validation' : `${passedDocs} of ${totalDocuments} documents`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Results Tabs */}
      <Tabs defaultValue="current" className="mb-6" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="current">Current Documents</TabsTrigger>
            <TabsTrigger value="history">Validation History</TabsTrigger>
            <TabsTrigger value="rules">eCTD Rules Library</TabsTrigger>
          </TabsList>

          <div className="flex space-x-2">
            <Button 
              variant={filters.showErrors ? "default" : "outline"} 
              size="sm"
              onClick={() => toggleFilter('showErrors')}
              className="flex items-center"
            >
              <XCircle className="h-4 w-4 mr-1" /> Errors
            </Button>
            <Button 
              variant={filters.showWarnings ? "default" : "outline"} 
              size="sm"
              onClick={() => toggleFilter('showWarnings')}
              className="flex items-center"
            >
              <AlertTriangle className="h-4 w-4 mr-1" /> Warnings
            </Button>
            <Button 
              variant={filters.showPassed ? "default" : "outline"} 
              size="sm"
              onClick={() => toggleFilter('showPassed')}
              className="flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Passed
            </Button>
          </div>
        </div>

        <TabsContent value="current">
          <div className="space-y-4">
            {filteredResults.length === 0 ? (
              <Card className="text-center p-6">
                <div className="flex flex-col items-center justify-center p-6">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Documents Found</h3>
                  <p className="text-gray-500 mb-4">No documents match your current filter criteria.</p>
                  <Button onClick={() => setFilters({ showErrors: true, showWarnings: true, showPassed: true })}>
                    Clear Filters
                  </Button>
                </div>
              </Card>
            ) : (
              filteredResults.map(doc => (
                <Card key={doc.id} className="mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{doc.file}</CardTitle>
                          <CardDescription>
                            Last validated: {doc.lastChecked}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge 
                        className={
                          doc.status === 'error' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 
                          doc.status === 'warning' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 
                          'bg-green-100 text-green-800 hover:bg-green-200'
                        }
                      >
                        {doc.status === 'error' ? 'Failed' : 
                         doc.status === 'warning' ? 'Warnings' : 'Passed'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  {doc.issues.length > 0 && (
                    <CardContent>
                      <ul className="space-y-2">
                        {doc.issues.map((issue, idx) => (
                          <li 
                            key={idx} 
                            className={`flex items-start p-3 rounded-md ${
                              issue.type === 'error' ? 'bg-red-50' : 'bg-amber-50'
                            }`}
                          >
                            {issue.type === 'error' ? (
                              <XCircle className="h-5 w-5 mr-2 text-red-600 mt-0.5" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 mr-2 text-amber-600 mt-0.5" />
                            )}
                            <div>
                              <p className="font-medium">{issue.message}</p>
                              <p className="text-sm text-gray-600">Rule ID: {issue.rule}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                  
                  <CardFooter className="pt-2">
                    <div className="flex justify-end w-full space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center"
                        onClick={() => window.location.href = `/coauthor/editor?file=${doc.file}`}
                      >
                        <FileText className="h-4 w-4 mr-1" /> Open Document
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center"
                        onClick={() => console.log(`Running validation on ${doc.file}`)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" /> Validate
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Validation History</CardTitle>
              <CardDescription>
                Track document validation changes over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start border-l-4 border-green-500 pl-4 pb-4">
                  <div className="mr-4 bg-green-100 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Batch Validation Complete</p>
                    <p className="text-sm text-gray-600">May 11, 2025 at 9:30 AM</p>
                    <p className="text-sm mt-1">4 documents processed • 3 passed • 1 with warnings • 0 with errors</p>
                  </div>
                </li>
                
                <li className="flex items-start border-l-4 border-amber-500 pl-4 pb-4">
                  <div className="mr-4 bg-amber-100 p-2 rounded-full">
                    <Zap className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">Document Fixed: clinical-summary.doc</p>
                    <p className="text-sm text-gray-600">May 10, 2025 at 3:45 PM</p>
                    <p className="text-sm mt-1">Fixed 3 errors • 1 warning remaining</p>
                  </div>
                </li>
                
                <li className="flex items-start border-l-4 border-red-500 pl-4">
                  <div className="mr-4 bg-red-100 p-2 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Validation Issues Detected</p>
                    <p className="text-sm text-gray-600">May 10, 2025 at 10:15 AM</p>
                    <p className="text-sm mt-1">clinical-summary.doc - 6 errors, 2 warnings</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>eCTD Rules Library</CardTitle>
              <CardDescription>
                Browse and reference regulatory formatting and content rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center bg-blue-50 p-3 rounded-md mb-4">
                  <Book className="h-5 w-5 text-blue-600 mr-2" />
                  <p>The system validates documents against 128 eCTD-specific formatting and content rules</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="border rounded-md">
                  <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                    <h3 className="font-medium">Module 2 Rules</h3>
                    <Badge variant="outline">32 rules</Badge>
                  </div>
                  <div className="p-3">
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <List className="h-4 w-4 mr-2 text-gray-600" />
                        <span className="font-medium mr-2">eCTD.M2.2.1</span>
                        <span>Page margins must be 1 inch on all sides</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <List className="h-4 w-4 mr-2 text-gray-600" />
                        <span className="font-medium mr-2">eCTD.M2.font.1</span>
                        <span>Only approved fonts: Times New Roman, Arial, Courier</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <List className="h-4 w-4 mr-2 text-gray-600" />
                        <span className="font-medium mr-2">eCTD.M2.7.section</span>
                        <span>Clinical summary must include Discussion of Clinical Pharmacology section</span>
                      </li>
                    </ul>
                    <Button variant="link" className="text-blue-600 pl-0 mt-2">
                      View All Module 2 Rules
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-md">
                  <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                    <h3 className="font-medium">Module 3 Rules</h3>
                    <Badge variant="outline">45 rules</Badge>
                  </div>
                  <div className="p-3">
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <List className="h-4 w-4 mr-2 text-gray-600" />
                        <span className="font-medium mr-2">eCTD.M3.TOC.1</span>
                        <span>Table of contents must follow standard formatting guidelines</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <List className="h-4 w-4 mr-2 text-gray-600" />
                        <span className="font-medium mr-2">eCTD.M3.section.3.2.1</span>
                        <span>Requires complete drug substance nomenclature section</span>
                      </li>
                    </ul>
                    <Button variant="link" className="text-blue-600 pl-0 mt-2">
                      View All Module 3 Rules
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-md">
                  <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                    <h3 className="font-medium">General Formatting Rules</h3>
                    <Badge variant="outline">24 rules</Badge>
                  </div>
                  <div className="p-3">
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <List className="h-4 w-4 mr-2 text-gray-600" />
                        <span className="font-medium mr-2">eCTD.media.1</span>
                        <span>All images must be minimum 300 dpi resolution</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <List className="h-4 w-4 mr-2 text-gray-600" />
                        <span className="font-medium mr-2">eCTD.reference.format</span>
                        <span>References must follow ICH standard format</span>
                      </li>
                    </ul>
                    <Button variant="link" className="text-blue-600 pl-0 mt-2">
                      View All Formatting Rules
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ValidationDashboard;