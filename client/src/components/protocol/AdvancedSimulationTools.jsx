import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tooltip } from "@/components/ui/tooltip";

import { 
  Calculator, LineChart, Brain, Users, AlertTriangle, FileText, Clipboard, 
  Database, BrainCircuit, BarChart3, CheckCircle2, Server, Clock, FileCheck, 
  Settings2, X, Download, Share2, PenTool, Zap, Layers, Lock, ArrowRight, 
  ArrowUpRight, Microscope, Scroll, FileSpreadsheet, Table, ChevronDown, 
  Star, Filter, Sliders, FlaskConical, Beaker, Biohazard, GraduationCap, 
  GitBranch, Sparkles, WavyLine, Lightbulb, Layout, ArrowUpDown, Workflow 
} from 'lucide-react';

import { AreaChart, Area, XAxis, YAxis, LineChart as RechartsLineChart, Line, ScatterChart, Scatter, 
  ZAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, 
  Legend, Bar, BarChart, ReferenceArea, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar } from 'recharts';

/**
 * Advanced Simulation Analysis Component for TrialSage Study Architect
 * This component provides sophisticated multidimensional analysis tools for clinical trial design optimization
 */
const AdvancedSimulationTools = ({ 
  results, 
  parameters, 
  simulationSettings, 
  runAdvancedSimulation, 
  vectorData,
  isLoading 
}) => {
  const [activeTab, setActiveTab] = useState('multidimensional');
  const [selectedDimension, setSelectedDimension] = useState('effect_size');
  const [interimAnalysisPoints, setInterimAnalysisPoints] = useState([30, 60, 90]);
  const [adaptiveParameters, setAdaptiveParameters] = useState({
    enabled: true,
    triggerPower: 0.3,
    maxIncrease: 50,
    alphaSpending: 'obrien_fleming',
    futilityBoundary: 0.2
  });
  
  // Generate sample multi-dimensional data (would be replaced by actual simulation results)
  const generateMultidimensionalData = () => {
    const dimensions = ['effect_size', 'variability', 'dropout', 'alpha'];
    const values = {
      effect_size: [0.2, 0.3, 0.4, 0.5, 0.6],
      variability: [0.8, 0.9, 1.0, 1.1, 1.2],
      dropout: [0.1, 0.15, 0.2, 0.25, 0.3],
      alpha: [0.01, 0.025, 0.05, 0.075, 0.1]
    };
    
    const data = [];
    
    // Generate all combinations for the selected dimension
    values[selectedDimension].forEach(dimValue => {
      const sampleSizes = [180, 200, 220, 240, 260, 280, 300];
      
      sampleSizes.forEach(sampleSize => {
        // Calculate power based on dimension and sample size
        // This is a simplified model that would be replaced by actual simulation results
        let power;
        if (selectedDimension === 'effect_size') {
          power = Math.min(0.99, 0.5 + (dimValue * 0.6) + (sampleSize/1000));
        } else if (selectedDimension === 'variability') {
          power = Math.min(0.99, 0.9 - (dimValue * 0.2) + (sampleSize/800));
        } else if (selectedDimension === 'dropout') {
          power = Math.min(0.99, 0.9 - (dimValue * 0.6) + (sampleSize/900));
        } else {
          power = Math.min(0.99, 0.7 + (sampleSize/1200));
        }
        
        // Add some randomness to simulate Monte Carlo variation
        power = Math.max(0.1, Math.min(0.99, power + (Math.random() * 0.1 - 0.05)));
        
        data.push({
          sampleSize,
          power,
          dimension: dimValue,
          cost: sampleSize * 2500,
          duration: 8 + Math.round(sampleSize / 100)
        });
      });
    });
    
    return data;
  };
  
  // Generate interim analysis data
  const generateInterimData = () => {
    const data = [];
    for (let i = 10; i <= 100; i += 5) {
      const percentComplete = i;
      const isInterim = interimAnalysisPoints.includes(i);
      
      // Simulated cumulative effect size and confidence intervals
      const effect = parameters.effectSize * (0.7 + (0.6 * (i/100)));
      const ciWidth = 1.0 - (i/150);
      
      data.push({
        percentComplete,
        effect,
        lowerCI: Math.max(0, effect - ciWidth/2),
        upperCI: effect + ciWidth/2,
        isInterim
      });
    }
    return data;
  };
  
  // Generate adaptive design simulation data
  const generateAdaptiveData = () => {
    const data = {
      traditional: [],
      adaptive: []
    };
    
    // Traditional fixed design
    for (let i = 0; i < 100; i++) {
      const sampleSize = results?.recommendedN || 250;
      const success = Math.random() < (results?.simulationResults?.probabilityOfSuccess || 0.8);
      
      data.traditional.push({
        trial: i,
        sampleSize,
        success,
        cost: sampleSize * 2500,
        duration: 24
      });
    }
    
    // Adaptive design
    for (let i = 0; i < 100; i++) {
      let baseSampleSize = Math.round((results?.recommendedN || 250) * 0.7);
      const initialSuccess = Math.random() < 0.4; // Lower initial power
      
      if (!initialSuccess && adaptiveParameters.enabled) {
        // Sample size increase if interim analysis indicates low power
        baseSampleSize = Math.round(baseSampleSize * (1 + Math.random() * adaptiveParameters.maxIncrease/100));
        const adaptiveSuccess = Math.random() < 0.75; // Higher chance after adaptation
        
        data.adaptive.push({
          trial: i,
          sampleSize: baseSampleSize,
          success: adaptiveSuccess,
          adapted: true,
          cost: baseSampleSize * 2500,
          duration: 18 + Math.round(baseSampleSize / 40)
        });
      } else {
        data.adaptive.push({
          trial: i,
          sampleSize: baseSampleSize,
          success: initialSuccess,
          adapted: false,
          cost: baseSampleSize * 2500,
          duration: 18
        });
      }
    }
    
    return data;
  };
  
  // Calculate the overall success rates and averages
  const calculateAdaptiveStatistics = (data) => {
    const traditional = {
      successRate: data.traditional.filter(d => d.success).length / data.traditional.length,
      avgSampleSize: data.traditional.reduce((sum, d) => sum + d.sampleSize, 0) / data.traditional.length,
      avgCost: data.traditional.reduce((sum, d) => sum + d.cost, 0) / data.traditional.length,
      avgDuration: data.traditional.reduce((sum, d) => sum + d.duration, 0) / data.traditional.length
    };
    
    const adaptive = {
      successRate: data.adaptive.filter(d => d.success).length / data.adaptive.length,
      avgSampleSize: data.adaptive.reduce((sum, d) => sum + d.sampleSize, 0) / data.adaptive.length,
      avgCost: data.adaptive.reduce((sum, d) => sum + d.cost, 0) / data.adaptive.length,
      avgDuration: data.adaptive.reduce((sum, d) => sum + d.duration, 0) / data.adaptive.length,
      adaptationRate: data.adaptive.filter(d => d.adapted).length / data.adaptive.length
    };
    
    return { traditional, adaptive };
  };
  
  // Generate the data
  const multidimensionalData = generateMultidimensionalData();
  const interimData = generateInterimData();
  const adaptiveData = generateAdaptiveData();
  const adaptiveStats = calculateAdaptiveStatistics(adaptiveData);
  
  // Dimension display information
  const dimensionInfo = {
    effect_size: {
      label: 'Effect Size',
      description: 'Impact of varying treatment effect magnitudes on required sample size',
      unit: '',
      icon: <LineChart className="h-4 w-4" />
    },
    variability: {
      label: 'Variability (SD)',
      description: 'Impact of outcome variability on statistical power',
      unit: '',
      icon: <WavyLine className="h-4 w-4" />
    },
    dropout: {
      label: 'Dropout Rate',
      description: 'Required sample size adjustment based on expected dropout rates',
      unit: '%',
      icon: <Users className="h-4 w-4" />
    },
    alpha: {
      label: 'Significance Level (α)',
      description: 'Effect of varying alpha levels on power and sample size',
      unit: '',
      icon: <AlertTriangle className="h-4 w-4" />
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-blue-600" />
          Advanced Trial Design Optimization
        </h2>
        <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
          Enterprise Feature
        </Badge>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-500 text-white p-2 rounded-md">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-blue-800">Multi-dimensional Analysis</h3>
            <p className="text-sm text-blue-700 mt-1">
              Advanced simulation tools allow simultaneous exploration of multiple design parameters to identify optimal trial configurations. 
              Evaluate trade-offs between power, sample size, cost, and duration to maximize trial efficiency.
            </p>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="multidimensional" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-900">
            <LineChart className="h-4 w-4 mr-2" />
            Multi-dimensional
          </TabsTrigger>
          <TabsTrigger value="interim" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-900">
            <GitBranch className="h-4 w-4 mr-2" />
            Interim Analysis
          </TabsTrigger>
          <TabsTrigger value="adaptive" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-900">
            <Workflow className="h-4 w-4 mr-2" />
            Adaptive Design
          </TabsTrigger>
        </TabsList>
        
        {/* Multi-dimensional Analysis Tab */}
        <TabsContent value="multidimensional" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-blue-600" />
                  Parameter Sensitivity Analysis
                </CardTitle>
                <CardDescription>
                  Exploring the impact of varying {dimensionInfo[selectedDimension].label.toLowerCase()} on sample size requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="sampleSize" 
                        label={{ value: 'Sample Size', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis
                        label={{ value: 'Power', angle: -90, position: 'insideLeft' }}
                        domain={[0, 1]}
                        tickFormatter={(value) => `${Math.round(value * 100)}%`}
                      />
                      <RechartsTooltip 
                        formatter={(value, name, props) => [`${(value * 100).toFixed(1)}%`, 'Power']}
                        labelFormatter={(value) => `Sample Size: ${value}`}
                      />
                      <ReferenceLine y={0.8} stroke="#ff9800" strokeDasharray="3 3" />
                      <Legend />
                      
                      {/* Group the data by dimension value and create a line for each */}
                      {multidimensionalData
                        .reduce((acc, item) => {
                          const key = item.dimension;
                          if (!acc[key]) acc[key] = [];
                          acc[key].push(item);
                          return acc;
                        }, {})
                        .toSorted((a, b) => a[0]?.dimension - b[0]?.dimension)
                        .map((points, index) => {
                          const colorScale = [
                            '#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE',
                            '#155E75', '#0891B2', '#06B6D4', '#22D3EE', '#A5F3FC'
                          ];
                          return (
                            <Line 
                              key={points[0]?.dimension || index}
                              type="monotone"
                              dataKey="power"
                              data={points}
                              name={`${dimensionInfo[selectedDimension].label} = ${points[0]?.dimension}`}
                              stroke={colorScale[index % colorScale.length]}
                              activeDot={{ r: 6 }}
                              strokeWidth={2}
                            />
                          );
                        })
                      }
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t py-3">
                <div className="flex flex-col w-full">
                  <div className="text-sm text-gray-500 mb-2">Select parameter to analyze:</div>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.keys(dimensionInfo).map(key => (
                      <Button 
                        key={key}
                        variant={selectedDimension === key ? "default" : "outline"}
                        size="sm"
                        className={`flex items-center gap-2 ${selectedDimension === key ? 'bg-blue-600' : ''}`}
                        onClick={() => setSelectedDimension(key)}
                      >
                        {dimensionInfo[key].icon}
                        <span className="text-xs">{dimensionInfo[key].label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-sm flex items-center gap-2">
                  {dimensionInfo[selectedDimension].icon}
                  {dimensionInfo[selectedDimension].label} Analysis
                </CardTitle>
                <CardDescription className="text-xs">
                  {dimensionInfo[selectedDimension].description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 text-sm space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-1">
                    <Microscope className="h-4 w-4" /> Analysis Details
                  </h4>
                  <p className="text-xs text-blue-700">
                    This analysis evaluates how different {dimensionInfo[selectedDimension].label.toLowerCase()} values impact required sample size and power. Each line represents a fixed {dimensionInfo[selectedDimension].label.toLowerCase()} value, demonstrating the power curve across sample sizes.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Key Findings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      {selectedDimension === 'effect_size' ? (
                        <p className="text-xs">Smaller effect sizes (0.2-0.3) require substantially larger sample sizes to achieve 80% power</p>
                      ) : selectedDimension === 'variability' ? (
                        <p className="text-xs">Each 0.1 increase in standard deviation requires approximately 10-15% more participants</p>
                      ) : selectedDimension === 'dropout' ? (
                        <p className="text-xs">Dropout rates above 20% significantly impact power, requiring sample size increases of 25%+</p>
                      ) : (
                        <p className="text-xs">More stringent alpha levels (0.01) require ~40% larger sample sizes compared to standard (0.05)</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      <p className="text-xs">
                        80% power threshold (orange line) shows minimum sample size needed for each parameter value
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      <p className="text-xs">
                        Sample sizes beyond 300 participants yield diminishing returns for power gains
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Recommended Action</h4>
                  <div className="p-2 border border-green-200 bg-green-50 rounded-md">
                    <p className="text-xs text-green-800">
                      {selectedDimension === 'effect_size' 
                        ? 'For your primary endpoint, consider using the most sensitive measurement to maximize detectable effect size and minimize required sample size.'
                        : selectedDimension === 'variability'
                        ? 'Consider more stringent inclusion criteria or stratified randomization to reduce variability and increase efficiency.'
                        : selectedDimension === 'dropout'
                        ? 'Implement enhanced retention strategies to minimize dropout rates and maintain statistical power.'
                        : 'Unless required by regulatory guidance, standard alpha of 0.05 offers optimal balance of type I error control and sample size.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Interim Analysis Tab */}
        <TabsContent value="interim" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-green-600" />
                  Group Sequential Design
                </CardTitle>
                <CardDescription>
                  Interim analysis with stopping boundaries for efficacy and futility
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={interimData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="percentComplete" 
                        label={{ value: 'Percent of Planned Sample Size', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis 
                        label={{ value: 'Effect Size', angle: -90, position: 'insideLeft' }} 
                      />
                      <RechartsTooltip />
                      <ReferenceLine y={0} stroke="#000" />
                      
                      {/* Upper efficacy boundary */}
                      <ReferenceLine 
                        y={parameters.effectSize * 1.5} 
                        stroke="#22c55e" 
                        strokeDasharray="3 3"
                        label={{ 
                          value: 'Efficacy Boundary', 
                          position: 'right', 
                          fill: '#22c55e',
                          fontSize: 12
                        }} 
                      />
                      
                      {/* Lower futility boundary */}
                      <ReferenceLine 
                        y={parameters.effectSize * 0.2} 
                        stroke="#ef4444" 
                        strokeDasharray="3 3" 
                        label={{ 
                          value: 'Futility Boundary', 
                          position: 'right', 
                          fill: '#ef4444',
                          fontSize: 12
                        }}
                      />
                      
                      {/* Effect size trend line */}
                      <Line
                        type="monotone"
                        dataKey="effect"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={false}
                      />
                      
                      {/* Confidence interval */}
                      <Area
                        type="monotone"
                        dataKey="upperCI"
                        stroke="none"
                        fill="#93c5fd"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="lowerCI"
                        stroke="none"
                        fill="#93c5fd"
                        fillOpacity={0}
                      />
                      
                      {/* Interim analysis points */}
                      {interimData
                        .filter(d => d.isInterim)
                        .map((point, index) => (
                          <ReferenceLine
                            key={index}
                            x={point.percentComplete}
                            stroke="#6366f1"
                            strokeWidth={2}
                            label={{
                              value: `Interim ${index + 1}`,
                              position: 'top',
                              fill: '#6366f1',
                              fontSize: 12
                            }}
                          />
                        ))
                      }
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t py-3">
                <div className="flex flex-col w-full">
                  <div className="text-sm text-gray-500 mb-2">Interim analysis points (% of planned enrollment):</div>
                  <div className="grid grid-cols-3 gap-2">
                    {interimAnalysisPoints.map((point, index) => (
                      <div key={index} className="flex items-center">
                        <Input 
                          type="number" 
                          min="10" 
                          max="90" 
                          value={point}
                          onChange={(e) => {
                            const newPoints = [...interimAnalysisPoints];
                            newPoints[index] = parseInt(e.target.value, 10);
                            setInterimAnalysisPoints(newPoints);
                          }}
                          className="h-8 w-20"
                        />
                        <span className="ml-1 text-sm">%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-green-600" />
                  Interim Analysis Configuration
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure group sequential design parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 text-sm space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="alphaSpending" className="text-xs text-gray-600">Alpha Spending Function</Label>
                    <Select defaultValue="obrien_fleming">
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Alpha Spending Function" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="obrien_fleming">O'Brien-Fleming</SelectItem>
                        <SelectItem value="pocock">Pocock</SelectItem>
                        <SelectItem value="haybittle_peto">Haybittle-Peto</SelectItem>
                        <SelectItem value="lan_demets">Lan-DeMets</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      O'Brien-Fleming is conservative early, preserving alpha for final analysis
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="efficacyBoundary" className="text-xs text-gray-600">Efficacy Boundary</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        defaultValue={[1.5]}
                        max={3}
                        step={0.1}
                        min={0.5}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-12 text-center">
                        {(parameters.effectSize * 1.5).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="futilityBoundary" className="text-xs text-gray-600">Futility Boundary</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        defaultValue={[0.2]}
                        max={0.5}
                        step={0.05}
                        min={0}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-12 text-center">
                        {(parameters.effectSize * 0.2).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bindingBoundaries" className="text-xs text-gray-600">Binding Boundaries</Label>
                      <Switch id="bindingBoundaries" checked />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Require stopping for futility if boundary is crossed
                    </p>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-4">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Projected Outcomes
                  </h4>
                  <ul className="space-y-2 text-xs text-green-700">
                    <li className="flex justify-between">
                      <span>Probability of early stopping:</span>
                      <span className="font-medium">42%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Expected sample size reduction:</span>
                      <span className="font-medium">22%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Type I error maintained at:</span>
                      <span className="font-medium">{parameters.alpha}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Statistical power:</span>
                      <span className="font-medium">82%</span>
                    </li>
                  </ul>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full mt-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Group Sequential Design
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Adaptive Design Tab */}
        <TabsContent value="adaptive" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2 bg-gradient-to-r from-orange-50 to-orange-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-orange-600" />
                  Adaptive vs. Traditional Design
                </CardTitle>
                <CardDescription>
                  Comparative efficiency of sample size re-estimation
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <h4 className="text-sm font-medium text-blue-800 flex items-center gap-2 mb-2">
                      <Server className="h-4 w-4" />
                      Traditional Fixed Design
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Success Rate</div>
                        <div className="font-medium">{(adaptiveStats.traditional.successRate * 100).toFixed(0)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Avg Sample Size</div>
                        <div className="font-medium">{Math.round(adaptiveStats.traditional.avgSampleSize)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Avg Cost</div>
                        <div className="font-medium">${Math.round(adaptiveStats.traditional.avgCost/1000)}k</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Avg Duration</div>
                        <div className="font-medium">{Math.round(adaptiveStats.traditional.avgDuration)} months</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                    <h4 className="text-sm font-medium text-orange-800 flex items-center gap-2 mb-2">
                      <Workflow className="h-4 w-4" />
                      Adaptive Design
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Success Rate</div>
                        <div className="font-medium">{(adaptiveStats.adaptive.successRate * 100).toFixed(0)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Avg Sample Size</div>
                        <div className="font-medium">{Math.round(adaptiveStats.adaptive.avgSampleSize)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Avg Cost</div>
                        <div className="font-medium">${Math.round(adaptiveStats.adaptive.avgCost/1000)}k</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Adaptation Rate</div>
                        <div className="font-medium">{(adaptiveStats.adaptive.adaptationRate * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid />
                      <XAxis 
                        type="number" 
                        dataKey="sampleSize" 
                        name="Sample Size" 
                        label={{ value: 'Sample Size', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="cost" 
                        name="Cost" 
                        unit="k" 
                        label={{ value: 'Cost ($k)', angle: -90, position: 'insideLeft' }}
                      />
                      <ZAxis 
                        type="number" 
                        dataKey="duration" 
                        range={[60, 400]} 
                        name="Duration" 
                        unit=" mo"
                      />
                      <RechartsTooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name, props) => {
                          if (name === 'Cost') return [`$${value/1000}k`, name];
                          if (name === 'Duration') return [`${value} months`, name];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Scatter 
                        name="Traditional Design" 
                        data={adaptiveData.traditional} 
                        fill="#3b82f6" 
                        shape="circle"
                      />
                      <Scatter 
                        name="Adaptive Design" 
                        data={adaptiveData.adaptive} 
                        fill="#f97316" 
                        shape="triangle"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t py-3">
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-800">
                      Enabling sample size re-estimation 
                      <Badge className="ml-2 bg-green-100 text-green-700 font-normal">
                        +{Math.round((adaptiveStats.adaptive.successRate - adaptiveStats.traditional.successRate) * 100)}% success rate
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                      <Badge className="mr-2 bg-blue-100 text-blue-700 font-normal">
                        {Math.round((1 - adaptiveStats.adaptive.avgSampleSize / adaptiveStats.traditional.avgSampleSize) * 100)}% avg. sample reduction
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 bg-gradient-to-r from-orange-50 to-orange-100">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-orange-600" />
                  Adaptive Design Parameters
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure adaptive design settings
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 text-sm space-y-4">
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="adaptiveEnabled" className="text-xs text-gray-600">Enable Sample Size Re-estimation</Label>
                    <Switch 
                      id="adaptiveEnabled" 
                      checked={adaptiveParameters.enabled}
                      onCheckedChange={(checked) => {
                        setAdaptiveParameters({...adaptiveParameters, enabled: checked});
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="triggerPower" className="text-xs text-gray-600">Re-estimation Trigger (Interim Power)</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[adaptiveParameters.triggerPower]}
                      max={0.7}
                      step={0.05}
                      min={0.1}
                      className="flex-1"
                      onValueChange={([value]) => {
                        setAdaptiveParameters({...adaptiveParameters, triggerPower: value});
                      }}
                    />
                    <span className="text-sm font-medium w-16 text-center">
                      {(adaptiveParameters.triggerPower * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Re-estimate sample size if interim power falls below this threshold
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="maxIncrease" className="text-xs text-gray-600">Maximum Sample Size Increase</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[adaptiveParameters.maxIncrease]}
                      max={100}
                      step={5}
                      min={10}
                      className="flex-1"
                      onValueChange={([value]) => {
                        setAdaptiveParameters({...adaptiveParameters, maxIncrease: value});
                      }}
                    />
                    <span className="text-sm font-medium w-16 text-center">
                      {adaptiveParameters.maxIncrease}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="futilityThreshold" className="text-xs text-gray-600">Futility Stopping Threshold</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[adaptiveParameters.futilityBoundary]}
                      max={0.4}
                      step={0.05}
                      min={0.05}
                      className="flex-1"
                      onValueChange={([value]) => {
                        setAdaptiveParameters({...adaptiveParameters, futilityBoundary: value});
                      }}
                    />
                    <span className="text-sm font-medium w-16 text-center">
                      {(adaptiveParameters.futilityBoundary * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Stop for futility if conditional power falls below this threshold
                  </p>
                </div>
                
                <div className="pt-2">
                  <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                    <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-1">
                      <Sparkles className="h-4 w-4" /> Regulatory Considerations
                    </h4>
                    <ul className="space-y-1 text-xs text-orange-700">
                      <li className="flex items-center gap-1">
                        <ArrowRight className="h-3 w-3 flex-shrink-0" />
                        <span>Control Type I error inflation with appropriate statistical methods</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <ArrowRight className="h-3 w-3 flex-shrink-0" />
                        <span>Pre-specify adaptation rules and decision criteria in protocol</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <ArrowRight className="h-3 w-3 flex-shrink-0" />
                        <span>Maintain study integrity by restricting access to interim results</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full mt-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                >
                  <Workflow className="h-4 w-4 mr-2" />
                  Generate Adaptive Design
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4" />
          Apply Recommendations
        </Button>
      </div>
    </div>
  );
};

export default AdvancedSimulationTools;