import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Schema for device profile form validation
const deviceProfileSchema = z.object({
  deviceName: z.string().min(3, {
    message: "Device name must be at least 3 characters.",
  }),
  productCode: z.string().min(2, {
    message: "Product code is required.",
  }),
  deviceClass: z.enum(["I", "II", "III"], {
    required_error: "Device class is required.",
  }),
  regulationNumber: z.string().min(2, {
    message: "Regulation number is required.",
  }),
  indications: z.string().min(10, {
    message: "Indications must be at least 10 characters.",
  }),
  mechanism: z.string().min(10, {
    message: "Mechanism of action must be at least 10 characters.",
  }),
  measurementRange: z.string().optional(),
  accuracy: z.string().optional(),
  materials: z.string().min(5, {
    message: "Materials information is required.",
  }),
});

/**
 * Device Profile Form Component
 * 
 * This component provides a form for users to input device details,
 * including device name, classification, indications for use, and
 * technical specifications.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial data for the form
 * @param {Function} props.onSubmit - Submit handler
 * @param {Boolean} props.readOnly - Whether the form is read-only
 */
export const DeviceProfileForm = ({ initialData = {}, onSubmit, readOnly = false }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Set up form with initial data and validation
  const form = useForm({
    resolver: zodResolver(deviceProfileSchema),
    defaultValues: {
      deviceName: initialData.deviceName || "",
      productCode: initialData.productCode || "",
      deviceClass: initialData.deviceClass || undefined,
      regulationNumber: initialData.regulationNumber || "",
      indications: initialData.indications || "",
      mechanism: initialData.mechanism || "",
      measurementRange: initialData.measurementRange || "",
      accuracy: initialData.accuracy || "",
      materials: initialData.materials || "",
    },
  });

  // Form submission handler
  const handleSubmit = async (values) => {
    if (readOnly) return;
    
    setIsLoading(true);
    
    try {
      if (onSubmit) {
        await onSubmit(values);
      }
      
      toast({
        title: "Profile Updated",
        description: "Your device profile has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save device profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Device name */}
          <FormField
            control={form.control}
            name="deviceName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Device Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., GlucoTrack Continuous Glucose Monitor"
                    {...field}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormDescription>
                  The commercial name of your medical device
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Product Code */}
          <FormField
            control={form.control}
            name="productCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., NBW"
                    {...field}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormDescription>
                  FDA product code classification
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Device Classification */}
          <FormField
            control={form.control}
            name="deviceClass"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Device Class</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={readOnly}
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
                  FDA device classification level
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Regulation Number */}
          <FormField
            control={form.control}
            name="regulationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Regulation Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., 862.1345" 
                    {...field}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormDescription>
                  FDA regulation number for the device
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Indications for Use */}
        <FormField
          control={form.control}
          name="indications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Indications for Use</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the intended patient population and clinical conditions..."
                  className="min-h-[80px]"
                  {...field}
                  disabled={readOnly}
                />
              </FormControl>
              <FormDescription>
                The specific medical conditions and patient populations for which the device is intended
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mechanism of Action */}
        <FormField
          control={form.control}
          name="mechanism"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mechanism of Action</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe how the device works..."
                  className="min-h-[80px]"
                  {...field}
                  disabled={readOnly}
                />
              </FormControl>
              <FormDescription>
                How the device operates to achieve its intended purpose
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Measurement Range */}
          <FormField
            control={form.control}
            name="measurementRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Measurement Range</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., 40-400 mg/dL" 
                    {...field}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormDescription>
                  The operational range of the device, if applicable
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Accuracy */}
          <FormField
            control={form.control}
            name="accuracy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accuracy</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., ±15% over entire range" 
                    {...field}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormDescription>
                  The accuracy specifications of the device, if applicable
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Materials */}
        <FormField
          control={form.control}
          name="materials"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Materials</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List the materials used in the device..."
                  className="min-h-[80px]"
                  {...field}
                  disabled={readOnly}
                />
              </FormControl>
              <FormDescription>
                Key materials used in the device, especially those in contact with patients
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {!readOnly && (
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? "Saving..." : "Save Device Profile"}
          </Button>
        )}
      </form>
    </Form>
  );
};

export default DeviceProfileForm;