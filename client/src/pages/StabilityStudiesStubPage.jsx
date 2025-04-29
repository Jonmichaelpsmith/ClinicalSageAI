import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

// This is a simplified stub version that doesn't depend on API endpoints
const StabilityStudiesStubPage = () => {
  const [activeTab, setActiveTab] = useState("studies");
  
  // Sample data for stability studies
  const studies = [
    {
      id: 'study-1',
      code: 'STAB-PRD-X-01',
      name: 'Product X Tablets Long-Term Stability',
      product: {
        name: 'Product X Tablets',
        strength: '10 mg'
      },
      type: 'Long-Term',
      status: 'Active',
      startDate: '2025-02-01',
      duration: 24,
      progress: 25
    },
    {
      id: 'study-2',
      code: 'STAB-PRD-Y-01',
      name: 'Product Y Cream Stability',
      product: {
        name: 'Product Y Cream',
        strength: '2%'
      },
      type: 'Registration',
      status: 'Active',
      startDate: '2025-03-01',
      duration: 36,
      progress: 10
    },
    {
      id: 'study-3',
      code: 'STAB-PRD-Z-01',
      name: 'Product Z Injection Photostability',
      product: {
        name: 'Product Z Injection',
        strength: '50 mg/mL'
      },
      type: 'Photostability',
      status: 'Complete',
      startDate: '2024-12-15',
      duration: 2,
      progress: 100
    }
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stability Study Management</h1>
          <p className="text-muted-foreground">
            Design, track, and analyze stability studies for product shelf-life determination
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/stability/shelf-life-predictor">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
              </svg>
              Shelf-Life Predictor
            </Link>
          </Button>
          <Button asChild>
            <Link href="/stability/new-study">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Study
            </Link>
          </Button>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <Tabs defaultValue="studies" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="studies">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Studies
          </TabsTrigger>
          <TabsTrigger value="data-entry">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h18v18H3V3m4 12v2h2v-2H7m4 2v-2h-2v2h2z"></path>
              <path d="M15 13v2h2v-2h-2m-4 0v-2h-2v2h2z"></path>
            </svg>
            Data Entry
          </TabsTrigger>
          <TabsTrigger value="protocols">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Protocols
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="studies">
          <Card>
            <CardHeader>
              <CardTitle>Stability Studies</CardTitle>
              <CardDescription>
                Showing {studies.length} studies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Study Code</th>
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Start Date</th>
                      <th className="text-left py-3 px-4">Duration</th>
                      <th className="text-left py-3 px-4">Progress</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studies.map((study) => (
                      <tr key={study.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-mono">{study.code}</td>
                        <td className="py-3 px-4 font-medium">{study.product.name} {study.product.strength}</td>
                        <td className="py-3 px-4">{study.type}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            study.status === 'Active' ? 'bg-blue-100 text-blue-800' : 
                            study.status === 'Complete' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {study.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{study.startDate}</td>
                        <td className="py-3 px-4">{study.duration} months</td>
                        <td className="py-3 px-4">
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-primary h-full rounded-full"
                              style={{ width: `${study.progress}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <Button variant="ghost" asChild>
                            <Link href={`/stability/studies/${study.id}`}>View</Link>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link href={`/stability/studies/${study.id}/data`}>Data</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data-entry">
          <Card>
            <CardHeader>
              <CardTitle>Stability Data Entry</CardTitle>
              <CardDescription>
                Enter test results for scheduled stability timepoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3h18v18H3V3m4 12v2h2v-2H7m4 2v-2h-2v2h2z"></path>
                  <path d="M15 13v2h2v-2h-2m-4 0v-2h-2v2h2z"></path>
                </svg>
                <h3 className="text-xl font-semibold mb-2">Select a Study to Enter Data</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Choose a stability study from the Studies tab to enter or view test results
                </p>
                <Button variant="default" onClick={() => setActiveTab("studies")}>
                  View Studies
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="protocols">
          <Card>
            <CardHeader>
              <CardTitle>Stability Protocols</CardTitle>
              <CardDescription>
                Generate and manage stability study protocols
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h3 className="text-xl font-semibold mb-2">Generate a Stability Protocol</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Select a study to generate a protocol or view existing protocols
                </p>
                <Button variant="default" onClick={() => setActiveTab("studies")}>
                  View Studies
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StabilityStudiesStubPage;