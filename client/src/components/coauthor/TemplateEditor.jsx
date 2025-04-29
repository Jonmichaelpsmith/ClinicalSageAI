import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Save, RefreshCw } from 'lucide-react';
import templates from '@/services/templates/ctdTemplates.json';

export default function TemplateEditor({ sectionId, content, onChange, onGenerateDraft }) {
  const tpl = templates[sectionId] || {
    title: "No Template Available",
    description: "There is no template defined for this section.",
    fields: []
  };

  // Initialize the values with existing content data or empty values
  const [values, setValues] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Initialize values from content or template fields
  useEffect(() => {
    try {
      // Try to parse existing content as JSON
      const contentObj = content?.startsWith('{') ? JSON.parse(content) : null;
      
      // If we have parsed content, use it; otherwise initialize empty fields
      const initialValues = contentObj || 
        tpl.fields.reduce((obj, field) => ({ 
          ...obj, 
          [field.name]: field.type === 'checkbox' ? false : '' 
        }), {});
      
      setValues(initialValues);
    } catch (error) {
      // If parsing fails, initialize empty fields
      const initialValues = tpl.fields.reduce((obj, field) => ({ 
        ...obj, 
        [field.name]: field.type === 'checkbox' ? false : '' 
      }), {});
      
      setValues(initialValues);
    }
  }, [sectionId, content, tpl.fields]);

  const handleInputChange = (name, value) => {
    setValues(prev => {
      const updated = { ...prev, [name]: value };
      // Save the entire form values as JSON in the parent component
      onChange(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  const generateDraft = async () => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call the AI service
      // We'll simulate it for now with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the parent's generate function
      onGenerateDraft();
    } finally {
      setIsGenerating(false);
    }
  };

  if (!tpl || tpl.fields.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Template Available</CardTitle>
          <CardDescription>
            There is no template defined for this section. Use the regular editor instead.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>{tpl.title} Template</CardTitle>
        <CardDescription>{tpl.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {tpl.fields.map(field => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  value={values[field.name] || ''}
                  onChange={e => handleInputChange(field.name, e.target.value)}
                  rows={4}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              ) : field.type === 'text' ? (
                <Input
                  id={field.name}
                  value={values[field.name] || ''}
                  onChange={e => handleInputChange(field.name, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.name}
                    checked={Boolean(values[field.name])}
                    onCheckedChange={checked => handleInputChange(field.name, checked)}
                  />
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {field.label}
                  </label>
                </div>
              ) : field.type === 'select' ? (
                <Select
                  value={values[field.name] || ''}
                  onValueChange={value => handleInputChange(field.name, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {field.options.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : null}
            </div>
          ))}
          
          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setValues({})}
              className="gap-1.5"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset Fields</span>
            </Button>
            
            <Button
              type="button"
              onClick={generateDraft}
              disabled={isGenerating}
              className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate From Template</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}