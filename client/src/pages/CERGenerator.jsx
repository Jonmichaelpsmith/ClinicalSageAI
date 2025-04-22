import React, { useState } from 'react';
import CERStreamingGenerator from '@/components/cer/CERStreamingGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  History, 
  Settings, 
  BookOpen, 
  Activity, 
  Users,
  Database,
  Eye,
  BarChart3,
  HelpCircle,
  Bookmark
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * CER Generator Page
 * 
 * This page showcases the CER Generator component with its streaming token functionality
 * and provides access to templates, saved reports, and analytics.
 */
const CERGenerator = () => {
  const [activeTab, setActiveTab] = useState('generator');
  const { toast } = useToast();
  
  // Demo product information
  const productInfo = {
    id: 'demo_product_001',
    name: 'CardioMonitor X5',
    manufacturer: 'MediTech Innovations, Inc.',
    class: 'Class II',
    type: 'Monitoring Device'
  };
  
  // Demo saved reports
  const savedReports = [
    {
      id: 'CER-001',
      title: 'CardioMonitor X5 Initial CER',
      date: '2025-02-15',
      sections: 9,
      status: 'completed',
      wordCount: 12450
    },
    {
      id: 'CER-002',
      title: 'CardioMonitor X5 FDA Submission',
      date: '2025-03-01',
      sections: 9,
      status: 'completed',
      wordCount: 15280
    },
    {
      id: 'CER-003',
      title: 'CardioMonitor X5 EU MDR Update',
      date: '2025-03-20',
      sections: 11,
      status: 'completed',
      wordCount: 18760
    }
  ];
  
  // Demo templates
  const templates = [
    {
      id: 'standard',
      name: 'Standard CER Template',
      description: 'General-purpose CER template suitable for most medical devices',
      sections: 9
    },
    {
      id: 'mdr',
      name: 'MDR 2017/745 Compliant',
      description: 'European MDR compliant template with MEDDEV 2.7/1 Rev. 4 alignment',
      sections: 11
    },
    {
      id: 'fda',
      name: 'FDA Submission Format',
      description: 'FDA submission-ready format with 510(k) considerations',
      sections: 10
    },
    {
      id: 'pmda',
      name: 'PMDA (Japan) Format',
      description: 'Japanese regulatory authority compliant template',
      sections: 12
    }
  ];
  
  // Handle report generation completion
  const handleGenerationComplete = (content) => {
    console.log('Generation complete:', Object.keys(content).length, 'sections generated');
    // In a real implementation, this would save the report to the database
  };
  
  // Handle generation errors
  const handleGenerationError = (error) => {
    console.error('Generation error:', error);
  };
  
  // View saved report
  const handleViewReport = (reportId) => {
    console.log('View report:', reportId);
    toast({
      title: 'Report Viewer',
      description: 'Report viewer would load here in a real implementation.',
    });
  };
  
  // Use template
  const handleUseTemplate = (templateId) => {
    setActiveTab('generator');
    // The template would be passed to the generator
    toast({
      title: 'Template Selected',
      description: `Using template: ${templateId}`,
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="h-8 w-8 mr-2 text-primary" />
            Enterprise-Grade CER Generator
          </h1>
          <p className="text-gray-500 mt-1">
            Generate regulatory-compliant clinical evaluation reports with AI-powered streaming text generation
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="generator" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger value="generator" className="py-2">
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Generator</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="py-2">
            <BookOpen className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="py-2">
            <History className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Saved Reports</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="py-2">
            <Activity className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="py-2">
            <Database className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Evidence Library</span>
          </TabsTrigger>
          <TabsTrigger value="help" className="py-2">
            <HelpCircle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Help & Resources</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="generator" className="mt-6">
          <CERStreamingGenerator 
            productInfo={productInfo}
            onGenerated={handleGenerationComplete}
            onError={handleGenerationError}
          />
        </TabsContent>
        
        <TabsContent value="templates" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Templates</h2>
              <Button variant="outline">
                <Bookmark className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">{template.sections}</span> sections
                      </div>
                      
                      <div className="flex">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {}}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleUseTemplate(template.id)}
                        >
                          Use
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="saved" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Saved Reports</h2>
            
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Word Count
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {savedReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.wordCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewReport(report.id)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>CER Analytics</CardTitle>
              <CardDescription>
                View report generation metrics and performance analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-24 w-24 mx-auto mb-6 text-gray-300" />
              <h3 className="text-xl font-semibold mb-4">Analytics Dashboard</h3>
              <p className="mb-6 text-gray-500 max-w-md mx-auto">
                Analytics features provide insights into your CER generation patterns, 
                including section complexity, generation time, and evidence quality metrics.
              </p>
              <Button>Configure Analytics Dashboard</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="library" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Evidence Library</CardTitle>
              <CardDescription>
                Access and manage your evidence database for regulatory documents
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <Database className="h-24 w-24 mx-auto mb-6 text-gray-300" />
              <h3 className="text-xl font-semibold mb-4">Clinical Evidence Repository</h3>
              <p className="mb-6 text-gray-500 max-w-md mx-auto">
                The evidence library stores and manages clinical data, literature references,
                and regulatory precedents that are used to support your CER documents.
              </p>
              <Button>Browse Evidence Library</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="help" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Help & Resources</CardTitle>
              <CardDescription>
                Documentation and support resources for the CER Generator
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <HelpCircle className="h-24 w-24 mx-auto mb-6 text-gray-300" />
              <h3 className="text-xl font-semibold mb-4">Resource Center</h3>
              <p className="mb-6 text-gray-500 max-w-md mx-auto">
                Access tutorials, documentation, and regulatory guidance to help you
                create compliant and effective clinical evaluation reports.
              </p>
              <Button>View Documentation</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CERGenerator;