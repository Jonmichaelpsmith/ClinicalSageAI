import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import deviceProfileSchema from './schemas/deviceProfile.json';
import { useTenant } from '@/contexts/TenantContext';

// Create Zod schema from our JSON schema for validation
const deviceProfileZodSchema = z.object({
  deviceName: z.string().min(2, {
    message: "Device name must be at least 2 characters."
  }).max(200, {
    message: "Device name must not exceed 200 characters."
  }),
  modelNumber: z.string().max(100, {
    message: "Model number must not exceed 100 characters."
  }).optional(),
  manufacturer: z.string().max(200, {
    message: "Manufacturer must not exceed 200 characters."
  }).optional(),
  deviceClass: z.enum(["I", "II", "III"], {
    message: "Please select a valid device class."
  }),
  intendedUse: z.string().min(10, {
    message: "Intended use must be at least 10 characters."
  }).max(2000, {
    message: "Intended use must not exceed 2000 characters."
  }),
  technologyType: z.string().max(200, {
    message: "Technology type must not exceed 200 characters."
  }).optional(),
  predicateDevice: z.string().max(200, {
    message: "Predicate device must not exceed 200 characters."
  }).optional()
});

const DeviceProfileForm = ({ initialData, onSubmit, onCancel }) => {
  const { currentOrganization, currentClientWorkspace } = useTenant();
  
  // Configure form with react-hook-form and Zod validation
  const form = useForm({
    resolver: zodResolver(deviceProfileZodSchema),
    defaultValues: initialData || {
      deviceName: '',
      modelNumber: '',
      manufacturer: '',
      deviceClass: 'II',
      intendedUse: '',
      technologyType: '',
      predicateDevice: ''
    }
  });

  const handleSubmit = (data) => {
    // Add tenant context data if available
    if (currentOrganization?.id) {
      data.organizationId = currentOrganization.id;
    }
    
    if (currentClientWorkspace?.id) {
      data.clientWorkspaceId = currentClientWorkspace.id;
    }
    
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="deviceName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Device Name*</FormLabel>
              <FormControl>
                <Input placeholder="e.g. CardioMonitor 3000" {...field} />
              </FormControl>
              <FormDescription>
                The commercial name of the device
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="modelNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. CM3000-X" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="manufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manufacturer</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. MedTech Industries" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="deviceClass"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Device Class*</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select device class" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="I">Class I</SelectItem>
                  <SelectItem value="II">Class II</SelectItem>
                  <SelectItem value="III">Class III</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                FDA regulatory classification of the device
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="intendedUse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intended Use*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the intended use of the device..." 
                  className="min-h-20"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Statement of the device's intended use or indication for use
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="technologyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technology Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Electrocardiogram, Bluetooth, AI" {...field} />
              </FormControl>
              <FormDescription>
                Primary technology used in the device
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="predicateDevice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Predicate Device</FormLabel>
              <FormControl>
                <Input placeholder="e.g. HeartTrack 2.0 (K123456)" {...field} />
              </FormControl>
              <FormDescription>
                If known, a legally marketed device to which substantial equivalence will be claimed
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="mr-2">
            Cancel
          </Button>
          <Button type="submit">Save Device Profile</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default DeviceProfileForm;