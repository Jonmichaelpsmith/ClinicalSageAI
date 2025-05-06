import React, { useState, useEffect } from 'react';
import { useNavigate } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  FileText,
  Save,
  User,
  Building,
  Calendar,
  FileCheck,
  AlertTriangle,
  LineChart,
  Download,
  Printer,
  BarChart4
} from 'lucide-react';

import CerBuilderPanel from '../components/cer/CerBuilderPanel';
import ComplianceScorePanel from '../components/cer/ComplianceScorePanel';
import ComplianceRadarChart from '../components/cer/ComplianceRadarChart';

// CERV2Page - Enhanced Clinical Evaluation Report page with enterprise styling
export default function CERV2Page() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [cerTitle, setCerTitle] = useState('Clinical Evaluation Report: CardioStent XR');
  const [cerSections, setCerSections] = useState([]);
  const [complianceScores, setComplianceScores] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState('v1.0');
  
  // Compliance threshold settings
  const complianceThresholds = {
    OVERALL_THRESHOLD: 0.80, // 80% threshold for passing
    FLAG_THRESHOLD: 0.70     // 70% threshold for warnings/flagging
  };
  
  // Sample data for metadata display
  const reportMetadata = {
    device: 'CardioStent XR',
    manufacturer: 'MedDevice Technologies, Inc.',
    productCode: 'MDT-CS-221',
    reportDate: new Date().toISOString().split('T')[0],
    author: 'Dr. Elizabeth Chen',
    reviewers: ['Dr. James Wilson', 'Dr. Sarah Johnson'],
    version: selectedVersion,
    status: 'Draft',
    lastUpdated: new Date().toISOString().split('T')[0],
  };
  
  // Handle compliance scores generation
  const handleComplianceScoresGenerated = (scores) => {
    setComplianceScores(scores);
  };
  
  // List of versions for the dropdown
  const versions = [
    { id: 'v1.0', label: 'Version 1.0 (Current Draft)' },
    { id: 'v0.9', label: 'Version 0.9 (Review)' },
    { id: 'v0.8', label: 'Version 0.8 (Initial Draft)' },
  ];
  
  return (
    <div className="flex flex-col h-full">
      {/* Top navigation - styled like Omnia header with dark blue background */}
      <header className="bg-[#1a237e] text-white p-2 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-blue-800"
            onClick={() => navigate('/dashboard')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <div className="grid grid-cols-4 gap-6">
            <div>
              <div className="text-xs opacity-80">Device Name</div>
              <div className="font-semibold">{reportMetadata.device}</div>
            </div>
            
            <div>
              <div className="text-xs opacity-80">Manufacturer</div>
              <div className="font-semibold">{reportMetadata.manufacturer}</div>
            </div>
            
            <div>
              <div className="text-xs opacity-80">Product Code</div>
              <div className="font-semibold">{reportMetadata.productCode}</div>
            </div>
            
            <div>
              <div className="text-xs opacity-80">Report Status</div>
              <div className="flex items-center">
                <Badge className="bg-teal-500 hover:bg-teal-600">{reportMetadata.status}</Badge>
                <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">{reportMetadata.version}</Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-blue-800">
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          
          <Button variant="ghost" size="sm" className="text-white hover:bg-blue-800">
            <User className="h-4 w-4 mr-1" />
            Share
          </Button>
          
          <div className="border-l border-blue-700 h-8 mx-2"></div>
          
          <span className="text-sm mr-2">Production</span>
          <div className="h-4 w-4 rounded-full bg-green-500"></div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {/* Navigation tabs - styled like Omnia tabs */}
        <div className="border-b bg-gray-50">
          <div className="max-w-screen-2xl mx-auto">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="bg-transparent h-12 w-full justify-start border-b-0 p-0">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-12 px-4"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="builder" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-12 px-4"
                >
                  Report Builder
                </TabsTrigger>
                <TabsTrigger 
                  value="compliance" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-12 px-4"
                >
                  Compliance Assessment
                  {complianceScores && (
                    <Badge 
                      className={`ml-2 ${complianceScores.overallScore >= complianceThresholds.OVERALL_THRESHOLD * 100 ? 'bg-green-100 text-green-800' : 
                                      complianceScores.overallScore >= complianceThresholds.FLAG_THRESHOLD * 100 ? 'bg-amber-100 text-amber-800' : 
                                      'bg-red-100 text-red-800'}`}
                    >
                      {complianceScores.overallScore}%
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="export" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-12 px-4"
                >
                  Export & Publish
                </TabsTrigger>
              </TabsList>
              
              <div className="p-0">
                {/* Overview Tab */}
                <TabsContent value="overview" className="m-0 p-0">
                  <div className="bg-white p-6">
                    <div className="max-w-screen-2xl mx-auto">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h1 className="text-2xl font-bold mb-2">{cerTitle}</h1>
                          <div className="flex items-center text-sm text-gray-500">
                            <div className="flex items-center mr-4">
                              <Calendar className="h-4 w-4 mr-1" />
                              Last updated: {reportMetadata.lastUpdated}
                            </div>
                            <div className="flex items-center mr-4">
                              <User className="h-4 w-4 mr-1" />
                              Author: {reportMetadata.author}
                            </div>
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              {reportMetadata.manufacturer}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <div className="relative">
                            <select 
                              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-w-[160px]"
                              value={selectedVersion}
                              onChange={(e) => setSelectedVersion(e.target.value)}
                            >
                              {versions.map(version => (
                                <option key={version.id} value={version.id}>{version.label}</option>
                              ))}
                            </select>
                          </div>
                          
                          <Button size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            View Full Report
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6">
                        {/* Summary Card */}
                        <div className="col-span-1">
                          <div className="bg-white border rounded-md shadow-sm overflow-hidden">
                            <div className="border-b px-4 py-3 bg-gray-50 font-medium flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-gray-500" />
                              Report Summary
                            </div>
                            <div className="p-4 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-gray-500">Device</div>
                                  <div className="font-medium">{reportMetadata.device}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Product Code</div>
                                  <div className="font-medium">{reportMetadata.productCode}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Version</div>
                                  <div className="font-medium">{reportMetadata.version}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Status</div>
                                  <div className="font-medium">{reportMetadata.status}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Report Date</div>
                                  <div className="font-medium">{reportMetadata.reportDate}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Last Updated</div>
                                  <div className="font-medium">{reportMetadata.lastUpdated}</div>
                                </div>
                              </div>
                              
                              <div className="pt-2">
                                <div className="text-xs text-gray-500 mb-1">Author</div>
                                <div className="flex items-center">
                                  <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium mr-2">
                                    {reportMetadata.author.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <span className="font-medium">{reportMetadata.author}</span>
                                </div>
                              </div>
                              
                              <div className="pt-2">
                                <div className="text-xs text-gray-500 mb-1">Reviewers</div>
                                <div className="flex flex-col space-y-2">
                                  {reportMetadata.reviewers.map((reviewer, index) => (
                                    <div key={index} className="flex items-center">
                                      <div className="h-6 w-6 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center text-xs font-medium mr-2">
                                        {reviewer.split(' ').map(n => n[0]).join('')}
                                      </div>
                                      <span>{reviewer}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white border rounded-md shadow-sm overflow-hidden mt-6">
                            <div className="border-b px-4 py-3 bg-gray-50 font-medium flex items-center">
                              <LineChart className="h-4 w-4 mr-2 text-gray-500" />
                              Compliance Overview
                            </div>
                            <div className="p-4">
                              {complianceScores ? (
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Overall Score</span>
                                    <Badge 
                                      className={`${complianceScores.overallScore >= complianceThresholds.OVERALL_THRESHOLD * 100 ? 'bg-green-100 text-green-800' : 
                                                complianceScores.overallScore >= complianceThresholds.FLAG_THRESHOLD * 100 ? 'bg-amber-100 text-amber-800' : 
                                                'bg-red-100 text-red-800'}`}
                                    >
                                      {complianceScores.overallScore}%
                                    </Badge>
                                  </div>
                                  
                                  <ComplianceRadarChart 
                                    scores={complianceScores}
                                    complianceThresholds={complianceThresholds}
                                    variant="compact"
                                    height={200}
                                    enableLegend={false}
                                  />
                                  
                                  <div className="mt-4">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full"
                                      onClick={() => setActiveTab('compliance')}
                                    >
                                      <FileCheck className="h-4 w-4 mr-1" />
                                      View Full Compliance Report
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <AlertTriangle className="h-10 w-10 mx-auto mb-2 text-amber-500" />
                                  <p className="text-sm mb-4">No compliance assessment has been run yet</p>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setActiveTab('compliance')}
                                  >
                                    Run Compliance Check
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Main Content Area */}
                        <div className="col-span-2">
                          <div className="bg-white border rounded-md shadow-sm">
                            <div className="border-b px-4 py-3 bg-gray-50 font-medium flex items-center justify-between">
                              <div className="flex items-center">
                                <BarChart4 className="h-4 w-4 mr-2 text-gray-500" />
                                Key Statistics
                              </div>
                              <Button variant="ghost" size="sm">
                                Refresh
                              </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-6 p-6">
                              <div className="border rounded-md p-4">
                                <div className="text-xs text-gray-500 mb-1">Sections</div>
                                <div className="text-3xl font-bold">{cerSections.length || 0}</div>
                                <div className="text-sm text-gray-500 mt-1">Total report sections</div>
                              </div>
                              
                              <div className="border rounded-md p-4">
                                <div className="text-xs text-gray-500 mb-1">Compliance</div>
                                <div className="text-3xl font-bold">
                                  {complianceScores ? `${complianceScores.overallScore}%` : 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">Overall score</div>
                              </div>
                              
                              <div className="border rounded-md p-4">
                                <div className="text-xs text-gray-500 mb-1">Critical Gaps</div>
                                <div className="text-3xl font-bold">
                                  {complianceScores && complianceScores.standards ? 
                                    Object.values(complianceScores.standards).reduce(
                                      (count, standard) => count + (standard.criticalGaps?.length || 0), 0
                                    ) : 
                                    'N/A'}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">Issues to address</div>
                              </div>
                            </div>
                            
                            <div className="border-t px-6 py-4">
                              <div className="font-medium mb-3">Progress Tracker</div>
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Report Content</span>
                                    <span>{cerSections.length > 0 ? `${Math.min(100, cerSections.length * 10)}%` : '0%'}</span>
                                  </div>
                                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-600" 
                                      style={{ width: `${cerSections.length > 0 ? Math.min(100, cerSections.length * 10) : 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Compliance Score</span>
                                    <span>{complianceScores ? `${complianceScores.overallScore}%` : '0%'}</span>
                                  </div>
                                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${complianceScores?.overallScore >= 80 ? 'bg-green-500' : 
                                                          complianceScores?.overallScore >= 70 ? 'bg-amber-500' : 
                                                          'bg-red-500'}`}
                                      style={{ width: `${complianceScores ? complianceScores.overallScore : 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Review Status</span>
                                    <span>33%</span>
                                  </div>
                                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-1/3"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6 mt-6">
                            <div className="bg-white border rounded-md shadow-sm overflow-hidden">
                              <div className="border-b px-4 py-3 bg-gray-50 font-medium">
                                Recent Activities
                              </div>
                              <div className="divide-y">
                                <div className="p-3 flex items-start">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-medium mr-3 flex-shrink-0">
                                    EC
                                  </div>
                                  <div>
                                    <p className="text-sm"><span className="font-medium">Dr. Elizabeth Chen</span> added a new section</p>
                                    <p className="text-xs text-gray-500">Today, 10:42 AM</p>
                                  </div>
                                </div>
                                <div className="p-3 flex items-start">
                                  <div className="h-8 w-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-medium mr-3 flex-shrink-0">
                                    JW
                                  </div>
                                  <div>
                                    <p className="text-sm"><span className="font-medium">Dr. James Wilson</span> ran compliance check</p>
                                    <p className="text-xs text-gray-500">Yesterday, 4:15 PM</p>
                                  </div>
                                </div>
                                <div className="p-3 flex items-start">
                                  <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-medium mr-3 flex-shrink-0">
                                    SJ
                                  </div>
                                  <div>
                                    <p className="text-sm"><span className="font-medium">Dr. Sarah Johnson</span> added literature review</p>
                                    <p className="text-xs text-gray-500">Yesterday, 2:30 PM</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white border rounded-md shadow-sm overflow-hidden">
                              <div className="border-b px-4 py-3 bg-gray-50 font-medium">
                                Quick Actions
                              </div>
                              <div className="p-4 space-y-3">
                                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('builder')}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Add New Section
                                </Button>
                                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('compliance')}>
                                  <FileCheck className="h-4 w-4 mr-2" />
                                  Run Compliance Check
                                </Button>
                                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('export')}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export Report
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                  <Printer className="h-4 w-4 mr-2" />
                                  Print Report
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Report Builder Tab */}
                <TabsContent value="builder" className="m-0 p-0">
                  <div className="bg-white p-6">
                    <div className="max-w-screen-2xl mx-auto">
                      <CerBuilderPanel
                        title={cerTitle}
                        sections={cerSections}
                        onTitleChange={setCerTitle}
                        onSectionsChange={setCerSections}
                        onComplianceScoreChange={handleComplianceScoresGenerated}
                        complianceThresholds={complianceThresholds}
                        hideHeader
                      />
                    </div>
                  </div>
                </TabsContent>
                
                {/* Compliance Assessment Tab */}
                <TabsContent value="compliance" className="m-0 p-0">
                  <div className="bg-white p-6">
                    <div className="max-w-screen-2xl mx-auto">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2">
                          <ComplianceScorePanel
                            cerTitle={cerTitle}
                            sections={cerSections}
                            complianceThresholds={complianceThresholds}
                            onScoresGenerated={handleComplianceScoresGenerated}
                          />
                        </div>
                        
                        <div className="col-span-1 space-y-6">
                          {complianceScores && (
                            <ComplianceRadarChart 
                              scores={complianceScores}
                              complianceThresholds={complianceThresholds}
                              title="Multi-dimensional Assessment"
                              description="Compliance visualization across key regulatory frameworks"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Export & Publish Tab */}
                <TabsContent value="export" className="m-0 p-0">
                  <div className="bg-white p-6">
                    <div className="max-w-screen-2xl mx-auto">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h2 className="text-xl font-bold mb-4">Export Options</h2>
                          <div className="space-y-4">
                            <div className="bg-white border rounded-md overflow-hidden">
                              <div className="border-b p-4">
                                <h3 className="font-medium">PDF Export</h3>
                                <p className="text-sm text-gray-500 mt-1">High-quality PDF with regulatory formatting</p>
                              </div>
                              <div className="p-4">
                                <div className="flex justify-between items-center">
                                  <div className="space-y-2">
                                    <div className="flex items-center">
                                      <input type="checkbox" id="include-appendices" className="h-4 w-4 mr-2" />
                                      <label htmlFor="include-appendices" className="text-sm">Include appendices</label>
                                    </div>
                                    <div className="flex items-center">
                                      <input type="checkbox" id="include-attachments" className="h-4 w-4 mr-2" />
                                      <label htmlFor="include-attachments" className="text-sm">Include attachments</label>
                                    </div>
                                    <div className="flex items-center">
                                      <input type="checkbox" id="include-compliance" className="h-4 w-4 mr-2" checked readOnly />
                                      <label htmlFor="include-compliance" className="text-sm">Include compliance summary</label>
                                    </div>
                                  </div>
                                  
                                  <Button>
                                    <Download className="h-4 w-4 mr-1" />
                                    Export PDF
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white border rounded-md overflow-hidden">
                              <div className="border-b p-4">
                                <h3 className="font-medium">Word Document (DOCX)</h3>
                                <p className="text-sm text-gray-500 mt-1">Editable document for further modifications</p>
                              </div>
                              <div className="p-4">
                                <div className="flex justify-between items-center">
                                  <div className="space-y-2">
                                    <div className="flex items-center">
                                      <input type="checkbox" id="include-styles" className="h-4 w-4 mr-2" checked readOnly />
                                      <label htmlFor="include-styles" className="text-sm">Include styles</label>
                                    </div>
                                    <div className="flex items-center">
                                      <input type="checkbox" id="include-toc" className="h-4 w-4 mr-2" checked readOnly />
                                      <label htmlFor="include-toc" className="text-sm">Include table of contents</label>
                                    </div>
                                  </div>
                                  
                                  <Button variant="outline">
                                    <Download className="h-4 w-4 mr-1" />
                                    Export DOCX
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h2 className="text-xl font-bold mb-4">Publish Options</h2>
                          <div className="space-y-4">
                            <div className="bg-white border rounded-md overflow-hidden">
                              <div className="border-b p-4">
                                <h3 className="font-medium">Internal Publication</h3>
                                <p className="text-sm text-gray-500 mt-1">Share this report with your organization</p>
                              </div>
                              <div className="p-4">
                                <div className="mb-4">
                                  <label className="text-sm font-medium block mb-1">Approval Status</label>
                                  <select className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm">
                                    <option>Draft - Internal Review</option>
                                    <option>Pending Approval</option>
                                    <option>Approved</option>
                                  </select>
                                </div>
                                
                                <div className="mb-4">
                                  <label className="text-sm font-medium block mb-1">Document Classification</label>
                                  <select className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm">
                                    <option>Confidential</option>
                                    <option>Internal Use Only</option>
                                    <option>Public</option>
                                  </select>
                                </div>
                                
                                <Button className="w-full">
                                  Publish Internally
                                </Button>
                              </div>
                            </div>
                            
                            <div className="bg-white border rounded-md overflow-hidden">
                              <div className="border-b p-4">
                                <h3 className="font-medium">Regulatory Submission</h3>
                                <p className="text-sm text-gray-500 mt-1">Prepare for submission to regulatory bodies</p>
                              </div>
                              <div className="p-4">
                                <div className="mb-4">
                                  <label className="text-sm font-medium block mb-1">Submission Format</label>
                                  <select className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm">
                                    <option>EU MDR Format</option>
                                    <option>FDA Submission Format</option>
                                    <option>Generic Regulatory Format</option>
                                  </select>
                                </div>
                                
                                <Button variant="outline" className="w-full">
                                  Prepare for Submission
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}