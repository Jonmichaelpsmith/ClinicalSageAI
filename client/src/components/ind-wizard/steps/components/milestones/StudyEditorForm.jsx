// src/components/ind-wizard/steps/components/milestones/StudyEditorForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// UI Components from shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from '@/components/ui/dialog';

// Define the nonclinical study schema with zod
const nonclinicalStudySchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  studyIdentifier: z.string().min(3, "Identifier required"),
  studyType: z.string().min(3, "Type required (e.g., Toxicology, Pharmacology)"),
  species: z.string().min(3, "Species required"),
  keyFindingsSummary: z.string().optional(),
  documentLink: z.string().url("Must be a valid URL").optional().or(z.string().length(0)),
  // Field for AI validation status
  aiValidationStatus: z.enum(['Pending', 'Reviewed', 'Needs Attention']).default('Pending'),
});

function StudyEditorForm({ study, onSave, onCancel }) {
  // Generate a UUID if one doesn't exist (for new studies)
  if (!study.id) {
    study.id = crypto.randomUUID();
  }

  const form = useForm({
    resolver: zodResolver(nonclinicalStudySchema),
    defaultValues: {
      id: study.id || crypto.randomUUID(),
      studyIdentifier: study.studyIdentifier || '',
      studyType: study.studyType || '',
      species: study.species || '',
      keyFindingsSummary: study.keyFindingsSummary || '',
      documentLink: study.documentLink || '',
      aiValidationStatus: study.aiValidationStatus || 'Pending',
    },
  });

  const onSubmit = (data) => { onSave(data); };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField 
          control={form.control} 
          name="studyIdentifier" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Study Identifier</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <FormField 
          control={form.control} 
          name="studyType" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Study Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Toxicology, PK/PD" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <FormField 
          control={form.control} 
          name="species" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Species</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Rat, Dog, Monkey" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <FormField 
          control={form.control} 
          name="keyFindingsSummary" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Findings Summary</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <FormField 
          control={form.control} 
          name="documentLink" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link to Report/Data</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <FormField 
          control={form.control} 
          name="aiValidationStatus" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Validation Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Reviewed">Reviewed</SelectItem>
                  <SelectItem value="Needs Attention">Needs Attention</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Current AI validation status for this study
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save Study</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default StudyEditorForm;