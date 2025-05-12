import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import FDA510kService from '../../services/FDA510kService';
import { isFeatureEnabled } from '../../flags/featureFlags';

// Define the schema for the device profile form
const deviceProfileSchema = z.object({
  // Device Information
  deviceName: z.string().min(2, { message: 'Device name is required' }),
  deviceDescription: z.string().min(10, { message: 'Please provide a detailed device description' }),
  deviceType: z.string().min(1, { message: 'Device type is required' }),
  productCode: z.string().optional(),
  regulationNumber: z.string().optional(),

  // Classification Information
  deviceClass: z.enum(['I', 'II', 'III'], { message: 'Please select a device class' }),
  deviceClassification: z.string().min(1, { message: 'Classification is required' }),
  lifeSustaining: z.boolean().default(false),
  implantable: z.boolean().default(false),
  sterile: z.boolean().default(false),

  // Intended Use
  intendedUse: z.string().min(10, { message: 'Please provide intended use information' }),
  indications: z.string().min(5, { message: 'Indications for use are required' }),
  targetPopulation: z.string().optional(),
  
  // Technological Characteristics
  materials: z.string().optional(),
  operatingPrinciples: z.string().optional(),
  performanceCharacteristics: z.string().optional(),
  
  // Contact Information
  contactName: z.string().min(2, { message: 'Contact name is required' }),
  contactEmail: z.string().email({ message: 'Please enter a valid email address' }),
  contactPhone: z.string().optional(),
  
  // Submission Strategy
  submissionType: z.enum(['Traditional', 'Abbreviated', 'Special', 'Not Sure']),
  previousSubmissions: z.string().optional(),
  previousK510Number: z.string().optional(),
});

/**
 * DeviceProfileForm Component
 * 
 * This component renders a form for collecting and managing device profile information
 * for FDA 510(k) submission preparation.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onComplete - Callback when device profile is completed
 * @param {Object} props.initialValues - Initial form values (if editing)
 * @param {string} props.organizationId - The organization ID
 */
export const DeviceProfileForm = ({ 
  onComplete,
  initialValues = {},
  organizationId = '123'
}) => {
  const { toast } = useToast();
  
  // Initialize the form with the device profile schema
  const form = useForm({
    resolver: zodResolver(deviceProfileSchema),
    defaultValues: {
      deviceName: initialValues.deviceName || '',
      deviceDescription: initialValues.deviceDescription || '',
      deviceType: initialValues.deviceType || '',
      productCode: initialValues.productCode || '',
      regulationNumber: initialValues.regulationNumber || '',
      deviceClass: initialValues.deviceClass || 'II',
      deviceClassification: initialValues.deviceClassification || '',
      lifeSustaining: initialValues.lifeSustaining || false,
      implantable: initialValues.implantable || false,
      sterile: initialValues.sterile || false,
      intendedUse: initialValues.intendedUse || '',
      indications: initialValues.indications || '',
      targetPopulation: initialValues.targetPopulation || '',
      materials: initialValues.materials || '',
      operatingPrinciples: initialValues.operatingPrinciples || '',
      performanceCharacteristics: initialValues.performanceCharacteristics || '',
      contactName: initialValues.contactName || '',
      contactEmail: initialValues.contactEmail || '',
      contactPhone: initialValues.contactPhone || '',
      submissionType: initialValues.submissionType || 'Traditional',
      previousSubmissions: initialValues.previousSubmissions || '',
      previousK510Number: initialValues.previousK510Number || '',
    },
  });
  
  // Define mutation for saving the device profile
  const saveMutation = useMutation({
    mutationFn: (deviceProfile) => {
      return FDA510kService.saveDeviceProfile(organizationId, deviceProfile);
    },
    onSuccess: (data) => {
      toast({
        title: "Profile Saved",
        description: "Your device profile has been saved successfully.",
      });
      
      if (onComplete) {
        onComplete(data);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save profile: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data) => {
    saveMutation.mutate(data);
  };

  // Calculate recommendation based on form data
  const getPathwayRecommendation = async (deviceProfile) => {
    if (!isFeatureEnabled('ENABLE_AI_GENERATION')) {
      toast({
        title: "Feature Disabled",
        description: "AI-powered pathway recommendation is currently disabled.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await FDA510kService.getRecommendedPathway(deviceProfile);
      
      toast({
        title: "Recommendation Generated",
        description: `Recommended 510(k) pathway: ${result.recommendedPathway}`,
      });
    } catch (error) {
      toast({
        title: "Recommendation Failed",
        description: `Failed to generate recommendation: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Device Profile</CardTitle>
        <CardDescription>
          Complete this form to create a device profile for your 510(k) submission.
          This information will be used throughout the 510(k) process.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Device Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Device Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deviceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter device name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="deviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Type *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Surgical Instrument, Implant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="deviceDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a detailed description of your device"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="productCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Code</FormLabel>
                      <FormControl>
                        <Input placeholder="FDA Product Code (if known)" {...field} />
                      </FormControl>
                      <FormDescription>
                        3-letter code assigned by FDA
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="regulationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regulation Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 21 CFR 888.3030" {...field} />
                      </FormControl>
                      <FormDescription>
                        CFR reference for your device
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Classification Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Classification Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deviceClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Class *</FormLabel>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="deviceClassification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classification *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., orthopedic, cardiovascular" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="lifeSustaining"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Life Sustaining</FormLabel>
                        <FormDescription>
                          Is the device life sustaining?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="implantable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Implantable</FormLabel>
                        <FormDescription>
                          Is the device implantable?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sterile"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Sterile</FormLabel>
                        <FormDescription>
                          Is the device provided sterile?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Intended Use Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Intended Use</h3>
              <FormField
                control={form.control}
                name="intendedUse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intended Use *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the purpose of your device"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="indications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indications for Use *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the indications for use of your device"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="targetPopulation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Population</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Adult patients with osteoarthritis" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Technological Characteristics Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Technological Characteristics</h3>
              <FormField
                control={form.control}
                name="materials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materials</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List the key materials used in your device"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="operatingPrinciples"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operating Principles</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe how your device works"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="performanceCharacteristics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Performance Characteristics</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe key performance specifications"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="Email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Submission Strategy Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Submission Strategy</h3>
              <FormField
                control={form.control}
                name="submissionType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Submission Type *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Traditional" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Traditional
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Abbreviated" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Abbreviated
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Special" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Special
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Not Sure" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Not Sure
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="previousSubmissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Submissions</FormLabel>
                    <FormControl>
                      <Input placeholder="List any previous submissions for this device" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="previousK510Number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous K Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., K123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => getPathwayRecommendation(form.getValues())}
                disabled={!isFeatureEnabled('ENABLE_AI_GENERATION') || saveMutation.isPending}
              >
                Get Pathway Recommendation
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Save Device Profile"}
                </Button>
                
                {Object.keys(initialValues).length > 0 && (
                  <Button 
                    type="button" 
                    onClick={() => onComplete && onComplete(form.getValues())}
                    disabled={saveMutation.isPending}
                  >
                    Continue to Next Step
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DeviceProfileForm;