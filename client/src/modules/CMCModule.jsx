
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Beaker, Brain, Factory, Search, ClipboardCheck } from 'lucide-react';

const CMCModule = () => {
  const [activeTab, setActiveTab] = useState('blueprint');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chemistry, Manufacturing, and Controls (CMC)</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Export Module
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start mb-6 bg-background border">
          <TabsTrigger value="blueprint">Blueprint Generator</TabsTrigger>
          <TabsTrigger value="impact">Change Impact Simulator</TabsTrigger>
          <TabsTrigger value="manufacturing">Manufacturing Tuner</TabsTrigger>
          <TabsTrigger value="compliance">Global Compliance</TabsTrigger>
          <TabsTrigger value="copilot">CMC CoPilot</TabsTrigger>
        </TabsList>
        
        <TabsContent value="blueprint" className="space-y-6">
          <Card>
            <CardHeader className="bg-amber-50 border-b border-amber-100">
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <FileText className="h-5 w-5" />
                Blueprint Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <p className="text-gray-600">
                  The AI-CMC Blueprint Generator creates complete ICH-compliant CMC documentation for your regulatory submissions.
                  Select a product, provide basic information, and generate comprehensive documentation for Module 3.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-medium mb-2">Product Selection</h3>
                    <p className="text-sm text-gray-600 mb-4">Select a product to generate CMC documentation</p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Beaker className="mr-2 h-4 w-4" />
                        Create New Product
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-medium mb-2">Recent Blueprints</h3>
                    <p className="text-sm text-gray-600 mb-4">Your recently generated CMC documents</p>
                    <div className="text-center py-8 text-gray-400">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No recent blueprints</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="impact" className="space-y-6">
          <Card>
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Search className="h-5 w-5" />
                Change Impact Simulator
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-6">
                Before you change anything, know what could go wrong and how to fix it. The AI Change Impact Simulator 
                maps changes against prior global regulatory submissions to identify potential risks.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium mb-2">Simulate Changes</h3>
                  <p className="text-sm text-gray-600 mb-4">Select what you want to change</p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Factory className="mr-2 h-4 w-4" />
                      Manufacturing Process
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Beaker className="mr-2 h-4 w-4" />
                      Input Materials
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium mb-2">Past Simulations</h3>
                  <p className="text-sm text-gray-600 mb-4">Recently simulated changes</p>
                  <div className="text-center py-8 text-gray-400">
                    <Search className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No recent simulations</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manufacturing" className="space-y-6">
          <Card>
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Factory className="h-5 w-5" />
                Manufacturing Tuner
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-6">
                Optimize your manufacturing process with AI-assisted parameter tuning. The Manufacturing Tuner
                helps you improve yield, reduce waste, and maintain quality.
              </p>
              
              <div className="text-center py-12 border rounded-lg bg-gray-50">
                <Factory className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-gray-400">Select a product to begin process optimization</p>
                <Button variant="outline" className="mt-4">
                  Select Product
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader className="bg-purple-50 border-b border-purple-100">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <ClipboardCheck className="h-5 w-5" />
                Global Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-6">
                Ensure your CMC documentation meets global regulatory requirements. The Global Compliance
                tool checks your documents against FDA, EMA, PMDA, and other regulatory standards.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">FDA Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">US requirements for Module 3</p>
                    <Button variant="outline" className="w-full mt-4">Check Compliance</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">EMA Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">EU requirements for Module 3</p>
                    <Button variant="outline" className="w-full mt-4">Check Compliance</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">PMDA Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Japan requirements for Module 3</p>
                    <Button variant="outline" className="w-full mt-4">Check Compliance</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="copilot" className="space-y-6">
          <Card>
            <CardHeader className="bg-amber-50 border-b border-amber-100">
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Brain className="h-5 w-5" />
                CMC CoPilot
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-6">
                Your voice-enabled AI assistant for all CMC-related questions. Ask about regulatory requirements,
                documentation standards, or get help troubleshooting manufacturing issues.
              </p>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex flex-col h-80">
                  <div className="flex-1 p-4 bg-white rounded-lg mb-4 overflow-y-auto">
                    <div className="p-3 bg-amber-50 rounded-lg mb-3 max-w-3xl">
                      <p className="text-sm text-amber-800">
                        Hello! I'm your CMC CoPilot. I can help you with Chemistry, Manufacturing, and Controls documentation,
                        answer questions about regulatory requirements, or assist with troubleshooting manufacturing issues.
                        What would you like help with today?
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask anything about CMC documentation..."
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <Button>Send</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CMCModule;
