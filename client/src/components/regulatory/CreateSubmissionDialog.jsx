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
import { Textarea } from '@/components/ui/textarea';
import { Calendar, FileText } from 'lucide-react';

// Schema for the form validation
const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Name must be at least 3 characters.',
  }),
  submissionType: z.string().min(1, {
    message: 'Submission type is required.',
  }),
  description: z.string().optional(),
  sponsor: z.string().min(3, {
    message: 'Sponsor name is required.',
  }),
  applicationNumber: z.string().optional(),
  productName: z.string().optional(),
});

/**
 * Create Submission Dialog Component
 * 
 * Dialog for creating a new regulatory submission.
 */
const CreateSubmissionDialog = ({ 
  open, 
  onOpenChange,
  onCreate,
  isLoading = false
}) => {
  // Create a form instance with validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      submissionType: '',
      description: '',
      sponsor: '',
      applicationNumber: '',
      productName: '',
    },
  });

  // Handle form submission
  const handleSubmit = (data) => {
    onCreate(data);
  };

  return (
    <Dialog open={open} onOpenChange={(newState) => {
      if (!newState) {
        // Reset form when dialog is closed
        form.reset();
      }
      onOpenChange(newState);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Submission</DialogTitle>
          <DialogDescription>
            Create a new regulatory submission project to organize your eCTD or IND documents.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., IND-123456 for Drug ABC" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a descriptive name for this submission.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
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
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IND">IND</SelectItem>
                        <SelectItem value="NDA">NDA</SelectItem>
                        <SelectItem value="BLA">BLA</SelectItem>
                        <SelectItem value="ANDA">ANDA</SelectItem>
                        <SelectItem value="DMF">DMF</SelectItem>
                        <SelectItem value="IDE">IDE</SelectItem>
                        <SelectItem value="510k">510(k)</SelectItem>
                        <SelectItem value="PMA">PMA</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the type of regulatory submission.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sponsor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sponsor</FormLabel>
                    <FormControl>
                      <Input placeholder="Sponsoring company name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Organization sponsoring this submission.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="applicationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123456" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional FDA/regulatory agency number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Product or compound name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Name of the product being submitted.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of this submission"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional details about this submission.
                  </FormDescription>
                  <FormMessage />
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
              <Button 
                type="submit" 
                disabled={isLoading}
              >
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