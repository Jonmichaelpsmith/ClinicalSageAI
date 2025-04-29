import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Check, Edit, FileText, Layout, Settings } from 'lucide-react';

export default function TemplateSettingsPanel() {
  const [currentTab, setCurrentTab] = useState('template-selection');
  const [selectedTemplate, setSelectedTemplate] = useState('eu-mdr-default');
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonConfig, setJsonConfig] = useState(JSON.stringify({
    "template": "eu-mdr-default",
    "sections": {
      "deviceIdentification": true,
      "regulatoryBackground": true,
      "clinicalEvaluationProcedure": true,
      "clinicalData": true,
      "equivalenceAssessment": true,
      "riskAnalysis": true,
      "postMarketSurveillance": true,
      "literatureReview": true,
      "clinicalEvaluationConclusions": true
    },
    "styling": {
      "headerLogo": true,
      "footerPagination": true,
      "colorScheme": "blue",
      "fontFamily": "Arial",
      "coverPage": true,
      "tableOfContents": true,
      "executiveSummary": true
    },
    "customization": {
      "companyName": "Concept2Cures MedTech",
      "authorName": "Regulatory Affairs Team",
      "documentNumber": "CER-2025-042",
      "revisionDate": "2025-04-29",
      "revisionNumber": "1.0",
      "confidentialityStatement": "This document contains confidential information and is protected by copyright law. It may not be copied or distributed without prior written consent."
    }
  }, null, 2));

  const [templateSettings, setTemplateSettings] = useState({
    deviceIdentification: true,
    regulatoryBackground: true,
    clinicalEvaluationProcedure: true,
    clinicalData: true,
    equivalenceAssessment: true,
    riskAnalysis: true,
    postMarketSurveillance: true,
    literatureReview: true,
    clinicalEvaluationConclusions: true,
    
    headerLogo: true,
    footerPagination: true,
    colorScheme: 'blue',
    fontFamily: 'Arial',
    coverPage: true,
    tableOfContents: true,
    executiveSummary: true,
    
    companyName: 'Concept2Cures MedTech',
    authorName: 'Regulatory Affairs Team',
    documentNumber: 'CER-2025-042',
    revisionDate: '2025-04-29',
    revisionNumber: '1.0',
    confidentialityStatement: 'This document contains confidential information and is protected by copyright law. It may not be copied or distributed without prior written consent.'
  });

  const handleSettingChange = (key, value) => {
    setTemplateSettings({
      ...templateSettings,
      [key]: value
    });

    // If we're updating a setting in UI mode, also update the JSON
    const parsedJson = JSON.parse(jsonConfig);
    
    // Determine which section the key belongs to
    if (key in parsedJson.sections) {
      parsedJson.sections[key] = value;
    } else if (key in parsedJson.styling) {
      parsedJson.styling[key] = value;
    } else if (key in parsedJson.customization) {
      parsedJson.customization[key] = value;
    }
    
    setJsonConfig(JSON.stringify(parsedJson, null, 2));
  };

  const handleTemplateChange = (value) => {
    setSelectedTemplate(value);

    // In a real app, we would fetch the template config from the server
    const templateConfigs = {
      'eu-mdr-default': {
        name: 'EU MDR Default',
        description: 'Standard template following EU MDR 2017/745 requirements',
        sections: { 
          equivalenceAssessment: true,
          postMarketSurveillance: true
        }
      },
      'fda-510k': {
        name: 'FDA 510(k)',
        description: 'Template for FDA 510(k) submissions',
        sections: { 
          equivalenceAssessment: true,
          postMarketSurveillance: false 
        }
      },
      'iso-14155': { 
        name: 'ISO 14155',
        description: 'Clinical investigation template following ISO 14155 standard',
        sections: {
          equivalenceAssessment: false,
          postMarketSurveillance: true
        }
      },
      'basic': {
        name: 'Basic Template',
        description: 'Simplified template with essential sections only',
        sections: {
          equivalenceAssessment: false,
          postMarketSurveillance: false
        }
      },
      'comprehensive': {
        name: 'Comprehensive',
        description: 'Detailed template with all possible sections',
        sections: {
          equivalenceAssessment: true,
          postMarketSurveillance: true
        }
      }
    };

    // Update template settings based on selected template
    const selectedConfig = templateConfigs[value];
    if (selectedConfig) {
      setTemplateSettings({
        ...templateSettings,
        ...selectedConfig.sections
      });
      
      // Update JSON config
      const parsedJson = JSON.parse(jsonConfig);
      parsedJson.template = value;
      Object.keys(selectedConfig.sections).forEach(key => {
        parsedJson.sections[key] = selectedConfig.sections[key];
      });
      setJsonConfig(JSON.stringify(parsedJson, null, 2));
    }
  };

  const handleJsonChange = (e) => {
    try {
      setJsonConfig(e.target.value);
      const parsed = JSON.parse(e.target.value);
      
      // Update UI settings from JSON
      setTemplateSettings({
        ...templateSettings,
        ...parsed.sections,
        ...parsed.styling,
        ...parsed.customization
      });
    } catch (e) {
      // Invalid JSON, don't update state
      console.error('Invalid JSON', e);
    }
  };

  const saveSettings = () => {
    // In a real app, we would save settings to the server
    console.log('Saving template settings:', templateSettings);
    console.log('JSON config:', jsonConfig);
    alert('Template settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold">Template Settings</h3>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <span className="text-sm">JSON Editor</span>
              <Switch 
                checked={showJsonEditor} 
                onCheckedChange={setShowJsonEditor}
                id="json-mode"
              />
              <Button onClick={saveSettings} className="ml-4">
                <Check className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </div>
          
          {showJsonEditor ? (
            <div>
              <div className="bg-gray-100 p-2 rounded-md mb-4">
                <p className="text-xs text-gray-600 mb-2">
                  Edit the JSON configuration directly. Changes will be synchronized with the UI settings.
                </p>
                <Textarea 
                  className="font-mono text-xs h-[400px]"
                  value={jsonConfig}
                  onChange={handleJsonChange}
                />
              </div>
            </div>
          ) : (
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="template-selection" className="flex items-center">
                  <Layout className="mr-2 h-4 w-4" />
                  Template Selection
                </TabsTrigger>
                <TabsTrigger value="content-sections" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Content Sections
                </TabsTrigger>
                <TabsTrigger value="formatting-options" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Formatting Options
                </TabsTrigger>
                <TabsTrigger value="document-info" className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Document Info
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="template-selection" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      id: 'eu-mdr-default',
                      name: 'EU MDR Default',
                      description: 'Standard template following EU MDR 2017/745 requirements',
                      sections: '9 sections',
                      lastUpdated: 'April 15, 2025'
                    },
                    {
                      id: 'fda-510k',
                      name: 'FDA 510(k)',
                      description: 'Template for FDA 510(k) submissions',
                      sections: '8 sections',
                      lastUpdated: 'March 28, 2025'
                    },
                    {
                      id: 'iso-14155',
                      name: 'ISO 14155',
                      description: 'Clinical investigation template following ISO 14155 standard',
                      sections: '7 sections',
                      lastUpdated: 'April 2, 2025'
                    },
                    {
                      id: 'basic',
                      name: 'Basic Template',
                      description: 'Simplified template with essential sections only',
                      sections: '5 sections',
                      lastUpdated: 'April 10, 2025'
                    },
                    {
                      id: 'comprehensive',
                      name: 'Comprehensive',
                      description: 'Detailed template with all possible sections',
                      sections: '12 sections',
                      lastUpdated: 'April 20, 2025'
                    }
                  ].map(template => (
                    <div 
                      key={template.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTemplate === template.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                      onClick={() => handleTemplateChange(template.id)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{template.name}</h4>
                        {selectedTemplate === template.id && (
                          <div className="bg-blue-500 text-white rounded-full p-1">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>{template.sections}</span>
                        <span>Updated: {template.lastUpdated}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="content-sections" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Select which sections to include in your Clinical Evaluation Report.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'deviceIdentification', label: 'Device Identification & Description' },
                      { id: 'regulatoryBackground', label: 'Regulatory Background' },
                      { id: 'clinicalEvaluationProcedure', label: 'Clinical Evaluation Procedure' },
                      { id: 'clinicalData', label: 'Clinical Data Analysis' },
                      { id: 'equivalenceAssessment', label: 'Equivalence Assessment' },
                      { id: 'riskAnalysis', label: 'Risk Analysis' },
                      { id: 'postMarketSurveillance', label: 'Post-Market Surveillance' },
                      { id: 'literatureReview', label: 'Literature Review' },
                      { id: 'clinicalEvaluationConclusions', label: 'Clinical Evaluation Conclusions' }
                    ].map(section => (
                      <div key={section.id} className="flex items-center justify-between p-3 border rounded-md">
                        <Label htmlFor={section.id} className="cursor-pointer">{section.label}</Label>
                        <Switch 
                          id={section.id}
                          checked={templateSettings[section.id]}
                          onCheckedChange={(value) => handleSettingChange(section.id, value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="formatting-options" className="space-y-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Document Structure</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="coverPage">Cover Page</Label>
                          <Switch 
                            id="coverPage"
                            checked={templateSettings.coverPage}
                            onCheckedChange={(value) => handleSettingChange('coverPage', value)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="tableOfContents">Table of Contents</Label>
                          <Switch 
                            id="tableOfContents"
                            checked={templateSettings.tableOfContents}
                            onCheckedChange={(value) => handleSettingChange('tableOfContents', value)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="executiveSummary">Executive Summary</Label>
                          <Switch 
                            id="executiveSummary"
                            checked={templateSettings.executiveSummary}
                            onCheckedChange={(value) => handleSettingChange('executiveSummary', value)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="headerLogo">Header Logo</Label>
                          <Switch 
                            id="headerLogo"
                            checked={templateSettings.headerLogo}
                            onCheckedChange={(value) => handleSettingChange('headerLogo', value)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="footerPagination">Footer Pagination</Label>
                          <Switch 
                            id="footerPagination"
                            checked={templateSettings.footerPagination}
                            onCheckedChange={(value) => handleSettingChange('footerPagination', value)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Visual Style</h4>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="colorScheme">Color Scheme</Label>
                          <Select 
                            id="colorScheme"
                            value={templateSettings.colorScheme}
                            onValueChange={(value) => handleSettingChange('colorScheme', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select color scheme" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="blue">Blue</SelectItem>
                              <SelectItem value="green">Green</SelectItem>
                              <SelectItem value="purple">Purple</SelectItem>
                              <SelectItem value="gray">Gray</SelectItem>
                              <SelectItem value="monochrome">Monochrome</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fontFamily">Font Family</Label>
                          <Select 
                            id="fontFamily"
                            value={templateSettings.fontFamily}
                            onValueChange={(value) => handleSettingChange('fontFamily', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select font family" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                              <SelectItem value="Calibri">Calibri</SelectItem>
                              <SelectItem value="Helvetica">Helvetica</SelectItem>
                              <SelectItem value="Garamond">Garamond</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="font-medium text-blue-700 mb-2">Preview Updates</h4>
                    <p className="text-sm text-blue-600">
                      Changes to document styling will be reflected in the generated report. You can preview 
                      the document after saving these settings by going to the "Generated Report" tab.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="document-info" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Enter document metadata and customization information.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input 
                          id="companyName"
                          value={templateSettings.companyName}
                          onChange={(e) => handleSettingChange('companyName', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="authorName">Author Name / Department</Label>
                        <Input 
                          id="authorName"
                          value={templateSettings.authorName}
                          onChange={(e) => handleSettingChange('authorName', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="documentNumber">Document Number</Label>
                        <Input 
                          id="documentNumber"
                          value={templateSettings.documentNumber}
                          onChange={(e) => handleSettingChange('documentNumber', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="revisionNumber">Revision Number</Label>
                        <Input 
                          id="revisionNumber"
                          value={templateSettings.revisionNumber}
                          onChange={(e) => handleSettingChange('revisionNumber', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="revisionDate">Revision Date</Label>
                        <Input 
                          id="revisionDate"
                          type="date"
                          value={templateSettings.revisionDate}
                          onChange={(e) => handleSettingChange('revisionDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="confidentialityStatement">Confidentiality Statement</Label>
                    <Textarea 
                      id="confidentialityStatement"
                      rows={3}
                      value={templateSettings.confidentialityStatement}
                      onChange={(e) => handleSettingChange('confidentialityStatement', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}