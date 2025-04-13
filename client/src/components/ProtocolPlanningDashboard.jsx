// /client/src/components/ProtocolPlanningDashboard.jsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calculator, FileText, Activity } from "lucide-react";
import ProtocolUploadPanel from "@/components/protocol/ProtocolUploadPanel";
import SampleSizeCalculator from "@/components/SampleSizeCalculator";

export default function ProtocolPlanningDashboard() {
  const [activeTab, setActiveTab] = useState("protocol");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">📊 Protocol Insights Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="protocol">
            <FileText className="h-4 w-4 mr-2" />
            Upload + Analyze
          </TabsTrigger>
          <TabsTrigger value="sampleSize">
            <Calculator className="h-4 w-4 mr-2" />
            Sample Size Calculator
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
        
        <TabsContent value="benchmarking" className="mt-4">
          <div className="p-8 text-center border border-dashed rounded-lg">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">CSR Benchmarking</h3>
            <p className="text-muted-foreground">Compare your protocol against CSR data from similar studies</p>
            <p className="text-sm mt-2 text-muted-foreground">Coming in the next update</p>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">Coming Soon: Dropout Estimator</h3>
          <p className="text-blue-700 mb-4">Predict patient dropout rates based on indication, duration, and enrollment criteria using ML models trained on CSR data.</p>
          <div className="text-xs text-blue-500">Available in the next release</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-purple-800">Coming Soon: Endpoint Optimizer</h3>
          <p className="text-purple-700 mb-4">Discover optimal primary and secondary endpoints for your indication based on historical trial successes.</p>
          <div className="text-xs text-purple-500">Available in the next release</div>
        </div>
      </div>
    </div>
  );
}