import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

// This is a simplified stub version that doesn't depend on API endpoints or recharts
const ShelfLifePredictorStubPage = () => {
  const [activeTab, setActiveTab] = useState("predict");
  const [showResults, setShowResults] = useState(false);
  
  const handlePredictSubmit = (e) => {
    e.preventDefault();
    setShowResults(true);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" className="mr-4" asChild>
          <Link href="/stability">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Stability Studies
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shelf-Life Predictor</h1>
          <p className="text-muted-foreground">
            Use Arrhenius kinetics to predict product shelf-life from accelerated stability data
          </p>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <Tabs defaultValue="predict" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="predict">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6" y2="6"></line>
              <line x1="6" y1="18" x2="6" y2="18"></line>
            </svg>
            Predict Shelf Life
          </TabsTrigger>
          <TabsTrigger value="estimate">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
            </svg>
            Estimate Parameters
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="predict">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Arrhenius Parameters</CardTitle>
                <CardDescription>
                  Enter degradation parameters to predict shelf life
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePredictSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="initialContent">Initial Content (%)</Label>
                      <Input
                        id="initialContent"
                        name="initialContent"
                        type="number"
                        step="0.1"
                        defaultValue="100"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="limit">Shelf Life Limit (%)</Label>
                      <Input
                        id="limit"
                        name="limit"
                        type="number"
                        step="0.1"
                        defaultValue="90"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="activationEnergy">Activation Energy (kJ/mol)</Label>
                    <Input
                      id="activationEnergy"
                      name="activationEnergy"
                      type="number"
                      step="0.1"
                      defaultValue="80"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Typical range: 50-120 kJ/mol for pharmaceuticals
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="frequencyFactor">Frequency Factor (1/time)</Label>
                    <Input
                      id="frequencyFactor"
                      name="frequencyFactor"
                      type="number"
                      step="1e7"
                      defaultValue="1000000000"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Typically expressed in scientific notation (e.g., 1e9)
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="referenceTemperature">Reference Temperature (°C)</Label>
                      <Input
                        id="referenceTemperature"
                        name="referenceTemperature"
                        type="number"
                        defaultValue="25"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reactionOrder">Reaction Order</Label>
                      <Input
                        id="reactionOrder"
                        name="reactionOrder"
                        type="number"
                        min="0"
                        max="2"
                        step="1"
                        defaultValue="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="temperatures">Temperatures to Calculate (°C)</Label>
                    <Input
                      id="temperatures"
                      name="temperatures"
                      defaultValue="5, 25, 30, 40"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Comma-separated list of temperatures (e.g., 5, 25, 30, 40)
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                  >
                    Predict Shelf Life
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  Need to estimate parameters from data?
                </p>
                <Button variant="outline" onClick={() => setActiveTab("estimate")}>
                  Estimate from Data
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Prediction Results</CardTitle>
                <CardDescription>
                  {showResults ? 
                    `Proposed shelf life: 24 months at 25°C` : 
                    "Run a prediction to see results"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showResults ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Degradation Curves</h3>
                      <div className="bg-muted/30 p-4 rounded-md border h-[250px] flex items-center justify-center text-muted-foreground">
                        <p className="text-center">Degradation curve visualization available in full implementation</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Shelf Life Summary</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {[5, 25, 30, 40].map(temp => (
                          <Card key={temp}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
                                  </svg>
                                  <span className="font-medium">{temp}°C</span>
                                </div>
                                <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                  </svg>
                                  <span className="font-medium">
                                    {temp === 5 ? "60" : 
                                     temp === 25 ? "24" : 
                                     temp === 30 ? "18" : "6"} months
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                      <line x1="6" y1="6" x2="6" y2="6"></line>
                      <line x1="6" y1="18" x2="6" y2="18"></line>
                    </svg>
                    <h3 className="text-xl font-semibold mb-2">No Prediction Results</h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                      Fill in the Arrhenius parameters and run a prediction to see shelf life estimates
                    </p>
                    <Button 
                      variant="default" 
                      onClick={() => document.getElementById('initialContent').focus()}
                    >
                      Enter Parameters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="estimate">
          <Card>
            <CardHeader>
              <CardTitle>Estimate Arrhenius Parameters</CardTitle>
              <CardDescription>
                Enter stability data points to estimate activation energy and frequency factor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 items-end">
                      <div className="space-y-2">
                        <Label>Temperature (°C)</Label>
                        <Input 
                          type="number" 
                          defaultValue={index === 0 ? 25 : index === 1 ? 30 : 40}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Initial Content (%)</Label>
                        <Input 
                          type="number"
                          step="0.01"
                          defaultValue="100"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Final Content (%)</Label>
                        <Input 
                          type="number"
                          step="0.01"
                          defaultValue={index === 0 ? 98 : index === 1 ? 96 : 92}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time (months)</Label>
                        <Input 
                          type="number"
                          step="0.1"
                          defaultValue="6"
                          required
                        />
                      </div>
                      <Button 
                        type="button"
                        variant="outline"
                        size="icon"
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline">
                    Add Data Point
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => {
                      setActiveTab("predict");
                    }}
                  >
                    Estimate Parameters
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShelfLifePredictorStubPage;