import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import axios from 'axios';

export default function TemplateSettingsPanel() {
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [jsonConfig, setJsonConfig] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        // This would be a real API call in production
        // const res = await axios.get('/api/cer/templates');
        // setTemplates(res.data.templates);
        
        // Mock data for demo
        await new Promise(resolve => setTimeout(resolve, 600));
        const mockTemplates = [
          { id: 'eu-mdr-2017-745', name: 'EU MDR 2017/745 Template' },
          { id: 'iso-14155-2020', name: 'ISO 14155:2020 Template' },
          { id: 'fda-510k', name: 'FDA 510(k) Template' },
          { id: 'custom-template-1', name: 'Custom Template 1' }
        ];
        setTemplates(mockTemplates);
        if (mockTemplates.length) {
          setSelectedId(mockTemplates[0].id);
        }
      } catch (err) {
        console.error('Failed to load templates', err);
        setError('Failed to load templates from server');
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    
    const loadConfig = async () => {
      setLoading(true);
      try {
        // This would be a real API call in production
        // const res = await axios.get(`/api/cer/templates/${selectedId}`);
        // setJsonConfig(JSON.stringify(res.data.template, null, 2));
        
        // Mock data for demo
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Different template data based on selected template
        let templateData;
        if (selectedId === 'eu-mdr-2017-745') {
          templateData = {
            name: 'EU MDR 2017/745 Template',
            version: '1.2.0',
            sections: [
              {
                id: 'executive-summary',
                title: 'Executive Summary',
                required: true,
                subsections: [
                  { id: 'device-description', title: 'Device Description', required: true },
                  { id: 'intended-use', title: 'Intended Use', required: true },
                  { id: 'summary-findings', title: 'Summary of Findings', required: true }
                ]
              },
              {
                id: 'clinical-evaluation',
                title: 'Clinical Evaluation',
                required: true,
                subsections: [
                  { id: 'evaluation-methodology', title: 'Evaluation Methodology', required: true },
                  { id: 'literature-review', title: 'Literature Review', required: true },
                  { id: 'clinical-data', title: 'Clinical Data Analysis', required: true }
                ]
              },
              {
                id: 'risk-assessment',
                title: 'Risk Assessment',
                required: true,
                subsections: [
                  { id: 'risk-identification', title: 'Risk Identification', required: true },
                  { id: 'risk-analysis', title: 'Risk Analysis', required: true },
                  { id: 'risk-controls', title: 'Risk Control Measures', required: true }
                ]
              },
              {
                id: 'conclusions',
                title: 'Conclusions',
                required: true,
                subsections: [
                  { id: 'benefit-risk', title: 'Benefit-Risk Analysis', required: true },
                  { id: 'clinical-benefit', title: 'Clinical Benefit', required: true },
                  { id: 'recommendations', title: 'Recommendations', required: false }
                ]
              },
              {
                id: 'post-market',
                title: 'Post-Market Surveillance',
                required: true,
                subsections: [
                  { id: 'surveillance-plan', title: 'Surveillance Plan', required: true },
                  { id: 'feedback-collection', title: 'Feedback Collection Methods', required: true }
                ]
              }
            ]
          };
        } else if (selectedId === 'iso-14155-2020') {
          templateData = {
            name: 'ISO 14155:2020 Template',
            version: '1.0.0',
            sections: [
              {
                id: 'introduction',
                title: 'Introduction',
                required: true,
                subsections: [
                  { id: 'background', title: 'Background', required: true },
                  { id: 'device-description', title: 'Device Description', required: true }
                ]
              },
              // More ISO specific sections would be here
            ]
          };
        } else if (selectedId === 'fda-510k') {
          templateData = {
            name: 'FDA 510(k) Template',
            version: '1.1.0',
            sections: [
              {
                id: 'device-description',
                title: 'Device Description',
                required: true,
                subsections: [
                  { id: 'overview', title: 'Overview', required: true },
                  { id: 'indications', title: 'Indications for Use', required: true }
                ]
              },
              // More FDA specific sections would be here
            ]
          };
        } else {
          templateData = {
            name: 'Custom Template',
            version: '1.0.0',
            sections: [
              {
                id: 'section-1',
                title: 'Custom Section 1',
                required: true,
                subsections: []
              }
            ]
          };
        }
        
        setJsonConfig(JSON.stringify(templateData, null, 2));
      } catch (err) {
        console.error('Failed to load template config', err);
        setError('Failed to load template configuration');
      } finally {
        setLoading(false);
      }
    };
    
    loadConfig();
  }, [selectedId]);

  const saveConfig = async () => {
    if (!selectedId) return;
    
    setSaving(true);
    try {
      // Validate JSON format
      const parsed = JSON.parse(jsonConfig);
      
      // This would be a real API call in production
      // await axios.put(`/api/cer/templates/${selectedId}`, { template: parsed });
      
      // Mock save for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Template saved:', selectedId, parsed);
      alert('Template configuration saved successfully');
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format: ' + err.message);
      } else {
        console.error('Failed to save template config', err);
        setError('Failed to save template configuration');
      }
    } finally {
      setSaving(false);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonConfig);
      setJsonConfig(JSON.stringify(parsed, null, 2));
    } catch (err) {
      setError('Invalid JSON format: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Template Selection</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-select">Select Template</Label>
              <select
                id="template-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                disabled={loading}
              >
                <option value="">Select a template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
              <h3 className="font-semibold mb-2">Error</h3>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedId && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Template Configuration</h3>
              <div className="space-x-2">
                <Button variant="outline" onClick={formatJson} disabled={loading || saving}>
                  Format JSON
                </Button>
                <Button onClick={saveConfig} disabled={loading || saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
            <Textarea
              value={jsonConfig}
              onChange={e => setJsonConfig(e.target.value)}
              rows={20}
              className="font-mono text-sm"
              placeholder="Loading template configuration..."
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-2">
              Edit the JSON configuration above to customize the template structure.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}