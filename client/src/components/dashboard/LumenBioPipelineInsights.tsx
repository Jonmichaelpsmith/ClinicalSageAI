
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#4CAF50', '#FF5722'];

interface LumenBioInsightsProps {
  className?: string;
}

export default function LumenBioPipelineInsights({ className }: LumenBioInsightsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch Lumen Bio pipeline-specific trials
  const { data: lumenBioData, isLoading, error } = useQuery({
    queryKey: ['lumenBioInsights'],
    queryFn: async () => {
      const res = await axios.get('/api/reports?region=Lumen%20Bio%20Pipeline');
      return res.data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Organize data by therapeutic area
  const getTherapeuticAreaData = () => {
    if (!lumenBioData?.reports) return [];
    
    const therapeuticAreas = {
      "Parkinson's Disease": 0,
      "ARDS": 0,
      "Solid Tumors": 0,
      "Brain Tumors": 0,
      "Other": 0
    };
    
    lumenBioData.reports.forEach(report => {
      const indication = report.indication.toLowerCase();
      
      if (indication.includes('parkinson')) {
        therapeuticAreas["Parkinson's Disease"]++;
      } else if (indication.includes('respiratory') || indication.includes('ards')) {
        therapeuticAreas["ARDS"]++;
      } else if (indication.includes('solid') && indication.includes('tumor')) {
        therapeuticAreas["Solid Tumors"]++;
      } else if ((indication.includes('brain') && indication.includes('tumor')) 
                || indication.includes('glioblastoma') 
                || indication.includes('glioma')) {
        therapeuticAreas["Brain Tumors"]++;
      } else {
        therapeuticAreas["Other"]++;
      }
    });
    
    return Object.entries(therapeuticAreas).map(([name, value]) => ({ name, value }));
  };
  
  // Organize data by study phase
  const getPhaseData = () => {
    if (!lumenBioData?.reports) return [];
    
    const phases = {
      "Phase 1": 0,
      "Phase 1/2": 0,
      "Phase 2": 0,
      "Phase 2/3": 0,
      "Phase 3": 0,
      "Phase 4": 0,
      "Other": 0
    };
    
    lumenBioData.reports.forEach(report => {
      const phase = report.phase;
      
      if (phases[phase] !== undefined) {
        phases[phase]++;
      } else {
        phases["Other"]++;
      }
    });
    
    return Object.entries(phases).map(([name, value]) => ({ name, value }));
  };
  
  const areaData = getTherapeuticAreaData();
  const phaseData = getPhaseData();
  
  // Calculate trial counts by therapeutic area
  const getTotalsByArea = () => {
    const totals = {
      "Neurological": 0,
      "Cancer": 0,
      "Other": 0
    };
    
    areaData.forEach(item => {
      if (item.name === "Parkinson's Disease" || item.name === "ARDS") {
        totals["Neurological"] += item.value;
      } else if (item.name === "Solid Tumors" || item.name === "Brain Tumors") {
        totals["Cancer"] += item.value;
      } else {
        totals["Other"] += item.value;
      }
    });
    
    return totals;
  };
  
  const areaTotals = getTotalsByArea();
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Lumen Bio Pipeline Insights</CardTitle>
          <Badge variant="outline" className="bg-blue-50">Client Profile</Badge>
        </div>
        <CardDescription>
          Analysis of clinical trials relevant to Lumen Bio's therapeutic areas
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="parkinson">Parkinson's</TabsTrigger>
          <TabsTrigger value="ards">ARDS</TabsTrigger>
          <TabsTrigger value="cancer">Cancer</TabsTrigger>
        </TabsList>
        
        <CardContent className="pt-4 pb-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loader">Loading insights...</div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">Error loading Lumen Bio insights</div>
          ) : (
            <>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3 md:col-span-1">
                    <div className="text-center mb-2">Trials by Pipeline Focus</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={areaData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {areaData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="col-span-3 md:col-span-2">
                    <div className="text-center mb-2">Trials by Phase</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={phaseData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Neurological Pipeline ({areaTotals.Neurological} trials)</h4>
                    <Progress value={(areaTotals.Neurological / lumenBioData.reports.length) * 100} className="h-2 mb-2" />
                    <div className="text-xs text-muted-foreground">
                      Focus on Parkinson's disease and ARDS treatments
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Cancer Pipeline ({areaTotals.Cancer} trials)</h4>
                    <Progress value={(areaTotals.Cancer / lumenBioData.reports.length) * 100} className="h-2 mb-2" />
                    <div className="text-xs text-muted-foreground">
                      Focus on solid tumors and brain tumors
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="parkinson">
                <div className="space-y-4">
                  <h3 className="font-medium">Parkinson's Disease Trials</h3>
                  <p className="text-sm text-muted-foreground">
                    Lumen Bio is developing novel treatments for Parkinson's disease, focusing on 
                    neuroprotection and symptom management.
                  </p>
                  
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Trial</th>
                          <th className="text-left pb-2">Phase</th>
                          <th className="text-left pb-2">Sponsor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lumenBioData.reports
                          .filter(report => report.indication.toLowerCase().includes('parkinson'))
                          .slice(0, 10)
                          .map(report => (
                            <tr key={report.id} className="border-b hover:bg-gray-50">
                              <td className="py-2">{report.title}</td>
                              <td className="py-2">{report.phase}</td>
                              <td className="py-2">{report.sponsor}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="ards">
                <div className="space-y-4">
                  <h3 className="font-medium">ARDS Trials</h3>
                  <p className="text-sm text-muted-foreground">
                    Lumen Bio's ARDS program focuses on reducing inflammation and improving 
                    oxygenation in this serious respiratory condition.
                  </p>
                  
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Trial</th>
                          <th className="text-left pb-2">Phase</th>
                          <th className="text-left pb-2">Sponsor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lumenBioData.reports
                          .filter(report => {
                            const indication = report.indication.toLowerCase();
                            return indication.includes('respiratory') || indication.includes('ards');
                          })
                          .slice(0, 10)
                          .map(report => (
                            <tr key={report.id} className="border-b hover:bg-gray-50">
                              <td className="py-2">{report.title}</td>
                              <td className="py-2">{report.phase}</td>
                              <td className="py-2">{report.sponsor}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="cancer">
                <div className="space-y-4">
                  <h3 className="font-medium">Cancer Trials</h3>
                  <p className="text-sm text-muted-foreground">
                    Lumen Bio's oncology pipeline includes targeted therapies for solid tumors 
                    and novel approaches for challenging brain tumors.
                  </p>
                  
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Trial</th>
                          <th className="text-left pb-2">Phase</th>
                          <th className="text-left pb-2">Sponsor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lumenBioData.reports
                          .filter(report => {
                            const indication = report.indication.toLowerCase();
                            return (indication.includes('tumor') || 
                                   indication.includes('cancer') || 
                                   indication.includes('glioma') ||
                                   indication.includes('glioblastoma'));
                          })
                          .slice(0, 10)
                          .map(report => (
                            <tr key={report.id} className="border-b hover:bg-gray-50">
                              <td className="py-2">{report.title}</td>
                              <td className="py-2">{report.phase}</td>
                              <td className="py-2">{report.sponsor}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </CardContent>
      </Tabs>
      
      <CardFooter className="pt-2">
        <div className="text-xs text-muted-foreground">
          Data sourced from ClinicalTrials.gov and company reports
        </div>
      </CardFooter>
    </Card>
  );
}
