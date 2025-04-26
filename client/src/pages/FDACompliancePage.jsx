import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FDAComplianceDashboard from '@/components/compliance/FDAComplianceDashboard';
import FDAComplianceDocumentation from '@/components/compliance/FDAComplianceDocumentation';
import BlockchainSecurityPanel from '@/components/security/BlockchainSecurityPanel';
import { 
  Shield, 
  FileText, 
  Zap, 
  ArrowLeft,
  BarChart,
  Lock, 
  BookOpen,
  ArrowRight
} from 'lucide-react';

/**
 * FDA Compliance Page
 * 
 * This page provides access to all FDA 21 CFR Part 11 compliance features:
 * - Compliance dashboard
 * - Document management and verification
 * - Electronic signatures
 * - Blockchain verification
 * - Audit trails
 * - System validation
 */
export default function FDACompliancePage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-hotpink-100 p-2 rounded-lg mr-4">
            <Shield className="h-8 w-8 text-hotpink-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">FDA 21 CFR Part 11 Compliance</h1>
            <p className="text-sm text-gray-500">
              Comprehensive compliance solutions exceeding FDA requirements
            </p>
          </div>
        </div>
        
        <button className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Secure & Compliant</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              TrialSage exceeds FDA 21 CFR Part 11 requirements with blockchain verification, advanced electronic signatures, and tamper-evident audit trails.
            </p>
            <div className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
              Learn More
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <BarChart className="h-6 w-6 text-green-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Audit Ready</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Our continuous validation process ensures your system maintains FDA compliance at all times, with complete audit trails and validation documentation.
            </p>
            <div className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-800">
              View Reports
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>
          
          <div className="bg-hotpink-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <BookOpen className="h-6 w-6 text-hotpink-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Always Validated</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Comprehensive system validation with risk-based approach, automated test suites, and blockchain-verified validation records meets FDA requirements.
            </p>
            <div className="inline-flex items-center text-sm font-medium text-hotpink-600 hover:text-hotpink-800">
              Validation Status
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
      
      <Tabs 
        defaultValue="dashboard" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Compliance Dashboard
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Compliance Documentation
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="flex items-center">
            <Zap className="mr-2 h-4 w-4" />
            Blockchain Verification
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <FDAComplianceDashboard />
        </TabsContent>
        
        <TabsContent value="documents">
          <FDAComplianceDocumentation />
        </TabsContent>
        
        <TabsContent value="blockchain">
          <BlockchainSecurityPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}