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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, HelpCircle, Info, CheckCircle } from 'lucide-react';
import deviceProfileSchema from './schemas/deviceProfile.json';
import { useTenant } from '@/contexts/TenantContext';

// Enhanced Zod schema with additional fields for 510(k) submission
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
  }).optional(),
  deviceDescription: z.string().max(2000, {
    message: "Device description must not exceed 2000 characters."
  }).optional(),
  regulatoryHistory: z.string().max(1000, {
    message: "Regulatory history must not exceed 1000 characters."
  }).optional(),
  substantialEquivalence: z.string().max(1000, {
    message: "Substantial equivalence rationale must not exceed 1000 characters."
  }).optional(),
  sterilization: z.boolean().optional().default(false),
  software: z.boolean().optional().default(false),
  contactType: z.enum(["none", "external", "implant", "blood_path"]).optional().default("none"),
  marketHistory: z.string().max(1000, {
    message: "Market history must not exceed 1000 characters."
  }).optional(),
  productCode: z.string().max(50, {
    message: "Product code must not exceed 50 characters."
  }).optional(),
  regulationNumber: z.string().max(50, {
    message: "Regulation number must not exceed 50 characters."
  }).optional(),
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
      predicateDevice: '',
      deviceDescription: '',
      regulatoryHistory: '',
      substantialEquivalence: '',
      sterilization: false,
      software: false,
      contactType: 'none',
      marketHistory: '',
      productCode: '',
      regulationNumber: '',
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

  // Get current device class to provide context-sensitive guidance
  const deviceClass = form.watch('deviceClass');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 overflow-visible">
        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
          <h2 className="text-blue-800 font-medium flex items-center">
            <Info className="h-5 w-5 mr-2" />
            510(k) Device Profile Information
          </h2>
          <p className="text-sm text-blue-700 mt-1">
            This information will be used to create your 510(k) submission documentation and find appropriate predicate devices.
            Fields marked with * are required for basic analysis.
          </p>
        </div>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basic" className="text-sm">Basic Information</TabsTrigger>
            <TabsTrigger value="technical" className="text-sm">Technical Details</TabsTrigger>
            <TabsTrigger value="regulatory" className="text-sm">Regulatory Context</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-6">
            <FormField
              control={form.control}
              name="deviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. CardioMonitor 3000" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs bg-white bg-opacity-90 text-slate-600 rounded px-1 py-0.5">
                    The commercial name of the device
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <FormField
                control={form.control}
                name="modelNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="model">Model Number</FormLabel>
                    <FormControl>
                      <Input id="model" placeholder="e.g. CM3000-X" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs text-slate-600 mt-1 mb-3">
                      Device model or catalog number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="manufacturer">Manufacturer</FormLabel>
                    <FormControl>
                      <Input id="manufacturer" placeholder="e.g. MedTech Industries" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs text-slate-600 mt-1 mb-3">
                      Legal manufacturer of the device
                    </FormDescription>
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
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select device class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border border-gray-200 shadow-md z-50">
                      <SelectItem value="I" className="hover:bg-blue-50">Class I</SelectItem>
                      <SelectItem value="II" className="hover:bg-blue-50">Class II</SelectItem>
                      <SelectItem value="III" className="hover:bg-blue-50">Class III</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs text-slate-600 mt-1 mb-3">
                    FDA regulatory classification of the device
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="h-4"></div>
            
            <FormField
              control={form.control}
              name="intendedUse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intended Use*</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the intended use of the device..." 
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs bg-white bg-opacity-90 text-slate-600 rounded px-1 py-0.5">
                    Statement of the device's intended use or indication for use - critical for 510(k) substantial equivalence
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deviceDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide a detailed description of the device including key components, materials, principles of operation..." 
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs bg-white bg-opacity-90 text-slate-600 rounded px-1 py-0.5">
                    Comprehensive description of device appearance, components, and how it functions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="technical" className="space-y-6">
            <FormField
              control={form.control}
              name="technologyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technology Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Electrocardiogram, Bluetooth, AI" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs bg-white bg-opacity-90 text-slate-600 rounded px-1 py-0.5">
                    Primary technology used in the device (e.g., imaging, monitoring, diagnostic)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sterilization"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Sterilization Required</FormLabel>
                      <FormDescription className="text-xs">
                        Device requires sterilization prior to use
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="software"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Software Component</FormLabel>
                      <FormDescription className="text-xs">
                        Device includes software or firmware
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contactType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Contact Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select contact type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border border-gray-200 shadow-md z-50">
                      <SelectItem value="none" className="hover:bg-blue-50">No patient contact</SelectItem>
                      <SelectItem value="external" className="hover:bg-blue-50">External contact</SelectItem>
                      <SelectItem value="implant" className="hover:bg-blue-50">Implant</SelectItem>
                      <SelectItem value="blood_path" className="hover:bg-blue-50">Blood path</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs bg-white bg-opacity-90 text-slate-600 rounded px-1 py-0.5">
                    How the device contacts the patient (if applicable)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="regulatory" className="space-y-6">
            <FormField
              control={form.control}
              name="predicateDevice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Predicate Device</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. HeartTrack 2.0 (K123456)" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs bg-white bg-opacity-90 text-slate-600 rounded px-1 py-0.5">
                    If known, a legally marketed device to which substantial equivalence will be claimed (including K-number if available)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <FormField
                control={form.control}
                name="productCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="productCode">Product Code</FormLabel>
                    <FormControl>
                      <Input id="productCode" placeholder="e.g. DQA, LLZ" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs bg-white bg-opacity-90 text-slate-600 rounded px-1 py-0.5">
                      FDA product classification code
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
                    <FormLabel htmlFor="regulationNumber">Regulation Number</FormLabel>
                    <FormControl>
                      <Input id="regulationNumber" placeholder="e.g. 21 CFR 870.2300" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs bg-white bg-opacity-90 text-slate-600 rounded px-1 py-0.5">
                      CFR regulation number, if known
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="substantialEquivalence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Substantial Equivalence Rationale</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe why your device is substantially equivalent to the predicate device..." 
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs bg-white bg-opacity-90 text-slate-600 rounded px-1 py-0.5">
                    Brief explanation of how your device is similar to the predicate device (if known)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="marketHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marketing History</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe any previous marketing of this device in the US or internationally..." 
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs bg-white bg-opacity-90 text-slate-600 rounded px-1 py-0.5">
                    History of marketing this device in the US or other countries (if applicable)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
        
        {/* Contextual guidance based on device class */}
        <div className="my-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="guidance">
              <AccordionTrigger className="text-blue-700 hover:text-blue-900">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Guidance for Class {deviceClass} Device Submissions
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-blue-50 p-4 rounded-md space-y-3">
                {deviceClass === 'I' && (
                  <>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-sm">Many Class I devices are exempt from premarket notification (510(k)) requirements.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-sm">Check if your device is exempt by reviewing the FDA product classification database.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-sm">Even exempt devices must comply with general controls including registration, listing, and GMP requirements.</p>
                    </div>
                  </>
                )}
                {deviceClass === 'II' && (
                  <>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-sm">Most Class II devices require premarket notification (510(k)) prior to marketing.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-sm">Performance data and bench testing are typically required to demonstrate substantial equivalence.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-sm">Consider whether your device is eligible for Special 510(k) or Abbreviated 510(k) pathways.</p>
                    </div>
                  </>
                )}
                {deviceClass === 'III' && (
                  <>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-sm">Most Class III devices require PMA approval rather than 510(k) clearance.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-sm">510(k) submission is possible for certain Class III devices with established predicates.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-sm">Clinical data is often required for Class III submissions in addition to bench testing.</p>
                    </div>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <DialogFooter className="pt-4 mt-8 border-t sticky bottom-0 bg-white py-3 z-10">
          <div className="flex justify-end space-x-4 w-full">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Device Profile</Button>
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default DeviceProfileForm;