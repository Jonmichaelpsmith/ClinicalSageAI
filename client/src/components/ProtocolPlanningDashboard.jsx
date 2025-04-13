// /client/src/components/ProtocolPlanningDashboard.jsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calculator, FileText, Activity, TrendingDown } from "lucide-react";
import ProtocolUploadPanel from "@/components/protocol/ProtocolUploadPanel";
import SampleSizeCalculator from "@/components/SampleSizeCalculator";
import DropoutEstimator from "@/components/DropoutEstimator";

export default function ProtocolPlanningDashboard() {
  const [activeTab, setActiveTab] = useState("protocol");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">📊 Protocol Insights Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="protocol">
            <FileText className="h-4 w-4 mr-2" />
            Upload + Analyze
          </TabsTrigger>
          <TabsTrigger value="sampleSize">
            <Calculator className="h-4 w-4 mr-2" />
            Sample Size Calculator
          </TabsTrigger>
          <TabsTrigger value="dropoutEstimator">
            <TrendingDown className="h-4 w-4 mr-2" />
            Dropout Estimator
          </TabsTrigger>
          <TabsTrigger value="benchmarking" disabled>
            <BarChart3 className="h-4 w-4 mr-2" />
            CSR Benchmarking
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="protocol" className="mt-4">
          <ProtocolUploadPanel />
        </TabsContent>
        
        <TabsContent value="sampleSize" className="mt-4">
          <SampleSizeCalculator />
        </TabsContent>
        
        <TabsContent value="dropoutEstimator" className="mt-4">
          <DropoutEstimator />
        </TabsContent>
        
        <TabsContent value="benchmarking" className="mt-4">
          <div className="p-8 text-center border border-dashed rounded-lg">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">CSR Benchmarking</h3>
            <p className="text-muted-foreground">Compare your protocol against CSR data from similar studies</p>
            <p className="text-sm mt-2 text-muted-foreground">Coming in the next update</p>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 p-6 bg-purple-50 border border-purple-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-purple-800">Coming Soon: Endpoint Optimizer</h3>
        <p className="text-purple-700 mb-4">Discover optimal primary and secondary endpoints for your indication based on historical trial successes from our CSR database.</p>
        <div className="text-xs text-purple-500">Available in the next release</div>
      </div>
    </div>
  );
}