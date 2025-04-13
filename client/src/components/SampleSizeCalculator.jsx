import React, { useState } from 'react';
import axios from 'axios';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import {
  BarChart4,
  Calculator,
  CalendarDays,
  Check,
  CircleEqual,
  GitCompareArrows,
  Info,
  Loader2,
  PercentIcon,
  Timer,
  TimerOff,
  TrendingUp,
  Eraser,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SampleSizeCalculator = () => {
  const [activeTab, setActiveTab] = useState("continuous");
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const { toast } = useToast();

  const continuousForm = useForm({
    defaultValues: {
      mean1: 10,
      mean2: 12,
      std_dev: 5,
      power: 0.8,
      alpha: 0.05,
      ratio: 1,
      dropout_rate: 0.15,
    }
  });

  const binaryForm = useForm({
    defaultValues: {
      p1: 0.3,
      p2: 0.5,
      power: 0.8,
      alpha: 0.05,
      ratio: 1,
      dropout_rate: 0.15,
    }
  });

  const survivalForm = useForm({
    defaultValues: {
      hr: 0.7,
      event_rate1: 0.4,
      event_rate2: null,
      study_duration: 12,
      follow_up_duration: 12,
      power: 0.8,
      alpha: 0.05,
      ratio: 1,
      dropout_rate: 0.15,
    }
  });

  const nonInferiorityBinaryForm = useForm({
    defaultValues: {
      p0: 0.7,
      non_inferiority_margin: 0.1,
      power: 0.8,
      alpha: 0.05,
      ratio: 1,
      dropout_rate: 0.15,
    }
  });

  const nonInferiorityContinuousForm = useForm({
    defaultValues: {
      std_dev: 5,
      non_inferiority_margin: 2.5,
      power: 0.8,
      alpha: 0.05,
      ratio: 1,
      dropout_rate: 0.15,
    }
  });

  const recommendationForm = useForm({
    defaultValues: {
      design_type: "superiority_continuous",
      indication: "oncology",
      phase: "phase 2",
      parameters: {
        mean1: 10,
        mean2: 12,
        std_dev: 5,
        power: 0.8,
        alpha: 0.05,
        ratio: 1,
        dropout_rate: 0.15,
      }
    }
  });

  const handleContinuousSubmit = async (data) => {
    setCalculating(true);
    try {
      const response = await axios.post('/api/sample-size/continuous', data);
      setResult(response.data);
      toast({
        title: "Calculation complete",
        description: "Sample size calculation for continuous outcomes completed successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Calculation failed",
        description: error.response?.data?.detail || "Failed to calculate sample size. Please check your inputs.",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleBinarySubmit = async (data) => {
    setCalculating(true);
    try {
      const response = await axios.post('/api/sample-size/binary', data);
      setResult(response.data);
      toast({
        title: "Calculation complete",
        description: "Sample size calculation for binary outcomes completed successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Calculation failed",
        description: error.response?.data?.detail || "Failed to calculate sample size. Please check your inputs.",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleSurvivalSubmit = async (data) => {
    setCalculating(true);
    try {
      const response = await axios.post('/api/sample-size/survival', data);
      setResult(response.data);
      toast({
        title: "Calculation complete",
        description: "Sample size calculation for survival outcomes completed successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Calculation failed",
        description: error.response?.data?.detail || "Failed to calculate sample size. Please check your inputs.",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleNonInferiorityBinarySubmit = async (data) => {
    setCalculating(true);
    try {
      const response = await axios.post('/api/sample-size/non-inferiority-binary', data);
      setResult(response.data);
      toast({
        title: "Calculation complete",
        description: "Sample size calculation for non-inferiority binary outcomes completed successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Calculation failed",
        description: error.response?.data?.detail || "Failed to calculate sample size. Please check your inputs.",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleNonInferiorityContinuousSubmit = async (data) => {
    setCalculating(true);
    try {
      const response = await axios.post('/api/sample-size/non-inferiority-continuous', data);
      setResult(response.data);
      toast({
        title: "Calculation complete",
        description: "Sample size calculation for non-inferiority continuous outcomes completed successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Calculation failed",
        description: error.response?.data?.detail || "Failed to calculate sample size. Please check your inputs.",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleRecommendationSubmit = async (data) => {
    setCalculating(true);
    try {
      const response = await axios.post('/api/sample-size/recommend', data);
      setResult(response.data);
      toast({
        title: "Recommendation complete",
        description: "Sample size recommendation completed successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Recommendation failed",
        description: error.response?.data?.detail || "Failed to generate sample size recommendation. Please check your inputs.",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  const resetCalculator = () => {
    setResult(null);
    
    if (activeTab === "continuous") {
      continuousForm.reset();
    } else if (activeTab === "binary") {
      binaryForm.reset();
    } else if (activeTab === "survival") {
      survivalForm.reset();
    } else if (activeTab === "non_inferiority_binary") {
      nonInferiorityBinaryForm.reset();
    } else if (activeTab === "non_inferiority_continuous") {
      nonInferiorityContinuousForm.reset();
    } else if (activeTab === "recommendation") {
      recommendationForm.reset();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sample Size Calculator</h2>
          <p className="text-muted-foreground">
            Determine the appropriate number of participants needed for statistically significant results
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        setResult(null);
      }}>
        <TabsList className="grid grid-cols-6">
          <TabsTrigger value="continuous">
            <Calculator className="h-4 w-4 mr-2" />
            Continuous
          </TabsTrigger>
          <TabsTrigger value="binary">
            <PercentIcon className="h-4 w-4 mr-2" />
            Binary
          </TabsTrigger>
          <TabsTrigger value="survival">
            <Timer className="h-4 w-4 mr-2" />
            Survival
          </TabsTrigger>
          <TabsTrigger value="non_inferiority_binary">
            <GitCompareArrows className="h-4 w-4 mr-2" />
            NI Binary
          </TabsTrigger>
          <TabsTrigger value="non_inferiority_continuous">
            <CircleEqual className="h-4 w-4 mr-2" />
            NI Continuous
          </TabsTrigger>
          <TabsTrigger value="recommendation">
            <BarChart4 className="h-4 w-4 mr-2" />
            Recommendation
          </TabsTrigger>
        </TabsList>

        {/* Continuous Outcomes */}
        <TabsContent value="continuous">
          <Card>
            <CardHeader>
              <CardTitle>Continuous Outcomes</CardTitle>
              <CardDescription>
                Calculate sample size for continuous outcomes (e.g., blood pressure, weight, lab values)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <Form {...continuousForm}>
                  <form onSubmit={continuousForm.handleSubmit(handleContinuousSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={continuousForm.control}
                        name="mean1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Control Group Mean</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Mean value in the control group</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={continuousForm.control}
                        name="mean2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Treatment Group Mean</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Mean value in the treatment group</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={continuousForm.control}
                      name="std_dev"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Standard Deviation</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormDescription>Pooled standard deviation</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={continuousForm.control}
                        name="power"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Power</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0.1" max="0.99" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Typically 0.8 or 0.9</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={continuousForm.control}
                        name="alpha"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alpha (Significance)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.001" min="0.001" max="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Typically 0.05</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={continuousForm.control}
                        name="ratio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allocation Ratio</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" min="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Treatment:Control</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={continuousForm.control}
                      name="dropout_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dropout Rate</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" max="0.99" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormDescription>Expected dropout rate (0 to 0.99)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={resetCalculator}>
                        <Eraser className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                      <Button type="submit" disabled={calculating}>
                        {calculating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Calculating...
                          </>
                        ) : (
                          <>
                            <Calculator className="mr-2 h-4 w-4" />
                            Calculate
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-800">Sample Size Result</h3>
                        <p className="text-sm text-blue-600">Calculation for continuous outcome</p>
                      </div>
                      <div className="text-center">
                        <span className="text-3xl font-bold text-blue-700">{result.total_sample_size}</span>
                        <p className="text-xs text-blue-600">Total participants</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-white rounded p-3 shadow-sm">
                        <div className="text-sm text-gray-500">Group 1 (Control)</div>
                        <div className="text-xl font-bold">{result.group1_size}</div>
                        <div className="text-xs text-gray-400">participants</div>
                      </div>
                      <div className="bg-white rounded p-3 shadow-sm">
                        <div className="text-sm text-gray-500">Group 2 (Treatment)</div>
                        <div className="text-xl font-bold">{result.group2_size}</div>
                        <div className="text-xs text-gray-400">participants</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-sm text-blue-600 mb-1">With dropout adjustment ({(result.dropout_rate * 100).toFixed(0)}%)</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-100 rounded p-2">
                          <div className="text-center">
                            <span className="text-lg font-bold text-blue-800">{result.adjusted_sample_size}</span>
                            <p className="text-xs text-blue-600">Total with dropout</p>
                          </div>
                        </div>
                        <div className="bg-blue-100 rounded p-2">
                          <div className="text-center">
                            <span className="text-lg font-bold text-blue-800">{(result.adjusted_sample_size - result.total_sample_size)}</span>
                            <p className="text-xs text-blue-600">Additional participants</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Study Parameters</h4>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Control Mean:</span>
                          <span className="font-medium">{result.parameters.mean1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Treatment Mean:</span>
                          <span className="font-medium">{result.parameters.mean2}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Standard Deviation:</span>
                          <span className="font-medium">{result.parameters.std_dev}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Effect Size:</span>
                          <span className="font-medium">{result.effect_size.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Statistical Parameters</h4>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Power:</span>
                          <span className="font-medium">{result.parameters.power}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Alpha:</span>
                          <span className="font-medium">{result.parameters.alpha}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Allocation Ratio:</span>
                          <span className="font-medium">{result.parameters.ratio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Dropout Rate:</span>
                          <span className="font-medium">{result.dropout_rate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" onClick={() => setResult(null)}>
                      Recalculate
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Binary Outcomes */}
        <TabsContent value="binary">
          <Card>
            <CardHeader>
              <CardTitle>Binary Outcomes</CardTitle>
              <CardDescription>
                Calculate sample size for binary outcomes (e.g., success/failure, response/no response)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <Form {...binaryForm}>
                  <form onSubmit={binaryForm.handleSubmit(handleBinarySubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={binaryForm.control}
                        name="p1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Control Group Proportion</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" max="1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Expected proportion in control group (0 to 1)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={binaryForm.control}
                        name="p2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Treatment Group Proportion</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" max="1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Expected proportion in treatment group (0 to 1)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={binaryForm.control}
                        name="power"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Power</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0.1" max="0.99" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Typically 0.8 or 0.9</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={binaryForm.control}
                        name="alpha"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alpha (Significance)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.001" min="0.001" max="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Typically 0.05</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={binaryForm.control}
                        name="ratio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allocation Ratio</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" min="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Treatment:Control</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={binaryForm.control}
                      name="dropout_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dropout Rate</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" max="0.99" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormDescription>Expected dropout rate (0 to 0.99)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={resetCalculator}>
                        <Eraser className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                      <Button type="submit" disabled={calculating}>
                        {calculating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Calculating...
                          </>
                        ) : (
                          <>
                            <Calculator className="mr-2 h-4 w-4" />
                            Calculate
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-green-800">Sample Size Result</h3>
                        <p className="text-sm text-green-600">Calculation for binary outcome</p>
                      </div>
                      <div className="text-center">
                        <span className="text-3xl font-bold text-green-700">{result.total_sample_size}</span>
                        <p className="text-xs text-green-600">Total participants</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-white rounded p-3 shadow-sm">
                        <div className="text-sm text-gray-500">Group 1 (Control)</div>
                        <div className="text-xl font-bold">{result.group1_size}</div>
                        <div className="text-xs text-gray-400">participants</div>
                      </div>
                      <div className="bg-white rounded p-3 shadow-sm">
                        <div className="text-sm text-gray-500">Group 2 (Treatment)</div>
                        <div className="text-xl font-bold">{result.group2_size}</div>
                        <div className="text-xs text-gray-400">participants</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-sm text-green-600 mb-1">With dropout adjustment ({(result.dropout_rate * 100).toFixed(0)}%)</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-100 rounded p-2">
                          <div className="text-center">
                            <span className="text-lg font-bold text-green-800">{result.adjusted_sample_size}</span>
                            <p className="text-xs text-green-600">Total with dropout</p>
                          </div>
                        </div>
                        <div className="bg-green-100 rounded p-2">
                          <div className="text-center">
                            <span className="text-lg font-bold text-green-800">{(result.adjusted_sample_size - result.total_sample_size)}</span>
                            <p className="text-xs text-green-600">Additional participants</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Study Parameters</h4>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Control Proportion:</span>
                          <span className="font-medium">{result.parameters.p1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Treatment Proportion:</span>
                          <span className="font-medium">{result.parameters.p2}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Effect Size:</span>
                          <span className="font-medium">{result.effect_size.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Statistical Parameters</h4>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Power:</span>
                          <span className="font-medium">{result.parameters.power}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Alpha:</span>
                          <span className="font-medium">{result.parameters.alpha}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Allocation Ratio:</span>
                          <span className="font-medium">{result.parameters.ratio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Dropout Rate:</span>
                          <span className="font-medium">{result.dropout_rate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" onClick={() => setResult(null)}>
                      Recalculate
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Survival Outcomes */}
        <TabsContent value="survival">
          <Card>
            <CardHeader>
              <CardTitle>Survival/Time-to-Event Outcomes</CardTitle>
              <CardDescription>
                Calculate sample size for survival/time-to-event outcomes (e.g., mortality, disease progression)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <Form {...survivalForm}>
                  <form onSubmit={survivalForm.handleSubmit(handleSurvivalSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={survivalForm.control}
                        name="hr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hazard Ratio</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Hazard ratio (treatment vs control)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={survivalForm.control}
                        name="event_rate1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Control Group Event Rate</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" max="1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Event rate in control group (0 to 1)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={survivalForm.control}
                        name="study_duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Study Duration (months)</FormLabel>
                            <FormControl>
                              <Input type="number" step="1" min="1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Duration of entire study</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={survivalForm.control}
                        name="follow_up_duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Follow-up Duration (months)</FormLabel>
                            <FormControl>
                              <Input type="number" step="1" min="1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Duration of subject follow-up</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={survivalForm.control}
                        name="power"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Power</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0.1" max="0.99" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Typically 0.8 or 0.9</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={survivalForm.control}
                        name="alpha"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alpha (Significance)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.001" min="0.001" max="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Typically 0.05</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={survivalForm.control}
                        name="ratio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allocation Ratio</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" min="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Treatment:Control</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={survivalForm.control}
                      name="dropout_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dropout Rate</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" max="0.99" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormDescription>Expected dropout rate (0 to 0.99)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={resetCalculator}>
                        <Eraser className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                      <Button type="submit" disabled={calculating}>
                        {calculating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Calculating...
                          </>
                        ) : (
                          <>
                            <Calculator className="mr-2 h-4 w-4" />
                            Calculate
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-purple-50 p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-purple-800">Sample Size Result</h3>
                        <p className="text-sm text-purple-600">Calculation for time-to-event outcome</p>
                      </div>
                      <div className="text-center">
                        <span className="text-3xl font-bold text-purple-700">{result.total_sample_size}</span>
                        <p className="text-xs text-purple-600">Total participants</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-white rounded p-3 shadow-sm col-span-1">
                        <div className="text-sm text-gray-500">Group 1 (Control)</div>
                        <div className="text-xl font-bold">{result.group1_size}</div>
                        <div className="text-xs text-gray-400">participants</div>
                      </div>
                      <div className="bg-white rounded p-3 shadow-sm col-span-1">
                        <div className="text-sm text-gray-500">Group 2 (Treatment)</div>
                        <div className="text-xl font-bold">{result.group2_size}</div>
                        <div className="text-xs text-gray-400">participants</div>
                      </div>
                      <div className="bg-white rounded p-3 shadow-sm col-span-1">
                        <div className="text-sm text-gray-500">Events Required</div>
                        <div className="text-xl font-bold">{result.events_required}</div>
                        <div className="text-xs text-gray-400">events</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-sm text-purple-600 mb-1">With dropout adjustment ({(result.dropout_rate * 100).toFixed(0)}%)</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-100 rounded p-2">
                          <div className="text-center">
                            <span className="text-lg font-bold text-purple-800">{result.adjusted_sample_size}</span>
                            <p className="text-xs text-purple-600">Total with dropout</p>
                          </div>
                        </div>
                        <div className="bg-purple-100 rounded p-2">
                          <div className="text-center">
                            <span className="text-lg font-bold text-purple-800">{(result.adjusted_sample_size - result.total_sample_size)}</span>
                            <p className="text-xs text-purple-600">Additional participants</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Study Parameters</h4>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Hazard Ratio:</span>
                          <span className="font-medium">{result.parameters.hr}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Control Event Rate:</span>
                          <span className="font-medium">{result.parameters.event_rate1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Treatment Event Rate:</span>
                          <span className="font-medium">{result.parameters.event_rate2 || 'Derived from HR'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Study Duration:</span>
                          <span className="font-medium">{result.parameters.study_duration} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Follow-up Duration:</span>
                          <span className="font-medium">{result.parameters.follow_up_duration} months</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Statistical Parameters</h4>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Power:</span>
                          <span className="font-medium">{result.parameters.power}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Alpha:</span>
                          <span className="font-medium">{result.parameters.alpha}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Allocation Ratio:</span>
                          <span className="font-medium">{result.parameters.ratio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Dropout Rate:</span>
                          <span className="font-medium">{result.dropout_rate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" onClick={() => setResult(null)}>
                      Recalculate
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Non-Inferiority Binary */}
        <TabsContent value="non_inferiority_binary">
          <Card>
            <CardHeader>
              <CardTitle>Non-Inferiority Binary Outcomes</CardTitle>
              <CardDescription>
                Calculate sample size for non-inferiority trials with binary outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <Form {...nonInferiorityBinaryForm}>
                  <form onSubmit={nonInferiorityBinaryForm.handleSubmit(handleNonInferiorityBinarySubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={nonInferiorityBinaryForm.control}
                        name="p0"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expected Proportion</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" max="1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Expected proportion in both groups (0 to 1)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={nonInferiorityBinaryForm.control}
                        name="non_inferiority_margin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Non-Inferiority Margin</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0.01" max="0.3" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Maximum acceptable difference (delta)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={nonInferiorityBinaryForm.control}
                        name="power"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Power</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0.1" max="0.99" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Typically 0.8 or 0.9</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={nonInferiorityBinaryForm.control}
                        name="alpha"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alpha (Significance)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.001" min="0.001" max="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Typically 0.05</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={nonInferiorityBinaryForm.control}
                        name="ratio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allocation Ratio</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" min="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Treatment:Control</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={nonInferiorityBinaryForm.control}
                      name="dropout_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dropout Rate</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" max="0.99" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormDescription>Expected dropout rate (0 to 0.99)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={resetCalculator}>
                        <Eraser className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                      <Button type="submit" disabled={calculating}>
                        {calculating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Calculating...
                          </>
                        ) : (
                          <>
                            <Calculator className="mr-2 h-4 w-4" />
                            Calculate
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-amber-800">Sample Size Result</h3>
                        <p className="text-sm text-amber-600">Calculation for non-inferiority binary outcome</p>
                      </div>
                      <div className="text-center">
                        <span className="text-3xl font-bold text-amber-700">{result.total_sample_size}</span>
                        <p className="text-xs text-amber-600">Total participants</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-white rounded p-3 shadow-sm">
                        <div className="text-sm text-gray-500">Group 1 (Control)</div>
                        <div className="text-xl font-bold">{result.group1_size}</div>
                        <div className="text-xs text-gray-400">participants</div>
                      </div>
                      <div className="bg-white rounded p-3 shadow-sm">
                        <div className="text-sm text-gray-500">Group 2 (Treatment)</div>
                        <div className="text-xl font-bold">{result.group2_size}</div>
                        <div className="text-xs text-gray-400">participants</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-sm text-amber-600 mb-1">With dropout adjustment ({(result.dropout_rate * 100).toFixed(0)}%)</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-amber-100 rounded p-2">
                          <div className="text-center">
                            <span className="text-lg font-bold text-amber-800">{result.adjusted_sample_size}</span>
                            <p className="text-xs text-amber-600">Total with dropout</p>
                          </div>
                        </div>
                        <div className="bg-amber-100 rounded p-2">
                          <div className="text-center">
                            <span className="text-lg font-bold text-amber-800">{(result.adjusted_sample_size - result.total_sample_size)}</span>
                            <p className="text-xs text-amber-600">Additional participants</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Study Parameters</h4>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Expected Proportion:</span>
                          <span className="font-medium">{result.parameters.p0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Non-Inferiority Margin:</span>
                          <span className="font-medium">{result.parameters.non_inferiority_margin}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Statistical Parameters</h4>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Power:</span>
                          <span className="font-medium">{result.parameters.power}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Alpha:</span>
                          <span className="font-medium">{result.parameters.alpha}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Allocation Ratio:</span>
                          <span className="font-medium">{result.parameters.ratio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Dropout Rate:</span>
                          <span className="font-medium">{result.dropout_rate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" onClick={() => setResult(null)}>
                      Recalculate
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Non-Inferiority Continuous */}
        <TabsContent value="non_inferiority_continuous">
          <Card>
            <CardHeader>
              <CardTitle>Non-Inferiority Continuous Outcomes</CardTitle>
              <CardDescription>
                Calculate sample size for non-inferiority trials with continuous outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <Form {...nonInferiorityContinuousForm}>
                  <form onSubmit={nonInferiorityContinuousForm.handleSubmit(handleNonInferiorityContinuousSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={nonInferiorityContinuousForm.control}
                        name="std_dev"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Standard Deviation</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Expected standard deviation in both groups</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={nonInferiorityContinuousForm.control}
                        name="non_inferiority_margin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Non-Inferiority Margin</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Maximum acceptable difference (delta)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={nonInferiorityContinuousForm.control}
                        name="power"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Power</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0.1" max="0.99" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Typically 0.8 or 0.9</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={nonInferiorityContinuousForm.control}
                        name="alpha"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alpha (Significance)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.001" min="0.001" max="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Typically 0.05</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={nonInferiorityContinuousForm.control}
                        name="ratio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allocation Ratio</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" min="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Treatment:Control</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={nonInferiorityContinuousForm.control}
                      name="dropout_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dropout Rate</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" max="0.99" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormDescription>Expected dropout rate (0 to 0.99)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={resetCalculator}>
                        <Eraser className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                      <Button type="submit" disabled={calculating}>
                        {calculating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Calculating...
                          </>
                        ) : (
                          <>
                            <Calculator className="mr-2 h-4 w-4" />
                            Calculate
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-indigo-50 p-4 border border-indigo-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-800">Sample Size Result</h3>
                        <p className="text-sm text-indigo-600">Calculation for non-inferiority continuous outcome</p>
                      </div>
                      <div className="text-center">
                        <span className="text-3xl font-bold text-indigo-700">{result.total_sample_size}</span>
                        <p className="text-xs text-indigo-600">Total participants</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-white rounded p-3 shadow-sm">
                        <div className="text-sm text-gray-500">Group 1 (Control)</div>
                        <div className="text-xl font-bold">{result.group1_size}</div>
                        <div className="text-xs text-gray-400">participants</div>
                      </div>
                      <div className="bg-white rounded p-3 shadow-sm">
                        <div className="text-sm text-gray-500">Group 2 (Treatment)</div>
                        <div className="text-xl font-bold">{result.group2_size}</div>
                        <div className="text-xs text-gray-400">participants</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-sm text-indigo-600 mb-1">With dropout adjustment ({(result.dropout_rate * 100).toFixed(0)}%)</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-indigo-100 rounded p-2">
                          <div className="text-center">
                            <span className="text-lg font-bold text-indigo-800">{result.adjusted_sample_size}</span>
                            <p className="text-xs text-indigo-600">Total with dropout</p>
                          </div>
                        </div>
                        <div className="bg-indigo-100 rounded p-2">
                          <div className="text-center">
                            <span className="text-lg font-bold text-indigo-800">{(result.adjusted_sample_size - result.total_sample_size)}</span>
                            <p className="text-xs text-indigo-600">Additional participants</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Study Parameters</h4>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Standard Deviation:</span>
                          <span className="font-medium">{result.parameters.std_dev}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Non-Inferiority Margin:</span>
                          <span className="font-medium">{result.parameters.non_inferiority_margin}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Statistical Parameters</h4>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Power:</span>
                          <span className="font-medium">{result.parameters.power}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Alpha:</span>
                          <span className="font-medium">{result.parameters.alpha}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Allocation Ratio:</span>
                          <span className="font-medium">{result.parameters.ratio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Dropout Rate:</span>
                          <span className="font-medium">{result.dropout_rate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" onClick={() => setResult(null)}>
                      Recalculate
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SampleSizeCalculator;