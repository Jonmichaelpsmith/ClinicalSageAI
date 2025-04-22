import React, { useState } from 'react';
import { Link } from 'wouter';
import DocumentBrowser from '@/components/document-management/DocumentBrowser';
import DocumentViewer from '@/components/document-management/DocumentViewer';
import { useDocuShare } from '@/hooks/useDocuShare';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FileText, Home, ChevronRight, Shield, Info, Clock, Settings, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Document Management Page
 * 
 * This is the main document management page for the DocuShare integration,
 * providing 21 CFR Part 11 compliant document management for regulatory submissions.
 * 
 * The page includes:
 * - Document browser with filtering, searching, and management capabilities
 * - Document viewer with metadata, version history, and preview
 * - System status and compliance indicators
 */
export default function DocumentManagement() {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeTab, setActiveTab] = useState('all-documents');
  const { toast } = useToast();
  
  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center text-gray-800">
            <FileText className="mr-2 h-6 w-6 text-teal-600" />
            DocuShare Document Management
          </h1>
          <div className="text-sm text-muted-foreground flex items-center mt-1">
            <Link href="/" className="hover:underline flex items-center">
              <Home className="h-3 w-3 mr-1" />
              Home
            </Link>
            <ChevronRight className="h-3 w-3 mx-1" />
            <span>Document Management</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            21 CFR Part 11 Compliant
          </Badge>
          <Button variant="outline" size="sm" className="h-8">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* System Status Card */}
        <Card className="lg:col-span-12">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-teal-600 mr-2" />
                <CardTitle className="text-base">DocuShare System Status</CardTitle>
              </div>
              <Badge variant="outline" className="ml-2 font-mono text-xs">
                Server ID: TrialSAGE-DS7
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="py-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-md p-3 border border-green-100">
                <div className="text-xs text-green-800 font-medium mb-1 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  SYSTEM STATUS
                </div>
                <div className="text-sm font-medium text-green-900">Operational</div>
              </div>
              
              <div className="bg-blue-50 rounded-md p-3 border border-blue-100">
                <div className="text-xs text-blue-800 font-medium mb-1 flex items-center">
                  <Shield className="h-3 w-3 mr-1 text-blue-600" />
                  COMPLIANCE
                </div>
                <div className="text-sm font-medium text-blue-900">21 CFR Part 11</div>
              </div>
              
              <div className="bg-amber-50 rounded-md p-3 border border-amber-100">
                <div className="text-xs text-amber-800 font-medium mb-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-amber-600" />
                  LAST VALIDATED
                </div>
                <div className="text-sm font-medium text-amber-900">April 15, 2025</div>
              </div>
              
              <div className="bg-purple-50 rounded-md p-3 border border-purple-100">
                <div className="text-xs text-purple-800 font-medium mb-1 flex items-center">
                  <FileSpreadsheet className="h-3 w-3 mr-1 text-purple-600" />
                  DOCUMENT COUNT
                </div>
                <div className="text-sm font-medium text-purple-900">2,457 Documents</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="lg:col-span-7 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="all-documents">All Documents</TabsTrigger>
              <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
              <TabsTrigger value="clinical">Clinical</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all-documents" className="pt-4">
              <DocumentBrowser 
                onDocumentSelect={handleDocumentSelect}
                height={700}
              />
            </TabsContent>
            
            <TabsContent value="regulatory" className="pt-4">
              <DocumentBrowser 
                onDocumentSelect={handleDocumentSelect}
                moduleContext="regulatory"
                height={700}
              />
            </TabsContent>
            
            <TabsContent value="clinical" className="pt-4">
              <DocumentBrowser 
                onDocumentSelect={handleDocumentSelect}
                moduleContext="clinical"
                height={700}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-5">
          <DocumentViewer 
            document={selectedDocument}
            allowEdit={true}
          />
          
          {/* Compliance Information Card */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Info className="h-4 w-4 mr-2 text-teal-600" />
                21 CFR Part 11 Compliance Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3 text-sm">
              <p className="text-muted-foreground mb-2">
                This document management system is validated for 21 CFR Part 11 compliance, providing:
              </p>
              <ul className="space-y-1 text-xs">
                <li className="flex items-start">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Complete audit trails for all document access and modifications</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Electronic signatures with authentication and non-repudiation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Version control with complete history tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Secure document lifecycle management with role-based access</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Validated system with full documentation</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}