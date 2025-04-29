import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';

export default function TemplateSettingsPanel() {
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [jsonConfig, setJsonConfig] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/cer/templates');
        setTemplates(res.data.templates);
        if (res.data.templates.length) {
          setSelectedId(res.data.templates[0].id);
        }
      } catch (err) {
        console.error('Failed to load templates', err);
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
        const res = await axios.get(`/api/cer/templates/${selectedId}`);
        setJsonConfig(JSON.stringify(res.data.template, null, 2));
      } catch (err) {
        console.error('Failed to load template config', err);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [selectedId]);

  const saveConfig = async () => {
    setSaving(true);
    try {
      const parsed = JSON.parse(jsonConfig);
      await axios.put(`/api/cer/templates/${selectedId}`, { template: parsed });
      alert('Template saved successfully');
    } catch (err) {
      console.error('Save failed', err);
      alert('Error saving template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading templates...</p>;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <Label htmlFor="templateSelect">Select Template</Label>
          <select
            id="templateSelect"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="mt-1 block w-full border px-3 py-2 rounded"
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Label htmlFor="templateConfig">Template JSON Configuration</Label>
          <Textarea
            id="templateConfig"
            rows={15}
            value={jsonConfig}
            onChange={e => setJsonConfig(e.target.value)}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>
      <Button onClick={saveConfig} disabled={saving}>
        {saving ? 'Saving...' : 'Save Template'}
      </Button>
    </div>
  );
}