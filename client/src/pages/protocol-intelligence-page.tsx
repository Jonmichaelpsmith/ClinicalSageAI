import { useState } from "react";
import ProtocolIntelligencePanel from "@/components/ProtocolIntelligencePanel";

export default function ProtocolIntelligencePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Strategic Protocol Recommendations Advisor</h1>
        <p className="text-gray-500 mt-2">
          Analyze and optimize your clinical trial protocol parameters based on CSR data
        </p>
      </div>
      
      <ProtocolIntelligencePanel />
    </div>
  );
}