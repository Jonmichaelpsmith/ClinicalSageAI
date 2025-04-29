// client/src/components/cer/TemplateSettingsPanel.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

export default function TemplateSettingsPanel() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customizationOptions, setCustomizationOptions] = useState({
    includeDevicePerformance: true,
    includeClinicalData: true,
    includePostMarketData: true,
    includeStateOfArt: true,
    useDetailedRiskAnalysis: false,
    useExtendedConclusion: false
  });
  const [activeTab, setActiveTab] = useState('available');

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/cer/templates');
        setTemplates(response.data);
        if (response.data.length > 0) {
          setSelectedTemplate(response.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load templates', err);
        setError('Failed to load templates. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Handle customization option change
  const handleCustomizationChange = (option, value) => {
    setCustomizationOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  // Handle template selection
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
  };

  // Save template settings
  const saveTemplateSettings = async () => {
    try {
      await axios.post('/api/cer/template-settings', {
        templateId: selectedTemplate,
        options: customizationOptions
      });
    } catch (err) {
      console.error('Failed to save template settings', err);
      setError('Failed to save template settings. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Available Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Template</CardTitle>
                  <CardDescription>Choose a base template for your CER</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {templates.map(template => (
                        <div
                          key={template.id}
                          className={`p-4 border rounded-md cursor-pointer transition-colors ${
                            selectedTemplate === template.id
                              ? 'border-primary bg-primary/10'
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => handleTemplateSelect(template.id)}
                        >
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-600">{template.description}</div>
                          <div className="text-xs text-gray-500 mt-1">Last updated: {template.updated_at}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Template Customization */}
              <Card>
                <CardHeader>
                  <CardTitle>Customize Template</CardTitle>
                  <CardDescription>Tailor the template to your needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Optional Sections</Label>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="devicePerformance" 
                          checked={customizationOptions.includeDevicePerformance}
                          onCheckedChange={(checked) => 
                            handleCustomizationChange('includeDevicePerformance', checked)
                          }
                        />
                        <Label htmlFor="devicePerformance">Device Performance Data</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="clinicalData" 
                          checked={customizationOptions.includeClinicalData}
                          onCheckedChange={(checked) => 
                            handleCustomizationChange('includeClinicalData', checked)
                          }
                        />
                        <Label htmlFor="clinicalData">Clinical Data</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="postMarketData" 
                          checked={customizationOptions.includePostMarketData}
                          onCheckedChange={(checked) => 
                            handleCustomizationChange('includePostMarketData', checked)
                          }
                        />
                        <Label htmlFor="postMarketData">Post-Market Surveillance Data</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="stateOfArt" 
                          checked={customizationOptions.includeStateOfArt}
                          onCheckedChange={(checked) => 
                            handleCustomizationChange('includeStateOfArt', checked)
                          }
                        />
                        <Label htmlFor="stateOfArt">State of the Art Review</Label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Analysis Options</Label>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="detailedRisk" 
                          checked={customizationOptions.useDetailedRiskAnalysis}
                          onCheckedChange={(checked) => 
                            handleCustomizationChange('useDetailedRiskAnalysis', checked)
                          }
                        />
                        <Label htmlFor="detailedRisk">Use Detailed Risk Analysis</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="extendedConclusion" 
                          checked={customizationOptions.useExtendedConclusion}
                          onCheckedChange={(checked) => 
                            handleCustomizationChange('useExtendedConclusion', checked)
                          }
                        />
                        <Label htmlFor="extendedConclusion">Use Extended Conclusion</Label>
                      </div>
                    </div>
                    
                    <Button className="w-full" onClick={saveTemplateSettings}>
                      Save Template Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Templates</CardTitle>
              <CardDescription>Create and manage your custom templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Create custom templates by saving modifications to existing ones</p>
                <Button>Create New Template</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}