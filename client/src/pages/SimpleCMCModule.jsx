import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FileText, PlusCircle, Beaker, Brain, Factory, Search, ClipboardCheck } from 'lucide-react';
import withAuthGuard from '../utils/withAuthGuard';

// Simple CMC Module with minimal styling for better readability
function SimpleCMCModule() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("blueprints");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    productType: "small-molecule"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateBlueprint = () => {
    toast({
      title: "Blueprint Created",
      description: `${formData.name} has been created successfully.`,
    });
    setShowCreateDialog(false);
    setFormData({ name: "", description: "", productType: "small-molecule" });
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">CMC Documentation Suite</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Export Documentation
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-background border w-full justify-start">
          <TabsTrigger value="blueprints">Blueprints</TabsTrigger>
          <TabsTrigger value="control-strategy">Control Strategy</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="validation">Method Validation</TabsTrigger>
          <TabsTrigger value="stability">Stability</TabsTrigger>
        </TabsList>

        <TabsContent value="blueprints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>CMC Blueprints</span>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      New Blueprint
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New CMC Blueprint</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Blueprint Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter blueprint name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Brief description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productType">Product Type</Label>
                        <select
                          id="productType"
                          name="productType"
                          value={formData.productType}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="small-molecule">Small Molecule</option>
                          <option value="biologic">Biologic</option>
                          <option value="combination">Combination Product</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                      <Button onClick={handleCreateBlueprint}>Create Blueprint</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border border-amber-100 bg-amber-50/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Small Molecule API (FDA)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600 mb-4">CTD Module 3.2.S template optimized for FDA submissions</p>
                    <Button variant="outline" size="sm" className="w-full">Open</Button>
                  </CardContent>
                </Card>

                <Card className="border border-amber-100 bg-amber-50/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Oral Solid Dosage (EMA)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600 mb-4">CTD Module 3.2.P template optimized for EMA submissions</p>
                    <Button variant="outline" size="sm" className="w-full">Open</Button>
                  </CardContent>
                </Card>

                <Card className="border border-dashed border-gray-300 bg-gray-50">
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    <PlusCircle className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Create New Blueprint</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No recent documents</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="control-strategy">
          <Card>
            <CardHeader>
              <CardTitle>Control Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Define and document your control strategy for critical quality attributes and process parameters.
              </p>
              <div className="text-center py-8 border rounded-lg bg-gray-50">
                <ClipboardCheck className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-gray-400">Select a product to begin control strategy development</p>
                <Button variant="outline" className="mt-4">Select Product</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications">
          <Card>
            <CardHeader>
              <CardTitle>Specifications Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Create and manage specifications for raw materials, intermediates, and final products.
              </p>
              <div className="text-center py-8 border rounded-lg bg-gray-50">
                <Beaker className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-gray-400">Select a product to view or edit specifications</p>
                <Button variant="outline" className="mt-4">Select Product</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle>Method Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Create documentation for analytical method validation according to ICH Q2(R1).
              </p>
              <div className="text-center py-8 border rounded-lg bg-gray-50">
                <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-gray-400">No validation protocols available</p>
                <Button variant="outline" className="mt-4">Create New Protocol</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stability">
          <Card>
            <CardHeader>
              <CardTitle>Stability Studies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Design, track, and analyze stability studies according to ICH Q1A-Q1E guidelines.
              </p>
              <div className="text-center py-8 border rounded-lg bg-gray-50">
                <Brain className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-gray-400">No stability studies available</p>
                <Button variant="outline" className="mt-4">Create Stability Protocol</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default withAuthGuard(SimpleCMCModule);