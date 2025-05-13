import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import deviceProfileSchema from './schemas/deviceProfile.json';

// We'll use a separate validator rather than directly importing ajv
// This gives us more flexibility in how we handle validation
const validateDeviceProfile = (data) => {
  const errors = {};
  
  // Required fields
  if (!data.deviceName || data.deviceName.length < 3) {
    errors.deviceName = 'Device name must be at least 3 characters';
  }
  
  if (!data.deviceClass || !['I', 'II', 'III'].includes(data.deviceClass)) {
    errors.deviceClass = 'Please select a valid device class';
  }
  
  if (!data.intendedUse) {
    errors.intendedUse = 'Intended use is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * DeviceProfileForm Component
 * 
 * This component provides a form for collecting detailed information about a medical device
 * for use in 510(k) submissions and regulatory pathway determination.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial form data (optional)
 * @param {Function} props.onSave - Function called when form is submitted
 * @param {boolean} props.isEditing - Whether the form is in editing mode
 */
const DeviceProfileForm = ({ initialData = {}, onSave, isEditing = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Initialize the form with react-hook-form
  const form = useForm({
    defaultValues: {
      deviceName: initialData.deviceName || '',
      modelNumber: initialData.modelNumber || '',
      manufacturer: initialData.manufacturer || '',
      deviceClass: initialData.deviceClass || 'II',
      intendedUse: initialData.intendedUse || '',
      technologyType: initialData.technologyType || '',
      predicateDevice: initialData.predicateDevice || ''
    }
  });
  
  // Handle form submission
  const handleSubmit = async (data) => {
    // Reset states
    setIsSubmitting(true);
    setServerErrors(null);
    setSubmitSuccess(false);
    
    // Validate client-side
    const validation = validateDeviceProfile(data);
    
    if (!validation.isValid) {
      // Set form errors
      Object.entries(validation.errors).forEach(([field, message]) => {
        form.setError(field, {
          type: 'manual',
          message
        });
      });
      
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Call the API
      if (onSave) {
        const result = await onSave(data);
        
        // Show success
        setSubmitSuccess(true);
        toast({
          title: "Device Profile Saved",
          description: "Your device profile has been successfully saved.",
          variant: "success"
        });
      }
    } catch (error) {
      // Handle server-side errors
      console.error('Error saving device profile:', error);
      
      // Set server errors
      setServerErrors(
        error.response?.data?.errors || 
        { general: 'Failed to save device profile. Please try again.' }
      );
      
      toast({
        title: "Error",
        description: "Failed to save device profile. Please check the form for errors.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Device Profile' : 'New Device Profile'}</CardTitle>
          <CardDescription>
            Enter detailed information about your medical device for 510(k) submission and regulatory pathway determination.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {serverErrors && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {typeof serverErrors === 'object' 
                  ? Object.values(serverErrors).join(', ')
                  : serverErrors}
              </AlertDescription>
            </Alert>
          )}
          
          {submitSuccess && (
            <Alert variant="success" className="mb-6 bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Device profile has been successfully saved.
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              {/* Basic Device Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Device Information</h3>
                
                <FormField
                  control={form.control}
                  name="deviceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., CardioFlow ECG Monitor" {...field} />
                      </FormControl>
                      <FormDescription>
                        The commercial name of your device
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="modelNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., CF-200" {...field} />
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
                          <Input placeholder="e.g., Medical Devices Inc." {...field} />
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
                      <FormLabel>Device Class *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        FDA device classification based on risk level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Device Use and Technology */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Use and Technology</h3>
                
                <FormField
                  control={form.control}
                  name="intendedUse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intended Use *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the indications for use, including the specific conditions or diseases the device is intended to diagnose, treat, prevent, or mitigate."
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
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
                        <Input placeholder="e.g., Electrocardiography" {...field} />
                      </FormControl>
                      <FormDescription>
                        The primary technology used by the device
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
                        <Input placeholder="e.g., CardioSense ECG (K123456)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Similar device with existing 510(k) clearance (if known)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceProfileForm;