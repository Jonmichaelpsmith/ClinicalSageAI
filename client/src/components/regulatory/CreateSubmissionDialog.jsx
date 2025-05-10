import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

// Create a schema for form validation
const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Name must be at least 3 characters.',
  }),
  submissionType: z.enum(['IND', 'eCTD', 'NDA', 'BLA', 'ANDA', 'DMF'], {
    required_error: 'Please select a submission type.',
  }),
  fda21CfrPart11Enabled: z.boolean().default(false),
});

/**
 * Create Submission Dialog Component
 * 
 * Dialog for creating a new regulatory submission with form validation.
 */
const CreateSubmissionDialog = ({ 
  open, 
  onOpenChange,
  onSubmit,
  isLoading = false,
  clientWorkspaces = [], 
  selectedClientWorkspaceId = null,
  allowClientWorkspaceSelection = false
}) => {
  // Create a form instance with validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      submissionType: 'IND',
      fda21CfrPart11Enabled: false,
      clientWorkspaceId: selectedClientWorkspaceId
    },
  });

  // Add client workspace selection to schema if needed
  const formSchemaWithClient = allowClientWorkspaceSelection && clientWorkspaces.length > 0
    ? formSchema.extend({
        clientWorkspaceId: z.string({
          required_error: 'Please select a client workspace.',
        }),
      })
    : formSchema;

  // Handle form submission
  const handleSubmit = (data) => {
    // Transform client workspace ID to number
    if (data.clientWorkspaceId) {
      data.clientWorkspaceId = parseInt(data.clientWorkspaceId, 10);
    } else if (selectedClientWorkspaceId) {
      data.clientWorkspaceId = selectedClientWorkspaceId;
    }
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Regulatory Submission</DialogTitle>
          <DialogDescription>
            Create a new regulatory submission project. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Submission Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., IND-12345 for Drug X" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a descriptive name for your submission.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="submissionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Submission Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a submission type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IND">IND (Investigational New Drug)</SelectItem>
                      <SelectItem value="eCTD">eCTD (Electronic Common Technical Document)</SelectItem>
                      <SelectItem value="NDA">NDA (New Drug Application)</SelectItem>
                      <SelectItem value="BLA">BLA (Biologics License Application)</SelectItem>
                      <SelectItem value="ANDA">ANDA (Abbreviated New Drug Application)</SelectItem>
                      <SelectItem value="DMF">DMF (Drug Master File)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the type of regulatory submission.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {allowClientWorkspaceSelection && clientWorkspaces.length > 0 && (
              <FormField
                control={form.control}
                name="clientWorkspaceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Workspace</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client workspace" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clientWorkspaces.map((workspace) => (
                          <SelectItem
                            key={workspace.id}
                            value={workspace.id.toString()}
                          >
                            {workspace.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the client workspace for this submission.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="fda21CfrPart11Enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Enable FDA 21 CFR Part 11 Compliance
                    </FormLabel>
                    <FormDescription>
                      Enforce FDA 21 CFR Part 11 electronic records and signatures compliance for this submission.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Submission'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubmissionDialog;